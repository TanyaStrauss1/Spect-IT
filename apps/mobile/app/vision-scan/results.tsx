/**
 * Vision Scan Results Screen
 * 
 * Displays screening results with appropriate messaging.
 * Screening language only - no diagnoses or Rx.
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { router } from 'expo-router'

export default function ResultsScreen() {
  const mockResults = {
    timestamp: Date.now(),
    overallConfidence: 0.82,
    recommendsProfessionalExam: false,
    modules: [
      {
        name: 'Device Qualification',
        status: 'Excellent',
        note: 'High-quality sensor data captured.',
      },
      {
        name: 'Calibration',
        status: 'Valid',
        note: 'Average error 23.4px, max error 48.2px.',
      },
      {
        name: 'Resting Alignment',
        status: 'Normal',
        note: 'No significant alignment deviation detected.',
      },
      {
        name: 'Ocular Motility',
        status: 'Normal',
        note: 'Ocular motility appears normal.',
      },
      {
        name: 'Convergence',
        status: 'Normal',
        note: 'Convergence function appears normal.',
      },
    ],
    capabilityMode: 'full',
    usedSensors: true,
  }

  const handleReturnHome = () => {
    router.push('/')
  }

  const handleRepeatScan = () => {
    router.push('/vision-scan')
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>
          {mockResults.recommendsProfessionalExam ? '⚠️' : '✓'}
        </Text>
        <Text style={styles.title}>Vision Scan Complete</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Screening Summary</Text>
          <Text style={styles.summaryText}>
            {mockResults.recommendsProfessionalExam
              ? 'Some variations detected. Professional eye examination recommended.'
              : 'No significant issues detected in this screening. Continue regular eye care.'}
          </Text>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceLabel}>Data Quality</Text>
            <Text style={styles.confidenceValue}>
              {(mockResults.overallConfidence * 100).toFixed(0)}%
            </Text>
          </View>
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Important Notice</Text>
          <Text style={styles.disclaimerText}>
            This is a screening tool, not a diagnostic test. It does not diagnose eye
            diseases or provide spectacle prescriptions. Results flag potential issues
            that warrant professional examination.
          </Text>
        </View>

        <View style={styles.modulesCard}>
          <Text style={styles.modulesTitle}>Module Results</Text>
          {mockResults.modules.map((module, index) => (
            <View key={index} style={styles.moduleRow}>
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleName}>{module.name}</Text>
                <Text
                  style={[
                    styles.moduleStatus,
                    {
                      color:
                        module.status === 'Normal' || module.status === 'Excellent'
                          ? '#10B981'
                          : module.status === 'Valid'
                          ? '#3B82F6'
                          : '#F59E0B',
                    },
                  ]}
                >
                  {module.status}
                </Text>
              </View>
              <Text style={styles.moduleNote}>{module.note}</Text>
            </View>
          ))}
        </View>

        <View style={styles.capabilityCard}>
          <Text style={styles.capabilityTitle}>Measurement Mode</Text>
          <Text style={styles.capabilityText}>
            {mockResults.capabilityMode === 'full'
              ? 'Full sensor-based measurements used for highest accuracy.'
              : 'Degraded mode (estimated measurements). Results are screening-level only.'}
          </Text>
        </View>

        <View style={styles.patentCard}>
          <Text style={styles.patentTitle}>Technical Innovation</Text>
          <Text style={styles.patentText}>
            This screening uses synchronized multi-sensor data (eye position, gaze,
            depth, head pose, device motion) with quality gating and multi-parameter
            analysis to generate a comprehensive ocular function profile.
          </Text>
        </View>

        <TouchableOpacity style={styles.homeButton} onPress={handleReturnHome}>
          <Text style={styles.homeButtonText}>Return to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.repeatButton} onPress={handleRepeatScan}>
          <Text style={styles.repeatButtonText}>Repeat Vision Scan</Text>
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
    fontSize: 80,
    marginTop: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  confidenceBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F46E5',
  },
  disclaimerCard: {
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  modulesCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  modulesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  moduleRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  moduleStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  moduleNote: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  capabilityCard: {
    width: '100%',
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  capabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  capabilityText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  patentCard: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  patentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  patentText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  homeButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  repeatButton: {
    width: '100%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4F46E5',
    marginBottom: 40,
  },
  repeatButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
})
