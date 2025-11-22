/**
 * ScreeningModel - Structured Input/Output Model Wrapper
 * 
 * Provides typed interfaces for:
 * - Depth features (LiDAR/camera)
 * - Eye geometry features (landmarks, pupil, corneal)
 * - Visual test features (acuity, contrast, etc.)
 * - Device metadata (screen, calibration)
 */

import * as tf from "@tensorflow/tfjs";
import { validateRefractiveOutput } from './validation';
import { getScreeningLogger } from './logger';

export type ScreeningInput = {
  // Flattened depth map or distance features (normalized)
  depthFeatures: number[]; // e.g. 1D feature vector

  // Geometric features derived from eye landmarks (angles, ratios, etc.)
  eyeGeometryFeatures: number[];

  // Visual performance scores from your acuity/contrast tests
  visualTestFeatures: number[];

  // Device metadata (ppi, screen size category, calibration quality, etc.)
  deviceMetaFeatures: number[];
};

export type ScreeningOutput = {
  sphere: number;         // diopters (screening-level)
  cylinder: number;       // diopters
  axis: number;           // degrees 0-180
  confidence: number;     // 0-1
  qualityFlags: string[]; // e.g. ["LOW_CONTRAST", "UNSTABLE_DISTANCE"]
  rawOutput?: number[];   // for debugging / research
  metadata?: {
    modelVersion: string;
    backend: string;
    runtime: number;
  };
};

export class ScreeningModel {
  private model: tf.GraphModel | null = null;
  private loadingPromise: Promise<void> | null = null;
  private modelVersion: string;
  private backend: string;

  constructor(
    private readonly modelUrl: string,
    modelVersion: string = "1.0.0",
    backend: string = "webgl"
  ) {
    this.modelVersion = modelVersion;
    this.backend = backend;
  }

  /**
   * Load the TFJS model (idempotent). Call this once during app startup
   * or lazily before first inference.
   */
  async load(): Promise<void> {
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      // Ensure backend is initialized
      await tf.setBackend(this.backend);
      await tf.ready();

      this.model = await tf.loadGraphModel(this.modelUrl);

      // Optional: warm-up run with dummy input to reduce first-call latency
      const expectedLength = this.expectedInputLength();
      const dummyInput = tf.zeros([1, expectedLength]);
      await (this.model as tf.GraphModel).executeAsync(dummyInput);
      dummyInput.dispose();
    })();

    return this.loadingPromise;
  }

  /**
   * Get expected input length for validation
   */
  private expectedInputLength(): number {
    // Default: sum of all feature categories
    // This should match your model's expected input
    // You can override this based on your model architecture
    return 16; // Default, adjust based on your model
  }

  /**
   * Run inference. Throws if called before load() has succeeded.
   */
  async predict(input: ScreeningInput): Promise<ScreeningOutput> {
    const startTime = performance.now();

    if (!this.loadingPromise) {
      await this.load();
    } else {
      await this.loadingPromise;
    }

    if (!this.model) {
      throw new Error("Screening model not loaded");
    }

    // Validate input structure
    this.validateInput(input);

    const inputTensor = this.buildInputTensor(input);
    let outputTensor: tf.Tensor | tf.Tensor[] | null = null;

    try {
      // Execute model prediction
      outputTensor = (this.model as tf.GraphModel).execute(
        { input: inputTensor },
        "output"
      ) as tf.Tensor;

      const outputArray = (await (outputTensor as tf.Tensor).array()) as number[][];
      const rawOutput = outputArray[0];

      // Parse and validate output
      const screeningOutput = this.parseOutput(rawOutput, input);
      
      // Validate output with our validation system
      const validation = validateRefractiveOutput(
        screeningOutput.sphere,
        screeningOutput.cylinder,
        screeningOutput.axis,
        screeningOutput.confidence
      );

      if (!validation.valid) {
        screeningOutput.qualityFlags.push(...validation.errors.map(e => `VALIDATION_ERROR: ${e}`));
      }
      if (validation.warnings.length > 0) {
        screeningOutput.qualityFlags.push(...validation.warnings.map(w => `WARNING: ${w}`));
      }

      const runtime = performance.now() - startTime;

      // Add metadata
      screeningOutput.metadata = {
        modelVersion: this.modelVersion,
        backend: this.backend,
        runtime: Math.round(runtime * 100) / 100,
      };

      // Log prediction
      const logger = getScreeningLogger();
      const allFeatures = [
        ...input.depthFeatures,
        ...input.eyeGeometryFeatures,
        ...input.visualTestFeatures,
        ...input.deviceMetaFeatures,
      ];

      logger.logPrediction({
        modelId: "refractive",
        modelVersion: this.modelVersion,
        backend: this.backend,
        inputFeatures: {
          length: allFeatures.length,
          min: Math.min(...allFeatures),
          max: Math.max(...allFeatures),
          mean: allFeatures.reduce((a, b) => a + b, 0) / allFeatures.length,
          hasNaN: allFeatures.some(v => isNaN(v)),
          hasInfinity: allFeatures.some(v => !isFinite(v)),
        },
        output: {
          sphere: screeningOutput.sphere,
          cylinder: screeningOutput.cylinder,
          axis: screeningOutput.axis,
          confidence: screeningOutput.confidence,
        },
        runtime,
        validation: {
          inputValid: true,
          outputValid: validation.valid,
          warnings: validation.warnings,
        },
      });

      return screeningOutput;
    } finally {
      inputTensor.dispose();
      if (outputTensor) {
        if (Array.isArray(outputTensor)) {
          outputTensor.forEach(t => t.dispose());
        } else {
          outputTensor.dispose();
        }
      }
    }
  }

  /**
   * Validate input structure
   */
  private validateInput(input: ScreeningInput): void {
    const errors: string[] = [];

    if (!input.depthFeatures || input.depthFeatures.length === 0) {
      errors.push("depthFeatures is required and cannot be empty");
    }

    if (!input.eyeGeometryFeatures || input.eyeGeometryFeatures.length === 0) {
      errors.push("eyeGeometryFeatures is required and cannot be empty");
    }

    if (!input.visualTestFeatures || input.visualTestFeatures.length === 0) {
      errors.push("visualTestFeatures is required and cannot be empty");
    }

    if (!input.deviceMetaFeatures || input.deviceMetaFeatures.length === 0) {
      errors.push("deviceMetaFeatures is required and cannot be empty");
    }

    // Check for NaN/Infinity
    const allFeatures = [
      ...input.depthFeatures,
      ...input.eyeGeometryFeatures,
      ...input.visualTestFeatures,
      ...input.deviceMetaFeatures,
    ];

    if (allFeatures.some(v => isNaN(v))) {
      errors.push("Input contains NaN values");
    }

    if (allFeatures.some(v => !isFinite(v))) {
      errors.push("Input contains Infinity values");
    }

    if (errors.length > 0) {
      throw new Error(`Input validation failed: ${errors.join('; ')}`);
    }
  }

  /**
   * Construct the model input tensor from your feature vectors.
   * This is where you enforce consistent ordering, scaling, etc.
   */
  private buildInputTensor(input: ScreeningInput): tf.Tensor {
    const {
      depthFeatures,
      eyeGeometryFeatures,
      visualTestFeatures,
      deviceMetaFeatures,
    } = input;

    const featureVector: number[] = [
      ...depthFeatures,
      ...eyeGeometryFeatures,
      ...visualTestFeatures,
      ...deviceMetaFeatures,
    ];

    // Shape: [1, featureLength] for a single sample
    return tf.tensor2d([featureVector], [1, featureVector.length]);
  }

  /**
   * Parse raw model output (e.g. [sphere, cylinder, axis, confidence, ...])
   * into a typed object with safety checks and clamping.
   */
  private parseOutput(raw: number[], input: ScreeningInput): ScreeningOutput {
    // Example convention, adjust to your model:
    const sphere = raw[0] ?? 0;
    const cylinder = raw[1] ?? 0;
    const axis = raw[2] ?? 0;
    const confidence = raw[3] ?? 0.5;

    // Clamp values to valid ranges
    const clampedSphere = Math.max(-12, Math.min(12, sphere));
    const clampedCylinder = Math.max(-6, Math.min(6, cylinder));
    const clampedAxis = Math.max(0, Math.min(180, axis));
    const clampedConfidence = Math.max(0, Math.min(1, confidence));

    const qualityFlags: string[] = [];

    // Quality checks
    if (clampedConfidence < 0.5) {
      qualityFlags.push("LOW_CONFIDENCE");
    }

    if (Math.abs(clampedSphere) > 10) {
      qualityFlags.push("OUT_OF_TYPICAL_RANGE_SPHERE");
    }

    if (Math.abs(clampedCylinder) > 4) {
      qualityFlags.push("OUT_OF_TYPICAL_RANGE_CYLINDER");
    }

    if (clampedAxis < 0 || clampedAxis > 180) {
      qualityFlags.push("INVALID_AXIS");
    }

    // Check input quality
    const allFeatures = [
      ...input.depthFeatures,
      ...input.eyeGeometryFeatures,
      ...input.visualTestFeatures,
      ...input.deviceMetaFeatures,
    ];

    const featureVariance = this.calculateVariance(allFeatures);
    if (featureVariance < 0.01) {
      qualityFlags.push("LOW_FEATURE_VARIANCE");
    }

    // Check depth features quality
    if (input.depthFeatures.length > 0) {
      const depthMean = input.depthFeatures.reduce((a, b) => a + b, 0) / input.depthFeatures.length;
      if (depthMean < 0.1 || depthMean > 5.0) {
        qualityFlags.push("UNSTABLE_DISTANCE");
      }
    }

    // Check visual test quality
    if (input.visualTestFeatures.length > 0) {
      const testScore = input.visualTestFeatures[0] || 0;
      if (testScore < 0.3) {
        qualityFlags.push("LOW_CONTRAST");
      }
    }

    return {
      sphere: Math.round(clampedSphere * 100) / 100,
      cylinder: Math.round(clampedCylinder * 100) / 100,
      axis: Math.round(clampedAxis),
      confidence: Math.round(clampedConfidence * 100) / 100,
      qualityFlags,
      rawOutput: raw,
    };
  }

  /**
   * Calculate variance of feature vector
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return variance;
  }

  /**
   * Clean up when you no longer need the model.
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.loadingPromise = null;
  }

  /**
   * Get model status
   */
  getStatus(): {
    loaded: boolean;
    modelUrl: string;
    modelVersion: string;
    backend: string;
  } {
    return {
      loaded: this.model !== null,
      modelUrl: this.modelUrl,
      modelVersion: this.modelVersion,
      backend: this.backend,
    };
  }
}

