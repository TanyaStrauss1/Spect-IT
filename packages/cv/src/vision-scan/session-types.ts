/**
 * Vision Scan Session Types
 * 
 * Shared session state types for persisting data through the scan flow.
 */

import type {
  DeviceQualification,
  CalibrationResult,
  AlignmentResult,
  MotilityResult,
  ConvergenceResult,
  QualityAssessment,
  VisionScanResult,
} from './types'

export type VisionScanSessionState = {
  sessionId: string
  participantId: string | null
  startedAt: number
  
  // Module results
  deviceQualification: DeviceQualification | null
  calibration: CalibrationResult | null
  alignment: AlignmentResult | null
  motility: MotilityResult | null
  convergence: ConvergenceResult | null
  
  // Quality assessment
  qualityAssessment: QualityAssessment | null
  
  // Repeat tracking
  repeatAttempts: Record<string, number>
  
  // Completion
  isComplete: boolean
  completedAt: number | null
}

export type VisionScanSessionActions = {
  startSession: (participantId: string | null) => void
  setDeviceQualification: (result: DeviceQualification) => void
  setCalibration: (result: CalibrationResult) => void
  setAlignment: (result: AlignmentResult) => void
  setMotility: (result: MotilityResult) => void
  setConvergence: (result: ConvergenceResult) => void
  setQualityAssessment: (assessment: QualityAssessment) => void
  recordRepeatAttempt: (module: string) => void
  completeSession: () => void
  resetSession: () => void
  buildFinalResult: () => VisionScanResult | null
}

export type VisionScanSession = VisionScanSessionState & VisionScanSessionActions
