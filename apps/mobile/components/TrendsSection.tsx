/**
 * Vision Trends Section Component (React Native)
 * Shows longitudinal acuity and contrast trends with change detection
 * Lightweight implementation without external chart libraries
 */

import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { TestResult } from '../lib/results/clinical-summary'
import { convertSnellenToLogMAR } from '../lib/results/clinical-summary'

interface TrendsSectionProps {
  results: TestResult[]
}

interface TrendDataPoint {
  date: string
  timestamp: number
  leftLogMAR?: number
  rightLogMAR?: number
  contrastScore?: number
  leftSnellen?: string
  rightSnellen?: string
}

export function TrendsSection({ results }: TrendsSectionProps) {
  const { acuityTrends, contrastTrends, meaningfulChanges } = useMemo(() => {
    // Extract acuity results (match saved test_type strings)
    const acuityResults = results.filter(r => 
      r.test_type === 'Visual Acuity (Clinical)' || 
      r.test_type === 'Visual Acuity' || 
      r.test_name === 'Visual Acuity'
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    // Extract contrast results (match saved test_type strings)
    const contrastResults = results.filter(r => 
      r.test_type === 'Contrast Sensitivity (Clinical)' || 
      r.test_type === 'Contrast Sensitivity' || 
      r.test_name === 'Contrast Sensitivity'
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    // Build acuity trend data
    const acuityTrends: TrendDataPoint[] = acuityResults.map(r => {
      const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const timestamp = new Date(r.created_at).getTime()
      
      const leftSnellen = r.results?.leftEye?.snellen || r.test_data?.leftEye?.finalSnellen
      const rightSnellen = r.results?.rightEye?.snellen || r.test_data?.rightEye?.finalSnellen
      
      return {
        date,
        timestamp,
        leftLogMAR: leftSnellen ? convertSnellenToLogMAR(leftSnellen) || undefined : undefined,
        rightLogMAR: rightSnellen ? convertSnellenToLogMAR(rightSnellen) || undefined : undefined,
        leftSnellen,
        rightSnellen,
      }
    }).filter(d => d.leftLogMAR !== undefined || d.rightLogMAR !== undefined)

    // Build contrast trend data
    const contrastTrends: TrendDataPoint[] = contrastResults.map(r => {
      const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const timestamp = new Date(r.created_at).getTime()
      
      // Extract contrast score (0-1)
      const contrastScore = r.score || (r.test_data?.correctCount / r.test_data?.totalCount) || undefined
      
      return {
        date,
        timestamp,
        contrastScore: contrastScore ? contrastScore * 100 : undefined,
      }
    }).filter(d => d.contrastScore !== undefined)

    // Detect meaningful changes (≥0.1 logMAR)
    const meaningfulChanges: {
      eye: 'left' | 'right'
      change: number
      improved: boolean
      dates: [string, string]
    }[] = []

    if (acuityTrends.length >= 2) {
      const latest = acuityTrends[acuityTrends.length - 1]
      const previous = acuityTrends[acuityTrends.length - 2]

      if (latest.leftLogMAR !== undefined && previous.leftLogMAR !== undefined) {
        const change = latest.leftLogMAR - previous.leftLogMAR
        if (Math.abs(change) >= 0.1) {
          meaningfulChanges.push({
            eye: 'left',
            change,
            improved: change < 0, // Lower logMAR = better vision
            dates: [previous.date, latest.date],
          })
        }
      }

      if (latest.rightLogMAR !== undefined && previous.rightLogMAR !== undefined) {
        const change = latest.rightLogMAR - previous.rightLogMAR
        if (Math.abs(change) >= 0.1) {
          meaningfulChanges.push({
            eye: 'right',
            change,
            improved: change < 0,
            dates: [previous.date, latest.date],
          })
        }
      }
    }

    return { acuityTrends, contrastTrends, meaningfulChanges }
  }, [results])

  if (acuityTrends.length === 0 && contrastTrends.length === 0) {
    return null
  }

  // Calculate timespan
  const allTimestamps = [...acuityTrends, ...contrastTrends].map(t => t.timestamp)
  const timespan = allTimestamps.length > 0 
    ? Math.floor((Math.max(...allTimestamps) - Math.min(...allTimestamps)) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📈 Vision Trends</Text>

      {/* Meaningful Changes Alert */}
      {meaningfulChanges.length > 0 && (
        <View style={styles.alertsContainer}>
          {meaningfulChanges.map((change, idx) => (
            <View
              key={idx}
              style={[
                styles.alert,
                change.improved ? styles.alertImprovement : styles.alertChange
              ]}
            >
              <Text style={[
                styles.alertTitle,
                change.improved ? styles.alertTitleImprovement : styles.alertTitleChange
              ]}>
                {change.improved ? '✓ Improvement Detected' : '⚠️ Change Detected'}
              </Text>
              <Text style={[
                styles.alertText,
                change.improved ? styles.alertTextImprovement : styles.alertTextChange
              ]}>
                {change.eye === 'left' ? 'Left eye (OS)' : 'Right eye (OD)'}: 
                {' '}{change.improved ? 'Improved' : 'Declined'} by {Math.abs(change).toFixed(2)} logMAR
                {' '}from {change.dates[0]} to {change.dates[1]}.
                {!change.improved && ' Consider an eye exam.'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Acuity Trends */}
      {acuityTrends.length >= 2 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance Vision (logMAR)</Text>
          <Text style={styles.sectionSubtitle}>Lower values = better vision. Change ≥0.1 is clinically meaningful.</Text>
          
          {/* Recent tests (last 5) */}
          {acuityTrends.slice(-5).reverse().map((trend, idx) => (
            <View key={idx} style={styles.trendItem}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendDate}>{trend.date}</Text>
              </View>
              <View style={styles.trendValues}>
                {trend.leftLogMAR !== undefined && (
                  <View style={styles.eyeValue}>
                    <Text style={styles.eyeLabel}>OS</Text>
                    <Text style={styles.logmarValue}>{trend.leftLogMAR.toFixed(2)}</Text>
                    <Text style={styles.snellenValue}>({trend.leftSnellen})</Text>
                    <View style={[styles.visualBar, { width: `${Math.min(100, (1 - trend.leftLogMAR) * 80)}%`, backgroundColor: '#9333ea' }]} />
                  </View>
                )}
                {trend.rightLogMAR !== undefined && (
                  <View style={styles.eyeValue}>
                    <Text style={styles.eyeLabel}>OD</Text>
                    <Text style={styles.logmarValue}>{trend.rightLogMAR.toFixed(2)}</Text>
                    <Text style={styles.snellenValue}>({trend.rightSnellen})</Text>
                    <View style={[styles.visualBar, { width: `${Math.min(100, (1 - trend.rightLogMAR) * 80)}%`, backgroundColor: '#f97316' }]} />
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Contrast Trends */}
      {contrastTrends.length >= 2 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contrast Sensitivity</Text>
          <Text style={styles.sectionSubtitle}>Higher values = better contrast perception.</Text>
          
          {contrastTrends.slice(-5).reverse().map((trend, idx) => (
            <View key={idx} style={styles.trendItem}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendDate}>{trend.date}</Text>
                <Text style={styles.contrastScore}>{trend.contrastScore?.toFixed(1)}%</Text>
              </View>
              <View style={[styles.visualBar, { width: `${trend.contrastScore}%`, backgroundColor: '#3b82f6' }]} />
            </View>
          ))}
        </View>
      )}

      {/* Summary Stats */}
      <View style={styles.statsGrid}>
        {acuityTrends.length > 0 && (
          <>
            <View style={[styles.statCard, { backgroundColor: '#FAF5FF', borderColor: '#A855F7' }]}>
              <Text style={[styles.statLabel, { color: '#9333EA' }]}>LEFT EYE TESTS</Text>
              <Text style={[styles.statValue, { color: '#7C3AED' }]}>
                {acuityTrends.filter(t => t.leftLogMAR !== undefined).length}
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FFF7ED', borderColor: '#F97316' }]}>
              <Text style={[styles.statLabel, { color: '#EA580C' }]}>RIGHT EYE TESTS</Text>
              <Text style={[styles.statValue, { color: '#EA580C' }]}>
                {acuityTrends.filter(t => t.rightLogMAR !== undefined).length}
              </Text>
            </View>
          </>
        )}
        {contrastTrends.length > 0 && (
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }]}>
            <Text style={[styles.statLabel, { color: '#2563EB' }]}>CONTRAST TESTS</Text>
            <Text style={[styles.statValue, { color: '#1D4ED8' }]}>{contrastTrends.length}</Text>
          </View>
        )}
        <View style={[styles.statCard, { backgroundColor: '#F0FDF4', borderColor: '#10B981' }]}>
          <Text style={[styles.statLabel, { color: '#059669' }]}>TIMESPAN</Text>
          <Text style={[styles.statValue, { color: '#047857' }]}>{timespan > 0 ? `${timespan}d` : '1d'}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  alertsContainer: {
    marginBottom: 16,
  },
  alert: {
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  alertImprovement: {
    backgroundColor: '#F0FDF4',
    borderLeftColor: '#10B981',
  },
  alertChange: {
    backgroundColor: '#FFFBEB',
    borderLeftColor: '#F59E0B',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertTitleImprovement: {
    color: '#065F46',
  },
  alertTitleChange: {
    color: '#92400E',
  },
  alertText: {
    fontSize: 12,
    lineHeight: 18,
  },
  alertTextImprovement: {
    color: '#047857',
  },
  alertTextChange: {
    color: '#B45309',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  trendItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  trendDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  contrastScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  trendValues: {
    gap: 8,
  },
  eyeValue: {
    marginBottom: 8,
  },
  eyeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  logmarValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  snellenValue: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  visualBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
})
