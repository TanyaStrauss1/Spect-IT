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
  createParticipant: (data: Omit<Participant, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Participant | null>
  updateParticipant: (id: string, data: Partial<Participant>) => Promise<boolean>
  archiveParticipant: (id: string) => Promise<boolean>
  deleteParticipant: (id: string) => Promise<boolean>
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

  const createParticipant = useCallback(async (data: Omit<Participant, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null

    try {
      const { data: newParticipant, error } = await supabase
        .from('participants')
        .insert({
          user_id: user.id,
          ...data,
        })
        .select()
        .single()

      if (error) throw error

      await loadParticipants()
      return newParticipant
    } catch (error) {
      console.error('Error creating participant:', error)
      return null
    }
  }, [user, loadParticipants])

  const updateParticipant = useCallback(async (id: string, data: Partial<Participant>) => {
    try {
      const { error } = await supabase
        .from('participants')
        .update(data)
        .eq('id', id)

      if (error) throw error

      await loadParticipants()
      return true
    } catch (error) {
      console.error('Error updating participant:', error)
      return false
    }
  }, [loadParticipants])

  const archiveParticipant = useCallback(async (id: string) => {
    return updateParticipant(id, { archived: true })
  }, [updateParticipant])

  const deleteParticipant = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id)

      if (error) throw error

      await loadParticipants()
      return true
    } catch (error) {
      console.error('Error deleting participant:', error)
      return false
    }
  }, [loadParticipants])

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
        createParticipant,
        updateParticipant,
        archiveParticipant,
        deleteParticipant,
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
