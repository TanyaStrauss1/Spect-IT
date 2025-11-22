/**
 * User Dashboard - Test Results and History
 */

'use client'

import { useState, useEffect } from 'react'
import { supabase, TestResult } from '@/lib/supabase'
import { ResultCard } from '../components/ui'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui'

export default function DashboardPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResults()
  }, [])

  const loadResults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>

      {results.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">No test results yet.</p>
            <a href="/" className="text-[#667eea] hover:underline">
              Start your first test →
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result) => (
            <ResultCard
              key={result.id}
              testName={result.test_type}
              score={result.result_data?.score || 'N/A'}
              status={getStatus(result.result_data)}
              details={result.result_data?.details}
              recommendation={result.result_data?.recommendation}
              date={new Date(result.created_at).toLocaleDateString()}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function getStatus(resultData: any): 'good' | 'moderate' | 'poor' {
  const score = resultData?.score
  if (typeof score === 'number') {
    if (score >= 80) return 'good'
    if (score >= 60) return 'moderate'
    return 'poor'
  }
  return 'moderate'
}

