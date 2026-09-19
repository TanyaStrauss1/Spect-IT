/**
 * User Dashboard - Test Results and History
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth/auth-context'
import { useParticipants } from '@/lib/participants/participant-context'
import Link from 'next/link'
import { Button } from '@/components/ui'
import CalibrationModal, { useCalibration } from '@/components/CalibrationModal'
import { OnboardingModal, useOnboarding } from '@/components/OnboardingModal'
import { TrendsChart } from '@/components/dashboard/TrendsChart'
import { ClassroomModeButton } from '@/components/classroom/ClassroomModeButton'

interface TestResult {
  id: number
  user_id: string
  test_type: string
  test_name?: string
  test_data: any
  results?: any
  score?: number
  decimal_acuity?: number
  test_date?: string
  created_at: string
}

export default function DashboardPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { activeParticipant, participants, loading: participantsLoading } = useParticipants()
  const { calibrator, isCalibrated, isModalOpen, setIsModalOpen } = useCalibration()
  const { isOnboardingOpen, markOnboardingComplete, setIsOnboardingOpen } = useOnboarding()

  const studentCount = participants.filter(p => p.role === 'student').length
  const hasMultipleStudents = studentCount > 1

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/auth/signin')
      return
    }
    
    // Only load results if participants are loaded
    if (!participantsLoading) {
      loadResults()
    }
  }, [user, authLoading, router, participantsLoading, activeParticipant])

  const loadResults = async () => {
    if (!user) return
    
    setError(null)
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
    } catch (error: any) {
      console.error('Error loading results:', error)
      setError(error.message || 'Failed to load test results. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }

  const getCalibrationStatus = () => {
    if (!isCalibrated) {
      return { text: 'Not calibrated', color: 'bg-red-100 text-red-700 border-red-300', icon: '⚠️' }
    }
    
    const timestamp = localStorage.getItem('spectit_calibration_timestamp')
    if (!timestamp) {
      return { text: 'Calibrated', color: 'bg-green-100 text-green-700 border-green-300', icon: '✓' }
    }
    
    const age = Date.now() - parseInt(timestamp)
    const daysOld = Math.floor(age / (24 * 60 * 60 * 1000))
    
    if (daysOld > 30) {
      return { text: `Re-check needed (${daysOld} days old)`, color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '🔄' }
    }
    
    return { text: `Calibrated (${daysOld} days ago)`, color: 'bg-green-100 text-green-700 border-green-300', icon: '✓' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Retrieving test results</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => {
                setLoading(true)
                loadResults()
              }}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Try Again
            </Button>
            <Link href="/">
              <Button variant="outline">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const calibrationStatus = getCalibrationStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {activeParticipant && !activeParticipant.is_self ? (
                  <>
                    <span className="text-indigo-600">{activeParticipant.display_name}'s</span> Dashboard
                  </>
                ) : (
                  'Your Dashboard'
                )}
              </h1>
              <p className="text-gray-600">
                {activeParticipant && !activeParticipant.is_self
                  ? `Viewing test results and screening history for ${activeParticipant.display_name}`
                  : 'View your vision screening history and track your progress'}
              </p>
            </div>
            
            {/* Calibration Status Badge */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${calibrationStatus.color} hover:opacity-80`}
            >
              {calibrationStatus.icon} {calibrationStatus.text}
            </button>
          </div>
        </div>

        {hasMultipleStudents && (
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">👥</span>
              <div className="flex-1">
                <h3 className="font-semibold text-indigo-900 text-sm">Testing Multiple Students</h3>
                <p className="text-sm text-indigo-800 mt-1">
                  Currently viewing: <strong>{activeParticipant?.display_name}</strong>.
                  Remember to use the participant switcher in the header before each test to select who is being screened.
                </p>
              </div>
            </div>
          </div>
        )}

        {results.length === 0 ? (
          <div className="bg-white rounded-lg shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">👁️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {activeParticipant && !activeParticipant.is_self
                ? `No test results for ${activeParticipant.display_name} yet`
                : 'No test results yet'}
            </h2>
            <p className="text-gray-600 mb-2">
              {activeParticipant && !activeParticipant.is_self
                ? `Start a vision screening test for ${activeParticipant.display_name}`
                : 'Take your first vision screening to get started'}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {activeParticipant && !activeParticipant.is_self
                ? `Results, trends, and clinical summary for ${activeParticipant.display_name} will appear here after completing tests`
                : 'Your results, trends, and clinical summary will appear here after completing tests'}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/tests/acuity"
                className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Start Visual Acuity Test
              </Link>
              <Link
                href="/tests"
                className="inline-block border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                Browse All Tests
              </Link>
              {participants.length > 0 && (
                <>
                  <Link
                    href="/dashboard/participants"
                    className="inline-block border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Manage Participants
                  </Link>
                  <ClassroomModeButton variant="primary" />
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Trends Chart */}
            <TrendsChart results={results} />

            <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-gray-600 text-sm">
                    {activeParticipant && !activeParticipant.is_self
                      ? `Tests completed by ${activeParticipant.display_name}`
                      : 'Total Tests Completed'}
                  </p>
                  <p className="text-3xl font-bold text-indigo-600">{results.length}</p>
                  {activeParticipant && !activeParticipant.is_self && activeParticipant.role && (
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      Role: {activeParticipant.role}
                      {activeParticipant.age && ` • Age: ${activeParticipant.age}`}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
              <ClassroomModeButton variant="secondary" />
              <Link
                href="/dashboard/clinical-summary"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors text-sm"
              >
                📋 Screening Profile
              </Link>
              {participants.length > 0 && (
                <Link
                  href="/dashboard/participants"
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-sm"
                >
                  👥 Manage Participants
                </Link>
              )}
            </div>
              </div>
            </div>

            {/* Eye Screening Quick Actions */}
            <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">👁️ Eye Screening</h3>
              <p className="text-sm text-gray-600 mb-4">Vision screening tests — results are screening only, not a diagnosis</p>
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

            {/* Hearing Screening Quick Actions */}
            <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">🎧 Hearing Screening</h3>
              <p className="text-sm text-gray-600 mb-4">Pure-tone hearing screening — results are screening only, not a diagnosis</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/tests/hearing"
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-sm"
                >
                  Hearing Test
                </Link>
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
                          {result.test_type.includes('Visual Acuity') && (
                            <>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Right Eye (OD)</p>
                                <p className="text-lg font-bold text-indigo-600">
                                  {result.results?.rightEye?.snellen || result.test_data?.rightEye?.finalSnellen || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  logMAR: {result.results?.rightEye?.logMAR?.toFixed(2) || result.test_data?.rightEye?.finalLogMAR?.toFixed(2) || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Left Eye (OS)</p>
                                <p className="text-lg font-bold text-purple-600">
                                  {result.results?.leftEye?.snellen || result.test_data?.leftEye?.finalSnellen || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  logMAR: {result.results?.leftEye?.logMAR?.toFixed(2) || result.test_data?.leftEye?.finalLogMAR?.toFixed(2) || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">OD Category</p>
                                <p className={`text-sm font-semibold ${
                                  (result.results?.rightEye?.category || result.test_data?.rightEye?.category) === 'PASS' ? 'text-green-600' :
                                  (result.results?.rightEye?.category || result.test_data?.rightEye?.category) === 'BORDERLINE' ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {result.results?.rightEye?.category || result.test_data?.rightEye?.category || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">OS Category</p>
                                <p className={`text-sm font-semibold ${
                                  (result.results?.leftEye?.category || result.test_data?.leftEye?.category) === 'PASS' ? 'text-green-600' :
                                  (result.results?.leftEye?.category || result.test_data?.leftEye?.category) === 'BORDERLINE' ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {result.results?.leftEye?.category || result.test_data?.leftEye?.category || 'N/A'}
                                </p>
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

      {/* Calibration Modal */}
      <CalibrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={() => setIsModalOpen(false)}
        calibrator={calibrator}
      />
    </div>
  )
}

