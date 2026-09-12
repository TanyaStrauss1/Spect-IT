/**
 * Clinical Results Summary Logic (React Native)
 * Processes test results for clinical interpretation
 */

import { TEST_TYPE_ID, filterResultsByType } from '@spect-it/cv'

export interface TestResult {
  id: number
  test_type: string
  test_name?: string
  test_data: any
  results?: any
  score?: number
  created_at: string
  test_date?: string
}

export interface LogMARInterpretation {
  category: string
  color: string
  recommendation: string
}

export function convertSnellenToLogMAR(snellen: string): number | null {
  if (!snellen || typeof snellen !== 'string') return null
  
  const parts = snellen.split('/')
  if (parts.length !== 2) return null
  
  const num = parseFloat(parts[0])
  const denom = parseFloat(parts[1])
  
  if (!num || !denom) return null
  
  return Math.log10(denom / num)
}

export function interpretLogMAR(logMAR: number): LogMARInterpretation {
  if (logMAR <= 0.0) {
    return {
      category: 'Excellent',
      color: '#10b981',
      recommendation: 'Your distance vision is excellent.'
    }
  }
  if (logMAR <= 0.3) {
    return {
      category: 'Good',
      color: '#10b981',
      recommendation: 'Your distance vision is good.'
    }
  }
  if (logMAR <= 0.5) {
    return {
      category: 'Fair',
      color: '#f59e0b',
      recommendation: 'Your distance vision may benefit from correction. Consider an eye exam.'
    }
  }
  if (logMAR <= 1.0) {
    return {
      category: 'Reduced',
      color: '#ef4444',
      recommendation: 'Your distance vision is reduced. Schedule an eye exam.'
    }
  }
  return {
    category: 'Severely reduced',
    color: '#dc2626',
    recommendation: 'Your distance vision is severely reduced. See an optometrist soon.'
  }
}

export interface EyeResult {
  snellen?: string
  logMAR?: number
  interpretation?: LogMARInterpretation
  date?: string
}

export interface ClinicalSummary {
  leftEye?: EyeResult
  rightEye?: EyeResult
  bothEyes?: EyeResult
  colorVision?: TestResult
  contrast?: TestResult
  astigmatism?: TestResult
  prescription?: TestResult
  visualField?: TestResult
}

export function extractAcuityResults(results: TestResult[]): {
  left?: EyeResult
  right?: EyeResult
  both?: EyeResult
} {
  // Use canonical filter (backward compatible with all legacy formats)
  const acuityResults = filterResultsByType(results, TEST_TYPE_ID.VISUAL_ACUITY)

  const leftEyeTests = acuityResults.filter(r => 
    r.test_data?.eye === 'left' || r.results?.eye === 'left'
  )
  const rightEyeTests = acuityResults.filter(r => 
    r.test_data?.eye === 'right' || r.results?.eye === 'right'
  )
  const bothEyeTests = acuityResults.filter(r => 
    r.test_data?.eye === 'both' || r.results?.eye === 'both' || (!r.test_data?.eye && !r.results?.eye)
  )

  const getLatest = (tests: TestResult[]): EyeResult | undefined => {
    if (!tests.length) return undefined
    
    const latest = tests.reduce((prev, current) => 
      new Date(current.created_at) > new Date(prev.created_at) ? current : prev
    )

    const snellen = latest.results?.snellen || 
                    latest.test_data?.finalSnellen || 
                    latest.test_data?.rightEye?.finalSnellen ||
                    latest.test_data?.leftEye?.finalSnellen
    
    if (!snellen) return undefined

    const logMAR = convertSnellenToLogMAR(snellen)
    const interpretation = logMAR !== null ? interpretLogMAR(logMAR) : undefined

    return {
      snellen,
      logMAR: logMAR || undefined,
      interpretation,
      date: latest.created_at
    }
  }

  return {
    left: getLatest(leftEyeTests),
    right: getLatest(rightEyeTests),
    both: getLatest(bothEyeTests)
  }
}

export function generateClinicalSummary(results: TestResult[]): ClinicalSummary {
  const acuity = extractAcuityResults(results)
  
  const latest = (testTypeId: string) => {
    const filtered = filterResultsByType(results, testTypeId as any)
    if (!filtered.length) return undefined
    return filtered.reduce((prev, current) => 
      new Date(current.created_at) > new Date(prev.created_at) ? current : prev
    )
  }

  return {
    leftEye: acuity.left,
    rightEye: acuity.right,
    bothEyes: acuity.both,
    colorVision: latest(TEST_TYPE_ID.COLOR_VISION),
    contrast: latest(TEST_TYPE_ID.CONTRAST_SENSITIVITY),
    astigmatism: latest(TEST_TYPE_ID.ASTIGMATISM),
    prescription: latest(TEST_TYPE_ID.PRESCRIPTION),
    visualField: latest(TEST_TYPE_ID.VISUAL_FIELD)
  }
}
