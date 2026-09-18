/**
 * Camera Depth Estimation Fallback
 * Monocular depth estimation when LiDAR unavailable
 * Works on all devices with front-facing camera
 * 
 * Distance Estimation Methods:
 * 1. IPD (Inter-Pupillary Distance) - Most accurate when eye landmarks available
 *    Assumption: Average adult IPD = 63mm (range 54-74mm)
 * 2. Face width - Fallback when IPD unavailable
 *    Assumption: Average adult face width = 140mm (range 120-160mm)
 * 
 * Both use pinhole camera model: distance = (real_size * focal_length) / pixel_size
 */

import { DepthReading } from '../lidar/lidar-detector'

export interface CameraDepthConfig {
  /** Use face size estimation */
  useFaceSize: boolean
  /** Use motion parallax */
  useMotionParallax: boolean
  /** Calibration distance in meters */
  calibrationDistance: number
  /** Average adult IPD in mm (default 63) */
  averageIPD: number
  /** Average adult face width in mm (default 140) */
  averageFaceWidth: number
}

export class CameraDepthEstimator {
  private config: CameraDepthConfig
  private video: HTMLVideoElement | null = null
  private stream: MediaStream | null = null
  private faceSizeBaseline: number = 0
  private motionFrames: Array<{ timestamp: number; features: any[] }> = []

  constructor(config: Partial<CameraDepthConfig> = {}) {
    this.config = {
      useFaceSize: true,
      useMotionParallax: true,
      calibrationDistance: 2.0, // Standard test distance
      averageIPD: 63, // mm
      averageFaceWidth: 140, // mm
      ...config
    }
  }

  /**
   * Initialize camera stream
   */
  async initialize(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })

      this.video = document.createElement('video')
      this.video.srcObject = this.stream
      this.video.play()

      // Calibrate face size at known distance
      if (this.config.useFaceSize) {
        await this.calibrateFaceSize()
      }

      return true
    } catch (error) {
      console.error('Camera depth estimation initialization failed:', error)
      return false
    }
  }

  /**
   * Calibrate face size at known distance
   */
  private async calibrateFaceSize(): Promise<void> {
    // Wait for video to be ready
    await new Promise(resolve => {
      if (this.video) {
        this.video.onloadedmetadata = resolve
      }
    })

    // Detect face and measure size
    // This would use face detection API
    // For now, placeholder
    this.faceSizeBaseline = 150 // pixels at 2m distance
  }

  /**
   * Estimate distance using IPD (Inter-Pupillary Distance)
   * Most accurate method when eye landmarks are available
   * Returns null if eye positions unavailable
   */
  estimateDistanceFromIPD(
    leftEye: { x: number; y: number } | null,
    rightEye: { x: number; y: number } | null,
    focalLengthPx: number
  ): { distance: number; method: 'ipd' } | null {
    if (!leftEye || !rightEye) return null

    // Calculate IPD in pixels
    const ipdPx = Math.sqrt(
      Math.pow(rightEye.x - leftEye.x, 2) + 
      Math.pow(rightEye.y - leftEye.y, 2)
    )

    if (ipdPx < 10) return null // Too small, likely bad detection

    // Pinhole camera model: distance = (real_IPD * focal_length) / pixel_IPD
    // Convert to meters
    const distanceM = (this.config.averageIPD * focalLengthPx) / (ipdPx * 1000)

    return {
      distance: Math.max(0.3, Math.min(2.0, distanceM)),
      method: 'ipd'
    }
  }

  /**
   * Estimate distance using face width
   * Fallback method when eye landmarks unavailable
   */
  estimateDistanceFromFace(
    faceWidthPx: number,
    focalLengthPx: number
  ): { distance: number; method: 'face-width' } {
    if (faceWidthPx < 20) {
      // Face too small, use default
      return { distance: this.config.calibrationDistance, method: 'face-width' }
    }

    // Pinhole camera model: distance = (real_width * focal_length) / pixel_width
    // Convert to meters
    const distanceM = (this.config.averageFaceWidth * focalLengthPx) / (faceWidthPx * 1000)

    return {
      distance: Math.max(0.3, Math.min(2.0, distanceM)),
      method: 'face-width'
    }
  }

  /**
   * Estimate distance using motion parallax
   */
  estimateDistanceFromMotion(): number {
    if (!this.config.useMotionParallax || this.motionFrames.length < 2) {
      return this.config.calibrationDistance
    }

    // Track feature movement between frames
    // Closer objects move more (parallax effect)
    // This is a simplified implementation
    
    return this.config.calibrationDistance
  }

  /**
   * Get current distance estimate
   */
  async getDistance(): Promise<DepthReading> {
    let distance = this.config.calibrationDistance
    let confidence = 0.5

    if (this.config.useFaceSize) {
      const faceDistance = this.estimateDistanceFromFace()
      distance = faceDistance
      confidence = 0.6
    }

    if (this.config.useMotionParallax) {
      const motionDistance = this.estimateDistanceFromMotion()
      // Average both estimates
      distance = (distance + motionDistance) / 2
      confidence = 0.7
    }

    return {
      distance,
      confidence,
      timestamp: Date.now(),
      deviceType: 'camera'
    }
  }

  /**
   * Stop camera stream
   */
  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    this.video = null
    this.motionFrames = []
  }
}

