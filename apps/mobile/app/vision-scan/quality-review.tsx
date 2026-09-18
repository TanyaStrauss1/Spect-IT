/**
 * Quality Review & Selective Repeat Screen
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useVisionScan } from '../../lib/vision-scan/vision-scan-context'

export default function QualityReviewScreen() {
  const { qualityAssessment, completeSession } = useVisionScan()

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
    switch (moduleName) {
      case 'device-qualification':
        router.push('/vision-scan/qualification')
        break
      case 'calibration':
        router.push('/vision-scan/calibration')
        break
      case 'alignment':
        router.push('/vision-scan/alignment')
        break
      case 'motility':
        router.push('/vision-scan/motility')
        break
      case 'convergence':
        router.push('/vision-scan/convergence')
        break
    }
  }

  const handleProceedToResults = () => {
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
      'alignment': 'Resting Alignment',
      'motility': 'Ocular Motility',
      'convergence': 'Convergence Test',
    }
    return names[moduleName] || moduleName
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>{allModulesGood ? '✓' : '⚠️'}</Text>
        <Text style={styles.title}>Quality Review</Text>

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
          {qualityAssessment.modules.map((module) => (
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

              {module.qualityIssues.length > 0 && (
                <View style={styles.issuesList}>
                  {module.qualityIssues.map((issue, idx) => (
                    <Text key={idx} style={styles.issue}>
                      • {issue}
                    </Text>
                  ))}
                </View>
              )}

              {module.shouldRepeat && (
                <TouchableOpacity
                  style={styles.repeatButton}
                  onPress={() => handleRepeatModule(module.module)}
                >
                  <Text style={styles.repeatButtonText}>Repeat This Module</Text>
                </TouchableOpacity>
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
        >
          <Text style={styles.proceedButtonText}>
            {allModulesGood ? 'View Results' : 'Proceed with Current Data'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.push('/vision-scan')}
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
  },
  issue: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  repeatButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  repeatButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  proceedButton: {
    width: '100%',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
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
