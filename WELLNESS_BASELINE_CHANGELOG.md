# Wellness Baseline & Longitudinal Change Detection — Changelog

**Invention Disclosure §27** — Personal baseline + change detection for returning participants

## Overview

This PR implements comprehensive longitudinal screening change detection across:
- **Mobile app** (`apps/mobile`)
- **Web app** (`apps/web`)
- **Live website** (`website/`)

## What's New

### 📊 Baseline Comparison
For returning participants, the system now compares **latest screening results** to **prior baselines** and surfaces meaningful changes.

### 🔍 Change Detection Thresholds

#### Visual Acuity
- **Threshold:** ≥0.1 logMAR (clinically meaningful)
- **Example:** 6/6 → 6/9 = ~0.18 logMAR change (triggers alert)
- **Display:** "Left eye (OS): Declined by 0.18 logMAR (6/9 from 6/6). Consider a professional eye exam."

#### Hearing Screening
- **Threshold:** Any change in frequency pass count per ear
- **Example:** L: 3/4 → 2/4 frequencies passed
- **Display:** "Hearing screening (L ear): Declined by 1 frequency (2/4 from 3/4). Consider a hearing evaluation. Screening only — not calibrated dB HL."

#### Vision Scan (Mobile Camera)
- **Threshold:** Alignment index ≥5 points OR recommendation status flip
- **Example:** Alignment 85 → 75, or PASS → REFER
- **Display:** "Vision Scan (mobile camera): Alignment index declined by 10 points (75 from 85). Consider a comprehensive eye exam. Screening only — not a clinical assessment."

## Files Changed

### Mobile
```
apps/mobile/components/TrendsSection.tsx
```
- Added `hearingTrends` data structure
- Enhanced `meaningfulChanges` detection for acuity, hearing, vision scan
- New alert rendering with type-specific screening disclaimers
- Hearing trends visualization (pass count bars per ear)
- Updated summary stats to include hearing screens count

### Web
```
apps/web/src/components/dashboard/TrendsChart.tsx
```
- Added `hearingTrends` data structure
- Same enhanced change detection as mobile
- Hearing trends bar chart visualization
- Updated timespan calculation to include hearing tests
- Parity with mobile implementation

### Website (Live Product)
```
website/premium-dashboard.js
```
- New `detectMeaningfulChanges()` method
- Hearing screening trend detection
- Change alerts prominently displayed at dashboard top
- Updated `renderTrendsChart()` to show hearing trends
- Vanilla JS implementation (no frameworks)

## Screening Language Guidelines

All change alerts follow **honest screening terminology**:

✅ **Correct:**
- "Screening changes detected — comparison with prior screening, not a diagnosis"
- "Consider a professional eye exam" (recommendation)
- "Wellness screening only — NOT calibrated dB HL"
- "Screening only — not a clinical assessment"

❌ **Incorrect:**
- "You have disease X"
- "Diagnosis: Y"
- "Prescription required"
- "Definitive clinical result"

## Technical Architecture

### Data Source
- Uses existing `test_results` table (JSONB `test_data` and `results` fields)
- **No schema migration required**
- Backward compatible with all legacy test formats

### Comparison Logic
- Client-side comparison (latest vs. previous per test type)
- Chronologically sorted by `created_at` timestamp
- Filters by test type using canonical `TEST_TYPE_ID` enum
- Gracefully handles missing data (no crashes on incomplete records)

### Performance
- Efficient filtering (O(n) scan, sorted once)
- Only compares last 2 entries per test type (not full history)
- Renders last 5 results in trend view (UX best practice)

## Testing Scenarios

### Scenario 1: First-Time User
- **Expected:** No trends shown (need ≥2 results for change detection)
- **UI:** Historical results displayed, but no change alerts

### Scenario 2: Acuity Improvement
- **Setup:** 
  1. Take acuity test → Right eye: 6/9 (logMAR 0.18)
  2. Take acuity test → Right eye: 6/6 (logMAR 0.0)
- **Expected:** Green improvement alert: "Right eye (OD): Improved by 0.18 logMAR (6/6 from 6/9)"

### Scenario 3: Hearing Decline
- **Setup:**
  1. Hearing screening → L: 4/4, R: 4/4 (PASS)
  2. Hearing screening → L: 2/4, R: 4/4 (REFER)
- **Expected:** Amber change alert: "Hearing screening (L ear): Declined by 2 frequencies (2/4 from 4/4). Consider a hearing evaluation."

### Scenario 4: Vision Scan Status Change
- **Setup:**
  1. Vision Scan → Alignment 90, recommendsProfessionalExam: false
  2. Vision Scan → Alignment 75, recommendsProfessionalExam: true
- **Expected:** Two alerts:
  - Alignment decline: "Alignment index declined by 15 points (75 from 90)"
  - Status change: "Now recommends professional exam"

## Deployment

### Mobile (Expo)
```bash
cd apps/mobile
npm install
npx expo start
```

### Web (Next.js)
```bash
cd apps/web
npm install
npm run dev
```

### Website (Static)
```bash
cd website
vercel --prod  # project: spect-it-app1
```

## Future Enhancements (Not Blocking)

1. **Contrast Sensitivity Alerts**
   - Currently shows trend, but no change threshold alert
   - Could add ≥10% score change threshold

2. **PDF Export**
   - Include trends in clinical summary PDF
   - Longitudinal chart images

3. **Timespan Filters**
   - 30d, 90d, 1y, all time
   - Currently shows all historical data

4. **Predictive Insights**
   - "Based on your trend, schedule exam in X months"
   - Requires ML model (future research)

## Related Documentation
- See `PARTICIPANTS_FEATURE.md` for participant-scoped results
- See `VISION_SCAN_P2_SUMMARY.md` for Vision Scan details
- See `.cursor/rules/spect-it.mdc` for deployment rules

## Support
Questions? Check:
- PR: https://github.com/TanyaStrauss1/Spect-IT/pull/113
- Schema: `supabase/schema.sql`
- Test results API: `packages/api/src/test-results.ts`

---

**Wellness screening only** — NOT medical diagnoses, clinical exams, or dispensable prescriptions.
