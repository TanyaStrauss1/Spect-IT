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
  const { acuityTrends, contrastTrends, hearingTrends, visionScanTrends, meaningfulChanges } = useMemo(() => {
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

    // Extract hearing screening results
    const hearingResults = results.filter(r => 
      r.test_type === 'hearing-screening' ||
      r.test_type === 'Hearing Screening' ||
      r.test_name === 'Hearing Screening'
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    // Extract Vision Scan results (use canonical TEST_TYPE_ID)
    const visionScanResults = results.filter(r => 
      r.test_type === 'vision-scan'
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

    // Build hearing screening trend data
    const hearingTrends: Array<{
      date: string
      timestamp: number
      leftEarPassCount: number
      rightEarPassCount: number
      totalFrequencies: number
      overallStatus: string
    }> = hearingResults.map(r => {
      const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const timestamp = new Date(r.created_at).getTime()
      
      return {
        date,
        timestamp,
        leftEarPassCount: r.test_data?.leftEarPassCount || r.results?.leftEarPassCount || 0,
        rightEarPassCount: r.test_data?.rightEarPassCount || r.results?.rightEarPassCount || 0,
        totalFrequencies: r.test_data?.totalFrequencies || r.results?.totalFrequencies || 4,
        overallStatus: r.test_data?.overallStatus || r.results?.overallStatus || 'REFER',
      }
    })

    // Build Vision Scan trend data (overall confidence and alignment index)
    const visionScanTrends: Array<{
      date: string
      timestamp: number
      overallConfidence?: number
      alignmentIndex?: number
      recommendsProfessionalExam?: boolean
    }> = visionScanResults.map(r => {
      const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const timestamp = new Date(r.created_at).getTime()
      
      return {
        date,
        timestamp,
        overallConfidence: r.test_data?.qualityAssessment?.overallConfidence 
          ? r.test_data.qualityAssessment.overallConfidence * 100 
          : undefined,
        alignmentIndex: r.test_data?.alignment?.alignmentIndex,
        recommendsProfessionalExam: r.test_data?.recommendsProfessionalExam || false,
      }
    }).filter(d => d.overallConfidence !== undefined || d.alignmentIndex !== undefined)

    // Detect meaningful changes (≥0.1 logMAR)
    const meaningfulChanges: {
      type: 'acuity' | 'hearing' | 'vision-scan'
      eye?: 'left' | 'right'
      change: number | string
      improved: boolean
      dates: [string, string]
      details?: string
    }[] = []

    // Acuity changes (≥0.1 logMAR is clinically meaningful)
    if (acuityTrends.length >= 2) {
      const latest = acuityTrends[acuityTrends.length - 1]
      const previous = acuityTrends[acuityTrends.length - 2]

      if (latest.leftLogMAR !== undefined && previous.leftLogMAR !== undefined) {
        const change = latest.leftLogMAR - previous.leftLogMAR
        if (Math.abs(change) >= 0.1) {
          meaningfulChanges.push({
            type: 'acuity',
            eye: 'left',
            change,
            improved: change < 0, // Lower logMAR = better vision
            dates: [previous.date, latest.date],
            details: `${latest.leftSnellen || ''} from ${previous.leftSnellen || ''}`,
          })
        }
      }

      if (latest.rightLogMAR !== undefined && previous.rightLogMAR !== undefined) {
        const change = latest.rightLogMAR - previous.rightLogMAR
        if (Math.abs(change) >= 0.1) {
          meaningfulChanges.push({
            type: 'acuity',
            eye: 'right',
            change,
            improved: change < 0,
            dates: [previous.date, latest.date],
            details: `${latest.rightSnellen || ''} from ${previous.rightSnellen || ''}`,
          })
        }
      }
    }

    // Hearing screening changes (any change in pass count)
    if (hearingTrends.length >= 2) {
      const latest = hearingTrends[hearingTrends.length - 1]
      const previous = hearingTrends[hearingTrends.length - 2]

      const leftChange = latest.leftEarPassCount - previous.leftEarPassCount
      const rightChange = latest.rightEarPassCount - previous.rightEarPassCount

      if (leftChange !== 0) {
        meaningfulChanges.push({
          type: 'hearing',
          eye: 'left',
          change: leftChange,
          improved: leftChange > 0,
          dates: [previous.date, latest.date],
          details: `L: ${latest.leftEarPassCount}/${latest.totalFrequencies} from ${previous.leftEarPassCount}/${previous.totalFrequencies}`,
        })
      }

      if (rightChange !== 0) {
        meaningfulChanges.push({
          type: 'hearing',
          eye: 'right',
          change: rightChange,
          improved: rightChange > 0,
          dates: [previous.date, latest.date],
          details: `R: ${latest.rightEarPassCount}/${latest.totalFrequencies} from ${previous.rightEarPassCount}/${previous.totalFrequencies}`,
        })
      }
    }

    // Vision Scan changes (alignment index delta ≥5 points or recommendation change)
    if (visionScanTrends.length >= 2) {
      const latest = visionScanTrends[visionScanTrends.length - 1]
      const previous = visionScanTrends[visionScanTrends.length - 2]

      if (latest.alignmentIndex !== undefined && previous.alignmentIndex !== undefined) {
        const alignmentChange = latest.alignmentIndex - previous.alignmentIndex
        if (Math.abs(alignmentChange) >= 5) {
          meaningfulChanges.push({
            type: 'vision-scan',
            change: alignmentChange,
            improved: alignmentChange > 0,
            dates: [previous.date, latest.date],
            details: `Alignment: ${latest.alignmentIndex.toFixed(0)} from ${previous.alignmentIndex.toFixed(0)}`,
          })
        }
      }

      // Flag recommendation status change
      if (latest.recommendsProfessionalExam !== previous.recommendsProfessionalExam) {
        meaningfulChanges.push({
          type: 'vision-scan',
          change: latest.recommendsProfessionalExam ? 'now flagged' : 'cleared',
          improved: !latest.recommendsProfessionalExam,
          dates: [previous.date, latest.date],
          details: latest.recommendsProfessionalExam 
            ? 'Now recommends professional exam' 
            : 'No longer recommends professional exam',
        })
      }
    }

    return { acuityTrends, contrastTrends, hearingTrends, visionScanTrends, meaningfulChanges }
  }, [results])

  if (acuityTrends.length === 0 && contrastTrends.length === 0 && hearingTrends.length === 0 && visionScanTrends.length === 0) {
    return null
  }

  // Calculate timespan
  const allTimestamps = [...acuityTrends, ...contrastTrends, ...hearingTrends, ...visionScanTrends].map(t => t.timestamp)
  const timespan = allTimestamps.length > 0 
    ? Math.floor((Math.max(...allTimestamps) - Math.min(...allTimestamps)) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📈 Vision Trends</Text>

      {/* Meaningful Changes Alert */}
      {meaningfulChanges.length > 0 && (
        <View style={styles.alertsContainer}>
          <Text style={styles.alertsHeader}>📊 Screening Changes Detected</Text>
          <Text style={styles.alertsSubheader}>Comparison with prior screening — not a diagnosis</Text>
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
                {change.type === 'acuity' && (
                  <>
                    <Text style={{ fontWeight: '600' }}>
                      {change.eye === 'left' ? 'Left eye (OS)' : 'Right eye (OD)'}:
                    </Text>
                    {' '}{change.improved ? 'Improved' : 'Declined'} by {Math.abs(change as number).toFixed(2)} logMAR{' '}
                    ({change.details}) from {change.dates[0]} to {change.dates[1]}.
                    {!change.improved && ' Consider a professional eye exam.'}
                  </>
                )}
                {change.type === 'hearing' && (
                  <>
                    <Text style={{ fontWeight: '600' }}>
                      Hearing screening{change.eye ? ` (${change.eye === 'left' ? 'L' : 'R'} ear)` : ''}:
                    </Text>
                    {' '}{change.improved ? 'Improved' : 'Declined'} by {Math.abs(change as number)} frequency{Math.abs(change as number) !== 1 ? 'ies' : ''}{' '}
                    ({change.details}) from {change.dates[0]} to {change.dates[1]}.
                    {!change.improved && ' Consider a hearing evaluation.'} Screening only — not calibrated dB HL.
                  </>
                )}
                {change.type === 'vision-scan' && (
                  <>
                    <Text style={{ fontWeight: '600' }}>Vision Scan (mobile camera):</Text>
                    {' '}{change.details} from {change.dates[0]} to {change.dates[1]}.
                    {!change.improved && ' Consider a comprehensive eye exam.'} Screening only — not a clinical assessment.
                  </>
                )}
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

      {/* Hearing Screening Trends */}
      {hearingTrends.length >= 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hearing Screening</Text>
          <Text style={styles.sectionSubtitle}>Wellness screening only — NOT calibrated dB HL. Pass count for 4 test frequencies.</Text>
          
          {hearingTrends.slice(-5).reverse().map((trend, idx) => (
            <View key={idx} style={styles.trendItem}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendDate}>{trend.date}</Text>
                <View style={[styles.badge, { 
                  backgroundColor: trend.overallStatus === 'PASS' ? '#D1FAE5' : '#FEF3C7' 
                }]}>
                  <Text style={[styles.badgeText, { 
                    color: trend.overallStatus === 'PASS' ? '#065F46' : '#92400E' 
                  }]}>
                    {trend.overallStatus}
                  </Text>
                </View>
              </View>
              <View style={styles.hearingMetrics}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Left Ear (L)</Text>
                  <Text style={styles.metricValue}>
                    {trend.leftEarPassCount}/{trend.totalFrequencies}
                  </Text>
                  <View style={[
                    styles.visualBar, 
                    { 
                      width: `${(trend.leftEarPassCount / trend.totalFrequencies) * 100}%`, 
                      backgroundColor: '#14B8A6' 
                    }
                  ]} />
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Right Ear (R)</Text>
                  <Text style={styles.metricValue}>
                    {trend.rightEarPassCount}/{trend.totalFrequencies}
                  </Text>
                  <View style={[
                    styles.visualBar, 
                    { 
                      width: `${(trend.rightEarPassCount / trend.totalFrequencies) * 100}%`, 
                      backgroundColor: '#0D9488' 
                    }
                  ]} />
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Vision Scan Trends */}
      {visionScanTrends.length >= 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vision Scan - Ocular Function</Text>
          <Text style={styles.sectionSubtitle}>Mobile camera screening (alignment, motility, convergence)</Text>
          
          {visionScanTrends.slice(-5).reverse().map((trend, idx) => (
            <View key={idx} style={styles.trendItem}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendDate}>{trend.date}</Text>
                {trend.recommendsProfessionalExam && (
                  <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.badgeText, { color: '#92400E' }]}>⚠️ Refer</Text>
                  </View>
                )}
                {!trend.recommendsProfessionalExam && (
                  <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
                    <Text style={[styles.badgeText, { color: '#065F46' }]}>✓ Pass</Text>
                  </View>
                )}
              </View>
              <View style={styles.visionScanMetrics}>
                {trend.overallConfidence !== undefined && (
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Data Quality</Text>
                    <Text style={styles.metricValue}>{trend.overallConfidence.toFixed(0)}%</Text>
                    <View style={[styles.visualBar, { width: `${trend.overallConfidence}%`, backgroundColor: '#8B5CF6' }]} />
                  </View>
                )}
                {trend.alignmentIndex !== undefined && (
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Alignment Index</Text>
                    <Text style={styles.metricValue}>{trend.alignmentIndex.toFixed(0)}</Text>
                    <View style={[styles.visualBar, { width: `${trend.alignmentIndex}%`, backgroundColor: '#A855F7' }]} />
                  </View>
                )}
              </View>
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
        {hearingTrends.length > 0 && (
          <View style={[styles.statCard, { backgroundColor: '#F0FDFA', borderColor: '#14B8A6' }]}>
            <Text style={[styles.statLabel, { color: '#0F766E' }]}>HEARING SCREENS</Text>
            <Text style={[styles.statValue, { color: '#0D9488' }]}>{hearingTrends.length}</Text>
          </View>
        )}
        {visionScanTrends.length > 0 && (
          <View style={[styles.statCard, { backgroundColor: '#FAF5FF', borderColor: '#8B5CF6' }]}>
            <Text style={[styles.statLabel, { color: '#7C3AED' }]}>VISION SCANS</Text>
            <Text style={[styles.statValue, { color: '#6D28D9' }]}>{visionScanTrends.length}</Text>
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
  alertsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  alertsSubheader: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    fontStyle: 'italic',
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
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  visionScanMetrics: {
    gap: 8,
    marginTop: 8,
  },
  hearingMetrics: {
    gap: 8,
    marginTop: 8,
  },
  metricRow: {
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
})
