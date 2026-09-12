import { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'
import { useJourney } from '../../lib/journey/useJourney'
import { TrendsSection } from '../../components/TrendsSection'

interface TestResult {
  id: number
  user_id: string
  test_type: string
  test_name: string
  test_data: any
  score: number
  decimal_acuity: number
  test_date: string
  created_at: string
}

export default function DashboardScreen() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [calibrationStatus, setCalibrationStatus] = useState<'calibrated' | 'skipped' | 'none'>('none')
  const { user, loading: authLoading } = useAuth()
  const { progress, calculateProgress, getNextRecommendedTest } = useJourney()

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.replace('/auth/signin')
      return
    }
    loadResults()
    checkCalibration()
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
    } catch (error) {
      console.error('Error loading results:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkCalibration = async () => {
    try {
      const pxPerMm = await AsyncStorage.getItem('spectit_px_per_mm')
      const skipped = await AsyncStorage.getItem('spectit_calibration_skipped')
      
      if (pxPerMm) {
        setCalibrationStatus('calibrated')
      } else if (skipped === '1') {
        setCalibrationStatus('skipped')
      } else {
        setCalibrationStatus('none')
      }
    } catch (e) {
      console.error('Error checking calibration:', e)
    }
  }

  const handleRecalibrate = () => {
    Alert.alert(
      'Recalibrate Screen',
      'Accurate calibration improves test precision. Would you like to recalibrate?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Recalibrate', onPress: () => {
          // Navigate to calibration screen (would need to be implemented)
          Alert.alert('Info', 'Calibration screen coming soon. Run an acuity test to recalibrate.')
        }}
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading your results...</Text>
      </View>
    )
  }

  const journeyProgress = calculateProgress()
  const nextTest = getNextRecommendedTest()

  if (results.length === 0) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Dashboard</Text>
          <Text style={styles.subtitle}>Track your vision screening progress</Text>
        </View>

        {/* Calibration Status */}
        <View style={styles.calibrationBanner}>
          <Text style={styles.calibrationIcon}>
            {calibrationStatus === 'calibrated' ? '✅' : calibrationStatus === 'skipped' ? '⚠️' : '📏'}
          </Text>
          <View style={styles.calibrationContent}>
            <Text style={styles.calibrationTitle}>
              {calibrationStatus === 'calibrated' ? 'Calibrated' : calibrationStatus === 'skipped' ? 'Calibration Skipped' : 'Not Calibrated'}
            </Text>
            <Text style={styles.calibrationText}>
              {calibrationStatus === 'calibrated' 
                ? 'Screen calibration active for accurate tests'
                : 'Calibrate for clinical-grade accuracy'}
            </Text>
          </View>
          {calibrationStatus !== 'none' && (
            <TouchableOpacity onPress={handleRecalibrate}>
              <Text style={styles.calibrationLink}>Recalibrate</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>👁️</Text>
          <Text style={styles.emptyTitle}>No test results yet</Text>
          <Text style={styles.emptyText}>Take your first vision screening to get started</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/test/acuity')}
          >
            <Text style={styles.primaryButtonText}>Start Visual Acuity Test</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Dashboard</Text>
        <Text style={styles.subtitle}>Track your vision screening progress</Text>
      </View>

      {/* Calibration Status */}
      <View style={styles.calibrationBanner}>
        <Text style={styles.calibrationIcon}>
          {calibrationStatus === 'calibrated' ? '✅' : calibrationStatus === 'skipped' ? '⚠️' : '📏'}
        </Text>
        <View style={styles.calibrationContent}>
          <Text style={styles.calibrationTitle}>
            {calibrationStatus === 'calibrated' ? 'Calibrated' : calibrationStatus === 'skipped' ? 'Calibration Skipped' : 'Not Calibrated'}
          </Text>
          <Text style={styles.calibrationText}>
            {calibrationStatus === 'calibrated' 
              ? 'Screen calibration active for accurate tests'
              : 'Calibrate for clinical-grade accuracy'}
          </Text>
        </View>
        {calibrationStatus !== 'none' && (
          <TouchableOpacity onPress={handleRecalibrate}>
            <Text style={styles.calibrationLink}>Re-check</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Journey Progress */}
      {journeyProgress.total > 0 && (
        <View style={styles.journeyCard}>
          <View style={styles.journeyHeader}>
            <Text style={styles.journeyTitle}>🎯 Screening Journey</Text>
            <Text style={styles.journeyProgress}>
              {journeyProgress.completed}/{journeyProgress.total} tests
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${journeyProgress.percentage}%` }]} />
          </View>
          
          {nextTest && (
            <View style={styles.nextTestCard}>
              <Text style={styles.nextTestLabel}>Recommended Next</Text>
              <Text style={styles.nextTestName}>{nextTest.icon} {nextTest.name}</Text>
              <TouchableOpacity
                style={styles.nextTestButton}
                onPress={() => router.push(nextTest.route as any)}
              >
                <Text style={styles.nextTestButtonText}>Start Test →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Vision Trends */}
      <TrendsSection results={results} />

      {/* Clinical Summary Button */}
      <TouchableOpacity
        style={styles.clinicalSummaryButton}
        onPress={() => router.push('/clinical-summary' as any)}
      >
        <Text style={styles.clinicalSummaryIcon}>🩺</Text>
        <View style={styles.clinicalSummaryContent}>
          <Text style={styles.clinicalSummaryTitle}>View Clinical Summary</Text>
          <Text style={styles.clinicalSummaryText}>Per-eye breakdown & recommendations</Text>
        </View>
        <Text style={styles.clinicalSummaryArrow}>→</Text>
      </TouchableOpacity>

      <View style={styles.statsCard}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Total Tests</Text>
          <Text style={styles.statValue}>{results.length}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/test/acuity')}
          >
            <Text style={styles.actionButtonText}>👁️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#9333EA' }]}
            onPress={() => router.push('/test/color-vision')}
          >
            <Text style={styles.actionButtonText}>🎨</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test History</Text>
        {results.map((result) => (
          <View key={result.id} style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultType}>{result.test_type}</Text>
              <View style={styles.resultBadge}>
                <Text style={styles.resultBadgeText}>{result.test_name}</Text>
              </View>
            </View>

            <View style={styles.resultGrid}>
              {result.test_type === 'Visual Acuity' && (
                <>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultItemLabel}>Snellen</Text>
                    <Text style={styles.resultItemValue}>{result.test_data?.snellen || 'N/A'}</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultItemLabel}>Decimal</Text>
                    <Text style={styles.resultItemValue}>{result.decimal_acuity?.toFixed(2) || 'N/A'}</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultItemLabel}>Lines</Text>
                    <Text style={styles.resultItemValue}>{result.score || 0}</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultItemLabel}>Date</Text>
                    <Text style={styles.resultItemValue}>
                      {new Date(result.test_date || result.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                </>
              )}
              {result.test_type === 'Color Vision' && (
                <>
                  <View style={[styles.resultItem, { minWidth: '100%' }]}>
                    <Text style={styles.resultItemLabel}>Result</Text>
                    <Text style={[styles.resultItemValue, { fontSize: 13 }]}>{result.test_data?.screeningResult || 'N/A'}</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultItemLabel}>Plates Correct</Text>
                    <Text style={styles.resultItemValue}>{result.score || 0}/{result.test_data?.platesTotal || 8}</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultItemLabel}>Control</Text>
                    <Text style={styles.resultItemValue}>{result.test_data?.controlPlatesCorrect || 0}/2</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultItemLabel}>Date</Text>
                    <Text style={styles.resultItemValue}>
                      {new Date(result.test_date || result.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>Important Information</Text>
        <Text style={styles.disclaimerText}>
          These results are screening assessments and not a substitute for professional medical advice. 
          Please consult a qualified eye care professional for comprehensive eye examinations.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
  },
  calibrationBanner: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  calibrationIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  calibrationContent: {
    flex: 1,
  },
  calibrationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  calibrationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  calibrationLink: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  journeyCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  journeyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  journeyProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4F46E5',
  },
  nextTestCard: {
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  nextTestLabel: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '600',
    marginBottom: 4,
  },
  nextTestName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  nextTestButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  nextTestButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  clinicalSummaryButton: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#818CF8',
  },
  clinicalSummaryIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  clinicalSummaryContent: {
    flex: 1,
  },
  clinicalSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  clinicalSummaryText: {
    fontSize: 12,
    color: '#6B7280',
  },
  clinicalSummaryArrow: {
    fontSize: 20,
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: 'white',
    margin: 20,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
  primaryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  actionButton: {
    backgroundColor: '#4F46E5',
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 24,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  resultBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultBadgeText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600',
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  resultItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  resultItemLabel: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  resultItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  disclaimer: {
    backgroundColor: '#DBEAFE',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
})
