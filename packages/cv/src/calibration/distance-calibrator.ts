/**
 * Stability + Distance Calibration
 * Ensures accurate test distance and head movement detection
 */

import { DepthReading } from '../lidar/lidar-detector'
import { EyeLandmarks } from '../eye/eye-landmark-detector'

export interface CalibrationResult {
  /** Is distance stable? */
  isStable: boolean
  /** Current distance in meters */
  distance: number
  /** Distance stability score (0-1) */
  stabilityScore: number
  /** Head movement detected? */
  headMovement: boolean
  /** Calibration confidence */
  confidence: number
}

export class DistanceCalibrator {
  private targetDistance: number = 2.0 // Standard Snellen test distance
  private tolerance: number = 0.1 // 10cm tolerance
  private distanceHistory: Array<{ distance: number; timestamp: number }> = []
  private eyePositionHistory: Array<{ x: number; y: number; timestamp: number }> = []
  private stabilityWindow: number = 2000 // 2 seconds
  private movementThreshold: number = 10 // pixels

  /**
   * Set target distance for calibration
   */
  setTargetDistance(distance: number, tolerance: number = 0.1): void {
    this.targetDistance = distance
    this.tolerance = tolerance
  }

  /**
   * Calibrate distance with stability check
   */
  calibrate(
    depthReading: DepthReading,
    eyeLandmarks: EyeLandmarks | null
  ): CalibrationResult {
    const now = Date.now()

    // Add to distance history
    this.distanceHistory.push({
      distance: depthReading.distance,
      timestamp: now
    })

    // Remove old entries
    this.distanceHistory = this.distanceHistory.filter(
      entry => now - entry.timestamp < this.stabilityWindow
    )

    // Check distance stability
    const isStable = this.checkDistanceStability()
    const stabilityScore = this.calculateStabilityScore()

    // Check if within target range
    const withinRange = Math.abs(depthReading.distance - this.targetDistance) <= this.tolerance

    // Check head movement
    let headMovement = false
    if (eyeLandmarks) {
      const eyeCenter = {
        x: (eyeLandmarks.leftEye.center.x + eyeLandmarks.rightEye.center.x) / 2,
        y: (eyeLandmarks.leftEye.center.y + eyeLandmarks.rightEye.center.y) / 2
      }

      this.eyePositionHistory.push({
        ...eyeCenter,
        timestamp: now
      })

      // Remove old entries
      this.eyePositionHistory = this.eyePositionHistory.filter(
        entry => now - entry.timestamp < this.stabilityWindow
      )

      headMovement = this.detectHeadMovement()
    }

    return {
      isStable: isStable && withinRange && !headMovement,
      distance: depthReading.distance,
      stabilityScore,
      headMovement,
      confidence: depthReading.confidence * stabilityScore
    }
  }

  /**
   * Check if distance is stable over time
   */
  private checkDistanceStability(): boolean {
    if (this.distanceHistory.length < 5) {
      return false // Need at least 5 readings
    }

    const distances = this.distanceHistory.map(entry => entry.distance)
    const mean = distances.reduce((a, b) => a + b, 0) / distances.length
    const variance = distances.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / distances.length
    const stdDev = Math.sqrt(variance)

    // Distance is stable if standard deviation is small
    return stdDev < this.tolerance * 0.5
  }

  /**
   * Calculate stability score (0-1)
   */
  private calculateStabilityScore(): number {
    if (this.distanceHistory.length < 5) {
      return 0
    }

    const distances = this.distanceHistory.map(entry => entry.distance)
    const mean = distances.reduce((a, b) => a + b, 0) / distances.length
    const variance = distances.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / distances.length
    const stdDev = Math.sqrt(variance)

    // Score based on how small the deviation is relative to tolerance
    const score = Math.max(0, 1 - (stdDev / this.tolerance))
    return Math.min(1, score)
  }

  /**
   * Detect head movement from eye position changes
   */
  private detectHeadMovement(): boolean {
    if (this.eyePositionHistory.length < 5) {
      return false
    }

    const positions = this.eyePositionHistory
    const first = positions[0]
    const last = positions[positions.length - 1]

    const movement = Math.sqrt(
      Math.pow(last.x - first.x, 2) +
      Math.pow(last.y - first.y, 2)
    )

    return movement > this.movementThreshold
  }

  /**
   * Reset calibration history
   */
  reset(): void {
    this.distanceHistory = []
    this.eyePositionHistory = []
  }

  /**
   * Get calibration instructions for user
   */
  getInstructions(result: CalibrationResult): string[] {
    const instructions: string[] = []

    if (!result.isStable) {
      if (Math.abs(result.distance - this.targetDistance) > this.tolerance) {
        if (result.distance < this.targetDistance) {
          instructions.push('Move further away from the screen')
        } else {
          instructions.push('Move closer to the screen')
        }
        instructions.push(`Target distance: ${this.targetDistance}m (Current: ${result.distance.toFixed(2)}m)`)
      }

      if (result.headMovement) {
        instructions.push('Keep your head still')
      }

      if (result.stabilityScore < 0.7) {
        instructions.push('Hold position steady for 2 seconds')
      }
    } else {
      instructions.push('✓ Distance calibrated and stable')
      instructions.push('You can now begin the test')
    }

    return instructions
  }
}

