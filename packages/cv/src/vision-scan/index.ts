/**
 * Vision Scan Module - Prototype 1
 * 
 * Self-administered smartphone eye-screening sequence.
 */

export * from './types'
export * from './session-types'
export * from './exam-controller-types'
export { DeviceQualifier } from './device-qualifier'
export { VisionScanCalibrator } from './calibrator'
export { AlignmentTracker } from './alignment-tracker'
export { CoverUncoverTracker, detectOcclusion } from './cover-uncover-tracker'
export { MotilityTracker } from './motility-tracker'
export { ConvergenceTracker } from './convergence-tracker'
export { QualityEngine } from './quality-engine'
export { ExamController } from './exam-controller'
export { FixationCaptureController, DEFAULT_FIXATION_CONFIG } from './fixation-capture'
export { detectDeviceTier, getDeviceTierInfo, getMeasurementMethodDescription, supportsSensorMeasurements } from './device-tier'
export { performDeviceCheck, getDeviceCheckRetryInstructions, canRetryDeviceCheck, formatDeviceCheckSummary } from './device-checker'
export type { FixationCaptureConfig, FixationCaptureInput } from './fixation-capture'
export type { StorageInfo, PermissionStatus } from './device-checker'
