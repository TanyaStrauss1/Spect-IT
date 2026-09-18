/**
 * Resting Alignment Screen V2 - Closed-Loop Controller Integration
 * 
 * Demonstrates adaptive acquisition with automatic coaching and retry decisions.
 */

import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native'
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
import { AdaptiveCoachingCard } from '../../components/vision-scan/AdaptiveCoachingCard'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function AlignmentV2Screen() {
  const { deviceQualification, setAlignment, recordModuleCompletion, getModuleState } = useVisionScan()
  const [tracker] = useState(() => new AlignmentTracker(deviceQualification?.useSensorBasedMeasurements || false))
  const [frameCount, setFrameCount] = useState(0)
  const [isCapturing, setIsCapturing] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [result, setResult] = useState<AlignmentResult | null>(null)
  const [showDecisionPrompt, setShowDecisionPrompt] = useState(false)
  const [decision, setDecision] = useState<any>(null)
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

  // Get module state from ExamController
  const moduleState = getModuleState('alignment')

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

      // Record with ExamController and get stopping decision
      const acquisitionDecision = recordModuleCompletion('alignment', alignmentResult)
      setDecision(acquisitionDecision)

      // Handle decision automatically
      if (acquisitionDecision.action === 'stop-success') {
        // Auto-continue to next module
        setTimeout(() => {
          router.push('/vision-scan/motility')
        }, 2000)
      } else if (acquisitionDecision.action === 'retry') {
        // Show coaching and prompt for retry
        setShowDecisionPrompt(true)
      } else if (acquisitionDecision.action === 'stop-inconclusive') {
        // Mark as inconclusive and continue
        setShowDecisionPrompt(true)
      }
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
      
      if (isPaused) {
        setIsPaused(false)
      }
      
      if (faceLostTimeoutRef.current) {
        clearTimeout(faceLostTimeoutRef.current)
        faceLostTimeoutRef.current = null
      }
    } else {
      setDetectedFace(null)
      
      if (!isPaused && !faceLostTimeoutRef.current) {
        faceLostTimeoutRef.current = setTimeout(() => {
          setIsPaused(true)
        }, 1000)
      }
    }
  }
  
  const computeFaceHoldStatus = (): FaceHoldStatus => {
    if (!detectedFace) return 'no-face'
    
    const faceWidth = detectedFace.bounds.width
    if (faceWidth < screenWidth * 0.25) return 'too-far'
    if (faceWidth > screenWidth * 0.6) return 'too-close'
    
    const faceCenterX = detectedFace.bounds.x + detectedFace.bounds.width / 2
    const faceCenterY = detectedFace.bounds.y + detectedFace.bounds.height / 2
    const screenCenterX = screenWidth / 2
    const screenCenterY = screenHeight / 2
    
    const xOffset = Math.abs(faceCenterX - screenCenterX)
    const yOffset = Math.abs(faceCenterY - screenCenterY)
    
    if (xOffset > screenWidth * 0.25 || yOffset > screenHeight * 0.25) {
      return 'off-center'
    }
    
    if (headPoseEMA) {
      if (Math.abs(headPoseEMA.yaw) > 20 || Math.abs(headPoseEMA.roll) > 20) {
        return 'head-motion'
      }
    }
    
    if (faceWidth > screenWidth * 0.4 && xOffset < screenWidth * 0.1 && yOffset < screenHeight * 0.1) {
      return 'excellent'
    }
    
    return 'good'
  }

  const captureFrame = () => {
    if (!detectedFace) {
      const now = Date.now()
      setFaceDetectionHistory(prev => [...prev.slice(-FRAME_BUFFER_SIZE + 1), false])
      setTimestampHistory(prev => [...prev.slice(-FRAME_BUFFER_SIZE + 1), now])
      return
    }

    const now = Date.now()
    
    const newDetectionHistory = [...faceDetectionHistory.slice(-FRAME_BUFFER_SIZE + 1), true]
    const newTimestampHistory = [...timestampHistory.slice(-FRAME_BUFFER_SIZE + 1), now]
    setFaceDetectionHistory(newDetectionHistory)
    setTimestampHistory(newTimestampHistory)

    if (detectFaceFlicker(newDetectionHistory, newTimestampHistory)) {
      console.log('Face flicker detected, skipping frame')
      return
    }

    const smoothedBounds = {
      x: applyEMA(detectedFace.bounds.x, faceBoundsEMA?.x ?? null, 0.3),
      y: applyEMA(detectedFace.bounds.y, faceBoundsEMA?.y ?? null, 0.3),
      width: applyEMA(detectedFace.bounds.width, faceBoundsEMA?.width ?? null, 0.3),
      height: applyEMA(detectedFace.bounds.height, faceBoundsEMA?.height ?? null, 0.3),
    }
    setFaceBoundsEMA(smoothedBounds)

    let smoothedIPD: number | null = null
    if (detectedFace.leftEye && detectedFace.rightEye) {
      const currentIPD = Math.sqrt(
        Math.pow(detectedFace.rightEye.x - detectedFace.leftEye.x, 2) +
        Math.pow(detectedFace.rightEye.y - detectedFace.leftEye.y, 2)
      )
      smoothedIPD = applyEMA(currentIPD, ipdEMA, 0.3)
      setIpdEMA(smoothedIPD)
    }

    const rawHeadPose = computeHeadPose(detectedFace)
    const smoothedHeadPose = {
      pitch: applyEMA(rawHeadPose.pitch, headPoseEMA?.pitch ?? null, 0.3),
      yaw: applyEMA(rawHeadPose.yaw, headPoseEMA?.yaw ?? null, 0.3),
      roll: applyEMA(rawHeadPose.roll, headPoseEMA?.roll ?? null, 0.3),
    }
    setHeadPoseEMA(smoothedHeadPose)

    const targetX = screenWidth / 2
    const targetY = screenHeight / 2

    const gazeDeviation = estimateGazeDeviation(
      detectedFace.leftEye,
      detectedFace.rightEye,
      smoothedBounds,
      targetX,
      targetY
    )

    const faceDistanceResult = estimateFaceDistance(
      smoothedBounds,
      screenWidth,
      detectedFace.leftEye,
      detectedFace.rightEye
    )

    const faceCenterX = detectedFace.bounds.x + detectedFace.bounds.width / 2
    const leftEyeX = (detectedFace.leftEye?.x || faceCenterX - 20) - targetX
    const leftEyeY = (detectedFace.leftEye?.y || detectedFace.bounds.y + detectedFace.bounds.height * 0.4) - targetY
    const rightEyeX = (detectedFace.rightEye?.x || faceCenterX + 20) - targetX
    const rightEyeY = (detectedFace.rightEye?.y || detectedFace.bounds.y + detectedFace.bounds.height * 0.4) - targetY

    const pixelToDegree = 0.05

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

    tracker.addFrame(frame, smoothedBounds)
    setFrameCount((prev) => prev + 1)
  }

  const handleRetry = () => {
    tracker.reset()
    setFrameCount(0)
    setIsCapturing(true)
    setResult(null)
    setShowDecisionPrompt(false)
    setDecision(null)
  }

  const handleContinue = () => {
    router.push('/vision-scan/motility')
  }

  const handleSkipToReview = () => {
    router.push('/vision-scan/quality-review-v2')
  }

  const handleCameraError = () => {
    setIsCapturing(false)
    setCameraError('camera-error')
  }

  const handleCameraRetry = () => {
    setCameraError(null)
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

  if (!isCapturing && result && showDecisionPrompt && decision) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>
            {decision.action === 'stop-success' ? '✓' : '⚠️'}
          </Text>
          <Text style={styles.title}>Alignment Complete</Text>

          {/* Show module state from ExamController */}
          {moduleState && (
            <View style={styles.stateCard}>
              <View style={styles.stateRow}>
                <Text style={styles.stateLabel}>Confidence:</Text>
                <Text style={[styles.stateValue, { color: moduleState.confidence >= 0.65 ? '#10B981' : '#EF4444' }]}>
                  {(moduleState.confidence * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.stateRow}>
                <Text style={styles.stateLabel}>Uncertainty:</Text>
                <Text style={styles.stateValue}>
                  {(moduleState.uncertainty.quantifiedUncertainty * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.stateRow}>
                <Text style={styles.stateLabel}>Attempt:</Text>
                <Text style={styles.stateValue}>
                  {moduleState.attemptNumber}/{moduleState.maxAttempts}
                </Text>
              </View>
              <View style={styles.stateRow}>
                <Text style={styles.stateLabel}>Status:</Text>
                <Text style={styles.stateValue}>{moduleState.status}</Text>
              </View>
            </View>
          )}

          {/* Show coaching if retry needed */}
          {decision.action === 'retry' && decision.coachingPrompts && (
            <AdaptiveCoachingCard
              coachingPrompts={decision.coachingPrompts}
              attemptNumber={moduleState?.attemptNumber || 0}
              maxAttempts={moduleState?.maxAttempts || 3}
            />
          )}

          {/* Decision message */}
          <View style={[
            styles.decisionCard,
            { backgroundColor: decision.action === 'stop-success' ? '#D1FAE5' : '#FEF3C7' }
          ]}>
            <Text style={styles.decisionReason}>{decision.reason}</Text>
          </View>

          {/* Action buttons based on decision */}
          {decision.action === 'stop-success' && (
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continue to Motility</Text>
            </TouchableOpacity>
          )}

          {decision.action === 'retry' && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>🔄 Retry with Coaching</Text>
            </TouchableOpacity>
          )}

          {decision.action === 'stop-inconclusive' && (
            <>
              <View style={styles.inconclusiveCard}>
                <Text style={styles.inconclusiveText}>
                  Maximum attempts reached. Module marked as inconclusive.
                </Text>
              </View>
              <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Continue Anyway</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.reviewButton} onPress={handleSkipToReview}>
            <Text style={styles.reviewButtonText}>Skip to Quality Review</Text>
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
    backgroundColor: '#EEF2FF',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  stateCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stateLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  stateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  decisionCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  decisionReason: {
    fontSize: 14,
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 20,
  },
  inconclusiveCard: {
    width: '100%',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inconclusiveText: {
    fontSize: 14,
    color: '#991B1B',
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
    backgroundColor: '#F59E0B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  reviewButton: {
    width: '100%',
    backgroundColor: '#6B7280',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewButtonText: {
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
    color: '#6B7280',
    fontSize: 16,
  },
})
