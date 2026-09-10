/**
 * Spect-IT Visual Acuity Test Module
 * 
 * Clinical visual acuity testing following ETDRS/LogMAR standard:
 * - Sloan letters (C, D, H, K, N, O, R, S, V, Z)
 * - 5 letters per line
 * - 0.1 logMAR steps between lines
 * - Tests each eye separately (OD/OS)
 * - Letter-by-letter scoring (0.02 logMAR per letter)
 * - Reports Snellen, logMAR, and screening thresholds
 * 
 * Based on website/clinical-tests.js from PR #57
 */

import type { CalibrationData } from '../calibration/screen-calibrator'

/**
 * Sloan letters used in ETDRS charts
 */
export const SLOAN_LETTERS = ['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V', 'Z'] as const
export type SloanLetter = typeof SLOAN_LETTERS[number]

/**
 * Standard ETDRS line configuration
 */
export interface ETDRSLine {
  logMAR: number // LogMAR value
  snellen: string // Snellen equivalent (e.g., '6/6', '20/20')
  letters: SloanLetter[] // 5 letters per line
  visualAngleArcMin: number // Letter size in arc minutes
}

/**
 * Eye being tested
 */
export type Eye = 'right' | 'left'

/**
 * Letter response during testing
 */
export interface LetterResponse {
  letter: SloanLetter
  userResponse: string
  correct: boolean
  responseTime?: number // Optional response time in ms
}

/**
 * Line response during testing
 */
export interface LineResponse {
  line: ETDRSLine
  letters: LetterResponse[]
  correctCount: number
  score: number // 0-5 letters correct
}

/**
 * Per-eye test result
 */
export interface EyeResult {
  eye: Eye
  lines: LineResponse[]
  totalLettersCorrect: number
  finalLogMAR: number
  finalSnellen: string
  category: 'PASS' | 'BORDERLINE' | 'REFER'
}

/**
 * Complete visual acuity test result
 */
export interface VisualAcuityResult {
  testName: 'Visual Acuity (ETDRS/LogMAR)'
  version: '2.0-clinical'
  timestamp: number
  calibration: CalibrationData
  rightEye: EyeResult | null
  leftEye: EyeResult | null
  methodology: string
}

/**
 * Standard ETDRS chart lines
 * Based on international standard with logMAR progression
 */
export const ETDRS_CHART: ETDRSLine[] = [
  { logMAR: 1.0, snellen: '6/60', letters: ['C', 'D', 'H', 'K', 'N'], visualAngleArcMin: 50.0 },
  { logMAR: 0.9, snellen: '6/48', letters: ['O', 'R', 'S', 'V', 'Z'], visualAngleArcMin: 39.8 },
  { logMAR: 0.8, snellen: '6/38', letters: ['C', 'D', 'K', 'N', 'R'], visualAngleArcMin: 31.6 },
  { logMAR: 0.7, snellen: '6/30', letters: ['H', 'O', 'S', 'V', 'Z'], visualAngleArcMin: 25.1 },
  { logMAR: 0.6, snellen: '6/24', letters: ['C', 'D', 'K', 'O', 'V'], visualAngleArcMin: 20.0 },
  { logMAR: 0.5, snellen: '6/19', letters: ['H', 'N', 'R', 'S', 'Z'], visualAngleArcMin: 15.8 },
  { logMAR: 0.4, snellen: '6/15', letters: ['C', 'D', 'H', 'O', 'V'], visualAngleArcMin: 12.6 },
  { logMAR: 0.3, snellen: '6/12', letters: ['K', 'N', 'R', 'S', 'Z'], visualAngleArcMin: 10.0 },
  { logMAR: 0.2, snellen: '6/9.5', letters: ['C', 'D', 'H', 'K', 'R'], visualAngleArcMin: 7.94 },
  { logMAR: 0.1, snellen: '6/7.5', letters: ['N', 'O', 'S', 'V', 'Z'], visualAngleArcMin: 6.31 },
  { logMAR: 0.0, snellen: '6/6', letters: ['C', 'D', 'H', 'K', 'O'], visualAngleArcMin: 5.0 },
  { logMAR: -0.1, snellen: '6/4.8', letters: ['N', 'R', 'S', 'V', 'Z'], visualAngleArcMin: 3.98 },
  { logMAR: -0.2, snellen: '6/3.8', letters: ['C', 'D', 'H', 'K', 'R'], visualAngleArcMin: 3.16 },
]

/**
 * Visual Acuity Test Controller
 */
export class VisualAcuityTest {
  private startLogMAR: number
  private stopOnMissedLine: boolean

  constructor(config: { startLogMAR?: number; stopOnMissedLine?: boolean } = {}) {
    this.startLogMAR = config.startLogMAR ?? 0.5 // Start at 6/19 by default
    this.stopOnMissedLine = config.stopOnMissedLine ?? false
  }

  /**
   * Get chart lines to present (from startLogMAR downward)
   */
  getChartLines(): ETDRSLine[] {
    return ETDRS_CHART.filter(line => line.logMAR <= this.startLogMAR)
  }

  /**
   * Score a line response (letter-by-letter)
   */
  scoreLine(line: ETDRSLine, responses: LetterResponse[]): LineResponse {
    const correctCount = responses.filter(r => r.correct).length
    
    return {
      line,
      letters: responses,
      correctCount,
      score: correctCount,
    }
  }

  /**
   * Calculate final logMAR score from line responses
   * 
   * ETDRS scoring: 
   * - Start from the first line (largest letters)
   * - Each letter = 0.02 logMAR
   * - 5 letters per line = 0.10 logMAR total
   */
  calculateLogMAR(lines: LineResponse[]): number {
    if (lines.length === 0) {
      return this.startLogMAR
    }

    // Find the last line with at least 3 letters correct
    let lastPassedLine: LineResponse | null = null
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].correctCount >= 3) {
        lastPassedLine = lines[i]
      } else {
        break // Stop at first failed line
      }
    }

    if (!lastPassedLine) {
      // Failed all lines - use the starting logMAR
      return this.startLogMAR
    }

    // Start from the logMAR of the last passed line
    let finalLogMAR = lastPassedLine.line.logMAR

    // Add back 0.02 for each letter read correctly on subsequent lines
    const lastPassedIndex = lines.indexOf(lastPassedLine)
    for (let i = lastPassedIndex + 1; i < lines.length; i++) {
      const additionalCorrect = lines[i].correctCount
      finalLogMAR -= additionalCorrect * 0.02
    }

    return parseFloat(finalLogMAR.toFixed(2))
  }

  /**
   * Convert logMAR to Snellen fraction
   */
  logMARToSnellen(logMAR: number, metric: boolean = true): string {
    const denominator = Math.round(Math.pow(10, logMAR) * (metric ? 6 : 20))
    return metric ? `6/${denominator}` : `20/${denominator}`
  }

  /**
   * Categorize result for screening purposes
   * 
   * Standards:
   * - PASS: logMAR 0.3 or better (6/12 or better, 20/40 or better)
   * - BORDERLINE: logMAR 0.4-0.5 (6/15 to 6/19)
   * - REFER: logMAR 0.6 or worse (6/24 or worse, 20/80 or worse)
   */
  categorizeResult(logMAR: number): 'PASS' | 'BORDERLINE' | 'REFER' {
    if (logMAR <= 0.3) return 'PASS'
    if (logMAR <= 0.5) return 'BORDERLINE'
    return 'REFER'
  }

  /**
   * Process eye test result
   */
  processEyeResult(eye: Eye, lines: LineResponse[]): EyeResult {
    const totalLettersCorrect = lines.reduce((sum, line) => sum + line.correctCount, 0)
    const finalLogMAR = this.calculateLogMAR(lines)
    const finalSnellen = this.logMARToSnellen(finalLogMAR)
    const category = this.categorizeResult(finalLogMAR)

    return {
      eye,
      lines,
      totalLettersCorrect,
      finalLogMAR,
      finalSnellen,
      category,
    }
  }

  /**
   * Create complete test result
   */
  createResult(
    calibration: CalibrationData,
    rightEye: EyeResult | null,
    leftEye: EyeResult | null
  ): VisualAcuityResult {
    return {
      testName: 'Visual Acuity (ETDRS/LogMAR)',
      version: '2.0-clinical',
      timestamp: Date.now(),
      calibration,
      rightEye,
      leftEye,
      methodology: 'ETDRS chart with Sloan letters, 5 letters per line, 0.1 logMAR steps, letter-by-letter scoring (0.02 logMAR per letter). Each eye tested separately with contralateral occlusion.',
    }
  }

  /**
   * Check if a user response matches the target letter
   * (case-insensitive, handles common confusions)
   */
  checkResponse(target: SloanLetter, response: string): boolean {
    const normalized = response.trim().toUpperCase()
    return normalized === target
  }

  /**
   * Should test stop after this line? (stopping rule)
   */
  shouldStop(lineResponse: LineResponse): boolean {
    if (!this.stopOnMissedLine) return false
    
    // Standard stopping rule: stop if fewer than 3 letters correct
    return lineResponse.correctCount < 3
  }
}

/**
 * Create a new visual acuity test instance
 */
export function createVisualAcuityTest(config?: { 
  startLogMAR?: number
  stopOnMissedLine?: boolean 
}): VisualAcuityTest {
  return new VisualAcuityTest(config)
}

/**
 * Helper: Shuffle letters for randomization (if needed)
 */
export function shuffleLetters(letters: SloanLetter[]): SloanLetter[] {
  const shuffled = [...letters]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
