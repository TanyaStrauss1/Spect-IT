/**
 * Functional Screening Model API
 * Exact match to specification with automatic memory management
 */

import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

export type ScreeningBackend = "webgl" | "wasm" | "cpu";

export interface ScreeningInputs {
  // Raw numeric features from your pipeline
  depthFeatures: number[];      // e.g. LiDAR/camera depth summary
  geometryFeatures: number[];   // corneal curvature, asymmetry, etc.
  visionTestFeatures: number[]; // acuity thresholds, contrast scores, etc.
}

export interface ScreeningOutputs {
  sphere: number;      // screening-level myopia/hyperopia estimate
  cylinder: number;    // screening-level astigmatism magnitude
  axis: number;        // astigmatism axis in degrees
  confidence: number;  // 0–1 confidence score
}

let model: tf.LayersModel | null = null;
let isInitialised = false;

/**
 * Initialise TensorFlow backend once (call early in app, e.g. on app load).
 */
export async function initScreeningBackend(
  backend: ScreeningBackend = "webgl"
): Promise<void> {
  if (isInitialised) return;

  // Fallback chain
  const backendsToTry: ScreeningBackend[] =
    backend === "webgl"
      ? ["webgl", "wasm", "cpu"]
      : backend === "wasm"
      ? ["wasm", "webgl", "cpu"]
      : ["cpu", "webgl", "wasm"];

  for (const b of backendsToTry) {
    try {
      await tf.setBackend(b);
      await tf.ready();
      console.info(`[screening] Using tfjs backend: ${b}`);
      isInitialised = true;
      return;
    } catch (err) {
      console.warn(`[screening] Failed to init backend ${b}`, err);
    }
  }

  throw new Error("[screening] Failed to initialise any tfjs backend");
}

/**
 * Load the screening model once (e.g. from /public or CDN).
 */
export async function loadScreeningModel(
  modelUrl: string
): Promise<void> {
  if (model) return;

  if (!isInitialised) {
    await initScreeningBackend("webgl");
  }

  model = (await tf.loadLayersModel(modelUrl)) as tf.LayersModel;
  console.info("[screening] Model loaded from", modelUrl);
}

/**
 * Check if model is loaded
 */
export function isModelLoaded(): boolean {
  return model !== null;
}

/**
 * Get current backend
 */
export function getCurrentBackend(): ScreeningBackend {
  return currentBackend;
}

/**
 * Combine all feature vectors into a single flat tensor.
 */
function buildInputTensor(inputs: ScreeningInputs): tf.Tensor2D {
  const combined: number[] = [
    ...inputs.depthFeatures,
    ...inputs.geometryFeatures,
    ...inputs.visionTestFeatures,
  ];

  // Shape: [batchSize, featureDim] => [1, N]
  return tf.tensor2d([combined]);
}

/**
 * Run a single screening pass.
 * Assumes the model outputs [sphere, cylinder, axis, confidence] in one vector.
 */
export async function runScreening(
  inputs: ScreeningInputs
): Promise<ScreeningOutputs> {
  if (!model) {
    throw new Error("[screening] Model not loaded. Call loadScreeningModel() first.");
  }

  return tf.tidy(() => {
    const inputTensor = buildInputTensor(inputs);
    const output = model!.predict(inputTensor) as tf.Tensor;

    const values = output.dataSync(); // [sphere, cylinder, axis, confidence]

    const [sphere, cylinder, axis, confidence] = values;

    return {
      sphere,
      cylinder,
      axis,
      confidence: Math.max(0, Math.min(1, confidence)), // clamp 0–1
    };
  });
}

/**
 * Dispose of the model (cleanup)
 */
export function disposeScreeningModel(): void {
  if (model) {
    model.dispose();
    model = null;
    console.info("[screening] Model disposed");
  }
}

/**
 * Get model status
 */
export function getScreeningModelStatus(): {
  loaded: boolean;
  backend: ScreeningBackend;
  initialized: boolean;
} {
  return {
    loaded: model !== null,
    backend: currentBackend,
    initialized: isInitialised,
  };
}

