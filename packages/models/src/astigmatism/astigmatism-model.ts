/**
 * Astigmatism Test Engine
 * Analyzes radial line patterns to detect astigmatism
 */

export interface AstigmatismResult {
  /** Astigmatism power in diopters */
  power: number
  /** Axis in degrees (0-180) */
  axis: number
  /** Confidence score (0-1) */
  confidence: number
  /** Severity classification */
  severity: 'none' | 'mild' | 'moderate' | 'severe'
}

export interface AstigmatismTestData {
  /** User responses to radial lines */
  responses: Array<{
    angle: number // Line angle in degrees
    clarity: number // 0-1, how clearly the line is seen
    thickness: number // Perceived thickness (0-1)
  }>
  /** Test distance in meters */
  distance: number
}

export class AstigmatismModel {
  /**
   * Analyze astigmatism from test responses
   */
  analyze(testData: AstigmatismTestData): AstigmatismResult {
    const { responses, distance } = testData

    if (responses.length < 8) {
      return {
        power: 0,
        axis: 0,
        confidence: 0,
        severity: 'none'
      }
    }

    // Find the angle with worst clarity (thickest/blurriest line)
    const worstAngle = responses.reduce((worst, current) => 
      current.clarity < worst.clarity ? current : worst
    )

    // Find perpendicular angle (axis + 90°)
    const perpendicularAngle = (worstAngle.angle + 90) % 180

    // Calculate power based on clarity difference
    // Lower clarity = higher astigmatism
    const clarityDifference = 1.0 - worstAngle.clarity
    const power = this.clarityToPower(clarityDifference, distance)

    // Determine axis (perpendicular to worst angle)
    const axis = perpendicularAngle

    // Calculate confidence based on response consistency
    const confidence = this.calculateConfidence(responses, worstAngle)

    // Classify severity
    const severity = this.classifySeverity(power)

    return {
      power: Math.round(power * 100) / 100, // Round to 2 decimals
      axis: Math.round(axis),
      confidence,
      severity
    }
  }

  /**
   * Convert clarity score to astigmatism power
   */
  private clarityToPower(clarityDiff: number, distance: number): number {
    // Base conversion: clarity difference to diopters
    // Adjusted for test distance
    const basePower = clarityDiff * 3.0 // Max 3D for complete blur
    
    // Distance correction (closer = more sensitive)
    const distanceFactor = 2.0 / distance // Standard at 2m
    
    return basePower * distanceFactor
  }

  /**
   * Calculate confidence from response consistency
   */
  private calculateConfidence(
    responses: AstigmatismTestData['responses'],
    worstAngle: AstigmatismTestData['responses'][0]
  ): number {
    // Check if responses are consistent around worst angle
    const nearbyResponses = responses.filter(r => 
      Math.abs(r.angle - worstAngle.angle) < 30 ||
      Math.abs(r.angle - worstAngle.angle - 180) < 30
    )

    if (nearbyResponses.length < 3) {
      return 0.5 // Low confidence if not enough nearby responses
    }

    // Calculate variance in clarity around worst angle
    const clarities = nearbyResponses.map(r => r.clarity)
    const avgClarity = clarities.reduce((a, b) => a + b, 0) / clarities.length
    const variance = clarities.reduce((sum, c) => 
      sum + Math.pow(c - avgClarity, 2), 0
    ) / clarities.length

    // Lower variance = higher confidence
    const confidence = Math.max(0.5, 1.0 - variance)
    return Math.min(1.0, confidence)
  }

  /**
   * Classify astigmatism severity
   */
  private classifySeverity(power: number): AstigmatismResult['severity'] {
    const absPower = Math.abs(power)
    
    if (absPower < 0.5) return 'none'
    if (absPower < 1.0) return 'mild'
    if (absPower < 2.0) return 'moderate'
    return 'severe'
  }

  /**
   * Generate test pattern angles
   */
  generateTestPattern(numLines: number = 12): number[] {
    const angles: number[] = []
    const step = 180 / numLines
    
    for (let i = 0; i < numLines; i++) {
      angles.push(i * step)
    }
    
    return angles
  }
}

