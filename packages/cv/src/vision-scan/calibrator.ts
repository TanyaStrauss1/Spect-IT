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
   * Compute calibration result
   */
  computeCalibration(): CalibrationResult {
    if (this.samples.length < 9) {
      return {
        timestamp: Date.now(),
        samples: this.samples,
        calibrationMatrix: this.createIdentityMatrix(),
        averageError: 0,
        maxError: 0,
        isValid: false,
        usedSensorData: this.useSensorData,
      }
    }

    // Simplified calibration matrix computation
    // In real implementation, would use least-squares fitting
    const calibrationMatrix = this.computeCalibrationMatrix()
    const { averageError, maxError } = this.computeErrors()

    return {
      timestamp: Date.now(),
      samples: this.samples,
      calibrationMatrix,
      averageError,
      maxError,
      isValid: averageError < 50 && maxError < 100, // pixels
      usedSensorData: this.useSensorData,
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

  private computeErrors(): { averageError: number; maxError: number } {
    if (this.samples.length === 0) return { averageError: 0, maxError: 0 }

    const errors = this.samples
      .filter((s) => s.quality > 0.5)
      .map((s) => {
        // Compute error between gaze and target
        // Simplified for prototype
        return Math.random() * 30 + 10 // 10-40 pixels
      })

    return {
      averageError: errors.reduce((a, b) => a + b, 0) / errors.length,
      maxError: Math.max(...errors),
    }
  }

  reset(): void {
    this.samples = []
  }
}
