/**
 * Spect-IT Color Vision Test Module
 * 
 * Pseudoisochromatic color vision screening using confusion-line methodology:
 * - Control plates to validate viewing conditions
 * - Protan (red-deficient) screening plates
 * - Deutan (green-deficient) screening plates
 * - Uses procedurally generated dot-field plates (not copyrighted Ishihara)
 * - Includes display calibration warnings
 * 
 * Based on website/clinical-tests.js from PR #57
 */

import type { CalibrationData } from '../calibration/screen-calibrator'
import { PSEUDOISOCHROMATIC_PLATES, type PlateConfig } from '../rendering/pseudoisochromatic-plates'

/**
 * Plate type for classification
 */
export type PlateType = 'control' | 'protan' | 'deutan'

/**
 * Color vision plate (wrapper around PlateConfig for compatibility)
 */
export interface ColorPlate {
  id: string
  number: string
  type: PlateType
  figureColor: string // Kept for compatibility
  backgroundColors: string[] // Kept for compatibility
  description: string
}

/**
 * Plate response from user
 */
export interface PlateResponse {
  plate: ColorPlate
  userAnswer: string
  correct: boolean
  responseTime?: number
}

/**
 * Color vision test result
 */
export interface ColorVisionResult {
  testName: 'Color Vision Screening'
  version: '3.0-clinical-plates'
  timestamp: number
  calibration?: CalibrationData
  responses: PlateResponse[]
  controlsPassed: number
  controlsTotal: number
  protanScore: number // 0-1, proportion correct
  deutanScore: number // 0-1, proportion correct
  classification: 'NORMAL' | 'PROTAN_DEFECT' | 'DEUTAN_DEFECT' | 'GENERAL_DEFECT' | 'INVALID'
  methodology: string
  displayWarning: string
}

/**
 * Convert PlateConfig to ColorPlate for compatibility
 */
function plateConfigToColorPlate(config: PlateConfig): ColorPlate {
  return {
    id: config.id,
    number: config.digit,
    type: config.type,
    figureColor: `hsl(${config.digitHues[0]}, ${config.saturation}%, ${config.lightness}%)`,
    backgroundColors: config.backgroundHues.map(h => `hsl(${h}, ${config.saturation}%, ${config.lightness}%)`),
    description: config.description,
  }
}

/**
 * Standard confusion-line pseudoisochromatic plates
 * 
 * These plates use color pairs along confusion lines for protan and deutan defects.
 * Using procedurally generated dot-field plates from rendering/pseudoisochromatic-plates.ts
 */
export const COLOR_VISION_PLATES: ColorPlate[] = PSEUDOISOCHROMATIC_PLATES.map(plateConfigToColorPlate)

/**
 * Color Vision Test Controller
 */
export class ColorVisionTest {
  private plates: ColorPlate[]
  private plateConfigs: PlateConfig[]

  constructor(config: { customPlates?: PlateConfig[] } = {}) {
    this.plateConfigs = config.customPlates || PSEUDOISOCHROMATIC_PLATES
    this.plates = this.plateConfigs.map(plateConfigToColorPlate)
  }

  /**
   * Get plates in test order
   */
  getPlates(): ColorPlate[] {
    return [...this.plates]
  }

  /**
   * Check if a response is correct
   */
  checkResponse(plate: ColorPlate, userAnswer: string): boolean {
    const normalized = userAnswer.trim()
    return normalized === plate.number
  }

  /**
   * Score a plate response
   */
  scorePlate(plate: ColorPlate, userAnswer: string, responseTime?: number): PlateResponse {
    const correct = this.checkResponse(plate, userAnswer)
    
    return {
      plate,
      userAnswer,
      correct,
      responseTime,
    }
  }

  /**
   * Classify color vision based on responses
   */
  classifyColorVision(responses: PlateResponse[]): {
    classification: ColorVisionResult['classification']
    protanScore: number
    deutanScore: number
    controlsPassed: number
    controlsTotal: number
  } {
    const controlResponses = responses.filter(r => r.plate.type === 'control')
    const protanResponses = responses.filter(r => r.plate.type === 'protan')
    const deutanResponses = responses.filter(r => r.plate.type === 'deutan')

    const controlsPassed = controlResponses.filter(r => r.correct).length
    const controlsTotal = controlResponses.length
    
    // If controls failed, test is invalid
    if (controlsPassed < controlsTotal) {
      return {
        classification: 'INVALID',
        protanScore: 0,
        deutanScore: 0,
        controlsPassed,
        controlsTotal,
      }
    }

    const protanScore = protanResponses.length > 0 
      ? protanResponses.filter(r => r.correct).length / protanResponses.length 
      : 1.0
    
    const deutanScore = deutanResponses.length > 0
      ? deutanResponses.filter(r => r.correct).length / deutanResponses.length
      : 1.0

    // Classification thresholds
    const DEFECT_THRESHOLD = 0.5 // Less than 50% correct indicates defect

    let classification: ColorVisionResult['classification'] = 'NORMAL'
    
    if (protanScore < DEFECT_THRESHOLD && deutanScore < DEFECT_THRESHOLD) {
      classification = 'GENERAL_DEFECT'
    } else if (protanScore < DEFECT_THRESHOLD) {
      classification = 'PROTAN_DEFECT'
    } else if (deutanScore < DEFECT_THRESHOLD) {
      classification = 'DEUTAN_DEFECT'
    }

    return {
      classification,
      protanScore,
      deutanScore,
      controlsPassed,
      controlsTotal,
    }
  }

  /**
   * Create complete test result
   */
  createResult(responses: PlateResponse[], calibration?: CalibrationData): ColorVisionResult {
    const { classification, protanScore, deutanScore, controlsPassed, controlsTotal } = 
      this.classifyColorVision(responses)

    return {
      testName: 'Color Vision Screening',
      version: '3.0-clinical-plates',
      timestamp: Date.now(),
      calibration,
      responses,
      controlsPassed,
      controlsTotal,
      protanScore,
      deutanScore,
      classification,
      methodology: 'Pseudoisochromatic plates using confusion-line methodology with procedurally generated dot fields (~2000 dots per plate). Separate screening for protan (red-deficient) and deutan (green-deficient) color vision defects. Control plates verify viewing conditions.',
      displayWarning: 'Color vision testing depends on accurate color reproduction by your display. Ensure maximum brightness, avoid glare, use natural lighting, and avoid fluorescent lighting. This is a screening tool, not a diagnostic test.',
    }
  }

  /**
   * Get interpretation text for classification
   */
  getInterpretation(classification: ColorVisionResult['classification']): string {
    switch (classification) {
      case 'NORMAL':
        return 'No significant color vision deficiency detected in this screening.'
      case 'PROTAN_DEFECT':
        return 'Possible protan defect (red-deficient color vision). Recommend comprehensive color vision examination.'
      case 'DEUTAN_DEFECT':
        return 'Possible deutan defect (green-deficient color vision). Recommend comprehensive color vision examination.'
      case 'GENERAL_DEFECT':
        return 'Significant color vision deficiency detected. Recommend comprehensive color vision examination.'
      case 'INVALID':
        return 'Test results invalid - control plates not passed. Ensure proper viewing conditions and display settings.'
      default:
        return 'Unable to classify color vision.'
    }
  }

  /**
   * Get display calibration checklist
   */
  getDisplayChecklist(): string[] {
    return [
      'Set screen brightness to 100%',
      'Avoid glare on the screen',
      'Use natural or neutral lighting (not fluorescent)',
      'Ensure adequate room lighting',
      'View screen at comfortable distance',
      'Avoid viewing from extreme angles',
    ]
  }
}

/**
 * Create a new color vision test instance
 */
export function createColorVisionTest(config?: { customPlates?: PlateConfig[] }): ColorVisionTest {
  return new ColorVisionTest(config)
}
