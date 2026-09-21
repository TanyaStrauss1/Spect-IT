/**
 * Vision Scan Session Context
 * 
 * Manages session state through the entire vision scan flow.
 * Integrated with ExamController for closed-loop adaptive acquisition.
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import type {
  VisionScanSession,
  VisionScanSessionState,
  DeviceQualification,
  CalibrationResult,
  AlignmentResult,
  CoverUncoverResult,
  MotilityResult,
  ConvergenceResult,
  PupilExaminationResult,
  QualityAssessment,
  VisionScanResult,
  ModuleName,
  AcquisitionDecision,
  ModuleMeasurementState,
} from '@spect-it/cv'
import { ExamController } from '@spect-it/cv'

const VisionScanContext = createContext<VisionScanSession & {
  examController: ExamController | null
  getModuleState: (module: ModuleName) => ModuleMeasurementState | undefined
  recordModuleCompletion: (
    module: ModuleName,
    result: DeviceQualification | CalibrationResult | AlignmentResult | MotilityResult | ConvergenceResult
  ) => AcquisitionDecision
} | null>(null)

export function VisionScanProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<VisionScanSessionState>({
    sessionId: '',
    participantId: null,
    startedAt: 0,
    deviceQualification: null,
    calibration: null,
    alignment: null,
    coverUncover: null,
    motility: null,
    convergence: null,
    pupilExamination: null,
    qualityAssessment: null,
    methodology: {},
    repeatAttempts: {},
    isComplete: false,
    completedAt: null,
  })

  const examControllerRef = useRef<ExamController | null>(null)

  const startSession = useCallback((participantId: string | null) => {
    const sessionId = `vs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    setSession({
      sessionId,
      participantId,
      startedAt: Date.now(),
      deviceQualification: null,
      calibration: null,
      alignment: null,
      coverUncover: null,
      motility: null,
      convergence: null,
      pupilExamination: null,
      qualityAssessment: null,
      methodology: {},
      repeatAttempts: {},
      isComplete: false,
      completedAt: null,
    })

    // Initialize ExamController for closed-loop control
    examControllerRef.current = new ExamController(sessionId, participantId)
  }, [])

  const setDeviceQualification = useCallback((result: DeviceQualification) => {
    setSession((prev) => ({ ...prev, deviceQualification: result }))
  }, [])

  const setCalibration = useCallback((result: CalibrationResult) => {
    setSession((prev) => ({ ...prev, calibration: result }))
  }, [])
  
  const getCalibration = useCallback((): CalibrationResult | null => {
    return session.calibration
  }, [session.calibration])

  const setAlignment = useCallback((result: AlignmentResult) => {
    setSession((prev) => ({ ...prev, alignment: result }))
  }, [])

  const setCoverUncover = useCallback((result: CoverUncoverResult) => {
    setSession((prev) => ({ ...prev, coverUncover: result }))
  }, [])

  const setMotility = useCallback((result: MotilityResult) => {
    setSession((prev) => ({ ...prev, motility: result }))
  }, [])

  const setConvergence = useCallback((result: ConvergenceResult) => {
    setSession((prev) => ({ ...prev, convergence: result }))
  }, [])

  const setPupilExamination = useCallback((result: PupilExaminationResult) => {
    setSession((prev) => ({ ...prev, pupilExamination: result }))
  }, [])

  const setQualityAssessment = useCallback((assessment: QualityAssessment) => {
    setSession((prev) => ({ ...prev, qualityAssessment: assessment }))
  }, [])

  const recordRepeatAttempt = useCallback((module: string) => {
    setSession((prev) => ({
      ...prev,
      repeatAttempts: {
        ...prev.repeatAttempts,
        [module]: (prev.repeatAttempts[module] || 0) + 1,
      },
    }))
  }, [])

  const updateMethodology = useCallback((methodologyUpdate: Partial<{ distanceMethod: string; gazeMethod: string; vergenceMethod: string; pupilMethod: string }>) => {
    setSession((prev) => ({
      ...prev,
      methodology: {
        ...prev.methodology,
        ...methodologyUpdate,
      },
    }))
  }, [])

  const completeSession = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      isComplete: true,
      completedAt: Date.now(),
    }))
  }, [])

  const resetSession = useCallback(() => {
    setSession({
      sessionId: '',
      participantId: null,
      startedAt: 0,
      deviceQualification: null,
      calibration: null,
      alignment: null,
      coverUncover: null,
      motility: null,
      convergence: null,
      pupilExamination: null,
      qualityAssessment: null,
      methodology: {},
      repeatAttempts: {},
      isComplete: false,
      completedAt: null,
    })
    examControllerRef.current = null
  }, [])

  const getModuleState = useCallback((module: ModuleName): ModuleMeasurementState | undefined => {
    return examControllerRef.current?.getModuleState(module)
  }, [])

  const recordModuleCompletion = useCallback((
    module: ModuleName,
    result: DeviceQualification | CalibrationResult | AlignmentResult | MotilityResult | ConvergenceResult
  ): AcquisitionDecision => {
    if (!examControllerRef.current) {
      return {
        action: 'stop-inconclusive',
        reason: 'ExamController not initialized',
      }
    }

    // Start module if not already started
    examControllerRef.current.startModule(module)

    // Record the result and get stopping decision
    const decision = examControllerRef.current.recordModuleResult(module, result)

    // Update methodology if controller has it
    const controllerState = examControllerRef.current.getSessionState()
    if (controllerState.methodology) {
      setSession(prev => ({
        ...prev,
        methodology: {
          ...prev.methodology,
          ...controllerState.methodology,
        },
      }))
    }

    return decision
  }, [])

  const buildFinalResult = useCallback((): VisionScanResult | null => {
    if (
      !session.deviceQualification ||
      !session.calibration ||
      !session.alignment ||
      !session.motility ||
      !session.convergence ||
      !session.qualityAssessment
    ) {
      return null
    }

    // Build screening summary
    const issues: string[] = []
    
    if (session.alignment.alignmentIndex < 70) {
      issues.push('alignment variation')
    }
    if (session.coverUncover && session.coverUncover.asymmetryDetected) {
      issues.push('cover-uncover asymmetry')
    }
    if (session.motility.excessiveHeadMotion) {
      issues.push('limited motility data quality')
    }
    if (!session.convergence.nearPoint || session.convergence.nearPoint > 100) {
      issues.push('convergence variation')
    }
    if (session.pupilExamination) {
      if (session.pupilExamination.asymmetryDetected) {
        issues.push('pupil asymmetry detected')
      }
      if (!session.pupilExamination.reactivityDetected && session.pupilExamination.dataQuality !== 'low') {
        issues.push('limited pupillary reactivity')
      }
    }

    const recommendsProfessionalExam = 
      issues.length > 0 || 
      session.qualityAssessment.overallConfidence < 0.7

    let screeningSummary: string
    if (issues.length === 0 && session.qualityAssessment.overallConfidence >= 0.8) {
      screeningSummary = 'No significant issues detected in this screening. Continue regular eye care.'
    } else if (issues.length > 0) {
      screeningSummary = `Variations detected: ${issues.join(', ')}. Professional eye examination recommended.`
    } else {
      screeningSummary = 'Screening completed with moderate data quality. Consider professional examination if symptoms present.'
    }
    
    // Import device tier utilities
    const { getDeviceTierInfo } = require('@spect-it/cv')
    const deviceTier = session.deviceQualification.deviceTier
    const deviceTierInfo = getDeviceTierInfo(deviceTier)

    return {
      timestamp: Date.now(),
      participantId: session.participantId,
      deviceQualification: session.deviceQualification,
      deviceTier,
      deviceTierInfo,
      calibration: session.calibration,
      fixationCapture: null, // TODO: implement fixation capture
      alignment: session.alignment,
      coverUncover: session.coverUncover,
      motility: session.motility,
      convergence: session.convergence,
      pupilExamination: session.pupilExamination,
      qualityAssessment: session.qualityAssessment,
      screeningSummary,
      recommendsProfessionalExam,
      repeatAttempts: session.repeatAttempts,
      methodology: session.methodology,
    }
  }, [session])

  const value = {
    ...session,
    startSession,
    setDeviceQualification,
    setCalibration,
    getCalibration,
    setAlignment,
    setCoverUncover,
    setMotility,
    setConvergence,
    setPupilExamination,
    setQualityAssessment,
    recordRepeatAttempt,
    updateMethodology,
    completeSession,
    resetSession,
    buildFinalResult,
    examController: examControllerRef.current,
    getModuleState,
    recordModuleCompletion,
  }

  return (
    <VisionScanContext.Provider value={value}>
      {children}
    </VisionScanContext.Provider>
  )
}

export function useVisionScan() {
  const context = useContext(VisionScanContext)
  if (!context) {
    throw new Error('useVisionScan must be used within VisionScanProvider')
  }
  return context
}
