/**
 * Spect-IT Screen Calibration Module
 * 
 * Clinical visual acuity and contrast tests require accurate angular sizing,
 * which depends on knowing the screen's physical size (pixels per mm) and
 * the viewing distance.
 * 
 * This module provides:
 * - Credit card-based PPI calibration (85.6mm standard)
 * - Viewing distance presets and measurement
 * - Persistence via localStorage/AsyncStorage
 * - Angular size calculations for test stimuli
 * 
 * Based on website/spectit-calibration.js from PR #57
 */

export interface CalibrationData {
  pxPerMm: number // Pixels per millimeter
  distanceCm: number // Viewing distance in centimeters
  distanceM: number // Viewing distance in meters
  ppi: number // Pixels per inch (derived)
  timestamp: number // When calibration was performed
  method: 'credit-card' | 'ruler' | 'manual'
}

export interface CalibrationConfig {
  cardWidthMm?: number // Standard credit card width (default 85.6mm)
  minDistance?: number // Minimum viewing distance in cm (default 30)
  maxDistance?: number // Maximum viewing distance in cm (default 300)
  defaultDistance?: number // Default viewing distance in cm (default 60)
}

/**
 * Screen Calibrator
 * Manages calibration state and provides angular sizing calculations
 */
export class ScreenCalibrator {
  private static readonly STORAGE_KEY_PX = 'spectit_px_per_mm'
  private static readonly STORAGE_KEY_DIST = 'spectit_view_distance_cm'
  private static readonly STORAGE_KEY_SKIPPED = 'spectit_calibration_skipped'
  private static readonly CARD_WIDTH_MM = 85.6 // Standard credit card width

  private config: Required<CalibrationConfig>
  private storage: Storage | null = null

  constructor(config: CalibrationConfig = {}, storage?: Storage) {
    this.config = {
      cardWidthMm: config.cardWidthMm || ScreenCalibrator.CARD_WIDTH_MM,
      minDistance: config.minDistance || 30,
      maxDistance: config.maxDistance || 300,
      defaultDistance: config.defaultDistance || 60,
    }
    this.storage = storage || (typeof localStorage !== 'undefined' ? localStorage : null)
  }

  /**
   * Get current calibration data, if available
   */
  getCalibration(): CalibrationData | null {
    const pxPerMm = this.getPxPerMm()
    const distanceCm = this.getDistanceCm()

    if (!pxPerMm || !distanceCm) {
      return null
    }

    return {
      pxPerMm,
      distanceCm,
      distanceM: distanceCm / 100,
      ppi: Math.round(pxPerMm * 25.4),
      timestamp: Date.now(),
      method: 'credit-card',
    }
  }

  /**
   * Save calibration data
   */
  saveCalibration(pxPerMm: number, distanceCm: number): void {
    if (pxPerMm > 0) {
      this.setItem(ScreenCalibrator.STORAGE_KEY_PX, String(pxPerMm))
    }
    if (distanceCm > 0) {
      this.setItem(ScreenCalibrator.STORAGE_KEY_DIST, String(distanceCm))
    }
    this.removeItem(ScreenCalibrator.STORAGE_KEY_SKIPPED)
  }

  /**
   * Mark calibration as skipped (allow tests to proceed with fallback values)
   */
  markSkipped(): void {
    this.setItem(ScreenCalibrator.STORAGE_KEY_SKIPPED, '1')
  }

  /**
   * Check if user has valid calibration or has skipped
   */
  isReady(): boolean {
    return this.isCalibrated() || this.isSkipped()
  }

  /**
   * Check if calibration data exists and is valid
   */
  isCalibrated(): boolean {
    const pxPerMm = this.getPxPerMm()
    const distanceCm = this.getDistanceCm()
    return !!(pxPerMm && distanceCm)
  }

  /**
   * Check if user skipped calibration
   */
  isSkipped(): boolean {
    return this.getItem(ScreenCalibrator.STORAGE_KEY_SKIPPED) === '1'
  }

  /**
   * Clear calibration data
   */
  clearCalibration(): void {
    this.removeItem(ScreenCalibrator.STORAGE_KEY_PX)
    this.removeItem(ScreenCalibrator.STORAGE_KEY_DIST)
    this.removeItem(ScreenCalibrator.STORAGE_KEY_SKIPPED)
  }

  /**
   * Get pixels per millimeter
   */
  getPxPerMm(): number | null {
    const value = parseFloat(this.getItem(ScreenCalibrator.STORAGE_KEY_PX) || '')
    return Number.isFinite(value) && value > 0 ? value : null
  }

  /**
   * Get viewing distance in centimeters
   */
  getDistanceCm(): number | null {
    const value = parseFloat(this.getItem(ScreenCalibrator.STORAGE_KEY_DIST) || '')
    return Number.isFinite(value) && value > 0 ? value : null
  }

  /**
   * Calculate visual angle in arc minutes for a given size
   * @param sizeMm Size in millimeters
   * @returns Visual angle in arc minutes
   */
  calculateVisualAngleArcMin(sizeMm: number): number | null {
    const distanceCm = this.getDistanceCm()
    if (!distanceCm) return null

    const distanceMm = distanceCm * 10
    const angleRad = Math.atan(sizeMm / distanceMm)
    const angleDeg = (angleRad * 180) / Math.PI
    const angleArcMin = angleDeg * 60
    return angleArcMin
  }

  /**
   * Calculate size in pixels for a target visual angle
   * @param targetArcMin Target visual angle in arc minutes
   * @returns Size in pixels, or null if not calibrated
   */
  calculateSizeForVisualAngle(targetArcMin: number): number | null {
    const pxPerMm = this.getPxPerMm()
    const distanceCm = this.getDistanceCm()

    if (!pxPerMm || !distanceCm) return null

    const distanceMm = distanceCm * 10
    const angleDeg = targetArcMin / 60
    const angleRad = (angleDeg * Math.PI) / 180
    const sizeMm = Math.tan(angleRad) * distanceMm
    const sizePx = sizeMm * pxPerMm

    return sizePx
  }

  /**
   * Calculate letter size in pixels for standard ETDRS logMAR chart
   * @param logMAR LogMAR value (0.0 = 6/6 or 20/20)
   * @returns Letter height in pixels, or null if not calibrated
   */
  calculateETDRSLetterSize(logMAR: number): number | null {
    // Standard ETDRS: 1.0 logMAR = 5 arcmin per stroke (25 arcmin letter height)
    // Each 0.1 logMAR step = factor of 10^0.1 ≈ 1.2589
    const baseArcMin = 5.0 // 5 arcmin at logMAR 0.0
    const targetArcMin = baseArcMin * Math.pow(10, logMAR)
    const letterHeightArcMin = targetArcMin * 5 // Letter is 5x5 grid

    return this.calculateSizeForVisualAngle(letterHeightArcMin)
  }

  /**
   * Get default/fallback calibration values
   */
  getDefaultCalibration(): CalibrationData {
    return {
      pxPerMm: 3.8, // Typical laptop/tablet display
      distanceCm: this.config.defaultDistance,
      distanceM: this.config.defaultDistance / 100,
      ppi: Math.round(3.8 * 25.4), // ~96 PPI
      timestamp: Date.now(),
      method: 'manual',
    }
  }

  /**
   * Get configuration
   */
  getConfig(): Required<CalibrationConfig> {
    return { ...this.config }
  }

  // Storage helpers
  private getItem(key: string): string | null {
    if (!this.storage) return null
    try {
      return this.storage.getItem(key)
    } catch {
      return null
    }
  }

  private setItem(key: string, value: string): void {
    if (!this.storage) return
    try {
      this.storage.setItem(key, value)
    } catch {
      // Storage might be full or unavailable
    }
  }

  private removeItem(key: string): void {
    if (!this.storage) return
    try {
      this.storage.removeItem(key)
    } catch {
      // Ignore errors
    }
  }
}

/**
 * Create a singleton calibrator instance
 */
export function createCalibrator(config?: CalibrationConfig, storage?: Storage): ScreenCalibrator {
  return new ScreenCalibrator(config, storage)
}
