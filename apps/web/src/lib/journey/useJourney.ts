/**
 * Guided Journey State Management
 * Tracks test completion progress, session resume, and recommended test order
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

export interface TestDefinition {
  id: string
  name: string
  icon: string
  duration: string
  why: string
  requires: string[]
  category: 'essential' | 'recommended' | 'advanced' | 'summary'
  route: string
}

export const RECOMMENDED_TESTS: TestDefinition[] = [
  {
    id: 'visual-acuity',
    name: 'Visual Acuity',
    icon: '📏',
    duration: '3-5 min',
    why: 'Baseline measurement of distance vision — the foundation for all other tests',
    requires: ['distance', 'lighting', 'glasses'],
    category: 'essential',
    route: '/tests/acuity'
  },
  {
    id: 'contrast',
    name: 'Contrast Sensitivity',
    icon: '🌓',
    duration: '3-4 min',
    why: 'Assesses how well you see in low light or fog — critical for night driving',
    requires: ['distance', 'lighting', 'glasses'],
    category: 'essential',
    route: '/tests/contrast'
  },
  {
    id: 'color-vision',
    name: 'Color Vision',
    icon: '🎨',
    duration: '2-3 min',
    why: 'Detects color vision deficiencies using confusion-line pseudoisochromatic plates',
    requires: ['lighting'],
    category: 'recommended',
    route: '/tests/color-vision'
  },
  {
    id: 'astigmatism',
    name: 'Astigmatism',
    icon: '⚫',
    duration: '2-3 min',
    why: 'Identifies corneal irregularities that blur vision',
    requires: ['distance', 'lighting', 'glasses-off'],
    category: 'recommended',
    route: '/tests/astigmatism'
  },
  {
    id: 'visual-field',
    name: 'Visual Field',
    icon: '👁️',
    duration: '5-7 min',
    why: 'Checks peripheral vision and blind spots',
    requires: ['distance', 'lighting', 'occlusion'],
    category: 'advanced',
    route: '/tests/visual-field'
  },
  {
    id: 'prescription',
    name: 'Refractive Screening',
    icon: '🔍',
    duration: '5-10 min',
    why: 'Compares pinhole vs uncorrected acuity to detect if correction may help — NOT a prescription',
    requires: ['completed-acuity', 'completed-astigmatism'],
    category: 'summary',
    route: '/tests/prescription'
  }
]

export interface ChecklistItem {
  id: string
  text: string
  detail: string
  icon: string
}

export const CHECKLIST_ITEMS: Record<string, ChecklistItem> = {
  distance: {
    id: 'distance',
    text: 'Position yourself at the recommended distance from your screen',
    detail: 'Most tests require 3-6 meters. Follow the on-screen guidance.',
    icon: '📏'
  },
  lighting: {
    id: 'lighting',
    text: 'Ensure moderate room lighting without glare on the display',
    detail: 'Avoid bright sunlight or darkness. Your screen should be clearly visible.',
    icon: '💡'
  },
  glasses: {
    id: 'glasses',
    text: 'Wear your usual glasses or contact lenses',
    detail: 'Test with your normal vision correction unless instructed otherwise.',
    icon: '👓'
  },
  'glasses-off': {
    id: 'glasses-off',
    text: 'Remove glasses or contact lenses for this test',
    detail: 'This test measures your uncorrected vision.',
    icon: '👓'
  },
  occlusion: {
    id: 'occlusion',
    text: 'You will need to cover one eye during this test',
    detail: 'Use your hand, a tissue, or an eye patch. Do not press on the closed eye.',
    icon: '👁️'
  },
  'completed-acuity': {
    id: 'completed-acuity',
    text: 'Complete the Visual Acuity test first',
    detail: 'This test uses your acuity results for accurate estimation.',
    icon: '✓'
  },
  'completed-astigmatism': {
    id: 'completed-astigmatism',
    text: 'Complete the Astigmatism test first',
    detail: 'This test uses your astigmatism results for accurate estimation.',
    icon: '✓'
  }
}

interface JourneyProgress {
  completed: string[]
  inProgress: string | null
  lastUpdated: number
}

const SESSION_KEY = 'spectit_screening_session'
const PROGRESS_KEY = 'spectit_test_progress'

export function useJourney() {
  const [progress, setProgress] = useState<JourneyProgress>({
    completed: [],
    inProgress: null,
    lastUpdated: Date.now()
  })

  // Load progress from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(PROGRESS_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setProgress({
          completed: parsed.completed || [],
          inProgress: parsed.inProgress || null,
          lastUpdated: parsed.lastUpdated || Date.now()
        })
      } catch (e) {
        console.error('Error parsing journey progress:', e)
      }
    }
  }, [])

  const saveProgress = useCallback((newProgress: JourneyProgress) => {
    setProgress(newProgress)
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress))
  }, [])

  const markTestComplete = useCallback((testId: string) => {
    setProgress(prev => {
      const completed = prev.completed.includes(testId) 
        ? prev.completed 
        : [...prev.completed, testId]
      const newProgress = {
        completed,
        inProgress: null,
        lastUpdated: Date.now()
      }
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress))
      return newProgress
    })
  }, [])

  const markTestInProgress = useCallback((testId: string) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        inProgress: testId,
        lastUpdated: Date.now()
      }
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress))
      return newProgress
    })
  }, [])

  const resetProgress = useCallback(() => {
    const newProgress = {
      completed: [],
      inProgress: null,
      lastUpdated: Date.now()
    }
    saveProgress(newProgress)
  }, [saveProgress])

  const getNextRecommendedTest = useCallback(() => {
    for (const test of RECOMMENDED_TESTS) {
      if (!progress.completed.includes(test.id)) {
        // Check if requirements are met
        let reqsMet = true
        for (const req of test.requires) {
          if (req === 'completed-acuity' && !progress.completed.includes('visual-acuity')) {
            reqsMet = false
            break
          }
          if (req === 'completed-astigmatism' && !progress.completed.includes('astigmatism')) {
            reqsMet = false
            break
          }
        }
        if (reqsMet) return test
      }
    }
    return null
  }, [progress.completed])

  const calculateProgress = useCallback(() => {
    const total = RECOMMENDED_TESTS.length
    const completed = progress.completed.length
    const percentage = Math.round((completed / total) * 100)
    
    return {
      completed,
      total,
      percentage,
      remaining: total - completed
    }
  }, [progress.completed])

  const isTestAvailable = useCallback((testId: string) => {
    const test = RECOMMENDED_TESTS.find(t => t.id === testId)
    if (!test) return false

    // Check requirements
    for (const req of test.requires) {
      if (req === 'completed-acuity' && !progress.completed.includes('visual-acuity')) {
        return false
      }
      if (req === 'completed-astigmatism' && !progress.completed.includes('astigmatism')) {
        return false
      }
    }
    return true
  }, [progress.completed])

  return {
    progress,
    markTestComplete,
    markTestInProgress,
    resetProgress,
    getNextRecommendedTest,
    calculateProgress,
    isTestAvailable
  }
}
