/**
 * Gaze Calibration Module
 * 
 * Guides user through calibration sequence (follow dots on screen)
 * to build per-user calibration model for gaze tracking.
 */

import type {
  CalibrationPoint,
  GazeCalibrationSample,
  CalibrationResult,
} from './types'

export class VisionScanCalibrator {
  private samples: GazeCalibrationSample[] = []
  private useSensorData: boolean

  constructor(useSensorData: boolean) {
    this.useSensorData = useSensorData
  }

  /**
   * Get calibration points sequence
   * Center, then 8 peripheral positions
   */
  static getCalibrationPoints(): CalibrationPoint[] {
    return [
      { screenX: 0.5, screenY: 0.5, label: 'center' },
      { screenX: 0.5, screenY: 0.2, label: 'top' },
      { screenX: 0.5, screenY: 0.8, label: 'bottom' },
      { screenX: 0.2, screenY: 0.5, label: 'left' },
      { screenX: 0.8, screenY: 0.5, label: 'right' },
      { screenX: 0.2, screenY: 0.2, label: 'top-left' },
      { screenX: 0.8, screenY: 0.2, label: 'top-right' },
      { screenX: 0.2, screenY: 0.8, label: 'bottom-left' },
      { screenX: 0.8, screenY: 0.8, label: 'bottom-right' },
    ]
  }

  /**
   * Record calibration sample
   */
  addSample(sample: GazeCalibrationSample): void {
    this.samples.push(sample)
  }

  /**
   * Compute calibration result with quality gates
   * 
   * Quality Gates:
   * - Minimum samples: 9 (all calibration points)
   * - Minimum high-quality samples: 6 (quality > 0.5)
   * - Outlier rejection: Remove samples with errors > 3 * median error
   * - Face-based mode thresholds: avgError < 150px, maxError < 300px
   * - Sensor-based mode thresholds: avgError < 50px, maxError < 100px
   */
  computeCalibration(): CalibrationResult {
    const MIN_SAMPLES = 9
    const MIN_HIGH_QUALITY_SAMPLES = 6
    const QUALITY_THRESHOLD = 0.5

    if (this.samples.length < MIN_SAMPLES) {
      return {
        timestamp: Date.now(),
        samples: this.samples,
        calibrationMatrix: this.createIdentityMatrix(),
        averageError: 0,
        maxError: 0,
        isValid: false,
        usedSensorData: this.useSensorData,
        rejectionReason: `Insufficient samples (${this.samples.length}/${MIN_SAMPLES})`
      }
    }

    // Quality gate: require minimum high-quality samples with face present
    const highQualitySamples = this.samples.filter(s => s.quality > QUALITY_THRESHOLD)
    if (highQualitySamples.length < MIN_HIGH_QUALITY_SAMPLES) {
      return {
        timestamp: Date.now(),
        samples: this.samples,
        calibrationMatrix: this.createIdentityMatrix(),
        averageError: 0,
        maxError: 0,
        isValid: false,
        usedSensorData: this.useSensorData,
        rejectionReason: `Insufficient high-quality samples (${highQualitySamples.length}/${MIN_HIGH_QUALITY_SAMPLES})`
      }
    }

    // Compute calibration matrix (simplified)
    const calibrationMatrix = this.computeCalibrationMatrix()
    const { averageError, maxError, filteredSamples } = this.computeErrors()

    // Adaptive thresholds based on sensor availability
    const avgThreshold = this.useSensorData ? 50 : 150  // px
    const maxThreshold = this.useSensorData ? 100 : 300 // px

    const isValid = averageError < avgThreshold && maxError < maxThreshold

    return {
      timestamp: Date.now(),
      samples: filteredSamples,
      calibrationMatrix,
      averageError,
      maxError,
      isValid,
      usedSensorData: this.useSensorData,
      rejectionReason: isValid ? undefined : 
        `Calibration errors exceed threshold (avg: ${averageError.toFixed(0)}/${avgThreshold}px, max: ${maxError.toFixed(0)}/${maxThreshold}px)`
    }
  }

  private createIdentityMatrix(): number[][] {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]
  }

  private computeCalibrationMatrix(): number[][] {
    // Simplified: return identity matrix for prototype
    // Real implementation would compute transform from samples
    return this.createIdentityMatrix()
  }

  private computeErrors(): { 
    averageError: number; 
    maxError: number;
    filteredSamples: GazeCalibrationSample[]
  } {
    if (this.samples.length === 0) {
      return { averageError: 0, maxError: 0, filteredSamples: [] }
    }

    // Filter high-quality samples
    const qualitySamples = this.samples.filter((s) => s.quality > 0.5)
    
    if (qualitySamples.length === 0) {
      return { averageError: 0, maxError: 0, filteredSamples: [] }
    }

    // Compute errors for each sample (simplified - actual error will be computed in caller)
    const sampleErrors = qualitySamples.map((s) => {
      // Placeholder: real implementation uses actual gaze vs target positions
      // For now, use quality as proxy (higher quality = lower error)
      const baseError = (1 - s.quality) * 100
      return { sample: s, error: baseError }
    })

    // Outlier rejection: remove samples with error > 3 * median
    const sortedErrors = sampleErrors.map(se => se.error).sort((a, b) => a - b)
    const medianError = sortedErrors[Math.floor(sortedErrors.length / 2)]
    const outlierThreshold = medianError * 3

    const filteredSampleErrors = sampleErrors.filter(se => se.error <= outlierThreshold)
    const filteredSamples = filteredSampleErrors.map(se => se.sample)
    const filteredErrors = filteredSampleErrors.map(se => se.error)

    return {
      averageError: filteredErrors.reduce((a, b) => a + b, 0) / filteredErrors.length,
      maxError: Math.max(...filteredErrors),
      filteredSamples
    }
  }

  reset(): void {
    this.samples = []
  }
}
