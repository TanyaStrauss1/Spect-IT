/**
 * Device Tier Classification
 * 
 * Classifies devices into capability tiers for accurate measurement reporting.
 * - Standard: Camera-only mode (face detection + estimation)
 * - Depth: TrueDepth equipped (Face ID devices)
 * - Precision: iPhone 18 Pro+ with variable aperture detection
 * - Clinical: Placeholder for future clinical-grade hardware (not yet available)
 * 
 * IMPORTANT: No tier enables refraction/Rx generation. All tiers are screening-only.
 */

import type { DeviceCapability, DeviceTier, DeviceTierInfo } from './types'

/**
 * Detect device tier based on capabilities
 */
export function detectDeviceTier(capability: DeviceCapability): DeviceTier {
  const { hasTrueDepth, hasLiDAR, deviceModel } = capability
  
  // Clinical tier is placeholder only - no current device qualifies
  // (Would require proprietary stimulus sequencing + dedicated optics)
  
  // Precision tier: iPhone 18 Pro+ signals
  // NOTE: Do NOT claim LiDAR enables refraction - it improves depth only
  if (deviceModel && isPrecisionDevice(deviceModel)) {
    return 'precision'
  }
  
  // Depth tier: TrueDepth or LiDAR sensor
  if (hasTrueDepth || hasLiDAR) {
    return 'depth'
  }
  
  // Standard tier: Camera-only with estimation
  return 'standard'
}

/**
 * Check if device model is precision-capable (iPhone 18 Pro+)
 */
function isPrecisionDevice(deviceModel: string): boolean {
  const model = deviceModel.toLowerCase()
  
  // iPhone 18 Pro and Pro Max
  if (model.includes('iphone') && model.includes('18')) {
    if (model.includes('pro')) {
      return true
    }
  }
  
  // Future precision devices can be added here
  return false
}

/**
 * Get detailed tier information for display
 */
export function getDeviceTierInfo(tier: DeviceTier): DeviceTierInfo {
  switch (tier) {
    case 'precision':
      return {
        tier: 'precision',
        name: 'Precision',
        description: 'iPhone 18 Pro+ with TrueDepth and advanced sensor array',
        capabilities: {
          depthSensor: true,
          variableAperture: true,
          lidar: false, // iPhone 18 Pro uses TrueDepth, not LiDAR
          precisionTracking: true,
        },
        measurementAccuracy: {
          alignment: 'high',
          motility: 'high',
          convergence: 'high',
          pupil: 'high',
        },
      }
    
    case 'depth':
      return {
        tier: 'depth',
        name: 'Depth',
        description: 'TrueDepth or LiDAR equipped device',
        capabilities: {
          depthSensor: true,
          variableAperture: false,
          lidar: false, // May have LiDAR, but not guaranteed
          precisionTracking: false,
        },
        measurementAccuracy: {
          alignment: 'high',
          motility: 'high',
          convergence: 'medium',
          pupil: 'medium',
        },
      }
    
    case 'standard':
      return {
        tier: 'standard',
        name: 'Standard',
        description: 'Camera-only mode with face detection and estimation',
        capabilities: {
          depthSensor: false,
          variableAperture: false,
          lidar: false,
          precisionTracking: false,
        },
        measurementAccuracy: {
          alignment: 'medium',
          motility: 'medium',
          convergence: 'low',
          pupil: 'low',
        },
      }
    
    case 'clinical-placeholder':
      return {
        tier: 'clinical-placeholder',
        name: 'Clinical (Future)',
        description: 'Placeholder for future clinical-grade hardware (not yet available)',
        capabilities: {
          depthSensor: true,
          variableAperture: true,
          lidar: true,
          precisionTracking: true,
        },
        measurementAccuracy: {
          alignment: 'clinical',
          motility: 'clinical',
          convergence: 'clinical',
          pupil: 'clinical',
        },
      }
  }
}

/**
 * Get human-readable measurement method based on tier
 */
export function getMeasurementMethodDescription(tier: DeviceTier): string {
  const tierInfo = getDeviceTierInfo(tier)
  
  switch (tier) {
    case 'precision':
      return 'Sensor-based with advanced depth and tracking (screening-level precision)'
    case 'depth':
      return 'Sensor-based depth measurement (screening-level accuracy)'
    case 'standard':
      return 'Camera + face detection with estimation (screening-level only)'
    case 'clinical-placeholder':
      return 'Clinical-grade measurement (not available - placeholder only)'
  }
}

/**
 * Check if tier supports sensor-based measurements
 */
export function supportsSensorMeasurements(tier: DeviceTier): boolean {
  return tier === 'precision' || tier === 'depth'
}
