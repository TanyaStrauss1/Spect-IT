/**
 * Eye Tracking Calibration Screen with Live Camera
 */

import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { Camera, CameraType } from 'expo-camera'
import * as FaceDetector from 'expo-face-detector'
import {
  VisionScanCalibrator,
  type CalibrationPoint,
  type GazeCalibrationSample,
  type CalibrationResult,
} from '@spect-it/cv'
import { useVisionScan } from '../../lib/vision-scan/vision-scan-context'
import { type DetectedFace, computeHeadPose, estimateFaceDistance, applyEMA, detectFaceFlicker } from '../../lib/vision-scan/camera-utils'
import { ProgressStepper } from '../../components/vision-scan/ProgressStepper'
import { CameraRecovery } from '../../components/vision-scan/CameraRecovery'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function CalibrationScreen() {
  const { deviceQualification, setCalibration, recordRepeatAttempt, updateMethodology } = useVisionScan()
  const [calibrator] = useState(() => new VisionScanCalibrator(deviceQualification?.useSensorBasedMeasurements || false))
  const [currentPointIndex, setCurrentPointIndex] = useState(0)
  const [calibrationPoints] = useState(VisionScanCalibrator.getCalibrationPoints())
  const [isCapturing, setIsCapturing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState<CalibrationResult | null>(null)
  const [detectedFace, setDetectedFace] = useState<DetectedFace | null>(null)
  const [cameraError, setCameraError] = useState<'camera-unavailable' | 'camera-error' | null>(null)
  const cameraRef = useRef<Camera>(null)

  // Temporal smoothing state
  const [faceBoundsEMA, setFaceBoundsEMA] = useState<{ width: number; x: number; y: number } | null>(null)
  const [headPoseEMA, setHeadPoseEMA] = useState<{ pitch: number; yaw: number; roll: number } | null>(null)
  const [faceDetectionHistory, setFaceDetectionHistory] = useState<boolean[]>([])
  const [timestampHistory, setTimestampHistory] = useState<number[]>([])
  const BUFFER_SIZE = 5

  const currentPoint = calibrationPoints[currentPointIndex]

  useEffect(() => {
    if (currentPointIndex < calibrationPoints.length && !isComplete && detectedFace) {
      const timer = setTimeout(() => {
        captureSample()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [currentPointIndex, detectedFace])

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

  const captureSample = () => {
    if (!detectedFace) return

    setIsCapturing(true)

    // Compute target position in screen coordinates
    const targetScreenX = currentPoint.screenX * screenWidth
    const targetScreenY = currentPoint.screenY * screenHeight

    // Estimate gaze from face center (degraded mode approximation)
    const faceCenterX = detectedFace.bounds.x + detectedFace.bounds.width / 2
    const faceCenterY = detectedFace.bounds.y + detectedFace.bounds.height / 2

    // Use eye positions if available, otherwise use face center
    const leftGazeX = detectedFace.leftEye?.x || faceCenterX
    const leftGazeY = detectedFace.leftEye?.y || faceCenterY
    const rightGazeX = detectedFace.rightEye?.x || faceCenterX
    const rightGazeY = detectedFace.rightEye?.y || faceCenterY

    const headPose = computeHeadPose(detectedFace)
    const faceDistanceResult = estimateFaceDistance(
      detectedFace.bounds, 
      screenWidth,
      detectedFace.leftEye,
      detectedFace.rightEye
    )

    // Track the actual distance method used
    updateMethodology({
      distanceMethod: faceDistanceResult.method === 'ipd' ? 'ipd-preferred' : 'face-width-fallback',
      gazeMethod: 'eye-landmarks-relative-to-face-bounds'
    })

    // Compute quality based on smoothed face size, stability, and head pose
    const faceSizeScore = Math.min(1, smoothedBounds.width / (screenWidth * 0.4))
    const headPoseScore = Math.max(0, 1 - (Math.abs(smoothedHeadPose.yaw) + Math.abs(smoothedHeadPose.roll)) / 60)
    const methodScore = faceDistanceResult.method === 'ipd' ? 1.0 : 0.8
    const quality = (faceSizeScore * 0.5 + headPoseScore * 0.3 + methodScore * 0.2)

    const sample: GazeCalibrationSample = {
      timestamp: now,
      targetPoint: currentPoint,
      leftEyeGaze: { x: leftGazeX, y: leftGazeY },
      rightEyeGaze: { x: rightGazeX, y: rightGazeY },
      headPose: smoothedHeadPose,
      faceDistance: faceDistanceResult.distance,
      quality,
    }

    calibrator.addSample(sample)

    setTimeout(() => {
      setIsCapturing(false)

      if (currentPointIndex < calibrationPoints.length - 1) {
        setCurrentPointIndex(currentPointIndex + 1)
      } else {
        const calibrationResult = calibrator.computeCalibration()
        
        // Compute real calibration errors from samples
        const errors = calibrationResult.samples.map(s => {
          const targetX = s.targetPoint.screenX * screenWidth
          const targetY = s.targetPoint.screenY * screenHeight
          
          const leftError = Math.sqrt(
            Math.pow((s.leftEyeGaze?.x || 0) - targetX, 2) +
            Math.pow((s.leftEyeGaze?.y || 0) - targetY, 2)
          )
          const rightError = Math.sqrt(
            Math.pow((s.rightEyeGaze?.x || 0) - targetX, 2) +
            Math.pow((s.rightEyeGaze?.y || 0) - targetY, 2)
          )
          
          return (leftError + rightError) / 2
        })
        
        const avgError = errors.reduce((a, b) => a + b, 0) / errors.length
        const maxErr = Math.max(...errors)
        
        // Update result with real errors
        calibrationResult.averageError = avgError
        calibrationResult.maxError = maxErr
        calibrationResult.isValid = avgError < 150 && maxErr < 300 // More lenient for estimated gaze
        
        setResult(calibrationResult)
        setCalibration(calibrationResult)
        setIsComplete(true)
      }
    }, 500)
  }

  const handleContinue = () => {
    if (result?.isValid) {
      router.push('/vision-scan/alignment')
    }
  }

  const handleRetry = () => {
    calibrator.reset()
    recordRepeatAttempt('calibration')
    setCurrentPointIndex(0)
    setIsComplete(false)
    setResult(null)
  }

  const handleCameraError = () => {
    setIsCapturing(false)
    setCameraError('camera-error')
  }

  const handleCameraRetry = () => {
    setCameraError(null)
    // Resume from current point
    if (!isComplete) {
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

  if (isComplete && result) {
    return (
      <View style={styles.container}>
        <ProgressStepper currentStep="calibration" />
        <View style={styles.content}>
          <Text style={styles.icon}>{result.isValid ? '✓' : '⚠️'}</Text>
          <Text style={styles.title}>Calibration Complete</Text>

          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Average Error</Text>
              <Text style={styles.resultValue}>{result.averageError.toFixed(1)}px</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Max Error</Text>
              <Text style={styles.resultValue}>{result.maxError.toFixed(1)}px</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Samples</Text>
              <Text style={styles.resultValue}>{result.samples.length}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Method</Text>
              <Text style={styles.resultValue}>
                {result.usedSensorData ? 'Sensor' : 'Face-based estimate'}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Status</Text>
              <Text
                style={[
                  styles.resultValue,
                  { color: result.isValid ? '#10B981' : '#EF4444' },
                ]}
              >
                {result.isValid ? 'Valid' : 'Below threshold'}
              </Text>
            </View>
          </View>

          {!result.isValid && (
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>
                Note: Calibration uses face detection for gaze estimation (no TrueDepth). 
                Errors are higher than sensor-based tracking but sufficient for screening-level assessment.
              </Text>
            </View>
          )}

          {result.isValid ? (
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={handleContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue to alignment"
              accessibilityHint="Calibration successful"
            >
              <Text style={styles.continueButtonText}>Continue to Alignment</Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.errorCard} accessibilityRole="alert">
                <Text style={styles.errorText}>
                  {result.rejectionReason || 'Calibration quality below threshold. Please retry with stable head position and good lighting.'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={handleRetry}
                accessibilityRole="button"
                accessibilityLabel="Retry calibration"
              >
                <Text style={styles.retryButtonText}>Retry Calibration</Text>
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
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Look at the dots as they appear. Keep your head still.
          </Text>
          <Text style={styles.progressText}>
            Point {currentPointIndex + 1} of {calibrationPoints.length}
          </Text>
          {!detectedFace && (
            <View style={styles.coachingBanner} accessibilityRole="alert">
              <Text style={styles.coachingText} accessibilityLabel="Position your face in view">
                👤 Position your face in view
              </Text>
            </View>
          )}
          {detectedFace && isCapturing && (
            <View style={styles.capturingBanner} accessibilityLiveRegion="polite">
              <Text style={styles.capturingText} accessibilityLabel="Capturing calibration sample">
                ✓ Capturing...
              </Text>
            </View>
          )}
        </View>

        <View style={styles.calibrationArea}>
          <View
            style={[
              styles.targetDot,
              {
                left: `${currentPoint.screenX * 100}%`,
                top: `${currentPoint.screenY * 100}%`,
                opacity: isCapturing ? 0.5 : 1,
                transform: [
                  { translateX: -15 },
                  { translateY: -15 },
                  { scale: isCapturing ? 0.8 : 1 },
                ],
              },
            ]}
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Cancel calibration"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  warningText: {
    fontSize: 14,
    color: '#F59E0B',
    marginTop: 4,
  },
  coachingBanner: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#F59E0B',
    minHeight: 40,
    justifyContent: 'center',
  },
  coachingText: {
    fontSize: 15,
    color: '#78350F',
    fontWeight: '700',
    textAlign: 'center',
  },
  capturingBanner: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#10B981',
    minHeight: 40,
    justifyContent: 'center',
  },
  capturingText: {
    fontSize: 15,
    color: '#064E3B',
    fontWeight: '700',
    textAlign: 'center',
  },
  calibrationArea: {
    flex: 1,
    position: 'relative',
  },
  targetDot: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
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
    fontSize: 13,
    color: 'white',
    lineHeight: 18,
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
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
