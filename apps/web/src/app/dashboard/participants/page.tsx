/**
 * Participants Management Page
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { ParticipantManager } from '@/components/participants/ParticipantManager'
import { ClassroomModeButton } from '@/components/classroom/ClassroomModeButton'
import Link from 'next/link'

export default function ParticipantsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/auth/signin')
      return
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <ClassroomModeButton variant="primary" />
        </div>
        <ParticipantManager />
        
        <div className="mt-8 bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">How It Works</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <strong>Add Participants:</strong> Add children, students, or family members who will be taking vision screening tests.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <strong>Select Active Participant:</strong> Before starting a test, use the participant switcher in the header to select who is being tested.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <strong>Track Results:</strong> Each participant's test results are kept separate, allowing you to track progress over time.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            Classroom Screening Mode
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            For teachers and school nurses: When you have 2 or more participants with the "student" role, 
            you can enter Classroom Mode to efficiently screen students one-by-one through all 6 vision tests.
          </p>
          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
            <li>Automatically walks through each student in sequence</li>
            <li>Shows which tests are complete and which are missing</li>
            <li>Quick navigation to start any test</li>
            <li>Session persists across browser sessions</li>
            <li>Skip students or mark complete as needed</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
