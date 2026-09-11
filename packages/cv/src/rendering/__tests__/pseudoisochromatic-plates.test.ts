/**
 * Unit tests for Pseudoisochromatic Plate Renderer
 */

import { describe, it, expect } from '@jest/globals'
import {
  PSEUDOISOCHROMATIC_PLATES,
  generatePlateDots,
} from '../pseudoisochromatic-plates'

describe('Pseudoisochromatic Plate Renderer', () => {
  describe('PSEUDOISOCHROMATIC_PLATES', () => {
    it('should define 8 plates total', () => {
      expect(PSEUDOISOCHROMATIC_PLATES).toHaveLength(8)
    })

    it('should have 2 control plates', () => {
      const controlPlates = PSEUDOISOCHROMATIC_PLATES.filter(p => p.type === 'control')
      expect(controlPlates).toHaveLength(2)
    })

    it('should have protan test plates', () => {
      const protanPlates = PSEUDOISOCHROMATIC_PLATES.filter(p => p.type === 'protan')
      expect(protanPlates.length).toBeGreaterThan(0)
    })

    it('should have deutan test plates', () => {
      const deutanPlates = PSEUDOISOCHROMATIC_PLATES.filter(p => p.type === 'deutan')
      expect(deutanPlates.length).toBeGreaterThan(0)
    })

    it('should have valid color configurations', () => {
      PSEUDOISOCHROMATIC_PLATES.forEach(plate => {
        expect(plate.id).toBeTruthy()
        expect(plate.digit).toBeTruthy()
        expect(plate.backgroundHues).toBeInstanceOf(Array)
        expect(plate.digitHues).toBeInstanceOf(Array)
        expect(plate.backgroundHues.length).toBeGreaterThan(0)
        expect(plate.digitHues.length).toBeGreaterThan(0)
        expect(plate.saturation).toBeGreaterThanOrEqual(0)
        expect(plate.saturation).toBeLessThanOrEqual(100)
        expect(plate.lightness).toBeGreaterThanOrEqual(0)
        expect(plate.lightness).toBeLessThanOrEqual(100)
      })
    })

    it('should have valid hue values (0-360)', () => {
      PSEUDOISOCHROMATIC_PLATES.forEach(plate => {
        plate.backgroundHues.forEach(hue => {
          expect(hue).toBeGreaterThanOrEqual(0)
          expect(hue).toBeLessThanOrEqual(360)
        })
        plate.digitHues.forEach(hue => {
          expect(hue).toBeGreaterThanOrEqual(0)
          expect(hue).toBeLessThanOrEqual(360)
        })
      })
    })
  })

  describe('generatePlateDots', () => {
    const testPlate = PSEUDOISOCHROMATIC_PLATES[0]

    it('should generate requested number of dots', () => {
      const dotsCount = 100
      const dots = generatePlateDots(testPlate, 400, dotsCount)
      expect(dots).toHaveLength(dotsCount)
    })

    it('should generate dots within unit circle', () => {
      const dots = generatePlateDots(testPlate, 400, 1000)
      dots.forEach(dot => {
        // Dots should be in 0-1 normalized coordinates
        expect(dot.x).toBeGreaterThanOrEqual(0)
        expect(dot.x).toBeLessThanOrEqual(1)
        expect(dot.y).toBeGreaterThanOrEqual(0)
        expect(dot.y).toBeLessThanOrEqual(1)
        
        // Should be within unit circle (allowing small floating point error)
        const distFromCenter = Math.sqrt(
          Math.pow(dot.x - 0.5, 2) + Math.pow(dot.y - 0.5, 2)
        )
        expect(distFromCenter).toBeLessThanOrEqual(0.51)
      })
    })

    it('should use colors from configuration', () => {
      const dots = generatePlateDots(testPlate, 400, 1000)
      const allHues = [...testPlate.backgroundHues, ...testPlate.digitHues]
      
      dots.forEach(dot => {
        // Each dot should use a hue from the configuration
        expect(allHues).toContainEqual(dot.hue)
      })
    })

    it('should vary saturation and lightness slightly', () => {
      const dots = generatePlateDots(testPlate, 400, 1000)
      
      const saturations = dots.map(d => d.saturation)
      const lightnesses = dots.map(d => d.lightness)
      
      // Should have some variation
      const satRange = Math.max(...saturations) - Math.min(...saturations)
      const lightRange = Math.max(...lightnesses) - Math.min(...lightnesses)
      
      expect(satRange).toBeGreaterThan(5)
      expect(lightRange).toBeGreaterThan(5)
    })

    it('should vary dot sizes', () => {
      const dots = generatePlateDots(testPlate, 400, 1000)
      
      const radii = dots.map(d => d.radius)
      const uniqueRadii = new Set(radii)
      
      // Should have variety in dot sizes
      expect(uniqueRadii.size).toBeGreaterThan(50)
    })

    it('should be reproducible with same config', () => {
      const dots1 = generatePlateDots(testPlate, 400, 100)
      const dots2 = generatePlateDots(testPlate, 400, 100)
      
      expect(dots1).toEqual(dots2)
    })

    it('should differ for different plates', () => {
      const plate1 = PSEUDOISOCHROMATIC_PLATES[0]
      const plate2 = PSEUDOISOCHROMATIC_PLATES[1]
      
      const dots1 = generatePlateDots(plate1, 400, 100)
      const dots2 = generatePlateDots(plate2, 400, 100)
      
      expect(dots1).not.toEqual(dots2)
    })
  })

  describe('Confusion line validation', () => {
    it('control plates should use well-separated colors', () => {
      const controlPlates = PSEUDOISOCHROMATIC_PLATES.filter(p => p.type === 'control')
      
      controlPlates.forEach(plate => {
        // Control plates should have figure and background colors far apart
        // Calculate average hue separation
        const avgBgHue = plate.backgroundHues.reduce((a, b) => a + b, 0) / plate.backgroundHues.length
        const avgFigHue = plate.digitHues.reduce((a, b) => a + b, 0) / plate.digitHues.length
        
        const hueDiff = Math.abs(avgBgHue - avgFigHue)
        const normalizedDiff = Math.min(hueDiff, 360 - hueDiff)
        
        // Should be at least 60° apart (well separated)
        expect(normalizedDiff).toBeGreaterThan(60)
      })
    })

    it('protan plates should use red-green confusion colors', () => {
      const protanPlates = PSEUDOISOCHROMATIC_PLATES.filter(p => p.type === 'protan')
      
      protanPlates.forEach(plate => {
        // Protan confusion is typically along red-yellow-green axis (0-120°)
        const allHues = [...plate.backgroundHues, ...plate.digitHues]
        allHues.forEach(hue => {
          // Most hues should be in red-orange-yellow-green range
          expect(hue >= 0 && hue <= 120 || hue >= 330 && hue <= 360).toBeTruthy()
        })
      })
    })

    it('deutan plates should use appropriate confusion colors', () => {
      const deutanPlates = PSEUDOISOCHROMATIC_PLATES.filter(p => p.type === 'deutan')
      
      deutanPlates.forEach(plate => {
        // Deutan confusion involves yellow-green range
        const allHues = [...plate.backgroundHues, ...plate.digitHues]
        allHues.forEach(hue => {
          // Hues should be in relevant range for deutan confusion
          expect(hue >= 0 && hue <= 150 || hue >= 200 && hue <= 240).toBeTruthy()
        })
      })
    })
  })
})
