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
} from '../../lib/vision-scan/camera-utils'
import { ProgressStepper } from '../../components/vision-scan/ProgressStepper'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function AlignmentScreen() {
  const { deviceQualification, setAlignment, recordRepeatAttempt } = useVisionScan()
  const [tracker] = useState(() => new AlignmentTracker(deviceQualification?.useSensorBasedMeasurements || false))
  const [frameCount, setFrameCount] = useState(0)
  const [isCapturing, setIsCapturing] = useState(true)
  const [result, setResult] = useState<AlignmentResult | null>(null)
  const [detectedFace, setDetectedFace] = useState<DetectedFace | null>(null)
  const cameraRef = useRef<Camera>(null)
  const targetFrames = 30

  useEffect(() => {
    if (isCapturing && frameCount < targetFrames && detectedFace) {
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
  }, [isCapturing, frameCount, detectedFace])

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

    const targetX = screenWidth / 2
    const targetY = screenHeight / 2

    const gazeDeviation = estimateGazeDeviation(
      detectedFace.leftEye,
      detectedFace.rightEye,
      detectedFace.bounds,
      targetX,
      targetY
    )

    const headPose = computeHeadPose(detectedFace)
    const faceDistance = estimateFaceDistance(detectedFace.bounds, screenWidth)

    // Estimate eye positions in 3D (simplified)
    const faceCenterX = detectedFace.bounds.x + detectedFace.bounds.width / 2
    const leftEyeX = (detectedFace.leftEye?.x || faceCenterX - 20) - targetX
    const leftEyeY = (detectedFace.leftEye?.y || detectedFace.bounds.y + detectedFace.bounds.height * 0.4) - targetY
    const rightEyeX = (detectedFace.rightEye?.x || faceCenterX + 20) - targetX
    const rightEyeY = (detectedFace.rightEye?.y || detectedFace.bounds.y + detectedFace.bounds.height * 0.4) - targetY

    // Convert pixel deviations to approximate degrees (rough estimate)
    const pixelToDegree = 0.05 // Approximate conversion factor

    const frame: AlignmentFrame = {
      timestamp: Date.now(),
      leftEye: {
        x: leftEyeX * pixelToDegree,
        y: leftEyeY * pixelToDegree,
        z: faceDistance,
      },
      rightEye: {
        x: rightEyeX * pixelToDegree,
        y: rightEyeY * pixelToDegree,
        z: faceDistance,
      },
      headPose,
      faceDistance,
      gazeDeviation,
      quality: detectedFace.bounds.width > screenWidth * 0.25 ? 0.8 : 0.5,
    }

    tracker.addFrame(frame)
    setFrameCount((prev) => prev + 1)
  }

  const handleContinue = () => {
    router.push('/vision-scan/motility')
  }

  const handleRetry = () => {
    tracker.reset()
    recordRepeatAttempt('alignment')
    setFrameCount(0)
    setIsCapturing(true)
    setResult(null)
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

  return (
    <View style={styles.container}>
      <ProgressStepper currentStep="alignment" />
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.accurate,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
        }}
      />

      <View style={styles.overlay}>
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Look at the center dot. Keep your head still.
          </Text>
          <Text style={styles.progressText}>
            Capturing alignment... {frameCount}/{targetFrames}
          </Text>
          {!detectedFace && (
            <Text style={styles.warningText}>⚠️ Face not detected</Text>
          )}
        </View>

        <View style={styles.fixationArea}>
          <View style={styles.fixationDot} />
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
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
  fixationArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fixationDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EF4444',
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
    backgroundColor: '#4F46E5',
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
