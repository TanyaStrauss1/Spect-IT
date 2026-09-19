/**
 * Camera Distance Tracker for Visual Acuity Test
 * 
 * Continuously monitors viewing distance using face detection (IPD or face width)
 * Provides real-time distance feedback during acuity testing
 */

import { useRef, useState, useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { Camera, CameraType } from 'expo-camera'
import * as FaceDetector from 'expo-face-detector'
import { 
  estimateFaceDistance, 
  applyEMA, 
  detectFaceFlicker,
  type DetectedFace 
} from '../../lib/vision-scan/camera-utils'

const { width: screenWidth } = Dimensions.get('window')

export type DistanceEstimate = {
  distanceCm: number
  method: 'ipd' | 'face-width'
  confidence: number
  timestamp: number
}

type Props = {
  onDistanceUpdate: (estimate: DistanceEstimate) => void
  minSamples?: number // Minimum samples before reporting
  showOverlay?: boolean // Show visual distance indicator
}

export function CameraDistanceTracker({ 
  onDistanceUpdate, 
  minSamples = 10,
  showOverlay = true 
}: Props) {
  const cameraRef = useRef<Camera>(null)
  const [detectedFace, setDetectedFace] = useState<DetectedFace | null>(null)
  const [currentEstimate, setCurrentEstimate] = useState<DistanceEstimate | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  
  // Temporal smoothing state
  const [distanceEMA, setDistanceEMA] = useState<number | null>(null)
  const [sampleCount, setSampleCount] = useState(0)
  const [faceDetectionHistory, setFaceDetectionHistory] = useState<boolean[]>([])
  const [timestampHistory, setTimestampHistory] = useState<number[]>([])
  
  const BUFFER_SIZE = 5
  const UPDATE_INTERVAL = 100 // ms between updates

  const handleFacesDetected = ({ faces }: { faces: any[] }) => {
    if (!cameraReady) return
    
    const now = Date.now()
    const facePresent = faces.length > 0
    
    // Update detection history
    const newDetectionHistory = [...faceDetectionHistory.slice(-BUFFER_SIZE + 1), facePresent]
    const newTimestampHistory = [...timestampHistory.slice(-BUFFER_SIZE + 1), now]
    setFaceDetectionHistory(newDetectionHistory)
    setTimestampHistory(newTimestampHistory)
    
    if (facePresent) {
      const face = faces[0]
      const detectedFaceData: DetectedFace = {
        bounds: face.bounds,
        leftEye: face.leftEyePosition,
        rightEye: face.rightEyePosition,
        rollAngle: face.rollAngle,
        yawAngle: face.yawAngle,
      }
      
      setDetectedFace(detectedFaceData)
      
      // Check for face flicker - skip if flickering
      if (detectFaceFlicker(newDetectionHistory, newTimestampHistory)) {
        return
      }
      
      // Estimate distance
      const faceDistanceResult = estimateFaceDistance(
        detectedFaceData.bounds,
        screenWidth,
        detectedFaceData.leftEye,
        detectedFaceData.rightEye
      )
      
      // Apply temporal smoothing
      const smoothedDistance = applyEMA(
        faceDistanceResult.distance,
        distanceEMA,
        0.3 // Smooth but responsive
      )
      setDistanceEMA(smoothedDistance)
      setSampleCount(prev => prev + 1)
      
      // Determine confidence based on method and sample count
      const baseConfidence = faceDistanceResult.method === 'ipd' ? 0.75 : 0.65
      const sampleConfidence = Math.min(1, sampleCount / minSamples)
      const confidence = baseConfidence * sampleConfidence
      
      const estimate: DistanceEstimate = {
        distanceCm: Math.round(smoothedDistance / 10), // mm to cm
        method: faceDistanceResult.method,
        confidence,
        timestamp: now,
      }
      
      setCurrentEstimate(estimate)
      
      // Report to parent if we have enough samples
      if (sampleCount >= minSamples) {
        onDistanceUpdate(estimate)
      }
    } else {
      setDetectedFace(null)
    }
  }

  useEffect(() => {
    // Mark camera as ready after mount
    const timer = setTimeout(() => setCameraReady(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const getDistanceQuality = (): 'excellent' | 'good' | 'poor' | 'no-face' => {
    if (!detectedFace) return 'no-face'
    if (!currentEstimate) return 'poor'
    
    const distanceCm = currentEstimate.distanceCm
    
    // Optimal range for acuity testing: 40-60cm
    if (distanceCm >= 40 && distanceCm <= 60 && currentEstimate.method === 'ipd') {
      return 'excellent'
    }
    if (distanceCm >= 35 && distanceCm <= 70) {
      return 'good'
    }
    return 'poor'
  }

  const quality = getDistanceQuality()
  const hasEnoughSamples = sampleCount >= minSamples

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
          minDetectionInterval: UPDATE_INTERVAL,
        }}
      />
      
      {showOverlay && (
        <View style={styles.overlay}>
          {currentEstimate && (
            <View style={[
              styles.distanceBanner,
              quality === 'excellent' && styles.distanceExcellent,
              quality === 'good' && styles.distanceGood,
              quality === 'poor' && styles.distancePoor,
              quality === 'no-face' && styles.distanceNoFace,
            ]}>
              <Text style={styles.distanceText}>
                {quality === 'no-face' 
                  ? '📷 No face detected' 
                  : `📏 ${currentEstimate.distanceCm}cm • ${currentEstimate.method === 'ipd' ? 'IPD' : 'Face'} • ${Math.round(currentEstimate.confidence * 100)}%`
                }
              </Text>
              {!hasEnoughSamples && quality !== 'no-face' && (
                <Text style={styles.calibratingText}>
                  Calibrating... ({sampleCount}/{minSamples})
                </Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 160,
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 8,
  },
  distanceBanner: {
    backgroundColor: 'rgba(55, 65, 81, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  distanceExcellent: {
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
  },
  distanceGood: {
    backgroundColor: 'rgba(59, 130, 246, 0.95)',
  },
  distancePoor: {
    backgroundColor: 'rgba(245, 158, 11, 0.95)',
  },
  distanceNoFace: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
  },
  distanceText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  calibratingText: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
})
