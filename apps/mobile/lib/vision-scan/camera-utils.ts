/**
 * Camera & Face Detection Utilities
 * Includes temporal smoothing to avoid one-frame spikes
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

// ============================================================================
// Temporal Smoothing (EMA & Median Filters)
// ============================================================================

/**
 * Exponential Moving Average (EMA) for single values
 * Smooths face bounds, IPD, head pose to avoid one-frame spikes
 * 
 * @param currentValue - New measurement
 * @param previousEMA - Previous EMA value (null for first frame)
 * @param alpha - Smoothing factor (0-1, lower = more smoothing, default 0.3)
 * @returns Smoothed value
 */
export function applyEMA(
  currentValue: number,
  previousEMA: number | null,
  alpha: number = 0.3
): number {
  if (previousEMA === null) return currentValue
  return alpha * currentValue + (1 - alpha) * previousEMA
}

/**
 * Median filter for rejecting outliers
 * Useful for detecting flicker: if face detection rapidly on/off, reject burst
 * 
 * @param values - Recent values (e.g. last 5 frames)
 * @returns Median value
 */
export function medianFilter(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

/**
 * Detect rapid face detection flicker (on/off/on pattern)
 * If face detection flickers rapidly (>3 transitions in 1 second), reject burst
 * 
 * @param detectionHistory - Boolean array of recent detections (true = face present)
 * @param timestampHistory - Timestamps of recent frames (milliseconds)
 * @returns true if flickering detected
 */
export function detectFaceFlicker(
  detectionHistory: boolean[],
  timestampHistory: number[]
): boolean {
  if (detectionHistory.length < 5) return false

  // Count transitions (true->false or false->true)
  let transitions = 0
  for (let i = 1; i < detectionHistory.length; i++) {
    if (detectionHistory[i] !== detectionHistory[i - 1]) {
      transitions++
    }
  }

  // Check if transitions happened within 1 second
  const timeSpan = timestampHistory[timestampHistory.length - 1] - timestampHistory[0]
  const transitionsPerSecond = (transitions / timeSpan) * 1000

  // Threshold: >3 transitions per second = flicker
  return transitionsPerSecond > 3
}

// ============================================================================
// Camera & Permissions
// ============================================================================

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
 * Compute gaze deviation from eye positions using eye landmarks relative to face
 * 
 * Improved method:
 * 1. Normalize eye positions relative to face bounds (0-1 range)
 * 2. Compare to target position (also normalized)
 * 3. Convert pixel deviation to degrees using face width as reference
 * 
 * Assumption: At typical selfie distance (40-60cm), face width ~140mm corresponds to ~25-30° FOV
 */
export function estimateGazeDeviation(
  leftEye: EyePosition | undefined,
  rightEye: EyePosition | undefined,
  faceBounds: FaceBounds,
  targetX: number,
  targetY: number
): { left: number; right: number } {
  // If no eye positions, use face center as fallback
  const faceCenterX = faceBounds.x + faceBounds.width / 2
  const faceCenterY = faceBounds.y + faceBounds.height / 2

  const leftEyeX = leftEye?.x ?? faceCenterX
  const leftEyeY = leftEye?.y ?? faceCenterY
  const rightEyeX = rightEye?.x ?? faceCenterX
  const rightEyeY = rightEye?.y ?? faceCenterY

  // Normalize eye positions relative to face bounds (0-1)
  const leftEyeNormX = (leftEyeX - faceBounds.x) / faceBounds.width
  const leftEyeNormY = (leftEyeY - faceBounds.y) / faceBounds.height
  const rightEyeNormX = (rightEyeX - faceBounds.x) / faceBounds.width
  const rightEyeNormY = (rightEyeY - faceBounds.y) / faceBounds.height

  // Compute target position relative to face
  // (gaze deviation is eye position offset from where eyes should point to hit target)
  const targetRelativeX = (targetX - faceCenterX) / faceBounds.width
  const targetRelativeY = (targetY - faceCenterY) / faceBounds.height

  // Compute normalized deviations
  const leftDeviationNormX = leftEyeNormX - 0.5 - targetRelativeX
  const leftDeviationNormY = leftEyeNormY - 0.4 - targetRelativeY // 0.4 = typical eye Y position in face
  const rightDeviationNormX = rightEyeNormX - 0.5 - targetRelativeX
  const rightDeviationNormY = rightEyeNormY - 0.4 - targetRelativeY

  // Convert to degrees using face width as angular reference
  // Assumption: Face width ~140mm at 500mm distance = ~16° visual angle
  const pixelToDegree = 16 / faceBounds.width // degrees per pixel

  const leftDeviationPx = Math.sqrt(
    Math.pow(leftDeviationNormX * faceBounds.width, 2) +
    Math.pow(leftDeviationNormY * faceBounds.height, 2)
  )
  const rightDeviationPx = Math.sqrt(
    Math.pow(rightDeviationNormX * faceBounds.width, 2) +
    Math.pow(rightDeviationNormY * faceBounds.height, 2)
  )

  return {
    left: leftDeviationPx * pixelToDegree,
    right: rightDeviationPx * pixelToDegree,
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
 * Estimate vergence angle from IPD change or face-width change
 * 
 * Vergence Methods (in priority order):
 * 1. IPD pixel change (preferred) - More accurate, direct measure of eye separation
 * 2. Face-width pixel change (fallback) - Less accurate but available when landmarks poor
 * 
 * Assumption: Vergence angle ≈ (real_IPD / distance)
 * As distance decreases, vergence increases (eyes converge)
 * 
 * Returns: { vergenceAngle: degrees, method: 'ipd-change' | 'face-width-change' }
 */
export function estimateVergence(
  currentLeftEye: EyePosition | undefined,
  currentRightEye: EyePosition | undefined,
  currentFaceBounds: FaceBounds,
  baselineIPD: number | null, // baseline IPD in pixels at reference distance
  baselineFaceWidth: number | null // baseline face width in pixels
): { vergenceAngle: number; method: 'ipd-change' | 'face-width-change' } | null {
  // Method 1: IPD change (preferred)
  if (currentLeftEye && currentRightEye && baselineIPD && baselineIPD > 0) {
    const currentIPD = Math.sqrt(
      Math.pow(currentRightEye.x - currentLeftEye.x, 2) +
      Math.pow(currentRightEye.y - currentLeftEye.y, 2)
    )

    if (currentIPD > 10) { // Validity check
      // Larger IPD = closer distance = more convergence
      // Approximate vergence angle from IPD ratio
      // Real IPD = 63mm, at 500mm distance, vergence ≈ 7.2°
      const ipdRatio = currentIPD / baselineIPD
      const baselineVergence = 7.2 // degrees at 500mm
      const vergenceAngle = baselineVergence * ipdRatio

      return {
        vergenceAngle,
        method: 'ipd-change'
      }
    }
  }

  // Method 2: Face-width change (fallback)
  if (baselineFaceWidth && baselineFaceWidth > 0) {
    const currentFaceWidth = currentFaceBounds.width
    
    if (currentFaceWidth > 50) { // Validity check
      const widthRatio = currentFaceWidth / baselineFaceWidth
      const baselineVergence = 7.2 // degrees at 500mm
      const vergenceAngle = baselineVergence * widthRatio

      return {
        vergenceAngle,
        method: 'face-width-change'
      }
    }
  }

  return null
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
