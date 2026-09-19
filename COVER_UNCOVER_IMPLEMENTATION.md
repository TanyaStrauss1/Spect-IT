# Cover-Uncover Screening Implementation Summary

## Overview
Implemented camera-verified monocular occlusion alignment screening for the Spect-IT vision scan flow. This adds a clinical cover-uncover test that detects eye alignment asymmetries by having users alternately cover each eye while the camera captures position changes.

**Pull Request:** [#108](https://github.com/TanyaStrauss1/Spect-IT/pull/108)  
**Branch:** `cursor/cover-uncover-screening-c51b`  
**Status:** Draft PR created, ready for testing and review

## Features Implemented

### 1. Clinical Screening Flow
- **5-phase test sequence:**
  - **Baseline:** Both eyes open, establish reference positions
  - **Cover left:** Left eye covered, verify occlusion via camera
  - **Uncover left:** Left eye uncovered, measure position shift
  - **Cover right:** Right eye covered, verify occlusion via camera
  - **Uncover right:** Right eye uncovered, measure position shift

### 2. Camera-Based Occlusion Verification
- Real-time detection using Expo face/eye landmarks
- Heuristic approach with explicit limitations disclosure
- Validates eye is actually covered before accepting frames
- Provides user feedback when occlusion not detected

### 3. Quality Gates
- **Head displacement:** Rejects frames if head moves >50mm from baseline
- **Minimum frames:** Requires 5+ valid frames per phase
- **Occlusion confidence:** 0.6+ confidence threshold for cover phases
- **Quality score:** 0.5+ threshold for frame acceptance

### 4. Screening Assessment
- Calculates eye position shifts (horizontal & vertical, in degrees)
- Computes asymmetry score (0-100, higher = more asymmetry detected)
- Flags asymmetry >40 score (~2° threshold) for professional exam
- **Screening-only language:** No diagnosis claims (no "strabismus" etc.)

### 5. Honest Limitations
- Explicit reliability note in results
- Acknowledges heuristic-based detection may not be perfect
- States eye position estimates are approximate
- Recommends professional examination for definitive assessment

## Technical Architecture

### New Files Created

#### `packages/cv/src/vision-scan/cover-uncover-tracker.ts` (360 lines)
Core tracking logic for cover-uncover test:
- `CoverUncoverTracker` class
  - Manages 5-phase capture flow
  - Applies quality gates to each frame
  - Calculates eye position shifts
  - Computes asymmetry scores
- `detectOcclusion()` helper function
  - Detects if eyes are visible/covered
  - Returns confidence scores
  - Honest about detection methods

#### `apps/mobile/app/vision-scan/cover-uncover.tsx` (634 lines)
React Native screen component:
- Expo Camera integration with face detection
- Phase-based UI with animated instructions
- Real-time feedback for occlusion verification
- Results display with shift measurements
- Skip option (test is optional)
- Retry functionality

### Modified Files

#### Type Definitions
**`packages/cv/src/vision-scan/types.ts`**
- Added `CoverUncoverPhase` enum type
- Added `OcclusionStatus` interface
- Added `CoverUncoverFrame` interface
- Added `CoverUncoverResult` interface
- Updated `ModuleName` to include 'cover-uncover'
- Updated `VisionScanResult` to include optional `coverUncover` field

**`packages/cv/src/vision-scan/session-types.ts`**
- Added `CoverUncoverResult` to imports
- Added `coverUncover` field to `VisionScanSessionState`
- Added `setCoverUncover` action to `VisionScanSessionActions`

#### Integration Points
**`apps/mobile/lib/vision-scan/vision-scan-context.tsx`**
- Added `coverUncover` to session state
- Added `setCoverUncover` callback
- Updated screening summary to include cover-uncover asymmetry
- Updated `buildFinalResult` to include cover-uncover data

**`apps/mobile/components/vision-scan/ProgressStepper.tsx`**
- Added 'cover-uncover' to step enumeration
- Added "Cover Test" label in progress UI
- Positioned after Alignment, before Motility

**`apps/mobile/app/vision-scan/alignment.tsx`**
- Changed navigation from `/vision-scan/motility` to `/vision-scan/cover-uncover`

#### Package Exports
**`packages/cv/src/vision-scan/index.ts`**
- Exported `CoverUncoverTracker` class
- Exported `detectOcclusion` function

**`packages/cv/src/index.ts`**
- Added all cover-uncover types to main export
- Exported tracker and helper function

## Vision Scan Flow Integration

### Updated Sequence
```
Qualification → Calibration → Alignment → Cover-Uncover → Motility → Convergence → Quality Review
```

The cover-uncover test is positioned:
- **After Alignment:** Builds on resting gaze baseline
- **Before Motility:** Complements with dynamic occlusion assessment
- **Optional:** Can be skipped without blocking scan completion

### Session State
The `VisionScanSession` now includes:
```typescript
{
  // ... other fields
  alignment: AlignmentResult | null,
  coverUncover: CoverUncoverResult | null,  // NEW: optional field
  motility: MotilityResult | null,
  // ... other fields
}
```

## User Experience

### Instructions by Phase
1. **Baseline:** "Look straight ahead with both eyes open"
2. **Cover left:** "Cover your LEFT eye with your hand"
3. **Uncover left:** "Remove your hand from left eye"
4. **Cover right:** "Cover your RIGHT eye with your hand"
5. **Uncover right:** "Remove your hand from right eye"

### Real-time Feedback
- "⚠️ Face not detected" if camera loses face
- "⚠️ Left eye still visible - cover it completely" during cover-left phase
- "⚠️ Right eye still visible - cover it completely" during cover-right phase
- Progress indicator: "Step X of 5"
- "Keep your head still" reminder

### Results Display
- **Alignment Score:** (100 - asymmetryScore), displayed prominently
- **Eye Shifts:** Magnitude of shift for each eye in degrees
- **Asymmetry Warning:** Red banner if asymmetry detected
- **Screening Note:** Context-appropriate message
- **Reliability Note:** Honest limitations disclaimer
- **Quality Issues:** List of any problems encountered

### Options
- **Continue:** Proceed to next test (Motility)
- **Retry:** Repeat cover-uncover if quality issues
- **Skip:** Bypass test entirely (optional test)
- **Cancel Scan:** Exit vision scan flow

## Screening Language (No Diagnosis)

### ✅ Appropriate Phrases Used
- "Eye alignment variation detected during cover-uncover test"
- "Professional eye examination recommended to assess ocular alignment"
- "Asymmetry detected"
- "Screening-only assessment"

### ❌ Avoided Diagnosis Claims
- Never says "strabismus detected"
- Never says "you have misalignment"
- Never provides specific clinical diagnoses
- Always frames as "screening" not "diagnosis"

## Honest Limitations Disclosed

From `CoverUncoverResult.reliabilityNote`:
> "Note: Occlusion detection is based on camera heuristics and may not be fully accurate. Eye position estimates are approximate. Professional examination recommended for definitive assessment."

### Known Limitations Acknowledged
1. **Occlusion detection is heuristic:**
   - May fail if hand/cover matches skin tone
   - Cannot perfectly distinguish closed vs covered eyes
   - Relies on face detector's eye landmark visibility

2. **Eye position estimates are approximate:**
   - Based on pixel-to-degree conversion
   - Accuracy depends on face detection quality
   - Not equivalent to clinical instruments

3. **Requires user compliance:**
   - User must follow instructions correctly
   - Must keep head still
   - Results invalid if not performed properly

## Testing Recommendations

### Manual Testing Checklist
- [ ] Camera initialization succeeds on iOS/Android
- [ ] Face detection works in various lighting
- [ ] Phase progression: baseline → cover-left → uncover-left → cover-right → uncover-right
- [ ] Occlusion verification flags uncovered eye
- [ ] Warning displays when eye not covered
- [ ] Head movement rejection works (>50mm displacement)
- [ ] Results screen shows shift values correctly
- [ ] Asymmetry flag appears when appropriate
- [ ] Skip button allows bypassing test
- [ ] Retry works after quality issues
- [ ] Navigation flows to motility screen
- [ ] TypeScript compiles without errors

### Device Testing
- [ ] iOS with TrueDepth camera
- [ ] iOS without TrueDepth
- [ ] Android with front camera
- [ ] Various screen sizes (phones/tablets)

### Lighting Conditions
- [ ] Bright indoor lighting
- [ ] Dim lighting
- [ ] Outdoor lighting
- [ ] Backlit conditions

### Edge Cases
- [ ] User covers wrong eye
- [ ] User covers both eyes
- [ ] User moves head during test
- [ ] Camera loses face briefly
- [ ] User doesn't cover eye completely

## Files Changed Summary

### Created (2 files, 994 lines)
- `packages/cv/src/vision-scan/cover-uncover-tracker.ts` (360 lines)
- `apps/mobile/app/vision-scan/cover-uncover.tsx` (634 lines)

### Modified (7 files, 34 line changes)
- `packages/cv/src/vision-scan/types.ts` (+79 lines)
- `packages/cv/src/vision-scan/session-types.ts` (+6 lines)
- `packages/cv/src/vision-scan/index.ts` (+1 line)
- `packages/cv/src/index.ts` (+6 lines)
- `apps/mobile/lib/vision-scan/vision-scan-context.tsx` (+11 lines)
- `apps/mobile/components/vision-scan/ProgressStepper.tsx` (+1 line)
- `apps/mobile/app/vision-scan/alignment.tsx` (+1 line)

**Total:** 1,028 insertions, 0 deletions

## Commit History
- **6c8c54e** - "Add cover-uncover (occlusion) screening test to vision scan"

## Pull Request
- **URL:** https://github.com/TanyaStrauss1/Spect-IT/pull/108
- **Status:** Draft
- **Title:** "Add cover-uncover (occlusion) screening test to vision scan"
- **Base:** main
- **Branch:** cursor/cover-uncover-screening-c51b

## Next Steps

### Before Merging
1. **Manual device testing** with Expo Go or standalone build
2. **Verify TypeScript compilation** across mobile/web
3. **Test occlusion detection accuracy** in various conditions
4. **Review screening language** with clinical/legal team
5. **Performance testing** on older devices
6. **Accessibility review** for screen readers

### Future Enhancements (Out of Scope)
- Machine learning-based occlusion detection
- More sophisticated eye tracking algorithms
- Integration with device sensors (if available)
- Calibration adjustments based on results
- Historical tracking of cover-uncover results
- Export to clinical reports

## References
- **Invention Disclosure:** §§19, 62 (monocular occlusion alignment)
- **Expo Camera API:** https://docs.expo.dev/versions/latest/sdk/camera/
- **Expo Face Detector:** https://docs.expo.dev/versions/latest/sdk/facedetector/
- **Clinical Cover-Uncover Test:** Standard ophthalmology screening procedure

## Conclusion

This implementation provides a functional draft of camera-verified cover-uncover screening for the Spect-IT mobile app. The test is:
- **Clinically-inspired:** Based on standard cover-uncover procedure
- **Camera-verified:** Uses face/eye detection to validate occlusion
- **Quality-gated:** Rejects poor quality frames
- **Honest:** Explicit about limitations and approximate nature
- **Screening-only:** No diagnosis claims
- **Optional:** Can be skipped without blocking scan
- **Well-integrated:** Fits naturally in vision scan flow

Ready for testing, review, and iteration.
