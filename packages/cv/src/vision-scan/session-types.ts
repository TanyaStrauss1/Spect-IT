/**
 * Vision Scan Session Types
 * 
 * Shared session state types for persisting data through the scan flow.
 */

import type {
  DeviceQualification,
  CalibrationResult,
  AlignmentResult,
  CoverUncoverResult,
  MotilityResult,
  ConvergenceResult,
  PupilExaminationResult,
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
  coverUncover: CoverUncoverResult | null
  motility: MotilityResult | null
  convergence: ConvergenceResult | null
  pupilExamination: PupilExaminationResult | null
  
  // Quality assessment
  qualityAssessment: QualityAssessment | null
  
  // Methodology tracking (observed methods actually used during capture)
  methodology: {
    distanceMethod?: string
    gazeMethod?: string
    vergenceMethod?: string
    pupilMethod?: string
  }
  
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
  setCoverUncover: (result: CoverUncoverResult) => void
  setMotility: (result: MotilityResult) => void
  setConvergence: (result: ConvergenceResult) => void
  setPupilExamination: (result: PupilExaminationResult) => void
  setQualityAssessment: (assessment: QualityAssessment) => void
  recordRepeatAttempt: (module: string) => void
  updateMethodology: (methodologyUpdate: Partial<{ distanceMethod: string; gazeMethod: string; vergenceMethod: string; pupilMethod: string }>) => void
  completeSession: () => void
  resetSession: () => void
  buildFinalResult: () => VisionScanResult | null
}

export type VisionScanSession = VisionScanSessionState & VisionScanSessionActions
