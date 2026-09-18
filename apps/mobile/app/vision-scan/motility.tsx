/**
 * 9-Position Ocular Motility Screen
 */

import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { Camera, CameraType } from 'expo-camera'
import * as FaceDetector from 'expo-face-detector'
import { MotilityTracker, type GazePosition, type MotilityFrame } from '@spect-it/cv'
import { useVisionScan } from '../../lib/vision-scan/vision-scan-context'
import { type DetectedFace, computeHeadPose, estimateFaceDistance, applyEMA, detectFaceFlicker } from '../../lib/vision-scan/camera-utils'
import { ProgressStepper } from '../../components/vision-scan/ProgressStepper'

const { width: screenWidth } = Dimensions.get('window')

export default function MotilityScreen() {
  const { deviceQualification, setMotility } = useVisionScan()
  const [tracker] = useState(() => new MotilityTracker(deviceQualification?.useSensorBasedMeasurements || false))
  const [sequence] = useState(MotilityTracker.getGazeSequence())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [frameCount, setFrameCount] = useState(0)
  const [detectedFace, setDetectedFace] = useState<DetectedFace | null>(null)
  const [lastFacePosition, setLastFacePosition] = useState<{ x: number; y: number } | null>(null)
  const cameraRef = useRef<Camera>(null)
  const framesPerPosition = 10

  // Temporal smoothing state
  const [headPoseEMA, setHeadPoseEMA] = useState<{ pitch: number; yaw: number; roll: number } | null>(null)
  const [faceBoundsEMA, setFaceBoundsEMA] = useState<{ x: number; y: number; width: number } | null>(null)
  const [faceDetectionHistory, setFaceDetectionHistory] = useState<boolean[]>([])
  const [timestampHistory, setTimestampHistory] = useState<number[]>([])
  const BUFFER_SIZE = 5

  const currentPosition = sequence[currentIndex]

  useEffect(() => {
    if (currentIndex < sequence.length && detectedFace) {
      const interval = setInterval(() => {
        captureFrame()
      }, 150)

      return () => clearInterval(interval)
    }
  }, [currentIndex, frameCount, detectedFace])

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
        const result = tracker.computeResult()
        setMotility(result)
        router.push('/vision-scan/convergence')
      }
    }
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

  return (
    <View style={styles.container}>
      <ProgressStepper currentStep="motility" />
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
        }}
      />

      <View style={styles.overlay}>
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Follow the moving dot with your eyes. Keep your head still.
          </Text>
          <Text style={styles.progressText}>
            Position {currentIndex + 1} of {sequence.length}
          </Text>
          {!detectedFace && (
            <Text style={styles.warningText}>⚠️ Face not detected</Text>
          )}
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
  warningText: {
    fontSize: 14,
    color: '#F59E0B',
    marginTop: 4,
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
})
