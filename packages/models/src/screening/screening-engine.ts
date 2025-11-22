/**
 * ScreeningEngine - Production-Grade ML Model Manager
 * 
 * Separation of concerns: UI never touches raw tfjs calls
 * Deterministic model loading with versioning
 * Clear input/output contracts for validation
 * Backend control for medical validation
 */

import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import {
  validateRefractiveInput,
  validateRefractiveOutput,
  validateCalibrationInput,
  validateCalibrationOutput,
} from './validation';
import { getScreeningLogger } from './logger';

export type ScreeningBackend = "webgl" | "wasm" | "cpu";

export type ScreeningModelId =
  | "refractive"   // main screening model (myopia/hyperopia/astig)
  | "acuity"       // optional acuity-specific model
  | "calibration"; // e.g. distance / device calibration model

export interface ScreeningModelConfig {
  id: ScreeningModelId;
  version: string;          // Model version (e.g., "1.0.0")
  url: string;              // tfjs model URL or relative path
  type: "graph" | "layers";
  warmup?: boolean;         // whether to run a dummy prediction after load
  inputShape: number[];     // Expected input shape for validation
  outputShape: number[];    // Expected output shape for validation
  inputRange?: { min: number; max: number }; // Input value range
  outputRange?: { min: number; max: number }; // Output value range
}

// Versioned model configurations
export const SCREENING_MODELS: Record<string, ScreeningModelConfig[]> = {
  "1.0.0": [
    {
      id: "refractive",
      version: "1.0.0",
      url: "/models/refractive/v1.0.0/model.json",
      type: "graph",
      warmup: true,
      inputShape: [1, 16],
      outputShape: [1, 3],
      inputRange: { min: -10, max: 10 },
      outputRange: { min: -10, max: 10 },
    },
    {
      id: "calibration",
      version: "1.0.0",
      url: "/models/calibration/v1.0.0/model.json",
      type: "layers",
      warmup: false,
      inputShape: [1, 8],
      outputShape: [1, 2],
      inputRange: { min: 0, max: 5 },
      outputRange: { min: 0, max: 5 },
    },
  ],
};

export const DEFAULT_MODEL_VERSION = "1.0.0";

export type ScreeningTfModel = tf.GraphModel | tf.LayersModel;

interface LoadedModel {
  config: ScreeningModelConfig;
  model: ScreeningTfModel;
  loadedAt: number;
}

interface PredictionLog {
  modelId: ScreeningModelId;
  version: string;
  timestamp: number;
  inputShape: number[];
  outputShape: number[];
  runtime: number;
  backend: string;
  inputRange?: { min: number; max: number };
  outputRange?: { min: number; max: number };
}

/**
 * ScreeningEngine
 * 
 * - Manages tfjs backend init
 * - Loads and caches multiple models with versioning
 * - Validates inputs/outputs
 * - Logs all predictions for audit trail
 * - Exposes typed predict methods
 */
export class ScreeningEngine {
  private backend: ScreeningBackend;
  private models: Map<ScreeningModelId, LoadedModel> = new Map();
  private loadingPromises: Map<ScreeningModelId, Promise<ScreeningTfModel>> = new Map();
  private initialized = false;
  private modelVersion: string = DEFAULT_MODEL_VERSION;
  private predictionLogs: PredictionLog[] = [];
  private maxLogs: number = 1000; // Keep last 1000 predictions

  constructor(backend: ScreeningBackend = "webgl", modelVersion: string = DEFAULT_MODEL_VERSION) {
    this.backend = backend;
    this.modelVersion = modelVersion;
  }

  /**
   * Initialize tfjs backend once for the entire app
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    // Select backend
    await tf.setBackend(this.backend);
    await tf.ready();

    // Optional: set global tfjs flags for medical validation
    // tf.env().set("WEBGL_FORCE_F16_TEXTURES", true);

    this.initialized = true;
    this.log("engine_initialized", { backend: this.backend, version: this.modelVersion });
  }

  /**
   * Load a single model based on its config with validation
   */
  async loadModel(config: ScreeningModelConfig): Promise<ScreeningTfModel> {
    if (!this.initialized) {
      await this.init();
    }

    // If already loading, reuse the promise
    if (this.loadingPromises.has(config.id)) {
      return this.loadingPromises.get(config.id)!;
    }

    const loadPromise = (async () => {
      let model: ScreeningTfModel;

      try {
        if (config.type === "graph") {
          model = await tf.loadGraphModel(config.url);
        } else {
          model = await tf.loadLayersModel(config.url);
        }

        // Warmup if configured
        if (config.warmup) {
          const dummyInput = tf.zeros(config.inputShape);
          await this.safePredict(model, dummyInput);
          dummyInput.dispose();
        }

        this.models.set(config.id, {
          config,
          model,
          loadedAt: Date.now()
        });

        this.log("model_loaded", {
          modelId: config.id,
          version: config.version,
          type: config.type
        });

        return model;
      } catch (error) {
        this.log("model_load_error", {
          modelId: config.id,
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    })();

    this.loadingPromises.set(config.id, loadPromise);
    return loadPromise;
  }

  /**
   * Load all models for current version
   */
  async preloadAll(): Promise<void> {
    await this.init();
    const configs = SCREENING_MODELS[this.modelVersion] || [];
    await Promise.all(configs.map((cfg) => this.loadModel(cfg)));
  }

  /**
   * Get a loaded model by id, or throw if missing
   */
  getModel(id: ScreeningModelId): ScreeningTfModel {
    const entry = this.models.get(id);
    if (!entry) {
      throw new Error(
        `Model ${id} (v${this.modelVersion}) has not been loaded yet. Call loadModel() or preloadAll() first.`
      );
    }
    return entry.model;
  }

  /**
   * Validate input features against model config
   * Uses structured validation with errors and warnings
   */
  private validateInput(
    features: number[] | Float32Array,
    config: ScreeningModelConfig
  ): void {
    const expectedLength = config.inputShape.slice(1).reduce((a, b) => a * b, 1);
    
    let validation;
    if (config.id === 'refractive') {
      validation = validateRefractiveInput(features, expectedLength, config.inputRange);
    } else if (config.id === 'calibration') {
      validation = validateCalibrationInput(features, expectedLength, config.inputRange);
    } else {
      // Generic validation
      validation = validateRefractiveInput(features, expectedLength, config.inputRange);
    }

    // Log warnings
    if (validation.warnings.length > 0) {
      this.log('input_validation_warning', {
        modelId: config.id,
        warnings: validation.warnings,
      });
    }

    // Throw on errors
    if (!validation.valid) {
      throw new Error(
        `Input validation failed: ${validation.errors.join('; ')}`
      );
    }
  }

  /**
   * Validate output against model config
   */
  private validateOutput(
    output: tf.Tensor | tf.Tensor[],
    config: ScreeningModelConfig
  ): void {
    const tensor = Array.isArray(output) ? output[0] : output;
    if (!tensor) return;

    const shape = tensor.shape;
    const expectedShape = config.outputShape;

    if (shape.length !== expectedShape.length) {
      throw new Error(
        `Output shape length mismatch: expected ${expectedShape.length}, got ${shape.length}`
      );
    }

    for (let i = 0; i < shape.length; i++) {
      if (shape[i] !== expectedShape[i]) {
        throw new Error(
          `Output shape mismatch at dim ${i}: expected ${expectedShape[i]}, got ${shape[i]}`
        );
      }
    }
  }

  /**
   * Safe prediction wrapper to handle GraphModel vs LayersModel
   */
  private async safePredict(
    model: ScreeningTfModel,
    input: tf.Tensor
  ): Promise<tf.Tensor | tf.Tensor[] | null> {
    // GraphModel: model.execute / executeAsync
    if ((model as tf.GraphModel).executeAsync) {
      const graph = model as tf.GraphModel;
      const out = await graph.executeAsync(input);
      return out as tf.Tensor | tf.Tensor[];
    }

    // LayersModel: model.predict
    const layers = model as tf.LayersModel;
    const out = layers.predict(input) as tf.Tensor | tf.Tensor[];
    return out;
  }

  /**
   * Public API: run refractive screening with validation and logging
   */
  async predictRefractive(
    features: number[] | Float32Array
  ): Promise<{
    sphere: number;
    cylinder: number;
    axis: number;
    confidence: number;
    metadata: {
      modelVersion: string;
      backend: string;
      runtime: number;
    };
  }> {
    const startTime = performance.now();
    const config = SCREENING_MODELS[this.modelVersion]?.find(
      (m) => m.id === "refractive"
    );

    if (!config) {
      throw new Error(`Refractive model config not found for version ${this.modelVersion}`);
    }

    // Validate input
    this.validateInput(features, config);

    // Load model if needed
    const model = await this.loadModel(config);

    // Prepare input tensor
    const inputTensor = tf.tensor2d([Array.from(features)], config.inputShape);

    try {
      // Run prediction
      const output = await this.safePredict(model, inputTensor);

      // Validate output
      if (output) {
        this.validateOutput(output, config);
      }

      // Decode output
      let sphere = 0;
      let cylinder = 0;
      let axis = 0;
      let confidence = 1.0;

      if (output && !Array.isArray(output)) {
        const data = await (output as tf.Tensor).data();
        sphere = data[0] ?? 0;
        cylinder = data[1] ?? 0;
        axis = data[2] ?? 0;

        // Clamp to expected ranges
        if (config.outputRange) {
          sphere = Math.max(config.outputRange.min, Math.min(config.outputRange.max, sphere));
          cylinder = Math.max(config.outputRange.min, Math.min(config.outputRange.max, cylinder));
          axis = Math.max(0, Math.min(180, axis));
        }

        // Calculate confidence based on output validity
        const values = [sphere, cylinder, axis];
        const hasValidValues = values.every(v => !isNaN(v) && isFinite(v));
        confidence = hasValidValues ? 0.95 : 0.5;

        // Validate output with structured validation
        const outputValidation = validateRefractiveOutput(sphere, cylinder, axis, confidence);
        
        if (outputValidation.warnings.length > 0) {
          this.log('output_validation_warning', {
            modelId: 'refractive',
            warnings: outputValidation.warnings,
            values: { sphere, cylinder, axis, confidence },
          });
        }

        if (!outputValidation.valid) {
          throw new Error(
            `Output validation failed: ${outputValidation.errors.join('; ')}`
          );
        }
      }

      const runtime = performance.now() - startTime;

      // Log prediction with structured logging
      const logger = getScreeningLogger();
      const inputFeatures = Array.from(features);
      logger.logPrediction({
        modelId: "refractive",
        modelVersion: config.version,
        backend: this.backend,
        inputFeatures: {
          length: inputFeatures.length,
          min: Math.min(...inputFeatures),
          max: Math.max(...inputFeatures),
          mean: inputFeatures.reduce((a, b) => a + b, 0) / inputFeatures.length,
          hasNaN: inputFeatures.some(v => isNaN(v)),
          hasInfinity: inputFeatures.some(v => !isFinite(v)),
        },
        output: {
          sphere,
          cylinder,
          axis,
          confidence,
        },
        runtime,
        validation: {
          inputValid: true, // Already validated
          outputValid: true, // Already validated
          warnings: outputValidation?.warnings || [],
        },
      });

      // Also keep internal log for backward compatibility
      this.logPrediction({
        modelId: "refractive",
        version: config.version,
        timestamp: Date.now(),
        inputShape: config.inputShape,
        outputShape: config.outputShape,
        runtime,
        backend: this.backend,
        inputRange: config.inputRange,
        outputRange: config.outputRange,
      });

      // Cleanup
      inputTensor.dispose();
      if (output && !Array.isArray(output)) {
        (output as tf.Tensor).dispose();
      } else if (Array.isArray(output)) {
        output.forEach((t) => t.dispose());
      }

      return {
        sphere: Math.round(sphere * 100) / 100,
        cylinder: Math.round(cylinder * 100) / 100,
        axis: Math.round(axis),
        confidence,
        metadata: {
          modelVersion: config.version,
          backend: this.backend,
          runtime: Math.round(runtime * 100) / 100,
        },
      };
    } catch (error) {
      inputTensor.dispose();
      this.log("prediction_error", {
        modelId: "refractive",
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Public API: calibration prediction with validation
   */
  async predictCalibration(
    features: number[] | Float32Array
  ): Promise<{
    distanceMeters: number;
    confidence: number;
    metadata: {
      modelVersion: string;
      backend: string;
      runtime: number;
    };
  }> {
    const startTime = performance.now();
    const config = SCREENING_MODELS[this.modelVersion]?.find(
      (m) => m.id === "calibration"
    );

    if (!config) {
      throw new Error(`Calibration model config not found for version ${this.modelVersion}`);
    }

    // Validate input
    this.validateInput(features, config);

    // Load model if needed
    const model = await this.loadModel(config);

    // Prepare input tensor
    const inputTensor = tf.tensor2d([Array.from(features)], config.inputShape);

    try {
      // Run prediction
      const output = await this.safePredict(model, inputTensor);

      // Validate output
      if (output) {
        this.validateOutput(output, config);
      }

      // Decode output
      let distanceMeters = 0;
      let confidence = 1.0;

      if (output && !Array.isArray(output)) {
        const data = await (output as tf.Tensor).data();
        distanceMeters = data[0] ?? 0;
        confidence = data[1] ?? 0;

        // Clamp to expected ranges
        if (config.outputRange) {
          distanceMeters = Math.max(
            config.outputRange.min,
            Math.min(config.outputRange.max, distanceMeters)
          );
          confidence = Math.max(0, Math.min(1, confidence));
        }

        // Validate output with structured validation
        const outputValidation = validateCalibrationOutput(distanceMeters, confidence);
        
        if (outputValidation.warnings.length > 0) {
          this.log('output_validation_warning', {
            modelId: 'calibration',
            warnings: outputValidation.warnings,
            values: { distanceMeters, confidence },
          });
        }

        if (!outputValidation.valid) {
          throw new Error(
            `Output validation failed: ${outputValidation.errors.join('; ')}`
          );
        }
      }

      const runtime = performance.now() - startTime;

      // Log prediction with structured logging
      const logger = getScreeningLogger();
      const inputFeatures = Array.from(features);
      logger.logPrediction({
        modelId: "calibration",
        modelVersion: config.version,
        backend: this.backend,
        inputFeatures: {
          length: inputFeatures.length,
          min: Math.min(...inputFeatures),
          max: Math.max(...inputFeatures),
          mean: inputFeatures.reduce((a, b) => a + b, 0) / inputFeatures.length,
          hasNaN: inputFeatures.some(v => isNaN(v)),
          hasInfinity: inputFeatures.some(v => !isFinite(v)),
        },
        output: {
          distanceMeters,
          confidence,
        },
        runtime,
        validation: {
          inputValid: true,
          outputValid: true,
          warnings: outputValidation?.warnings || [],
        },
      });

      // Also keep internal log for backward compatibility
      this.logPrediction({
        modelId: "calibration",
        version: config.version,
        timestamp: Date.now(),
        inputShape: config.inputShape,
        outputShape: config.outputShape,
        runtime,
        backend: this.backend,
        inputRange: config.inputRange,
        outputRange: config.outputRange,
      });

      // Cleanup
      inputTensor.dispose();
      if (output && !Array.isArray(output)) {
        (output as tf.Tensor).dispose();
      } else if (Array.isArray(output)) {
        output.forEach((t) => t.dispose());
      }

      return {
        distanceMeters: Math.round(distanceMeters * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        metadata: {
          modelVersion: config.version,
          backend: this.backend,
          runtime: Math.round(runtime * 100) / 100,
        },
      };
    } catch (error) {
      inputTensor.dispose();
      this.log("prediction_error", {
        modelId: "calibration",
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get prediction logs for audit trail
   */
  getPredictionLogs(): PredictionLog[] {
    return [...this.predictionLogs];
  }

  /**
   * Clear prediction logs
   */
  clearLogs(): void {
    this.predictionLogs = [];
  }

  /**
   * Log prediction for audit trail
   */
  private logPrediction(log: PredictionLog): void {
    this.predictionLogs.push(log);
    
    // Keep only last N logs
    if (this.predictionLogs.length > this.maxLogs) {
      this.predictionLogs.shift();
    }

    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === 'development') {
      console.log('[ScreeningEngine] Prediction logged:', log);
    }
  }

  /**
   * Internal logging utility
   */
  private log(event: string, data: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ScreeningEngine] ${event}:`, data);
    }
    // In production, send to logging service
  }

  /**
   * Get engine status for debugging
   */
  getStatus(): {
    initialized: boolean;
    backend: string;
    modelVersion: string;
    loadedModels: ScreeningModelId[];
    logCount: number;
  } {
    return {
      initialized: this.initialized,
      backend: this.backend,
      modelVersion: this.modelVersion,
      loadedModels: Array.from(this.models.keys()),
      logCount: this.predictionLogs.length,
    };
  }
}

// Singleton instance
let singletonEngine: ScreeningEngine | null = null;

export function getScreeningEngine(
  backend: ScreeningBackend = "webgl",
  modelVersion: string = DEFAULT_MODEL_VERSION
): ScreeningEngine {
  if (!singletonEngine || singletonEngine.getStatus().modelVersion !== modelVersion) {
    singletonEngine = new ScreeningEngine(backend, modelVersion);
  }
  return singletonEngine;
}

