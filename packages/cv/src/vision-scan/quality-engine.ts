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
    const qualityIssues: string[] = []

    if (totalFrames === 0) {
      confidence = 0
      qualityIssues.push('No alignment frames captured.')
    } else {
      const frameRatio = goodFrames / totalFrames
      
      // Stricter confidence scoring when face was intermittent
      if (frameRatio < 0.5) {
        qualityIssues.push('Face intermittently detected during alignment capture.')
      }
      
      if (goodFrames < 12) {
        qualityIssues.push(`Insufficient high-quality frames (${goodFrames}/12 minimum).`)
      }

      // Tighter thresholds
      if (frameRatio > 0.85 && goodFrames >= 15) confidence = 0.95
      else if (frameRatio > 0.7 && goodFrames >= 12) confidence = 0.80
      else if (frameRatio > 0.5 && goodFrames >= 10) confidence = 0.60
      else if (frameRatio > 0.3) confidence = 0.40
      else confidence = 0.25
    }

    return {
      module: 'alignment',
      confidence,
      shouldRepeat: confidence < this.REPEAT_THRESHOLD,
      qualityIssues,
    }
  }

  private assessMotility(motility: MotilityResult): ModuleConfidence {
    const qualityIssues: string[] = []
    let confidence = 0.8

    // Check for excessive head motion
    if (motility.excessiveHeadMotion) {
      confidence = 0.4
      qualityIssues.push('Excessive head motion reduced motility data quality.')
    }

    // Check for sufficient frames per position (stricter gate)
    const positionKeys = Object.keys(motility.positions) as any[]
    const insufficientPositions = positionKeys.filter(pos => {
      const frames = motility.positions[pos].filter((f: any) => !f.rejected)
      return frames.length < 3
    })

    if (insufficientPositions.length > 0) {
      confidence = Math.min(confidence, 0.5)
      qualityIssues.push(`Insufficient frames for ${insufficientPositions.length} position(s). Face should remain visible.`)
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

    const qualityIssues: string[] = []
    let confidence = 0

    if (totalFrames === 0) {
      confidence = 0
      qualityIssues.push('No convergence frames captured.')
    } else {
      const frameRatio = goodFrames / totalFrames
      
      // Stricter scoring when face was intermittent
      if (frameRatio < 0.5) {
        qualityIssues.push('Face intermittently detected during convergence test.')
      }
      
      if (goodFrames < 15) {
        qualityIssues.push(`Insufficient high-quality frames (${goodFrames}/15 minimum).`)
      }

      // Tighter thresholds with near point requirement
      if (frameRatio > 0.75 && convergence.nearPoint !== null && goodFrames >= 20) confidence = 0.90
      else if (frameRatio > 0.6 && convergence.nearPoint !== null && goodFrames >= 15) confidence = 0.75
      else if (frameRatio > 0.5 && goodFrames >= 12) confidence = 0.60
      else if (frameRatio > 0.3) confidence = 0.40
      else confidence = 0.30
    }

    if (convergence.nearPoint === null) {
      qualityIssues.push('Unable to determine near point of convergence.')
      confidence = Math.min(confidence, 0.60)
    }

    return {
      module: 'convergence',
      confidence,
      shouldRepeat: confidence < this.REPEAT_THRESHOLD,
      qualityIssues,
    }
  }
}
