import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../supabase'
import { useAuth } from './auth-context'

export interface Participant {
  id: string
  user_id: string
  display_name: string
  date_of_birth?: string
  age?: number
  role?: 'self' | 'child' | 'student' | 'family' | 'other'
  notes?: string
  is_self: boolean
  archived: boolean
  created_at: string
  updated_at: string
}

interface ParticipantContextType {
  participants: Participant[]
  activeParticipant: Participant | null
  loading: boolean
  setActiveParticipant: (participant: Participant) => Promise<void>
  refreshParticipants: () => Promise<void>
}

const ParticipantContext = createContext<ParticipantContextType | undefined>(undefined)

const ACTIVE_PARTICIPANT_KEY = 'spectit_active_participant_id'

export function ParticipantProvider({ children }: { children: React.ReactNode }) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [activeParticipant, setActiveParticipantState] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const loadParticipants = useCallback(async () => {
    if (!user) {
      setParticipants([])
      setActiveParticipantState(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('is_self', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) throw error

      setParticipants(data || [])

      // Restore active participant from AsyncStorage or default to first/self
      const savedParticipantId = await AsyncStorage.getItem(ACTIVE_PARTICIPANT_KEY)
      let active = null

      if (savedParticipantId && data) {
        active = data.find(p => p.id === savedParticipantId) || null
      }

      if (!active && data && data.length > 0) {
        // Default to "self" participant or first one
        active = data.find(p => p.is_self) || data[0]
      }

      setActiveParticipantState(active)
    } catch (error) {
      console.error('Error loading participants:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadParticipants()
  }, [loadParticipants])

  const setActiveParticipant = useCallback(async (participant: Participant) => {
    setActiveParticipantState(participant)
    await AsyncStorage.setItem(ACTIVE_PARTICIPANT_KEY, participant.id)
  }, [])

  const refreshParticipants = useCallback(async () => {
    await loadParticipants()
  }, [loadParticipants])

  return (
    <ParticipantContext.Provider
      value={{
        participants,
        activeParticipant,
        loading,
        setActiveParticipant,
        refreshParticipants,
      }}
    >
      {children}
    </ParticipantContext.Provider>
  )
}

export function useParticipants() {
  const context = useContext(ParticipantContext)
  if (context === undefined) {
    throw new Error('useParticipants must be used within a ParticipantProvider')
  }
  return context
}
