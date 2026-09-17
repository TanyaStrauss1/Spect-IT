/**
 * Eye Tracking Calibration Screen
 * 
 * Follow dots on screen to calibrate gaze tracking.
 */

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import {
  VisionScanCalibrator,
  type CalibrationPoint,
  type GazeCalibrationSample,
  type CalibrationResult,
} from '@spect-it/cv'

export default function CalibrationScreen() {
  const [calibrator] = useState(() => new VisionScanCalibrator(true))
  const [currentPointIndex, setCurrentPointIndex] = useState(0)
  const [calibrationPoints] = useState(VisionScanCalibrator.getCalibrationPoints())
  const [isCapturing, setIsCapturing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState<CalibrationResult | null>(null)

  const currentPoint = calibrationPoints[currentPointIndex]

  useEffect(() => {
    if (currentPointIndex < calibrationPoints.length && !isComplete) {
      const timer = setTimeout(() => {
        captureSample()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [currentPointIndex])

  const captureSample = () => {
    setIsCapturing(true)

    const sample: GazeCalibrationSample = {
      timestamp: Date.now(),
      targetPoint: currentPoint,
      leftEyeGaze: { x: Math.random() * 390, y: Math.random() * 844 },
      rightEyeGaze: { x: Math.random() * 390, y: Math.random() * 844 },
      headPose: { pitch: 0, yaw: 0, roll: 0 },
      faceDistance: 500,
      quality: 0.8 + Math.random() * 0.2,
    }

    calibrator.addSample(sample)

    setTimeout(() => {
      setIsCapturing(false)

      if (currentPointIndex < calibrationPoints.length - 1) {
        setCurrentPointIndex(currentPointIndex + 1)
      } else {
        const calibrationResult = calibrator.computeCalibration()
        setResult(calibrationResult)
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
    setCurrentPointIndex(0)
    setIsComplete(false)
    setResult(null)
  }

  if (isComplete && result) {
    return (
      <View style={styles.container}>
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
              <Text style={styles.resultLabel}>Status</Text>
              <Text
                style={[
                  styles.resultValue,
                  { color: result.isValid ? '#10B981' : '#EF4444' },
                ]}
              >
                {result.isValid ? 'Valid' : 'Invalid'}
              </Text>
            </View>
          </View>

          {result.isValid ? (
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continue to Alignment</Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>
                  Calibration error too high. Please retry with stable head position.
                </Text>
              </View>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Retry Calibration</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Follow the dots with your eyes. Keep your head still.
        </Text>
        <Text style={styles.progressText}>
          Point {currentPointIndex + 1} of {calibrationPoints.length}
        </Text>
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
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  instructions: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#374151',
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
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
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
  resultCard: {
    width: '100%',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
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
