/**
 * Wellness Screening Summary Screen (React Native)
 * Unified screening results with per-eye breakdown and recommendations
 */

import { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Share } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'
import { useParticipants } from '../../lib/participants/participant-context'
import { supabase } from '../../lib/supabase'
import { generateClinicalSummary, type TestResult, type ClinicalSummary } from '../../lib/results/clinical-summary'
import { TrendsSection } from '../../components/TrendsSection'
import { FindCareNearby } from '../../components/FindCareNearby'
import { exportToCSV, exportBaselineTrendsCSV } from '../../lib/results/csv-export'

export default function ClinicalSummaryScreen() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<ClinicalSummary | null>(null)
  const { user, loading: authLoading } = useAuth()
  const { activeParticipant, participants, loading: participantsLoading } = useParticipants()

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.replace('/auth/signin')
      return
    }

    if (!participantsLoading) {
      loadResults()
    }
  }, [user, authLoading, participantsLoading, activeParticipant])

  const loadResults = async () => {
    if (!user) return
    
    try {
      let query = supabase
        .from('test_results')
        .select('*')

      // Filter by active participant if one is selected
      if (activeParticipant) {
        query = query.eq('participant_id', activeParticipant.id)
      } else if (participants.length > 0) {
        // If there are participants but none is active, show results for all participants
        const participantIds = participants.map(p => p.id)
        query = query.in('participant_id', participantIds)
      } else {
        // No participants, show user's direct results (legacy)
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setResults(data || [])
      setSummary(generateClinicalSummary(data || []))
    } catch (error) {
      console.error('Error loading results:', error)
      Alert.alert('Error', 'Failed to load results. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    const participantName = activeParticipant?.display_name || 'User'
    const result = await exportToCSV(results, {
      participantName,
      includeMetadata: true,
      includeQualityScores: true
    })
    
    if (!result.success) {
      Alert.alert('Export Failed', result.error || 'Failed to export CSV')
    }
  }

  const handleExportBaselineTrends = async () => {
    const participantName = activeParticipant?.display_name || 'User'
    const result = await exportBaselineTrendsCSV(results, {
      participantName,
      includeMetadata: true,
      includeQualityScores: true
    })
    
    if (!result.success) {
      Alert.alert('Export Failed', result.error || 'Failed to export baseline trends')
    }
  }

  const handleShare = async () => {
    // Build structured wellness screening summary text
    let text = `SPECT-IT WELLNESS SCREENING REPORT\n`
    text += `Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    
    // Visual Acuity Results
    if (summary?.leftEye || summary?.rightEye || summary?.bothEyes) {
      text += `DISTANCE VISION (VISUAL ACUITY)\n\n`
      
      if (summary?.leftEye) {
        text += `Left Eye (OS): ${summary.leftEye.snellen}\n`
        if (summary.leftEye.interpretation) {
          text += `  • Category: ${summary.leftEye.interpretation.category}\n`
          text += `  • logMAR: ${summary.leftEye.logMAR?.toFixed(2)}\n`
        }
        text += `  • Tested: ${new Date(summary.leftEye.date!).toLocaleDateString()}\n\n`
      }
      
      if (summary?.rightEye) {
        text += `Right Eye (OD): ${summary.rightEye.snellen}\n`
        if (summary.rightEye.interpretation) {
          text += `  • Category: ${summary.rightEye.interpretation.category}\n`
          text += `  • logMAR: ${summary.rightEye.logMAR?.toFixed(2)}\n`
        }
        text += `  • Tested: ${new Date(summary.rightEye.date!).toLocaleDateString()}\n\n`
      }
      
      if (summary?.bothEyes) {
        text += `Both Eyes: ${summary.bothEyes.snellen}\n`
        if (summary.bothEyes.interpretation) {
          text += `  • Category: ${summary.bothEyes.interpretation.category}\n`
          text += `  • logMAR: ${summary.bothEyes.logMAR?.toFixed(2)}\n`
        }
        text += `  • Tested: ${new Date(summary.bothEyes.date!).toLocaleDateString()}\n\n`
      }
    }
    
    // Other tests
    const otherTests = []
    if (summary?.colorVision) otherTests.push(`Color Vision: ${summary.colorVision.test_data?.screeningResult || 'See report'}`)
    if (summary?.contrast) otherTests.push(`Contrast Sensitivity: ${summary.contrast.test_data?.assessment || `${((summary.contrast.score || 0) * 100).toFixed(0)}% correct`}`)
    if (summary?.astigmatism) otherTests.push(`Astigmatism: ${summary.astigmatism.test_data?.overallAssessment || 'See report'}`)
    if (summary?.visualField) otherTests.push(`Visual Field: ${summary.visualField.test_data?.assessment || 'See report'}`)
    if (summary?.prescription) otherTests.push(`Refractive Screening: Needs-correction detection — NOT a prescription`)
    
    if (summary?.hearing) {
      const hearingStatus = summary.hearing.results?.overallStatus || summary.hearing.test_data?.overallStatus || 'See report'
      const leftPass = summary.hearing.test_data?.leftEarPassCount
      const rightPass = summary.hearing.test_data?.rightEarPassCount
      const totalFreq = summary.hearing.test_data?.totalFrequencies
      const scoreDetail = leftPass !== undefined && rightPass !== undefined ? ` (L: ${leftPass}/${totalFreq}, R: ${rightPass}/${totalFreq})` : ''
      otherTests.push(`Hearing Screening: ${hearingStatus}${scoreDetail}`)
      otherTests.push(`  ⚠️ Methodology: ASHA-based pure-tone screening (500, 1000, 2000, 4000 Hz). Uses relative device volumes, NOT calibrated dB HL.`)
    }
    
    if (summary?.visionScan) {
      const visionScanStatus = summary.visionScan.test_data?.recommendsProfessionalExam ? '⚠️ Professional exam recommended' : '✓ No significant issues detected'
      const confidence = summary.visionScan.test_data?.qualityAssessment?.overallConfidence
      const confidenceText = confidence !== undefined ? ` (Data quality: ${(confidence * 100).toFixed(0)}%)` : ''
      const methodology = summary.visionScan.test_data?.methodology?.distanceMethod?.includes('sensor') ? 'Sensor-based' : 'Camera-based'
      otherTests.push(`Vision Scan: ${visionScanStatus}${confidenceText}`)
      otherTests.push(`  • ${summary.visionScan.test_data?.screeningSummary || 'Ocular function screening'}`)
      otherTests.push(`  • Methodology: ${methodology} measurements (alignment, motility, convergence)`)
    }
    
    if (otherTests.length > 0) {
      text += `OTHER SCREENING TESTS\n\n`
      otherTests.forEach(t => text += `${t}\n`)
      text += `\n`
    }
    
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    text += `WHEN TO SEEK PROFESSIONAL CARE\n\n`
    
    if (summary?.visionScan?.test_data?.recommendsProfessionalExam) {
      text += `⚠️ RECOMMENDED: Vision Scan screening detected findings that warrant professional evaluation.\n\n`
    }
    
    text += `• Annual comprehensive eye examinations (recommended for everyone)\n`
    text += `• Vision changes, blurriness, or eye strain\n`
    text += `• Reduced visual acuity (logMAR > 0.3)\n`
    text += `• Need for glasses or contact lens prescription\n`
    text += `• 🚨 URGENT: Sudden vision loss, flashes of light, eye pain, or injury\n\n`
    
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    text += `SCREENING TOOL DISCLAIMER\n\n`
    text += `These results are wellness screening assessments for informational purposes only — NOT medical diagnoses, clinical examinations, or dispensable prescriptions.\n\n`
    text += `This screening does NOT replace professional eye care. It cannot diagnose eye diseases, provide prescriptions, or detect all vision/eye health issues.\n\n`
    text += `Always consult a licensed optometrist or ophthalmologist for:\n`
    text += `• Comprehensive eye health assessment and clinical diagnosis\n`
    text += `• Treatment of eye diseases and conditions\n`
    text += `• Prescription eyewear (glasses or contact lenses)\n`
    text += `• Professional interpretation of screening findings\n\n`
    text += `Spect-IT is a wellness screening tool, not a medical device.\n`
    
    try {
      await Share.share({
        message: text,
        title: 'Spect-IT Wellness Screening Report'
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading your wellness screening summary...</Text>
      </View>
    )
  }

  if (!results.length || !summary) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Wellness Screening Profile</Text>
          <Text style={styles.subtitle}>Comprehensive screening results</Text>
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>
            {activeParticipant && !activeParticipant.is_self
              ? `No results for ${activeParticipant.display_name} yet`
              : 'No Results Yet'}
          </Text>
          <Text style={styles.emptyText}>
            {activeParticipant && !activeParticipant.is_self
              ? `Complete some vision tests for ${activeParticipant.display_name} to see their wellness screening profile`
              : 'Complete some vision tests to see your wellness screening profile'}
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/test/acuity')}
          >
            <Text style={styles.primaryButtonText}>Browse Tests</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Wellness Screening Profile
          {activeParticipant && !activeParticipant.is_self && (
            <Text style={styles.participantName}> ({activeParticipant.display_name})</Text>
          )}
        </Text>
        <Text style={styles.subtitle}>Screening Summary · {new Date().toLocaleDateString()}</Text>
        {activeParticipant && (
          <Text style={styles.participantInfo}>
            {activeParticipant.display_name}
            {activeParticipant.date_of_birth && ` • DOB: ${new Date(activeParticipant.date_of_birth).toLocaleDateString()}`}
            {activeParticipant.age && ` • Age: ${activeParticipant.age}`}
          </Text>
        )}
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>Wellness Screening Only</Text>
        <Text style={styles.disclaimerText}>
          These results are wellness screening assessments for informational purposes only — NOT medical diagnoses, clinical exams, or dispensable prescriptions. 
          Always consult a licensed optometrist or ophthalmologist for comprehensive eye examinations, clinical diagnoses, treatment decisions, and prescription eyewear.
        </Text>
      </View>

      {/* Export Buttons */}
      <View style={styles.exportContainer}>
        <TouchableOpacity style={styles.exportButton} onPress={handleShare}>
          <Text style={styles.exportButtonText}>📤 Share Summary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButtonSecondary} onPress={handleExportCSV}>
          <Text style={styles.exportButtonSecondaryText}>📊 Export CSV</Text>
        </TouchableOpacity>
      </View>
      
      {results.length >= 2 && (
        <TouchableOpacity style={styles.baselineTrendsButton} onPress={handleExportBaselineTrends}>
          <Text style={styles.baselineTrendsButtonText}>📈 Export Baseline + Trends (CSV)</Text>
        </TouchableOpacity>
      )}

      {/* Vision Trends */}
      <TrendsSection results={results} />

      {/* Visual Acuity Summary */}
      {(summary.leftEye || summary.rightEye || summary.bothEyes) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📏 Distance Vision (Visual Acuity)</Text>
          
          {summary.leftEye && (
            <View style={[styles.eyeCard, { borderColor: '#A855F7', backgroundColor: '#FAF5FF' }]}>
              <Text style={[styles.eyeLabel, { color: '#7C3AED' }]}>Left Eye (OS)</Text>
              <Text style={styles.snellenValue}>{summary.leftEye.snellen}</Text>
              {summary.leftEye.interpretation && (
                <>
                  <Text style={[styles.categoryText, { color: summary.leftEye.interpretation.color }]}>
                    {summary.leftEye.interpretation.category}
                  </Text>
                  <Text style={styles.logmarText}>
                    logMAR: {summary.leftEye.logMAR?.toFixed(2)}
                  </Text>
                </>
              )}
              <Text style={styles.dateText}>
                Tested {new Date(summary.leftEye.date!).toLocaleDateString()}
              </Text>
            </View>
          )}

          {summary.rightEye && (
            <View style={[styles.eyeCard, { borderColor: '#F97316', backgroundColor: '#FFF7ED' }]}>
              <Text style={[styles.eyeLabel, { color: '#EA580C' }]}>Right Eye (OD)</Text>
              <Text style={styles.snellenValue}>{summary.rightEye.snellen}</Text>
              {summary.rightEye.interpretation && (
                <>
                  <Text style={[styles.categoryText, { color: summary.rightEye.interpretation.color }]}>
                    {summary.rightEye.interpretation.category}
                  </Text>
                  <Text style={styles.logmarText}>
                    logMAR: {summary.rightEye.logMAR?.toFixed(2)}
                  </Text>
                </>
              )}
              <Text style={styles.dateText}>
                Tested {new Date(summary.rightEye.date!).toLocaleDateString()}
              </Text>
            </View>
          )}

          {summary.bothEyes && (
            <View style={[styles.eyeCard, { borderColor: '#10B981', backgroundColor: '#F0FDF4' }]}>
              <Text style={[styles.eyeLabel, { color: '#059669' }]}>Both Eyes</Text>
              <Text style={styles.snellenValue}>{summary.bothEyes.snellen}</Text>
              {summary.bothEyes.interpretation && (
                <>
                  <Text style={[styles.categoryText, { color: summary.bothEyes.interpretation.color }]}>
                    {summary.bothEyes.interpretation.category}
                  </Text>
                  <Text style={styles.logmarText}>
                    logMAR: {summary.bothEyes.logMAR?.toFixed(2)}
                  </Text>
                </>
              )}
              <Text style={styles.dateText}>
                Tested {new Date(summary.bothEyes.date!).toLocaleDateString()}
              </Text>
            </View>
          )}

          {/* Recommendation */}
          {(summary.leftEye?.interpretation || summary.rightEye?.interpretation || summary.bothEyes?.interpretation) && (
            <View style={styles.recommendationBox}>
              <Text style={styles.recommendationTitle}>Screening Guidance</Text>
              <Text style={styles.recommendationText}>
                {summary.leftEye?.interpretation?.recommendation || 
                 summary.rightEye?.interpretation?.recommendation || 
                 summary.bothEyes?.interpretation?.recommendation}
                {' '}This is screening guidance only — consult an eye care professional for a comprehensive exam.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Other Tests Summary */}
      {(summary.colorVision || summary.contrast || summary.astigmatism || summary.prescription || summary.visualField || summary.hearing || summary.visionScan) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Additional Wellness Screenings</Text>
          
          {summary.colorVision && (
            <View style={styles.testCard}>
              <Text style={styles.testIcon}>🎨</Text>
              <View style={styles.testInfo}>
                <Text style={styles.testName}>Color Vision</Text>
                <Text style={styles.testResult}>
                  {summary.colorVision.test_data?.screeningResult || 'See details'}
                </Text>
                <Text style={styles.testDate}>
                  Tested {new Date(summary.colorVision.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          {summary.contrast && (
            <View style={styles.testCard}>
              <Text style={styles.testIcon}>🌓</Text>
              <View style={styles.testInfo}>
                <Text style={styles.testName}>Contrast Sensitivity</Text>
                <Text style={styles.testResult}>
                  {summary.contrast.test_data?.assessment || 
                   `${((summary.contrast.score || 0) * 100).toFixed(0)}% correct`}
                </Text>
                <Text style={styles.testDate}>
                  Tested {new Date(summary.contrast.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          {summary.astigmatism && (
            <View style={styles.testCard}>
              <Text style={styles.testIcon}>⚫</Text>
              <View style={styles.testInfo}>
                <Text style={styles.testName}>Astigmatism</Text>
                <Text style={styles.testResult}>
                  {summary.astigmatism.test_data?.overallAssessment || 'See details'}
                </Text>
                <Text style={styles.testDate}>
                  Tested {new Date(summary.astigmatism.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          {summary.prescription && (
            <View style={[styles.testCard, { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' }]}>
              <Text style={styles.testIcon}>🔍</Text>
              <View style={styles.testInfo}>
                <Text style={styles.testName}>Refractive Screening</Text>
                <Text style={[styles.testResult, { color: '#B45309', fontWeight: '600' }]}>
                  Wellness screening only — NOT a dispensable prescription
                </Text>
                <Text style={styles.testDate}>
                  Tested {new Date(summary.prescription.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          {summary.visualField && (
            <View style={styles.testCard}>
              <Text style={styles.testIcon}>👁️</Text>
              <View style={styles.testInfo}>
                <Text style={styles.testName}>Visual Field</Text>
                <Text style={styles.testResult}>
                  {summary.visualField.test_data?.assessment || 'See details'}
                </Text>
                <Text style={styles.testDate}>
                  Tested {new Date(summary.visualField.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          {summary.hearing && (
            <View style={styles.testCard}>
              <Text style={styles.testIcon}>🎧</Text>
              <View style={styles.testInfo}>
                <Text style={styles.testName}>Hearing Screening (Pure-Tone)</Text>
                <Text style={[styles.testResult, { 
                  fontWeight: '600',
                  color: (summary.hearing.results?.overallStatus || summary.hearing.test_data?.overallStatus) === 'PASS' ? '#059669' : '#DC2626'
                }]}>
                  {summary.hearing.results?.overallStatus || summary.hearing.test_data?.overallStatus || 'See details'}
                  {summary.hearing.test_data?.leftEarPassCount !== undefined && 
                   summary.hearing.test_data?.rightEarPassCount !== undefined && (
                    ` (L: ${summary.hearing.test_data.leftEarPassCount}/${summary.hearing.test_data.totalFrequencies}, R: ${summary.hearing.test_data.rightEarPassCount}/${summary.hearing.test_data.totalFrequencies})`
                  )}
                </Text>
                
                {/* Methodology Note */}
                <View style={{ marginTop: 8, padding: 8, backgroundColor: '#F9FAFB', borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '600', marginBottom: 4 }}>
                    Methodology:
                  </Text>
                  <Text style={{ fontSize: 10, color: '#6B7280', lineHeight: 16 }}>
                    ASHA-based pure-tone screening at 500, 1000, 2000, 4000 Hz. Uses pulsed tones with catch trials for reliability.
                  </Text>
                  <Text style={{ fontSize: 9, color: '#DC2626', marginTop: 6, fontWeight: '600' }}>
                    ⚠️ Uses relative device volumes, NOT calibrated dB HL. Results indicate relative hearing sensitivity only.
                  </Text>
                </View>

                <Text style={styles.testDate}>
                  Tested {new Date(summary.hearing.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          {summary.visionScan && (
            <View style={[styles.testCard, { backgroundColor: '#F5F3FF', borderColor: '#A78BFA' }]}>
              <Text style={styles.testIcon}>📱</Text>
              <View style={styles.testInfo}>
                <Text style={styles.testName}>Vision Scan – Ocular Function Screening</Text>
                <Text style={[styles.testResult, { 
                  color: summary.visionScan.test_data?.recommendsProfessionalExam ? '#B45309' : '#059669',
                  fontWeight: '600' 
                }]}>
                  {summary.visionScan.test_data?.recommendsProfessionalExam 
                    ? '⚠️ Professional exam recommended'
                    : '✓ No significant issues detected in screening'}
                </Text>
                <Text style={[styles.testResult, { fontSize: 12, marginTop: 4 }]}>
                  {summary.visionScan.test_data?.screeningSummary || 'Mobile camera wellness screening'}
                </Text>
                {summary.visionScan.test_data?.alignment?.alignmentIndex !== undefined && (
                  <Text style={[styles.testResult, { fontSize: 11, marginTop: 3 }]}>
                    • Alignment Index: {Math.round(summary.visionScan.test_data.alignment.alignmentIndex)}/100
                  </Text>
                )}
                {summary.visionScan.test_data?.convergence?.nearPoint !== undefined && (
                  <Text style={[styles.testResult, { fontSize: 11 }]}>
                    • Convergence Near Point: {Math.round(summary.visionScan.test_data.convergence.nearPoint)}mm
                  </Text>
                )}
                
                {/* Data Quality Confidence */}
                {summary.visionScan.test_data?.qualityAssessment?.overallConfidence !== undefined && (
                  <View style={{ marginTop: 8, padding: 8, backgroundColor: '#EEF2FF', borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#4F46E5', marginBottom: 4 }}>
                      Data Quality Confidence: {(summary.visionScan.test_data.qualityAssessment.overallConfidence * 100).toFixed(0)}%
                    </Text>
                    {summary.visionScan.test_data.methodology && (
                      <Text style={{ fontSize: 10, color: '#6B7280', marginTop: 4 }}>
                        Methodology: {summary.visionScan.test_data.methodology.distanceMethod?.includes('sensor') ? 'Sensor-based' : 'Camera-based'} measurements
                      </Text>
                    )}
                  </View>
                )}

                <Text style={[styles.testDate, { marginTop: 8 }]}>

                  Tested {new Date(summary.visionScan.created_at).toLocaleDateString()}
                </Text>
                <Text style={[styles.testDate, { fontSize: 10, marginTop: 2, fontStyle: 'italic' }]}>
                  Wellness screening via mobile camera (alignment, motility, convergence, pupil examination)
                </Text>
              </View>
              
              {summary.visionScan.test_data?.pupilExamination && (
                <View style={styles.submetric}>
                  <Text style={styles.submetricLabel}>Pupils:</Text>
                  <Text style={styles.submetricValue}>
                    {summary.visionScan.test_data.pupilExamination.meanDiameterMM.left.toFixed(1)}mm (L) / {' '}
                    {summary.visionScan.test_data.pupilExamination.meanDiameterMM.right.toFixed(1)}mm (R) - {' '}
                    {summary.visionScan.test_data.pupilExamination.asymmetryDetected ? 'Asymmetric' : 'Symmetric'}
                  </Text>
                  <Text style={styles.submetricNote}>
                    {summary.visionScan.test_data.pupilExamination.screeningNote}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Change from Baseline Placeholder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Change from Baseline</Text>
        
        <View style={[styles.testCard, { backgroundColor: '#FFFBEB', borderColor: '#FCD34D', borderStyle: 'dashed', borderWidth: 2 }]}>
          <Text style={styles.testIcon}>📈</Text>
          <View style={styles.testInfo}>
            <Text style={[styles.testName, { color: '#B45309' }]}>Longitudinal Comparison (Coming Soon)</Text>
            <Text style={[styles.testResult, { color: '#92400E', marginTop: 8 }]}>
              <Text style={{ fontWeight: '600' }}>Placeholder for future feature:</Text> When available, this section will display changes from your baseline screening.
            </Text>
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.testResult, { color: '#92400E', fontSize: 11, marginBottom: 4 }]}>
                • Visual acuity trends over time
              </Text>
              <Text style={[styles.testResult, { color: '#92400E', fontSize: 11, marginBottom: 4 }]}>
                • Vision Scan metrics comparison (alignment, convergence)
              </Text>
              <Text style={[styles.testResult, { color: '#92400E', fontSize: 11, marginBottom: 4 }]}>
                • Hearing screening consistency across sessions
              </Text>
              <Text style={[styles.testResult, { color: '#92400E', fontSize: 11, marginBottom: 4 }]}>
                • Visual indicators for significant changes
              </Text>
            </View>
            <Text style={[styles.testDate, { marginTop: 12, fontStyle: 'italic', color: '#92400E' }]}>
              This section will be populated automatically once you complete additional screening sessions.
            </Text>
          </View>
        </View>
      </View>

      {/* When to See an Optometrist */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚕️ When to Seek Professional Eye Care</Text>
        
        {summary?.visionScan?.test_data?.recommendsProfessionalExam && (
          <View style={[styles.guidanceCard, { backgroundColor: '#FEF2F2', borderWidth: 2, borderColor: '#DC2626', marginBottom: 12 }]}>
            <Text style={[styles.guidanceIcon, { color: '#DC2626', fontSize: 24 }]}>⚠️</Text>
            <View style={styles.guidanceContent}>
              <Text style={[styles.guidanceTitle, { color: '#DC2626', fontSize: 15 }]}>Professional Examination Recommended</Text>
              <Text style={[styles.guidanceText, { color: '#7F1D1D', fontWeight: '500' }]}>
                Your Vision Scan screening detected findings that warrant professional evaluation. Schedule an appointment with a licensed optometrist or ophthalmologist for a comprehensive examination. Share this screening profile with your eye care provider.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.guidanceCard}>
          <Text style={styles.guidanceIcon}>✓</Text>
          <View style={styles.guidanceContent}>
            <Text style={styles.guidanceTitle}>Annual Comprehensive Eye Examinations</Text>
            <Text style={styles.guidanceText}>
              Recommended for everyone, regardless of screening results. Professional exams detect conditions this screening cannot identify (glaucoma, cataracts, retinal disease, refractive error requiring correction).
            </Text>
          </View>
        </View>

        <View style={styles.guidanceCard}>
          <Text style={styles.guidanceIcon}>📋</Text>
          <View style={styles.guidanceContent}>
            <Text style={styles.guidanceTitle}>Vision Changes or Symptoms</Text>
            <Text style={styles.guidanceText}>
              See a professional if you notice: blurriness, difficulty reading, eye strain, headaches, double vision, alignment concerns, or any symptoms not addressed by this screening.
            </Text>
          </View>
        </View>

        <View style={styles.guidanceCard}>
          <Text style={styles.guidanceIcon}>👓</Text>
          <View style={styles.guidanceContent}>
            <Text style={styles.guidanceTitle}>Reduced Visual Acuity</Text>
            <Text style={styles.guidanceText}>
              If your screening shows reduced vision (logMAR &gt; 0.3 or Snellen worse than 20/40), or if you need glasses or contact lens prescription.
            </Text>
          </View>
        </View>

        <View style={[styles.guidanceCard, { backgroundColor: '#FEF2F2', borderLeftWidth: 4, borderLeftColor: '#DC2626' }]}>
          <Text style={[styles.guidanceIcon, { color: '#DC2626' }]}>🚨</Text>
          <View style={styles.guidanceContent}>
            <Text style={[styles.guidanceTitle, { color: '#DC2626' }]}>URGENT: Seek Immediate Care If</Text>
            <Text style={[styles.guidanceText, { color: '#7F1D1D', fontWeight: '500' }]}>
              • Sudden vision loss or significant vision change{'\n'}
              • Flashes of light or new floaters{'\n'}
              • Eye pain, redness, or discharge{'\n'}
              • Curtain or shadow across vision{'\n'}
              • Recent eye injury or trauma
            </Text>
          </View>
        </View>
      </View>

      {/* Find Care Nearby - shown when referral is recommended */}
      <FindCareNearby 
        show={
          summary?.visionScan?.test_data?.recommendsProfessionalExam || 
          (summary?.leftEye?.logMAR !== undefined && summary.leftEye.logMAR > 0.3) ||
          (summary?.rightEye?.logMAR !== undefined && summary.rightEye.logMAR > 0.3) ||
          (summary?.bothEyes?.logMAR !== undefined && summary.bothEyes.logMAR > 0.3)
        }
      />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/test/acuity')}
        >
          <Text style={styles.primaryButtonText}>Take More Tests</Text>
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
    backgroundColor: '#EEF2FF',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  participantName: {
    fontSize: 20,
    color: '#4F46E5',
  },
  participantInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  disclaimer: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    marginBottom: 12,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 20,
    fontWeight: '500',
  },
  exportContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  exportButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  exportButtonSecondary: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  exportButtonSecondaryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  baselineTrendsButton: {
    backgroundColor: '#8B5CF6',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  baselineTrendsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  eyeCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  eyeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  snellenValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  logmarText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  recommendationBox: {
    backgroundColor: '#DBEAFE',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    marginTop: 8,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 13,
    color: '#1E3A8A',
  },
  testCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  testIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  testResult: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  testDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  guidanceCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  guidanceIcon: {
    fontSize: 20,
    marginRight: 12,
    color: '#10B981',
  },
  guidanceContent: {
    flex: 1,
  },
  guidanceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  guidanceText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 40,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: 'white',
    margin: 20,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
})
