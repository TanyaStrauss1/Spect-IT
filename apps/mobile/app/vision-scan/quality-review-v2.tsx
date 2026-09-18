/**
 * Quality Review Screen V2 - Closed-Loop Controller
 * 
 * Enhanced quality review using ExamController state with:
 * - Per-module confidence + uncertainty tracking
 * - Adaptive coaching prompts
 * - Stopping rule status
 * - Inconclusive module handling
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { useVisionScan } from '../../lib/vision-scan/vision-scan-context'
import { ProgressStepper } from '../../components/vision-scan/ProgressStepper'
import { ModuleStateCard } from '../../components/vision-scan/ModuleStateCard'
import type { ModuleName } from '@spect-it/cv'

export default function QualityReviewV2Screen() {
  const { examController, completeSession } = useVisionScan()

  if (!examController) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>ExamController not initialized</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const moduleStates = examController.getAllModuleStates()
  const summary = examController.generateScreeningSummary()

  const handleRepeatModule = (moduleName: ModuleName) => {
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
    const hasInconclusiveModules = summary.inconclusiveModules.length > 0
    const modulesNeedingRetry = Array.from(moduleStates.values()).filter(
      (s) => s.status === 'needs-retry'
    )

    if (hasInconclusiveModules || modulesNeedingRetry.length > 0) {
      Alert.alert(
        'Proceed with Limited Data?',
        `${summary.inconclusiveModules.length} module(s) are inconclusive and ${modulesNeedingRetry.length} could be retried.\n\nResults will include uncertainty information and recommend professional examination.\n\nProceed anyway?`,
        [
          { text: 'Go Back', style: 'cancel' },
          {
            text: 'Proceed',
            style: 'destructive',
            onPress: () => {
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
    if (confidence >= 0.7) return '#3B82F6'
    if (confidence >= 0.6) return '#F59E0B'
    return '#EF4444'
  }

  const allModulesComplete = Array.from(moduleStates.values()).every(
    (s) => s.status === 'complete' || s.status === 'inconclusive'
  )

  return (
    <ScrollView style={styles.container}>
      <ProgressStepper currentStep="quality-review" />
      <View style={styles.content}>
        <Text
          style={styles.icon}
          accessibilityLabel={allModulesComplete ? 'Info' : 'Warning'}
        >
          {summary.inconclusiveModules.length === 0 ? '✓' : '⚠️'}
        </Text>
        <Text style={styles.title} accessibilityRole="header">
          Quality Review
        </Text>
        <Text style={styles.subtitle}>Closed-Loop Assessment</Text>

        {/* Overall Confidence Card */}
        <View style={styles.overallCard}>
          <Text style={styles.overallLabel}>Overall Confidence</Text>
          <Text
            style={[
              styles.overallValue,
              { color: getConfidenceColor(summary.overallConfidence) },
            ]}
          >
            {(summary.overallConfidence * 100).toFixed(0)}%
          </Text>
          <Text style={styles.overallNote}>{summary.screeningNote}</Text>
        </View>

        {/* Inconclusive Modules Alert */}
        {summary.inconclusiveModules.length > 0 && (
          <View style={styles.alertCard}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <Text style={styles.alertTitle}>
              {summary.inconclusiveModules.length} Inconclusive Module(s)
            </Text>
            <Text style={styles.alertText}>
              These modules reached maximum retry attempts without achieving target
              confidence. Results will be marked as requiring professional
              examination.
            </Text>
          </View>
        )}

        {/* Module States */}
        <View style={styles.modulesSection}>
          <Text style={styles.modulesTitle}>Module Details</Text>
          {Array.from(moduleStates.entries()).map(([moduleName, state]) => (
            <ModuleStateCard
              key={moduleName}
              moduleState={state}
              onRepeat={
                state.status === 'needs-retry'
                  ? () => handleRepeatModule(moduleName)
                  : undefined
              }
            />
          ))}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={[
            styles.proceedButton,
            {
              backgroundColor:
                summary.inconclusiveModules.length === 0 ? '#4F46E5' : '#F59E0B',
            },
          ]}
          onPress={handleProceedToResults}
          accessibilityRole="button"
          accessibilityLabel="View Results"
        >
          <Text style={styles.proceedButtonText}>
            {summary.inconclusiveModules.length === 0
              ? '✓ View Results'
              : '⚠️ View Results (Limited Data)'}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  overallCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  overallLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  overallValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  overallNote: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
  },
  alertCard: {
    width: '100%',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  alertIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertText: {
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 20,
  },
  modulesSection: {
    width: '100%',
    marginBottom: 24,
  },
  modulesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
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
