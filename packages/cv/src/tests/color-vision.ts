/**
 * Spect-IT Color Vision Test Module
 * 
 * Pseudoisochromatic color vision screening using confusion-line methodology:
 * - Control plates to validate viewing conditions
 * - Protan (red-deficient) screening plates
 * - Deutan (green-deficient) screening plates
 * - Does NOT use copyrighted Ishihara plate images
 * - Includes display calibration warnings
 * 
 * Based on website/clinical-tests.js from PR #57
 */

import type { CalibrationData } from '../calibration/screen-calibrator'

/**
 * Plate type for classification
 */
export type PlateType = 'control' | 'protan' | 'deutan'

/**
 * Color vision plate configuration
 */
export interface ColorPlate {
  id: string
  number: string // The number visible in the plate
  type: PlateType
  figureColor: string // Color of the figure (hex)
  backgroundColors: string[] // Colors used in background (hex)
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
  version: '2.0-clinical'
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
 * Standard confusion-line pseudoisochromatic plates
 * 
 * These plates use color pairs along confusion lines for protan and deutan defects.
 * NOT using copyrighted Ishihara designs - these are general confusion-line principles.
 */
export const COLOR_VISION_PLATES: ColorPlate[] = [
  // Control plate 1 - Everyone should see this
  {
    id: 'control-1',
    number: '12',
    type: 'control',
    figureColor: '#d32f2f', // Red
    backgroundColors: ['#bdbdbd', '#9e9e9e'], // Gray
    description: 'Control plate - all viewers should see 12',
  },
  
  // Protan plates (red-deficient screening)
  {
    id: 'protan-1',
    number: '6',
    type: 'protan',
    figureColor: '#c62828', // Red
    backgroundColors: ['#f5deb3', '#daa520'], // Tan/gold confusion
    description: 'Protan test 1 - protanopes may miss or misread',
  },
  {
    id: 'protan-2',
    number: '8',
    type: 'protan',
    figureColor: '#d32f2f', // Red
    backgroundColors: ['#ffe0b2', '#ffb74d'], // Orange/peach confusion
    description: 'Protan test 2',
  },
  {
    id: 'protan-3',
    number: '45',
    type: 'protan',
    figureColor: '#b71c1c', // Dark red
    backgroundColors: ['#ffccbc', '#ff8a65'], // Light red/salmon confusion
    description: 'Protan test 3',
  },
  
  // Deutan plates (green-deficient screening)
  {
    id: 'deutan-1',
    number: '3',
    type: 'deutan',
    figureColor: '#1976d2', // Blue
    backgroundColors: ['#d3d3d3', '#a9a9a9'], // Gray confusion for deutans
    description: 'Deutan test 1 - deuteranopes may miss or misread',
  },
  {
    id: 'deutan-2',
    number: '5',
    type: 'deutan',
    figureColor: '#1565c0', // Blue
    backgroundColors: ['#e1f5fe', '#81d4fa'], // Light blue confusion
    description: 'Deutan test 2',
  },
  {
    id: 'deutan-3',
    number: '74',
    type: 'deutan',
    figureColor: '#0d47a1', // Dark blue
    backgroundColors: ['#bbdefb', '#64b5f6'], // Medium blue confusion
    description: 'Deutan test 3',
  },
  
  // Control plate 2 - Verification
  {
    id: 'control-2',
    number: '9',
    type: 'control',
    figureColor: '#5d4037', // Brown
    backgroundColors: ['#f5f5dc', '#d2b48c'], // Beige
    description: 'Control plate 2 - all viewers should see 9',
  },
]

/**
 * Color Vision Test Controller
 */
export class ColorVisionTest {
  private plates: ColorPlate[]

  constructor(config: { customPlates?: ColorPlate[] } = {}) {
    this.plates = config.customPlates || COLOR_VISION_PLATES
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
      version: '2.0-clinical',
      timestamp: Date.now(),
      calibration,
      responses,
      controlsPassed,
      controlsTotal,
      protanScore,
      deutanScore,
      classification,
      methodology: 'Pseudoisochromatic plates using confusion-line methodology. Separate screening for protan (red-deficient) and deutan (green-deficient) color vision defects. Control plates verify viewing conditions.',
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
export function createColorVisionTest(config?: { customPlates?: ColorPlate[] }): ColorVisionTest {
  return new ColorVisionTest(config)
}
