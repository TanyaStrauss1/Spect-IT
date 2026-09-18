# Cover-Uncover Screening Test Plan

## Test Environment Setup

### Required Devices
- [ ] iOS device (iPhone 11 or later preferred)
- [ ] Android device (recent model with good front camera)
- [ ] Various lighting conditions

### Software Requirements
- [ ] Expo SDK 50 environment
- [ ] Expo Go app installed OR standalone build
- [ ] Latest code from branch `cursor/cover-uncover-screening-c51b`

### Test Data Preparation
- [ ] Active participant profile or test account
- [ ] Completed device qualification step
- [ ] Completed calibration step
- [ ] Completed alignment step

---

## Test Cases

### TC-1: Basic Flow - Happy Path

**Objective:** Verify complete cover-uncover test with proper technique

**Prerequisites:**
- User at alignment complete screen
- Camera permissions granted
- Face clearly visible

**Steps:**
1. Tap "Continue to Motility" from alignment results
2. Verify navigation to cover-uncover screen
3. Verify progress stepper shows "Cover Test" as current step
4. **Baseline Phase:**
   - Instruction: "Look straight ahead with both eyes open"
   - Keep face centered and stable
   - Wait for phase to complete (~5 frames captured)
5. **Cover Left Phase:**
   - Instruction: "Cover your LEFT eye with your hand"
   - Cover left eye completely with hand
   - Verify warning disappears when eye covered
   - Wait for phase to complete
6. **Uncover Left Phase:**
   - Instruction: "Remove your hand from left eye"
   - Remove hand from left eye
   - Wait for phase to complete
7. **Cover Right Phase:**
   - Instruction: "Cover your RIGHT eye with your hand"
   - Cover right eye completely with hand
   - Verify warning disappears when eye covered
   - Wait for phase to complete
8. **Uncover Right Phase:**
   - Instruction: "Remove your hand from right eye"
   - Remove hand from right eye
   - Wait for phase to complete
9. Verify results screen displays
10. Verify alignment score shown
11. Verify eye shift values displayed
12. Tap "Continue to Motility"
13. Verify navigation to motility screen

**Expected Results:**
- ✅ All phases complete without errors
- ✅ Results screen shows valid data
- ✅ No quality issues listed
- ✅ Continues to motility

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-2: Occlusion Detection - Left Eye

**Objective:** Verify occlusion detection warns when eye not covered

**Steps:**
1. Complete baseline phase
2. During cover-left phase, do NOT cover left eye
3. Observe warnings and feedback

**Expected Results:**
- ⚠️ Warning shown: "Left eye still visible - cover it completely"
- Phase does not progress
- User must properly cover eye to continue

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-3: Occlusion Detection - Right Eye

**Objective:** Verify occlusion detection warns when eye not covered

**Steps:**
1. Complete baseline, cover-left, uncover-left phases
2. During cover-right phase, do NOT cover right eye
3. Observe warnings and feedback

**Expected Results:**
- ⚠️ Warning shown: "Right eye still visible - cover it completely"
- Phase does not progress
- User must properly cover eye to continue

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-4: Head Movement Rejection

**Objective:** Verify quality gate rejects excessive head movement

**Steps:**
1. Start cover-uncover test
2. During any phase, move head significantly (>50mm)
3. Try to complete phase with head movement
4. Observe behavior

**Expected Results:**
- Frames rejected when head moves too much
- Phase requires more time to complete
- Quality issues may be reported in results

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-5: Face Detection Loss

**Objective:** Verify handling when face is lost

**Steps:**
1. Start cover-uncover test
2. Move face out of frame during capture
3. Observe warnings
4. Return face to frame
5. Continue test

**Expected Results:**
- "⚠️ Face not detected" warning appears
- Capture pauses when face not visible
- Resumes when face detected again
- Test can complete after recovery

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-6: Skip Functionality

**Objective:** Verify user can skip cover-uncover test

**Steps:**
1. Start cover-uncover test
2. Tap "Skip Test" button
3. Observe navigation

**Expected Results:**
- Navigates directly to motility screen
- `coverUncover` result is null in session
- Scan can complete without cover-uncover data

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-7: Retry After Quality Issues

**Objective:** Verify retry functionality works

**Steps:**
1. Complete test with deliberate quality issues (move head, poor coverage)
2. View results with quality issues listed
3. Tap "Retry Cover-Uncover"
4. Complete test properly

**Expected Results:**
- Tracker resets to baseline phase
- Can complete test successfully on retry
- New results replace previous attempt
- Repeat attempt count increments

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-8: Results Display - No Asymmetry

**Objective:** Verify results display when no asymmetry detected

**Steps:**
1. Complete test with proper technique (both eyes)
2. Review results screen

**Expected Results:**
- Alignment score: 60+ (high score)
- Eye shift values: Small magnitudes (<2°)
- No asymmetry warning banner
- Screening note: "No significant alignment shift detected"
- Reliability note displayed

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-9: Results Display - Asymmetry Detected

**Objective:** Verify results display when asymmetry present

**Prerequisites:** User with actual asymmetry, or simulated via manual manipulation

**Steps:**
1. Complete test (with asymmetry present)
2. Review results screen

**Expected Results:**
- Alignment score: <60 (lower score)
- Red "⚠️ Asymmetry Detected" banner shown
- Screening note recommends professional examination
- Reliability note displayed
- Eye shift values differ significantly between eyes

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-10: Poor Lighting Conditions

**Objective:** Verify behavior in dim lighting

**Steps:**
1. Test in dimly lit room
2. Attempt to complete cover-uncover test
3. Observe face detection quality

**Expected Results:**
- Face detection may be intermittent
- Quality scores may be lower
- More frames may be rejected
- Quality issues listed in results
- User can retry or skip

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-11: Bright/Outdoor Lighting

**Objective:** Verify behavior in bright lighting

**Steps:**
1. Test in bright lighting or outdoors
2. Complete cover-uncover test
3. Observe detection quality

**Expected Results:**
- Face detection works well
- High quality scores
- Test completes smoothly
- Minimal quality issues

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-12: Progress Stepper Integration

**Objective:** Verify progress stepper shows correct status

**Steps:**
1. Navigate through vision scan from start
2. Observe progress stepper at each stage

**Expected Results:**
- "Cover Test" step appears between Alignment and Motility
- Step is highlighted as current during cover-uncover
- Step shows checkmark after completion
- Correct positioning in sequence

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-13: Session State Integration

**Objective:** Verify cover-uncover data persists in session

**Steps:**
1. Complete cover-uncover test
2. Continue to motility
3. Check session state (via debug or final results)

**Expected Results:**
- `session.coverUncover` contains CoverUncoverResult
- Result includes frames, phaseData, shifts, asymmetryScore
- Data persists through subsequent steps
- Included in final VisionScanResult

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-14: Screening Summary Integration

**Objective:** Verify cover-uncover affects screening summary

**Steps:**
1. Complete full vision scan including cover-uncover
2. View final screening summary
3. Check if asymmetry is mentioned

**Expected Results:**
- If asymmetry detected, included in issues list
- Screening summary mentions "cover-uncover asymmetry"
- Professional exam recommended if asymmetry present

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-15: Edge Case - Wrong Eye Covered

**Objective:** Verify behavior when user covers wrong eye

**Steps:**
1. Reach cover-left phase
2. Cover RIGHT eye instead of left
3. Observe behavior

**Expected Results:**
- Warning continues: "Left eye still visible"
- Phase does not progress
- User realizes mistake and corrects

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-16: Edge Case - Both Eyes Covered

**Objective:** Verify behavior when both eyes covered

**Steps:**
1. During any phase, cover both eyes
2. Observe behavior

**Expected Results:**
- Face detection likely lost
- "⚠️ Face not detected" warning
- Capture pauses
- User can recover by uncovering

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-17: Camera Permissions

**Objective:** Verify camera permission handling

**Steps:**
1. Deny camera permissions
2. Attempt to access cover-uncover screen
3. Observe error handling

**Expected Results:**
- CameraRecovery component shown
- Error message about camera unavailable
- Options to retry or cancel
- Can recover if permissions granted

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-18: Navigation - Back Button

**Objective:** Verify back navigation from results

**Steps:**
1. Complete cover-uncover test
2. On results screen, tap "Cancel Scan"
3. Observe navigation

**Expected Results:**
- Returns to vision scan home screen
- Can resume or restart scan

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-19: Performance - Frame Capture Rate

**Objective:** Verify frame capture performance

**Steps:**
1. Run cover-uncover test
2. Monitor frame capture rate (150ms intervals)
3. Check for lag or dropped frames

**Expected Results:**
- Smooth capture at ~150ms intervals
- No significant lag
- UI remains responsive
- Phases complete in reasonable time (~5-10 seconds each)

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-20: Device Compatibility - iOS

**Objective:** Verify functionality on iOS devices

**Devices Tested:**
- [ ] iPhone with TrueDepth (Face ID)
- [ ] iPhone without TrueDepth
- [ ] iPad

**Expected Results:**
- Works on all iOS devices with front camera
- Face detection quality may vary
- Core functionality intact

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

### TC-21: Device Compatibility - Android

**Objective:** Verify functionality on Android devices

**Devices Tested:**
- [ ] High-end Android (Samsung Galaxy, Pixel)
- [ ] Mid-range Android
- [ ] Budget Android

**Expected Results:**
- Works on modern Android devices
- Face detection via Expo API
- Performance acceptable

**Actual Results:**
_[Fill in during testing]_

**Status:** ⬜ Pass ⬜ Fail ⬜ Blocked

---

## Regression Tests

### RT-1: Alignment Step Still Works

**Objective:** Verify alignment step not broken by changes

**Steps:**
1. Complete alignment step
2. Verify results display
3. Verify navigation goes to cover-uncover

**Expected:** No regression  
**Status:** ⬜ Pass ⬜ Fail

---

### RT-2: Motility Step Still Works

**Objective:** Verify motility step not broken

**Steps:**
1. Skip cover-uncover (or complete it)
2. Reach motility screen
3. Complete motility test

**Expected:** No regression  
**Status:** ⬜ Pass ⬜ Fail

---

### RT-3: Full Scan Completion

**Objective:** Verify full scan can complete with cover-uncover

**Steps:**
1. Complete full vision scan from start to finish
2. Include cover-uncover step
3. Verify final results

**Expected:** Scan completes successfully  
**Status:** ⬜ Pass ⬜ Fail

---

## Test Summary

**Total Test Cases:** 21  
**Core Tests:** 19  
**Regression Tests:** 2

**Execution Date:** __________  
**Tester:** __________  
**Build/Commit:** c95a042

### Results Summary
- **Passed:** _____ / 21
- **Failed:** _____ / 21
- **Blocked:** _____ / 21

### Critical Issues Found
_[List any critical issues]_

### Non-Critical Issues Found
_[List any minor issues]_

### Notes
_[Additional observations]_

---

## Sign-Off

- [ ] All critical tests passed
- [ ] Known issues documented
- [ ] Performance acceptable
- [ ] Ready for review/merge

**Tester Signature:** __________  
**Date:** __________
