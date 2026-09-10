/**
 * Spect-IT Prescription/Refractive Test Module
 * 
 * Honest refractive screening without precise prescription generation:
 * - Pinhole acuity test to detect refractive error
 * - Near vision screening for presbyopia
 * - Comparison of uncorrected vs. pinhole-corrected acuity
 * - Does NOT generate precise sphere/cylinder/axis values
 * - Frames results as "needs correction" screening
 * - Strong non-prescription disclaimer
 * 
 * Based on website/clinical-tests.js from PR #57
 */

import type { CalibrationData } from '../calibration/screen-calibrator'
import type { VisualAcuityResult } from './visual-acuity'

/**
 * Eye being tested
 */
export type Eye = 'right' | 'left'

/**
 * Refractive error category
 */
export type RefractiveCategory = 
  | 'NO_ERROR' 
  | 'MYOPIA_LIKELY' 
  | 'HYPEROPIA_LIKELY' 
  | 'ASTIGMATISM_LIKELY'
  | 'PRESBYOPIA_LIKELY'
  | 'CORRECTION_NEEDED'

/**
 * Pinhole test result for one eye
 */
export interface PinholeResult {
  eye: Eye
  uncorrectedLogMAR: number
  pinholeLogMAR: number
  improvement: number // LogMAR units improved
  significantImprovement: boolean // > 0.1 logMAR improvement
}

/**
 * Near vision test result
 */
export interface NearVisionResult {
  distanceCm: number // Reading distance tested
  readableSize: number // Smallest readable print size (points or Jaeger)
  hasPresbyopia: boolean
}

/**
 * Complete prescription screening result
 */
export interface PrescriptionScreeningResult {
  testName: 'Refractive Screening (Pinhole Method)'
  version: '2.0-clinical'
  timestamp: number
  calibration?: CalibrationData
  rightEye: PinholeResult | null
  leftEye: PinholeResult | null
  nearVision: NearVisionResult | null
  distanceAcuity?: VisualAcuityResult // Reference to full acuity test if available
  recommendation: string
  category: RefractiveCategory
  methodology: string
  disclaimer: string
}

/**
 * Prescription Screening Test Controller
 */
export class PrescriptionScreeningTest {
  private improvementThreshold: number // LogMAR improvement threshold

  constructor(config: { improvementThreshold?: number } = {}) {
    this.improvementThreshold = config.improvementThreshold || 0.1 // 0.1 logMAR = 1 line
  }

  /**
   * Process pinhole test result for one eye
   */
  processPinholeResult(
    eye: Eye,
    uncorrectedLogMAR: number,
    pinholeLogMAR: number
  ): PinholeResult {
    const improvement = uncorrectedLogMAR - pinholeLogMAR
    const significantImprovement = improvement >= this.improvementThreshold

    return {
      eye,
      uncorrectedLogMAR,
      pinholeLogMAR,
      improvement,
      significantImprovement,
    }
  }

  /**
   * Process near vision screening
   */
  processNearVision(
    distanceCm: number,
    readableSize: number,
    patientAge?: number
  ): NearVisionResult {
    // Simple presbyopia screening
    // Typically affects people 40+, difficulty reading small print at 30-40cm
    const hasPresbyopia = 
      readableSize > 8 || // Jaeger 8+ or 12pt+ print
      (patientAge !== undefined && patientAge >= 40 && readableSize > 6)

    return {
      distanceCm,
      readableSize,
      hasPresbyopia,
    }
  }

  /**
   * Determine refractive category based on test results
   */
  categorizeRefractive(
    rightEye: PinholeResult | null,
    leftEye: PinholeResult | null,
    nearVision: NearVisionResult | null
  ): RefractiveCategory {
    // Check if either eye shows significant improvement with pinhole
    const rightImprovement = rightEye?.significantImprovement || false
    const leftImprovement = leftEye?.significantImprovement || false

    // Near vision issue suggests presbyopia
    if (nearVision?.hasPresbyopia) {
      return 'PRESBYOPIA_LIKELY'
    }

    // No improvement with pinhole = likely no refractive error
    if (!rightImprovement && !leftImprovement) {
      return 'NO_ERROR'
    }

    // Significant improvement with pinhole suggests refractive error
    // We can't distinguish myopia vs. hyperopia vs. astigmatism precisely
    // without full refraction, so we use general category
    return 'CORRECTION_NEEDED'
  }

  /**
   * Generate recommendation text
   */
  generateRecommendation(
    category: RefractiveCategory,
    rightEye: PinholeResult | null,
    leftEye: PinholeResult | null,
    nearVision: NearVisionResult | null
  ): string {
    switch (category) {
      case 'NO_ERROR':
        return 'No significant refractive error detected in this screening. Your vision appears to be clear without correction.'
      
      case 'CORRECTION_NEEDED':
        const eyes: string[] = []
        if (rightEye?.significantImprovement) eyes.push('right eye')
        if (leftEye?.significantImprovement) eyes.push('left eye')
        return `Refractive error likely in ${eyes.join(' and ')}. Vision improved significantly with pinhole test. Comprehensive eye examination with refraction recommended to obtain prescription.`
      
      case 'PRESBYOPIA_LIKELY':
        return 'Difficulty with near vision detected, consistent with presbyopia (age-related near vision loss). Reading glasses or multifocal lenses may be beneficial. Comprehensive eye examination recommended.'
      
      case 'MYOPIA_LIKELY':
        return 'Possible myopia (nearsightedness) detected. Comprehensive eye examination with refraction recommended.'
      
      case 'HYPEROPIA_LIKELY':
        return 'Possible hyperopia (farsightedness) detected. Comprehensive eye examination with refraction recommended.'
      
      case 'ASTIGMATISM_LIKELY':
        return 'Possible astigmatism detected. Comprehensive eye examination with refraction recommended.'
      
      default:
        return 'Comprehensive eye examination recommended for accurate refraction and prescription.'
    }
  }

  /**
   * Create complete test result
   */
  createResult(
    calibration: CalibrationData | undefined,
    rightEye: PinholeResult | null,
    leftEye: PinholeResult | null,
    nearVision: NearVisionResult | null,
    distanceAcuity?: VisualAcuityResult
  ): PrescriptionScreeningResult {
    const category = this.categorizeRefractive(rightEye, leftEye, nearVision)
    const recommendation = this.generateRecommendation(category, rightEye, leftEye, nearVision)

    return {
      testName: 'Refractive Screening (Pinhole Method)',
      version: '2.0-clinical',
      timestamp: Date.now(),
      calibration,
      rightEye,
      leftEye,
      nearVision,
      distanceAcuity,
      recommendation,
      category,
      methodology: 'Pinhole acuity test: measures visual acuity with and without a pinhole occluder. Significant improvement with pinhole (≥0.1 logMAR or 1 line) indicates refractive error that could be corrected with glasses or contact lenses. Near vision screening for presbyopia.',
      disclaimer: 'THIS IS A SCREENING TEST ONLY. It does NOT provide a prescription. Precise sphere, cylinder, and axis values require comprehensive refraction by an optometrist or ophthalmologist. Do not attempt to order glasses or contact lenses based on this screening.',
    }
  }

  /**
   * Get test instructions
   */
  getPinholeInstructions(): string[] {
    return [
      'First, measure your distance visual acuity without correction',
      'Then, look through a pinhole (simulated on screen or use physical pinhole card)',
      'Measure visual acuity again while looking through the pinhole',
      'If vision improves significantly, refractive error is likely',
      'Test each eye separately',
    ]
  }

  /**
   * Get near vision instructions
   */
  getNearVisionInstructions(): string[] {
    return [
      'Hold reading material at your preferred reading distance (30-40cm)',
      'Read progressively smaller text',
      'Note the smallest text you can read comfortably',
      'If you struggle with small print, presbyopia (age-related near vision loss) may be present',
    ]
  }
}

/**
 * Create a new prescription screening test instance
 */
export function createPrescriptionScreeningTest(config?: {
  improvementThreshold?: number
}): PrescriptionScreeningTest {
  return new PrescriptionScreeningTest(config)
}
