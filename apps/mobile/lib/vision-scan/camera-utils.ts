/**
 * Camera & Face Detection Utilities
 */

import { Camera } from 'expo-camera'
import * as FaceDetector from 'expo-face-detector'

export type FaceBounds = {
  x: number
  y: number
  width: number
  height: number
}

export type EyePosition = {
  x: number
  y: number
}

export type DetectedFace = {
  bounds: FaceBounds
  leftEye?: EyePosition
  rightEye?: EyePosition
  rollAngle?: number
  yawAngle?: number
  smilingProbability?: number
}

/**
 * Request camera permissions
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await Camera.requestCameraPermissionsAsync()
  return status === 'granted'
}

/**
 * Check if camera permission is granted
 */
export async function hasCameraPermission(): Promise<boolean> {
  const { status } = await Camera.getCameraPermissionsAsync()
  return status === 'granted'
}

/**
 * Estimate face distance using IPD or face width
 * 
 * Distance Estimation Methods (in priority order):
 * 1. IPD (Inter-Pupillary Distance) - Most accurate when eye landmarks available
 *    Assumption: Average adult IPD = 63mm (range 54-74mm)
 * 2. Face width - Fallback when IPD unavailable
 *    Assumption: Average adult face width = 140mm (range 120-160mm)
 * 
 * Returns: { distance: number (mm), method: 'ipd' | 'face-width' }
 */
export function estimateFaceDistance(
  faceBounds: FaceBounds,
  imageWidth: number,
  leftEye?: EyePosition,
  rightEye?: EyePosition
): { distance: number; method: 'ipd' | 'face-width' } {
  // Estimate focal length in pixels (typical smartphone front camera ~3-4mm actual focal length)
  // For 640px width, ~35° horizontal FOV: focalLength ≈ width / (2 * tan(FOV/2))
  const focalLengthPx = imageWidth / (2 * Math.tan((35 * Math.PI) / 180 / 2))

  // Method 1: IPD-based (preferred when eye positions available)
  if (leftEye && rightEye) {
    const ipdPx = Math.sqrt(
      Math.pow(rightEye.x - leftEye.x, 2) + 
      Math.pow(rightEye.y - leftEye.y, 2)
    )

    // IPD validation: should be reasonable (20-150px for typical selfie distance)
    if (ipdPx >= 20 && ipdPx <= 150) {
      const averageIPD = 63 // mm
      const distanceMm = (averageIPD * focalLengthPx) / ipdPx

      return {
        distance: Math.max(200, Math.min(1000, distanceMm)),
        method: 'ipd'
      }
    }
  }

  // Method 2: Face width-based (fallback)
  const faceWidthPx = faceBounds.width
  const averageFaceWidth = 140 // mm
  
  if (faceWidthPx >= 50) {
    const distanceMm = (averageFaceWidth * focalLengthPx) / faceWidthPx

    return {
      distance: Math.max(200, Math.min(1000, distanceMm)),
      method: 'face-width'
    }
  }

  // Fallback to safe default
  return { distance: 500, method: 'face-width' }
}

/**
 * Compute gaze deviation from eye positions (simplified)
 */
export function estimateGazeDeviation(
  leftEye: EyePosition | undefined,
  rightEye: EyePosition | undefined,
  faceBounds: FaceBounds,
  targetX: number,
  targetY: number
): { left: number; right: number } {
  // If no eye positions, return zero deviation
  if (!leftEye || !rightEye) {
    return { left: 0, right: 0 }
  }

  // Compute eye positions relative to face center
  const faceCenterX = faceBounds.x + faceBounds.width / 2
  const faceCenterY = faceBounds.y + faceBounds.height / 2

  // Estimate deviation in degrees (very simplified)
  // This is a crude approximation for degraded mode
  const leftDeviation = Math.sqrt(
    Math.pow(leftEye.x - targetX, 2) + Math.pow(leftEye.y - targetY, 2)
  ) / 50 // Rough pixel-to-degree conversion

  const rightDeviation = Math.sqrt(
    Math.pow(rightEye.x - targetX, 2) + Math.pow(rightEye.y - targetY, 2)
  ) / 50

  return {
    left: leftDeviation,
    right: rightDeviation,
  }
}

/**
 * Assess lighting quality from image data (if available)
 */
export function assessLightingQuality(brightness?: number): number {
  // If no brightness data, return moderate score
  if (brightness === undefined) return 60

  // Optimal range: 80-180 (out of 255)
  if (brightness >= 80 && brightness <= 180) return 100
  if (brightness < 50 || brightness > 220) return 30
  return 60
}

/**
 * Compute head pose from face detection
 */
export function computeHeadPose(face: DetectedFace): {
  pitch: number
  yaw: number
  roll: number
} {
  return {
    pitch: 0, // Not available from expo-face-detector
    yaw: face.yawAngle || 0,
    roll: face.rollAngle || 0,
  }
}
