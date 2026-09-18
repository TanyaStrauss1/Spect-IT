/**
 * Closed-Loop Examination Controller Types
 * 
 * Per-module measurement state with explicit confidence, uncertainty,
 * and adaptive acquisition control for screening-only applications.
 * 
 * § References: Invention Disclosure §§25-26, 35-47
 */

import type {
  ModuleName,
  DeviceQualification,
  CalibrationResult,
  AlignmentResult,
  MotilityResult,
  ConvergenceResult,
} from './types'

// ============================================================================
// Module Measurement State
// ============================================================================

export type MeasurementStatus =
  | 'not-started'
  | 'in-progress'
  | 'needs-retry' // confidence below threshold
  | 'retry-exhausted' // max attempts reached
  | 'complete' // sufficient confidence achieved
  | 'inconclusive' // could not achieve confidence after retries

export type MeasurementUncertainty = {
  // Sources of uncertainty
  lowSampleCount: boolean // insufficient frames/samples
  poorQuality: boolean // quality metrics below threshold
  excessiveMotion: boolean // subject motion compromised data
  environmentalFactors: boolean // lighting, distance, etc.
  
  // Quantified uncertainty estimate (0-1, higher = more uncertain)
  quantifiedUncertainty: number
}

export type ModuleMeasurementState = {
  module: ModuleName
  status: MeasurementStatus
  confidence: number // 0-1
  uncertainty: MeasurementUncertainty
  
  // Acquisition tracking
  attemptNumber: number // 1-based
  maxAttempts: number
  samplesCollected: number
  targetSamples: number
  
  // Quality feedback
  qualityIssues: string[] // human-readable issues
  coachingPrompts: string[] // corrective instructions for next attempt
  
  // Result data
  result: DeviceQualification | CalibrationResult | AlignmentResult | MotilityResult | ConvergenceResult | null
  
  // Timestamps
  startedAt: number | null
  lastAttemptAt: number | null
  completedAt: number | null
}

// ============================================================================
// Stopping Rules Configuration
// ============================================================================

export type StoppingRuleConfig = {
  module: ModuleName
  
  // Confidence thresholds
  minConfidence: number // minimum acceptable confidence (e.g., 0.65)
  targetConfidence: number // ideal confidence (e.g., 0.80)
  
  // Sample requirements
  minSamples: number // minimum frames/samples required
  targetSamples: number // ideal number of samples
  
  // Retry limits
  maxAttempts: number // maximum retry attempts (e.g., 3)
  
  // Time limits (optional, ms)
  maxDurationPerAttempt?: number
  maxTotalDuration?: number
}

// ============================================================================
// Adaptive Acquisition Decision
// ============================================================================

export type AcquisitionDecision =
  | { action: 'continue'; reason: string } // keep collecting current attempt
  | { action: 'stop-success'; reason: string } // sufficient quality achieved
  | { action: 'stop-inconclusive'; reason: string } // retries exhausted
  | { action: 'retry'; reason: string; coachingPrompts: string[] } // need another attempt with coaching

// ============================================================================
// Exam Session State
// ============================================================================

export type ExamSessionState = {
  sessionId: string
  participantId: string | null
  startedAt: number
  
  // Per-module states
  moduleStates: Map<ModuleName, ModuleMeasurementState>
  
  // Current active module
  activeModule: ModuleName | null
  
  // Overall session status
  isComplete: boolean
  completedAt: number | null
  
  // Methodology tracking
  methodology: {
    distanceMethod?: string
    gazeMethod?: string
    vergenceMethod?: string
  }
}

// ============================================================================
// Default Stopping Rules (Conservative for Screening)
// ============================================================================

export const DEFAULT_STOPPING_RULES: Record<ModuleName, StoppingRuleConfig> = {
  'device-qualification': {
    module: 'device-qualification',
    minConfidence: 0.65,
    targetConfidence: 0.85,
    minSamples: 1,
    targetSamples: 1,
    maxAttempts: 2,
  },
  'calibration': {
    module: 'calibration',
    minConfidence: 0.65,
    targetConfidence: 0.85,
    minSamples: 9, // 9-point calibration
    targetSamples: 9,
    maxAttempts: 3,
    maxDurationPerAttempt: 60000, // 1 minute
  },
  'alignment': {
    module: 'alignment',
    minConfidence: 0.60,
    targetConfidence: 0.80,
    minSamples: 12, // minimum high-quality frames
    targetSamples: 30,
    maxAttempts: 3,
    maxDurationPerAttempt: 45000,
  },
  'motility': {
    module: 'motility',
    minConfidence: 0.60,
    targetConfidence: 0.80,
    minSamples: 27, // 3 frames per 9 positions
    targetSamples: 45,
    maxAttempts: 3,
    maxDurationPerAttempt: 90000,
  },
  'convergence': {
    module: 'convergence',
    minConfidence: 0.60,
    targetConfidence: 0.80,
    minSamples: 15, // minimum high-quality frames
    targetSamples: 30,
    maxAttempts: 3,
    maxDurationPerAttempt: 60000,
  },
}
