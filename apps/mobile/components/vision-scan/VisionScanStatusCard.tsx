/**
 * Vision Scan Status Card
 * P5: Shows last vision scan result status on home screen
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth/auth-context'
import { TEST_TYPE_ID } from '@spect-it/cv'

interface LastVisionScanResult {
  testDate: Date
  overallConfidence: number
  recommendsProfessionalExam: boolean
  screeningSummary: string
}

export function VisionScanStatusCard() {
  const { user } = useAuth()
  const [lastResult, setLastResult] = useState<LastVisionScanResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchLastResult()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const fetchLastResult = async () => {
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('test_date, test_data')
        .eq('test_type', TEST_TYPE_ID.VISION_SCAN)
        .eq('user_id', user?.id)
        .order('test_date', { ascending: false })
        .limit(1)
        .single()

      if (data && !error) {
        setLastResult({
          testDate: new Date(data.test_date),
          overallConfidence: data.test_data.qualityAssessment?.overallConfidence || 0,
          recommendsProfessionalExam: data.test_data.recommendsProfessionalExam || false,
          screeningSummary: data.test_data.screeningSummary || ''
        })
      }
    } catch (err) {
      console.log('No previous vision scan found')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return null
  }

  if (!lastResult) {
    // New user card
    return (
      <TouchableOpacity
        style={styles.cardNew}
        onPress={() => router.push('/vision-scan')}
        accessibilityRole="button"
        accessibilityLabel="Start Vision Scan"
      >
        <View style={styles.cardHeader}>
          <Text style={styles.iconNew}>👁️</Text>
          <View style={styles.cardTextContainer}>
            <Text style={styles.titleNew}>Vision Scan</Text>
            <Text style={styles.subtitleNew}>Comprehensive eye screening</Text>
          </View>
          <Text style={styles.badge}>NEW</Text>
        </View>
        <Text style={styles.descriptionNew}>
          5-minute camera-based screening for alignment, motility, and convergence
        </Text>
      </TouchableOpacity>
    )
  }

  // Show last result card
  const daysAgo = Math.floor((Date.now() - lastResult.testDate.getTime()) / (1000 * 60 * 60 * 24))
  const dateText = daysAgo === 0 ? 'Today' : 
                   daysAgo === 1 ? 'Yesterday' :
                   `${daysAgo} days ago`

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10B981'
    if (confidence >= 0.65) return '#3B82F6'
    if (confidence >= 0.5) return '#F59E0B'
    return '#EF4444'
  }

  return (
    <TouchableOpacity
      style={[
        styles.cardResult,
        { borderColor: lastResult.recommendsProfessionalExam ? '#F59E0B' : '#10B981' }
      ]}
      onPress={() => router.push('/vision-scan')}
      accessibilityRole="button"
      accessibilityLabel="View Vision Scan"
    >
      <View style={styles.cardHeader}>
        <Text style={styles.iconResult}>
          {lastResult.recommendsProfessionalExam ? '⚠️' : '✓'}
        </Text>
        <View style={styles.cardTextContainer}>
          <Text style={styles.titleResult}>Last Vision Scan</Text>
          <Text style={styles.subtitleResult}>{dateText}</Text>
        </View>
        <View style={styles.confidencePill}>
          <Text style={[styles.confidenceValue, { color: getConfidenceColor(lastResult.overallConfidence) }]}>
            {(lastResult.overallConfidence * 100).toFixed(0)}%
          </Text>
        </View>
      </View>
      
      {lastResult.recommendsProfessionalExam && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>Professional exam recommended</Text>
        </View>
      )}
      
      <Text style={styles.actionText}>Tap to start new scan →</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  cardNew: {
    width: '100%',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardResult: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconNew: {
    fontSize: 32,
    marginRight: 12,
  },
  iconResult: {
    fontSize: 28,
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  titleNew: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 2,
  },
  subtitleNew: {
    fontSize: 14,
    color: '#6B7280',
  },
  titleResult: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  subtitleResult: {
    fontSize: 13,
    color: '#6B7280',
  },
  badge: {
    backgroundColor: '#8B5CF6',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidencePill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionNew: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  warningBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    textAlign: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    textAlign: 'center',
  },
})
