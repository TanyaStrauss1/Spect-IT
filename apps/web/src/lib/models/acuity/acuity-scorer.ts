/**
 * Acuity Test Engine
 * Snellen chart implementation with accurate scoring
 */

export interface AcuityResult {
  /** Snellen fraction (e.g., 20/20) */
  snellen: string
  /** Decimal acuity (e.g., 1.0) */
  decimal: number
  /** LogMAR score */
  logMAR: number
  /** Confidence score (0-1) */
  confidence: number
  /** Last correctly read line */
  lastCorrectLine: number
}

export interface AcuityTestData {
  /** Test distance in meters */
  distance: number
  /** User responses */
  responses: Array<{
    line: number
    letters: string[]
    userInput: string
    correct: boolean
  }>
  /** Standard Snellen chart configuration */
  chartType: 'snellen' | 'etdrs' | 'landolt'
}

export class AcuityScorer {
  /**
   * Calculate acuity score from test data
   */
  calculate(testData: AcuityTestData): AcuityResult {
    const { responses, distance, chartType } = testData

    // Find last correctly read line
    const correctResponses = responses.filter(r => r.correct)
    if (correctResponses.length === 0) {
      return this.getDefaultResult(distance)
    }

    const lastCorrect = correctResponses[correctResponses.length - 1]
    const lastLine = lastCorrect.line

    // Calculate Snellen fraction
    const snellen = this.calculateSnellen(lastLine, distance, chartType)
    
    // Calculate decimal acuity
    const decimal = this.snellenToDecimal(snellen)
    
    // Calculate LogMAR
    const logMAR = this.decimalToLogMAR(decimal)
    
    // Calculate confidence
    const confidence = this.calculateConfidence(responses, lastLine)

    return {
      snellen,
      decimal: Math.round(decimal * 100) / 100,
      logMAR: Math.round(logMAR * 100) / 100,
      confidence,
      lastCorrectLine: lastLine
    }
  }

  /**
   * Calculate Snellen fraction
   */
  private calculateSnellen(
    lineNumber: number,
    distance: number,
    chartType: AcuityTestData['chartType']
  ): string {
    // Standard Snellen chart line sizes (in meters at 6m)
    // Line 1 (largest) = 60m, Line 11 (smallest) = 3m
    const standardDistances = [
      60, 36, 24, 18, 12, 9, 6, 4.8, 3.6, 3.0, 2.4
    ]

    if (lineNumber < 1 || lineNumber > standardDistances.length) {
      return '20/200' // Default worst case
    }

    const lineSize = standardDistances[lineNumber - 1]
    
    // Convert to 20-foot equivalent
    // At 6m (20ft), line size = equivalent distance
    // At other distances, adjust proportionally
    const equivalentDistance = (lineSize * 20) / 6
    const testDistanceFeet = distance * 3.28084 // Convert meters to feet
    
    // Snellen fraction = test distance / equivalent distance
    const numerator = Math.round(testDistanceFeet)
    const denominator = Math.round(equivalentDistance)
    
    return `${numerator}/${denominator}`
  }

  /**
   * Convert Snellen fraction to decimal
   */
  private snellenToDecimal(snellen: string): number {
    const [numerator, denominator] = snellen.split('/').map(Number)
    return numerator / denominator
  }

  /**
   * Convert decimal acuity to LogMAR
   */
  private decimalToLogMAR(decimal: number): number {
    if (decimal <= 0) return 3.0 // Worst case
    return -Math.log10(decimal)
  }

  /**
   * Calculate confidence from responses
   */
  private calculateConfidence(
    responses: AcuityTestData['responses'],
    lastCorrectLine: number
  ): number {
    // Check consistency of responses
    const correctCount = responses.filter(r => r.correct).length
    const totalCount = responses.length
    
    if (totalCount === 0) return 0

    // Base confidence on accuracy
    const accuracy = correctCount / totalCount
    
    // Boost confidence if multiple lines were read correctly
    const lineBonus = Math.min(0.2, lastCorrectLine * 0.02)
    
    return Math.min(1.0, accuracy + lineBonus)
  }

  /**
   * Get default result for failed test
   */
  private getDefaultResult(distance: number): AcuityResult {
    return {
      snellen: '20/200',
      decimal: 0.1,
      logMAR: 1.0,
      confidence: 0.1,
      lastCorrectLine: 0
    }
  }

  /**
   * Generate Snellen chart letters for a line
   */
  generateLineLetters(lineNumber: number, chartType: AcuityTestData['chartType']): string[] {
    const letters = ['E', 'F', 'P', 'T', 'O', 'Z', 'L', 'P', 'F', 'D']
    const lettersPerLine = [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6]
    
    const count = lettersPerLine[Math.min(lineNumber - 1, lettersPerLine.length - 1)] || 5
    
    // Randomly select letters
    const selected: string[] = []
    for (let i = 0; i < count; i++) {
      const randomLetter = letters[Math.floor(Math.random() * letters.length)]
      selected.push(randomLetter)
    }
    
    return selected
  }

  /**
   * Validate user input against correct letters
   */
  validateResponse(userInput: string, correctLetters: string[]): boolean {
    const userLetters = userInput.toUpperCase().split('').filter(l => l.trim() !== '')
    const correct = correctLetters.map(l => l.toUpperCase())
    
    if (userLetters.length !== correct.length) {
      return false
    }
    
    // Check if all letters match
    return userLetters.every((letter, index) => letter === correct[index])
  }
}

