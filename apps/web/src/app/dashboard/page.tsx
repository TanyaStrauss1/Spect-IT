/**
 * User Dashboard - Test Results and History
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth/auth-context'
import Link from 'next/link'

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

export default function DashboardPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    loadResults()
  }, [user, router])

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Dashboard</h1>
          <p className="text-gray-600">View your vision screening history and track your progress</p>
        </div>

        {results.length === 0 ? (
          <div className="bg-white rounded-lg shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">👁️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No test results yet</h2>
            <p className="text-gray-600 mb-6">Take your first vision screening to get started</p>
            <Link
              href="/tests/acuity"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Start Visual Acuity Test
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Tests Completed</p>
                  <p className="text-3xl font-bold text-indigo-600">{results.length}</p>
                </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tests/acuity"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
              >
                Visual Acuity
              </Link>
              <Link
                href="/tests/color-vision"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
              >
                Color Vision
              </Link>
              <Link
                href="/tests/astigmatism"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
              >
                Astigmatism
              </Link>
              <Link
                href="/tests/contrast"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
              >
                Contrast Sensitivity
              </Link>
              <Link
                href="/tests/visual-field"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
              >
                Visual Field
              </Link>
              <Link
                href="/tests/prescription"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
              >
                Prescription
              </Link>
            </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Test History</h2>
              <div className="space-y-4">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{result.test_type}</h3>
                          <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
                            {result.test_name}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {result.test_type === 'Visual Acuity' && (
                            <>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Snellen</p>
                                <p className="text-lg font-bold text-indigo-600">{result.test_data?.snellen || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Decimal</p>
                                <p className="text-lg font-semibold text-gray-900">{result.decimal_acuity?.toFixed(2) || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Lines Read</p>
                                <p className="text-lg font-semibold text-gray-900">{result.score || 0}</p>
                              </div>
                            </>
                          )}
                          {result.test_type === 'Color Vision' && (
                            <>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Result</p>
                                <p className="text-sm font-bold text-purple-600">{result.test_data?.screeningResult || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Plates Correct</p>
                                <p className="text-lg font-semibold text-gray-900">{result.score || 0}/{result.test_data?.platesTotal || 8}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Control Plates</p>
                                <p className="text-lg font-semibold text-gray-900">{result.test_data?.controlPlatesCorrect || 0}/2</p>
                              </div>
                            </>
                          )}
                          {result.test_type === 'Astigmatism' && (
                            <>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Assessment</p>
                                <p className="text-sm font-bold text-indigo-600">{result.test_data?.overallAssessment || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Left Eye</p>
                                <p className="text-sm font-semibold text-gray-900">{result.test_data?.leftEye?.status || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Right Eye</p>
                                <p className="text-sm font-semibold text-gray-900">{result.test_data?.rightEye?.status || 'N/A'}</p>
                              </div>
                            </>
                          )}
                          {result.test_type === 'Contrast Sensitivity' && (
                            <>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Assessment</p>
                                <p className="text-sm font-bold text-indigo-600">{result.test_data?.assessment || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Lowest Level</p>
                                <p className="text-lg font-semibold text-gray-900">{result.test_data?.lowestContrastLevel || 0}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Accuracy</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {result.test_data?.correctCount || 0}/{result.test_data?.totalCount || 0}
                                </p>
                              </div>
                            </>
                          )}
                          {result.test_type === 'Visual Field' && (
                            <>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Assessment</p>
                                <p className="text-sm font-bold text-indigo-600">{result.test_data?.assessment || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Left Eye</p>
                                <p className="text-lg font-semibold text-gray-900">{result.test_data?.leftEye?.percentage || 0}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Right Eye</p>
                                <p className="text-lg font-semibold text-gray-900">{result.test_data?.rightEye?.percentage || 0}%</p>
                              </div>
                            </>
                          )}
                          {result.test_type === 'Prescription Measurement' && (
                            <>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Left Distance</p>
                                <p className="text-sm font-semibold text-gray-900">{result.test_data?.leftEye?.distance || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Right Distance</p>
                                <p className="text-sm font-semibold text-gray-900">{result.test_data?.rightEye?.distance || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Note</p>
                                <p className="text-xs text-orange-600 font-semibold">Screening estimate only</p>
                              </div>
                            </>
                          )}
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Date</p>
                            <p className="text-sm text-gray-700">
                              {new Date(result.test_date || result.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
          <p className="text-sm text-blue-800">
            These results are screening assessments and not a substitute for professional medical advice. 
            Please consult a qualified eye care professional for comprehensive eye examinations and 
            any concerns about your vision.
          </p>
        </div>
      </div>
    </div>
  )
}

