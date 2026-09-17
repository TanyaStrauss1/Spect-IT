/**
 * 9-Position Ocular Motility Screen
 */

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { MotilityTracker, type GazePosition, type MotilityFrame } from '@spect-it/cv'

export default function MotilityScreen() {
  const [tracker] = useState(() => new MotilityTracker(true))
  const [sequence] = useState(MotilityTracker.getGazeSequence())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [frameCount, setFrameCount] = useState(0)
  const framesPerPosition = 10

  const currentPosition = sequence[currentIndex]

  useEffect(() => {
    if (currentIndex < sequence.length) {
      const interval = setInterval(() => {
        const frame: MotilityFrame = {
          timestamp: Date.now(),
          targetPosition: currentPosition,
          leftEye: {
            x: getPositionCoord(currentPosition).x + (Math.random() - 0.5) * 2,
            y: getPositionCoord(currentPosition).y + (Math.random() - 0.5) * 2,
            z: 500,
          },
          rightEye: {
            x: getPositionCoord(currentPosition).x + (Math.random() - 0.5) * 2,
            y: getPositionCoord(currentPosition).y + (Math.random() - 0.5) * 2,
            z: 500,
          },
          headMotion: {
            pitch: (Math.random() - 0.5) * 3,
            yaw: (Math.random() - 0.5) * 3,
            roll: (Math.random() - 0.5) * 2,
          },
          headDisplacement: Math.random() * 30,
          quality: 0.8 + Math.random() * 0.2,
          rejected: false,
        }

        tracker.addFrame(frame)
        setFrameCount((prev) => prev + 1)

        if (frameCount >= framesPerPosition - 1) {
          setFrameCount(0)
          if (currentIndex < sequence.length - 1) {
            setCurrentIndex(currentIndex + 1)
          } else {
            const result = tracker.computeResult()
            router.push({
              pathname: '/vision-scan/convergence',
              params: { motilityComplete: 'true' },
            })
          }
        }
      }, 150)

      return () => clearInterval(interval)
    }
  }, [currentIndex, frameCount])

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
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Follow the moving dot with your eyes. Keep your head still.
        </Text>
        <Text style={styles.progressText}>
          Position {currentIndex + 1} of {sequence.length}
        </Text>
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

      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, { width: `${((currentIndex + 1) / sequence.length) * 100}%` }]}
        />
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
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    margin: 20,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
})
