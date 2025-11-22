/**
 * Eye Landmark Detection
 * MediaPipe Face Mesh integration for eye region detection
 * Extracts 468 facial landmarks with focus on eye regions
 */

import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'
import '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'

export interface EyeLandmarks {
  leftEye: {
    innerCorner: { x: number; y: number }
    outerCorner: { x: number; y: number }
    top: { x: number; y: number }
    bottom: { x: number; y: number }
    center: { x: number; y: number }
    landmarks: Array<{ x: number; y: number }>
  }
  rightEye: {
    innerCorner: { x: number; y: number }
    outerCorner: { x: number; y: number }
    top: { x: number; y: number }
    bottom: { x: number; y: number }
    center: { x: number; y: number }
    landmarks: Array<{ x: number; y: number }>
  }
  confidence: number
}

export class EyeLandmarkDetector {
  private model: faceLandmarksDetection.FaceLandmarksDetector | null = null
  private video: HTMLVideoElement | null = null
  private isInitialized: boolean = false

  /**
   * Initialize MediaPipe Face Mesh model
   */
  async initialize(): Promise<boolean> {
    try {
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh
      const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshMediaPipeModelConfig = {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        refineLandmarks: true,
        maxFaces: 1
      }

      this.model = await faceLandmarksDetection.createDetector(
        model,
        detectorConfig
      )

      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Eye landmark detector initialization failed:', error)
      return false
    }
  }

  /**
   * Set video element for detection
   */
  setVideo(video: HTMLVideoElement): void {
    this.video = video
  }

  /**
   * Detect eye landmarks from current video frame
   */
  async detect(): Promise<EyeLandmarks | null> {
    if (!this.model || !this.video || !this.isInitialized) {
      return null
    }

    try {
      const faces = await this.model.estimateFaces(this.video, {
        flipHorizontal: false,
        staticImageMode: false
      })

      if (faces.length === 0) {
        return null
      }

      const face = faces[0]
      const keypoints = face.keypoints

      // MediaPipe Face Mesh eye landmark indices
      // Left eye: 33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246
      // Right eye: 362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398

      const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
      const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]

      const leftEye = this.extractEyeLandmarks(keypoints, leftEyeIndices)
      const rightEye = this.extractEyeLandmarks(keypoints, rightEyeIndices)

      return {
        leftEye,
        rightEye,
        confidence: face.box ? face.box.probability[0] : 0.9
      }
    } catch (error) {
      console.error('Eye landmark detection error:', error)
      return null
    }
  }

  /**
   * Extract eye landmarks from keypoints
   */
  private extractEyeLandmarks(
    keypoints: faceLandmarksDetection.Keypoint[],
    indices: number[]
  ): EyeLandmarks['leftEye'] {
    const eyePoints = indices
      .filter(i => i < keypoints.length)
      .map(i => ({
        x: keypoints[i].x,
        y: keypoints[i].y
      }))

    // Find corners and boundaries
    const xs = eyePoints.map(p => p.x)
    const ys = eyePoints.map(p => p.y)

    const innerCorner = eyePoints[0] // First point is typically inner corner
    const outerCorner = eyePoints[eyePoints.length - 1] // Last point is outer corner
    const top = { x: Math.min(...xs), y: Math.min(...ys) }
    const bottom = { x: Math.max(...xs), y: Math.max(...ys) }
    const center = {
      x: xs.reduce((a, b) => a + b, 0) / xs.length,
      y: ys.reduce((a, b) => a + b, 0) / ys.length
    }

    return {
      innerCorner,
      outerCorner,
      top,
      bottom,
      center,
      landmarks: eyePoints
    }
  }

  /**
   * Start continuous detection
   */
  async start(
    onDetect: (landmarks: EyeLandmarks) => void,
    interval: number = 100
  ): Promise<void> {
    const detectLoop = async () => {
      const landmarks = await this.detect()
      if (landmarks) {
        onDetect(landmarks)
      }
      setTimeout(detectLoop, interval)
    }

    detectLoop()
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.model = null
    this.video = null
    this.isInitialized = false
  }
}

