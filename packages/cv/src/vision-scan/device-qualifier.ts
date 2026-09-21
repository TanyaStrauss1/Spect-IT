/**
 * Device Qualification Module
 * 
 * Assesses device capabilities and environment quality.
 * Determines whether to use sensor-based measurements (full mode)
 * or estimation-based measurements (degraded mode).
 * 
 * Includes hard device check gate that must pass before capture.
 */

import type { DeviceCapability, DeviceQualification, QualityLevel, DeviceCheckRecord } from './types'
import { detectDeviceTier, getDeviceTierInfo } from './device-tier'
import { performDeviceCheck, type PermissionStatus, type StorageInfo } from './device-checker'

export class DeviceQualifier {
  /**
   * Assess device capabilities
   */
  static async assessCapabilities(): Promise<DeviceCapability> {
    // In real implementation, this would query actual device sensors
    // For prototype, we return typical iPhone capabilities
    return {
      hasTrueDepth: false, // Would check for Face ID capable device
      hasLiDAR: false, // Would check for LiDAR scanner (iPad Pro, iPhone Pro)
      hasFrontCamera: true,
      hasGyroscope: true,
      hasAccelerometer: true,
      screenWidth: 390, // Will be replaced with actual dimensions
      screenHeight: 844,
      screenPPI: 460,
    }
  }

  /**
   * Perform hard device check (must pass before capture)
   */
  static async performDeviceCheck(
    capability: DeviceCapability,
    permissions: PermissionStatus,
    storage: StorageInfo,
    calibrationRecordExists: boolean
  ): Promise<DeviceCheckRecord> {
    return performDeviceCheck(capability, permissions, storage, calibrationRecordExists)
  }

  /**
   * Qualify device and environment for vision scan
   */
  static async qualify(
    capability: DeviceCapability,
    videoFrame?: ImageData,
    deviceCheckRecord?: DeviceCheckRecord
  ): Promise<DeviceQualification> {
    const lightingScore = videoFrame ? this.assessLighting(videoFrame) : 50
    const distanceScore = videoFrame ? this.assessDistance(videoFrame) : 50
    const stabilityScore = 75 // Would use IMU data in real implementation

    const overallScore = (lightingScore + distanceScore + stabilityScore) / 3

    let overallQuality: QualityLevel
    if (overallScore >= 80) overallQuality = 'excellent'
    else if (overallScore >= 65) overallQuality = 'good'
    else if (overallScore >= 50) overallQuality = 'acceptable'
    else overallQuality = 'poor'

    // Determine device tier
    const deviceTier = detectDeviceTier(capability)

    // Determine if we can use sensor-based measurements
    const useSensorBasedMeasurements =
      (capability.hasTrueDepth || capability.hasLiDAR) &&
      overallQuality !== 'poor'

    const warnings: string[] = []
    
    // Add device check warnings if check failed
    if (deviceCheckRecord && !deviceCheckRecord.passed) {
      warnings.push('⚠️ Device check failed - some features may be unavailable')
      warnings.push(...deviceCheckRecord.failReasons)
    }
    
    if (!capability.hasTrueDepth && !capability.hasLiDAR) {
      warnings.push(
        'No depth sensor detected. Using estimated measurements (degraded mode).'
      )
    }
    if (lightingScore < 50) {
      warnings.push('Low lighting detected. Please move to a brighter area.')
    }
    if (distanceScore < 50) {
      warnings.push(
        'Face distance suboptimal. Hold device 40-60cm from face.'
      )
    }
    if (overallQuality === 'poor') {
      warnings.push(
        'Poor quality detected. Results will not be treated as clinical data.'
      )
    }

    return {
      timestamp: Date.now(),
      capability,
      lightingScore,
      distanceScore,
      stabilityScore,
      overallQuality,
      useSensorBasedMeasurements,
      warnings,
      deviceCheckRecord,
      deviceTier,
    }
  }

  /**
   * Assess lighting from video frame
   */
  private static assessLighting(frame: ImageData): number {
    // Simplified: calculate mean brightness
    let totalBrightness = 0
    const pixels = frame.data.length / 4

    for (let i = 0; i < frame.data.length; i += 4) {
      const r = frame.data[i]
      const g = frame.data[i + 1]
      const b = frame.data[i + 2]
      const brightness = (r + g + b) / 3
      totalBrightness += brightness
    }

    const meanBrightness = totalBrightness / pixels
    // Optimal range: 80-180 (out of 255)
    if (meanBrightness >= 80 && meanBrightness <= 180) return 100
    if (meanBrightness < 50 || meanBrightness > 220) return 30
    return 60
  }

  /**
   * Assess face distance from frame (simplified)
   */
  private static assessDistance(frame: ImageData): number {
    // In real implementation, would use face size estimation
    // Optimal range: 400-600mm
    // For prototype, return moderate score
    return 70
  }
}
