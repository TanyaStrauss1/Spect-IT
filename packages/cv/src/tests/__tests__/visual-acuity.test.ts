/**
 * Unit tests for Visual Acuity (ETDRS/LogMAR) calculations
 */

import { describe, test, expect } from '@jest/globals'
import {
  VisualAcuityTest,
  ETDRS_CHART,
  type LetterResponse,
  type LineResponse,
} from '../visual-acuity'

describe('VisualAcuityTest', () => {
  describe('calculateLogMAR', () => {
    test('should return starting logMAR when no lines passed', () => {
      const test = new VisualAcuityTest({ startLogMAR: 0.5 })
      const result = test.calculateLogMAR([])
      expect(result).toBe(0.5)
    })

    test('should calculate correct logMAR with letter-by-letter scoring', () => {
      const test = new VisualAcuityTest({ startLogMAR: 0.5 })
      
      // Simulate passing 6/19 line (0.5 logMAR) with all 5 letters correct
      const line05 = ETDRS_CHART.find(l => l.logMAR === 0.5)!
      const responses: LetterResponse[] = line05.letters.map(letter => ({
        letter,
        userResponse: letter,
        correct: true,
      }))
      
      const lineResponse: LineResponse = {
        line: line05,
        letters: responses,
        correctCount: 5,
        score: 5,
      }
      
      const logMAR = test.calculateLogMAR([lineResponse])
      // Should be 0.5 (line logMAR) - 0.10 (next line bonus for 5 correct) = 0.4
      expect(logMAR).toBe(0.4)
    })

    test('should handle partial line correctly', () => {
      const test = new VisualAcuityTest({ startLogMAR: 0.5 })
      
      const line05 = ETDRS_CHART.find(l => l.logMAR === 0.5)!
      
      // 3 letters correct on this line
      const responses: LetterResponse[] = [
        { letter: line05.letters[0], userResponse: line05.letters[0], correct: true },
        { letter: line05.letters[1], userResponse: line05.letters[1], correct: true },
        { letter: line05.letters[2], userResponse: line05.letters[2], correct: true },
        { letter: line05.letters[3], userResponse: 'X', correct: false },
        { letter: line05.letters[4], userResponse: 'Y', correct: false },
      ]
      
      const lineResponse: LineResponse = {
        line: line05,
        letters: responses,
        correctCount: 3,
        score: 3,
      }
      
      // Should stop at this line (only 3 correct)
      const logMAR = test.calculateLogMAR([lineResponse])
      expect(logMAR).toBe(0.5) // The line's logMAR value
    })

    test('should add credit for additional letters read', () => {
      const test = new VisualAcuityTest({ startLogMAR: 0.5 })
      
      const line05 = ETDRS_CHART.find(l => l.logMAR === 0.5)!
      const line04 = ETDRS_CHART.find(l => l.logMAR === 0.4)!
      
      // Pass first line (5 correct)
      const line1Response: LineResponse = {
        line: line05,
        letters: line05.letters.map(l => ({ letter: l, userResponse: l, correct: true })),
        correctCount: 5,
        score: 5,
      }
      
      // Read 2 letters on next line
      const line2Response: LineResponse = {
        line: line04,
        letters: [
          { letter: line04.letters[0], userResponse: line04.letters[0], correct: true },
          { letter: line04.letters[1], userResponse: line04.letters[1], correct: true },
          { letter: line04.letters[2], userResponse: 'X', correct: false },
          { letter: line04.letters[3], userResponse: 'Y', correct: false },
          { letter: line04.letters[4], userResponse: 'Z', correct: false },
        ],
        correctCount: 2,
        score: 2,
      }
      
      const logMAR = test.calculateLogMAR([line1Response, line2Response])
      // 0.5 - 0.02*2 = 0.46 (2 additional letters beyond the passed line)
      expect(logMAR).toBe(0.46)
    })
  })

  describe('logMARToSnellen', () => {
    test('should convert 0.0 logMAR to 6/6', () => {
      const test = new VisualAcuityTest()
      expect(test.logMARToSnellen(0.0, true)).toBe('6/6')
    })

    test('should convert 0.0 logMAR to 20/20 (imperial)', () => {
      const test = new VisualAcuityTest()
      expect(test.logMARToSnellen(0.0, false)).toBe('20/20')
    })

    test('should convert 0.3 logMAR to 6/12', () => {
      const test = new VisualAcuityTest()
      expect(test.logMARToSnellen(0.3, true)).toBe('6/12')
    })

    test('should convert 0.5 logMAR to 6/19', () => {
      const test = new VisualAcuityTest()
      expect(test.logMARToSnellen(0.5, true)).toBe('6/19')
    })
  })

  describe('categorizeResult', () => {
    test('should categorize 0.0 logMAR as PASS', () => {
      const test = new VisualAcuityTest()
      expect(test.categorizeResult(0.0)).toBe('PASS')
    })

    test('should categorize 0.3 logMAR as PASS', () => {
      const test = new VisualAcuityTest()
      expect(test.categorizeResult(0.3)).toBe('PASS')
    })

    test('should categorize 0.4 logMAR as BORDERLINE', () => {
      const test = new VisualAcuityTest()
      expect(test.categorizeResult(0.4)).toBe('BORDERLINE')
    })

    test('should categorize 0.5 logMAR as BORDERLINE', () => {
      const test = new VisualAcuityTest()
      expect(test.categorizeResult(0.5)).toBe('BORDERLINE')
    })

    test('should categorize 0.6 logMAR as REFER', () => {
      const test = new VisualAcuityTest()
      expect(test.categorizeResult(0.6)).toBe('REFER')
    })

    test('should categorize 1.0 logMAR as REFER', () => {
      const test = new VisualAcuityTest()
      expect(test.categorizeResult(1.0)).toBe('REFER')
    })
  })

  describe('checkResponse', () => {
    test('should match exact letter', () => {
      const test = new VisualAcuityTest()
      expect(test.checkResponse('C', 'C')).toBe(true)
    })

    test('should be case-insensitive', () => {
      const test = new VisualAcuityTest()
      expect(test.checkResponse('C', 'c')).toBe(true)
    })

    test('should trim whitespace', () => {
      const test = new VisualAcuityTest()
      expect(test.checkResponse('C', ' C ')).toBe(true)
    })

    test('should reject wrong letter', () => {
      const test = new VisualAcuityTest()
      expect(test.checkResponse('C', 'D')).toBe(false)
    })
  })

  describe('ETDRS Chart', () => {
    test('should have correct number of lines', () => {
      expect(ETDRS_CHART.length).toBeGreaterThan(10)
    })

    test('should have 5 letters per line', () => {
      ETDRS_CHART.forEach(line => {
        expect(line.letters.length).toBe(5)
      })
    })

    test('should have 0.1 logMAR steps', () => {
      for (let i = 1; i < ETDRS_CHART.length; i++) {
        const step = ETDRS_CHART[i - 1].logMAR - ETDRS_CHART[i].logMAR
        expect(Math.abs(step - 0.1)).toBeLessThan(0.01) // Allow small floating point error
      }
    })

    test('6/6 line should be 0.0 logMAR', () => {
      const line = ETDRS_CHART.find(l => l.snellen === '6/6')
      expect(line?.logMAR).toBe(0.0)
    })
  })
})
