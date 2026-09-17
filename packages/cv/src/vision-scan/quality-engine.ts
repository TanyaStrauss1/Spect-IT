/**
 * Quality & Confidence Engine
 * 
 * Per-module confidence assessment with selective repeat logic.
 * Poor quality data is never treated as clinical data.
 */

import type {
  ModuleName,
  ModuleConfidence,
  QualityAssessment,
  CalibrationResult,
  AlignmentResult,
  MotilityResult,
  ConvergenceResult,
  DeviceQualification,
} from './types'

export class QualityEngine {
  private readonly CONFIDENCE_THRESHOLD = 0.65
  private readonly REPEAT_THRESHOLD = 0.50

  assessQuality(
    deviceQualification: DeviceQualification,
    calibration: CalibrationResult | null,
    alignment: AlignmentResult | null,
    motility: MotilityResult | null,
    convergence: ConvergenceResult | null
  ): QualityAssessment {
    const modules: ModuleConfidence[] = []

    // Device qualification
    const deviceConfidence = this.assessDeviceQualification(deviceQualification)
    modules.push(deviceConfidence)

    // Calibration
    if (calibration) {
      const calibrationConfidence = this.assessCalibration(calibration)
      modules.push(calibrationConfidence)
    }

    // Alignment
    if (alignment) {
      const alignmentConfidence = this.assessAlignment(alignment)
      modules.push(alignmentConfidence)
    }

    // Motility
    if (motility) {
      const motilityConfidence = this.assessMotility(motility)
      modules.push(motilityConfidence)
    }

    // Convergence
    if (convergence) {
      const convergenceConfidence = this.assessConvergence(convergence)
      modules.push(convergenceConfidence)
    }

    // Overall confidence
    const overallConfidence =
      modules.reduce((sum, m) => sum + m.confidence, 0) / modules.length

    // Modules requiring repeat
    const repeatRequired = modules
      .filter((m) => m.shouldRepeat)
      .map((m) => m.module)

    return {
      timestamp: Date.now(),
      modules,
      overallConfidence,
      repeatRequired,
    }
  }

  private assessDeviceQualification(
    qualification: DeviceQualification
  ): ModuleConfidence {
    const qualityMap = {
      excellent: 1.0,
      good: 0.85,
      acceptable: 0.65,
      poor: 0.3,
    }
    const confidence = qualityMap[qualification.overallQuality]

    return {
      module: 'device-qualification',
      confidence,
      shouldRepeat: confidence < this.REPEAT_THRESHOLD,
      qualityIssues:
        qualification.warnings.length > 0 ? qualification.warnings : [],
    }
  }

  private assessCalibration(calibration: CalibrationResult): ModuleConfidence {
    let confidence = 0
    if (calibration.isValid) {
      // Lower error = higher confidence
      if (calibration.averageError < 20) confidence = 1.0
      else if (calibration.averageError < 35) confidence = 0.85
      else if (calibration.averageError < 50) confidence = 0.65
      else confidence = 0.45
    } else {
      confidence = 0.3
    }

    const qualityIssues: string[] = []
    if (calibration.averageError > 50) {
      qualityIssues.push('High calibration error detected.')
    }
    if (calibration.maxError > 100) {
      qualityIssues.push('Large calibration error in some positions.')
    }

    return {
      module: 'calibration',
      confidence,
      shouldRepeat: confidence < this.REPEAT_THRESHOLD,
      qualityIssues,
    }
  }

  private assessAlignment(alignment: AlignmentResult): ModuleConfidence {
    const goodFrames = alignment.frames.filter((f) => f.quality > 0.6).length
    const totalFrames = alignment.frames.length

    let confidence = 0
    if (totalFrames === 0) {
      confidence = 0
    } else {
      const frameRatio = goodFrames / totalFrames
      if (frameRatio > 0.8) confidence = 0.95
      else if (frameRatio > 0.6) confidence = 0.75
      else if (frameRatio > 0.4) confidence = 0.55
      else confidence = 0.35
    }

    const qualityIssues: string[] = []
    if (goodFrames < 10) {
      qualityIssues.push('Insufficient high-quality alignment frames.')
    }

    return {
      module: 'alignment',
      confidence,
      shouldRepeat: confidence < this.REPEAT_THRESHOLD,
      qualityIssues,
    }
  }

  private assessMotility(motility: MotilityResult): ModuleConfidence {
    let confidence = 0.8 // Default for prototype

    const qualityIssues: string[] = []
    if (motility.excessiveHeadMotion) {
      confidence = 0.4
      qualityIssues.push('Excessive head motion reduced motility data quality.')
    }

    return {
      module: 'motility',
      confidence,
      shouldRepeat: confidence < this.REPEAT_THRESHOLD,
      qualityIssues,
    }
  }

  private assessConvergence(convergence: ConvergenceResult): ModuleConfidence {
    const totalFrames =
      convergence.approachFrames.length + convergence.recedeFrames.length
    const goodFrames = [
      ...convergence.approachFrames,
      ...convergence.recedeFrames,
    ].filter((f) => f.quality > 0.6).length

    let confidence = 0
    if (totalFrames === 0) {
      confidence = 0
    } else {
      const frameRatio = goodFrames / totalFrames
      if (frameRatio > 0.7 && convergence.nearPoint !== null) confidence = 0.85
      else if (frameRatio > 0.5) confidence = 0.65
      else confidence = 0.45
    }

    const qualityIssues: string[] = []
    if (convergence.nearPoint === null) {
      qualityIssues.push('Unable to determine near point of convergence.')
    }
    if (goodFrames < 15) {
      qualityIssues.push('Insufficient high-quality convergence frames.')
    }

    return {
      module: 'convergence',
      confidence,
      shouldRepeat: confidence < this.REPEAT_THRESHOLD,
      qualityIssues,
    }
  }
}
