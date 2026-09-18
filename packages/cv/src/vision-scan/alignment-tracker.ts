/**
 * Resting Alignment Tracker
 * 
 * Captures multi-frame eye alignment at central fixation.
 * Reports screening-language results (no diagnoses).
 */

import type { AlignmentFrame, AlignmentResult } from './types'

export class AlignmentTracker {
  private frames: AlignmentFrame[] = []
  private useSensorData: boolean
  private readonly MIN_FRAMES = 20
  private readonly MIN_GOOD_FRAMES = 12
  private readonly QUALITY_THRESHOLD = 0.6
  private readonly HEAD_MOTION_LIMIT = 3 // degrees/sec
  private lastFacePosition: { x: number; y: number; width: number } | null = null

  constructor(useSensorData: boolean) {
    this.useSensorData = useSensorData
  }

  /**
   * Add frame with quality gates:
   * - Face confidence check (quality > threshold)
   * - Bbox stability check (face position shouldn't jump)
   * - Head motion limits
   */
  addFrame(
    frame: AlignmentFrame,
    faceBounds?: { x: number; y: number; width: number }
  ): boolean {
    // Gate 1: Face confidence
    if (frame.quality < this.QUALITY_THRESHOLD) {
      return false // Reject low-quality frame
    }

    // Gate 2: Head motion limits
    const headMotion = Math.max(
      Math.abs(frame.headPose.pitch),
      Math.abs(frame.headPose.yaw),
      Math.abs(frame.headPose.roll)
    )
    if (headMotion > this.HEAD_MOTION_LIMIT) {
      return false // Reject excessive head motion
    }

    // Gate 3: Bbox stability (face shouldn't jump more than 20% of width)
    if (faceBounds && this.lastFacePosition) {
      const xDiff = Math.abs(faceBounds.x - this.lastFacePosition.x)
      const widthChange = Math.abs(faceBounds.width - this.lastFacePosition.width)
      
      if (xDiff > this.lastFacePosition.width * 0.2 || 
          widthChange > this.lastFacePosition.width * 0.2) {
        return false // Reject unstable face detection
      }
    }

    this.frames.push(frame)
    if (faceBounds) {
      this.lastFacePosition = faceBounds
    }
    return true
  }

  computeResult(): AlignmentResult {
    if (this.frames.length < this.MIN_FRAMES) {
      return {
        timestamp: Date.now(),
        frames: this.frames,
        meanDeviation: { left: 0, right: 0 },
        alignmentIndex: 0,
        screeningNote: `Insufficient frames captured (${this.frames.length}/${this.MIN_FRAMES}). Ensure face is visible and head is stable.`,
        usedSensorData: this.useSensorData,
      }
    }

    // Filter high-quality frames
    const goodFrames = this.frames.filter((f) => f.quality > this.QUALITY_THRESHOLD)

    if (goodFrames.length < this.MIN_GOOD_FRAMES) {
      return {
        timestamp: Date.now(),
        frames: this.frames,
        meanDeviation: { left: 0, right: 0 },
        alignmentIndex: 0,
        screeningNote: `Insufficient high-quality frames (${goodFrames.length}/${this.MIN_GOOD_FRAMES}). Repeat with better lighting and stable head position.`,
        usedSensorData: this.useSensorData,
      }
    }

    // Compute mean deviation from center
    const leftDeviations = goodFrames
      .map((f) => f.gazeDeviation.left)
      .filter((d) => !isNaN(d))
    const rightDeviations = goodFrames
      .map((f) => f.gazeDeviation.right)
      .filter((d) => !isNaN(d))

    const meanDeviation = {
      left:
        leftDeviations.length > 0
          ? leftDeviations.reduce((a, b) => a + b, 0) / leftDeviations.length
          : 0,
      right:
        rightDeviations.length > 0
          ? rightDeviations.reduce((a, b) => a + b, 0) / rightDeviations.length
          : 0,
    }

    // Compute alignment index (0-100)
    const maxDeviation = Math.max(
      Math.abs(meanDeviation.left),
      Math.abs(meanDeviation.right)
    )
    const alignmentIndex = Math.max(0, 100 - maxDeviation * 10)

    // Screening note (no diagnoses)
    let screeningNote: string
    if (alignmentIndex >= 85) {
      screeningNote = 'No significant alignment deviation detected.'
    } else if (alignmentIndex >= 70) {
      screeningNote =
        'Minor alignment variation detected. Consider professional assessment if symptoms present.'
    } else {
      screeningNote =
        'Alignment variation detected. Professional eye examination recommended.'
    }

    return {
      timestamp: Date.now(),
      frames: this.frames,
      meanDeviation,
      alignmentIndex,
      screeningNote,
      usedSensorData: this.useSensorData,
    }
  }

  reset(): void {
    this.frames = []
  }
}
