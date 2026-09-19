/**
 * Motion Gate Alert
 * Real-time feedback when motion detection fails quality gates
 */

import { View, Text, StyleSheet, Animated } from 'react-native'
import { useEffect, useRef } from 'react'

export type MotionLevel = 'stable' | 'slight-motion' | 'moderate-motion' | 'excessive-motion'

export interface MotionGateAlertProps {
  headMotion?: { pitch: number; yaw: number; roll: number } // degrees/sec
  headDisplacement?: number // pixels
  isVisible?: boolean
}

export function MotionGateAlert({
  headMotion,
  headDisplacement = 0,
  isVisible = true,
}: MotionGateAlertProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(-100)).current

  const getMotionLevel = (): MotionLevel => {
    if (!headMotion) return 'stable'

    const totalMotion = Math.abs(headMotion.pitch) + Math.abs(headMotion.yaw) + Math.abs(headMotion.roll)

    // Also consider head displacement
    const displacementScore = headDisplacement > 50 ? 3 : headDisplacement > 30 ? 2 : headDisplacement > 15 ? 1 : 0

    if (totalMotion > 15 || displacementScore >= 3) return 'excessive-motion'
    if (totalMotion > 8 || displacementScore >= 2) return 'moderate-motion'
    if (totalMotion > 3 || displacementScore >= 1) return 'slight-motion'
    return 'stable'
  }

  const level = getMotionLevel()
  const showAlert = level === 'moderate-motion' || level === 'excessive-motion'

  useEffect(() => {
    if (isVisible && showAlert) {
      // Slide in
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start()

      // Pulse for attention (more intense for excessive motion)
      const pulseDuration = level === 'excessive-motion' ? 600 : 1000
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: level === 'excessive-motion' ? 1.08 : 1.04,
            duration: pulseDuration,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: pulseDuration,
            useNativeDriver: true,
          }),
        ])
      ).start()
    } else {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start()
      pulseAnim.setValue(1)
    }
  }, [isVisible, showAlert, level])

  if (!isVisible || !showAlert) {
    return null
  }

  const getConfig = () => {
    if (level === 'excessive-motion') {
      return {
        color: '#EF4444',
        icon: '⚠️',
        title: 'Excessive Motion',
        message: 'Head movement too high for accurate screening',
        actionable: 'Hold device very still or prop against a stable surface',
        bgColor: '#FEE2E2',
      }
    }
    if (level === 'moderate-motion') {
      return {
        color: '#F59E0B',
        icon: '🎯',
        title: 'Motion Detected',
        message: 'Screening quality may be affected',
        actionable: 'Keep your head still, only move your eyes',
        bgColor: '#FEF3C7',
      }
    }
    return {
      color: '#10B981',
      icon: '✓',
      title: 'Stable',
      message: '',
      actionable: '',
      bgColor: '#D1FAE5',
    }
  }

  const config = getConfig()

  // Calculate motion intensity for visual bar (0-100)
  const motionIntensity = headMotion
    ? Math.min(100, ((Math.abs(headMotion.pitch) + Math.abs(headMotion.yaw) + Math.abs(headMotion.roll)) / 20) * 100)
    : 0

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          borderColor: config.color,
          transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{config.icon}</Text>
        <View style={styles.content}>
          <Text style={[styles.title, { color: config.color }]}>{config.title}</Text>
          {config.message ? (
            <Text style={[styles.message, { color: config.color }]}>{config.message}</Text>
          ) : null}
        </View>
      </View>
      {config.actionable ? (
        <View style={styles.actionBar}>
          <Text style={[styles.actionText, { color: config.color }]}>
            ▸ {config.actionable}
          </Text>
        </View>
      ) : null}
      <View style={styles.motionBar}>
        <View style={styles.motionBarTrack}>
          <View
            style={[
              styles.motionBarFill,
              {
                width: `${motionIntensity}%`,
                backgroundColor: config.color,
              },
            ]}
          />
        </View>
        <Text style={[styles.motionText, { color: config.color }]}>
          {headMotion
            ? `${(Math.abs(headMotion.pitch) + Math.abs(headMotion.yaw) + Math.abs(headMotion.roll)).toFixed(1)}°/s`
            : '0°/s'}
        </Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 160,
    left: 16,
    right: 16,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 19,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 28,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    opacity: 0.9,
  },
  actionBar: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  motionBar: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  motionBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  motionBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  motionText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
})
