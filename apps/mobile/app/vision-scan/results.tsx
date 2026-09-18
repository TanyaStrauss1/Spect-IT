/**
 * Vision Scan Results Screen with Real Data & Supabase Persistence
 */

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { router } from 'expo-router'
import { useVisionScan } from '../../lib/vision-scan/vision-scan-context'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'
import type { VisionScanResult } from '@spect-it/cv'

export default function ResultsScreen() {
  const { buildFinalResult, resetSession } = useVisionScan()
  const { user } = useAuth()
  const [result, setResult] = useState<VisionScanResult | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const finalResult = buildFinalResult()
    if (finalResult) {
      setResult(finalResult)
      saveToSupabase(finalResult)
    }
  }, [])

  const saveToSupabase = async (scanResult: VisionScanResult) => {
    setIsSaving(true)
    
    try {
      const { error } = await supabase
        .from('test_results')
        .insert({
          user_email: user?.email || null,
          test_type: 'vision_scan',
          test_name: 'Vision Scan - Prototype 1',
          test_data: {
            sessionId: scanResult.timestamp.toString(),
            participantId: scanResult.participantId,
            deviceQualification: {
              quality: scanResult.deviceQualification.overallQuality,
              useSensorBasedMeasurements: scanResult.deviceQualification.useSensorBasedMeasurements,
              scores: {
                lighting: scanResult.deviceQualification.lightingScore,
                distance: scanResult.deviceQualification.distanceScore,
                stability: scanResult.deviceQualification.stabilityScore,
              },
            },
            calibration: {
              isValid: scanResult.calibration.isValid,
              averageError: scanResult.calibration.averageError,
              maxError: scanResult.calibration.maxError,
              usedSensorData: scanResult.calibration.usedSensorData,
            },
            alignment: {
              alignmentIndex: scanResult.alignment.alignmentIndex,
              meanDeviation: scanResult.alignment.meanDeviation,
              screeningNote: scanResult.alignment.screeningNote,
              usedSensorData: scanResult.alignment.usedSensorData,
            },
            motility: {
              excessiveHeadMotion: scanResult.motility.excessiveHeadMotion,
              screeningNote: scanResult.motility.screeningNote,
              usedSensorData: scanResult.motility.usedSensorData,
            },
            convergence: {
              nearPoint: scanResult.convergence.nearPoint,
              screeningNote: scanResult.convergence.screeningNote,
              usedSensorData: scanResult.convergence.usedSensorData,
            },
            qualityAssessment: {
              overallConfidence: scanResult.qualityAssessment.overallConfidence,
              moduleCount: scanResult.qualityAssessment.modules.length,
            },
            screeningSummary: scanResult.screeningSummary,
            recommendsProfessionalExam: scanResult.recommendsProfessionalExam,
            repeatAttempts: scanResult.repeatAttempts,
          },
          test_date: new Date(scanResult.timestamp).toISOString(),
          lidar_calibrated: scanResult.deviceQualification.capability.hasLiDAR || scanResult.deviceQualification.capability.hasTrueDepth,
        })

      if (error) {
        console.error('Error saving to Supabase:', error)
        Alert.alert('Save Warning', 'Results displayed but not saved to database.')
      } else {
        setIsSaved(true)
      }
    } catch (err) {
      console.error('Exception saving to Supabase:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReturnHome = () => {
    resetSession()
    router.push('/')
  }

  const handleRepeatScan = () => {
    resetSession()
    router.push('/vision-scan')
  }

  if (!result) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Generating results...</Text>
        </View>
      </View>
    )
  }

  const capabilityMode = result.deviceQualification.useSensorBasedMeasurements ? 'full' : 'degraded'

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>
          {result.recommendsProfessionalExam ? '⚠️' : '✓'}
        </Text>
        <Text style={styles.title}>Vision Scan Complete</Text>

        {isSaving && (
          <View style={styles.savingBadge}>
            <ActivityIndicator size="small" color="#4F46E5" />
            <Text style={styles.savingText}>Saving results...</Text>
          </View>
        )}

        {isSaved && (
          <View style={styles.savedBadge}>
            <Text style={styles.savedText}>✓ Results saved</Text>
          </View>
        )}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Screening Summary</Text>
          <Text style={styles.summaryText}>{result.screeningSummary}</Text>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceLabel}>Data Quality</Text>
            <Text style={styles.confidenceValue}>
              {(result.qualityAssessment.overallConfidence * 100).toFixed(0)}%
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
          
          <View style={styles.moduleRow}>
            <View style={styles.moduleHeader}>
              <Text style={styles.moduleName}>Device Qualification</Text>
              <Text style={[styles.moduleStatus, { color: '#3B82F6' }]}>
                {result.deviceQualification.overallQuality}
              </Text>
            </View>
            <Text style={styles.moduleNote}>
              Lighting: {result.deviceQualification.lightingScore}/100, 
              Distance: {result.deviceQualification.distanceScore}/100, 
              Stability: {result.deviceQualification.stabilityScore}/100
            </Text>
          </View>

          <View style={styles.moduleRow}>
            <View style={styles.moduleHeader}>
              <Text style={styles.moduleName}>Eye Calibration</Text>
              <Text style={[styles.moduleStatus, { color: result.calibration.isValid ? '#10B981' : '#F59E0B' }]}>
                {result.calibration.isValid ? 'Valid' : 'Below Threshold'}
              </Text>
            </View>
            <Text style={styles.moduleNote}>
              Average error {result.calibration.averageError.toFixed(1)}px, 
              max error {result.calibration.maxError.toFixed(1)}px
              {!result.calibration.usedSensorData && ' (face-based estimate)'}
            </Text>
          </View>

          <View style={styles.moduleRow}>
            <View style={styles.moduleHeader}>
              <Text style={styles.moduleName}>Resting Alignment</Text>
              <Text style={[styles.moduleStatus, { color: result.alignment.alignmentIndex >= 70 ? '#10B981' : '#F59E0B' }]}>
                Index: {result.alignment.alignmentIndex.toFixed(0)}
              </Text>
            </View>
            <Text style={styles.moduleNote}>{result.alignment.screeningNote}</Text>
          </View>

          <View style={styles.moduleRow}>
            <View style={styles.moduleHeader}>
              <Text style={styles.moduleName}>Ocular Motility</Text>
              <Text style={[styles.moduleStatus, { color: result.motility.excessiveHeadMotion ? '#F59E0B' : '#10B981' }]}>
                {result.motility.excessiveHeadMotion ? 'Limited' : 'Normal'}
              </Text>
            </View>
            <Text style={styles.moduleNote}>{result.motility.screeningNote}</Text>
          </View>

          <View style={styles.moduleRow}>
            <View style={styles.moduleHeader}>
              <Text style={styles.moduleName}>Convergence</Text>
              <Text style={[styles.moduleStatus, { color: result.convergence.nearPoint ? '#10B981' : '#F59E0B' }]}>
                {result.convergence.nearPoint ? `${result.convergence.nearPoint.toFixed(0)}mm` : 'Inconclusive'}
              </Text>
            </View>
            <Text style={styles.moduleNote}>{result.convergence.screeningNote}</Text>
          </View>
        </View>

        <View style={styles.capabilityCard}>
          <Text style={styles.capabilityTitle}>
            Measurement Mode: {capabilityMode === 'full' ? 'Full' : 'Degraded'}
          </Text>
          <Text style={styles.capabilityText}>
            {capabilityMode === 'full'
              ? 'Used sensor-based measurements for highest accuracy.'
              : 'Used live camera with face detection. Gaze and depth estimated (no TrueDepth/LiDAR). Results are screening-level only.'}
          </Text>
        </View>

        {Object.keys(result.repeatAttempts).length > 0 && (
          <View style={styles.repeatCard}>
            <Text style={styles.repeatTitle}>Repeat Attempts</Text>
            {Object.entries(result.repeatAttempts).map(([module, count]) => (
              <Text key={module} style={styles.repeatText}>
                {module}: {count} time(s)
              </Text>
            ))}
          </View>
        )}

        <View style={styles.methodCard}>
          <Text style={styles.methodTitle}>Technical Methods</Text>
          <Text style={styles.methodText}>
            • Camera: Live front-facing camera feed{'\n'}
            • Face Detection: expo-face-detector (Google ML Vision){'\n'}
            • Gaze Estimation: Face/eye landmark positions{'\n'}
            • Distance: Face size-based estimation{'\n'}
            • Head Pose: Roll & yaw from face detector{'\n'}
            • Quality Gating: Per-module confidence with selective repeat
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
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
    marginBottom: 16,
  },
  savingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  savingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1E40AF',
  },
  savedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  savedText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '600',
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
  repeatCard: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  repeatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  repeatText: {
    fontSize: 13,
    color: '#6B7280',
  },
  methodCard: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  methodText: {
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
