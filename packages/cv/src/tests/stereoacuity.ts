/**
 * Spect-IT Stereoacuity (Binocular Depth) Screening Test
 * 
 * Random-dot stereogram test for screening binocular depth perception:
 * - Uses anaglyph (red-cyan) display for binocular disparity
 * - Tests multiple disparity levels to estimate stereo threshold
 * - Reports threshold in arcseconds (arc seconds of binocular disparity)
 * - Screening only - not diagnostic
 * 
 * Method: Random-dot stereogram with horizontal disparity
 * - Red filter for left eye, cyan filter for right eye
 * - Target shape appears to "float" at different depths
 * - User identifies target shape (circle, square, etc.)
 * - Disparity decreases (threshold increases) until detection fails
 * 
 * Clinical note: Requires red-cyan anaglyph glasses for valid results
 */

import type { CalibrationData } from '../calibration/screen-calibrator'

/**
 * Target shapes for stereoacuity test
 */
export const STEREO_SHAPES = ['circle', 'square', 'triangle', 'diamond'] as const
export type StereoShape = typeof STEREO_SHAPES[number]

/**
 * Disparity level configuration
 * Disparity in pixels at standard viewing distance maps to arcseconds
 */
export interface DisparityLevel {
  arcseconds: number // Stereo threshold in arcseconds
  disparityPx: number // Horizontal disparity in pixels (at calibrated distance)
  shape: StereoShape // Target shape to identify
  level: number // Level number (1, 2, 3...)
}

/**
 * User response to a disparity level
 */
export interface StereoResponse {
  level: DisparityLevel
  userShape: StereoShape | null // null if user saw nothing
  correct: boolean
  responseTimeMs: number
}

/**
 * Eye result (monocular baseline check)
 */
export interface EyeStereoResult {
  eye: 'right' | 'left'
  shapeRecognized: boolean // Can user see shapes monocularly?
  note: string
}

/**
 * Complete stereoacuity test result
 */
export interface StereoacuityResult {
  testName: 'Stereoacuity (Random-Dot Stereogram)'
  version: '1.0-screening'
  timestamp: number
  calibration: CalibrationData | undefined
  responses: StereoResponse[]
  thresholdArcsec: number | null // null if no stereo detected
  category: 'NORMAL' | 'REDUCED' | 'ABSENT'
  methodology: string
  hasAnaglyphGlasses: boolean // User confirmed they have red-cyan glasses
  rightEyeBaseline?: EyeStereoResult
  leftEyeBaseline?: EyeStereoResult
}

/**
 * Generate disparity levels for testing
 * Based on clinical stereo thresholds (Randot/Titmus equivalents)
 * 
 * Typical ranges:
 * - 40 arcsec: Normal stereopsis
 * - 60-200 arcsec: Reduced but functional
 * - >400 arcsec: Poor stereopsis
 * - No detection: Absent stereopsis (possible monocular vision)
 */
export function generateDisparityLevels(
  pxPerMm: number,
  distanceCm: number
): DisparityLevel[] {
  // Convert arcseconds to pixels at viewing distance
  // 1 arcsec = (distance * tan(arcsec)) = distance * (arcsec / 206265) in same units
  // disparity_mm = distance_mm * arcsec / 206265
  // disparity_px = disparity_mm * pxPerMm
  
  const distanceMm = distanceCm * 10
  
  const arcsecondLevels = [400, 200, 140, 100, 70, 50, 40, 30, 25, 20]
  const shapes: StereoShape[] = ['circle', 'square', 'triangle', 'diamond']
  
  return arcsecondLevels.map((arcsec, i) => {
    const disparityMm = (distanceMm * arcsec) / 206265
    const disparityPx = Math.max(1, Math.round(disparityMm * pxPerMm))
    
    return {
      arcseconds: arcsec,
      disparityPx,
      shape: shapes[i % shapes.length],
      level: i + 1,
    }
  })
}

/**
 * Stereoacuity Test Controller
 */
export class StereoacuityTest {
  private levels: DisparityLevel[] = []

  /**
   * Initialize test with calibration data
   */
  initialize(pxPerMm: number, distanceCm: number): void {
    this.levels = generateDisparityLevels(pxPerMm, distanceCm)
  }

  /**
   * Get disparity levels (coarse to fine)
   */
  getDisparityLevels(): DisparityLevel[] {
    return [...this.levels]
  }

  /**
   * Check if response is correct
   */
  checkResponse(target: StereoShape, response: StereoShape | null): boolean {
    return response === target
  }

  /**
   * Calculate stereo threshold from responses
   * 
   * Adaptive descending staircase: threshold is the finest (smallest arcseconds) correct response
   * achieved BEFORE the first incorrect response. This prevents a lucky correct at a finer level
   * after earlier misses from under-reporting threshold.
   * 
   * Algorithm:
   * - Walk responses in presentation order
   * - Track finest correct so far
   * - On first incorrect, freeze threshold (do not update from later corrects)
   * - If first response is incorrect (no corrects before first incorrect), return null
   */
  calculateThreshold(responses: StereoResponse[]): number | null {
    if (responses.length === 0) {
      return null
    }
    
    let finestCorrect: number | null = null
    
    for (const response of responses) {
      if (response.correct) {
        // Update threshold to finest (smallest arcsec) correct so far
        if (finestCorrect === null || response.level.arcseconds < finestCorrect) {
          finestCorrect = response.level.arcseconds
        }
      } else {
        // First incorrect encountered - freeze threshold at finest correct achieved so far
        // Do not update threshold from any subsequent responses
        break
      }
    }
    
    return finestCorrect
  }

  /**
   * Categorize stereoacuity for screening
   * 
   * Clinical norms:
   * - NORMAL: ≤60 arcsec (functional stereopsis for daily tasks)
   * - REDUCED: 60-400 arcsec (impaired but present)
   * - ABSENT: >400 arcsec or no detection (monocular vision likely)
   */
  categorizeResult(thresholdArcsec: number | null): 'NORMAL' | 'REDUCED' | 'ABSENT' {
    if (thresholdArcsec === null) return 'ABSENT'
    if (thresholdArcsec <= 60) return 'NORMAL'
    if (thresholdArcsec <= 400) return 'REDUCED'
    return 'ABSENT'
  }

  /**
   * Should test stop after this response? (adaptive stopping rule)
   */
  shouldStop(responses: StereoResponse[], consecutiveFailures: number): boolean {
    // Stop after 3 consecutive failures
    if (consecutiveFailures >= 3) return true
    
    // Stop after 10 trials regardless
    if (responses.length >= 10) return true
    
    return false
  }

  /**
   * Create complete test result
   */
  createResult(
    calibration: CalibrationData | undefined,
    responses: StereoResponse[],
    hasAnaglyphGlasses: boolean,
    rightEyeBaseline?: EyeStereoResult,
    leftEyeBaseline?: EyeStereoResult
  ): StereoacuityResult {
    const thresholdArcsec = this.calculateThreshold(responses)
    const category = this.categorizeResult(thresholdArcsec)

    return {
      testName: 'Stereoacuity (Random-Dot Stereogram)',
      version: '1.0-screening',
      timestamp: Date.now(),
      calibration,
      responses,
      thresholdArcsec,
      category,
      methodology: 'Random-dot stereogram with anaglyph (red-cyan) display. Horizontal disparity creates depth percept. User identifies target shape at various disparity levels. Threshold is finest disparity correctly detected. Requires red-cyan anaglyph glasses for valid results.',
      hasAnaglyphGlasses,
      rightEyeBaseline,
      leftEyeBaseline,
    }
  }

  /**
   * Get interpretation text
   */
  getInterpretation(category: StereoacuityResult['category'], thresholdArcsec: number | null): string {
    switch (category) {
      case 'NORMAL':
        return `Normal stereoacuity detected. Your stereo threshold is approximately ${thresholdArcsec} arcseconds. This indicates good binocular depth perception for daily activities.`
      case 'REDUCED':
        return `Reduced stereoacuity detected. Your stereo threshold is approximately ${thresholdArcsec} arcseconds. Binocular depth perception is present but impaired. Recommend comprehensive eye examination to assess binocular vision and alignment.`
      case 'ABSENT':
        if (thresholdArcsec === null) {
          return 'No stereopsis detected. This screening did not detect binocular depth perception. This may indicate monocular vision, strabismus, or amblyopia. Recommend comprehensive eye examination with binocular vision assessment.'
        }
        return `Poor stereoacuity detected. Your stereo threshold is approximately ${thresholdArcsec} arcseconds. This suggests significantly impaired binocular depth perception. Recommend comprehensive eye examination with binocular vision assessment.`
      default:
        return 'Unable to categorize stereoacuity.'
    }
  }

  /**
   * Get test instructions
   */
  getInstructions(): string[] {
    return [
      'This test requires red-cyan anaglyph 3D glasses (red filter over LEFT eye, cyan over RIGHT eye)',
      'Wear your distance glasses if you normally use them',
      'Look at the random dot pattern on screen',
      'A shape (circle, square, triangle, or diamond) will appear to "float" in front of or behind the background',
      'Identify the shape you see in depth',
      'If you cannot see any shape in depth, select "No shape visible"',
      'Test progresses from easy (obvious depth) to difficult (subtle depth)',
    ]
  }

  /**
   * Get screening disclaimer
   */
  getDisclaimer(): string {
    return 'This is a screening test only, NOT a diagnostic assessment. Results depend critically on proper red-cyan anaglyph glasses, screen calibration, and viewing conditions. Comprehensive clinical stereoacuity testing (Randot, Titmus, TNO) required for diagnosis. This test does NOT replace clinical binocular vision examination.'
  }

  /**
   * Get anaglyph requirements
   */
  getAnaglyphRequirements(): string[] {
    return [
      'Red filter over LEFT eye',
      'Cyan (blue-green) filter over RIGHT eye',
      'Filters must be true red and cyan (not red-blue)',
      'Adequate filter density to block opposite eye\'s image',
      'Glasses worn at standard viewing distance (35-40 cm)',
    ]
  }
}

/**
 * Create a new stereoacuity test instance
 */
export function createStereoacuityTest(): StereoacuityTest {
  return new StereoacuityTest()
}
