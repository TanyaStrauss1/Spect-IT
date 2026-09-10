import { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'

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
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.replace('/auth/signin')
      return
    }
    loadResults()
  }, [user])

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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading your results...</Text>
      </View>
    )
  }

  if (results.length === 0) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Dashboard</Text>
          <Text style={styles.subtitle}>Track your vision screening progress</Text>
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
