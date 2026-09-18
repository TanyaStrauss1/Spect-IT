/**
 * Resting Alignment / Central Fixation Screen with Live Camera
 */

import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { Camera, CameraType } from 'expo-camera'
import * as FaceDetector from 'expo-face-detector'
import { AlignmentTracker, type AlignmentFrame, type AlignmentResult } from '@spect-it/cv'
import { useVisionScan } from '../../lib/vision-scan/vision-scan-context'
import {
  type DetectedFace,
  computeHeadPose,
  estimateFaceDistance,
  estimateGazeDeviation,
  applyEMA,
  detectFaceFlicker,
} from '../../lib/vision-scan/camera-utils'
import { ProgressStepper } from '../../components/vision-scan/ProgressStepper'
import { CameraRecovery } from '../../components/vision-scan/CameraRecovery'
import { FaceHoldCoaching, type FaceHoldStatus } from '../../components/vision-scan/FaceHoldCoaching'
import { DegradedModeBanner } from '../../components/vision-scan/DegradedModeBanner'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function AlignmentScreen() {
  const { deviceQualification, setAlignment, recordRepeatAttempt } = useVisionScan()
  const [tracker] = useState(() => new AlignmentTracker(deviceQualification?.useSensorBasedMeasurements || false))
  const [frameCount, setFrameCount] = useState(0)
  const [isCapturing, setIsCapturing] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [result, setResult] = useState<AlignmentResult | null>(null)
  const [detectedFace, setDetectedFace] = useState<DetectedFace | null>(null)
  const [cameraError, setCameraError] = useState<'camera-unavailable' | 'camera-error' | null>(null)
  const cameraRef = useRef<Camera>(null)
  const targetFrames = 30
  const faceLostTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Temporal smoothing state
  const [faceBoundsEMA, setFaceBoundsEMA] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [ipdEMA, setIpdEMA] = useState<number | null>(null)
  const [headPoseEMA, setHeadPoseEMA] = useState<{ pitch: number; yaw: number; roll: number } | null>(null)
  const [faceDetectionHistory, setFaceDetectionHistory] = useState<boolean[]>([])
  const [timestampHistory, setTimestampHistory] = useState<number[]>([])
  const FRAME_BUFFER_SIZE = 8

  useEffect(() => {
    if (isCapturing && !isPaused && frameCount < targetFrames && detectedFace) {
      const interval = setInterval(() => {
        captureFrame()
      }, 100)

      return () => clearInterval(interval)
    } else if (frameCount >= targetFrames && isCapturing) {
      const alignmentResult = tracker.computeResult()
      setResult(alignmentResult)
      setAlignment(alignmentResult)
      setIsCapturing(false)
    }
  }, [isCapturing, isPaused, frameCount, detectedFace])

  const handleFacesDetected = ({ faces }: { faces: any[] }) => {
    if (faces.length > 0) {
      const face = faces[0]
      setDetectedFace({
        bounds: face.bounds,
        leftEye: face.leftEyePosition,
        rightEye: face.rightEyePosition,
        rollAngle: face.rollAngle,
        yawAngle: face.yawAngle,
      })
      
      // Resume if was paused
      if (isPaused) {
        setIsPaused(false)
      }
      
      // Clear any face-lost timeout
      if (faceLostTimeoutRef.current) {
        clearTimeout(faceLostTimeoutRef.current)
        faceLostTimeoutRef.current = null
      }
    } else {
      setDetectedFace(null)
      
      // Pause capture after 1 second of no face
      if (!isPaused && !faceLostTimeoutRef.current) {
        faceLostTimeoutRef.current = setTimeout(() => {
          setIsPaused(true)
        }, 1000)
      }
    }
  }
  
  const computeFaceHoldStatus = (): FaceHoldStatus => {
    if (!detectedFace) return 'no-face'
    
    // Check distance
    const faceWidth = detectedFace.bounds.width
    if (faceWidth < screenWidth * 0.25) return 'too-far'
    if (faceWidth > screenWidth * 0.6) return 'too-close'
    
    // Check centering
    const faceCenterX = detectedFace.bounds.x + detectedFace.bounds.width / 2
    const faceCenterY = detectedFace.bounds.y + detectedFace.bounds.height / 2
    const screenCenterX = screenWidth / 2
    const screenCenterY = screenHeight / 2
    
    const xOffset = Math.abs(faceCenterX - screenCenterX)
    const yOffset = Math.abs(faceCenterY - screenCenterY)
    
    if (xOffset > screenWidth * 0.25 || yOffset > screenHeight * 0.25) {
      return 'off-center'
    }
    
    // Check head pose stability
    if (headPoseEMA) {
      if (Math.abs(headPoseEMA.yaw) > 20 || Math.abs(headPoseEMA.roll) > 20) {
        return 'head-motion'
      }
    }
    
    // Excellent if large, centered, stable
    if (faceWidth > screenWidth * 0.4 && xOffset < screenWidth * 0.1 && yOffset < screenHeight * 0.1) {
      return 'excellent'
    }
    
    return 'good'
  }

  const captureFrame = () => {
    if (!detectedFace) {
      // Track detection history for flicker detection
      const now = Date.now()
      setFaceDetectionHistory(prev => [...prev.slice(-FRAME_BUFFER_SIZE + 1), false])
      setTimestampHistory(prev => [...prev.slice(-FRAME_BUFFER_SIZE + 1), now])
      return
    }

    const now = Date.now()
    
    // Update detection history
    const newDetectionHistory = [...faceDetectionHistory.slice(-FRAME_BUFFER_SIZE + 1), true]
    const newTimestampHistory = [...timestampHistory.slice(-FRAME_BUFFER_SIZE + 1), now]
    setFaceDetectionHistory(newDetectionHistory)
    setTimestampHistory(newTimestampHistory)

    // Check for face flicker - reject frame if flickering
    if (detectFaceFlicker(newDetectionHistory, newTimestampHistory)) {
      console.log('Face flicker detected, skipping frame')
      return
    }

    // Apply EMA smoothing to face bounds
    const smoothedBounds = {
      x: applyEMA(detectedFace.bounds.x, faceBoundsEMA?.x ?? null, 0.3),
      y: applyEMA(detectedFace.bounds.y, faceBoundsEMA?.y ?? null, 0.3),
      width: applyEMA(detectedFace.bounds.width, faceBoundsEMA?.width ?? null, 0.3),
      height: applyEMA(detectedFace.bounds.height, faceBoundsEMA?.height ?? null, 0.3),
    }
    setFaceBoundsEMA(smoothedBounds)

    // Apply EMA smoothing to IPD if eye landmarks available
    let smoothedIPD: number | null = null
    if (detectedFace.leftEye && detectedFace.rightEye) {
      const currentIPD = Math.sqrt(
        Math.pow(detectedFace.rightEye.x - detectedFace.leftEye.x, 2) +
        Math.pow(detectedFace.rightEye.y - detectedFace.leftEye.y, 2)
      )
      smoothedIPD = applyEMA(currentIPD, ipdEMA, 0.3)
      setIpdEMA(smoothedIPD)
    }

    // Apply EMA smoothing to head pose
    const rawHeadPose = computeHeadPose(detectedFace)
    const smoothedHeadPose = {
      pitch: applyEMA(rawHeadPose.pitch, headPoseEMA?.pitch ?? null, 0.3),
      yaw: applyEMA(rawHeadPose.yaw, headPoseEMA?.yaw ?? null, 0.3),
      roll: applyEMA(rawHeadPose.roll, headPoseEMA?.roll ?? null, 0.3),
    }
    setHeadPoseEMA(smoothedHeadPose)

    const targetX = screenWidth / 2
    const targetY = screenHeight / 2

    // Use smoothed bounds for gaze deviation
    const gazeDeviation = estimateGazeDeviation(
      detectedFace.leftEye,
      detectedFace.rightEye,
      smoothedBounds,
      targetX,
      targetY
    )

    // Use smoothed bounds for distance estimation
    const faceDistanceResult = estimateFaceDistance(
      smoothedBounds,
      screenWidth,
      detectedFace.leftEye,
      detectedFace.rightEye
    )

    // Estimate eye positions in 3D (simplified)
    const faceCenterX = detectedFace.bounds.x + detectedFace.bounds.width / 2
    const leftEyeX = (detectedFace.leftEye?.x || faceCenterX - 20) - targetX
    const leftEyeY = (detectedFace.leftEye?.y || detectedFace.bounds.y + detectedFace.bounds.height * 0.4) - targetY
    const rightEyeX = (detectedFace.rightEye?.x || faceCenterX + 20) - targetX
    const rightEyeY = (detectedFace.rightEye?.y || detectedFace.bounds.y + detectedFace.bounds.height * 0.4) - targetY

    // Convert pixel deviations to approximate degrees (rough estimate)
    const pixelToDegree = 0.05 // Approximate conversion factor

    // Quality based on smoothed face size and stability
    const faceQuality = smoothedBounds.width > screenWidth * 0.25 ? 0.8 : 0.5
    const stabilityPenalty = Math.abs(smoothedHeadPose.yaw) > 15 || Math.abs(smoothedHeadPose.roll) > 15 ? 0.2 : 0
    const adjustedQuality = Math.max(0.3, faceQuality - stabilityPenalty)

    const frame: AlignmentFrame = {
      timestamp: now,
      leftEye: {
        x: leftEyeX * pixelToDegree,
        y: leftEyeY * pixelToDegree,
        z: faceDistanceResult.distance,
      },
      rightEye: {
        x: rightEyeX * pixelToDegree,
        y: rightEyeY * pixelToDegree,
        z: faceDistanceResult.distance,
      },
      headPose: smoothedHeadPose,
      faceDistance: faceDistanceResult.distance,
      gazeDeviation,
      quality: adjustedQuality,
    }

    // Pass smoothed bounds to tracker for stability check
    tracker.addFrame(frame, smoothedBounds)
    setFrameCount((prev) => prev + 1)
  }

  const handleContinue = () => {
    router.push('/vision-scan/cover-uncover')
  }

  const handleRetry = () => {
    tracker.reset()
    recordRepeatAttempt('alignment')
    setFrameCount(0)
    setIsCapturing(true)
    setResult(null)
  }

  const handleCameraError = () => {
    setIsCapturing(false)
    setCameraError('camera-error')
  }

  const handleCameraRetry = () => {
    setCameraError(null)
    // Resume from current frame count (don't restart)
    if (!result) {
      setIsCapturing(true)
    }
  }

  const handleCameraCancel = () => {
    router.back()
  }

  if (cameraError) {
    return (
      <CameraRecovery
        error={cameraError}
        onRetry={handleCameraRetry}
        onCancel={handleCameraCancel}
      />
    )
  }

  if (!isCapturing && result) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>👁️</Text>
          <Text style={styles.title}>Alignment Complete</Text>

          <View style={styles.resultCard}>
            <View style={styles.alignmentScore}>
              <Text style={styles.scoreNumber}>{result.alignmentIndex.toFixed(0)}</Text>
              <Text style={styles.scoreLabel}>Alignment Index</Text>
            </View>

            <View style={styles.deviationRow}>
              <View style={styles.deviationCol}>
                <Text style={styles.deviationLabel}>Left Eye</Text>
                <Text style={styles.deviationValue}>
                  {Math.abs(result.meanDeviation.left).toFixed(1)}°
                </Text>
              </View>
              <View style={styles.deviationCol}>
                <Text style={styles.deviationLabel}>Right Eye</Text>
                <Text style={styles.deviationValue}>
                  {Math.abs(result.meanDeviation.right).toFixed(1)}°
                </Text>
              </View>
            </View>

            <View style={styles.methodNote}>
              <Text style={styles.methodText}>
                Method: {result.usedSensorData ? 'Sensor-based' : 'Face detection estimate'}
              </Text>
            </View>
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteText}>{result.screeningNote}</Text>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue to Motility</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Repeat Alignment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/vision-scan')}>
            <Text style={styles.backButtonText}>Cancel Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const progress = (frameCount / targetFrames) * 100
  const faceHoldStatus = computeFaceHoldStatus()
  const useSensorMode = deviceQualification?.useSensorBasedMeasurements || false

  return (
    <View style={styles.container}>
      <ProgressStepper currentStep="alignment" />
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        onMountError={handleCameraError}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.accurate,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
        }}
      />

      <View style={styles.overlay}>
        <FaceHoldCoaching 
          status={faceHoldStatus}
          frameCount={frameCount}
          targetFrames={targetFrames}
          isPaused={isPaused}
        />

        <View style={styles.fixationArea}>
          <View style={styles.centerInstruction}>
            <Text style={styles.centerInstructionText}>
              Look at the red dot
            </Text>
          </View>
          <View style={styles.fixationDot} />
        </View>

        <DegradedModeBanner useSensorMode={useSensorMode} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  fixationArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerInstruction: {
    position: 'absolute',
    top: -60,
  },
  centerInstructionText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  fixationDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1F2937',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
  },
  resultCard: {
    width: '100%',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  alignmentScore: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  deviationRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  deviationCol: {
    alignItems: 'center',
  },
  deviationLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  deviationValue: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  methodNote: {
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#4B5563',
  },
  methodText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  noteCard: {
    width: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  noteText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    lineHeight: 20,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  retryButton: {
    width: '100%',
    backgroundColor: '#6B7280',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
})
