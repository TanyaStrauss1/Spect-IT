/**
 * Spect-IT Contrast Sensitivity Test Module
 * 
 * Pelli-Robson style contrast sensitivity screening:
 * - Letters at fixed size (~3° visual angle)
 * - Contrast decreases in 0.15 log steps
 * - Tests contrast sensitivity function (CSF)
 * - Reports logCS (log contrast sensitivity) score
 * - Stopping rule when letters become invisible
 * 
 * Based on website/clinical-tests.js from PR #57
 */

import type { CalibrationData } from '../calibration/screen-calibrator'

/**
 * Sloan letters for contrast testing
 */
export const CONTRAST_LETTERS = ['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V', 'Z'] as const
export type ContrastLetter = typeof CONTRAST_LETTERS[number]

/**
 * Contrast level configuration
 */
export interface ContrastLevel {
  logCS: number // Log contrast sensitivity
  contrast: number // Weber contrast (0-1)
  letters: ContrastLetter[] // 3 letters per level
  triplet: number // Triplet number (1, 2, 3...)
}

/**
 * Letter response during testing
 */
export interface ContrastLetterResponse {
  letter: ContrastLetter
  userResponse: string
  correct: boolean
}

/**
 * Triplet response (3 letters at same contrast)
 */
export interface ContrastTripletResponse {
  level: ContrastLevel
  letters: ContrastLetterResponse[]
  correctCount: number
}

/**
 * Complete contrast sensitivity test result
 */
export interface ContrastSensitivityResult {
  testName: 'Contrast Sensitivity (Pelli-Robson Style)'
  version: '2.0-clinical'
  timestamp: number
  calibration: CalibrationData
  triplets: ContrastTripletResponse[]
  finalLogCS: number
  category: 'NORMAL' | 'BORDERLINE' | 'REDUCED'
  methodology: string
}

/**
 * Standard Pelli-Robson style contrast levels
 * Starting at high contrast, decreasing by 0.15 log steps
 */
export const CONTRAST_LEVELS: ContrastLevel[] = [
  { logCS: 0.00, contrast: 1.00, letters: ['R', 'N', 'C'], triplet: 1 },
  { logCS: 0.15, contrast: 0.71, letters: ['S', 'O', 'K'], triplet: 2 },
  { logCS: 0.30, contrast: 0.50, letters: ['V', 'H', 'Z'], triplet: 3 },
  { logCS: 0.45, contrast: 0.35, letters: ['D', 'K', 'N'], triplet: 4 },
  { logCS: 0.60, contrast: 0.25, letters: ['O', 'H', 'R'], triplet: 5 },
  { logCS: 0.75, contrast: 0.18, letters: ['C', 'S', 'Z'], triplet: 6 },
  { logCS: 0.90, contrast: 0.13, letters: ['V', 'D', 'K'], triplet: 7 },
  { logCS: 1.05, contrast: 0.09, letters: ['N', 'H', 'C'], triplet: 8 },
  { logCS: 1.20, contrast: 0.06, letters: ['S', 'R', 'O'], triplet: 9 },
  { logCS: 1.35, contrast: 0.04, letters: ['Z', 'K', 'V'], triplet: 10 },
  { logCS: 1.50, contrast: 0.03, letters: ['D', 'H', 'N'], triplet: 11 },
  { logCS: 1.65, contrast: 0.02, letters: ['C', 'O', 'R'], triplet: 12 },
  { logCS: 1.80, contrast: 0.015, letters: ['S', 'V', 'Z'], triplet: 13 },
  { logCS: 1.95, contrast: 0.01, letters: ['K', 'D', 'H'], triplet: 14 },
  { logCS: 2.10, contrast: 0.008, letters: ['N', 'C', 'S'], triplet: 15 },
  { logCS: 2.25, contrast: 0.006, letters: ['R', 'O', 'V'], triplet: 16 },
]

/**
 * Contrast Sensitivity Test Controller
 */
export class ContrastSensitivityTest {
  private letterSizeArcMin: number // Fixed letter size in arc minutes

  constructor(config: { letterSizeArcMin?: number } = {}) {
    this.letterSizeArcMin = config.letterSizeArcMin || 180 // ~3° visual angle
  }

  /**
   * Get contrast levels to test
   */
  getContrastLevels(): ContrastLevel[] {
    return [...CONTRAST_LEVELS]
  }

  /**
   * Get letter size in arc minutes
   */
  getLetterSizeArcMin(): number {
    return this.letterSizeArcMin
  }

  /**
   * Check if a response is correct
   */
  checkResponse(target: ContrastLetter, response: string): boolean {
    const normalized = response.trim().toUpperCase()
    return normalized === target
  }

  /**
   * Score a triplet response
   */
  scoreTriplet(level: ContrastLevel, responses: ContrastLetterResponse[]): ContrastTripletResponse {
    const correctCount = responses.filter(r => r.correct).length
    
    return {
      level,
      letters: responses,
      correctCount,
    }
  }

  /**
   * Calculate final logCS score
   * 
   * Pelli-Robson scoring:
   * - Score is the logCS of the last triplet with 2 or 3 letters correct
   * - If only 1 letter correct in a triplet, score is previous triplet's logCS
   */
  calculateLogCS(triplets: ContrastTripletResponse[]): number {
    if (triplets.length === 0) {
      return 0.0
    }

    // Find last triplet with at least 2 letters correct
    let lastPassedTriplet: ContrastTripletResponse | null = null
    for (const triplet of triplets) {
      if (triplet.correctCount >= 2) {
        lastPassedTriplet = triplet
      }
    }

    if (!lastPassedTriplet) {
      // Failed all triplets - score is 0.0 logCS
      return 0.0
    }

    // Score is the logCS of the last passed triplet
    // Plus credit for additional correct letters in subsequent triplets
    let finalLogCS = lastPassedTriplet.level.logCS

    const lastPassedIndex = triplets.indexOf(lastPassedTriplet)
    for (let i = lastPassedIndex + 1; i < triplets.length; i++) {
      const additionalCorrect = triplets[i].correctCount
      // Each additional letter = 0.05 logCS (0.15 / 3 letters)
      finalLogCS += additionalCorrect * 0.05
    }

    return parseFloat(finalLogCS.toFixed(2))
  }

  /**
   * Categorize result for screening purposes
   * 
   * Norms:
   * - NORMAL: logCS ≥ 1.50 (contrast threshold ≤ 3%)
   * - BORDERLINE: logCS 1.20-1.49 (contrast threshold 3-6%)
   * - REDUCED: logCS < 1.20 (contrast threshold > 6%)
   */
  categorizeResult(logCS: number): 'NORMAL' | 'BORDERLINE' | 'REDUCED' {
    if (logCS >= 1.50) return 'NORMAL'
    if (logCS >= 1.20) return 'BORDERLINE'
    return 'REDUCED'
  }

  /**
   * Should test stop after this triplet? (stopping rule)
   */
  shouldStop(triplet: ContrastTripletResponse): boolean {
    // Stop if all 3 letters wrong
    return triplet.correctCount === 0
  }

  /**
   * Create complete test result
   */
  createResult(
    calibration: CalibrationData,
    triplets: ContrastTripletResponse[]
  ): ContrastSensitivityResult {
    const finalLogCS = this.calculateLogCS(triplets)
    const category = this.categorizeResult(finalLogCS)

    return {
      testName: 'Contrast Sensitivity (Pelli-Robson Style)',
      version: '2.0-clinical',
      timestamp: Date.now(),
      calibration,
      triplets,
      finalLogCS,
      category,
      methodology: 'Letters presented at fixed size (~3° visual angle). Contrast decreases in 0.15 log steps (triplets of 3 letters). Stopping rule: test ends when all letters in a triplet are incorrect. Score is log contrast sensitivity (logCS).',
    }
  }

  /**
   * Get interpretation text
   */
  getInterpretation(category: ContrastSensitivityResult['category'], logCS: number): string {
    const threshold = Math.pow(10, -logCS) * 100

    switch (category) {
      case 'NORMAL':
        return `Normal contrast sensitivity. Your contrast threshold is approximately ${threshold.toFixed(1)}% (logCS ${logCS.toFixed(2)}).`
      case 'BORDERLINE':
        return `Borderline contrast sensitivity. Your contrast threshold is approximately ${threshold.toFixed(1)}% (logCS ${logCS.toFixed(2)}). Consider comprehensive eye examination.`
      case 'REDUCED':
        return `Reduced contrast sensitivity detected. Your contrast threshold is approximately ${threshold.toFixed(1)}% (logCS ${logCS.toFixed(2)}). Recommend comprehensive eye examination.`
      default:
        return 'Unable to categorize contrast sensitivity.'
    }
  }

  /**
   * Get test instructions
   */
  getInstructions(): string[] {
    return [
      'Letters will appear at the same size but varying contrast',
      'Read each letter you can see clearly',
      'As contrast decreases, letters become harder to see',
      'If you cannot see a letter, press Skip or enter a guess',
      'Test stops when letters become invisible',
    ]
  }
}

/**
 * Create a new contrast sensitivity test instance
 */
export function createContrastSensitivityTest(config?: { 
  letterSizeArcMin?: number 
}): ContrastSensitivityTest {
  return new ContrastSensitivityTest(config)
}
