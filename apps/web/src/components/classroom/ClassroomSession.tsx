/**
 * Classroom Screening Session Component
 * Walks through students one-by-one for vision screening
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth/auth-context'
import { useParticipants, Participant } from '@/lib/participants/participant-context'
import { Button } from '@/components/ui'
import {
  loadClassroomSession,
  saveClassroomSession,
  clearClassroomSession,
  ClassroomSessionState
} from '@/lib/classroom/session-storage'
import { TEST_TYPE_ID } from '@spect-it/cv'

const EYE_TESTS = [
  { id: 'acuity', name: 'Visual Acuity', route: '/tests/acuity', testType: TEST_TYPE_ID.VISUAL_ACUITY },
  { id: 'color', name: 'Color Vision', route: '/tests/color-vision', testType: TEST_TYPE_ID.COLOR_VISION },
  { id: 'astigmatism', name: 'Astigmatism', route: '/tests/astigmatism', testType: TEST_TYPE_ID.ASTIGMATISM },
  { id: 'contrast', name: 'Contrast Sensitivity', route: '/tests/contrast', testType: TEST_TYPE_ID.CONTRAST_SENSITIVITY },
  { id: 'visual-field', name: 'Visual Field', route: '/tests/visual-field', testType: TEST_TYPE_ID.VISUAL_FIELD },
  { id: 'prescription', name: 'Prescription', route: '/tests/prescription', testType: TEST_TYPE_ID.PRESCRIPTION },
  { id: 'vision-scan', name: 'Vision Scan (Mobile App Only)', route: null, testType: TEST_TYPE_ID.VISION_SCAN, mobileOnly: true }
]

const HEARING_TESTS = [
  { id: 'hearing', name: 'Hearing Screening', route: '/tests/hearing', testType: TEST_TYPE_ID.HEARING }
]

const CORE_TESTS = [...EYE_TESTS, ...HEARING_TESTS]

interface ClassroomSessionProps {
  session: ClassroomSessionState
  onExit: () => void
}

export function ClassroomSession({ session: initialSession, onExit }: ClassroomSessionProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { participants, setActiveParticipant } = useParticipants()
  const [session, setSession] = useState<ClassroomSessionState>(initialSession)
  const [completedTests, setCompletedTests] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)

  const currentParticipantId = session.participantIds[session.currentIndex]
  const currentParticipant = participants.find(p => p.id === currentParticipantId)
  const isLastParticipant = session.currentIndex === session.participantIds.length - 1

  useEffect(() => {
    loadTestResults()
  }, [currentParticipantId])

  useEffect(() => {
    // Set the current participant as active
    if (currentParticipant) {
      setActiveParticipant(currentParticipant)
    }
  }, [currentParticipant])

  useEffect(() => {
    // Persist session state whenever it changes
    if (user) {
      saveClassroomSession(session)
    }
  }, [session, user])

  const loadTestResults = async () => {
    if (!currentParticipantId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('test_type')
        .eq('participant_id', currentParticipantId)

      if (error) throw error

      const testTypes = data?.map(r => r.test_type) || []
      setCompletedTests(prev => ({
        ...prev,
        [currentParticipantId]: testTypes
      }))
    } catch (error) {
      console.error('Error loading test results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (isLastParticipant) {
      handleComplete()
    } else {
      setSession(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1
      }))
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleMarkComplete = () => {
    // Just move to next - the actual test completion is tracked via test_results
    handleNext()
  }

  const handleComplete = () => {
    if (user) {
      clearClassroomSession(user.id)
    }
    onExit()
  }

  const handleTestClick = (route: string | null) => {
    if (route) {
      router.push(route)
    }
  }

  const getTestStatus = (testType: string) => {
    const participantTests = completedTests[currentParticipantId] || []
    return participantTests.includes(testType)
  }

  const getCompletionStats = () => {
    const participantTests = completedTests[currentParticipantId] || []
    const completed = CORE_TESTS.filter(test => participantTests.includes(test.testType)).length
    return { completed, total: CORE_TESTS.length }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading participant data...</p>
        </div>
      </div>
    )
  }

  if (!currentParticipant) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">Participant not found</p>
        <Button onClick={handleComplete} className="mt-4">Exit Session</Button>
      </div>
    )
  }

  const stats = getCompletionStats()

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Student {session.currentIndex + 1} of {session.participantIds.length}
          </span>
          <span className="text-sm font-medium text-gray-600">
            {stats.completed} / {stats.total} tests completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${((session.currentIndex + 1) / session.participantIds.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Participant Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-xl p-8 text-white">
        <div className="flex items-center gap-6">
          <div className="text-6xl">🎓</div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{currentParticipant.display_name}</h2>
            <div className="flex flex-wrap gap-4 text-white/90">
              {currentParticipant.age && <span>Age: {currentParticipant.age}</span>}
              {currentParticipant.role && <span className="capitalize">{currentParticipant.role}</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{stats.completed}/{stats.total}</div>
            <div className="text-sm text-white/80">Tests Done</div>
          </div>
        </div>
      </div>

      {/* Test Checklist */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Screening Tests</h3>
        
        {/* Eye Screening Section */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">👁️ Eye Screening</h4>
          <p className="text-sm text-gray-600 mb-4">Vision screening tests — results are screening only, not a diagnosis</p>
          <div className="space-y-3">
            {EYE_TESTS.map(test => {
              const isCompleted = getTestStatus(test.testType)
              const isMobileOnly = test.mobileOnly || false
              return (
                <div
                  key={test.id}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    isCompleted
                      ? 'border-green-300 bg-green-50'
                      : isMobileOnly
                      ? 'border-purple-200 bg-purple-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-3xl">
                        {isCompleted ? '✅' : isMobileOnly ? '📱' : '⬜'}
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">{test.name}</h5>
                        <p className="text-sm text-gray-500">
                          {isCompleted ? 'Completed' : isMobileOnly ? 'Available in mobile app only' : 'Not started'}
                        </p>
                      </div>
                    </div>
                    {!isMobileOnly && (
                      <Button
                        onClick={() => handleTestClick(test.route)}
                        className={`${
                          isCompleted
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        } text-white`}
                      >
                        {isCompleted ? 'Review' : 'Start Test'}
                      </Button>
                    )}
                    {isMobileOnly && (
                      <div className="text-sm text-purple-600 font-medium px-4 py-2 bg-purple-100 rounded-lg">
                        Mobile Camera
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Hearing Screening Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">🎧 Hearing Screening</h4>
          <p className="text-sm text-gray-600 mb-4">Pure-tone hearing screening — results are screening only, not a diagnosis</p>
          <div className="space-y-3">
            {HEARING_TESTS.map(test => {
              const isCompleted = getTestStatus(test.testType)
              return (
                <div
                  key={test.id}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    isCompleted
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-3xl">
                        {isCompleted ? '✅' : '⬜'}
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">{test.name}</h5>
                        <p className="text-sm text-gray-500">
                          {isCompleted ? 'Completed' : 'Not started'}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleTestClick(test.route)}
                      className={`${
                        isCompleted
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-teal-600 hover:bg-teal-700'
                      } text-white`}
                    >
                      {isCompleted ? 'Review' : 'Start Test'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-between">
        <Button
          onClick={handleComplete}
          variant="outline"
          className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Exit Session
        </Button>
        <div className="flex gap-3">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
          >
            Skip Student
          </Button>
          <Button
            onClick={handleMarkComplete}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {isLastParticipant ? 'Complete Session' : 'Next Student'} →
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Click any test to start it for {currentParticipant.display_name}. 
          When done, return here to continue to the next student.
        </p>
      </div>
    </div>
  )
}
