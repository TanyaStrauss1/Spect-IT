/**
 * Spect-IT Visual Field Test Module
 * 
 * Amsler Grid visual field screening:
 * - 10x10 grid covering central 20° of visual field
 * - Tests each eye separately (OD/OS)
 * - Detects central scotomas, metamorphopsia, distortion
 * - Honest about peripheral/glaucoma limitations
 * - Not a substitute for comprehensive perimetry
 * 
 * Based on website/clinical-tests.js from PR #57
 */

import type { CalibrationData } from '../calibration/screen-calibrator'

/**
 * Eye being tested
 */
export type Eye = 'right' | 'left'

/**
 * Grid square position (row, col) 0-9 for 10x10 grid
 */
export interface GridPosition {
  row: number
  col: number
}

/**
 * Issue type reported by user
 */
export type IssueType = 'missing' | 'distorted' | 'blurry' | 'dark'

/**
 * Grid issue report
 */
export interface GridIssue {
  position: GridPosition
  type: IssueType
  description?: string
}

/**
 * Per-eye visual field result
 */
export interface EyeVisualFieldResult {
  eye: Eye
  issues: GridIssue[]
  centralFixationMaintained: boolean
  hasAbnormalities: boolean
}

/**
 * Complete visual field test result
 */
export interface VisualFieldResult {
  testName: 'Visual Field Screening (Amsler Grid)'
  version: '2.0-clinical'
  timestamp: number
  calibration?: CalibrationData
  rightEye: EyeVisualFieldResult | null
  leftEye: EyeVisualFieldResult | null
  methodology: string
  limitations: string
}

/**
 * Visual Field Test Controller
 */
export class VisualFieldTest {
  private gridSize: number // Number of squares per side
  private gridCoverageArcMin: number // Total angular size in arc minutes

  constructor(config: { gridSize?: number; gridCoverageArcMin?: number } = {}) {
    this.gridSize = config.gridSize || 10 // 10x10 grid standard
    this.gridCoverageArcMin = config.gridCoverageArcMin || 1200 // 20° = 1200 arc minutes
  }

  /**
   * Get grid configuration
   */
  getGridConfig(): { size: number; coverageArcMin: number; coverageDegrees: number } {
    return {
      size: this.gridSize,
      coverageArcMin: this.gridCoverageArcMin,
      coverageDegrees: this.gridCoverageArcMin / 60,
    }
  }

  /**
   * Get all grid positions
   */
  getAllGridPositions(): GridPosition[] {
    const positions: GridPosition[] = []
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        positions.push({ row, col })
      }
    }
    return positions
  }

  /**
   * Check if position is in central area (for fixation check)
   */
  isCentralPosition(position: GridPosition): boolean {
    const center = Math.floor(this.gridSize / 2)
    const tolerance = 1
    return (
      Math.abs(position.row - center) <= tolerance &&
      Math.abs(position.col - center) <= tolerance
    )
  }

  /**
   * Process eye test result
   */
  processEyeResult(
    eye: Eye,
    issues: GridIssue[],
    centralFixationMaintained: boolean
  ): EyeVisualFieldResult {
    // Check if any abnormalities detected
    const hasAbnormalities = issues.length > 0 || !centralFixationMaintained

    return {
      eye,
      issues,
      centralFixationMaintained,
      hasAbnormalities,
    }
  }

  /**
   * Create complete test result
   */
  createResult(
    calibration: CalibrationData | undefined,
    rightEye: EyeVisualFieldResult | null,
    leftEye: EyeVisualFieldResult | null
  ): VisualFieldResult {
    return {
      testName: 'Visual Field Screening (Amsler Grid)',
      version: '2.0-clinical',
      timestamp: Date.now(),
      calibration,
      rightEye,
      leftEye,
      methodology: '10x10 Amsler grid covering central 20° of visual field. Each eye tested separately while maintaining fixation on central point. User reports any missing, distorted, blurry, or dark areas.',
      limitations: 'This test screens the CENTRAL visual field only (central 20°). It does NOT detect peripheral field loss, glaucoma, or other conditions affecting peripheral vision. Comprehensive perimetry required for full visual field assessment.',
    }
  }

  /**
   * Get interpretation text for eye result
   */
  getInterpretation(result: EyeVisualFieldResult): string {
    if (!result.hasAbnormalities) {
      return 'No significant abnormalities detected in central visual field screening.'
    }

    const parts: string[] = []

    if (!result.centralFixationMaintained) {
      parts.push('Central fixation issue detected.')
    }

    if (result.issues.length > 0) {
      const missingCount = result.issues.filter(i => i.type === 'missing').length
      const distortedCount = result.issues.filter(i => i.type === 'distorted').length
      const blurryCount = result.issues.filter(i => i.type === 'blurry').length
      const darkCount = result.issues.filter(i => i.type === 'dark').length

      if (missingCount > 0) {
        parts.push(`${missingCount} area(s) missing or blank (scotoma)`)
      }
      if (distortedCount > 0) {
        parts.push(`${distortedCount} area(s) distorted (metamorphopsia)`)
      }
      if (blurryCount > 0) {
        parts.push(`${blurryCount} area(s) blurry`)
      }
      if (darkCount > 0) {
        parts.push(`${darkCount} area(s) darker than normal`)
      }
    }

    return `Abnormalities detected: ${parts.join(', ')}. Comprehensive eye examination recommended urgently.`
  }

  /**
   * Get test instructions
   */
  getInstructions(): string[] {
    return [
      'Hold the screen at a comfortable reading distance',
      'Cover or close your left eye first (test right eye)',
      'Look directly at the central dot - DO NOT look around',
      'While maintaining fixation, notice if any lines are missing, distorted, blurry, or dark',
      'Tap on any areas where you notice problems',
      'Repeat for the left eye (cover or close right eye)',
    ]
  }

  /**
   * Get grid square size in pixels for calibrated display
   */
  calculateGridSquareSize(calibration: CalibrationData): number | null {
    const pxPerMm = calibration.pxPerMm
    const distanceMm = calibration.distanceCm * 10

    if (!pxPerMm || !distanceMm) return null

    // Total grid angular size in radians
    const totalAngleRad = (this.gridCoverageArcMin / 60 / 180) * Math.PI
    
    // Total grid physical size in mm
    const totalSizeMm = Math.tan(totalAngleRad) * distanceMm
    
    // Total grid size in pixels
    const totalSizePx = totalSizeMm * pxPerMm
    
    // Each square size
    const squareSizePx = totalSizePx / this.gridSize
    
    return squareSizePx
  }
}

/**
 * Create a new visual field test instance
 */
export function createVisualFieldTest(config?: {
  gridSize?: number
  gridCoverageArcMin?: number
}): VisualFieldTest {
  return new VisualFieldTest(config)
}
