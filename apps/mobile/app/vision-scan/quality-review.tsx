/**
 * Quality Review & Selective Repeat Screen
 * P3: Clearer module issues with categorized rejection reasons, one-tap re-run, skip with acknowledgment
 * P3.5: Cap repeat attempts (max 2 per module), auto-return after repeat
 */

import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { useVisionScan } from '../../lib/vision-scan/vision-scan-context'
import { ProgressStepper } from '../../components/vision-scan/ProgressStepper'
import { ModuleStateCard } from '../../components/vision-scan/ModuleStateCard'
import type { ModuleName, RejectionCategory } from '@spect-it/cv'

const MAX_REPEAT_ATTEMPTS = 2

const getCategoryIcon = (category: RejectionCategory): string => {
  const icons: Record<RejectionCategory, string> = {
    'ambient-light': '💡',
    'motion': '🎯',
    'face-distance': '↔️',
    'face-detection': '👤',
    'occlusion': '🚫',
    'low-confidence': '⚠️',
    'insufficient-data': '📊',
  }
  return icons[category] || '•'
}

const getCategoryColor = (category: RejectionCategory): string => {
  const colors: Record<RejectionCategory, string> = {
    'ambient-light': '#F59E0B',
    'motion': '#EF4444',
    'face-distance': '#F59E0B',
    'face-detection': '#F59E0B',
    'occlusion': '#EF4444',
    'low-confidence': '#6B7280',
    'insufficient-data': '#6B7280',
  }
  return colors[category] || '#6B7280'
}

const getCategoryLabel = (category: RejectionCategory): string => {
  const labels: Record<RejectionCategory, string> = {
    'ambient-light': 'Lighting Issue',
    'motion': 'Motion Detected',
    'face-distance': 'Distance Issue',
    'face-detection': 'Face Visibility',
    'occlusion': 'Obstruction',
    'low-confidence': 'Low Confidence',
    'insufficient-data': 'Insufficient Data',
  }
  return labels[category] || 'Quality Issue'
}

export default function QualityReviewScreen() {
  const { qualityAssessment, completeSession, repeatAttempts, examController, getModuleState } = useVisionScan()
  const [acknowledgedProceed, setAcknowledgedProceed] = useState(false)

  if (!qualityAssessment) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No quality assessment available</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const modulesNeedingRepeat = qualityAssessment.modules.filter((m) => m.shouldRepeat)
  const allModulesGood = modulesNeedingRepeat.length === 0

  const handleRepeatModule = (moduleName: string) => {
    const attempts = repeatAttempts[moduleName as ModuleName] || 0
    
    if (attempts >= MAX_REPEAT_ATTEMPTS) {
      Alert.alert(
        'Maximum Repeats Reached',
        `You've already repeated ${moduleName} ${MAX_REPEAT_ATTEMPTS} times. Proceeding with current data is recommended.`,
        [{ text: 'OK' }]
      )
      return
    }

    switch (moduleName) {
      case 'device-qualification':
        router.push('/vision-scan/qualification')
        break
      case 'calibration':
        router.push('/vision-scan/calibration')
        break
      case 'fixation-capture':
        router.push('/vision-scan/fixation-capture')
        break
      case 'alignment':
        router.push('/vision-scan/alignment')
        break
      case 'cover-uncover':
        router.push('/vision-scan/cover-uncover')
        break
      case 'motility':
        router.push('/vision-scan/motility')
        break
      case 'convergence':
        router.push('/vision-scan/convergence')
        break
      case 'pupil-examination':
        router.push('/vision-scan/pupil-examination')
        break
    }
  }

  const handleProceedToResults = () => {
    if (!allModulesGood && !acknowledgedProceed) {
      Alert.alert(
        'Proceed with Limited Data?',
        'Some modules have low quality data. Results may be less reliable. Repeating recommended modules will improve accuracy.\n\nProceed anyway?',
        [
          { text: 'Go Back', style: 'cancel' },
          {
            text: 'Proceed Anyway',
            style: 'destructive',
            onPress: () => {
              setAcknowledgedProceed(true)
              completeSession()
              router.push('/vision-scan/results')
            },
          },
        ]
      )
      return
    }

    completeSession()
    router.push('/vision-scan/results')
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10B981'
    if (confidence >= 0.65) return '#3B82F6'
    if (confidence >= 0.5) return '#F59E0B'
    return '#EF4444'
  }

  const getModuleDisplayName = (moduleName: string) => {
    const names: Record<string, string> = {
      'device-qualification': 'Device Qualification',
      'calibration': 'Eye Calibration',
      'fixation-capture': 'Fixation Capture',
      'alignment': 'Resting Alignment',
      'motility': 'Ocular Motility',
      'convergence': 'Convergence Test',
    }
    return names[moduleName] || moduleName
  }

  return (
    <ScrollView style={styles.container}>
      <ProgressStepper currentStep="quality-review" />
      <View style={styles.content}>
        <Text style={styles.icon} accessibilityLabel={allModulesGood ? 'Success' : 'Warning'}>
          {allModulesGood ? '✓' : '⚠️'}
        </Text>
        <Text style={styles.title} accessibilityRole="header">Quality Review</Text>

        <View style={styles.overallCard}>
          <Text style={styles.overallLabel}>Overall Data Quality</Text>
          <Text
            style={[
              styles.overallValue,
              { color: getConfidenceColor(qualityAssessment.overallConfidence) },
            ]}
          >
            {(qualityAssessment.overallConfidence * 100).toFixed(0)}%
          </Text>
        </View>

        {allModulesGood ? (
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>All Modules Passed</Text>
            <Text style={styles.successText}>
              All screening modules captured sufficient data quality. You can proceed to view your results.
            </Text>
          </View>
        ) : (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Some Modules Need Attention</Text>
            <Text style={styles.warningText}>
              {modulesNeedingRepeat.length} module(s) had low data quality. You can repeat them now for better results, or proceed with current data.
            </Text>
          </View>
        )}

        <View style={styles.modulesCard}>
          <Text style={styles.modulesTitle}>Module Quality Details</Text>
          
          {/* Show controller state if available */}
          {examController && (
            <>
              {qualityAssessment.modules.map((module) => {
                const moduleState = getModuleState(module.module as ModuleName)
                if (moduleState) {
                  return (
                    <ModuleStateCard
                      key={module.module}
                      moduleState={moduleState}
                      onRepeat={() => handleRepeatModule(module.module)}
                    />
                  )
                }
                return null
              })}
            </>
          )}
          
          {/* Fallback to original rendering if no controller */}
          {!examController && qualityAssessment.modules.map((module) => (
            <View key={module.module} style={styles.moduleRow}>
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleName}>
                  {getModuleDisplayName(module.module)}
                </Text>
                <View style={styles.moduleConfidenceBadge}>
                  <Text
                    style={[
                      styles.moduleConfidence,
                      { color: getConfidenceColor(module.confidence) },
                    ]}
                  >
                    {(module.confidence * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>

              {module.shouldRepeat && module.rejectionReason && (
                <View style={[styles.rejectionBanner, { borderColor: getCategoryColor(module.rejectionReason) }]}>
                  <Text style={styles.rejectionIcon}>{getCategoryIcon(module.rejectionReason)}</Text>
                  <Text style={[styles.rejectionText, { color: getCategoryColor(module.rejectionReason) }]}>
                    Primary issue: {getCategoryLabel(module.rejectionReason)}
                  </Text>
                </View>
              )}

              {module.qualityIssues.length > 0 && (
                <View style={styles.issuesList}>
                  {module.qualityIssues.map((issue, idx) => (
                    <View key={idx} style={styles.issueCard}>
                      <View style={styles.issueHeader}>
                        <Text style={styles.categoryIcon}>{getCategoryIcon(issue.category)}</Text>
                        <Text 
                          style={[styles.categoryLabel, { color: getCategoryColor(issue.category) }]}
                        >
                          {getCategoryLabel(issue.category)}
                        </Text>
                      </View>
                      <Text style={styles.issueMessage} accessibilityRole="text">
                        {issue.message}
                      </Text>
                      {issue.actionable && (
                        <Text style={styles.issueActionable}>
                          ▸ {issue.actionable}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {module.shouldRepeat && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.repeatButton,
                      (repeatAttempts[module.module as ModuleName] || 0) >= MAX_REPEAT_ATTEMPTS && styles.repeatButtonDisabled
                    ]}
                    onPress={() => handleRepeatModule(module.module)}
                    accessibilityRole="button"
                    accessibilityLabel={`Repeat ${getModuleDisplayName(module.module)}`}
                    accessibilityHint="Tap to re-run this module with improved quality"
                    disabled={(repeatAttempts[module.module as ModuleName] || 0) >= MAX_REPEAT_ATTEMPTS}
                  >
                    <Text style={[
                      styles.repeatButtonText,
                      (repeatAttempts[module.module as ModuleName] || 0) >= MAX_REPEAT_ATTEMPTS && styles.repeatButtonTextDisabled
                    ]}>
                      🔄 Repeat Now
                    </Text>
                  </TouchableOpacity>
                  {repeatAttempts[module.module as ModuleName] > 0 && (
                    <Text style={styles.attemptCount}>
                      Attempt {repeatAttempts[module.module as ModuleName]}/{MAX_REPEAT_ATTEMPTS}
                    </Text>
                  )}
                </>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.proceedButton,
            { backgroundColor: allModulesGood ? '#4F46E5' : '#F59E0B' },
          ]}
          onPress={handleProceedToResults}
          accessibilityRole="button"
          accessibilityLabel={allModulesGood ? 'View Results' : 'Proceed with current data'}
          accessibilityHint={allModulesGood ? 'All modules passed' : 'Some modules need attention. Will prompt for confirmation.'}
        >
          <Text style={styles.proceedButtonText}>
            {allModulesGood ? '✓ View Results' : '⚠️ Proceed Anyway'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.push('/vision-scan')}
          accessibilityRole="button"
          accessibilityLabel="Cancel scan"
        >
          <Text style={styles.cancelButtonText}>Cancel Scan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginTop: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  overallCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  overallLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  overallValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  successCard: {
    width: '100%',
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  warningCard: {
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  modulesCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  modulesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  moduleRow: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  rejectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  rejectionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  rejectionText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  moduleConfidenceBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moduleConfidence: {
    fontSize: 14,
    fontWeight: '600',
  },
  issuesList: {
    marginBottom: 12,
    gap: 8,
  },
  issueCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6B7280',
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  issueMessage: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 6,
  },
  issueActionable: {
    fontSize: 13,
    color: '#4F46E5',
    lineHeight: 18,
    fontWeight: '500',
    paddingLeft: 8,
  },
  issue: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  repeatButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  repeatButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
  repeatButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  repeatButtonTextDisabled: {
    color: '#9CA3AF',
  },
  attemptCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  proceedButton: {
    width: '100%',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 56,
    justifyContent: 'center',
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    padding: 16,
  },
  backButtonText: {
    color: '#4F46E5',
    fontSize: 16,
  },
})
