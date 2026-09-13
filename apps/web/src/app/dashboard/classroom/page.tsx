/**
 * Classroom Screening Session Page
 * Manages classroom-wide vision screening
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { useParticipants } from '@/lib/participants/participant-context'
import { ClassroomSession } from '@/components/classroom/ClassroomSession'
import {
  loadClassroomSession,
  createNewSession,
  ClassroomSessionState
} from '@/lib/classroom/session-storage'
import Link from 'next/link'

export default function ClassroomPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { participants, loading: participantsLoading } = useParticipants()
  const [session, setSession] = useState<ClassroomSessionState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || participantsLoading) return

    if (!user) {
      router.push('/auth/signin')
      return
    }

    // Try to load existing session
    const existingSession = loadClassroomSession(user.id)
    if (existingSession) {
      setSession(existingSession)
      setLoading(false)
      return
    }

    // Check if we should auto-start a session
    const students = participants.filter(p => p.role === 'student' && !p.is_self)
    if (students.length >= 2) {
      // Auto-create session for students
      const newSession = createNewSession(
        user.id,
        students.map(s => s.id)
      )
      setSession(newSession)
    }

    setLoading(false)
  }, [user, authLoading, participants, participantsLoading, router])

  const handleExit = () => {
    router.push('/dashboard')
  }

  if (authLoading || participantsLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classroom session...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Active Classroom Session</h1>
            <p className="text-gray-600 mb-6">
              To start a classroom screening session, you need at least 2 participants with the "student" role.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/dashboard/participants"
                className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Manage Participants
              </Link>
              <Link
                href="/dashboard"
                className="inline-block border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Classroom Screening Session</h1>
          <p className="text-gray-600">Walk through each student for comprehensive vision screening</p>
        </div>

        <ClassroomSession session={session} onExit={handleExit} />
      </div>
    </div>
  )
}
