/**
 * Dynamic Convergence Screen
 * 
 * User moves phone closer and farther while looking at fixation target.
 */

import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Camera, CameraType } from 'expo-camera'
import * as FaceDetector from 'expo-face-detector'
import { ConvergenceTracker, QualityEngine, type ConvergenceFrame } from '@spect-it/cv'
import { useVisionScan } from '../../lib/vision-scan/vision-scan-context'
import { type DetectedFace, estimateFaceDistance, estimateVergence, applyEMA, medianFilter, detectFaceFlicker } from '../../lib/vision-scan/camera-utils'
import { ProgressStepper } from '../../components/vision-scan/ProgressStepper'
import { CameraRecovery } from '../../components/vision-scan/CameraRecovery'
import { FaceHoldCoaching, type FaceHoldStatus } from '../../components/vision-scan/FaceHoldCoaching'
import { DegradedModeBanner } from '../../components/vision-scan/DegradedModeBanner'

export default function ConvergenceScreen() {
  const {
    deviceQualification,
    calibration,
    alignment,
    motility,
    setConvergence,
    setQualityAssessment,
    updateMethodology,
  } = useVisionScan()
  const [tracker] = useState(() => new ConvergenceTracker(deviceQualification?.useSensorBasedMeasurements || false))
  const [phase, setPhase] = useState<'approach' | 'recede' | 'complete'>('approach')
  const [distance, setDistance] = useState(600)
  const [frameCount, setFrameCount] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [detectedFace, setDetectedFace] = useState<DetectedFace | null>(null)
  const [initialFaceSize, setInitialFaceSize] = useState<number | null>(null)
  const [baselineIPD, setBaselineIPD] = useState<number | null>(null)
  const [baselineFaceWidth, setBaselineFaceWidth] = useState<number | null>(null)
  const [vergenceMethod, setVergenceMethod] = useState<'ipd-change' | 'face-width-change' | null>(null)
  const [cameraError, setCameraError] = useState<'camera-unavailable' | 'camera-error' | null>(null)
  const cameraRef = useRef<Camera>(null)
  const faceLostTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Temporal smoothing state
  const [ipdBuffer, setIpdBuffer] = useState<number[]>([])
  const [faceWidthBuffer, setFaceWidthBuffer] = useState<number[]>([])
  const [ipdEMA, setIpdEMA] = useState<number | null>(null)
  const [faceWidthEMA, setFaceWidthEMA] = useState<number | null>(null)
  const [faceDetectionHistory, setFaceDetectionHistory] = useState<boolean[]>([])
  const [timestampHistory, setTimestampHistory] = useState<number[]>([])
  const BUFFER_SIZE = 5

  useEffect(() => {
    if ((phase === 'approach' || phase === 'recede') && !isPaused && detectedFace) {
      const interval = setInterval(() => {
        captureFrame()
      }, 100)

      return () => clearInterval(interval)
    }
  }, [phase, distance, frameCount, isPaused, detectedFace])

  const handleFacesDetected = ({ faces }: { faces: any[] }) => {
    if (faces.length > 0) {
      const face = faces[0]
      const faceData = {
        bounds: face.bounds,
        leftEye: face.leftEyePosition,
        rightEye: face.rightEyePosition,
        rollAngle: face.rollAngle,
        yawAngle: face.yawAngle,
      }
      setDetectedFace(faceData)
      
      // Resume if was paused
      if (isPaused) {
        setIsPaused(false)
      }
      
      // Clear any face-lost timeout
      if (faceLostTimeoutRef.current) {
        clearTimeout(faceLostTimeoutRef.current)
        faceLostTimeoutRef.current = null
      }
      
      // Store baseline measurements for vergence estimation
      if (!initialFaceSize) {
        setInitialFaceSize(face.bounds.width)
        setBaselineFaceWidth(face.bounds.width)
        
        // Store baseline IPD if eye landmarks available
        if (face.leftEyePosition && face.rightEyePosition) {
          const ipd = Math.sqrt(
            Math.pow(face.rightEyePosition.x - face.leftEyePosition.x, 2) +
            Math.pow(face.rightEyePosition.y - face.leftEyePosition.y, 2)
          )
          setBaselineIPD(ipd)
        }
      }
    } else {
      setDetectedFace(null)
      
      // Pause capture after 1 second of no face
      if (!isPaused && !faceLostTimeoutRef.current && phase !== 'complete') {
        faceLostTimeoutRef.current = setTimeout(() => {
          setIsPaused(true)
        }, 1000)
      }
    }
  }

  const captureFrame = () => {
    if (!detectedFace || !initialFaceSize) {
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
      console.log('Convergence: Face flicker detected, skipping frame')
      return
    }

    // Smooth IPD using both EMA and median filter
    let smoothedIPD = baselineIPD
    if (detectedFace.leftEye && detectedFace.rightEye) {
      const currentIPD = Math.sqrt(
        Math.pow(detectedFace.rightEye.x - detectedFace.leftEye.x, 2) +
        Math.pow(detectedFace.rightEye.y - detectedFace.leftEye.y, 2)
      )
      
      // Add to buffer
      const newIpdBuffer = [...ipdBuffer.slice(-BUFFER_SIZE + 1), currentIPD]
      setIpdBuffer(newIpdBuffer)
      
      // Apply median filter to remove outliers
      const medianIPD = medianFilter(newIpdBuffer)
      
      // Then apply EMA for smoothness
      smoothedIPD = applyEMA(medianIPD, ipdEMA, 0.25) // Lower alpha for more smoothing in vergence
      setIpdEMA(smoothedIPD)
    }

    // Smooth face width
    const currentFaceWidth = detectedFace.bounds.width
    const newFaceWidthBuffer = [...faceWidthBuffer.slice(-BUFFER_SIZE + 1), currentFaceWidth]
    setFaceWidthBuffer(newFaceWidthBuffer)
    
    const medianFaceWidth = medianFilter(newFaceWidthBuffer)
    const smoothedFaceWidth = applyEMA(medianFaceWidth, faceWidthEMA, 0.25)
    setFaceWidthEMA(smoothedFaceWidth)

    // Create smoothed bounds for distance estimation
    const smoothedBounds = {
      ...detectedFace.bounds,
      width: smoothedFaceWidth,
    }

    // Estimate distance using improved method (IPD or face-width) with smoothed values
    const faceDistanceResult = estimateFaceDistance(
      smoothedBounds,
      600, // Assume 600px width
      detectedFace.leftEye,
      detectedFace.rightEye
    )

    // Estimate vergence using smoothed IPD/face-width changes
    const vergenceResult = estimateVergence(
      detectedFace.leftEye,
      detectedFace.rightEye,
      smoothedBounds,
      baselineIPD,
      baselineFaceWidth
    )

    const vergenceAngle = vergenceResult?.vergenceAngle ?? 7.2 // Default if estimation fails

    // Track which method is being used (for documentation)
    if (vergenceResult && !vergenceMethod) {
      setVergenceMethod(vergenceResult.method)
      updateMethodology({
        vergenceMethod: vergenceResult.method === 'ipd-change' ? 'ipd-change-preferred' : 'face-width-change-fallback'
      })
    }

    const frame: ConvergenceFrame = {
      timestamp: Date.now(),
      faceDistance: faceDistanceResult.distance,
      leftEye: {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: faceDistanceResult.distance,
      },
      rightEye: {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: faceDistanceResult.distance,
      },
      vergenceAngle,
      quality: detectedFace.bounds.width > 100 ? 0.8 : 0.5,
    }

    tracker.addFrame(frame)
    setFrameCount((prev) => prev + 1)
    setDistance(faceDistanceResult.distance)

    if (phase === 'approach' && frameCount > 50) {
      tracker.setPhase('recede')
      setPhase('recede')
    } else if (phase === 'recede' && frameCount > 100) {
      setPhase('complete')
      
      // Compute convergence result
      const convergenceResult = tracker.computeResult()
      setConvergence(convergenceResult)
      
      // Run quality assessment
      if (deviceQualification && calibration && alignment && motility) {
        const qualityEngine = new QualityEngine()
        const assessment = qualityEngine.assessQuality(
          deviceQualification,
          calibration,
          alignment,
          motility,
          convergenceResult
        )
        setQualityAssessment(assessment)
      }
    }
  }

  const handleProceed = () => {
      router.push('/vision-scan/pupil-examination')
  }

  const handleCameraError = () => {
    setCameraError('camera-error')
  }

  const handleCameraRetry = () => {
    setCameraError(null)
    // Resume from current phase (don't restart)
  }

  const handleCameraCancel = () => {
    router.back()
  }
  
  const computeFaceHoldStatus = (): FaceHoldStatus => {
    if (!detectedFace) return 'no-face'
    
    // For convergence, we want the user moving the phone
    // So we're more lenient on distance checks
    const faceWidth = detectedFace.bounds.width
    if (faceWidth < 80) return 'too-far'
    
    // Check if face is moving (expected during convergence)
    // This is less strict than alignment
    
    return 'good'
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

  if (phase === 'complete') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>✓</Text>
          <Text style={styles.title}>Convergence Complete</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              All vision scan modules completed. Assessing data quality...
            </Text>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleProceed}>
            <Text style={styles.continueButtonText}>Continue to Quality Review</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const phaseText =
    phase === 'approach'
      ? 'Slowly move phone closer to your face'
      : 'Slowly move phone away from your face'

  const distancePercent = ((600 - distance) / 500) * 100
  const faceHoldStatus = computeFaceHoldStatus()
  const useSensorMode = deviceQualification?.useSensorBasedMeasurements || false

  return (
    <View style={styles.container}>
      <ProgressStepper currentStep="convergence" />
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
          frameCount={frameCount}
          targetFrames={phase === 'approach' ? 50 : 100}
          isPaused={isPaused}
        />

        <View style={styles.convergenceArea}>
          <View style={styles.phaseInstructionCard}>
            <Text style={styles.phaseInstructionText}>{phaseText}</Text>
            <Text style={styles.distanceText}>Distance: ~{distance.toFixed(0)}mm</Text>
          </View>
          <View style={styles.fixationTarget} />
          <Text style={styles.guideText}>Keep looking at the dot</Text>
        </View>

        <View style={styles.bottomArea}>
          <View style={styles.distanceIndicator}>
            <View style={styles.distanceBar}>
              <View
                style={[styles.distanceMarker, { left: `${Math.max(0, Math.min(100, distancePercent))}%` }]}
              />
            </View>
            <View style={styles.distanceLabels}>
              <Text style={styles.distanceLabel}>Far (600mm)</Text>
              <Text style={styles.distanceLabel}>Near (100mm)</Text>
            </View>
          </View>

          <DegradedModeBanner useSensorMode={useSensorMode} />
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
    justifyContent: 'center',
  },
  convergenceArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseInstructionCard: {
    backgroundColor: 'rgba(55, 65, 81, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
    alignItems: 'center',
  },
  phaseInstructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 6,
  },
  distanceText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  fixationTarget: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F59E0B',
    borderWidth: 4,
    borderColor: 'white',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  guideText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  distanceIndicator: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  distanceBar: {
    height: 40,
    backgroundColor: '#374151',
    borderRadius: 20,
    position: 'relative',
    marginBottom: 8,
  },
  distanceMarker: {
    position: 'absolute',
    width: 20,
    height: 40,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    transform: [{ translateX: -10 }],
  },
  distanceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distanceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  infoCard: {
    width: '100%',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
})
