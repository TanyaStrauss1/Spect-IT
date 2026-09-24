/**
 * Spect-IT Pupillary Distance (PD) Screening Test
 * 
 * Manual calibration-based PD measurement:
 * - Uses screen calibration (pixelsPerMm) for accurate physical measurements
 * - User aligns on-screen markers to their pupil centers
 * - Measures binocular PD (distance between pupil centers)
 * - Reports PD in millimeters
 * - Screening only - NOT for ordering glasses alone
 * 
 * Method: Manual marker alignment on calibrated screen
 * - Left/right marker positioning aligned to pupil centers
 * - Horizontal distance measured in pixels, converted to mm via calibration
 * - User can use front-camera preview or mirror for alignment
 * - Distance PD (far PD) measurement at typical viewing distance
 * 
 * Clinical note: Professional PD measurement by optician is authoritative for eyewear dispensing
 */

import type { CalibrationData } from '../calibration/screen-calibrator'

/**
 * Marker position for PD measurement
 */
export interface MarkerPosition {
  x: number // X coordinate in pixels
  y: number // Y coordinate in pixels
}

/**
 * PD measurement data
 */
export interface PDMeasurement {
  leftPupilX: number // Left pupil X position in pixels
  rightPupilX: number // Right pupil X position in pixels
  pdPx: number // PD in pixels
  pdMm: number // PD in millimeters
  timestamp: number
}

/**
 * Complete PD test result
 */
export interface PDResult {
  testName: 'Pupillary Distance (PD) Screening'
  version: '1.0-screening'
  timestamp: number
  calibration: CalibrationData | undefined
  measurements: PDMeasurement[]
  averagePdMm: number
  category: 'ADULT_NORMAL' | 'ADULT_NARROW' | 'ADULT_WIDE' | 'CHILD_RANGE' | 'UNUSUAL'
  confidence: 'HIGH' | 'MODERATE' | 'LOW'
  methodology: string
}

/**
 * PD ranges for categorization (screening guidelines)
 * 
 * Typical adult ranges:
 * - Average: 60-65 mm (most common)
 * - Normal range: 54-74 mm (covers ~95% of adults)
 * - Narrow: 45-53 mm (smaller faces, some East Asian populations)
 * - Wide: 75-80 mm (larger faces)
 * 
 * Children:
 * - Age-dependent, roughly 43-54 mm (widens with age/growth)
 */
export const PD_RANGES = {
  ADULT_MIN: 54,
  ADULT_MAX: 74,
  CHILD_MIN: 43,
  CHILD_MAX: 54,
  NARROW_THRESHOLD: 53,
  WIDE_THRESHOLD: 75,
  ABSOLUTE_MIN: 40, // Below this is likely measurement error
  ABSOLUTE_MAX: 85, // Above this is likely measurement error
} as const

/**
 * PD Test Controller
 */
export class PDTest {
  private measurements: PDMeasurement[] = []
  private pxPerMm: number = 1

  /**
   * Initialize test with calibration data
   */
  initialize(pxPerMm: number): void {
    this.pxPerMm = pxPerMm
    this.measurements = []
  }

  /**
   * Record a PD measurement from marker positions
   */
  recordMeasurement(leftPupilX: number, rightPupilX: number): PDMeasurement {
    const pdPx = Math.abs(rightPupilX - leftPupilX)
    const pdMm = Math.round((pdPx / this.pxPerMm) * 10) / 10 // Round to 0.1 mm

    const measurement: PDMeasurement = {
      leftPupilX,
      rightPupilX,
      pdPx,
      pdMm,
      timestamp: Date.now(),
    }

    this.measurements.push(measurement)
    return measurement
  }

  /**
   * Get all measurements
   */
  getMeasurements(): PDMeasurement[] {
    return [...this.measurements]
  }

  /**
   * Calculate average PD from all measurements
   */
  calculateAveragePD(): number {
    if (this.measurements.length === 0) return 0

    const sum = this.measurements.reduce((acc, m) => acc + m.pdMm, 0)
    const avg = sum / this.measurements.length
    return Math.round(avg * 10) / 10 // Round to 0.1 mm
  }

  /**
   * Calculate measurement consistency (standard deviation)
   */
  calculateConsistency(): number {
    if (this.measurements.length < 2) return 0

    const avg = this.calculateAveragePD()
    const variance =
      this.measurements.reduce((acc, m) => acc + Math.pow(m.pdMm - avg, 2), 0) /
      this.measurements.length
    return Math.sqrt(variance)
  }

  /**
   * Assess measurement confidence based on consistency
   * 
   * High: SD < 1.5 mm (good measurement technique)
   * Moderate: SD 1.5-3.0 mm (acceptable variation)
   * Low: SD > 3.0 mm (poor consistency, likely alignment errors)
   */
  assessConfidence(): 'HIGH' | 'MODERATE' | 'LOW' {
    if (this.measurements.length < 3) return 'LOW'

    const consistency = this.calculateConsistency()
    if (consistency < 1.5) return 'HIGH'
    if (consistency < 3.0) return 'MODERATE'
    return 'LOW'
  }

  /**
   * Categorize PD for screening purposes
   * 
   * Categories:
   * - ADULT_NORMAL: 54-74 mm (typical adult range)
   * - ADULT_NARROW: 45-53 mm (smaller adult faces)
   * - ADULT_WIDE: 75-80 mm (larger adult faces)
   * - CHILD_RANGE: 43-54 mm (overlap with adult narrow; suggest child if context known)
   * - UNUSUAL: <43 mm or >80 mm (likely measurement error or extreme outlier)
   */
  categorizePD(pdMm: number): PDResult['category'] {
    if (pdMm < PD_RANGES.ABSOLUTE_MIN || pdMm > PD_RANGES.ABSOLUTE_MAX) {
      return 'UNUSUAL'
    }
    if (pdMm >= PD_RANGES.ADULT_MIN && pdMm <= PD_RANGES.ADULT_MAX) {
      return 'ADULT_NORMAL'
    }
    if (pdMm >= PD_RANGES.CHILD_MIN && pdMm <= PD_RANGES.NARROW_THRESHOLD) {
      // Could be narrow adult or child; default to child range if borderline
      return 'CHILD_RANGE'
    }
    if (pdMm >= PD_RANGES.WIDE_THRESHOLD && pdMm <= PD_RANGES.ABSOLUTE_MAX) {
      return 'ADULT_WIDE'
    }
    if (pdMm < PD_RANGES.CHILD_MIN) {
      return 'UNUSUAL'
    }
    return 'ADULT_NARROW'
  }

  /**
   * Validate PD measurement (reject impossible values)
   */
  isValidMeasurement(pdMm: number): boolean {
    return pdMm >= PD_RANGES.ABSOLUTE_MIN && pdMm <= PD_RANGES.ABSOLUTE_MAX
  }

  /**
   * Create complete test result
   */
  createResult(calibration: CalibrationData | undefined): PDResult {
    const averagePdMm = this.calculateAveragePD()
    const category = this.categorizePD(averagePdMm)
    const confidence = this.assessConfidence()

    return {
      testName: 'Pupillary Distance (PD) Screening',
      version: '1.0-screening',
      timestamp: Date.now(),
      calibration,
      measurements: this.getMeasurements(),
      averagePdMm,
      category,
      confidence,
      methodology:
        'Manual marker alignment on calibrated screen. User positions on-screen markers to align with pupil centers (left and right eyes). Horizontal distance measured in pixels and converted to millimeters via screen calibration. Multiple measurements averaged for accuracy. Distance PD (far PD) at typical viewing distance.',
    }
  }

  /**
   * Get interpretation text
   */
  getInterpretation(
    category: PDResult['category'],
    pdMm: number,
    confidence: PDResult['confidence']
  ): string {
    let categoryText = ''
    switch (category) {
      case 'ADULT_NORMAL':
        categoryText = `Your measured PD is ${pdMm} mm, which falls within the typical adult range (54-74 mm). This is a common PD for adults.`
        break
      case 'ADULT_NARROW':
        categoryText = `Your measured PD is ${pdMm} mm, which is narrower than average but still within a valid adult range. This is common for individuals with smaller facial features.`
        break
      case 'ADULT_WIDE':
        categoryText = `Your measured PD is ${pdMm} mm, which is wider than average but still within a valid adult range. This is common for individuals with larger facial features.`
        break
      case 'CHILD_RANGE':
        categoryText = `Your measured PD is ${pdMm} mm, which falls in the range typical for children or adults with narrow PD (43-54 mm). Children's PD increases with age.`
        break
      case 'UNUSUAL':
        categoryText = `Your measured PD is ${pdMm} mm, which is outside the typical range. This may indicate a measurement error. Please re-measure or consult a professional for accurate PD measurement.`
        break
    }

    let confidenceText = ''
    switch (confidence) {
      case 'HIGH':
        confidenceText =
          'Your measurements were highly consistent (low variation between attempts), indicating good measurement technique.'
        break
      case 'MODERATE':
        confidenceText =
          'Your measurements showed moderate variation. Consider re-measuring for higher confidence.'
        break
      case 'LOW':
        confidenceText =
          'Your measurements showed significant variation (inconsistent marker placement). Re-measurement is recommended for accurate results.'
        break
    }

    return `${categoryText}\n\n${confidenceText}`
  }

  /**
   * Get test instructions
   */
  getInstructions(): string[] {
    return [
      'Ensure your screen is calibrated (use the credit card calibrator first)',
      'Position yourself at your normal viewing distance (~40-60 cm from screen)',
      'Look directly at the screen with both eyes open',
      'Use a mirror or front-camera preview to see your eyes while looking at the screen',
      'Align the LEFT marker to the center of your LEFT pupil',
      'Align the RIGHT marker to the center of your RIGHT pupil',
      'Take 3-5 measurements for best accuracy',
      'The average of your measurements will be calculated',
    ]
  }

  /**
   * Get screening disclaimer
   */
  getDisclaimer(): string {
    return 'This is a screening measurement only, NOT a dispensable PD for ordering glasses. Professional PD measurement by an optician or optometrist using a pupillometer or millimeter ruler is the authoritative standard for eyewear dispensing. Use this screening result for informational purposes only. Do NOT order glasses online using only this measurement without professional confirmation.'
  }
}

/**
 * Create a new PD test instance
 */
export function createPDTest(): PDTest {
  return new PDTest()
}
