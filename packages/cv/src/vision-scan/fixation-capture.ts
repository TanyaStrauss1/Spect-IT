/**
 * Fixation Capture Session Controller
 * 
 * Collects a short "hold fixation" capture session with synchronized data:
 * - Frames/video (or frame sequence)
 * - Face/depth geometry (when available)
 * - Inertial/motion data
 * - Display state
 * - Quality features
 * 
 * Integrated with ExamController and Quality Guard for evidence collection.
 * All results are screening-only; no diagnosis or Rx claims.
 */

import type {
  FixationCaptureFrame,
  FixationCaptureSession,
  EyePosition,
  DeviceCapability,
} from './types'

export interface FixationCaptureConfig {
  durationMs: number // Target capture duration (e.g., 3000ms)
  targetFrameRate: number // Target fps (e.g., 30)
  minGoodFrames: number // Minimum acceptable good frames (e.g., 50)
}

export const DEFAULT_FIXATION_CONFIG: FixationCaptureConfig = {
  durationMs: 3000, // 3 seconds
  targetFrameRate: 30,
  minGoodFrames: 50, // ~60% of 90 frames at 30fps for 3s
}

export interface FixationCaptureInput {
  timestamp: number
  videoFrame?: {
    width: number
    height: number
    data?: ImageData
  }
  face?: {
    leftEye?: { x: number; y: number; z?: number }
    rightEye?: { x: number; y: number; z?: number }
    depth?: number
  }
  motion?: {
    pitch: number
    yaw: number
    roll: number
    acceleration?: { x: number; y: number; z: number }
  }
  display?: {
    brightness: number
    targetPosition?: { x: number; y: number }
    stimulusType: string
  }
  quality?: {
    faceDetected: boolean
    eyesOpen: boolean
    headMotionScore: number
    lightingScore: number
    occlusionScore: number
  }
}

export class FixationCaptureController {
  private config: FixationCaptureConfig
  private frames: FixationCaptureFrame[] = []
  private startTime: number | null = null
  private useSensorData: boolean
  
  constructor(
    capability: DeviceCapability,
    config: FixationCaptureConfig = DEFAULT_FIXATION_CONFIG
  ) {
    this.config = config
    this.useSensorData = capability.hasTrueDepth || capability.hasLiDAR
  }
  
  /**
   * Start capture session
   */
  start(): void {
    this.startTime = Date.now()
    this.frames = []
  }
  
  /**
   * Add frame to capture session
   */
  addFrame(input: FixationCaptureInput): void {
    if (!this.startTime) {
      throw new Error('Capture session not started')
    }
    
    const frame: FixationCaptureFrame = {
      timestamp: input.timestamp,
      videoFrame: input.videoFrame
        ? {
            width: input.videoFrame.width,
            height: input.videoFrame.height,
            quality: this.computeFrameQuality(input),
          }
        : null,
      faceGeometry: input.face
        ? {
            leftEye: input.face.leftEye
              ? {
                  x: input.face.leftEye.x,
                  y: input.face.leftEye.y,
                  z: input.face.leftEye.z || 0,
                }
              : null,
            rightEye: input.face.rightEye
              ? {
                  x: input.face.rightEye.x,
                  y: input.face.rightEye.y,
                  z: input.face.rightEye.z || 0,
                }
              : null,
            depth: input.face.depth || null,
          }
        : null,
      inertialData: input.motion
        ? {
            pitch: input.motion.pitch,
            yaw: input.motion.yaw,
            roll: input.motion.roll,
            acceleration: input.motion.acceleration || null,
          }
        : null,
      displayState: {
        brightness: input.display?.brightness || 0.5,
        targetPosition: input.display?.targetPosition || null,
        stimulusType: input.display?.stimulusType || 'fixation-target',
      },
      qualityFeatures: input.quality || {
        faceDetected: false,
        eyesOpen: false,
        headMotionScore: 0,
        lightingScore: 0,
        occlusionScore: 0,
      },
    }
    
    this.frames.push(frame)
  }
  
  /**
   * Check if capture is complete
   */
  isComplete(): boolean {
    if (!this.startTime) return false
    
    const elapsed = Date.now() - this.startTime
    return elapsed >= this.config.durationMs
  }
  
  /**
   * Finalize capture session and return result
   */
  finalize(): FixationCaptureSession {
    if (!this.startTime) {
      throw new Error('Capture session not started')
    }
    
    const durationMs = Date.now() - this.startTime
    const goodFrames = this.frames.filter((f) => this.isGoodFrame(f)).length
    const totalFrames = this.frames.length
    const averageQuality =
      this.frames.length > 0
        ? this.frames.reduce((sum, f) => sum + (f.videoFrame?.quality || 0), 0) /
          this.frames.length
        : 0
    
    const screeningNote = this.generateScreeningNote(totalFrames, goodFrames, averageQuality)
    
    return {
      timestamp: this.startTime,
      durationMs,
      frames: this.frames,
      summary: {
        totalFrames,
        goodFrames,
        averageQuality,
        usedSensorData: this.useSensorData,
      },
      screeningNote,
    }
  }
  
  /**
   * Reset capture session
   */
  reset(): void {
    this.startTime = null
    this.frames = []
  }
  
  /**
   * Compute frame quality score
   */
  private computeFrameQuality(input: FixationCaptureInput): number {
    const quality = input.quality
    if (!quality) return 0.5
    
    let score = 0
    
    if (quality.faceDetected) score += 0.3
    if (quality.eyesOpen) score += 0.2
    score += quality.headMotionScore * 0.2
    score += quality.lightingScore * 0.2
    score += (1 - quality.occlusionScore) * 0.1
    
    return Math.max(0, Math.min(1, score))
  }
  
  /**
   * Check if frame meets quality threshold
   */
  private isGoodFrame(frame: FixationCaptureFrame): boolean {
    const quality = frame.videoFrame?.quality || 0
    return (
      quality >= 0.6 &&
      frame.qualityFeatures.faceDetected &&
      frame.qualityFeatures.eyesOpen &&
      frame.qualityFeatures.headMotionScore >= 0.5
    )
  }
  
  /**
   * Generate screening note based on capture quality
   */
  private generateScreeningNote(
    totalFrames: number,
    goodFrames: number,
    averageQuality: number
  ): string {
    if (totalFrames === 0) {
      return 'No frames captured during fixation session.'
    }
    
    if (goodFrames < this.config.minGoodFrames) {
      return `Fixation capture quality insufficient (${goodFrames}/${this.config.minGoodFrames} good frames). Consider retrying with better lighting and head stability.`
    }
    
    const qualityPercent = (averageQuality * 100).toFixed(0)
    
    if (averageQuality >= 0.8) {
      return `High-quality fixation capture (${qualityPercent}% quality, ${goodFrames} good frames).`
    } else if (averageQuality >= 0.6) {
      return `Moderate-quality fixation capture (${qualityPercent}% quality, ${goodFrames} good frames).`
    } else {
      return `Low-quality fixation capture (${qualityPercent}% quality). Professional examination recommended.`
    }
  }
  
  /**
   * Get current capture progress
   */
  getProgress(): {
    elapsed: number
    framesCollected: number
    goodFrames: number
    isComplete: boolean
  } {
    const elapsed = this.startTime ? Date.now() - this.startTime : 0
    const goodFrames = this.frames.filter((f) => this.isGoodFrame(f)).length
    
    return {
      elapsed,
      framesCollected: this.frames.length,
      goodFrames,
      isComplete: this.isComplete(),
    }
  }
}
