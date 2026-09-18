/**
 * Cover-Uncover (Occlusion) Screening Tracker
 * 
 * Camera-verified monocular occlusion alignment screening.
 * Instructs user to alternately cover left and right eyes, verifying occlusion
 * via face/hand/eye visibility heuristics.
 * 
 * Key features:
 * - Phased capture: baseline → cover-left → uncover-left → cover-right → uncover-right
 * - Occlusion verification via eye landmark visibility + confidence heuristics
 * - Quality gates: reject if cover not detected or head moved excessively
 * - Screening-only language: flags asymmetry, no strabismus diagnosis
 * 
 * HONEST LIMITATIONS:
 * - Occlusion detection is heuristic-based (not perfect)
 * - Eye position estimates are approximate
 * - Results should be confirmed by professional examination
 */

import type { 
  CoverUncoverFrame, 
  CoverUncoverResult, 
  CoverUncoverPhase,
  OcclusionStatus,
  EyePosition 
} from './types'

export class CoverUncoverTracker {
  private frames: CoverUncoverFrame[] = []
  private useSensorData: boolean
  private currentPhase: CoverUncoverPhase = 'baseline'
  private baselineHeadPosition: { x: number; y: number; z: number } | null = null
  
  // Quality thresholds
  private readonly MIN_FRAMES_PER_PHASE = 5
  private readonly OCCLUSION_CONFIDENCE_THRESHOLD = 0.6
  private readonly HEAD_DISPLACEMENT_LIMIT = 50 // mm
  private readonly QUALITY_THRESHOLD = 0.5
  
  // Baseline eye positions for shift calculation
  private baselineLeftEye: EyePosition | null = null
  private baselineRightEye: EyePosition | null = null

  constructor(useSensorData: boolean) {
    this.useSensorData = useSensorData
  }

  /**
   * Set current phase of the cover-uncover test
   */
  setPhase(phase: CoverUncoverPhase): void {
    this.currentPhase = phase
  }

  getCurrentPhase(): CoverUncoverPhase {
    return this.currentPhase
  }

  /**
   * Add frame with quality gates:
   * - Quality check (confidence > threshold)
   * - Head displacement check (shouldn't move too much from baseline)
   * - Occlusion verification (for cover phases, eye should be covered)
   */
  addFrame(
    frame: CoverUncoverFrame,
    faceBounds?: { x: number; y: number; width: number; height: number; z?: number }
  ): boolean {
    // Gate 1: Quality threshold
    if (frame.quality < this.QUALITY_THRESHOLD) {
      return false
    }

    // Gate 2: Head displacement limit (set baseline on first frame)
    if (!this.baselineHeadPosition && faceBounds) {
      this.baselineHeadPosition = {
        x: faceBounds.x + faceBounds.width / 2,
        y: faceBounds.y + faceBounds.height / 2,
        z: faceBounds.z || 0
      }
    }

    if (this.baselineHeadPosition && faceBounds) {
      const dx = faceBounds.x + faceBounds.width / 2 - this.baselineHeadPosition.x
      const dy = faceBounds.y + faceBounds.height / 2 - this.baselineHeadPosition.y
      const displacement = Math.sqrt(dx * dx + dy * dy)
      
      // Rough conversion: pixels to mm (depends on distance, but approximate)
      const displacementMm = displacement * 0.5
      
      if (displacementMm > this.HEAD_DISPLACEMENT_LIMIT) {
        frame.rejected = true
        frame.quality = 0.3
        return false
      }
    }

    // Gate 3: Occlusion verification for cover phases
    if (this.currentPhase === 'cover-left') {
      if (frame.occlusion.leftEyeVisible && 
          frame.occlusion.leftEyeOcclusionConfidence < this.OCCLUSION_CONFIDENCE_THRESHOLD) {
        // Left eye should be covered but isn't
        return false
      }
    } else if (this.currentPhase === 'cover-right') {
      if (frame.occlusion.rightEyeVisible && 
          frame.occlusion.rightEyeOcclusionConfidence < this.OCCLUSION_CONFIDENCE_THRESHOLD) {
        // Right eye should be covered but isn't
        return false
      }
    }

    // Store baseline eye positions during baseline phase
    if (this.currentPhase === 'baseline' && !this.baselineLeftEye && frame.leftEye) {
      this.baselineLeftEye = frame.leftEye
    }
    if (this.currentPhase === 'baseline' && !this.baselineRightEye && frame.rightEye) {
      this.baselineRightEye = frame.rightEye
    }

    this.frames.push(frame)
    return true
  }

  /**
   * Get frame count for current phase
   */
  getPhaseFrameCount(phase: CoverUncoverPhase): number {
    return this.frames.filter(f => f.phase === phase && !f.rejected).length
  }

  /**
   * Check if current phase has sufficient frames
   */
  isPhaseComplete(phase: CoverUncoverPhase): boolean {
    return this.getPhaseFrameCount(phase) >= this.MIN_FRAMES_PER_PHASE
  }

  /**
   * Compute final result
   */
  computeResult(): CoverUncoverResult {
    const qualityIssues: string[] = []
    
    // Group frames by phase
    const phaseData: Record<CoverUncoverPhase, CoverUncoverFrame[]> = {
      'baseline': [],
      'cover-left': [],
      'uncover-left': [],
      'cover-right': [],
      'uncover-right': []
    }
    
    for (const frame of this.frames) {
      if (!frame.rejected) {
        phaseData[frame.phase].push(frame)
      }
    }

    // Check for sufficient data in each phase
    const phases: CoverUncoverPhase[] = ['baseline', 'cover-left', 'uncover-left', 'cover-right', 'uncover-right']
    for (const phase of phases) {
      if (phaseData[phase].length < this.MIN_FRAMES_PER_PHASE) {
        qualityIssues.push(`Insufficient frames in ${phase} phase (${phaseData[phase].length}/${this.MIN_FRAMES_PER_PHASE})`)
      }
    }

    // Calculate eye position shifts
    let leftEyeShift: { horizontal: number; vertical: number } | null = null
    let rightEyeShift: { horizontal: number; vertical: number } | null = null

    // Left eye shift: compare baseline to uncover-left
    if (this.baselineLeftEye && phaseData['uncover-left'].length > 0) {
      const uncoverLeftFrames = phaseData['uncover-left'].filter(f => f.leftEye)
      if (uncoverLeftFrames.length > 0) {
        const avgUncoverX = uncoverLeftFrames.reduce((sum, f) => sum + (f.leftEye?.x || 0), 0) / uncoverLeftFrames.length
        const avgUncoverY = uncoverLeftFrames.reduce((sum, f) => sum + (f.leftEye?.y || 0), 0) / uncoverLeftFrames.length
        
        leftEyeShift = {
          horizontal: avgUncoverX - this.baselineLeftEye.x,
          vertical: avgUncoverY - this.baselineLeftEye.y
        }
      }
    }

    // Right eye shift: compare baseline to uncover-right
    if (this.baselineRightEye && phaseData['uncover-right'].length > 0) {
      const uncoverRightFrames = phaseData['uncover-right'].filter(f => f.rightEye)
      if (uncoverRightFrames.length > 0) {
        const avgUncoverX = uncoverRightFrames.reduce((sum, f) => sum + (f.rightEye?.x || 0), 0) / uncoverRightFrames.length
        const avgUncoverY = uncoverRightFrames.reduce((sum, f) => sum + (f.rightEye?.y || 0), 0) / uncoverRightFrames.length
        
        rightEyeShift = {
          horizontal: avgUncoverX - this.baselineRightEye.x,
          vertical: avgUncoverY - this.baselineRightEye.y
        }
      }
    }

    // Calculate asymmetry score
    let asymmetryScore = 0
    let asymmetryDetected = false

    if (leftEyeShift && rightEyeShift) {
      const leftMagnitude = Math.sqrt(leftEyeShift.horizontal ** 2 + leftEyeShift.vertical ** 2)
      const rightMagnitude = Math.sqrt(rightEyeShift.horizontal ** 2 + rightEyeShift.vertical ** 2)
      
      // Asymmetry = difference in shift magnitudes
      const asymmetryDiff = Math.abs(leftMagnitude - rightMagnitude)
      
      // Score 0-100 (higher = more asymmetry)
      // Thresholds: < 2° = minimal, 2-5° = moderate, > 5° = significant
      asymmetryScore = Math.min(100, asymmetryDiff * 20)
      asymmetryDetected = asymmetryScore > 40 // ~2° threshold
    } else if (leftEyeShift || rightEyeShift) {
      // Only one eye measured - can't assess asymmetry reliably
      qualityIssues.push('Incomplete eye position data for asymmetry assessment')
    }

    // Generate screening note
    let screeningNote: string
    if (qualityIssues.length > 0) {
      screeningNote = `Cover-uncover screening incomplete. Issues: ${qualityIssues.join(', ')}. Repeat test or consult eye care professional.`
    } else if (asymmetryDetected) {
      screeningNote = 'Eye alignment variation detected during cover-uncover test. Professional eye examination recommended to assess ocular alignment.'
    } else {
      screeningNote = 'No significant alignment shift detected during cover-uncover screening.'
    }

    // Reliability note (honest about limitations)
    const reliabilityNote = 'Note: Occlusion detection is based on camera heuristics and may not be fully accurate. Eye position estimates are approximate. Professional examination recommended for definitive assessment.'

    return {
      timestamp: Date.now(),
      frames: this.frames,
      phaseData,
      leftEyeShift,
      rightEyeShift,
      asymmetryDetected,
      asymmetryScore,
      screeningNote,
      qualityIssues,
      usedSensorData: this.useSensorData,
      reliabilityNote
    }
  }

  reset(): void {
    this.frames = []
    this.currentPhase = 'baseline'
    this.baselineHeadPosition = null
    this.baselineLeftEye = null
    this.baselineRightEye = null
  }
}

/**
 * Detect occlusion status from face detection data
 * 
 * Heuristic approach (honest about limitations):
 * 1. Check if eye landmarks are detected
 * 2. Check if eye region brightness is significantly reduced (if data available)
 * 3. Estimate confidence based on landmark visibility
 * 
 * LIMITATIONS:
 * - Not perfect: may fail if hand/cover matches skin tone
 * - Relies on face detector's eye landmark detection
 * - Cannot distinguish between closed eyes vs covered eyes perfectly
 */
export function detectOcclusion(
  leftEyeDetected: boolean,
  rightEyeDetected: boolean,
  faceDetected: boolean,
  leftEyeLandmarks?: any,
  rightEyeLandmarks?: any
): OcclusionStatus {
  // Default: both eyes visible
  let leftEyeVisible = leftEyeDetected
  let rightEyeVisible = rightEyeDetected
  let leftEyeOcclusionConfidence = 0
  let rightEyeOcclusionConfidence = 0
  let detectionMethod: 'eye-landmarks' | 'heuristic' | 'failed' = 'heuristic'

  if (!faceDetected) {
    // No face detected - assume both covered or face not visible
    return {
      leftEyeVisible: false,
      rightEyeVisible: false,
      leftEyeOcclusionConfidence: 1.0,
      rightEyeOcclusionConfidence: 1.0,
      detectionMethod: 'failed'
    }
  }

  // Method 1: Eye landmarks presence (primary)
  if (leftEyeLandmarks && leftEyeLandmarks.length > 0) {
    detectionMethod = 'eye-landmarks'
    leftEyeVisible = true
    leftEyeOcclusionConfidence = 0.1 // Low confidence of occlusion if landmarks present
  } else if (leftEyeDetected === false) {
    leftEyeVisible = false
    leftEyeOcclusionConfidence = 0.7 // Moderate confidence if no landmarks
  }

  if (rightEyeLandmarks && rightEyeLandmarks.length > 0) {
    detectionMethod = 'eye-landmarks'
    rightEyeVisible = true
    rightEyeOcclusionConfidence = 0.1
  } else if (rightEyeDetected === false) {
    rightEyeVisible = false
    rightEyeOcclusionConfidence = 0.7
  }

  return {
    leftEyeVisible,
    rightEyeVisible,
    leftEyeOcclusionConfidence,
    rightEyeOcclusionConfidence,
    detectionMethod
  }
}
