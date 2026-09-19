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
  QualityIssue,
  RejectionCategory,
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

    const qualityIssues: QualityIssue[] = []
    let rejectionReason: RejectionCategory | undefined

    if (qualification.lightingScore < 50) {
      const issue: QualityIssue = {
        category: 'ambient-light',
        message: 'Insufficient ambient lighting detected.',
        actionable: 'Move to a brighter area or turn on additional lights.'
      }
      qualityIssues.push(issue)
      if (!rejectionReason) rejectionReason = 'ambient-light'
    } else if (qualification.lightingScore < 65) {
      qualityIssues.push({
        category: 'ambient-light',
        message: 'Lighting is below optimal range.',
        actionable: 'For best results, use bright, even lighting.'
      })
    }

    if (qualification.distanceScore < 50) {
      const issue: QualityIssue = {
        category: 'face-distance',
        message: 'Face distance is outside acceptable range.',
        actionable: 'Hold device 40-60cm (16-24 inches) from your face.'
      }
      qualityIssues.push(issue)
      if (!rejectionReason) rejectionReason = 'face-distance'
    }

    if (qualification.stabilityScore < 60) {
      const issue: QualityIssue = {
        category: 'motion',
        message: 'Excessive device motion detected.',
        actionable: 'Hold device steady or prop it against a stable surface.'
      }
      qualityIssues.push(issue)
      if (!rejectionReason) rejectionReason = 'motion'
    }

    if (!qualification.capability.hasTrueDepth && !qualification.capability.hasLiDAR) {
      qualityIssues.push({
        category: 'low-confidence',
        message: 'No depth sensor detected (camera-only mode).',
        actionable: 'Results will be screening-level estimates only.'
      })
    }

    return {
      module: 'device-qualification',
      confidence,
      shouldRepeat: confidence < this.REPEAT_THRESHOLD,
      qualityIssues,
      rejectionReason,
    }
  }

  private assessCalibration(calibration: CalibrationResult): ModuleConfidence {
    let confidence = 0
    if (calibration.isValid) {
      if (calibration.averageError < 20) confidence = 1.0
      else if (calibration.averageError < 35) confidence = 0.85
      else if (calibration.averageError < 50) confidence = 0.65
      else confidence = 0.45
    } else {
      confidence = 0.3
    }

    const qualityIssues: QualityIssue[] = []
    let rejectionReason: RejectionCategory | undefined

    if (!calibration.isValid && calibration.rejectionReason) {
      qualityIssues.push({
        category: 'low-confidence',
        message: `Calibration failed: ${calibration.rejectionReason}`,
        actionable: 'Ensure your face is clearly visible and hold the device steady.'
      })
      rejectionReason = 'low-confidence'
    }

    if (calibration.averageError > 50) {
      const issue: QualityIssue = {
        category: 'low-confidence',
        message: `High calibration error detected (${calibration.averageError.toFixed(0)}px average).`,
        actionable: 'Look directly at each calibration point and hold steady.'
      }
      qualityIssues.push(issue)
      if (!rejectionReason) rejectionReason = 'low-confidence'
    }

    if (calibration.maxError > 100) {
      qualityIssues.push({
        category: 'low-confidence',
        message: `Large calibration error in some positions (${calibration.maxError.toFixed(0)}px max).`,
        actionable: 'Ensure even lighting across the screen during calibration.'
      })
    }

    return {
      module: 'calibration',
      confidence,
      shouldRepeat: confidence < this.REPEAT_THRESHOLD,
      qualityIssues,
      rejectionReason,
    }
  }

  private assessAlignment(alignment: AlignmentResult): ModuleConfidence {
    const goodFrames = alignment.frames.filter((f) => f.quality > 0.6).length
    const totalFrames = alignment.frames.length

    let confidence = 0
    const qualityIssues: QualityIssue[] = []
    let rejectionReason: RejectionCategory | undefined

    if (totalFrames === 0) {
      confidence = 0
      const issue: QualityIssue = {
        category: 'insufficient-data',
        message: 'No alignment frames captured.',
        actionable: 'Ensure your face is visible to the camera throughout the test.'
      }
      qualityIssues.push(issue)
      rejectionReason = 'insufficient-data'
    } else {
      const frameRatio = goodFrames / totalFrames
      
      if (frameRatio < 0.5) {
        const issue: QualityIssue = {
          category: 'face-detection',
          message: 'Face was intermittently detected during alignment capture.',
          actionable: 'Keep your face centered and visible throughout the test.'
        }
        qualityIssues.push(issue)
        if (!rejectionReason) rejectionReason = 'face-detection'
      }
      
      if (goodFrames < 12) {
        const issue: QualityIssue = {
          category: 'insufficient-data',
          message: `Insufficient high-quality frames (${goodFrames}/12 minimum).`,
          actionable: 'Hold position steady for the full capture duration.'
        }
        qualityIssues.push(issue)
        if (!rejectionReason) rejectionReason = 'insufficient-data'
      }

      if (frameRatio > 0.85 && goodFrames >= 15) confidence = 0.95
      else if (frameRatio > 0.7 && goodFrames >= 12) confidence = 0.80
      else if (frameRatio > 0.5 && goodFrames >= 10) confidence = 0.60
      else if (frameRatio > 0.3) confidence = 0.40
      else confidence = 0.25

      const rejectedFrameCount = totalFrames - goodFrames
      if (rejectedFrameCount > totalFrames * 0.3) {
        qualityIssues.push({
          category: 'low-confidence',
          message: `${rejectedFrameCount} frames rejected due to quality issues.`,
          actionable: 'Improve lighting and reduce head movement.'
        })
      }
    }

    return {
      module: 'alignment',
      confidence,
      shouldRepeat: confidence < this.REPEAT_THRESHOLD,
      qualityIssues,
      rejectionReason,
    }
  }

  private assessMotility(motility: MotilityResult): ModuleConfidence {
    const qualityIssues: QualityIssue[] = []
    let confidence = 0.8
    let rejectionReason: RejectionCategory | undefined

    if (motility.excessiveHeadMotion) {
      confidence = 0.4
      const issue: QualityIssue = {
        category: 'motion',
        message: 'Excessive head motion reduced motility data quality.',
        actionable: 'Keep your head still and only move your eyes to follow the targets.'
      }
      qualityIssues.push(issue)
      rejectionReason = 'motion'
    }

    const positionKeys = Object.keys(motility.positions) as (keyof typeof motility.positions)[]
    const insufficientPositions = positionKeys.filter(pos => {
      const frames = motility.positions[pos].filter((f: any) => !f.rejected)
      return frames.length < 3
    })

    if (insufficientPositions.length > 0) {
      confidence = Math.min(confidence, 0.5)
      const issue: QualityIssue = {
        category: 'face-detection',
        message: `Insufficient frames for ${insufficientPositions.length} position(s).`,
        actionable: 'Keep your face visible throughout the test while moving your eyes.'
      }
      qualityIssues.push(issue)
      if (!rejectionReason) rejectionReason = 'face-detection'
    }

    const totalRejected = positionKeys.reduce((sum, pos) => {
      const rejected = motility.positions[pos].filter((f: any) => f.rejected).length
      return sum + rejected
    }, 0)

    if (totalRejected > 15) {
      qualityIssues.push({
        category: 'motion',
        message: `${totalRejected} frames rejected due to head motion.`,
        actionable: 'Prop the device on a stable surface to reduce motion.'
      })
    }

    return {
      module: 'motility',
      confidence,
      shouldRepeat: confidence < this.REPEAT_THRESHOLD,
      qualityIssues,
      rejectionReason,
    }
  }

  private assessConvergence(convergence: ConvergenceResult): ModuleConfidence {
    const totalFrames =
      convergence.approachFrames.length + convergence.recedeFrames.length
    const goodFrames = [
      ...convergence.approachFrames,
      ...convergence.recedeFrames,
    ].filter((f) => f.quality > 0.6).length

    const qualityIssues: QualityIssue[] = []
    let confidence = 0
    let rejectionReason: RejectionCategory | undefined

    if (totalFrames === 0) {
      confidence = 0
      const issue: QualityIssue = {
        category: 'insufficient-data',
        message: 'No convergence frames captured.',
        actionable: 'Keep your face visible while moving the target toward and away.'
      }
      qualityIssues.push(issue)
      rejectionReason = 'insufficient-data'
    } else {
      const frameRatio = goodFrames / totalFrames
      
      if (frameRatio < 0.5) {
        const issue: QualityIssue = {
          category: 'face-detection',
          message: 'Face intermittently detected during convergence test.',
          actionable: 'Maintain consistent face visibility throughout the test.'
        }
        qualityIssues.push(issue)
        if (!rejectionReason) rejectionReason = 'face-detection'
      }
      
      if (goodFrames < 15) {
        const issue: QualityIssue = {
          category: 'insufficient-data',
          message: `Insufficient high-quality frames (${goodFrames}/15 minimum).`,
          actionable: 'Ensure stable lighting and clear face visibility.'
        }
        qualityIssues.push(issue)
        if (!rejectionReason) rejectionReason = 'insufficient-data'
      }

      if (frameRatio > 0.75 && convergence.nearPoint !== null && goodFrames >= 20) confidence = 0.90
      else if (frameRatio > 0.6 && convergence.nearPoint !== null && goodFrames >= 15) confidence = 0.75
      else if (frameRatio > 0.5 && goodFrames >= 12) confidence = 0.60
      else if (frameRatio > 0.3) confidence = 0.40
      else confidence = 0.30
    }

    if (convergence.nearPoint === null) {
      const issue: QualityIssue = {
        category: 'low-confidence',
        message: 'Unable to determine near point of convergence.',
        actionable: 'Follow the target smoothly as it approaches your nose.'
      }
      qualityIssues.push(issue)
      confidence = Math.min(confidence, 0.60)
      if (!rejectionReason) rejectionReason = 'low-confidence'
    }

    return {
      module: 'convergence',
      confidence,
      shouldRepeat: confidence < this.REPEAT_THRESHOLD,
      qualityIssues,
      rejectionReason,
    }
  }
}
