/**
 * Classroom Screening Session - LocalStorage Manager
 * Persists classroom session state scoped by user ID
 */

export interface ClassroomSessionState {
  userId: string
  participantIds: string[]
  currentIndex: number
  completedTests: Record<string, string[]> // participant_id -> test_type[]
  startedAt: string
  lastUpdatedAt: string
}

const STORAGE_KEY_PREFIX = 'spectit_classroom_session_'

export function getSessionKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`
}

export function loadClassroomSession(userId: string): ClassroomSessionState | null {
  if (typeof window === 'undefined') return null
  
  try {
    const key = getSessionKey(userId)
    const stored = localStorage.getItem(key)
    if (!stored) return null
    
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error loading classroom session:', error)
    return null
  }
}

export function saveClassroomSession(state: ClassroomSessionState): void {
  if (typeof window === 'undefined') return
  
  try {
    const key = getSessionKey(state.userId)
    const updated = {
      ...state,
      lastUpdatedAt: new Date().toISOString()
    }
    localStorage.setItem(key, JSON.stringify(updated))
  } catch (error) {
    console.error('Error saving classroom session:', error)
  }
}

export function clearClassroomSession(userId: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const key = getSessionKey(userId)
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error clearing classroom session:', error)
  }
}

export function createNewSession(
  userId: string,
  participantIds: string[]
): ClassroomSessionState {
  return {
    userId,
    participantIds,
    currentIndex: 0,
    completedTests: {},
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString()
  }
}
