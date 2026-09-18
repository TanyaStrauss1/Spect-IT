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
 * Estimate face distance from face bounds size
 * Assumes average face width of 140mm and typical smartphone camera FOV
 */
export function estimateFaceDistance(faceBounds: FaceBounds, imageWidth: number): number {
  // Simplified estimation: larger face in frame = closer distance
  // This is a rough approximation for degraded mode
  const faceFractionOfImage = faceBounds.width / imageWidth
  
  // Typical selfie distance is 400-600mm
  // When face is ~40% of frame width, distance is ~400mm
  // When face is ~20% of frame width, distance is ~800mm
  const estimatedDistance = 400 / (faceFractionOfImage / 0.4)
  
  return Math.max(200, Math.min(1000, estimatedDistance))
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
