/**
 * Degraded Mode Banner
 * P5: Prominent notice when using camera-only (no TrueDepth/LiDAR) mode
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useState } from 'react'

export interface DegradedModeBannerProps {
  useSensorMode: boolean
}

export function DegradedModeBanner({ useSensorMode }: DegradedModeBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (useSensorMode) {
    // Full mode - show subtle positive banner
    return (
      <View style={styles.fullModeBanner}>
        <Text style={styles.fullModeIcon}>✓</Text>
        <Text style={styles.fullModeText}>
          Full sensor mode active
        </Text>
      </View>
    )
  }

  // Degraded mode - show prominent warning
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.banner}
        onPress={() => setIsExpanded(!isExpanded)}
        accessibilityRole="button"
        accessibilityLabel="Degraded mode notice"
        accessibilityHint="Tap to learn more about measurement accuracy"
      >
        <View style={styles.bannerHeader}>
          <Text style={styles.icon}>⚠️</Text>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Camera-Only Mode</Text>
            <Text style={styles.subtitle}>
              {isExpanded ? 'Tap to collapse' : 'Tap for details'}
            </Text>
          </View>
          <Text style={styles.chevron}>{isExpanded ? '▼' : '▶'}</Text>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.expandedText}>
              Your device lacks TrueDepth/LiDAR sensors. Vision Scan uses:
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Distance:</Text> Eye/face width estimation (not sensor)
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Gaze:</Text> Eye landmark positions (estimated angles)
            </Text>
            <Text style={styles.bulletPoint}>
              • <Text style={styles.bold}>Vergence:</Text> Pixel change between eyes (estimated)
            </Text>
            <Text style={styles.expandedText}>
              Results are <Text style={styles.bold}>screening-level only</Text> and less precise than sensor-based measurements.
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  banner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#92400E',
    opacity: 0.8,
  },
  chevron: {
    fontSize: 16,
    color: '#92400E',
    marginLeft: 8,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FCD34D',
  },
  expandedText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '600',
  },
  fullModeBanner: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
    zIndex: 10,
  },
  fullModeIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  fullModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
})
