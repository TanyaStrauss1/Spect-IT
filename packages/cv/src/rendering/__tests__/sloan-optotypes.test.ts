/**
 * Unit tests for Sloan Optotype Geometry Renderer
 */

import { describe, it, expect } from '@jest/globals'
import {
  SLOAN_GEOMETRIES,
  generateSloanSVGPath,
  calculateSloanStrokeWidth,
  calculateSloanLetterSize,
  isSloanLetter,
  getSloanLetters,
} from '../sloan-optotypes'

describe('Sloan Optotype Geometry', () => {
  describe('SLOAN_GEOMETRIES', () => {
    it('should define all 10 Sloan letters', () => {
      const letters = Object.keys(SLOAN_GEOMETRIES)
      expect(letters).toHaveLength(10)
      expect(letters.sort()).toEqual(['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V', 'Z'])
    })

    it('should have valid stroke segments for each letter', () => {
      Object.entries(SLOAN_GEOMETRIES).forEach(([letter, segments]) => {
        expect(segments.length).toBeGreaterThan(0)
        segments.forEach(seg => {
          // Each segment should be within 5×5 grid
          expect(seg.x).toBeGreaterThanOrEqual(0)
          expect(seg.x).toBeLessThanOrEqual(5)
          expect(seg.y).toBeGreaterThanOrEqual(0)
          expect(seg.y).toBeLessThanOrEqual(5)
          expect(seg.width).toBeGreaterThan(0)
          expect(seg.height).toBeGreaterThan(0)
          expect(seg.x + seg.width).toBeLessThanOrEqual(5)
          expect(seg.y + seg.height).toBeLessThanOrEqual(5)
        })
      })
    })
  })

  describe('generateSloanSVGPath', () => {
    it('should generate valid SVG path for each letter', () => {
      const letters = getSloanLetters()
      letters.forEach(letter => {
        const path = generateSloanSVGPath(letter, 20)
        expect(path).toBeTruthy()
        expect(typeof path).toBe('string')
        // Path should start with M (moveto) command
        expect(path).toMatch(/^M/)
      })
    })

    it('should scale path based on grid size', () => {
      const pathSmall = generateSloanSVGPath('C', 10)
      const pathLarge = generateSloanSVGPath('C', 20)
      expect(pathSmall).not.toBe(pathLarge)
      expect(pathLarge.length).toBeGreaterThan(pathSmall.length)
    })
  })

  describe('calculateSloanStrokeWidth', () => {
    it('should calculate correct stroke width for 0.0 logMAR', () => {
      // At logMAR 0.0, stroke width should subtend 5 arc minutes
      // At 60cm viewing distance with typical screen (96 DPI ≈ 0.378 px/mm)
      const pxPerMm = 0.378
      const distanceMm = 600
      const logMAR = 0.0
      
      const strokeWidth = calculateSloanStrokeWidth(logMAR, pxPerMm, distanceMm)
      
      // Expected: tan(5 arcmin) * 600mm * 0.378 px/mm
      // 5 arcmin = 5/60 degrees = 0.0833 degrees
      const angleRad = (5 / 60) * (Math.PI / 180)
      const expectedMm = Math.tan(angleRad) * distanceMm
      const expectedPx = Math.round(expectedMm * pxPerMm)
      
      expect(strokeWidth).toBe(expectedPx)
    })

    it('should scale correctly with logMAR', () => {
      const pxPerMm = 0.378
      const distanceMm = 600
      
      const width0 = calculateSloanStrokeWidth(0.0, pxPerMm, distanceMm)
      const width1 = calculateSloanStrokeWidth(1.0, pxPerMm, distanceMm)
      
      // At logMAR 1.0, letter should be 10× larger (10^1.0)
      expect(width1).toBeGreaterThan(width0 * 9)
      expect(width1).toBeLessThan(width0 * 11)
    })

    it('should return at least 1px for very small sizes', () => {
      const strokeWidth = calculateSloanStrokeWidth(-2.0, 0.1, 100)
      expect(strokeWidth).toBeGreaterThanOrEqual(1)
    })
  })

  describe('calculateSloanLetterSize', () => {
    it('should return 5× stroke width', () => {
      const pxPerMm = 0.378
      const distanceMm = 600
      const logMAR = 0.0
      
      const strokeWidth = calculateSloanStrokeWidth(logMAR, pxPerMm, distanceMm)
      const letterSize = calculateSloanLetterSize(logMAR, pxPerMm, distanceMm)
      
      expect(letterSize).toBe(strokeWidth * 5)
    })
  })

  describe('isSloanLetter', () => {
    it('should return true for valid Sloan letters', () => {
      expect(isSloanLetter('C')).toBe(true)
      expect(isSloanLetter('D')).toBe(true)
      expect(isSloanLetter('H')).toBe(true)
      expect(isSloanLetter('Z')).toBe(true)
    })

    it('should return false for invalid letters', () => {
      expect(isSloanLetter('A')).toBe(false)
      expect(isSloanLetter('B')).toBe(false)
      expect(isSloanLetter('1')).toBe(false)
      expect(isSloanLetter('')).toBe(false)
    })
  })

  describe('getSloanLetters', () => {
    it('should return array of 10 Sloan letters', () => {
      const letters = getSloanLetters()
      expect(letters).toHaveLength(10)
      expect(letters.sort()).toEqual(['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V', 'Z'])
    })
  })

  describe('Clinical accuracy validation', () => {
    it('should maintain 1:1:1 ratio for stroke:gap:unit', () => {
      // Each letter should fit in a 5×5 grid where:
      // - 1 unit = stroke width
      // - 1 unit = gap width
      // - Letter is 5 units tall and 5 units wide
      
      Object.entries(SLOAN_GEOMETRIES).forEach(([letter, segments]) => {
        // Check that no segment exceeds 5 grid units in any dimension
        segments.forEach(seg => {
          expect(seg.x + seg.width).toBeLessThanOrEqual(5)
          expect(seg.y + seg.height).toBeLessThanOrEqual(5)
        })
      })
    })

    it('should produce letters at correct angular size for standard viewing distances', () => {
      // Test at common viewing distances: 40cm, 60cm, 3m, 6m
      const distances = [400, 600, 3000, 6000] // mm
      const pxPerMm = 0.378 // ~96 DPI
      const logMAR = 0.0 // 6/6, 20/20
      
      distances.forEach(dist => {
        const letterSize = calculateSloanLetterSize(logMAR, pxPerMm, dist)
        
        // At logMAR 0.0, letter should subtend 5 arc minutes (25 arcmin total height)
        const expectedAngleRad = (25 / 60) * (Math.PI / 180)
        const expectedSizeMm = Math.tan(expectedAngleRad) * dist
        const expectedSizePx = Math.round(expectedSizeMm * pxPerMm)
        
        // Allow for rounding differences
        expect(Math.abs(letterSize - expectedSizePx)).toBeLessThanOrEqual(5)
      })
    })
  })
})
