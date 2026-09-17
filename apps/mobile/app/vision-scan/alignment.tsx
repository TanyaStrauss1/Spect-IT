/**
 * Resting Alignment / Central Fixation Screen
 */

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { AlignmentTracker, type AlignmentFrame, type AlignmentResult } from '@spect-it/cv'

export default function AlignmentScreen() {
  const [tracker] = useState(() => new AlignmentTracker(true))
  const [frameCount, setFrameCount] = useState(0)
  const [isCapturing, setIsCapturing] = useState(true)
  const [result, setResult] = useState<AlignmentResult | null>(null)
  const targetFrames = 30

  useEffect(() => {
    if (isCapturing && frameCount < targetFrames) {
      const interval = setInterval(() => {
        const frame: AlignmentFrame = {
          timestamp: Date.now(),
          leftEye: {
            x: (Math.random() - 0.5) * 5,
            y: (Math.random() - 0.5) * 5,
            z: 500,
          },
          rightEye: {
            x: (Math.random() - 0.5) * 5,
            y: (Math.random() - 0.5) * 5,
            z: 500,
          },
          headPose: { pitch: 0, yaw: 0, roll: 0 },
          faceDistance: 500,
          gazeDeviation: {
            left: (Math.random() - 0.5) * 4,
            right: (Math.random() - 0.5) * 4,
          },
          quality: 0.8 + Math.random() * 0.2,
        }

        tracker.addFrame(frame)
        setFrameCount((prev) => prev + 1)
      }, 100)

      return () => clearInterval(interval)
    } else if (frameCount >= targetFrames && isCapturing) {
      const alignmentResult = tracker.computeResult()
      setResult(alignmentResult)
      setIsCapturing(false)
    }
  }, [isCapturing, frameCount])

  const handleContinue = () => {
    router.push('/vision-scan/motility')
  }

  const handleRetry = () => {
    tracker.reset()
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
      <View style={styles.captureContainer}>
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Look at the center dot. Keep your head still.
          </Text>
          <Text style={styles.progressText}>
            Capturing alignment... {frameCount}/{targetFrames}
          </Text>
        </View>

        <View style={styles.fixationArea}>
          <View style={styles.fixationDot} />
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
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
  captureContainer: {
    flex: 1,
    justifyContent: 'space-between',
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
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    margin: 20,
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
