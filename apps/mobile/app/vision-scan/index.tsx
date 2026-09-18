/**
 * Vision Scan - Entry Point
 * 
 * Self-administered smartphone eye-screening sequence.
 * Prototype 1: Device qualification, calibration, alignment, motility, convergence.
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useVisionScan } from '../../lib/vision-scan/vision-scan-context'
import { useParticipant } from '../../lib/participants/participant-context'

export default function VisionScanHome() {
  const { startSession, resetSession } = useVisionScan()
  const { activeParticipant } = useParticipant()

  const handleStart = () => {
    resetSession() // Clear any previous session
    startSession(activeParticipant?.id || null)
    router.push('/vision-scan/qualification')
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>👁️</Text>
        <Text style={styles.title}>Vision Scan</Text>
        {activeParticipant && (
          <Text style={styles.participantBadge}>
            For: {activeParticipant.display_name}
          </Text>
        )}
        <Text style={styles.subtitle}>
          Comprehensive Eye Function Screening
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What This Test Includes</Text>
          <View style={styles.moduleList}>
            <Text style={styles.module}>✓ Device & Environment Qualification</Text>
            <Text style={styles.module}>✓ Eye Tracking Calibration</Text>
            <Text style={styles.module}>✓ Resting Eye Alignment</Text>
            <Text style={styles.module}>✓ 9-Position Ocular Motility</Text>
            <Text style={styles.module}>✓ Dynamic Convergence Test</Text>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>ℹ️</Text>
          <Text style={styles.warningText}>
            This is a screening tool, not a diagnostic test. Results flag potential
            issues that warrant professional examination. This test does not diagnose
            eye diseases or provide spectacle prescriptions.
          </Text>
        </View>

        <View style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>Requirements</Text>
          <Text style={styles.requirement}>• Well-lit environment</Text>
          <Text style={styles.requirement}>• 3-5 minutes uninterrupted</Text>
          <Text style={styles.requirement}>• Hold device 40-60cm from face</Text>
          <Text style={styles.requirement}>• Keep head stable during tests</Text>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Begin Vision Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Home</Text>
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
    marginBottom: 8,
  },
  participantBadge: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  infoCard: {
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
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  moduleList: {
    gap: 8,
  },
  module: {
    fontSize: 16,
    color: '#4F46E5',
    lineHeight: 24,
  },
  warningCard: {
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  requirementsCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  requirement: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 24,
  },
  startButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
})
