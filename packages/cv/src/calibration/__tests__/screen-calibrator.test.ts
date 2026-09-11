/**
 * Unit tests for Screen Calibration calculations
 */

import { describe, test, expect, beforeEach } from '@jest/globals'
import { ScreenCalibrator } from '../screen-calibrator'

describe('ScreenCalibrator', () => {
  let calibrator: ScreenCalibrator
  
  // Mock storage
  const mockStorage: Record<string, string> = {}
  const storage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = value },
    removeItem: (key: string) => { delete mockStorage[key] },
  } as Storage

  beforeEach(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key])
    calibrator = new ScreenCalibrator({}, storage)
  })

  describe('saveCalibration and getCalibration', () => {
    test('should save and retrieve calibration', () => {
      calibrator.saveCalibration(4.0, 60)
      
      const cal = calibrator.getCalibration()
      expect(cal).not.toBeNull()
      expect(cal!.pxPerMm).toBe(4.0)
      expect(cal!.distanceCm).toBe(60)
      expect(cal!.distanceM).toBeCloseTo(0.6, 2)
    })

    test('should calculate PPI correctly', () => {
      calibrator.saveCalibration(3.78, 60)
      
      const cal = calibrator.getCalibration()
      expect(cal!.ppi).toBe(Math.round(3.78 * 25.4)) // ~96 PPI
    })
  })

  describe('calculateVisualAngleArcMin', () => {
    test('should calculate visual angle correctly at 60cm', () => {
      calibrator.saveCalibration(4.0, 60)
      
      // 10mm object at 600mm distance
      // tan(angle) = 10/600
      // angle_rad = atan(10/600) = 0.01666...
      // angle_deg = 0.9549...
      // angle_arcmin = 57.29...
      const angle = calibrator.calculateVisualAngleArcMin(10)
      expect(angle).toBeCloseTo(57.29, 1)
    })

    test('should return null without calibration', () => {
      const angle = calibrator.calculateVisualAngleArcMin(10)
      expect(angle).toBeNull()
    })
  })

  describe('calculateSizeForVisualAngle', () => {
    test('should calculate correct pixel size for 5 arcmin at 60cm', () => {
      calibrator.saveCalibration(4.0, 60) // 4 px/mm at 60cm
      
      // 5 arcmin = 5/60 degrees = 0.08333 degrees
      // tan(0.08333°) = 0.001454
      // size_mm = tan(angle) * distance_mm = 0.001454 * 600 = 0.8724mm
      // size_px = 0.8724 * 4 = 3.49px
      const sizePx = calibrator.calculateSizeForVisualAngle(5)
      expect(sizePx).toBeCloseTo(3.49, 1)
    })

    test('should return null without calibration', () => {
      const sizePx = calibrator.calculateSizeForVisualAngle(5)
      expect(sizePx).toBeNull()
    })

    test('larger angles should give larger sizes', () => {
      calibrator.saveCalibration(4.0, 60)
      
      const size5 = calibrator.calculateSizeForVisualAngle(5)!
      const size10 = calibrator.calculateSizeForVisualAngle(10)!
      
      expect(size10).toBeGreaterThan(size5)
      expect(size10).toBeCloseTo(size5 * 2, 0) // Approximately double
    })
  })

  describe('calculateETDRSLetterSize', () => {
    test('should calculate 6/6 (0.0 logMAR) letter correctly', () => {
      calibrator.saveCalibration(4.0, 60)
      
      // 0.0 logMAR: 5 arcmin stroke = 25 arcmin letter height
      // Each 5 arcmin stroke at 60cm = ~0.87mm
      // 25 arcmin letter = ~4.36mm = ~17.5px at 4 px/mm
      const sizePx = calibrator.calculateETDRSLetterSize(0.0)
      expect(sizePx).toBeGreaterThan(15)
      expect(sizePx).toBeLessThan(20)
    })

    test('should scale correctly with logMAR', () => {
      calibrator.saveCalibration(4.0, 60)
      
      const size0 = calibrator.calculateETDRSLetterSize(0.0)! // 6/6
      const size1 = calibrator.calculateETDRSLetterSize(1.0)! // 6/60
      
      // 1.0 logMAR should be 10x larger (10^1.0 = 10)
      expect(size1 / size0).toBeCloseTo(10, 0)
    })

    test('should return null without calibration', () => {
      const sizePx = calibrator.calculateETDRSLetterSize(0.0)
      expect(sizePx).toBeNull()
    })
  })

  describe('isReady and isCalibrated', () => {
    test('should not be ready initially', () => {
      expect(calibrator.isReady()).toBe(false)
      expect(calibrator.isCalibrated()).toBe(false)
    })

    test('should be ready after calibration', () => {
      calibrator.saveCalibration(4.0, 60)
      expect(calibrator.isReady()).toBe(true)
      expect(calibrator.isCalibrated()).toBe(true)
    })

    test('should be ready after skipping', () => {
      calibrator.markSkipped()
      expect(calibrator.isReady()).toBe(true)
      expect(calibrator.isCalibrated()).toBe(false)
      expect(calibrator.isSkipped()).toBe(true)
    })
  })

  describe('clearCalibration', () => {
    test('should clear all calibration data', () => {
      calibrator.saveCalibration(4.0, 60)
      expect(calibrator.isReady()).toBe(true)
      
      calibrator.clearCalibration()
      expect(calibrator.isReady()).toBe(false)
      expect(calibrator.getCalibration()).toBeNull()
    })
  })

  describe('getDefaultCalibration', () => {
    test('should provide sensible defaults', () => {
      const def = calibrator.getDefaultCalibration()
      
      expect(def.pxPerMm).toBeGreaterThan(2)
      expect(def.pxPerMm).toBeLessThan(8)
      expect(def.distanceCm).toBeGreaterThan(30)
      expect(def.distanceCm).toBeLessThan(300)
      expect(def.method).toBe('manual')
    })
  })
})
