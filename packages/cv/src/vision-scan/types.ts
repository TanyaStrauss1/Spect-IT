/**
 * Vision Scan Types - Prototype 1
 * 
 * Self-administered smartphone eye-screening using front-facing camera/depth,
 * eye tracking, screen, sensors, and software analysis.
 * 
 * Core technical model: Per-timestamp synchronized vector of:
 * - L/R eye position & orientation
 * - Gaze estimate
 * - Facial depth
 * - Phone-to-face distance
 * - Head pose
 * - Device pose
 * - Displayed stimulus
 * - Screen params
 * - Image/quality metrics
 */

// ============================================================================
// Device Capabilities & Qualification
// ============================================================================

export type DeviceCapability = {
  hasTrueDepth: boolean
  hasLiDAR: boolean
  hasFrontCamera: boolean
  hasGyroscope: boolean
  hasAccelerometer: boolean
  screenWidth: number
  screenHeight: number
  screenPPI: number
}

export type QualityLevel = 'excellent' | 'good' | 'acceptable' | 'poor'

export type DeviceQualification = {
  timestamp: number
  capability: DeviceCapability
  lightingScore: number // 0-100
  distanceScore: number // 0-100
  stabilityScore: number // 0-100
  overallQuality: QualityLevel
  useSensorBasedMeasurements: boolean // true = full mode, false = degraded/estimate mode
  warnings: string[]
}

// ============================================================================
// Calibration
// ============================================================================

export type CalibrationPoint = {
  screenX: number // normalized 0-1
  screenY: number // normalized 0-1
  label: string // e.g., "center", "top-right", etc.
}

export type GazeCalibrationSample = {
  timestamp: number
  targetPoint: CalibrationPoint
  leftEyeGaze: { x: number; y: number } | null
  rightEyeGaze: { x: number; y: number } | null
  headPose: { pitch: number; yaw: number; roll: number }
  faceDistance: number // mm
  quality: number // 0-1
}

export type CalibrationResult = {
  timestamp: number
  samples: GazeCalibrationSample[]
  calibrationMatrix: number[][] // transform from raw to calibrated gaze
  averageError: number // pixels
  maxError: number // pixels
  isValid: boolean
  usedSensorData: boolean
}

// ============================================================================
// Resting Alignment / Central Fixation
// ============================================================================

export type EyePosition = {
  x: number // horizontal position in degrees
  y: number // vertical position in degrees
  z: number // depth/vergence in mm
}

export type AlignmentFrame = {
  timestamp: number
  leftEye: EyePosition | null
  rightEye: EyePosition | null
  headPose: { pitch: number; yaw: number; roll: number }
  faceDistance: number
  gazeDeviation: { left: number; right: number } // degrees from center
  quality: number
}

export type AlignmentResult = {
  timestamp: number
  frames: AlignmentFrame[]
  meanDeviation: { left: number; right: number } // degrees
  alignmentIndex: number // 0-100, higher = better alignment
  screeningNote: string // e.g., "no significant signal detected" or "professional assessment recommended"
  usedSensorData: boolean
}

// ============================================================================
// 9-Position Motility
// ============================================================================

export type GazePosition =
  | 'center'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'up-left'
  | 'up-right'
  | 'down-left'
  | 'down-right'

export type MotilityFrame = {
  timestamp: number
  targetPosition: GazePosition
  leftEye: EyePosition | null
  rightEye: EyePosition | null
  headMotion: { pitch: number; yaw: number; roll: number } // degrees/sec
  headDisplacement: number // mm from starting position
  quality: number
  rejected: boolean // true if excessive head motion
}

export type MotilityResult = {
  timestamp: number
  positions: Record<GazePosition, MotilityFrame[]>
  motilityProfile: Record<GazePosition, { range: number; smoothness: number }>
  excessiveHeadMotion: boolean
  screeningNote: string
  usedSensorData: boolean
}

// ============================================================================
// Dynamic Convergence
// ============================================================================

export type ConvergenceFrame = {
  timestamp: number
  faceDistance: number // mm
  leftEye: EyePosition | null
  rightEye: EyePosition | null
  vergenceAngle: number | null // degrees (convergence)
  quality: number
}

export type ConvergenceResult = {
  timestamp: number
  approachFrames: ConvergenceFrame[]
  recedeFrames: ConvergenceFrame[]
  nearPoint: number | null // mm where convergence breaks
  convergenceCurve: { distance: number; vergence: number }[]
  screeningNote: string
  usedSensorData: boolean
}

// ============================================================================
// Quality & Confidence
// ============================================================================

export type ModuleName =
  | 'device-qualification'
  | 'calibration'
  | 'alignment'
  | 'motility'
  | 'convergence'

export type ModuleConfidence = {
  module: ModuleName
  confidence: number // 0-1
  shouldRepeat: boolean
  qualityIssues: string[]
}

export type QualityAssessment = {
  timestamp: number
  modules: ModuleConfidence[]
  overallConfidence: number // 0-1
  repeatRequired: ModuleName[]
}

// ============================================================================
// Complete Vision Scan Result
// ============================================================================

export type VisionScanResult = {
  timestamp: number
  participantId: string | null
  deviceQualification: DeviceQualification
  calibration: CalibrationResult
  alignment: AlignmentResult
  motility: MotilityResult
  convergence: ConvergenceResult
  qualityAssessment: QualityAssessment
  screeningSummary: string // Overall screening message - no diagnoses
  recommendsProfessionalExam: boolean
  repeatAttempts: Record<ModuleName, number>
}

// ============================================================================
// Capability Matrix: Full vs Degraded
// ============================================================================

export type CapabilityMode = 'full' | 'degraded'

export type CapabilityMatrix = {
  mode: CapabilityMode
  features: {
    depthMeasurement: 'sensor' | 'estimated' // TrueDepth/LiDAR vs face-size estimation
    gazeTracking: 'sensor' | 'estimated' // ARKit vs geometric approximation
    headPose: 'sensor' | 'estimated' // IMU vs visual tracking
    distanceMeasurement: 'sensor' | 'estimated' // Depth sensor vs face-size
  }
  accuracy: {
    alignment: 'high' | 'medium' | 'low'
    motility: 'high' | 'medium' | 'low'
    convergence: 'high' | 'medium' | 'low'
  }
  warnings: string[]
}
