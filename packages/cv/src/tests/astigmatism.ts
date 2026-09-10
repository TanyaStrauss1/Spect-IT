/**
 * Spect-IT Astigmatism Test Module
 * 
 * Clock dial (radial lines) astigmatism screening:
 * - 12 radial lines spaced 30° apart
 * - Tests each eye separately (OD/OS)
 * - Identifies which meridians appear darker/sharper
 * - Reports axis indication only (no cylinder power estimation)
 * - Honest about limitations for screening
 * 
 * Based on website/clinical-tests.js from PR #57
 */

import type { CalibrationData } from '../calibration/screen-calibrator'

/**
 * Eye being tested
 */
export type Eye = 'right' | 'left'

/**
 * Clock position (1-12)
 */
export type ClockPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

/**
 * Astigmatism axis range based on clock positions
 */
export interface AxisRange {
  from: number // Degrees
  to: number // Degrees
  description: string
}

/**
 * Per-eye astigmatism result
 */
export interface EyeAstigmatismResult {
  eye: Eye
  selectedPositions: ClockPosition[]
  estimatedAxis: number | null // Degrees (0-180), null if no clear pattern
  axisRange: AxisRange | null
  hasAstigmatism: boolean
}

/**
 * Complete astigmatism test result
 */
export interface AstigmatismResult {
  testName: 'Astigmatism Screening (Clock Dial)'
  version: '2.0-clinical'
  timestamp: number
  calibration?: CalibrationData
  rightEye: EyeAstigmatismResult | null
  leftEye: EyeAstigmatismResult | null
  methodology: string
  limitations: string
}

/**
 * Map clock positions to axis degrees
 * 12 o'clock = 90°, 3 o'clock = 0°/180°, 6 o'clock = 90°, 9 o'clock = 0°/180°
 */
export const CLOCK_TO_AXIS: Record<ClockPosition, number> = {
  12: 90,
  1: 60,
  2: 30,
  3: 0,
  4: 150,
  5: 120,
  6: 90,
  7: 60,
  8: 30,
  9: 0,
  10: 150,
  11: 120,
}

/**
 * Astigmatism Test Controller
 */
export class AstigmatismTest {
  /**
   * Get all clock positions
   */
  getClockPositions(): ClockPosition[] {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  }

  /**
   * Get angle for a clock position (0° = horizontal right, 90° = vertical up)
   */
  getAngleForPosition(position: ClockPosition): number {
    // Convert clock position to angle
    // 12 o'clock = 90°, rotating clockwise
    const angle = 90 - (position - 12) * 30
    return ((angle % 180) + 180) % 180 // Normalize to 0-180
  }

  /**
   * Analyze selected positions to estimate axis
   */
  analyzePositions(positions: ClockPosition[]): {
    estimatedAxis: number | null
    axisRange: AxisRange | null
    hasAstigmatism: boolean
  } {
    if (positions.length === 0) {
      return {
        estimatedAxis: null,
        axisRange: null,
        hasAstigmatism: false,
      }
    }

    // If all lines look the same (no positions selected, or 6+ positions),
    // likely no significant astigmatism
    if (positions.length >= 6) {
      return {
        estimatedAxis: null,
        axisRange: null,
        hasAstigmatism: false,
      }
    }

    // Calculate average axis from selected positions
    const angles = positions.map(p => this.getAngleForPosition(p))
    const avgAngle = angles.reduce((sum, a) => sum + a, 0) / angles.length
    const estimatedAxis = Math.round(avgAngle)

    // Determine axis range
    const axisRange = this.getAxisRange(estimatedAxis)

    return {
      estimatedAxis,
      axisRange,
      hasAstigmatism: true,
    }
  }

  /**
   * Get axis range description
   */
  getAxisRange(axis: number): AxisRange {
    if (axis >= 0 && axis <= 22.5 || axis >= 157.5 && axis <= 180) {
      return {
        from: 0,
        to: 22.5,
        description: 'Horizontal astigmatism (0° ± 22.5°)',
      }
    } else if (axis >= 22.5 && axis <= 67.5) {
      return {
        from: 22.5,
        to: 67.5,
        description: 'Oblique astigmatism (45° ± 22.5°)',
      }
    } else if (axis >= 67.5 && axis <= 112.5) {
      return {
        from: 67.5,
        to: 112.5,
        description: 'Vertical astigmatism (90° ± 22.5°)',
      }
    } else {
      return {
        from: 112.5,
        to: 157.5,
        description: 'Oblique astigmatism (135° ± 22.5°)',
      }
    }
  }

  /**
   * Process eye test result
   */
  processEyeResult(eye: Eye, selectedPositions: ClockPosition[]): EyeAstigmatismResult {
    const { estimatedAxis, axisRange, hasAstigmatism } = this.analyzePositions(selectedPositions)

    return {
      eye,
      selectedPositions,
      estimatedAxis,
      axisRange,
      hasAstigmatism,
    }
  }

  /**
   * Create complete test result
   */
  createResult(
    calibration: CalibrationData | undefined,
    rightEye: EyeAstigmatismResult | null,
    leftEye: EyeAstigmatismResult | null
  ): AstigmatismResult {
    return {
      testName: 'Astigmatism Screening (Clock Dial)',
      version: '2.0-clinical',
      timestamp: Date.now(),
      calibration,
      rightEye,
      leftEye,
      methodology: 'Clock dial with 12 radial lines spaced 30° apart. Each eye tested separately. User identifies lines that appear darker or sharper, indicating potential astigmatic axis.',
      limitations: 'This test provides axis indication only. It CANNOT measure cylinder power or provide a precise prescription. Astigmatism requires comprehensive refraction by an optometrist or ophthalmologist.',
    }
  }

  /**
   * Get interpretation text for eye result
   */
  getInterpretation(result: EyeAstigmatismResult): string {
    if (!result.hasAstigmatism) {
      return 'No significant astigmatism detected in this screening.'
    }

    if (result.estimatedAxis !== null && result.axisRange) {
      return `Possible astigmatism detected. Lines appear darker near ${result.estimatedAxis}° axis. ${result.axisRange.description}. Comprehensive eye examination recommended for accurate cylinder power and axis measurement.`
    }

    return 'Astigmatism screening inconclusive. Comprehensive eye examination recommended.'
  }

  /**
   * Get test instructions
   */
  getInstructions(): string[] {
    return [
      'Cover or close your left eye first (test right eye)',
      'Look at the center of the clock dial',
      'Select any lines that appear darker or sharper than others',
      'If all lines look equally dark/sharp, select nothing',
      'Repeat for the left eye (cover or close right eye)',
    ]
  }
}

/**
 * Create a new astigmatism test instance
 */
export function createAstigmatismTest(): AstigmatismTest {
  return new AstigmatismTest()
}
