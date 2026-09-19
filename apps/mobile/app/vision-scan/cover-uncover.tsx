/**
 * Cover-Uncover (Occlusion) Screening Screen
 * 
 * Camera-verified monocular occlusion alignment screening.
 * User covers left then right eye while camera verifies occlusion.
 */

import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native'
import { router } from 'expo-router'
import { Camera, CameraType } from 'expo-camera'
import * as FaceDetector from 'expo-face-detector'
import { 
  CoverUncoverTracker, 
  detectOcclusion,
  type CoverUncoverFrame, 
  type CoverUncoverResult,
  type CoverUncoverPhase 
} from '@spect-it/cv'
import { useVisionScan } from '../../lib/vision-scan/vision-scan-context'
import {
  type DetectedFace,
  computeHeadPose,
  estimateFaceDistance,
  applyEMA,
} from '../../lib/vision-scan/camera-utils'
import { ProgressStepper } from '../../components/vision-scan/ProgressStepper'
import { CameraRecovery } from '../../components/vision-scan/CameraRecovery'
import { DegradedModeBanner } from '../../components/vision-scan/DegradedModeBanner'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function CoverUncoverScreen() {
  const { deviceQualification, setCoverUncover, recordRepeatAttempt } = useVisionScan()
  const [tracker] = useState(() => new CoverUncoverTracker(deviceQualification?.useSensorBasedMeasurements || false))
  
  const [currentPhase, setCurrentPhase] = useState<CoverUncoverPhase>('baseline')
  const [isCapturing, setIsCapturing] = useState(true)
  const [result, setResult] = useState<CoverUncoverResult | null>(null)
  const [detectedFace, setDetectedFace] = useState<DetectedFace | null>(null)
  const [cameraError, setCameraError] = useState<'camera-unavailable' | 'camera-error' | null>(null)
  
  const cameraRef = useRef<Camera>(null)
  const phaseStartTimeRef = useRef<number>(Date.now())
  
  // Smoothing state
  const [faceBoundsEMA, setFaceBoundsEMA] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [headPoseEMA, setHeadPoseEMA] = useState<{ pitch: number; yaw: number; roll: number } | null>(null)
  
  // Animation for instructions
  const instructionOpacity = useRef(new Animated.Value(1)).current

  // Phase configuration
  const PHASE_SEQUENCE: CoverUncoverPhase[] = ['baseline', 'cover-left', 'uncover-left', 'cover-right', 'uncover-right']
  const MIN_FRAMES_PER_PHASE = 5

  useEffect(() => {
    // Pulse instruction text
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(instructionOpacity, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(instructionOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [])

  useEffect(() => {
    if (!isCapturing) return

    const interval = setInterval(() => {
      captureFrame()
    }, 150) // Capture every 150ms

    return () => clearInterval(interval)
  }, [isCapturing, currentPhase, detectedFace])

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
    } else {
      setDetectedFace(null)
    }
  }

  const captureFrame = () => {
    if (!detectedFace) return

    const now = Date.now()

    // Apply EMA smoothing to face bounds
    const smoothedBounds = {
      x: applyEMA(detectedFace.bounds.x, faceBoundsEMA?.x ?? null, 0.3),
      y: applyEMA(detectedFace.bounds.y, faceBoundsEMA?.y ?? null, 0.3),
      width: applyEMA(detectedFace.bounds.width, faceBoundsEMA?.width ?? null, 0.3),
      height: applyEMA(detectedFace.bounds.height, faceBoundsEMA?.height ?? null, 0.3),
    }
    setFaceBoundsEMA(smoothedBounds)

    // Apply EMA smoothing to head pose
    const rawHeadPose = computeHeadPose(detectedFace)
    const smoothedHeadPose = {
      pitch: applyEMA(rawHeadPose.pitch, headPoseEMA?.pitch ?? null, 0.3),
      yaw: applyEMA(rawHeadPose.yaw, headPoseEMA?.yaw ?? null, 0.3),
      roll: applyEMA(rawHeadPose.roll, headPoseEMA?.roll ?? null, 0.3),
    }
    setHeadPoseEMA(smoothedHeadPose)

    // Estimate face distance
    const faceDistanceResult = estimateFaceDistance(
      smoothedBounds,
      screenWidth,
      detectedFace.leftEye,
      detectedFace.rightEye
    )

    // Detect occlusion status
    const occlusion = detectOcclusion(
      !!detectedFace.leftEye,
      !!detectedFace.rightEye,
      true
    )

    // Estimate eye positions (simplified)
    const faceCenterX = detectedFace.bounds.x + detectedFace.bounds.width / 2
    const leftEyeX = (detectedFace.leftEye?.x || faceCenterX - 20) - screenWidth / 2
    const leftEyeY = (detectedFace.leftEye?.y || detectedFace.bounds.y + detectedFace.bounds.height * 0.4) - screenHeight / 2
    const rightEyeX = (detectedFace.rightEye?.x || faceCenterX + 20) - screenWidth / 2
    const rightEyeY = (detectedFace.rightEye?.y || detectedFace.bounds.y + detectedFace.bounds.height * 0.4) - screenHeight / 2

    const pixelToDegree = 0.05

    // Head displacement from baseline (will be calculated by tracker)
    const headDisplacement = 0

    // Quality score
    const faceQuality = smoothedBounds.width > screenWidth * 0.25 ? 0.8 : 0.5
    const stabilityPenalty = Math.abs(smoothedHeadPose.yaw) > 15 || Math.abs(smoothedHeadPose.roll) > 15 ? 0.2 : 0
    const adjustedQuality = Math.max(0.3, faceQuality - stabilityPenalty)

    const frame: CoverUncoverFrame = {
      timestamp: now,
      phase: currentPhase,
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
      occlusion,
      headPose: smoothedHeadPose,
      headDisplacement,
      quality: adjustedQuality,
      rejected: false,
    }

    const accepted = tracker.addFrame(frame, smoothedBounds)

    // Check if current phase is complete
    if (accepted && tracker.isPhaseComplete(currentPhase)) {
      advancePhase()
    }
  }

  const advancePhase = () => {
    const currentIndex = PHASE_SEQUENCE.indexOf(currentPhase)
    if (currentIndex < PHASE_SEQUENCE.length - 1) {
      const nextPhase = PHASE_SEQUENCE[currentIndex + 1]
      setCurrentPhase(nextPhase)
      tracker.setPhase(nextPhase)
      phaseStartTimeRef.current = Date.now()
    } else {
      // All phases complete, compute result
      const coverUncoverResult = tracker.computeResult()
      setResult(coverUncoverResult)
      setCoverUncover(coverUncoverResult)
      setIsCapturing(false)
    }
  }

  const handleContinue = () => {
    router.push('/vision-scan/motility')
  }

  const handleSkip = () => {
    // Skip cover-uncover test and proceed
    router.push('/vision-scan/motility')
  }

  const handleRetry = () => {
    tracker.reset()
    recordRepeatAttempt('cover-uncover')
    setCurrentPhase('baseline')
    tracker.setPhase('baseline')
    setIsCapturing(true)
    setResult(null)
    phaseStartTimeRef.current = Date.now()
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

  if (!isCapturing && result) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>👁️‍🗨️</Text>
          <Text style={styles.title}>Cover-Uncover Complete</Text>

          <View style={styles.resultCard}>
            <View style={styles.asymmetryScore}>
              <Text style={styles.scoreNumber}>{(100 - result.asymmetryScore).toFixed(0)}</Text>
              <Text style={styles.scoreLabel}>Alignment Score</Text>
            </View>

            {result.leftEyeShift && result.rightEyeShift && (
              <View style={styles.shiftRow}>
                <View style={styles.shiftCol}>
                  <Text style={styles.shiftLabel}>Left Eye Shift</Text>
                  <Text style={styles.shiftValue}>
                    {Math.sqrt(result.leftEyeShift.horizontal ** 2 + result.leftEyeShift.vertical ** 2).toFixed(1)}°
                  </Text>
                </View>
                <View style={styles.shiftCol}>
                  <Text style={styles.shiftLabel}>Right Eye Shift</Text>
                  <Text style={styles.shiftValue}>
                    {Math.sqrt(result.rightEyeShift.horizontal ** 2 + result.rightEyeShift.vertical ** 2).toFixed(1)}°
                  </Text>
                </View>
              </View>
            )}

            {result.asymmetryDetected && (
              <View style={styles.asymmetryWarning}>
                <Text style={styles.asymmetryWarningText}>⚠️ Asymmetry Detected</Text>
              </View>
            )}
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteText}>{result.screeningNote}</Text>
          </View>

          <View style={styles.reliabilityCard}>
            <Text style={styles.reliabilityText}>{result.reliabilityNote}</Text>
          </View>

          {result.qualityIssues.length > 0 && (
            <View style={styles.issuesCard}>
              <Text style={styles.issuesTitle}>Quality Issues:</Text>
              {result.qualityIssues.map((issue, idx) => (
                <Text key={idx} style={styles.issueText}>• {issue}</Text>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue to Motility</Text>
          </TouchableOpacity>

          {result.qualityIssues.length > 0 && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry Cover-Uncover</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/vision-scan')}>
            <Text style={styles.backButtonText}>Cancel Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const getInstructionText = (): string => {
    switch (currentPhase) {
      case 'baseline':
        return 'Look straight ahead with both eyes open'
      case 'cover-left':
        return 'Cover your LEFT eye with your hand'
      case 'uncover-left':
        return 'Remove your hand from left eye'
      case 'cover-right':
        return 'Cover your RIGHT eye with your hand'
      case 'uncover-right':
        return 'Remove your hand from right eye'
      default:
        return 'Follow the instructions'
    }
  }

  const getPhaseProgress = (): string => {
    const phaseIndex = PHASE_SEQUENCE.indexOf(currentPhase)
    return `Step ${phaseIndex + 1} of ${PHASE_SEQUENCE.length}`
  }

  const useSensorMode = deviceQualification?.useSensorBasedMeasurements || false

  return (
    <View style={styles.container}>
      <ProgressStepper currentStep="cover-uncover" />
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
        <View style={styles.topBar}>
          <Text style={styles.phaseProgress}>{getPhaseProgress()}</Text>
        </View>

        <View style={styles.instructionArea}>
          <Animated.View style={[styles.instructionBox, { opacity: instructionOpacity }]}>
            <Text style={styles.instructionText}>{getInstructionText()}</Text>
            <Text style={styles.instructionSubtext}>
              Keep your head still
            </Text>
          </Animated.View>

          {!detectedFace && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>⚠️ Face not detected</Text>
            </View>
          )}

          {currentPhase === 'cover-left' && detectedFace?.leftEye && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>⚠️ Left eye still visible - cover it completely</Text>
            </View>
          )}

          {currentPhase === 'cover-right' && detectedFace?.rightEye && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>⚠️ Right eye still visible - cover it completely</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip Test</Text>
          </TouchableOpacity>
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
  topBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    alignItems: 'center',
  },
  phaseProgress: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instructionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubtext: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  warningBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  warningText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
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
  asymmetryScore: {
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
  shiftRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  shiftCol: {
    alignItems: 'center',
  },
  shiftLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  shiftValue: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  asymmetryWarning: {
    width: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  asymmetryWarningText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  noteCard: {
    width: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  noteText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    lineHeight: 20,
  },
  reliabilityCard: {
    width: '100%',
    backgroundColor: '#6B7280',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reliabilityText: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  issuesCard: {
    width: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  issuesTitle: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  issueText: {
    fontSize: 12,
    color: 'white',
    lineHeight: 18,
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
