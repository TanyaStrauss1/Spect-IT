/**
 * Spect-IT ML Models Package
 * TensorFlow.js and ONNX models for vision testing
 */

// Screening Engine (Production-Grade)
export {
  ScreeningEngine,
  getScreeningEngine,
  type ScreeningBackend,
  type ScreeningModelId,
  type ScreeningModelConfig,
  SCREENING_MODELS,
  DEFAULT_MODEL_VERSION,
} from './screening/screening-engine'

// Structured Screening Model (Class-based)
export {
  ScreeningModel,
  type ScreeningInput,
  type ScreeningOutput,
} from './screening/screening-model'

// Functional Screening Model API (Exact match to specification)
export {
  initScreeningBackend,
  loadScreeningModel,
  runScreening,
  disposeScreeningModel,
  isModelLoaded,
  type ScreeningInputs,
  type ScreeningOutputs,
  type ScreeningBackend,
} from './screening/model-functional'

// Validation utilities
export {
  validateRefractiveInput,
  validateRefractiveOutput,
  validateCalibrationInput,
  validateCalibrationOutput,
} from './screening/validation'

// Logging utilities
export {
  getScreeningLogger,
  type PredictionLogEntry,
  type AuditLog,
} from './screening/logger'

// Legacy models (still supported)
export { RefractiveEstimator } from './refractive/refractive-estimator'
export { AstigmatismModel } from './astigmatism/astigmatism-model'
export { AcuityScorer } from './acuity/acuity-scorer'
