/**
 * Spect-IT Hearing Screening Test Module
 * 
 * Pure-tone screening protocol following ASHA school screening guidelines:
 * - Standard frequencies: 500, 1000, 2000, 4000 Hz
 * - Pulsed tone presentation (clinical best practice)
 * - Catch trials for response reliability
 * - Left/right ear testing with stereo separation
 * - Honest about calibration limitations
 * 
 * IMPORTANT: This is a SCREENING protocol, not diagnostic audiometry.
 * Uses relative device volumes, NOT calibrated dB HL.
 */

/**
 * Standard screening frequencies (Hz)
 * Per ASHA school screening guidelines
 */
export const SCREENING_FREQUENCIES = [500, 1000, 2000, 4000] as const
export type ScreeningFrequency = typeof SCREENING_FREQUENCIES[number]

/**
 * Optional extended frequencies for comprehensive screening
 * (Use with caution - not all devices reproduce these frequencies well)
 */
export const EXTENDED_FREQUENCIES = [250, 6000, 8000] as const
export type ExtendedFrequency = typeof EXTENDED_FREQUENCIES[number]

/**
 * Pulsed tone configuration
 * Clinical screening best practice: brief pulsed tones improve detection
 * and reduce listener fatigue compared to continuous tones
 */
export const PULSED_TONE_CONFIG = {
  pulseDurationMs: 500,     // Duration of each pulse (ms)
  pulseGapMs: 300,          // Silent gap between pulses (ms)
  pulseCount: 3,            // Number of pulses per presentation
} as const

/**
 * Catch trial configuration
 * Silent trials to detect false positives (responding when no sound present)
 */
export const CATCH_TRIAL_CONFIG = {
  probability: 0.15,        // 15% of trials are catch trials
  minCatchTrials: 2,        // Minimum number of catch trials in full test
} as const

/**
 * Default screening level (relative volume, 0.0 to 1.0)
 * IMPORTANT: This is NOT calibrated dB HL. It's a relative device volume.
 * Actual SPL depends on device output characteristics and headphone sensitivity.
 */
export const DEFAULT_SCREENING_LEVEL = 0.15

/**
 * Pass/refer criteria per ASHA school screening guidelines
 */
export const PASS_REFER_CRITERIA = {
  description: 'Pass all screening frequencies (500, 1000, 2000, 4000 Hz) in both ears. Refer if any frequency missed.',
  passCriteria: (leftCorrect: number, rightCorrect: number, totalFreqs: number) => {
    // Pass: heard all frequencies in both ears
    // Refer: missed any frequency in either ear
    return leftCorrect >= totalFreqs && rightCorrect >= totalFreqs
  },
} as const

/**
 * Test result interface
 */
export interface HearingScreeningResult {
  testName: 'Hearing Screening (Pure-Tone)'
  version: '1.0-clinical-protocol'
  timestamp: string
  protocol: 'ASHA-based pure-tone screening'
  
  // Frequency results
  frequencyResults: {
    frequency: ScreeningFrequency
    leftEarPassed: boolean
    rightEarPassed: boolean
  }[]
  
  // Summary
  leftEarPassCount: number
  rightEarPassCount: number
  totalFrequencies: number
  
  // Reliability
  catchTrialCount: number
  falsePositiveCount: number
  
  // Outcome
  overallStatus: 'PASS' | 'REFER'
  passCriteria: string
  
  // Metadata
  methodology: string
  note: string
}

/**
 * Create methodology string for result
 */
export function createMethodologyString(
  catchTrialCount: number,
  falsePositiveCount: number,
  platform: 'web' | 'mobile'
): string {
  const platformNote = platform === 'web' 
    ? 'Web Audio API' 
    : 'React Native Expo Audio API with procedural tone generation'
    
  return `Clinical pure-tone screening protocol following ASHA school screening guidelines. Frequencies: ${SCREENING_FREQUENCIES.join(', ')} Hz (standard pure-tone air conduction screening frequencies). Presentation: pulsed tones (${PULSED_TONE_CONFIG.pulseDurationMs}ms pulses with ${PULSED_TONE_CONFIG.pulseGapMs}ms gaps, ${PULSED_TONE_CONFIG.pulseCount} pulses per trial) to improve detection and reduce listener fatigue. Catch trials: ${catchTrialCount} silent trials included to assess response reliability (false positive rate: ${falsePositiveCount}/${catchTrialCount}). Left/right ear tested separately with stereo headphones. Platform: ${platformNote}. IMPORTANT: Screening levels use relative device volume, NOT calibrated dB HL. Results indicate relative hearing sensitivity only, not absolute audiometric thresholds.`
}

/**
 * Create screening note/disclaimer
 */
export function createScreeningNote(): string {
  return 'This is a SCREENING TOOL using a clinical screening protocol, not a diagnostic audiological examination. Screening levels are relative device volumes, NOT calibrated dB HL. For diagnostic audiometry with calibrated equipment (ANSI S3.6, ISO 8253 standards), threshold determination, bone conduction, tympanometry, otoacoustic emissions, or speech audiometry, consult a licensed audiologist.'
}

/**
 * Ambient noise requirements text
 */
export const AMBIENT_NOISE_REQUIREMENTS = {
  title: 'Environmental Requirements',
  description: 'Clinical screening protocols require ambient noise levels below 50 dB for reliable results. Background noise can mask tones and cause false failures.',
  checklist: [
    'Find a quiet room away from traffic, conversations, or machinery',
    'Close windows and doors to reduce external noise',
    'Turn off fans, air conditioning, or other noise sources if possible',
    'Avoid testing in busy environments (cafeterias, hallways, open offices)',
    'Silence phone notifications and other devices',
  ],
  attestation: 'I am in a quiet environment suitable for hearing screening',
} as const

/**
 * Headphone requirements text
 */
export const HEADPHONE_REQUIREMENTS = {
  title: 'Headphone Check',
  description: 'Stereo headphones or earbuds are required for reliable left/right ear separation. Speakers will not provide accurate screening results.',
  instructions: [
    'Use stereo headphones or earbuds (not speakers)',
    'Ensure proper left/right channel orientation',
    'Test each ear to verify correct stereo separation',
  ],
} as const

/**
 * Calibration limitation disclaimer
 */
export const CALIBRATION_DISCLAIMER = 
  'This test uses relative device volumes, NOT calibrated dB HL. Results indicate relative hearing sensitivity only, not absolute hearing thresholds. For calibrated audiometric testing with standardized dB HL levels, consult an audiologist.'

/**
 * Clinical protocol references
 */
export const PROTOCOL_REFERENCES = {
  asha: 'American Speech-Language-Hearing Association (ASHA) School Screening Guidelines',
  frequencies: 'ASHA recommends screening at 1000, 2000, 4000 Hz minimum; 500 Hz often included',
  pulsedTones: 'Pulsed tone presentation improves detection and reduces false positives',
  catchTrials: 'Silent catch trials assess response reliability and false positive rate',
} as const
