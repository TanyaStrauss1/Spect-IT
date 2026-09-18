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
  description: 'ASHA school screening standard: PASS requires hearing ALL screening frequencies (500, 1000, 2000, 4000 Hz) in BOTH ears at screening level. REFER if ANY frequency missed in EITHER ear.',
  passDefinition: 'Heard all screening tones clearly in both ears',
  referDefinition: 'Missed one or more screening tones—audiological follow-up recommended',
  passCriteria: (leftCorrect: number, rightCorrect: number, totalFreqs: number) => {
    // Pass: heard all frequencies in both ears
    // Refer: missed any frequency in either ear
    return leftCorrect >= totalFreqs && rightCorrect >= totalFreqs
  },
  frequencyImportance: {
    500: 'Low frequency—important for vowels and speech understanding',
    1000: 'Mid frequency—standard hearing test reference',
    2000: 'High frequency—critical for consonant clarity',
    4000: 'High frequency—often earliest loss in noise-induced hearing damage',
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
  title: 'Ambient Noise Gate',
  description: 'Clinical screening protocols require ambient noise levels below 50 dB SPL for reliable results. Background noise can mask soft tones and cause false failures (incorrect "refer" outcomes).',
  checklist: [
    'Find a QUIET room away from traffic, conversations, or machinery',
    'Close windows and doors to reduce external noise',
    'Turn off fans, air conditioning, HVAC systems, or other noise sources',
    'Avoid testing in busy environments (cafeterias, hallways, open offices)',
    'Silence phone notifications and other devices',
    'Wait for intermittent noise (aircraft, sirens, construction) to stop',
  ],
  attestation: 'I confirm my environment is quiet enough for accurate hearing screening',
  warningNote: 'Testing in noisy environments produces unreliable results. This app CANNOT measure ambient noise levels—you are attesting that conditions meet clinical standards.',
  whyItMatters: 'Even quiet-seeming rooms can have noise that masks screening tones (HVAC hum, computer fans, distant traffic). Clinical booths achieve <40 dB SPL; home/office settings rarely do.',
} as const

/**
 * Headphone requirements text
 */
export const HEADPHONE_REQUIREMENTS = {
  title: 'Headphone Verification',
  description: 'Stereo headphones or earbuds are REQUIRED for reliable left/right ear separation. Speakers will NOT provide accurate screening results and may lead to false failures.',
  instructions: [
    'Use stereo headphones or earbuds (NOT speakers)',
    'Ensure proper left/right channel orientation',
    'Verify you can clearly identify which ear hears each tone',
    'Make sure headphones fit comfortably and securely',
  ],
  warningNote: 'Using speakers or improperly worn headphones invalidates the screening results.',
} as const

/**
 * Calibration limitation disclaimer
 */
export const CALIBRATION_DISCLAIMER = 
  '⚠️ CRITICAL LIMITATION: This test uses RELATIVE device volumes, NOT calibrated dB HL. Results indicate relative hearing sensitivity only, not absolute hearing thresholds or diagnostic-grade measurements. For calibrated audiometric testing with standardized dB HL levels (ANSI S3.6, ISO 8253), consult a licensed audiologist with calibrated equipment.'

/**
 * Banner messages for different contexts
 */
export const SCREENING_BANNERS = {
  notDiagnostic: {
    title: '⚠️ Screening Tool — Not Diagnostic',
    message: 'This is a BASIC SCREENING TOOL, not a diagnostic audiological examination. It cannot replace professional hearing evaluation by a licensed audiologist.',
    level: 'warning' as const,
  },
  calibrationLimitation: {
    title: '🔊 Volume Limitation — Not Calibrated dB HL',
    message: 'This test uses RELATIVE device volumes, NOT calibrated dB HL. Results indicate relative hearing sensitivity only, not absolute hearing thresholds. Professional audiometry uses calibrated transducers (ANSI S3.6, ISO 8253) to produce precise dB HL levels—this screening cannot.',
    level: 'error' as const,
  },
  resultsInterpretation: {
    title: '📊 Results Are Screening Pass/Refer Only',
    message: 'PASS means heard all screening tones at the test volume. REFER means missed one or more tones and should see an audiologist for comprehensive evaluation. This is NOT a diagnostic threshold audiogram.',
    level: 'info' as const,
  },
  requiresAudiologist: {
    title: '👨‍⚕️ When Professional Care Is Needed',
    message: 'For diagnostic audiometry with calibrated equipment, threshold determination, bone conduction, tympanometry, otoacoustic emissions, speech audiometry, or medical management, consult a licensed audiologist or ENT physician.',
    level: 'info' as const,
  },
} as const

/**
 * Clinical protocol references
 */
export const PROTOCOL_REFERENCES = {
  asha: 'American Speech-Language-Hearing Association (ASHA) School Screening Guidelines',
  frequencies: 'ASHA recommends screening at 1000, 2000, 4000 Hz minimum; 500 Hz often included',
  pulsedTones: 'Pulsed tone presentation improves detection and reduces false positives',
  catchTrials: 'Silent catch trials assess response reliability and false positive rate',
} as const
