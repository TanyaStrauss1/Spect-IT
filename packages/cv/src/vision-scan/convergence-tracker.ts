/**
 * Dynamic Convergence Tracker
 * 
 * Guided phone approach/recede while fixating on screen target.
 * Measures distance vs binocular convergence curve.
 */

import type { ConvergenceFrame, ConvergenceResult } from './types'

export class ConvergenceTracker {
  private approachFrames: ConvergenceFrame[] = []
  private recedeFrames: ConvergenceFrame[] = []
  private useSensorData: boolean
  private phase: 'approach' | 'recede' = 'approach'

  constructor(useSensorData: boolean) {
    this.useSensorData = useSensorData
  }

  setPhase(phase: 'approach' | 'recede'): void {
    this.phase = phase
  }

  addFrame(frame: ConvergenceFrame): void {
    if (this.phase === 'approach') {
      this.approachFrames.push(frame)
    } else {
      this.recedeFrames.push(frame)
    }
  }

  computeResult(): ConvergenceResult {
    // Combine all frames to build convergence curve
    const allFrames = [...this.approachFrames, ...this.recedeFrames]
      .filter((f) => f.vergenceAngle !== null && f.quality > 0.5)
      .sort((a, b) => a.faceDistance - b.faceDistance)

    // Build convergence curve
    const convergenceCurve: { distance: number; vergence: number }[] = []
    for (const frame of allFrames) {
      if (frame.vergenceAngle !== null) {
        convergenceCurve.push({
          distance: frame.faceDistance,
          vergence: frame.vergenceAngle,
        })
      }
    }

    // Find near point of convergence (where vergence angle stops increasing)
    let nearPoint: number | null = null
    if (convergenceCurve.length > 10) {
      const approachCurve = convergenceCurve.filter(
        (_, i) => i < convergenceCurve.length / 2
      )
      const maxVergence = Math.max(...approachCurve.map((c) => c.vergence))
      const nearPointFrame = approachCurve.find(
        (c) => c.vergence >= maxVergence * 0.95
      )
      if (nearPointFrame) {
        nearPoint = nearPointFrame.distance
      }
    }

    // Screening note
    let screeningNote: string
    if (nearPoint === null) {
      screeningNote = 'Insufficient data for convergence assessment.'
    } else if (nearPoint < 60) {
      screeningNote = 'Convergence function appears normal.'
    } else if (nearPoint < 100) {
      screeningNote =
        'Convergence insufficiency may be present. Professional eye examination recommended if symptoms present.'
    } else {
      screeningNote =
        'Convergence difficulty detected. Professional eye examination recommended.'
    }

    return {
      timestamp: Date.now(),
      approachFrames: this.approachFrames,
      recedeFrames: this.recedeFrames,
      nearPoint,
      convergenceCurve,
      screeningNote,
      usedSensorData: this.useSensorData,
    }
  }

  reset(): void {
    this.approachFrames = []
    this.recedeFrames = []
    this.phase = 'approach'
  }
}
