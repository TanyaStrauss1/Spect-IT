/**
 * Canonical Test Type Schema
 * 
 * Single source of truth for test type identifiers, display names, and categories.
 * Used by web + mobile for INSERTING and READING test results.
 */

/**
 * Canonical test type identifiers (kebab-case)
 * Use these when saving to database and marking journey progress
 */
export const TEST_TYPE_ID = {
  VISUAL_ACUITY: 'visual-acuity',
  CONTRAST_SENSITIVITY: 'contrast',
  COLOR_VISION: 'color-vision',
  ASTIGMATISM: 'astigmatism',
  VISUAL_FIELD: 'visual-field',
  PRESCRIPTION: 'prescription',
} as const

export type TestTypeId = typeof TEST_TYPE_ID[keyof typeof TEST_TYPE_ID]

/**
 * Display names for each test (used in UI and clinical summaries)
 */
export const TEST_TYPE_DISPLAY: Record<TestTypeId, string> = {
  [TEST_TYPE_ID.VISUAL_ACUITY]: 'Visual Acuity',
  [TEST_TYPE_ID.CONTRAST_SENSITIVITY]: 'Contrast Sensitivity',
  [TEST_TYPE_ID.COLOR_VISION]: 'Color Vision',
  [TEST_TYPE_ID.ASTIGMATISM]: 'Astigmatism',
  [TEST_TYPE_ID.VISUAL_FIELD]: 'Visual Field',
  [TEST_TYPE_ID.PRESCRIPTION]: 'Prescription Screening',
}

/**
 * Clinical display names (for clinical contexts)
 */
export const TEST_TYPE_CLINICAL: Record<TestTypeId, string> = {
  [TEST_TYPE_ID.VISUAL_ACUITY]: 'Visual Acuity (Clinical)',
  [TEST_TYPE_ID.CONTRAST_SENSITIVITY]: 'Contrast Sensitivity (Clinical)',
  [TEST_TYPE_ID.COLOR_VISION]: 'Color Vision (Clinical)',
  [TEST_TYPE_ID.ASTIGMATISM]: 'Astigmatism (Clinical)',
  [TEST_TYPE_ID.VISUAL_FIELD]: 'Visual Field (Clinical)',
  [TEST_TYPE_ID.PRESCRIPTION]: 'Prescription Screening (Clinical)',
}

/**
 * Legacy test type strings (for backward compatibility when reading)
 * Maps old strings to canonical IDs
 */
export const LEGACY_TEST_TYPES: Record<string, TestTypeId> = {
  // Current clinical strings
  'Visual Acuity (Clinical)': TEST_TYPE_ID.VISUAL_ACUITY,
  'Contrast Sensitivity (Clinical)': TEST_TYPE_ID.CONTRAST_SENSITIVITY,
  'Color Vision (Clinical)': TEST_TYPE_ID.COLOR_VISION,
  'Astigmatism (Clinical)': TEST_TYPE_ID.ASTIGMATISM,
  'Visual Field (Clinical)': TEST_TYPE_ID.VISUAL_FIELD,
  'Refractive Screening (Clinical)': TEST_TYPE_ID.PRESCRIPTION,
  
  // Simple display names
  'Visual Acuity': TEST_TYPE_ID.VISUAL_ACUITY,
  'Contrast Sensitivity': TEST_TYPE_ID.CONTRAST_SENSITIVITY,
  'Color Vision': TEST_TYPE_ID.COLOR_VISION,
  'Astigmatism': TEST_TYPE_ID.ASTIGMATISM,
  'Visual Field': TEST_TYPE_ID.VISUAL_FIELD,
  'Prescription Measurement': TEST_TYPE_ID.PRESCRIPTION,
  'Refractive Screening': TEST_TYPE_ID.PRESCRIPTION,
}

/**
 * Normalize a test type string to canonical ID
 * Handles legacy strings and test_name fields
 */
export function normalizeTestType(
  testType?: string,
  testName?: string
): TestTypeId | null {
  // Try test_type first
  if (testType) {
    // Check if already canonical
    if (Object.values(TEST_TYPE_ID).includes(testType as TestTypeId)) {
      return testType as TestTypeId
    }
    // Check legacy mapping
    if (testType in LEGACY_TEST_TYPES) {
      return LEGACY_TEST_TYPES[testType]
    }
  }

  // Try test_name fallback
  if (testName && testName in LEGACY_TEST_TYPES) {
    return LEGACY_TEST_TYPES[testName]
  }

  return null
}

/**
 * Get display name for a test type
 */
export function getTestDisplayName(testTypeId: TestTypeId): string {
  return TEST_TYPE_DISPLAY[testTypeId]
}

/**
 * Get clinical display name for a test type
 */
export function getTestClinicalName(testTypeId: TestTypeId): string {
  return TEST_TYPE_CLINICAL[testTypeId]
}

/**
 * Check if a test result matches a given test type
 * Handles all legacy formats
 */
export function isTestType(
  result: { test_type?: string; test_name?: string },
  targetType: TestTypeId
): boolean {
  const normalized = normalizeTestType(result.test_type, result.test_name)
  return normalized === targetType
}

/**
 * Filter results by test type (backward compatible)
 */
export function filterResultsByType<T extends { test_type?: string; test_name?: string }>(
  results: T[],
  testType: TestTypeId
): T[] {
  return results.filter(r => isTestType(r, testType))
}
