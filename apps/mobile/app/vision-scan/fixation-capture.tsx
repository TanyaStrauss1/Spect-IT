/**
 * Fixation Capture Screen with Live Camera
 * 
 * Short "hold fixation" capture session (~3s) that collects:
 * - Video frames with quality assessment
 * - Face geometry (depth when available)
 * - Inertial/motion data
 * - Display state
 * - Quality features (face detection, motion, lighting)
 * 
 * Screening-only. No diagnosis or Rx claims.
 */

import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { Camera, CameraType } from 'expo-camera'
import * as FaceDetector from 'expo-face-detector'
import {
  FixationCaptureController,
  DEFAULT_FIXATION_CONFIG,
  type FixationCaptureInput,
  type FixationCaptureSession,
} from '@spect-it/cv'
import { useVisionScan } from '../../lib/vision-scan/vision-scan-context'
import {
  type DetectedFace,
  computeHeadPose,
  estimateFaceDistance,
  applyEMA,
  detectFaceFlicker,
} from '../../lib/vision-scan/camera-utils'
import { ProgressStepper } from '../../components/vision-scan/ProgressStepper'
import { CameraRecovery } from '../../components/vision-scan/CameraRecovery'
import { FaceHoldCoaching, type FaceHoldStatus } from '../../components/vision-scan/FaceHoldCoaching'
import { DegradedModeBanner } from '../../components/vision-scan/DegradedModeBanner'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function FixationCaptureScreen() {
  const { deviceQualification, setFixationCapture, recordRepeatAttempt, recordModuleCompletion, getModuleState } = useVisionScan()
  
  const [controller] = useState(() => 
    new FixationCaptureController(
      deviceQualification?.capability || {
        hasTrueDepth: false,
        hasLiDAR: false,
        hasFrontCamera: true,
        hasGyroscope: true,
        hasAccelerometer: true,
        screenWidth,
        screenHeight,
        screenPPI: 460,
      },
      DEFAULT_FIXATION_CONFIG
    )
  )

  const [isCapturing, setIsCapturing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [result, setResult] = useState<FixationCaptureSession | null>(null)
  const [detectedFace, setDetectedFace] = useState<DetectedFace | null>(null)
  const [cameraError, setCameraError] = useState<'camera-unavailable' | 'camera-error' | null>(null)
  const [progress, setProgress] = useState({ elapsed: 0, framesCollected: 0, goodFrames: 0, isComplete: false })
  
  const cameraRef = useRef<Camera>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const faceLostTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Temporal smoothing state
  const [faceBoundsEMA, setFaceBoundsEMA] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [headPoseEMA, setHeadPoseEMA] = useState<{ pitch: number; yaw: number; roll: number } | null>(null)
  const [faceDetectionHistory, setFaceDetectionHistory] = useState<boolean[]>([])
  const [timestampHistory, setTimestampHistory] = useState<number[]>([])
  const BUFFER_SIZE = 5

  // Start capture after face is detected
  useEffect(() => {
    if (detectedFace && !isCapturing && !isComplete && !isPaused) {
      // Wait 500ms for stabilization then start
      const timer = setTimeout(() => {
        startCapture()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [detectedFace, isCapturing, isComplete, isPaused])

  // Capture loop
  useEffect(() => {
    if (isCapturing && !isPaused && detectedFace) {
      captureIntervalRef.current = setInterval(() => {
        captureFrame()
        
        // Check if complete
        const progressUpdate = controller.getProgress()
        setProgress(progressUpdate)
        
        if (progressUpdate.isComplete) {
          finalize()
        }
      }, 33) // ~30fps

      return () => {
        if (captureIntervalRef.current) {
          clearInterval(captureIntervalRef.current)
          captureIntervalRef.current = null
        }
      }
    }
  }, [isCapturing, isPaused, detectedFace])

  const handleFacesDetected = ({ faces }: { faces: any[] }) => {
    const now = Date.now()
    const detected = faces.length > 0

    // Update detection history for flicker detection
    const newDetectionHistory = [...faceDetectionHistory.slice(-BUFFER_SIZE + 1), detected]
    const newTimestampHistory = [...timestampHistory.slice(-BUFFER_SIZE + 1), now]
    setFaceDetectionHistory(newDetectionHistory)
    setTimestampHistory(newTimestampHistory)

    // Check for flicker
    const isFlickering = detectFaceFlicker(newDetectionHistory, newTimestampHistory)

    if (faces.length > 0 && !isFlickering) {
      const face = faces[0]
      setDetectedFace({
        bounds: face.bounds,
        leftEye: face.leftEyePosition,
        rightEye: face.rightEyePosition,
        rollAngle: face.rollAngle,
        yawAngle: face.yawAngle,
      })

      // Resume if was paused
      if (isPaused && isCapturing) {
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
      if (isCapturing && !isPaused && !faceLostTimeoutRef.current && !isComplete) {
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

  const startCapture = () => {
    controller.start()
    setIsCapturing(true)
  }

  const captureFrame = () => {
    if (!detectedFace) return

    const now = Date.now()

    // Apply EMA smoothing to face bounds
    const smoothedBounds = faceBoundsEMA ? {
      x: applyEMA(detectedFace.bounds.x, faceBoundsEMA.x, 0.3),
      y: applyEMA(detectedFace.bounds.y, faceBoundsEMA.y, 0.3),
      width: applyEMA(detectedFace.bounds.width, faceBoundsEMA.width, 0.3),
      height: applyEMA(detectedFace.bounds.height, faceBoundsEMA.height, 0.3),
    } : detectedFace.bounds
    setFaceBoundsEMA(smoothedBounds)

    // Apply EMA smoothing to head pose
    const rawHeadPose = computeHeadPose(detectedFace)
    const smoothedHeadPose = headPoseEMA ? {
      pitch: applyEMA(rawHeadPose.pitch, headPoseEMA.pitch, 0.3),
      yaw: applyEMA(rawHeadPose.yaw, headPoseEMA.yaw, 0.3),
      roll: applyEMA(rawHeadPose.roll, headPoseEMA.roll, 0.3),
    } : rawHeadPose
    setHeadPoseEMA(smoothedHeadPose)

    // Compute quality features
    const faceWidth = smoothedBounds.width
    const faceSizeScore = Math.min(1, faceWidth / (screenWidth * 0.4))
    const headMotionScore = Math.max(0, 1 - (Math.abs(smoothedHeadPose.yaw) + Math.abs(smoothedHeadPose.roll)) / 60)
    
    // Estimate lighting from face detection confidence (simplified)
    const lightingScore = faceSizeScore > 0.5 ? 0.8 : 0.5

    // Compute occlusion score (simplified - based on eye landmarks availability)
    const occlusionScore = (detectedFace.leftEye && detectedFace.rightEye) ? 0.1 : 0.5

    const input: FixationCaptureInput = {
      timestamp: now,
      videoFrame: {
        width: screenWidth,
        height: screenHeight,
      },
      face: {
        leftEye: detectedFace.leftEye ? {
          x: detectedFace.leftEye.x,
          y: detectedFace.leftEye.y,
        } : undefined,
        rightEye: detectedFace.rightEye ? {
          x: detectedFace.rightEye.x,
          y: detectedFace.rightEye.y,
        } : undefined,
        depth: estimateFaceDistance(
          smoothedBounds,
          screenWidth,
          detectedFace.leftEye,
          detectedFace.rightEye
        ).distance,
      },
      motion: {
        pitch: smoothedHeadPose.pitch,
        yaw: smoothedHeadPose.yaw,
        roll: smoothedHeadPose.roll,
      },
      display: {
        brightness: 0.8,
        targetPosition: { x: screenWidth / 2, y: screenHeight / 2 },
        stimulusType: 'fixation-target',
      },
      quality: {
        faceDetected: true,
        eyesOpen: true,
        headMotionScore,
        lightingScore,
        occlusionScore,
      },
    }

    controller.addFrame(input)
  }

  const finalize = () => {
    if (isComplete) return

    const captureResult = controller.finalize()
    setResult(captureResult)
    setFixationCapture(captureResult)
    setIsCapturing(false)
    setIsComplete(true)

    // Record with ExamController (if available)
    if (recordModuleCompletion) {
      recordModuleCompletion('fixation-capture', captureResult as any)
    }
  }

  const handleContinue = () => {
    if (result) {
      router.push('/vision-scan/alignment')
    }
  }

  const handleRetry = () => {
    controller.reset()
    if (recordRepeatAttempt) {
      recordRepeatAttempt('fixation-capture')
    }
    setIsCapturing(false)
    setIsComplete(false)
    setResult(null)
    setProgress({ elapsed: 0, framesCollected: 0, goodFrames: 0, isComplete: false })
    setFaceBoundsEMA(null)
    setHeadPoseEMA(null)
  }

  const handleCameraError = () => {
    setIsCapturing(false)
    setCameraError('camera-error')
  }

  const handleCameraRetry = () => {
    setCameraError(null)
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

  if (isComplete && result) {
    const qualityLevel = result.summary.averageQuality >= 0.8 ? 'high' : 
                        result.summary.averageQuality >= 0.6 ? 'moderate' : 'low'
    const qualityColor = qualityLevel === 'high' ? '#10B981' : 
                        qualityLevel === 'moderate' ? '#F59E0B' : '#EF4444'
    
    const meetsThreshold = result.summary.goodFrames >= DEFAULT_FIXATION_CONFIG.minGoodFrames

    return (
      <View style={styles.container}>
        <ProgressStepper currentStep="calibration" />
        <View style={styles.content}>
          <Text style={styles.icon}>{meetsThreshold ? '✓' : '⚠️'}</Text>
          <Text style={styles.title}>Fixation Capture Complete</Text>

          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Quality</Text>
              <Text style={[styles.resultValue, { color: qualityColor }]}>
                {(result.summary.averageQuality * 100).toFixed(0)}%
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Good Frames</Text>
              <Text style={styles.resultValue}>
                {result.summary.goodFrames} / {DEFAULT_FIXATION_CONFIG.minGoodFrames}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total Frames</Text>
              <Text style={styles.resultValue}>{result.summary.totalFrames}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Duration</Text>
              <Text style={styles.resultValue}>{(result.durationMs / 1000).toFixed(1)}s</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Method</Text>
              <Text style={styles.resultValue}>
                {result.summary.usedSensorData ? 'Sensor' : 'Camera-based'}
              </Text>
            </View>
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteText}>{result.screeningNote}</Text>
          </View>

          {meetsThreshold ? (
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={handleContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue to alignment"
              accessibilityHint="Fixation capture successful"
            >
              <Text style={styles.continueButtonText}>Continue to Alignment</Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.warningCard} accessibilityRole="alert">
                <Text style={styles.warningText}>
                  ⚠️ Quality below minimum threshold. Try again with better lighting and head stability.
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={handleRetry}
                accessibilityRole="button"
                accessibilityLabel="Retry fixation capture"
              >
                <Text style={styles.retryButtonText}>Retry Fixation Capture</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/vision-scan')}
            accessibilityRole="button"
            accessibilityLabel="Cancel scan"
          >
            <Text style={styles.backButtonText}>Cancel Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const faceHoldStatus = computeFaceHoldStatus()
  const useSensorMode = deviceQualification?.useSensorBasedMeasurements || false
  const progressPercent = (progress.elapsed / DEFAULT_FIXATION_CONFIG.durationMs) * 100

  return (
    <View style={styles.container}>
      <ProgressStepper currentStep="calibration" />
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
          frameCount={progress.goodFrames}
          targetFrames={DEFAULT_FIXATION_CONFIG.minGoodFrames}
          isPaused={isPaused}
        />

        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Hold your gaze steady at the center target
          </Text>
          <Text style={styles.subtext}>
            Keep your head still for ~3 seconds
          </Text>
          {isCapturing && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(100, progressPercent)}%` }]} />
            </View>
          )}
          {isCapturing && (
            <Text style={styles.progressText}>
              {progress.goodFrames} / {DEFAULT_FIXATION_CONFIG.minGoodFrames} good frames
            </Text>
          )}
        </View>

        <View style={styles.fixationArea}>
          <View style={styles.fixationTarget}>
            <View style={styles.fixationDot} />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Cancel fixation capture"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
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
    marginBottom: 4,
    fontWeight: '600',
  },
  subtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(75, 85, 99, 0.8)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#D1FAE5',
    marginTop: 8,
    fontWeight: '600',
  },
  fixationArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fixationTarget: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 30,
  },
  fixationDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    borderWidth: 3,
    borderColor: 'white',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: 'rgba(55, 65, 81, 0.9)',
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#D1D5DB',
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
    padding: 20,
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  resultLabel: {
    fontSize: 16,
    color: '#D1D5DB',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  noteCard: {
    width: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  noteText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
    textAlign: 'center',
  },
  warningCard: {
    width: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningText: {
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
    minHeight: 56,
    justifyContent: 'center',
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
    minHeight: 56,
    justifyContent: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
})
