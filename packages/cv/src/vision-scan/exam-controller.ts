/**
 * Closed-Loop Examination Controller
 * 
 * Adaptive acquisition controller that:
 * 1. Tracks per-module measurement state with confidence + uncertainty
 * 2. Makes stopping decisions based on confidence thresholds
 * 3. Generates corrective coaching when quality is insufficient
 * 4. Enforces retry limits and marks modules inconclusive when exhausted
 * 
 * Screening-only: Never generates diagnosis or dispensable prescription.
 * 
 * § References: Invention Disclosure §§25-26, 35-47
 */

import { QualityEngine } from './quality-engine'
import type {
  ModuleName,
  ModuleConfidence,
  DeviceQualification,
  CalibrationResult,
  AlignmentResult,
  MotilityResult,
  ConvergenceResult,
  FixationCaptureSession,
} from './types'
import type {
  MeasurementStatus,
  MeasurementUncertainty,
  ModuleMeasurementState,
  StoppingRuleConfig,
  AcquisitionDecision,
  ExamSessionState,
  DEFAULT_STOPPING_RULES,
} from './exam-controller-types'

export class ExamController {
  private qualityEngine: QualityEngine
  private stoppingRules: Record<ModuleName, StoppingRuleConfig>
  private sessionState: ExamSessionState

  constructor(
    sessionId: string,
    participantId: string | null,
    customStoppingRules?: Partial<Record<ModuleName, StoppingRuleConfig>>
  ) {
    this.qualityEngine = new QualityEngine()
    
    // Use default rules with optional overrides
    const defaultRules = this.getDefaultStoppingRules()
    this.stoppingRules = {
      ...defaultRules,
      ...customStoppingRules,
    }

    this.sessionState = {
      sessionId,
      participantId,
      startedAt: Date.now(),
      moduleStates: new Map(),
      activeModule: null,
      isComplete: false,
      completedAt: null,
      methodology: {},
    }

    // Initialize module states
    this.initializeModuleStates()
  }

  private getDefaultStoppingRules(): Record<ModuleName, StoppingRuleConfig> {
    return {
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
        minSamples: 9,
        targetSamples: 9,
        maxAttempts: 3,
        maxDurationPerAttempt: 60000,
      },
      'fixation-capture': {
        module: 'fixation-capture',
        minConfidence: 0.60,
        targetConfidence: 0.80,
        minSamples: 50, // minimum good frames
        targetSamples: 70,
        maxAttempts: 3,
        maxDurationPerAttempt: 5000,
      },
      'alignment': {
        module: 'alignment',
        minConfidence: 0.60,
        targetConfidence: 0.80,
        minSamples: 12,
        targetSamples: 30,
        maxAttempts: 3,
        maxDurationPerAttempt: 45000,
      },
      'motility': {
        module: 'motility',
        minConfidence: 0.60,
        targetConfidence: 0.80,
        minSamples: 27,
        targetSamples: 45,
        maxAttempts: 3,
        maxDurationPerAttempt: 90000,
      },
      'convergence': {
        module: 'convergence',
        minConfidence: 0.60,
        targetConfidence: 0.80,
        minSamples: 15,
        targetSamples: 30,
        maxAttempts: 3,
        maxDurationPerAttempt: 60000,
      },
      'cover-uncover': {
        module: 'cover-uncover',
        minConfidence: 0.60,
        targetConfidence: 0.80,
        minSamples: 12,
        targetSamples: 24,
        maxAttempts: 3,
        maxDurationPerAttempt: 60000,
      },
      'pupil-examination': {
        module: 'pupil-examination',
        minConfidence: 0.60,
        targetConfidence: 0.80,
        minSamples: 12,
        targetSamples: 30,
        maxAttempts: 3,
        maxDurationPerAttempt: 60000,
      },
    }
  }

  private initializeModuleStates(): void {
    const modules: ModuleName[] = [
      'device-qualification',
      'calibration',
      'fixation-capture',
      'alignment',
      'cover-uncover',
      'motility',
      'convergence',
      'pupil-examination',
    ]

    for (const module of modules) {
      const rules = this.stoppingRules[module]
      this.sessionState.moduleStates.set(module, {
        module,
        status: 'not-started',
        confidence: 0,
        uncertainty: this.createEmptyUncertainty(),
        attemptNumber: 0,
        maxAttempts: rules.maxAttempts,
        samplesCollected: 0,
        targetSamples: rules.targetSamples,
        qualityIssues: [],
        coachingPrompts: [],
        result: null,
        startedAt: null,
        lastAttemptAt: null,
        completedAt: null,
      })
    }
  }

  private createEmptyUncertainty(): MeasurementUncertainty {
    return {
      lowSampleCount: false,
      poorQuality: false,
      excessiveMotion: false,
      environmentalFactors: false,
      quantifiedUncertainty: 1.0, // maximum uncertainty initially
    }
  }

  // ============================================================================
  // Module Lifecycle
  // ============================================================================

  startModule(module: ModuleName): void {
    const state = this.sessionState.moduleStates.get(module)
    if (!state) return

    state.attemptNumber += 1
    state.status = 'in-progress'
    state.lastAttemptAt = Date.now()
    
    if (state.startedAt === null) {
      state.startedAt = Date.now()
    }

    this.sessionState.activeModule = module
  }

  recordModuleResult(
    module: ModuleName,
    result: DeviceQualification | CalibrationResult | AlignmentResult | MotilityResult | ConvergenceResult | FixationCaptureSession
  ): AcquisitionDecision {
    const state = this.sessionState.moduleStates.get(module)
    if (!state) {
      return { action: 'stop-inconclusive', reason: 'Module state not found' }
    }

    // Update result
    state.result = result

    // Assess quality using existing QualityEngine
    const moduleConfidence = this.assessModuleQuality(module, result)
    state.confidence = moduleConfidence.confidence
    state.qualityIssues = moduleConfidence.qualityIssues

    // Compute uncertainty
    state.uncertainty = this.computeUncertainty(module, result, moduleConfidence)

    // Update sample count
    state.samplesCollected = this.getSampleCount(module, result)

    // Make stopping decision
    const decision = this.makeStoppingDecision(module, state)

    // Update state based on decision
    this.updateStateFromDecision(module, state, decision)

    return decision
  }

  private assessModuleQuality(
    module: ModuleName,
    result: DeviceQualification | CalibrationResult | AlignmentResult | MotilityResult | ConvergenceResult | FixationCaptureSession
  ): ModuleConfidence {
    // Handle fixation-capture separately as it's not in QualityEngine yet
    if (module === 'fixation-capture') {
      const fixation = result as FixationCaptureSession
      const confidence = fixation.summary.averageQuality
      const qualityIssues: import('./types').QualityIssue[] = []
      
      if (fixation.summary.goodFrames < 50) {
        qualityIssues.push({
          category: 'insufficient-data',
          message: `Only ${fixation.summary.goodFrames} good frames captured (50 minimum)`,
          actionable: 'Hold device steady and keep face visible',
        })
      }
      if (fixation.summary.averageQuality < 0.6) {
        qualityIssues.push({
          category: 'low-confidence',
          message: 'Average frame quality below threshold',
          actionable: 'Improve lighting and minimize movement',
        })
      }
      
      return {
        module: 'fixation-capture',
        confidence,
        shouldRepeat: confidence < 0.6 || fixation.summary.goodFrames < 50,
        qualityIssues,
      }
    }
    
    // Use existing QualityEngine to assess this module
    // We need to build a full assessment with null for other modules
    const dummyAssessment = this.qualityEngine.assessQuality(
      module === 'device-qualification' ? (result as DeviceQualification) : this.getDummyDeviceQual(),
      module === 'calibration' ? (result as CalibrationResult) : null,
      module === 'alignment' ? (result as AlignmentResult) : null,
      module === 'motility' ? (result as MotilityResult) : null,
      module === 'convergence' ? (result as ConvergenceResult) : null
    )

    const moduleConf = dummyAssessment.modules.find((m) => m.module === module)
    if (!moduleConf) {
      return {
        module,
        confidence: 0,
        shouldRepeat: true,
        qualityIssues: [{
          category: 'insufficient-data',
          message: 'Unable to assess module quality',
          actionable: 'Retry the measurement',
        }],
      }
    }

    return moduleConf
  }

  private getDummyDeviceQual(): DeviceQualification {
    return {
      timestamp: Date.now(),
      capability: {
        hasTrueDepth: false,
        hasLiDAR: false,
        hasFrontCamera: true,
        hasGyroscope: true,
        hasAccelerometer: true,
        screenWidth: 375,
        screenHeight: 812,
        screenPPI: 326,
      },
      lightingScore: 70,
      distanceScore: 70,
      stabilityScore: 70,
      overallQuality: 'acceptable',
      useSensorBasedMeasurements: false,
      warnings: [],
      deviceTier: 'standard',
    }
  }

  private computeUncertainty(
    module: ModuleName,
    result: DeviceQualification | CalibrationResult | AlignmentResult | MotilityResult | ConvergenceResult | FixationCaptureSession,
    moduleConfidence: ModuleConfidence
  ): MeasurementUncertainty {
    const uncertainty: MeasurementUncertainty = {
      lowSampleCount: false,
      poorQuality: false,
      excessiveMotion: false,
      environmentalFactors: false,
      quantifiedUncertainty: 0,
    }

    const sampleCount = this.getSampleCount(module, result)
    const rules = this.stoppingRules[module]

    // Check for low sample count
    if (sampleCount < rules.minSamples) {
      uncertainty.lowSampleCount = true
    }

    // Check for poor quality
    if (moduleConfidence.confidence < rules.minConfidence) {
      uncertainty.poorQuality = true
    }

    // Module-specific uncertainty factors
    if (module === 'device-qualification') {
      const qual = result as DeviceQualification
      if (qual.lightingScore < 60) uncertainty.environmentalFactors = true
      if (qual.distanceScore < 60) uncertainty.environmentalFactors = true
    } else if (module === 'calibration') {
      const cal = result as CalibrationResult
      if (cal.averageError > 50) uncertainty.poorQuality = true
    } else if (module === 'fixation-capture') {
      const fix = result as FixationCaptureSession
      if (fix.summary.goodFrames < rules.minSamples) uncertainty.lowSampleCount = true
      if (fix.summary.averageQuality < 0.6) uncertainty.poorQuality = true
    } else if (module === 'alignment') {
      const align = result as AlignmentResult
      const goodFrames = align.frames.filter((f) => f.quality > 0.6).length
      if (goodFrames < rules.minSamples) uncertainty.lowSampleCount = true
    } else if (module === 'motility') {
      const mot = result as MotilityResult
      if (mot.excessiveHeadMotion) uncertainty.excessiveMotion = true
    } else if (module === 'convergence') {
      const conv = result as ConvergenceResult
      const goodFrames = [
        ...conv.approachFrames,
        ...conv.recedeFrames,
      ].filter((f) => f.quality > 0.6).length
      if (goodFrames < rules.minSamples) uncertainty.lowSampleCount = true
    }

    // Quantify overall uncertainty (inverse of confidence)
    uncertainty.quantifiedUncertainty = 1.0 - moduleConfidence.confidence

    return uncertainty
  }

  private getSampleCount(
    module: ModuleName,
    result: DeviceQualification | CalibrationResult | AlignmentResult | MotilityResult | ConvergenceResult | FixationCaptureSession
  ): number {
    if (module === 'device-qualification') return 1
    if (module === 'calibration') return (result as CalibrationResult).samples.length
    if (module === 'fixation-capture') return (result as FixationCaptureSession).summary.goodFrames
    if (module === 'alignment') return (result as AlignmentResult).frames.length
    if (module === 'motility') {
      const mot = result as MotilityResult
      return Object.values(mot.positions).flat().length
    }
    if (module === 'convergence') {
      const conv = result as ConvergenceResult
      return conv.approachFrames.length + conv.recedeFrames.length
    }
    return 0
  }

  // ============================================================================
  // Stopping Decision Logic
  // ============================================================================

  private makeStoppingDecision(
    module: ModuleName,
    state: ModuleMeasurementState
  ): AcquisitionDecision {
    const rules = this.stoppingRules[module]

    // Check if max attempts exhausted
    if (state.attemptNumber >= rules.maxAttempts) {
      if (state.confidence >= rules.minConfidence) {
        return {
          action: 'stop-success',
          reason: `Minimum confidence achieved after ${state.attemptNumber} attempts.`,
        }
      } else {
        return {
          action: 'stop-inconclusive',
          reason: `Maximum attempts (${rules.maxAttempts}) reached. Confidence ${(state.confidence * 100).toFixed(0)}% below minimum ${(rules.minConfidence * 100).toFixed(0)}%.`,
        }
      }
    }

    // Check if target confidence achieved
    if (state.confidence >= rules.targetConfidence && state.samplesCollected >= rules.targetSamples) {
      return {
        action: 'stop-success',
        reason: `Target confidence ${(rules.targetConfidence * 100).toFixed(0)}% achieved with sufficient samples.`,
      }
    }

    // Check if minimum confidence achieved
    if (state.confidence >= rules.minConfidence && state.samplesCollected >= rules.minSamples) {
      return {
        action: 'stop-success',
        reason: `Minimum confidence ${(rules.minConfidence * 100).toFixed(0)}% achieved.`,
      }
    }

    // Need retry - generate coaching
    const coachingPrompts = this.generateCoachingPrompts(module, state)
    return {
      action: 'retry',
      reason: `Confidence ${(state.confidence * 100).toFixed(0)}% below minimum ${(rules.minConfidence * 100).toFixed(0)}%. Retry recommended.`,
      coachingPrompts,
    }
  }

  private generateCoachingPrompts(
    module: ModuleName,
    state: ModuleMeasurementState
  ): string[] {
    const prompts: string[] = []

    // General quality issues
    if (state.qualityIssues.length > 0) {
      prompts.push(...state.qualityIssues.map((issue) => `⚠️ ${issue}`))
    }

    // Uncertainty-specific coaching
    if (state.uncertainty.environmentalFactors) {
      prompts.push('💡 Ensure good lighting and hold phone at arm\'s length (12-16 inches).')
    }

    if (state.uncertainty.excessiveMotion) {
      prompts.push('💡 Keep your head as still as possible during the test.')
    }

    if (state.uncertainty.lowSampleCount) {
      prompts.push('💡 Keep your face visible to the camera throughout the entire test.')
    }

    if (state.uncertainty.poorQuality) {
      prompts.push('💡 Focus on the target and follow the instructions carefully.')
    }

    // Module-specific coaching
    if (module === 'calibration') {
      prompts.push('💡 Look directly at each dot as it appears on screen.')
    } else if (module === 'fixation-capture') {
      prompts.push('💡 Hold your gaze steady on the target for the full duration.')
    } else if (module === 'alignment') {
      prompts.push('💡 Keep looking at the red dot while holding your head steady.')
    } else if (module === 'motility') {
      prompts.push('💡 Follow the moving target with your eyes only, not your head.')
    } else if (module === 'convergence') {
      prompts.push('💡 Focus on the target as it moves closer to your face.')
    }

    return prompts
  }

  private updateStateFromDecision(
    module: ModuleName,
    state: ModuleMeasurementState,
    decision: AcquisitionDecision
  ): void {
    if (decision.action === 'stop-success') {
      state.status = 'complete'
      state.completedAt = Date.now()
    } else if (decision.action === 'stop-inconclusive') {
      state.status = 'inconclusive'
      state.completedAt = Date.now()
    } else if (decision.action === 'retry') {
      state.status = 'needs-retry'
      state.coachingPrompts = decision.coachingPrompts
    }
  }

  // ============================================================================
  // Session Management
  // ============================================================================

  getModuleState(module: ModuleName): ModuleMeasurementState | undefined {
    return this.sessionState.moduleStates.get(module)
  }

  getAllModuleStates(): Map<ModuleName, ModuleMeasurementState> {
    return new Map(this.sessionState.moduleStates)
  }

  getSessionState(): ExamSessionState {
    return { ...this.sessionState }
  }

  isSessionComplete(): boolean {
    // Session complete when all modules are either complete or inconclusive
    for (const [_, state] of this.sessionState.moduleStates) {
      if (state.status !== 'complete' && state.status !== 'inconclusive') {
        return false
      }
    }
    return true
  }

  markSessionComplete(): void {
    this.sessionState.isComplete = true
    this.sessionState.completedAt = Date.now()
    this.sessionState.activeModule = null
  }

  updateMethodology(update: Partial<{
    distanceMethod: string
    gazeMethod: string
    vergenceMethod: string
  }>): void {
    this.sessionState.methodology = {
      ...this.sessionState.methodology,
      ...update,
    }
  }

  // ============================================================================
  // Screening Summary Generation
  // ============================================================================

  generateScreeningSummary(): {
    overallConfidence: number
    inconclusiveModules: ModuleName[]
    recommendsProfessionalExam: boolean
    screeningNote: string
  } {
    const states = Array.from(this.sessionState.moduleStates.values())
    const completeStates = states.filter((s) => s.status === 'complete' || s.status === 'inconclusive')

    if (completeStates.length === 0) {
      return {
        overallConfidence: 0,
        inconclusiveModules: [],
        recommendsProfessionalExam: true,
        screeningNote: 'Screening not completed. No modules finished.',
      }
    }

    // Compute overall confidence from complete modules
    const overallConfidence =
      completeStates.reduce((sum, s) => sum + s.confidence, 0) / completeStates.length

    const inconclusiveModules = states
      .filter((s) => s.status === 'inconclusive')
      .map((s) => s.module)

    // Recommend professional exam if:
    // - Any modules inconclusive
    // - Overall confidence below 0.7
    const recommendsProfessionalExam =
      inconclusiveModules.length > 0 || overallConfidence < 0.7

    let screeningNote: string
    if (inconclusiveModules.length > 0) {
      screeningNote = `Screening completed with ${inconclusiveModules.length} inconclusive module(s). Professional eye examination strongly recommended.`
    } else if (overallConfidence >= 0.8) {
      screeningNote = 'No significant issues detected in this screening. Continue regular eye care.'
    } else if (overallConfidence >= 0.7) {
      screeningNote = 'Screening completed with moderate confidence. Consider professional examination if symptoms present.'
    } else {
      screeningNote = 'Screening completed with lower confidence. Professional eye examination recommended.'
    }

    return {
      overallConfidence,
      inconclusiveModules,
      recommendsProfessionalExam,
      screeningNote,
    }
  }
}
