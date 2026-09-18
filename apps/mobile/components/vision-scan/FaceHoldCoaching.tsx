/**
 * Face Hold Coaching - Real-time capture quality feedback
 * P5: Live visual indicator showing face detection, distance, and stability
 */

import { View, Text, StyleSheet, Animated } from 'react-native'
import { useEffect, useRef } from 'react'

export type FaceHoldStatus = 
  | 'no-face'
  | 'too-far'
  | 'too-close'
  | 'off-center'
  | 'head-motion'
  | 'good'
  | 'excellent'

export interface FaceHoldCoachingProps {
  status: FaceHoldStatus
  frameCount?: number
  targetFrames?: number
  isPaused?: boolean
}

export function FaceHoldCoaching({ 
  status, 
  frameCount = 0, 
  targetFrames = 30,
  isPaused = false 
}: FaceHoldCoachingProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (status === 'good' || status === 'excellent') {
      // Gentle pulse for good status
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start()
    } else {
      pulseAnim.setValue(1)
    }
  }, [status])

  const getStatusConfig = () => {
    if (isPaused) {
      return {
        color: '#F59E0B',
        icon: '⏸️',
        message: 'Paused - Waiting for face',
        detail: 'Position your face in the center'
      }
    }

    switch (status) {
      case 'no-face':
        return {
          color: '#EF4444',
          icon: '👤',
          message: 'No face detected',
          detail: 'Look directly at the screen'
        }
      case 'too-far':
        return {
          color: '#F59E0B',
          icon: '↔️',
          message: 'Move closer',
          detail: 'Device should be 40-60cm from face'
        }
      case 'too-close':
        return {
          color: '#F59E0B',
          icon: '↔️',
          message: 'Move back',
          detail: 'Device should be 40-60cm from face'
        }
      case 'off-center':
        return {
          color: '#F59E0B',
          icon: '↕️',
          message: 'Center your face',
          detail: 'Face should be in the middle of screen'
        }
      case 'head-motion':
        return {
          color: '#F59E0B',
          icon: '🎯',
          message: 'Hold steady',
          detail: 'Keep your head still'
        }
      case 'excellent':
        return {
          color: '#10B981',
          icon: '✓',
          message: 'Perfect!',
          detail: 'Capturing high-quality data'
        }
      case 'good':
        return {
          color: '#10B981',
          icon: '✓',
          message: 'Good position',
          detail: 'Keep holding steady'
        }
    }
  }

  const config = getStatusConfig()
  const progress = targetFrames > 0 ? (frameCount / targetFrames) * 100 : 0

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.statusCard,
          { 
            backgroundColor: config.color === '#EF4444' ? '#FEE2E2' :
                           config.color === '#F59E0B' ? '#FEF3C7' :
                           '#D1FAE5',
            borderColor: config.color,
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        <View style={styles.statusHeader}>
          <Text style={styles.statusIcon}>{config.icon}</Text>
          <View style={styles.statusTextContainer}>
            <Text style={[styles.statusMessage, { color: config.color }]}>
              {config.message}
            </Text>
            <Text style={[styles.statusDetail, { color: config.color }]}>
              {config.detail}
            </Text>
          </View>
        </View>

        {targetFrames > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progress}%`,
                    backgroundColor: config.color 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: config.color }]}>
              {frameCount}/{targetFrames} frames
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  statusCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statusDetail: {
    fontSize: 14,
    opacity: 0.9,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
})
