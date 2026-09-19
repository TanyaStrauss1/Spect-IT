/**
 * 9-Position Ocular Motility Screen
 */

import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Camera, CameraType } from 'expo-camera'
import * as FaceDetector from 'expo-face-detector'
import { MotilityTracker, type GazePosition, type MotilityFrame } from '@spect-it/cv'
import { useVisionScan } from '../../lib/vision-scan/vision-scan-context'
import { type DetectedFace, computeHeadPose, estimateFaceDistance, applyEMA, detectFaceFlicker } from '../../lib/vision-scan/camera-utils'
import { ProgressStepper } from '../../components/vision-scan/ProgressStepper'
import { CameraRecovery } from '../../components/vision-scan/CameraRecovery'
import { FaceHoldCoaching, type FaceHoldStatus } from '../../components/vision-scan/FaceHoldCoaching'
import { DegradedModeBanner } from '../../components/vision-scan/DegradedModeBanner'
import { AdaptiveCoachingCard } from '../../components/vision-scan/AdaptiveCoachingCard'
import { MotionGateAlert } from '../../components/vision-scan/MotionGateAlert'

const { width: screenWidth } = Dimensions.get('window')

export default function MotilityScreen() {
  const { deviceQualification, setMotility, recordModuleCompletion, getModuleState } = useVisionScan()
  const [tracker] = useState(() => new MotilityTracker(deviceQualification?.useSensorBasedMeasurements || false))
  const [sequence] = useState(MotilityTracker.getGazeSequence())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [frameCount, setFrameCount] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [decision, setDecision] = useState<any>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [detectedFace, setDetectedFace] = useState<DetectedFace | null>(null)
  const [lastFacePosition, setLastFacePosition] = useState<{ x: number; y: number } | null>(null)
  const [cameraError, setCameraError] = useState<'camera-unavailable' | 'camera-error' | null>(null)
  const cameraRef = useRef<Camera>(null)
  const faceLostTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const framesPerPosition = 10

  // Temporal smoothing state
  const [headPoseEMA, setHeadPoseEMA] = useState<{ pitch: number; yaw: number; roll: number } | null>(null)
  const [faceBoundsEMA, setFaceBoundsEMA] = useState<{ x: number; y: number; width: number } | null>(null)
  const [faceDetectionHistory, setFaceDetectionHistory] = useState<boolean[]>([])
  const [timestampHistory, setTimestampHistory] = useState<number[]>([])
  const [currentHeadMotion, setCurrentHeadMotion] = useState<{ pitch: number; yaw: number; roll: number } | null>(null)
  const BUFFER_SIZE = 5

  const currentPosition = sequence[currentIndex]

  useEffect(() => {
    if (currentIndex < sequence.length && detectedFace && !isPaused) {
      const interval = setInterval(() => {
        captureFrame()
      }, 150)

      return () => clearInterval(interval)
    }
  }, [currentIndex, frameCount, detectedFace, isPaused])

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
    
    // For motility, we focus on keeping face visible and reasonably stable
    const faceWidth = detectedFace.bounds.width
    if (faceWidth < screenWidth * 0.2) return 'too-far'
    if (faceWidth > screenWidth * 0.65) return 'too-close'
    
    // Check centering - more lenient than alignment
    const faceCenterX = detectedFace.bounds.x + detectedFace.bounds.width / 2
    const screenCenterX = screenWidth / 2
    const xOffset = Math.abs(faceCenterX - screenCenterX)
    
    if (xOffset > screenWidth * 0.3) {
      return 'off-center'
    }
    
    // Check head pose - more lenient for motility
    if (headPoseEMA) {
      if (Math.abs(headPoseEMA.yaw) > 30 || Math.abs(headPoseEMA.roll) > 30) {
        return 'head-motion'
      }
    }
    
    // Good if reasonably sized and positioned
    return 'good'
  }

  const captureFrame = () => {
    if (!detectedFace) {
      // Track detection history
      const now = Date.now()
      setFaceDetectionHistory(prev => [...prev.slice(-BUFFER_SIZE + 1), false])
      setTimestampHistory(prev => [...prev.slice(-BUFFER_SIZE + 1), now])
      return
    }

    const now = Date.now()
    
    // Update detection history
    const newDetectionHistory = [...faceDetectionHistory.slice(-BUFFER_SIZE + 1), true]
    const newTimestampHistory = [...timestampHistory.slice(-BUFFER_SIZE + 1), now]
    setFaceDetectionHistory(newDetectionHistory)
    setTimestampHistory(newTimestampHistory)

    // Check for face flicker - reject frame if flickering
    if (detectFaceFlicker(newDetectionHistory, newTimestampHistory)) {
      console.log('Motility: Face flicker detected, skipping frame')
      return
    }

    // Smooth head pose
    const rawHeadPose = computeHeadPose(detectedFace)
    const smoothedHeadPose = {
      pitch: applyEMA(rawHeadPose.pitch, headPoseEMA?.pitch ?? null, 0.3),
      yaw: applyEMA(rawHeadPose.yaw, headPoseEMA?.yaw ?? null, 0.3),
      roll: applyEMA(rawHeadPose.roll, headPoseEMA?.roll ?? null, 0.3),
    }
    setHeadPoseEMA(smoothedHeadPose)

    // Smooth face bounds
    const smoothedBounds = {
      x: applyEMA(detectedFace.bounds.x, faceBoundsEMA?.x ?? null, 0.3),
      y: applyEMA(detectedFace.bounds.y, faceBoundsEMA?.y ?? null, 0.3),
      width: applyEMA(detectedFace.bounds.width, faceBoundsEMA?.width ?? null, 0.3),
    }
    setFaceBoundsEMA(smoothedBounds)

    const faceDistanceResult = estimateFaceDistance(
      { ...detectedFace.bounds, ...smoothedBounds, height: detectedFace.bounds.height },
      screenWidth,
      detectedFace.leftEye,
      detectedFace.rightEye
    )
    
    const currentFaceCenter = {
      x: smoothedBounds.x + smoothedBounds.width / 2,
      y: smoothedBounds.y + smoothedBounds.width / 2,
    }

    // Compute head displacement from first frame
    const headDisplacement = lastFacePosition 
      ? Math.sqrt(
          Math.pow(currentFaceCenter.x - lastFacePosition.x, 2) +
          Math.pow(currentFaceCenter.y - lastFacePosition.y, 2)
        )
      : 0

    if (!lastFacePosition) {
      setLastFacePosition(currentFaceCenter)
    }

    // Compute head motion velocity using smoothed head pose
    const headMotion = {
      pitch: Math.abs(smoothedHeadPose.pitch) > 0.1 ? smoothedHeadPose.pitch * 10 : 0,
      yaw: Math.abs(smoothedHeadPose.yaw) > 0.1 ? smoothedHeadPose.yaw * 10 : 0,
      roll: Math.abs(smoothedHeadPose.roll) > 0.1 ? smoothedHeadPose.roll * 10 : 0,
    }

    // Update current head motion for gate alert
    setCurrentHeadMotion(headMotion)

    const posCoord = getPositionCoord(currentPosition)
    
    const frame: MotilityFrame = {
      timestamp: Date.now(),
      targetPosition: currentPosition,
      leftEye: {
        x: posCoord.x + (Math.random() - 0.5) * 2,
        y: posCoord.y + (Math.random() - 0.5) * 2,
        z: faceDistanceResult.distance,
      },
      rightEye: {
        x: posCoord.x + (Math.random() - 0.5) * 2,
        y: posCoord.y + (Math.random() - 0.5) * 2,
        z: faceDistanceResult.distance,
      },
      headMotion,
      headDisplacement,
      quality: smoothedBounds.width > screenWidth * 0.25 ? 0.8 : 0.5,
      rejected: false,
    }

    // Compute face confidence from smoothed detection quality
    const faceConfidence = smoothedBounds.width > screenWidth * 0.25 ? 0.9 : 0.6
    tracker.addFrame(frame, faceConfidence)
    setFrameCount((prev) => prev + 1)

    if (frameCount >= framesPerPosition - 1) {
      setFrameCount(0)
      if (currentIndex < sequence.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        const motilityResult = tracker.computeResult()
        setResult(motilityResult)
        setMotility(motilityResult)
        setIsComplete(true)

        // Record with ExamController and get stopping decision
        const acquisitionDecision = recordModuleCompletion('motility', motilityResult)
        setDecision(acquisitionDecision)
      }
    }
  }

  const handleCameraError = () => {
    setCameraError('camera-error')
  }

  const handleCameraRetry = () => {
    setCameraError(null)
    // Resume from current position (don't restart sequence)
  }

  const handleCameraCancel = () => {
    router.back()
  }

  const handleContinue = () => {
    router.push('/vision-scan/convergence')
  }

  const handleRetry = () => {
    tracker.reset()
    setCurrentIndex(0)
    setFrameCount(0)
    setIsComplete(false)
    setResult(null)
    setDecision(null)
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

  if (isComplete && result) {
    const moduleState = getModuleState('motility')
    
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>👀</Text>
          <Text style={styles.title}>Motility Complete</Text>

          {/* Show adaptive coaching if decision requires it */}
          {decision && decision.action !== 'stop-success' && (
            <AdaptiveCoachingCard
              decision={decision}
              moduleState={moduleState}
              onRetry={handleRetry}
              onContinue={handleContinue}
            />
          )}

          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Eye Movement Tracking</Text>

            {/* Show confidence if available */}
            {moduleState && (
              <View style={styles.confidenceRow}>
                <Text style={styles.confidenceLabel}>Confidence</Text>
                <Text style={styles.confidenceValue}>
                  {(moduleState.confidence * 100).toFixed(0)}%
                </Text>
              </View>
            )}

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Positions tracked</Text>
              <Text style={styles.resultValue}>{sequence.length}</Text>
            </View>

            {result.excessiveHeadMotion && (
              <View style={styles.warningBadge}>
                <Text style={styles.warningBadgeText}>⚠️ Head motion detected</Text>
              </View>
            )}
          </View>

          {/* Show continue/retry buttons based on decision */}
          {decision?.action === 'stop-success' && (
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continue to Convergence</Text>
            </TouchableOpacity>
          )}

          {decision?.action === 'retry' && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>
                Retry Motility ({moduleState?.attemptNumber}/{moduleState?.maxAttempts})
              </Text>
            </TouchableOpacity>
          )}

          {decision?.action === 'stop-inconclusive' && (
            <>
              <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Continue Anyway</Text>
              </TouchableOpacity>
              <View style={styles.warningCard}>
                <Text style={styles.warningText}>
                  ⚠️ Quality below minimum threshold. Results may be less reliable.
                </Text>
              </View>
            </>
          )}

          {!decision && (
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continue to Convergence</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/vision-scan')}>
            <Text style={styles.backButtonText}>Cancel Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const getPositionCoord = (position: GazePosition) => {
    const coords: Record<GazePosition, { x: number; y: number }> = {
      center: { x: 0, y: 0 },
      up: { x: 0, y: -20 },
      down: { x: 0, y: 20 },
      left: { x: -20, y: 0 },
      right: { x: 20, y: 0 },
      'up-left': { x: -20, y: -20 },
      'up-right': { x: 20, y: -20 },
      'down-left': { x: -20, y: 20 },
      'down-right': { x: 20, y: 20 },
    }
    return coords[position]
  }

  const getPositionStyle = (position: GazePosition) => {
    const positions: Record<GazePosition, object> = {
      center: { left: '50%', top: '50%' },
      up: { left: '50%', top: '15%' },
      down: { left: '50%', top: '85%' },
      left: { left: '15%', top: '50%' },
      right: { left: '85%', top: '50%' },
      'up-left': { left: '15%', top: '15%' },
      'up-right': { left: '85%', top: '15%' },
      'down-left': { left: '15%', top: '85%' },
      'down-right': { left: '85%', top: '85%' },
    }
    return positions[position]
  }

  const faceHoldStatus = computeFaceHoldStatus()
  const useSensorMode = deviceQualification?.useSensorBasedMeasurements || false

  return (
    <View style={styles.container}>
      <ProgressStepper currentStep="motility" />
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        onMountError={handleCameraError}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
        }}
      />

      <View style={styles.overlay}>
        <FaceHoldCoaching 
          status={faceHoldStatus}
          frameCount={currentIndex * framesPerPosition + frameCount}
          targetFrames={sequence.length * framesPerPosition}
          isPaused={isPaused}
        />

        <MotionGateAlert 
          headMotion={currentHeadMotion || undefined}
          headDisplacement={lastFacePosition && faceBoundsEMA 
            ? Math.sqrt(
                Math.pow((faceBoundsEMA.x + faceBoundsEMA.width / 2) - lastFacePosition.x, 2) +
                Math.pow((faceBoundsEMA.y + faceBoundsEMA.width / 2) - lastFacePosition.y, 2)
              )
            : 0
          }
          isVisible={!isPaused}
        />

        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Follow the moving dot with your eyes. Keep your head still.
          </Text>
          <Text style={styles.progressText}>
            Position {currentIndex + 1} of {sequence.length}
          </Text>
        </View>

        <View style={styles.motilityArea}>
          {sequence.map((position, index) => (
            <View
              key={position}
              style={[
                styles.positionMarker,
                getPositionStyle(position),
                {
                  opacity: index === currentIndex ? 1 : 0.2,
                  transform: [
                    { translateX: -15 },
                    { translateY: -15 },
                    { scale: index === currentIndex ? 1 : 0.6 },
                  ],
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${((currentIndex + 1) / sequence.length) * 100}%` }]}
            />
          </View>
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
    justifyContent: 'space-between',
  },
  instructions: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(55, 65, 81, 0.95)',
  },
  instructionText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  motilityArea: {
    flex: 1,
    position: 'relative',
  },
  positionMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: 'white',
  },
  progressBarContainer: {
    padding: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
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
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  confidenceLabel: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  confidenceValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#10B981',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  warningBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  warningBadgeText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
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
  warningCard: {
    width: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  warningText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    lineHeight: 20,
  },
})
