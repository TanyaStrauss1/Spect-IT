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
import { type DetectedFace, estimateFaceDistance } from '../../lib/vision-scan/camera-utils'

export default function ConvergenceScreen() {
  const {
    deviceQualification,
    calibration,
    alignment,
    motility,
    setConvergence,
    setQualityAssessment,
  } = useVisionScan()
  const [tracker] = useState(() => new ConvergenceTracker(deviceQualification?.useSensorBasedMeasurements || false))
  const [phase, setPhase] = useState<'approach' | 'recede' | 'complete'>('approach')
  const [distance, setDistance] = useState(600)
  const [frameCount, setFrameCount] = useState(0)
  const [detectedFace, setDetectedFace] = useState<DetectedFace | null>(null)
  const [initialFaceSize, setInitialFaceSize] = useState<number | null>(null)
  const cameraRef = useRef<Camera>(null)

  useEffect(() => {
    if ((phase === 'approach' || phase === 'recede') && detectedFace) {
      const interval = setInterval(() => {
        captureFrame()
      }, 100)

      return () => clearInterval(interval)
    }
  }, [phase, distance, frameCount, detectedFace])

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
      
      // Store initial face size for distance calibration
      if (!initialFaceSize) {
        setInitialFaceSize(face.bounds.width)
      }
    } else {
      setDetectedFace(null)
    }
  }

  const captureFrame = () => {
    if (!detectedFace || !initialFaceSize) return

    // Use face size change to simulate distance change
    const faceSizeRatio = detectedFace.bounds.width / initialFaceSize
    const estimatedDistance = 500 / faceSizeRatio // Inverse relationship
    
    // Compute vergence angle (binocular convergence)
    const interpupillaryDistance = 65 // mm average
    const vergenceAngle = interpupillaryDistance / estimatedDistance * 1000 // Convert to appropriate units

    const frame: ConvergenceFrame = {
      timestamp: Date.now(),
      faceDistance: estimatedDistance,
      leftEye: {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: estimatedDistance,
      },
      rightEye: {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: estimatedDistance,
      },
      vergenceAngle,
      quality: detectedFace.bounds.width > 100 ? 0.8 : 0.5,
    }

    tracker.addFrame(frame)
    setFrameCount((prev) => prev + 1)
    setDistance(estimatedDistance)

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
    router.push('/vision-scan/quality-review')
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

  return (
    <View style={styles.container}>
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
          <Text style={styles.instructionText}>{phaseText}</Text>
          <Text style={styles.distanceText}>Distance: {distance.toFixed(0)}mm</Text>
          <Text style={styles.phaseText}>
            Phase: {phase === 'approach' ? 'Approaching' : 'Receding'}
          </Text>
          {!detectedFace && (
            <Text style={styles.warningText}>⚠️ Face not detected</Text>
          )}
        </View>

        <View style={styles.convergenceArea}>
          <View style={styles.fixationTarget} />
          <Text style={styles.guideText}>Keep looking at the center dot</Text>
        </View>

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
  distanceText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  phaseText: {
    fontSize: 14,
    color: '#6B7280',
  },
  warningText: {
    fontSize: 14,
    color: '#F59E0B',
    marginTop: 4,
  },
  convergenceArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fixationTarget: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F59E0B',
    borderWidth: 4,
    borderColor: 'white',
    marginBottom: 20,
  },
  guideText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  distanceIndicator: {
    padding: 20,
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
