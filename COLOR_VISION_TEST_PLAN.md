# Color Vision Screening Test - Test Plan

## Overview
This feature adds a professional color vision screening test to both web and mobile apps using generated pseudoisochromatic plates (Ishihara-style).

## Important Notes

### NOT Copyrighted Materials
- **The plates are NOT copyrighted Ishihara plates**
- All plates are algorithmically generated using SVG/React Native SVG
- Uses original number patterns and color palettes
- Safe for commercial use
- Documented in code comments

### Screening Disclaimer
- All test flows include prominent screening disclaimers
- Results labeled as "screening" not "diagnosis"
- Recommendations prompt users to consult eye care professionals
- Follows the same medical disclaimer pattern as the acuity test

## Prerequisites

1. **Supabase Setup** (from TEST_VERTICAL_SLICE.md):
   - Fresh Supabase project or existing project with all migrations
   - Run migration `20260910180000_auth_user_id_and_rls.sql` (adds user_id column)
   - Set up environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `EXPO_PUBLIC_SUPABASE_URL` (for mobile)
     - `EXPO_PUBLIC_SUPABASE_ANON_KEY` (for mobile)

2. **Dependencies**:
   ```bash
   npm install
   cd apps/web && npm install
   cd apps/mobile && npm install
   ```

3. **User Account**:
   - Create a test user account via signup
   - Required for saving test results

## Test Cases

### Web App (`/tests/color-vision`)

#### 1. Navigation & Discovery
- [ ] Home page shows "Color Vision" test card in test grid
- [ ] Card description mentions "pseudoisochromatic plates"
- [ ] Card shows duration "2-3 min" and 🎨 icon
- [ ] Clicking card navigates to `/tests/color-vision`

#### 2. Instructions Screen
- [ ] Shows 🎨 emoji and "Color Vision Screening" title
- [ ] Displays blue info box with screening disclaimer
- [ ] Lists 6 clear instructions
- [ ] Shows yellow warning box about test environment/screen quality
- [ ] "Begin Test" button is clearly visible
- [ ] Clicking "Begin Test" starts the test

#### 3. Test Flow (8 Plates)
**For each plate:**
- [ ] Shows "Plate X of 8" badge
- [ ] Displays "What number do you see?" instruction
- [ ] Renders colored circular plate with dot pattern
- [ ] Shows note "Generated pseudoisochromatic plate (not copyrighted Ishihara)"
- [ ] Input field accepts numeric input
- [ ] "Submit Answer" button enabled when input present
- [ ] "Cannot See" button always enabled
- [ ] Press Enter submits answer
- [ ] Progress bar updates after each submission

**Test Sequence:**
1. Plate 1: Control (12) - high contrast red/green
2. Plate 2: Normal (8) - red-green screening
3. Plate 3: Protanopia (6) - protan deficiency
4. Plate 4: Normal (45) - red-green screening
5. Plate 5: Deuteranopia (5) - deutan deficiency
6. Plate 6: Normal (73) - red-green screening
7. Plate 7: Normal (2) - red-green screening
8. Plate 8: Control (16) - high contrast

#### 4. Results Screen
- [ ] Shows ✓ checkmark and "Screening Complete!" title
- [ ] Displays "Results saved" or "Saving results..." status
- [ ] Shows screening result in purple box (e.g., "Normal color vision")
- [ ] Displays "Plates Correct: X/8"
- [ ] Displays "Control Plates: X/2"
- [ ] Shows purple recommendation box with detailed guidance
- [ ] Displays blue disclaimer box about screening vs. diagnosis
- [ ] "View Dashboard" button navigates to dashboard
- [ ] "Home" button navigates to home

**Result Scenarios to Test:**
- **All correct**: "Normal color vision"
- **Control plates wrong**: "Test inconclusive"
- **No normal plates correct**: "Possible red-green color vision deficiency detected"
- **Some normal plates wrong**: "Possible color vision deficiency detected"

#### 5. Dashboard Integration
- [ ] Dashboard shows color vision test results
- [ ] Result card displays:
  - Test type: "Color Vision"
  - Test name badge: "Pseudoisochromatic Plate Test"
  - Screening result (e.g., "Normal color vision")
  - Plates Correct: X/8
  - Control Plates: X/2
  - Test date
- [ ] Dashboard "Color Vision Test" button (purple) navigates to test
- [ ] Results ordered by date (newest first)
- [ ] Multiple color vision tests show correctly

#### 6. Database Verification
```sql
-- Check test_results table
SELECT 
  id, user_id, user_email, test_type, test_name, 
  score, test_data->>'screeningResult' as result,
  created_at
FROM test_results 
WHERE test_type = 'Color Vision'
ORDER BY created_at DESC;
```

Expected fields:
- `test_type`: "Color Vision"
- `test_name`: "Pseudoisochromatic Plate Test"
- `score`: Number of correct answers (0-8)
- `test_data`: JSON with:
  - `screeningResult`: String result
  - `recommendations`: String
  - `platesCorrect`: Number
  - `platesTotal`: 8
  - `controlPlatesCorrect`: Number
  - `normalPlatesCorrect`: Number
  - `responses`: Array of plate responses

### Mobile App (`/test/color-vision`)

#### 1. Navigation
- [ ] Home screen shows "🎨 Color Vision Test" button (purple)
- [ ] Button positioned between acuity test and dashboard
- [ ] Tapping navigates to color vision test

#### 2. Instructions Screen
- [ ] Scrollable content with all instructions
- [ ] Info boxes display correctly
- [ ] "Begin Test" button works

#### 3. Test Flow
- [ ] All 8 plates render correctly using React Native SVG
- [ ] Circles component displays colored dots
- [ ] Input accepts numbers
- [ ] "Submit Answer" and "Cannot See" buttons work
- [ ] Progress bar animates
- [ ] Keyboard dismisses appropriately

#### 4. Results Screen
- [ ] Scrollable results with all information
- [ ] Statistics display correctly
- [ ] "View Dashboard" navigates to dashboard tab
- [ ] "Back to Home" returns to home

#### 5. Dashboard Integration
- [ ] Dashboard shows color vision results
- [ ] Result item shows:
  - Test type and badge
  - Screening result (full width)
  - Plates correct
  - Control plates
  - Date
- [ ] Dashboard action buttons include 🎨 emoji button
- [ ] Tapping 🎨 button starts color vision test

### Cross-Platform Consistency

#### Data Consistency
- [ ] Test taken on web appears on mobile dashboard
- [ ] Test taken on mobile appears on web dashboard
- [ ] Same user_id and user_email stored
- [ ] Results format identical

#### Visual Consistency
- [ ] Plates show similar patterns (deterministic based on plateId)
- [ ] Color palettes match between web and mobile
- [ ] Number patterns render consistently

### Authentication & RLS

#### Authenticated Users
- [ ] Can take the test and save results
- [ ] Can view their own results on dashboard
- [ ] Results properly associated with user_id

#### Unauthenticated Users
- [ ] Redirected to signin when accessing test
- [ ] After signin, can return to test

#### Row Level Security
- [ ] Users can only see their own color vision results
- [ ] Cannot query other users' results via Supabase client

### Edge Cases

#### Input Validation
- [ ] Empty input: Submit button disabled on web, no-op on mobile
- [ ] Non-numeric input: Treated as incorrect answer
- [ ] Multi-digit numbers: Accepted (e.g., "12", "45", "73", "16")

#### Network Errors
- [ ] If save fails, user sees "Warning" alert (mobile) or console error (web)
- [ ] Results still displayed even if save fails
- [ ] Can navigate away and retry test

#### Screen Quality
- [ ] Test works on various screen sizes
- [ ] Colors appear distinguishable on quality displays
- [ ] Note about screen quality present in instructions

### Accessibility

#### Color Contrast
- [ ] Control plates (12, 16) very high contrast - everyone should see them
- [ ] Other plates use moderate contrast for screening

#### Text
- [ ] All disclaimers clearly readable
- [ ] Instructions in plain language
- [ ] No medical jargon without explanation

### Performance

#### Load Times
- [ ] Plates render quickly (pre-generated via deterministic algorithm)
- [ ] No image loading delays (SVG-based)
- [ ] Smooth transitions between plates

#### Mobile Performance
- [ ] React Native SVG renders 300-400 circles smoothly
- [ ] No lag during plate transitions
- [ ] Scrolling smooth on results screen

## Known Limitations

1. **Screen Dependency**: Results may vary based on:
   - Display color accuracy
   - Screen brightness
   - Ambient lighting
   - Color calibration

2. **Screening Only**: 
   - Not a diagnostic tool
   - Should be followed by professional testing
   - Documented in all user-facing text

3. **Generated Plates**: 
   - Not identical to standardized Ishihara plates
   - Patterns are simpler (for legal/copyright reasons)
   - Still effective for basic screening

4. **No Vision Correction Detection**:
   - Doesn't detect if user is wearing tinted lenses
   - Relies on user following instructions

## Regression Testing

Ensure existing functionality still works:

### Acuity Test
- [ ] Still accessible and functional
- [ ] Still saves to test_results table
- [ ] Dashboard still shows acuity results correctly

### Dashboard
- [ ] Shows both acuity and color vision results
- [ ] Handles users with only one test type
- [ ] Empty state still works for new users

### Authentication
- [ ] Sign up still works
- [ ] Sign in still works
- [ ] Sign out still works
- [ ] Auth redirects still work

## Success Criteria

✅ **Complete when:**
1. All test cases pass on both web and mobile
2. No TypeScript errors
3. No console errors during normal flow
4. Results save correctly to Supabase
5. RLS policies enforced
6. Disclaimers present and clear
7. Code follows existing patterns (matches acuity test structure)
8. No copyrighted materials used
9. Documentation clear about screening vs. diagnosis

## Post-Deployment Verification

After merging to main:
1. Verify on production/staging environment
2. Test with real users to gather feedback
3. Monitor for any reported issues with color accuracy
4. Consider A/B testing different color palettes if needed
