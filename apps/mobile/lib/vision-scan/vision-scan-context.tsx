/**
 * Vision Scan Session Context
 * 
 * Manages session state through the entire vision scan flow.
 */

import React, { createContext, useContext, useState, useCallback } from 'react'
import type {
  VisionScanSession,
  VisionScanSessionState,
  DeviceQualification,
  CalibrationResult,
  AlignmentResult,
  MotilityResult,
  ConvergenceResult,
  QualityAssessment,
  VisionScanResult,
} from '@spect-it/cv'

const VisionScanContext = createContext<VisionScanSession | null>(null)

export function VisionScanProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<VisionScanSessionState>({
    sessionId: '',
    participantId: null,
    startedAt: 0,
    deviceQualification: null,
    calibration: null,
    alignment: null,
    motility: null,
    convergence: null,
    qualityAssessment: null,
    methodology: {},
    repeatAttempts: {},
    isComplete: false,
    completedAt: null,
  })

  const startSession = useCallback((participantId: string | null) => {
    setSession({
      sessionId: `vs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participantId,
      startedAt: Date.now(),
      deviceQualification: null,
      calibration: null,
      alignment: null,
      motility: null,
      convergence: null,
      qualityAssessment: null,
      methodology: {},
      repeatAttempts: {},
      isComplete: false,
      completedAt: null,
    })
  }, [])

  const setDeviceQualification = useCallback((result: DeviceQualification) => {
    setSession((prev) => ({ ...prev, deviceQualification: result }))
  }, [])

  const setCalibration = useCallback((result: CalibrationResult) => {
    setSession((prev) => ({ ...prev, calibration: result }))
  }, [])

  const setAlignment = useCallback((result: AlignmentResult) => {
    setSession((prev) => ({ ...prev, alignment: result }))
  }, [])

  const setMotility = useCallback((result: MotilityResult) => {
    setSession((prev) => ({ ...prev, motility: result }))
  }, [])

  const setConvergence = useCallback((result: ConvergenceResult) => {
    setSession((prev) => ({ ...prev, convergence: result }))
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

  const updateMethodology = useCallback((methodologyUpdate: Partial<{ distanceMethod: string; gazeMethod: string; vergenceMethod: string }>) => {
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
      motility: null,
      convergence: null,
      qualityAssessment: null,
      methodology: {},
      repeatAttempts: {},
      isComplete: false,
      completedAt: null,
    })
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
    if (session.motility.excessiveHeadMotion) {
      issues.push('limited motility data quality')
    }
    if (!session.convergence.nearPoint || session.convergence.nearPoint > 100) {
      issues.push('convergence variation')
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

    return {
      timestamp: Date.now(),
      participantId: session.participantId,
      deviceQualification: session.deviceQualification,
      calibration: session.calibration,
      alignment: session.alignment,
      motility: session.motility,
      convergence: session.convergence,
      qualityAssessment: session.qualityAssessment,
      screeningSummary,
      recommendsProfessionalExam,
      repeatAttempts: session.repeatAttempts,
      methodology: session.methodology,
    }
  }, [session])

  const value: VisionScanSession = {
    ...session,
    startSession,
    setDeviceQualification,
    setCalibration,
    setAlignment,
    setMotility,
    setConvergence,
    setQualityAssessment,
    recordRepeatAttempt,
    updateMethodology,
    completeSession,
    resetSession,
    buildFinalResult,
  }

  return (
    <VisionScanContext.Provider value={value}>
      {children}
    </VisionScanContext.Provider>
  )
}

export function useVisionScan(): VisionScanSession {
  const context = useContext(VisionScanContext)
  if (!context) {
    throw new Error('useVisionScan must be used within VisionScanProvider')
  }
  return context
}
