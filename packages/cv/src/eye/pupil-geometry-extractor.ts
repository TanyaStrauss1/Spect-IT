/**
 * Pupil + Corneal Geometry Extractor
 * Measures pupil size, corneal curvature, and eye alignment
 */

import { EyeLandmarks } from './eye-landmark-detector'

export interface PupilGeometry {
  /** Pupil diameter in pixels */
  diameter: number
  /** Pupil center coordinates */
  center: { x: number; y: number }
  /** Corneal curvature radius (estimated) */
  cornealCurvature: number
  /** Eye alignment angle in degrees */
  alignmentAngle: number
  /** Inter-pupillary distance in pixels */
  ipd: number
}

export class PupilGeometryExtractor {
  /**
   * Extract pupil geometry from eye landmarks
   */
  extract(landmarks: EyeLandmarks): {
    left: PupilGeometry
    right: PupilGeometry
    combined: {
      averageIPD: number
      alignment: number
    }
  } {
    const left = this.extractPupilFromEye(landmarks.leftEye)
    const right = this.extractPupilFromEye(landmarks.rightEye)

    // Calculate inter-pupillary distance
    const ipd = Math.sqrt(
      Math.pow(right.center.x - left.center.x, 2) +
      Math.pow(right.center.y - left.center.y, 2)
    )

    // Calculate alignment (angle between eyes)
    const alignmentAngle = Math.atan2(
      right.center.y - left.center.y,
      right.center.x - left.center.x
    ) * (180 / Math.PI)

    return {
      left,
      right,
      combined: {
        averageIPD: ipd,
        alignment: alignmentAngle
      }
    }
  }

  /**
   * Extract pupil geometry from single eye
   */
  private extractPupilFromEye(eye: EyeLandmarks['leftEye']): PupilGeometry {
    // Estimate pupil center (center of eye region)
    const center = eye.center

    // Estimate pupil diameter (distance between top and bottom of eye)
    const verticalDistance = Math.sqrt(
      Math.pow(eye.top.x - eye.bottom.x, 2) +
      Math.pow(eye.top.y - eye.bottom.y, 2)
    )

    // Estimate horizontal distance
    const horizontalDistance = Math.sqrt(
      Math.pow(eye.innerCorner.x - eye.outerCorner.x, 2) +
      Math.pow(eye.innerCorner.y - eye.outerCorner.y, 2)
    )

    // Average for diameter estimate
    const diameter = (verticalDistance + horizontalDistance) / 2

    // Estimate corneal curvature (simplified - would use more sophisticated method)
    // Typical corneal curvature: ~7.8mm radius
    // We estimate based on eye opening size
    const cornealCurvature = diameter * 0.052 // Approximate conversion

    // Calculate alignment angle (rotation of eye)
    const alignmentAngle = Math.atan2(
      eye.outerCorner.y - eye.innerCorner.y,
      eye.outerCorner.x - eye.innerCorner.x
    ) * (180 / Math.PI)

    return {
      diameter,
      center,
      cornealCurvature,
      alignmentAngle,
      ipd: 0 // Will be calculated at combined level
    }
  }

  /**
   * Convert pixel measurements to real-world measurements
   */
  convertToRealWorld(
    geometry: PupilGeometry,
    distance: number, // Distance from camera in meters
    focalLength: number = 3.6e-3, // Typical phone camera focal length in meters
    sensorWidth: number = 4.8e-3 // Typical sensor width in meters
  ): {
    diameterMM: number
    ipdMM: number
  } {
    // Convert pixel to real-world using camera calibration
    const pixelToMeter = (distance * sensorWidth) / (focalLength * 640) // Assuming 640px width

    return {
      diameterMM: geometry.diameter * pixelToMeter * 1000, // Convert to mm
      ipdMM: geometry.ipd * pixelToMeter * 1000
    }
  }
}

