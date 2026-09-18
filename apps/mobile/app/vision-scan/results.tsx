/**
 * Vision Scan Wellness Screening Results with Real Data & Supabase Persistence
 */

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Share } from 'react-native'
import { router } from 'expo-router'
import { useVisionScan } from '../../lib/vision-scan/vision-scan-context'
import { useAuth } from '../../lib/auth/auth-context'
import { useParticipants } from '../../lib/participants/participant-context'
import { supabase } from '../../lib/supabase'
import { TEST_TYPE_ID, TEST_TYPE_DISPLAY, type VisionScanResult } from '@spect-it/cv'
import { ProgressStepper } from '../../components/vision-scan/ProgressStepper'
import { generateVisionScanPDF } from '../../lib/vision-scan/pdf-generator'

export default function ResultsScreen() {
  const { buildFinalResult, resetSession } = useVisionScan()
  const { user } = useAuth()
  const { participants } = useParticipants()
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
    if (!user?.id) {
      console.log('No authenticated user - skipping save')
      // Mark as not saved so we can show a warning
      setIsSaved(false)
      return
    }
    
    setIsSaving(true)
    
    try {
      const testResultData: any = {
        user_id: user.id,
        test_type: TEST_TYPE_ID.VISION_SCAN,
        test_name: TEST_TYPE_DISPLAY[TEST_TYPE_ID.VISION_SCAN],
        test_data: {
          sessionId: scanResult.timestamp.toString(),
          participantId: scanResult.participantId,
          // Observed methodology (actual methods used during capture)
          methodology: scanResult.methodology || {
            cameraType: 'front-facing',
            faceDetection: 'expo-face-detector (Google ML Vision)',
            gazeEstimation: 'face landmarks + eye positions (estimated)',
            depthEstimation: scanResult.calibration.usedSensorData 
              ? 'TrueDepth/LiDAR sensor'
              : 'IPD/face-width estimation',
            distanceMethod: scanResult.methodology?.distanceMethod || 
              (scanResult.calibration.usedSensorData ? 'sensor' : 'ipd-first-with-face-width-fallback'),
            gazeMethod: scanResult.methodology?.gazeMethod || 'eye-landmarks-relative-to-face-bounds',
            vergenceMethod: scanResult.methodology?.vergenceMethod || 'ipd-change-with-face-width-fallback',
            headPoseTracking: 'face detector roll/yaw',
            qualityGating: 'per-module confidence with selective repeat',
            temporalSmoothing: 'EMA + median filter + flicker detection',
            capabilityMode: scanResult.deviceQualification.useSensorBasedMeasurements ? 'full' : 'degraded',
            hasDepthSensor: scanResult.deviceQualification.capability.hasLiDAR || scanResult.deviceQualification.capability.hasTrueDepth,
          },
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
            method: scanResult.calibration.usedSensorData ? 'sensor-based' : 'face-based estimate',
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
      }

      // Add participant_id if present (matches acuity pattern)
      if (scanResult.participantId) {
        testResultData.participant_id = scanResult.participantId
      }

      const { error } = await supabase
        .from('test_results')
        .insert(testResultData)

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

  const handleExportPDF = async () => {
    if (!result) return

    // Find participant display name
    let participantName: string | undefined
    if (result.participantId) {
      const participant = participants.find(p => p.id === result.participantId)
      participantName = participant?.display_name
    }

    const pdfResult = await generateVisionScanPDF(result, {
      participantName,
      includeMethodology: true,
      includeRepeatAttempts: true
    })

    if (!pdfResult.success) {
      Alert.alert(
        'Export Error', 
        pdfResult.error || 'Could not generate PDF. Please try again.',
        [{ text: 'OK' }]
      )
    }
  }

  const handleShare = async () => {
    if (!result) return

    const capabilityMode = result.deviceQualification.useSensorBasedMeasurements ? 'full' : 'degraded'
    
    // Use observed methodology (not static strings)
    const methodology = result.methodology || {}
    const distanceMethod = methodology.distanceMethod || 
      (result.calibration.usedSensorData ? 'sensor' : 'ipd-first-with-face-width-fallback')
    const gazeMethod = methodology.gazeMethod || 'eye-landmarks-relative-to-face-bounds'
    const vergenceMethod = methodology.vergenceMethod || 'ipd-change-with-face-width-fallback'
    
    // Friendly method names
    const friendlyDistanceMethod = distanceMethod.includes('sensor') 
      ? 'Sensor (TrueDepth/LiDAR)'
      : distanceMethod.includes('ipd-preferred') || distanceMethod.includes('ipd-first')
        ? 'IPD (eye landmarks, preferred)'
        : 'Face-width estimation (fallback)'
    
    const friendlyVergenceMethod = vergenceMethod.includes('ipd-change-preferred') || vergenceMethod.includes('ipd-change')
      ? 'IPD pixel change (preferred)'
      : 'Face-width pixel change (fallback)'
    
    // Include repeat attempts if any
    const totalRepeats = Object.values(result.repeatAttempts || {}).reduce((sum, count) => sum + count, 0)
    const repeatInfo = totalRepeats > 0 
      ? `\nQuality Review: User repeated ${totalRepeats} module${totalRepeats > 1 ? 's' : ''} to improve data quality`
      : ''

    const shareMessage = `
VISION SCAN WELLNESS SCREENING RESULTS
${new Date(result.timestamp).toLocaleDateString()}

WELLNESS SCREENING SUMMARY:
${result.screeningSummary}

${result.recommendsProfessionalExam ? '⚠️ PROFESSIONAL EYE EXAMINATION RECOMMENDED' : '✓ No significant issues detected in screening'}

DATA QUALITY: ${(result.qualityAssessment.overallConfidence * 100).toFixed(0)}%${repeatInfo}

MODULE RESULTS:
• Alignment Index: ${result.alignment.alignmentIndex.toFixed(0)}/100
• Motility: ${result.motility.excessiveHeadMotion ? 'Limited (head motion)' : 'Normal'}
• Convergence: ${result.convergence.nearPoint ? result.convergence.nearPoint.toFixed(0) + 'mm' : 'Inconclusive'}

MEASUREMENT MODE: ${capabilityMode === 'full' ? 'Full (sensor-based)' : 'Degraded (camera estimate)'}

OBSERVED METHODS:
Distance: ${friendlyDistanceMethod}
Gaze: ${gazeMethod.replace(/-/g, ' ')}
Vergence: ${friendlyVergenceMethod}
Temporal Smoothing: EMA + median filter + flicker rejection

IMPORTANT: This is a WELLNESS SCREENING tool — NOT a diagnostic test, clinical examination, or dispensable prescription. It does not diagnose eye diseases or replace professional care. Results flag potential issues that warrant comprehensive examination by a licensed optometrist or ophthalmologist.

Generated by Spect-IT Vision Scan
`.trim()

    try {
      await Share.share({
        message: shareMessage,
        title: 'Vision Scan Wellness Screening'
      })
    } catch (error) {
      console.error('Error sharing:', error)
      Alert.alert(
        'Share Error',
        'Could not share results. Please try again.',
        [{ text: 'OK' }]
      )
    }
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
      <ProgressStepper currentStep="complete" />
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

        {!isSaving && !isSaved && !user && (
          <View style={styles.warningBadge}>
            <Text style={styles.warningText}>⚠️ Not saved - Sign in to save results</Text>
          </View>
        )}

        <View style={styles.confidenceCard}>
          <Text style={styles.confidenceCardTitle}>Data Quality Score</Text>
          <Text 
            style={[
              styles.confidenceCardValue,
              {
                color: result.qualityAssessment.overallConfidence >= 0.8 ? '#10B981' :
                       result.qualityAssessment.overallConfidence >= 0.65 ? '#3B82F6' :
                       result.qualityAssessment.overallConfidence >= 0.5 ? '#F59E0B' : '#EF4444'
              }
            ]}
          >
            {(result.qualityAssessment.overallConfidence * 100).toFixed(0)}%
          </Text>
          <Text style={styles.confidenceCardLabel}>
            {result.qualityAssessment.overallConfidence >= 0.8 ? 'High Quality' :
             result.qualityAssessment.overallConfidence >= 0.65 ? 'Good Quality' :
             result.qualityAssessment.overallConfidence >= 0.5 ? 'Moderate Quality' : 'Low Quality'}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Screening Summary</Text>
          <Text style={styles.summaryText}>{result.screeningSummary}</Text>
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Wellness Screening Only</Text>
          <Text style={styles.disclaimerText}>
            This is a wellness screening tool, not a diagnostic test or clinical examination. It does not diagnose eye
            diseases, provide dispensable prescriptions, or replace professional care. Results flag potential issues
            that warrant comprehensive examination by a licensed optometrist or ophthalmologist.
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

        <View style={[
          styles.capabilityCard,
          { 
            backgroundColor: capabilityMode === 'full' ? '#D1FAE5' : '#FEF3C7',
            borderColor: capabilityMode === 'full' ? '#10B981' : '#F59E0B'
          }
        ]}>
          <View style={styles.capabilityHeader}>
            <Text style={styles.capabilityIcon}>
              {capabilityMode === 'full' ? '✓' : '⚠️'}
            </Text>
            <View style={styles.capabilityTextContainer}>
              <Text style={[
                styles.capabilityTitle,
                { color: capabilityMode === 'full' ? '#065F46' : '#92400E' }
              ]}>
                {capabilityMode === 'full' ? 'Full Sensor Mode' : 'Camera-Only Mode'}
              </Text>
              <Text style={[
                styles.capabilityText,
                { color: capabilityMode === 'full' ? '#065F46' : '#92400E' }
              ]}>
                {capabilityMode === 'full'
                  ? 'Sensor-based measurements (highest accuracy)'
                  : 'Live camera with estimation (screening-level only)'}
              </Text>
            </View>
          </View>
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
          <Text style={styles.methodTitle}>Measurement Methods Used</Text>
          
          <View style={styles.methodSection}>
            <Text style={styles.methodSectionTitle}>📷 Capture</Text>
            <Text style={styles.methodItem}>
              • Live front-facing camera{'\n'}
              • Face detection: Google ML Vision{'\n'}
              • Temporal smoothing: EMA + median filtering
            </Text>
          </View>
          
          <View style={styles.methodSection}>
            <Text style={styles.methodSectionTitle}>📐 Distance Measurement</Text>
            <Text style={styles.methodItem}>
              {result.calibration.usedSensorData 
                ? '• TrueDepth/LiDAR sensor (mm precision)' 
                : '• IPD landmark distance (preferred, ~63mm avg)\n• Face width estimation (fallback, ~140mm avg)'}
            </Text>
          </View>
          
          <View style={styles.methodSection}>
            <Text style={styles.methodSectionTitle}>👁️ Gaze & Vergence</Text>
            <Text style={styles.methodItem}>
              • Eye landmark positions relative to face{'\n'}
              • IPD pixel change for vergence (preferred){'\n'}
              • Face-width change (fallback method)
            </Text>
          </View>
          
          <View style={styles.methodSection}>
            <Text style={styles.methodSectionTitle}>✓ Quality Control</Text>
            <Text style={styles.methodItem}>
              • Per-module confidence scoring{'\n'}
              • Selective repeat for low-quality data{'\n'}
              • Flicker detection and frame rejection
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.pdfButton} 
          onPress={handleExportPDF}
          accessibilityRole="button"
          accessibilityLabel="Export PDF"
          accessibilityHint="Generate and share a printable PDF report"
        >
          <Text style={styles.pdfButtonText}>📄 Export PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share results"
          accessibilityHint="Export screening summary via share sheet"
        >
          <Text style={styles.shareButtonText}>📤 Share Text Summary</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={handleReturnHome}
          accessibilityRole="button"
          accessibilityLabel="Return to home"
        >
          <Text style={styles.homeButtonText}>Return to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.repeatButton} 
          onPress={handleRepeatScan}
          accessibilityRole="button"
          accessibilityLabel="Repeat vision scan"
          accessibilityHint="Start a new vision scan session"
        >
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
  warningBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  confidenceCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  confidenceCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  confidenceCardValue: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  confidenceCardLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  capabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capabilityIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  capabilityTextContainer: {
    flex: 1,
  },
  capabilityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  capabilityText: {
    fontSize: 14,
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  methodSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  methodSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
  },
  methodItem: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  pdfButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 56,
    justifyContent: 'center',
  },
  pdfButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  shareButton: {
    width: '100%',
    backgroundColor: '#10B981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 56,
    justifyContent: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  homeButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 56,
    justifyContent: 'center',
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
    minHeight: 56,
    justifyContent: 'center',
  },
  repeatButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
})
