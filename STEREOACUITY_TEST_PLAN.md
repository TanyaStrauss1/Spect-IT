# Stereoacuity Test - Test Plan

## Test Overview
New stereoacuity (binocular depth perception) screening test added to Spect-IT vision screening suite.

## Manual Test Checklist

### Prerequisites
- ✅ Web app builds successfully (`npm run build` in `/workspace/apps/web`)
- ✅ Dev server starts without errors (`npm run dev`)
- ✅ TypeScript compilation passes
- ⚠️ Red-cyan anaglyph 3D glasses required for actual stereo perception testing

### Test Flow

#### 1. Navigation & Discovery
- [ ] Visit homepage `/`
- [ ] Verify "Stereoacuity (Depth Perception)" card appears in eye screening section
- [ ] Card shows: 🕶️ icon, "3-5 min" duration, description mentioning red-cyan glasses
- [ ] Click card navigates to `/tests/stereoacuity`

#### 2. Introduction Screen
- [ ] Page loads with title "Stereoacuity (Binocular Depth) Screening"
- [ ] Red warning banner: "REQUIRES RED-CYAN ANAGLYPH GLASSES"
- [ ] Yellow warning banner: "Screening Only - Not Diagnostic"
- [ ] Test setup section lists required equipment (anaglyph glasses, distance, correction, lighting)
- [ ] "How It Works" section explains random-dot stereogram method
- [ ] Clinical note explains stereoacuity measurement in arcseconds
- [ ] Calibration modal available (click screen icon if present)
- [ ] "Continue" button advances to glasses check

#### 3. Glasses Check Screen
- [ ] Title: "Anaglyph Glasses Check"
- [ ] Red banner: "Confirm You Have Anaglyph Glasses"
- [ ] Requirements listed: red over LEFT eye, cyan over RIGHT eye
- [ ] Note about glasses availability and cost
- [ ] Two buttons:
  - "Yes, I Have Anaglyph Glasses - Start Test" → starts test
  - "No Glasses Available - Return to Tests" → returns to `/tests`

#### 4. Test Screen (Main Testing)
- [ ] Yellow banner at top: viewing conditions reminder
- [ ] Progress indicator shows current level and target arcsec
- [ ] Random-dot stereogram canvas displays (400x400px, black background with red/cyan dots)
- [ ] Canvas shows procedurally generated random dots
- [ ] Question: "What shape do you see floating in depth?"
- [ ] Five response buttons:
  - ⭕ Circle
  - ⬜ Square
  - 🔺 Triangle
  - 🔶 Diamond
  - ❌ No Shape Visible
- [ ] Technical info below canvas: disparity in pixels, viewing distance
- [ ] Selecting a shape advances to next level
- [ ] Test progresses from easy (400 arcsec) to difficult (20 arcsec)
- [ ] Test stops after 3 consecutive failures or 10 trials

#### 5. Results Screen
- [ ] Checkmark (✓) for NORMAL category or warning (⚠️) for REDUCED/ABSENT
- [ ] Title: "Test Complete!"
- [ ] Result card shows:
  - Stereo threshold in arcseconds (or "No Stereopsis Detected")
  - Category: NORMAL, REDUCED, or ABSENT
  - Interpretation text explaining result
- [ ] Blue banner: screening result methodology
- [ ] Yellow banner: clinical interpretation thresholds
  - Normal: ≤60 arcsec
  - Reduced: 60-400 arcsec
  - Absent/poor: >400 arcsec or none
- [ ] Red referral banner appears if REDUCED or ABSENT (recommends comprehensive exam)
- [ ] Purple disclaimer banner with full screening disclaimer
- [ ] Two navigation buttons:
  - "Dashboard" → `/dashboard`
  - "Home" → `/`

### Data Persistence
- [ ] Test result saved to Supabase `test_results` table
- [ ] Result includes:
  - `test_type`: 'stereoacuity'
  - `test_data`: full test result object
  - `results`: threshold, category, hasAnaglyphGlasses
  - `participant_id`: if active participant selected
- [ ] Journey tracking: test marked complete with `TEST_TYPE_ID.STEREOACUITY`

### Authentication & Participant Flow
- [ ] Unauthenticated user redirected to `/auth/signin`
- [ ] Authenticated user without active participant sees alert and redirected to `/dashboard/participants` (if participants exist)
- [ ] Authenticated user with active participant can complete test

### Calibration
- [ ] Test uses screen calibrator (CalibrationModal)
- [ ] Default calibration used if none set (40 cm distance, default pxPerMm)
- [ ] Disparity levels calculated based on calibration (pxPerMm, distanceCm)
- [ ] Calibration affects disparity pixel values appropriately

### Edge Cases
- [ ] Test handles no responses gracefully (result: ABSENT, threshold: null)
- [ ] Test handles all incorrect responses (result: ABSENT, threshold: null)
- [ ] Test handles mixed correct/incorrect responses (calculates finest correct threshold)
- [ ] Test saves even if Supabase insert fails (error logged, user still sees results)

## Expected Results

### Normal Flow (with anaglyph glasses)
1. User starts test with glasses
2. Can identify shapes at coarse disparities (400-100 arcsec)
3. May struggle at fine disparities (40-20 arcsec)
4. Result shows threshold in range 20-400 arcsec
5. Category: NORMAL if ≤60 arcsec, REDUCED if >60 arcsec

### Without Anaglyph Glasses
1. User cannot see depth effect in random-dot stereogram
2. Random-dot pattern looks like flat red and cyan dots
3. User cannot identify shapes reliably (or sees them monocularly by brightness cues)
4. Result likely shows ABSENT category
5. Clear disclaimers emphasize glasses requirement

## Technical Validation

### Build & Types
```bash
cd /workspace
npm run build
# Should complete successfully with no errors
# Route /tests/stereoacuity should be listed in build output
```

### Package Structure
- Core logic: `packages/cv/src/tests/stereoacuity.ts`
- Test type: `packages/cv/src/test-types.ts`
- Exports: `packages/cv/src/index.ts`
- Web page: `apps/web/src/app/tests/stereoacuity/page.tsx`
- Component: `apps/web/src/components/RandomDotStereogram.tsx`
- Registry: `apps/web/src/components/sections/TestGridSection.tsx`

### Medical Disclaimers Present
- ✅ Screening only, not diagnostic
- ✅ Requires anaglyph glasses
- ✅ Results depend on viewing conditions
- ✅ Recommends clinical testing for reduced/absent results
- ✅ No claims about precision/dispensable results
- ✅ No proprietary test artwork copied

## Known Limitations (By Design)

1. **Anaglyph glasses required** — not provided, user must obtain separately (~$2-5 online)
2. **Screen-based method** — less precise than clinical stereoacuity tests (Randot, Titmus, TNO)
3. **Calibration dependent** — results affected by screen size, resolution, viewing distance
4. **Screening threshold** — provides categorical estimate, not precise clinical measurement
5. **No free-fusion option** — future enhancement could add parallel/cross-eyed viewing

## Sign-off

- [ ] All manual test steps pass
- [ ] Build succeeds without errors
- [ ] TypeScript types valid
- [ ] Medical disclaimers appropriate
- [ ] No proprietary content used
- [ ] Test registered and discoverable from homepage
- [ ] Results persist correctly

**Tested by:** _____________  
**Date:** _____________  
**Notes:** _____________
