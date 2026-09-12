/**
 * Vision Trends Chart Component
 * Shows longitudinal acuity and contrast trends with change detection
 */

'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { TestResult } from '@/lib/results/clinical-summary'
import { convertSnellenToLogMAR } from '@/lib/results/clinical-summary'

interface TrendsChartProps {
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

export function TrendsChart({ results }: TrendsChartProps) {
  const { acuityTrends, contrastTrends, meaningfulChanges } = useMemo(() => {
    // Extract acuity results
    const acuityResults = results.filter(r => 
      r.test_type === 'Visual Acuity' || r.test_name === 'Visual Acuity'
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    // Extract contrast results
    const contrastResults = results.filter(r => 
      r.test_type === 'Contrast Sensitivity' || r.test_name === 'Contrast Sensitivity'
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
        contrastScore: contrastScore ? contrastScore * 100 : undefined, // Convert to percentage
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

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Vision Trends</h2>

      {/* Meaningful Changes Alert */}
      {meaningfulChanges.length > 0 && (
        <div className="mb-6 space-y-2">
          {meaningfulChanges.map((change, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-l-4 ${
                change.improved 
                  ? 'bg-green-50 border-green-500' 
                  : 'bg-amber-50 border-amber-500'
              }`}
            >
              <p className={`text-sm font-semibold ${
                change.improved ? 'text-green-900' : 'text-amber-900'
              }`}>
                {change.improved ? '✓ Improvement Detected' : '⚠️ Change Detected'}
              </p>
              <p className={`text-sm ${
                change.improved ? 'text-green-800' : 'text-amber-800'
              }`}>
                {change.eye === 'left' ? 'Left eye (OS)' : 'Right eye (OD)'}: 
                {' '}{change.improved ? 'Improved' : 'Declined'} by {Math.abs(change).toFixed(2)} logMAR
                {' '}from {change.dates[0]} to {change.dates[1]}.
                {!change.improved && ' Consider an eye exam.'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Acuity Trends Chart */}
      {acuityTrends.length >= 2 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distance Vision (logMAR)</h3>
          <p className="text-sm text-gray-600 mb-4">Lower values = better vision. Change ≥0.1 is clinically meaningful.</p>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={acuityTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                domain={[-0.3, 1.0]}
                reversed
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                label={{ value: 'logMAR (lower = better)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                formatter={(value: any, name: string) => {
                  const numValue = typeof value === 'number' ? value : parseFloat(value)
                  const snellenKey = name === 'Left Eye (OS)' ? 'leftSnellen' : 'rightSnellen'
                  const snellen = (acuityTrends.find(t => 
                    (name === 'Left Eye (OS)' && t.leftLogMAR === numValue) || 
                    (name === 'Right Eye (OD)' && t.rightLogMAR === numValue)
                  ) as any)?.[snellenKey]
                  return [`${numValue.toFixed(2)} (${snellen || '?'})`, name]
                }}
              />
              <Legend />
              <ReferenceLine y={0.0} stroke="#10b981" strokeDasharray="3 3" label={{ value: '6/6 (20/20)', position: 'right', fill: '#10b981', fontSize: 10 }} />
              <ReferenceLine y={0.3} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '6/12 pass threshold', position: 'right', fill: '#f59e0b', fontSize: 10 }} />
              <Line 
                type="monotone" 
                dataKey="leftLogMAR" 
                stroke="#9333ea" 
                strokeWidth={2}
                name="Left Eye (OS)"
                dot={{ fill: '#9333ea', r: 4 }}
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="rightLogMAR" 
                stroke="#f97316" 
                strokeWidth={2}
                name="Right Eye (OD)"
                dot={{ fill: '#f97316', r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Contrast Trends Chart */}
      {contrastTrends.length >= 2 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Contrast Sensitivity</h3>
          <p className="text-sm text-gray-600 mb-4">Higher values = better contrast perception.</p>
          
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={contrastTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                domain={[0, 100]}
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                formatter={(value: any) => [`${parseFloat(value).toFixed(1)}%`, 'Score']}
              />
              <Legend />
              <ReferenceLine y={70} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Normal range', position: 'right', fill: '#10b981', fontSize: 10 }} />
              <Line 
                type="monotone" 
                dataKey="contrastScore" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Contrast Score"
                dot={{ fill: '#3b82f6', r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {acuityTrends.length > 0 && (
          <>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">Left Eye Tests</p>
              <p className="text-2xl font-bold text-purple-900">{acuityTrends.filter(t => t.leftLogMAR !== undefined).length}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-xs text-orange-600 uppercase tracking-wide mb-1">Right Eye Tests</p>
              <p className="text-2xl font-bold text-orange-900">{acuityTrends.filter(t => t.rightLogMAR !== undefined).length}</p>
            </div>
          </>
        )}
        {contrastTrends.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Contrast Tests</p>
            <p className="text-2xl font-bold text-blue-900">{contrastTrends.length}</p>
          </div>
        )}
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Timespan</p>
          <p className="text-lg font-bold text-green-900">
            {Math.max(
              ...[...acuityTrends, ...contrastTrends].map(t => t.timestamp)
            ) - Math.min(
              ...[...acuityTrends, ...contrastTrends].map(t => t.timestamp)
            ) > 0 
              ? `${Math.floor((Math.max(...[...acuityTrends, ...contrastTrends].map(t => t.timestamp)) - Math.min(...[...acuityTrends, ...contrastTrends].map(t => t.timestamp))) / (1000 * 60 * 60 * 24))}d`
              : '1d'}
          </p>
        </div>
      </div>
    </div>
  )
}
