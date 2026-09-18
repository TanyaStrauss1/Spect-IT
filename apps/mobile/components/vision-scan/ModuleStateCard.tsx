/**
 * Module State Card
 * 
 * Displays per-module measurement state with confidence, uncertainty,
 * and stopping rule status. Part of closed-loop examination controller.
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import type { ModuleMeasurementState } from '@spect-it/cv'

type ModuleStateCardProps = {
  moduleState: ModuleMeasurementState
  onRepeat?: () => void
}

export function ModuleStateCard({ moduleState, onRepeat }: ModuleStateCardProps) {
  const getStatusIcon = () => {
    switch (moduleState.status) {
      case 'complete':
        return '✓'
      case 'inconclusive':
        return '⚠️'
      case 'needs-retry':
        return '🔄'
      case 'in-progress':
        return '⏳'
      default:
        return '○'
    }
  }

  const getStatusColor = () => {
    switch (moduleState.status) {
      case 'complete':
        return '#10B981'
      case 'inconclusive':
        return '#EF4444'
      case 'needs-retry':
        return '#F59E0B'
      case 'in-progress':
        return '#3B82F6'
      default:
        return '#9CA3AF'
    }
  }

  const getStatusText = () => {
    switch (moduleState.status) {
      case 'complete':
        return 'Complete'
      case 'inconclusive':
        return 'Inconclusive'
      case 'needs-retry':
        return 'Needs Retry'
      case 'in-progress':
        return 'In Progress'
      case 'retry-exhausted':
        return 'Max Attempts'
      default:
        return 'Not Started'
    }
  }

  const getModuleDisplayName = () => {
    const names: Record<string, string> = {
      'device-qualification': 'Device Qualification',
      'calibration': 'Eye Calibration',
      'alignment': 'Resting Alignment',
      'motility': 'Ocular Motility',
      'convergence': 'Convergence Test',
    }
    return names[moduleState.module] || moduleState.module
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10B981'
    if (confidence >= 0.65) return '#3B82F6'
    if (confidence >= 0.5) return '#F59E0B'
    return '#EF4444'
  }

  const showRetryButton =
    moduleState.status === 'needs-retry' &&
    moduleState.attemptNumber < moduleState.maxAttempts &&
    onRepeat

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={[styles.statusIcon, { color: getStatusColor() }]}>
            {getStatusIcon()}
          </Text>
          <Text style={styles.moduleName}>{getModuleDisplayName()}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Confidence</Text>
          <Text
            style={[
              styles.metricValue,
              { color: getConfidenceColor(moduleState.confidence) },
            ]}
          >
            {(moduleState.confidence * 100).toFixed(0)}%
          </Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Uncertainty</Text>
          <Text
            style={[
              styles.metricValue,
              {
                color: getConfidenceColor(
                  1 - moduleState.uncertainty.quantifiedUncertainty
                ),
              },
            ]}
          >
            {(moduleState.uncertainty.quantifiedUncertainty * 100).toFixed(0)}%
          </Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Samples</Text>
          <Text style={styles.metricValue}>
            {moduleState.samplesCollected}/{moduleState.targetSamples}
          </Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Attempts</Text>
          <Text style={styles.metricValue}>
            {moduleState.attemptNumber}/{moduleState.maxAttempts}
          </Text>
        </View>
      </View>

      {moduleState.uncertainty.lowSampleCount && (
        <View style={styles.uncertaintyBadge}>
          <Text style={styles.uncertaintyText}>⚠️ Low Sample Count</Text>
        </View>
      )}
      {moduleState.uncertainty.poorQuality && (
        <View style={styles.uncertaintyBadge}>
          <Text style={styles.uncertaintyText}>⚠️ Below Quality Threshold</Text>
        </View>
      )}
      {moduleState.uncertainty.excessiveMotion && (
        <View style={styles.uncertaintyBadge}>
          <Text style={styles.uncertaintyText}>⚠️ Excessive Motion Detected</Text>
        </View>
      )}
      {moduleState.uncertainty.environmentalFactors && (
        <View style={styles.uncertaintyBadge}>
          <Text style={styles.uncertaintyText}>⚠️ Environmental Issues</Text>
        </View>
      )}

      {moduleState.coachingPrompts.length > 0 && (
        <View style={styles.coachingSection}>
          <Text style={styles.coachingTitle}>Improvement Tips:</Text>
          {moduleState.coachingPrompts.slice(0, 3).map((prompt, idx) => (
            <Text key={idx} style={styles.coachingPrompt}>
              {prompt}
            </Text>
          ))}
        </View>
      )}

      {showRetryButton && (
        <TouchableOpacity style={styles.retryButton} onPress={onRepeat}>
          <Text style={styles.retryButtonText}>🔄 Retry with Coaching</Text>
        </TouchableOpacity>
      )}

      {moduleState.status === 'inconclusive' && (
        <View style={styles.inconclusiveNote}>
          <Text style={styles.inconclusiveText}>
            Maximum attempts reached. Results marked as inconclusive. Professional
            examination recommended.
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  uncertaintyBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  uncertaintyText: {
    fontSize: 12,
    color: '#92400E',
  },
  coachingSection: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  coachingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 6,
  },
  coachingPrompt: {
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 18,
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  inconclusiveNote: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  inconclusiveText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
  },
})
