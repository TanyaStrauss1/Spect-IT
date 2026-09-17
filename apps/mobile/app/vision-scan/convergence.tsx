/**
 * Dynamic Convergence Screen
 * 
 * User moves phone closer and farther while looking at fixation target.
 */

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { ConvergenceTracker, type ConvergenceFrame } from '@spect-it/cv'

export default function ConvergenceScreen() {
  const [tracker] = useState(() => new ConvergenceTracker(true))
  const [phase, setPhase] = useState<'approach' | 'recede' | 'complete'>('approach')
  const [distance, setDistance] = useState(600)
  const [frameCount, setFrameCount] = useState(0)

  useEffect(() => {
    if (phase === 'approach' || phase === 'recede') {
      const interval = setInterval(() => {
        let newDistance = distance
        if (phase === 'approach') {
          newDistance = Math.max(100, distance - 10)
        } else {
          newDistance = Math.min(600, distance + 10)
        }
        setDistance(newDistance)

        const frame: ConvergenceFrame = {
          timestamp: Date.now(),
          faceDistance: newDistance,
          leftEye: {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
            z: newDistance,
          },
          rightEye: {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
            z: newDistance,
          },
          vergenceAngle: 65 / newDistance * 1000,
          quality: 0.8 + Math.random() * 0.2,
        }

        tracker.addFrame(frame)
        setFrameCount((prev) => prev + 1)

        if (phase === 'approach' && newDistance <= 100) {
          tracker.setPhase('recede')
          setPhase('recede')
        } else if (phase === 'recede' && newDistance >= 600) {
          setPhase('complete')
        }
      }, 100)

      return () => clearInterval(interval)
    }
  }, [phase, distance, frameCount])

  const handleViewResults = () => {
    const result = tracker.computeResult()
    router.push('/vision-scan/results')
  }

  if (phase === 'complete') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>✓</Text>
          <Text style={styles.title}>Convergence Complete</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              All vision scan modules completed. Tap below to view your screening results.
            </Text>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleViewResults}>
            <Text style={styles.continueButtonText}>View Results</Text>
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
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>{phaseText}</Text>
        <Text style={styles.distanceText}>Distance: {distance}mm</Text>
        <Text style={styles.phaseText}>
          Phase: {phase === 'approach' ? 'Approaching' : 'Receding'}
        </Text>
      </View>

      <View style={styles.convergenceArea}>
        <View style={styles.fixationTarget} />
        <Text style={styles.guideText}>Keep looking at the center dot</Text>
      </View>

      <View style={styles.distanceIndicator}>
        <View style={styles.distanceBar}>
          <View
            style={[styles.distanceMarker, { left: `${distancePercent}%` }]}
          />
        </View>
        <View style={styles.distanceLabels}>
          <Text style={styles.distanceLabel}>Far (600mm)</Text>
          <Text style={styles.distanceLabel}>Near (100mm)</Text>
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
  distanceText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  phaseText: {
    fontSize: 14,
    color: '#6B7280',
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
