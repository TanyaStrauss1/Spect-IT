/**
 * Spect-IT Computer Vision Package
 * 
 * Exports all CV modules:
 * - LiDAR depth detection
 * - Camera depth estimation
 * - Eye landmark detection
 * - Pupil/corneal geometry
 * - Distance calibration
 * - Screen calibration (clinical tests)
 * - Clinical vision tests (acuity, color, astigmatism, contrast, visual field, prescription)
 */

export { LiDARDetector, type LiDARConfig, type DepthReading } from './lidar/lidar-detector'
export { CameraDepthEstimator } from './depth/camera-depth-estimator'
export { EyeLandmarkDetector } from './eye/eye-landmark-detector'
export { PupilGeometryExtractor } from './eye/pupil-geometry-extractor'
export { DistanceCalibrator } from './calibration/distance-calibrator'

// Screen calibration for clinical tests
export {
  ScreenCalibrator,
  createCalibrator,
  type CalibrationData,
  type CalibrationConfig,
} from './calibration/screen-calibrator'

// Visual acuity test
export {
  VisualAcuityTest,
  createVisualAcuityTest,
  SLOAN_LETTERS,
  ETDRS_CHART,
  shuffleLetters,
  type SloanLetter,
  type ETDRSLine,
  type Eye as AcuityEye,
  type LetterResponse,
  type LineResponse,
  type EyeResult,
  type VisualAcuityResult,
} from './tests/visual-acuity'

// Color vision test
export {
  ColorVisionTest,
  createColorVisionTest,
  COLOR_VISION_PLATES,
  type PlateType,
  type ColorPlate,
  type PlateResponse,
  type ColorVisionResult,
} from './tests/color-vision'

// Astigmatism test
export {
  AstigmatismTest,
  createAstigmatismTest,
  CLOCK_TO_AXIS,
  type Eye as AstigmatismEye,
  type ClockPosition,
  type AxisRange,
  type EyeAstigmatismResult,
  type AstigmatismResult,
} from './tests/astigmatism'

// Contrast sensitivity test
export {
  ContrastSensitivityTest,
  createContrastSensitivityTest,
  CONTRAST_LETTERS,
  CONTRAST_LEVELS,
  type ContrastLetter,
  type ContrastLevel,
  type ContrastLetterResponse,
  type ContrastTripletResponse,
  type ContrastSensitivityResult,
} from './tests/contrast'

// Visual field test
export {
  VisualFieldTest,
  createVisualFieldTest,
  type Eye as VisualFieldEye,
  type GridPosition,
  type IssueType,
  type GridIssue,
  type EyeVisualFieldResult,
  type VisualFieldResult,
} from './tests/visual-field'

// Prescription screening test
export {
  PrescriptionScreeningTest,
  createPrescriptionScreeningTest,
  type Eye as PrescriptionEye,
  type RefractiveCategory,
  type PinholeResult,
  type NearVisionResult,
  type PrescriptionScreeningResult,
} from './tests/prescription'

