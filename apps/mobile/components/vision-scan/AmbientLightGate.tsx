/**
 * Ambient Light Gate Alert
 * Real-time feedback when ambient lighting conditions fail quality gates
 */

import { View, Text, StyleSheet, Animated } from 'react-native'
import { useEffect, useRef } from 'react'

export type LightingLevel = 'excellent' | 'good' | 'low' | 'very-low' | 'too-bright'

export interface AmbientLightGateProps {
  lightingScore: number // 0-100
  isVisible?: boolean
}

export function AmbientLightGate({ lightingScore, isVisible = true }: AmbientLightGateProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(-100)).current

  const getLightingLevel = (): LightingLevel => {
    if (lightingScore >= 80) return 'excellent'
    if (lightingScore >= 65) return 'good'
    if (lightingScore >= 50) return 'low'
    if (lightingScore >= 30) return 'very-low'
    return 'very-low'
  }

  const level = getLightingLevel()
  const showAlert = level === 'low' || level === 'very-low' || level === 'too-bright'

  useEffect(() => {
    if (isVisible && showAlert) {
      // Slide in
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start()

      // Pulse for attention
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
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
  }, [isVisible, showAlert, lightingScore])

  if (!isVisible || !showAlert) {
    return null
  }

  const getConfig = () => {
    if (level === 'very-low') {
      return {
        color: '#EF4444',
        icon: '⚠️',
        title: 'Lighting Too Low',
        message: 'Data quality will be poor',
        actionable: 'Move to a brighter area or turn on lights',
        bgColor: '#FEE2E2',
      }
    }
    if (level === 'low') {
      return {
        color: '#F59E0B',
        icon: '💡',
        title: 'Low Lighting Detected',
        message: 'Screening accuracy may be reduced',
        actionable: 'Consider moving to better lighting',
        bgColor: '#FEF3C7',
      }
    }
    if (level === 'too-bright') {
      return {
        color: '#F59E0B',
        icon: '☀️',
        title: 'Lighting Too Bright',
        message: 'May cause glare or overexposure',
        actionable: 'Reduce direct lighting or move away from windows',
        bgColor: '#FEF3C7',
      }
    }
    return {
      color: '#10B981',
      icon: '✓',
      title: 'Good Lighting',
      message: '',
      actionable: '',
      bgColor: '#D1FAE5',
    }
  }

  const config = getConfig()

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
      accessibilityLiveRegion="polite"
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
      <View style={styles.scoreBar}>
        <View style={styles.scoreBarTrack}>
          <View
            style={[
              styles.scoreBarFill,
              {
                width: `${lightingScore}%`,
                backgroundColor: config.color,
              },
            ]}
          />
        </View>
        <Text style={[styles.scoreText, { color: config.color }]}>{lightingScore}/100</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
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
    zIndex: 20,
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
  scoreBar: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
})
