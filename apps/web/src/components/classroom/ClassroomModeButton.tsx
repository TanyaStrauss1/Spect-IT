/**
 * Classroom Mode Entry Button
 * Shows when conditions are met to enter classroom screening mode
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { useParticipants } from '@/lib/participants/participant-context'
import { Button } from '@/components/ui'
import {
  loadClassroomSession,
  createNewSession,
  saveClassroomSession
} from '@/lib/classroom/session-storage'

interface ClassroomModeButtonProps {
  variant?: 'primary' | 'secondary'
  forceShow?: boolean // Allow manual entry even if <2 students
}

export function ClassroomModeButton({ variant = 'primary', forceShow = false }: ClassroomModeButtonProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { participants } = useParticipants()
  const [hasExistingSession, setHasExistingSession] = useState(false)

  useEffect(() => {
    if (user) {
      const session = loadClassroomSession(user.id)
      setHasExistingSession(!!session)
    }
  }, [user])

  const students = participants.filter(p => p.role === 'student' && !p.is_self)
  const canStartSession = students.length >= 2 || forceShow

  if (!canStartSession && !hasExistingSession) {
    return null
  }

  const handleStartSession = () => {
    if (!user) return

    // Check if there's an existing session
    const existingSession = loadClassroomSession(user.id)
    if (!existingSession) {
      // Create a new session with students or all non-self participants
      const participantIds = students.length >= 2
        ? students.map(s => s.id)
        : participants.filter(p => !p.is_self).map(p => p.id)

      if (participantIds.length === 0) {
        alert('Please add participants before starting a classroom session')
        router.push('/dashboard/participants')
        return
      }

      const newSession = createNewSession(user.id, participantIds)
      saveClassroomSession(newSession)
    }

    router.push('/dashboard/classroom')
  }

  const isPrimary = variant === 'primary'

  return (
    <Button
      onClick={handleStartSession}
      className={isPrimary
        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 font-semibold shadow-lg'
        : 'bg-indigo-600 text-white hover:bg-indigo-700 font-semibold'
      }
    >
      {hasExistingSession ? (
        <>
          <span className="mr-2">↻</span>
          Continue Classroom Session
        </>
      ) : (
        <>
          <span className="mr-2">🎓</span>
          Start Classroom Mode
          {students.length > 0 && <span className="ml-2">({students.length} students)</span>}
        </>
      )}
    </Button>
  )
}
