/**
 * Ocular Motility Tracker
 * 
 * Nine-position gaze sequence with head-vs-eye motion distinction.
 * Rejects frames with excessive head motion.
 */

import type {
  GazePosition,
  MotilityFrame,
  MotilityResult,
} from './types'

export class MotilityTracker {
  private positions: Record<GazePosition, MotilityFrame[]>
  private useSensorData: boolean
  private readonly HEAD_MOTION_THRESHOLD = 5 // degrees/sec
  private readonly HEAD_DISPLACEMENT_THRESHOLD = 50 // mm
  private readonly FACE_CONFIDENCE_THRESHOLD = 0.5
  private readonly MIN_FRAMES_PER_POSITION = 3

  constructor(useSensorData: boolean) {
    this.useSensorData = useSensorData
    this.positions = {
      center: [],
      up: [],
      down: [],
      left: [],
      right: [],
      'up-left': [],
      'up-right': [],
      'down-left': [],
      'down-right': [],
    }
  }

  static getGazeSequence(): GazePosition[] {
    return [
      'center',
      'up',
      'up-right',
      'right',
      'down-right',
      'down',
      'down-left',
      'left',
      'up-left',
      'center',
    ]
  }

  /**
   * Add frame with quality gates:
   * - Face confidence
   * - Head motion limits
   * - Head displacement limits
   */
  addFrame(frame: MotilityFrame, faceConfidence: number = 1.0): void {
    // Gate 1: Face confidence
    if (faceConfidence < this.FACE_CONFIDENCE_THRESHOLD) {
      frame.rejected = true
      frame.quality = Math.min(frame.quality, faceConfidence)
    }

    // Gate 2: Head motion limits
    const maxHeadMotion = Math.max(
      Math.abs(frame.headMotion.pitch),
      Math.abs(frame.headMotion.yaw),
      Math.abs(frame.headMotion.roll)
    )

    if (
      maxHeadMotion > this.HEAD_MOTION_THRESHOLD ||
      frame.headDisplacement > this.HEAD_DISPLACEMENT_THRESHOLD
    ) {
      frame.rejected = true
    }

    this.positions[frame.targetPosition].push(frame)
  }

  computeResult(): MotilityResult {
    // Compute motility profile for each position
    const motilityProfile: Record<
      GazePosition,
      { range: number; smoothness: number }
    > = {} as any

    let hasExcessiveHeadMotion = false
    let insufficientDataPositions: GazePosition[] = []

    for (const position of Object.keys(this.positions) as GazePosition[]) {
      const frames = this.positions[position].filter((f) => !f.rejected)

      // Check if we have minimum frames per position
      if (frames.length < this.MIN_FRAMES_PER_POSITION) {
        insufficientDataPositions.push(position)
        motilityProfile[position] = { range: 0, smoothness: 0 }
        continue
      }

      if (frames.length === 0) {
        motilityProfile[position] = { range: 0, smoothness: 0 }
        continue
      }

      // Check if any frames were rejected (stricter threshold: 25%)
      const totalFrames = this.positions[position].length
      const rejectedFrames = totalFrames - frames.length
      if (rejectedFrames / totalFrames > 0.25) {
        hasExcessiveHeadMotion = true
      }

      // Compute range (simplified: distance from center)
      const ranges = frames
        .map((f) => {
          if (!f.leftEye || !f.rightEye) return 0
          const leftRange = Math.sqrt(f.leftEye.x ** 2 + f.leftEye.y ** 2)
          const rightRange = Math.sqrt(f.rightEye.x ** 2 + f.rightEye.y ** 2)
          return (leftRange + rightRange) / 2
        })
        .filter((r) => r > 0)

      const meanRange = ranges.length > 0 
        ? ranges.reduce((a, b) => a + b, 0) / ranges.length
        : 0

      // Compute smoothness (simplified: inverse of variance)
      const variance =
        ranges.length > 1
          ? ranges.reduce((sum, r) => sum + (r - meanRange) ** 2, 0) / ranges.length
          : 0
      const smoothness = 1 / (1 + variance)

      motilityProfile[position] = {
        range: meanRange,
        smoothness,
      }
    }

    // Screening note with quality feedback
    let screeningNote: string
    if (insufficientDataPositions.length > 0) {
      screeningNote = `Insufficient data for ${insufficientDataPositions.length} position(s). Repeat with face visible throughout sequence.`
    } else if (hasExcessiveHeadMotion) {
      screeningNote =
        'Excessive head motion detected. Results may be limited. Repeat with stable head position recommended.'
    } else {
      const avgRange =
        Object.values(motilityProfile).reduce((sum, p) => sum + p.range, 0) / 9
      if (avgRange > 20) {
        screeningNote = 'Ocular motility appears normal.'
      } else {
        screeningNote =
          'Reduced ocular motility detected. Professional eye examination recommended.'
      }
    }

    return {
      timestamp: Date.now(),
      positions: this.positions,
      motilityProfile,
      excessiveHeadMotion: hasExcessiveHeadMotion,
      screeningNote,
      usedSensorData: this.useSensorData,
    }
  }

  reset(): void {
    for (const position of Object.keys(this.positions) as GazePosition[]) {
      this.positions[position] = []
    }
  }
}
