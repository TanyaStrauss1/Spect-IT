/**
 * Hard Device Check Gate
 * 
 * Pre-flight checks that must pass before vision scan modules can proceed.
 * Fail-closed: any failure blocks capture with clear retry UX.
 * 
 * Checks:
 * - Supported sensors (camera required; TrueDepth/ARKit when available)
 * - Permissions (camera, motion sensors)
 * - Storage readiness (sufficient space for session artifacts)
 * - Calibration record (from previous session or new calibration)
 */

import type { DeviceCapability, DeviceCheckRecord, DeviceTier } from './types'
import { detectDeviceTier } from './device-tier'

export interface StorageInfo {
  available: boolean
  availableMB: number
}

export interface PermissionStatus {
  camera: boolean
  motion: boolean
}

/**
 * Minimum storage required for vision scan session (MB)
 */
const MIN_STORAGE_MB = 50

/**
 * Perform comprehensive device check
 */
export async function performDeviceCheck(
  capability: DeviceCapability,
  permissions: PermissionStatus,
  storage: StorageInfo,
  calibrationRecordExists: boolean
): Promise<DeviceCheckRecord> {
  const failReasons: string[] = []
  
  // Check camera (required)
  const cameraOk = capability.hasFrontCamera && permissions.camera
  if (!cameraOk) {
    if (!capability.hasFrontCamera) {
      failReasons.push('Front-facing camera not detected')
    }
    if (!permissions.camera) {
      failReasons.push('Camera permission not granted')
    }
  }
  
  // Check motion sensors (recommended)
  const motionOk = (capability.hasGyroscope && capability.hasAccelerometer) && permissions.motion
  if (!motionOk) {
    if (!capability.hasGyroscope || !capability.hasAccelerometer) {
      failReasons.push('Motion sensors (gyroscope/accelerometer) not available')
    }
    if (!permissions.motion) {
      failReasons.push('Motion sensor permission not granted (recommended for stability tracking)')
    }
  }
  
  // Check storage
  const storageOk = storage.available && storage.availableMB >= MIN_STORAGE_MB
  if (!storageOk) {
    if (!storage.available) {
      failReasons.push('Cannot access device storage')
    } else {
      failReasons.push(`Insufficient storage: ${storage.availableMB.toFixed(0)}MB available, ${MIN_STORAGE_MB}MB required`)
    }
  }
  
  // Check calibration record
  if (!calibrationRecordExists) {
    failReasons.push('No calibration record found - calibration required before capture')
  }
  
  // Detect device tier
  const deviceTier = detectDeviceTier(capability)
  
  // Overall pass/fail
  const passed = failReasons.length === 0
  
  return {
    timestamp: Date.now(),
    deviceId: generateDeviceId(capability),
    passed,
    failReasons,
    sensorChecks: {
      camera: capability.hasFrontCamera,
      trueDepth: capability.hasTrueDepth,
      lidar: capability.hasLiDAR,
      gyroscope: capability.hasGyroscope,
      accelerometer: capability.hasAccelerometer,
    },
    permissionChecks: {
      camera: permissions.camera,
      motion: permissions.motion,
    },
    storageCheck: {
      available: storage.available,
      availableMB: storage.availableMB,
    },
    calibrationRecordExists,
    deviceTier,
  }
}

/**
 * Generate a stable device identifier for record tracking
 */
function generateDeviceId(capability: DeviceCapability): string {
  // In production, this would use a stable device identifier
  // For prototype, use screen dimensions + device model as proxy
  const model = capability.deviceModel || 'unknown'
  const screen = `${capability.screenWidth}x${capability.screenHeight}`
  return `${model}-${screen}-${capability.screenPPI}`
}

/**
 * Get retry instructions based on failure reasons
 */
export function getDeviceCheckRetryInstructions(record: DeviceCheckRecord): string[] {
  const instructions: string[] = []
  
  if (!record.permissionChecks.camera) {
    instructions.push('Grant camera permission in device settings')
  }
  
  if (!record.permissionChecks.motion) {
    instructions.push('Grant motion sensor permission for better stability tracking (recommended)')
  }
  
  if (!record.storageCheck.available || record.storageCheck.availableMB < MIN_STORAGE_MB) {
    instructions.push(`Free up at least ${MIN_STORAGE_MB}MB of storage space`)
  }
  
  if (!record.calibrationRecordExists) {
    instructions.push('Complete eye tracking calibration first')
  }
  
  if (!record.sensorChecks.camera) {
    instructions.push('Device does not have a front-facing camera')
  }
  
  return instructions
}

/**
 * Check if device check can be retried
 */
export function canRetryDeviceCheck(record: DeviceCheckRecord): boolean {
  // Can retry if failures are fixable (permissions, storage)
  // Cannot retry if hardware is missing
  const hardwareFailure = !record.sensorChecks.camera
  return !hardwareFailure
}

/**
 * Format device check record for display
 */
export function formatDeviceCheckSummary(record: DeviceCheckRecord): string {
  if (record.passed) {
    return `✓ Device check passed (${record.deviceTier} tier)`
  }
  
  const failCount = record.failReasons.length
  return `⚠️ Device check failed (${failCount} issue${failCount > 1 ? 's' : ''})`
}
