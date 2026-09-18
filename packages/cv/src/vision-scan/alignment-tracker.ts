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

  constructor(useSensorData: boolean) {
    this.useSensorData = useSensorData
  }

  addFrame(frame: AlignmentFrame): void {
    this.frames.push(frame)
  }

  computeResult(): AlignmentResult {
    if (this.frames.length < 10) {
      return {
        timestamp: Date.now(),
        frames: this.frames,
        meanDeviation: { left: 0, right: 0 },
        alignmentIndex: 0,
        screeningNote: 'Insufficient data for alignment assessment.',
        usedSensorData: this.useSensorData,
      }
    }

    // Filter high-quality frames
    const goodFrames = this.frames.filter((f) => f.quality > 0.6)

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
