/**
 * Clinical Summary Screen (React Native)
 * Unified results page with per-eye breakdown and recommendations
 */

import { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Share } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'
import { generateClinicalSummary, type TestResult, type ClinicalSummary } from '../../lib/results/clinical-summary'

export default function ClinicalSummaryScreen() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<ClinicalSummary | null>(null)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.replace('/auth/signin')
      return
    }
    loadResults()
  }, [user, authLoading])

  const loadResults = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

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

  const handleShare = async () => {
    const text = `Spect-IT Vision Screening Report\n\nCompleted: ${new Date().toLocaleDateString()}\n\nNote: Screening only — not a diagnosis or prescription. Consult an optometrist for clinical decisions.`
    
    try {
      await Share.share({
        message: text,
        title: 'Spect-IT Vision Screening'
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading your clinical summary...</Text>
      </View>
    )
  }

  if (!results.length || !summary) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Clinical Summary</Text>
          <Text style={styles.subtitle}>Comprehensive screening results</Text>
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>No Results Yet</Text>
          <Text style={styles.emptyText}>Complete some vision tests to see your clinical summary</Text>
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
        <Text style={styles.title}>Clinical Screening Summary</Text>
        <Text style={styles.subtitle}>Generated {new Date().toLocaleDateString()}</Text>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>Important</Text>
        <Text style={styles.disclaimerText}>
          This is a screening, not a diagnosis or dispensable prescription. 
          Consult a licensed optometrist or ophthalmologist for clinical decisions.
        </Text>
      </View>

      {/* Share Button */}
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareButtonText}>📤 Share Results</Text>
      </TouchableOpacity>

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
              <Text style={styles.recommendationTitle}>Recommendation</Text>
              <Text style={styles.recommendationText}>
                {summary.leftEye?.interpretation?.recommendation || 
                 summary.rightEye?.interpretation?.recommendation || 
                 summary.bothEyes?.interpretation?.recommendation}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Other Tests Summary */}
      {(summary.colorVision || summary.contrast || summary.astigmatism || summary.prescription || summary.visualField) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Other Screening Tests</Text>
          
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
                  Screening estimate only — NOT dispensable
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
        </View>
      )}

      {/* When to See an Optometrist */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👁️ When to See an Optometrist</Text>
        
        <View style={styles.guidanceCard}>
          <Text style={styles.guidanceIcon}>✓</Text>
          <View style={styles.guidanceContent}>
            <Text style={styles.guidanceTitle}>Annual eye exams</Text>
            <Text style={styles.guidanceText}>Recommended for everyone, even with good screening results.</Text>
          </View>
        </View>

        <View style={styles.guidanceCard}>
          <Text style={styles.guidanceIcon}>!</Text>
          <View style={styles.guidanceContent}>
            <Text style={styles.guidanceTitle}>Vision changes</Text>
            <Text style={styles.guidanceText}>If you notice blurriness, difficulty reading, or eye strain.</Text>
          </View>
        </View>

        <View style={styles.guidanceCard}>
          <Text style={styles.guidanceIcon}>!</Text>
          <View style={styles.guidanceContent}>
            <Text style={styles.guidanceTitle}>Reduced acuity</Text>
            <Text style={styles.guidanceText}>If your screening shows reduced vision (logMAR &gt; 0.3).</Text>
          </View>
        </View>

        <View style={[styles.guidanceCard, { backgroundColor: '#FEF2F2' }]}>
          <Text style={[styles.guidanceIcon, { color: '#DC2626' }]}>🚨</Text>
          <View style={styles.guidanceContent}>
            <Text style={styles.guidanceTitle}>Urgent signs</Text>
            <Text style={styles.guidanceText}>
              Flashes of light, sudden vision loss, distortion, or eye pain — see an eye care professional immediately.
            </Text>
          </View>
        </View>
      </View>

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
  disclaimer: {
    backgroundColor: '#FFFBEB',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginBottom: 12,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B45309',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  shareButton: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
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
