/**
 * Advanced Global State Management with Zustand
 * Provides centralized state for the entire application
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
}

interface TestResult {
  id: string
  testType: string
  score: number
  timestamp: Date
  details: Record<string, any>
}

interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean
  
  // Test state
  currentTest: string | null
  testResults: TestResult[]
  testHistory: TestResult[]
  
  // UI state
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  notifications: Notification[]
  
  // Performance state
  loading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setAuthenticated: (isAuth: boolean) => void
  setCurrentTest: (test: string | null) => void
  addTestResult: (result: TestResult) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSidebarOpen: (open: boolean) => void
  addNotification: (notification: Notification) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        currentTest: null,
        testResults: [],
        testHistory: [],
        theme: 'system',
        sidebarOpen: false,
        notifications: [],
        loading: false,
        error: null,

        // Actions
        setUser: (user) => set({ user }),
        setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
        setCurrentTest: (test) => set({ currentTest: test }),
        addTestResult: (result) => set((state) => ({
          testResults: [...state.testResults, result],
          testHistory: [...state.testHistory, result],
        })),
        setTheme: (theme) => set({ theme }),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        addNotification: (notification) => set((state) => ({
          notifications: [...state.notifications, notification],
        })),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
      }),
      {
        name: 'spect-it-store',
        partialize: (state) => ({
          user: state.user,
          theme: state.theme,
          testHistory: state.testHistory,
        }),
      }
    ),
    { name: 'SpectITStore' }
  )
)

