/**
 * Unit tests for Contrast Sensitivity (Pelli-Robson style) calculations
 */

import { describe, test, expect } from '@jest/globals'
import {
  ContrastSensitivityTest,
  CONTRAST_LEVELS,
  type ContrastLetterResponse,
  type ContrastTripletResponse,
} from '../contrast'

describe('ContrastSensitivityTest', () => {
  describe('calculateLogCS', () => {
    test('should return 0.0 when no triplets passed', () => {
      const test = new ContrastSensitivityTest()
      const result = test.calculateLogCS([])
      expect(result).toBe(0.0)
    })

    test('should return last passed triplet logCS', () => {
      const test = new ContrastSensitivityTest()
      
      const level1 = CONTRAST_LEVELS[0] // logCS 0.0
      const level2 = CONTRAST_LEVELS[1] // logCS 0.15
      
      const triplet1: ContrastTripletResponse = {
        level: level1,
        letters: level1.letters.map(l => ({ letter: l, userResponse: l, correct: true })),
        correctCount: 3,
      }
      
      const triplet2: ContrastTripletResponse = {
        level: level2,
        letters: level2.letters.map(l => ({ letter: l, userResponse: l, correct: true })),
        correctCount: 3,
      }
      
      const logCS = test.calculateLogCS([triplet1, triplet2])
      expect(logCS).toBe(0.15)
    })

    test('should add credit for partial triplet', () => {
      const test = new ContrastSensitivityTest()
      
      const level1 = CONTRAST_LEVELS[0] // logCS 0.0
      const level2 = CONTRAST_LEVELS[1] // logCS 0.15
      
      const triplet1: ContrastTripletResponse = {
        level: level1,
        letters: level1.letters.map(l => ({ letter: l, userResponse: l, correct: true })),
        correctCount: 3,
      }
      
      // Only 2 correct on second triplet
      const triplet2: ContrastTripletResponse = {
        level: level2,
        letters: [
          { letter: level2.letters[0], userResponse: level2.letters[0], correct: true },
          { letter: level2.letters[1], userResponse: level2.letters[1], correct: true },
          { letter: level2.letters[2], userResponse: 'X', correct: false },
        ],
        correctCount: 2,
      }
      
      // Should be 0.0 + 2 * 0.05 = 0.10
      const logCS = test.calculateLogCS([triplet1, triplet2])
      expect(logCS).toBe(0.1)
    })

    test('should stop at last triplet with at least 2 correct', () => {
      const test = new ContrastSensitivityTest()
      
      const level1 = CONTRAST_LEVELS[0]
      const level2 = CONTRAST_LEVELS[1]
      const level3 = CONTRAST_LEVELS[2]
      
      const triplet1: ContrastTripletResponse = {
        level: level1,
        letters: level1.letters.map(l => ({ letter: l, userResponse: l, correct: true })),
        correctCount: 3,
      }
      
      const triplet2: ContrastTripletResponse = {
        level: level2,
        letters: level2.letters.map(l => ({ letter: l, userResponse: l, correct: true })),
        correctCount: 3,
      }
      
      // Only 1 correct on third triplet - should not count
      const triplet3: ContrastTripletResponse = {
        level: level3,
        letters: [
          { letter: level3.letters[0], userResponse: level3.letters[0], correct: true },
          { letter: level3.letters[1], userResponse: 'X', correct: false },
          { letter: level3.letters[2], userResponse: 'Y', correct: false },
        ],
        correctCount: 1,
      }
      
      const logCS = test.calculateLogCS([triplet1, triplet2, triplet3])
      // Should be level2 (0.15) + 1 letter credit (0.05) = 0.20
      expect(logCS).toBe(0.2)
    })
  })

  describe('categorizeResult', () => {
    test('should categorize logCS 1.5 as NORMAL', () => {
      const test = new ContrastSensitivityTest()
      expect(test.categorizeResult(1.5)).toBe('NORMAL')
    })

    test('should categorize logCS 2.0 as NORMAL', () => {
      const test = new ContrastSensitivityTest()
      expect(test.categorizeResult(2.0)).toBe('NORMAL')
    })

    test('should categorize logCS 1.4 as BORDERLINE', () => {
      const test = new ContrastSensitivityTest()
      expect(test.categorizeResult(1.4)).toBe('BORDERLINE')
    })

    test('should categorize logCS 1.2 as BORDERLINE', () => {
      const test = new ContrastSensitivityTest()
      expect(test.categorizeResult(1.2)).toBe('BORDERLINE')
    })

    test('should categorize logCS 1.1 as REDUCED', () => {
      const test = new ContrastSensitivityTest()
      expect(test.categorizeResult(1.1)).toBe('REDUCED')
    })

    test('should categorize logCS 0.5 as REDUCED', () => {
      const test = new ContrastSensitivityTest()
      expect(test.categorizeResult(0.5)).toBe('REDUCED')
    })
  })

  describe('shouldStop', () => {
    test('should stop when all letters wrong', () => {
      const test = new ContrastSensitivityTest()
      const level = CONTRAST_LEVELS[5]
      
      const triplet: ContrastTripletResponse = {
        level,
        letters: level.letters.map(l => ({ letter: l, userResponse: 'X', correct: false })),
        correctCount: 0,
      }
      
      expect(test.shouldStop(triplet)).toBe(true)
    })

    test('should not stop when at least 1 letter correct', () => {
      const test = new ContrastSensitivityTest()
      const level = CONTRAST_LEVELS[5]
      
      const triplet: ContrastTripletResponse = {
        level,
        letters: [
          { letter: level.letters[0], userResponse: level.letters[0], correct: true },
          { letter: level.letters[1], userResponse: 'X', correct: false },
          { letter: level.letters[2], userResponse: 'Y', correct: false },
        ],
        correctCount: 1,
      }
      
      expect(test.shouldStop(triplet)).toBe(false)
    })
  })

  describe('CONTRAST_LEVELS', () => {
    test('should have correct structure', () => {
      expect(CONTRAST_LEVELS.length).toBeGreaterThan(10)
      
      CONTRAST_LEVELS.forEach(level => {
        expect(level.letters.length).toBe(3)
        expect(level.contrast).toBeGreaterThan(0)
        expect(level.contrast).toBeLessThanOrEqual(1)
        expect(level.logCS).toBeGreaterThanOrEqual(0)
      })
    })

    test('should have decreasing contrast', () => {
      for (let i = 1; i < CONTRAST_LEVELS.length; i++) {
        expect(CONTRAST_LEVELS[i].contrast).toBeLessThan(CONTRAST_LEVELS[i - 1].contrast)
      }
    })

    test('should have increasing logCS', () => {
      for (let i = 1; i < CONTRAST_LEVELS.length; i++) {
        expect(CONTRAST_LEVELS[i].logCS).toBeGreaterThan(CONTRAST_LEVELS[i - 1].logCS)
      }
    })

    test('should have approximately 0.15 log steps', () => {
      for (let i = 1; i < CONTRAST_LEVELS.length; i++) {
        const step = CONTRAST_LEVELS[i].logCS - CONTRAST_LEVELS[i - 1].logCS
        expect(step).toBeCloseTo(0.15, 1)
      }
    })
  })
})
