# Test Notes: Wellness Baseline & Trends

## PR Information
- **PR:** https://github.com/TanyaStrauss1/Spect-IT/pull/113
- **Branch:** `cursor/wellness-baseline-trends-8829`
- **Status:** Draft

## Testing Checklist

### ✅ Mobile App Testing (`apps/mobile`)

#### Setup
```bash
cd apps/mobile
npm install
npx expo start
```

#### Test Cases

**TC1: First-Time User (No Trends)**
1. Open app (fresh install or clear data)
2. Navigate to Clinical Summary screen
3. **Expected:** No "Vision Trends" section (need ≥2 results)

**TC2: Acuity Trend — Single Eye**
1. Take Visual Acuity test → Right eye: 6/12 (logMAR 0.3)
2. Save result, navigate to dashboard
3. Take Visual Acuity test → Right eye: 6/18 (logMAR 0.48)
4. Navigate to Clinical Summary
5. **Expected:** 
   - "Vision Trends" section appears
   - Change alert: "⚠️ Change Detected"
   - Message: "Right eye (OD): Declined by 0.18 logMAR (6/18 from 6/12). Consider a professional eye exam."
   - Alert has amber background

**TC3: Acuity Improvement**
1. Repeat TC2 but improve from 6/18 → 6/9
2. **Expected:**
   - "✓ Improvement Detected"
   - Message: "Right eye (OD): Improved by 0.18 logMAR..."
   - Alert has green background

**TC4: Hearing Screening Decline**
1. Take Hearing Screening → L: 4/4, R: 4/4 (PASS)
2. Take Hearing Screening → L: 2/4, R: 4/4 (REFER)
3. Navigate to Clinical Summary
4. **Expected:**
   - Change alert for left ear
   - Message includes "Screening only — not calibrated dB HL"
   - Hearing trends section shows both results with pass count bars

**TC5: Vision Scan Alignment Change**
1. Take Vision Scan → Alignment index ~85-90 (typical pass)
2. Take Vision Scan → Alignment index ~70 (≥5 point drop)
3. **Expected:**
   - Change alert: "Vision Scan (mobile camera): Alignment index declined by X points..."
   - Message includes "Screening only — not a clinical assessment"

**TC6: Participant-Scoped Results**
1. Add participant (e.g., "Child 1")
2. Switch to participant
3. Take 2+ acuity tests for participant
4. **Expected:** Trends only show participant's results, not parent's

**TC7: Multiple Change Types**
1. Create scenario with acuity, hearing, and vision scan changes
2. **Expected:** All change alerts appear in one section with proper formatting

---

### ✅ Web App Testing (`apps/web`)

#### Setup
```bash
cd apps/web
npm install
npm run dev
# Open http://localhost:3000
```

#### Test Cases

**TC8: Web Dashboard Trends Chart**
1. Sign in
2. Create 2+ acuity results (use test harness or DB insert)
3. Navigate to dashboard
4. **Expected:**
   - "Vision & Hearing Trends" section with recharts line chart
   - logMAR trend line (y-axis reversed, lower = better)
   - Reference lines at 0.0 (6/6) and 0.3 (6/12)

**TC9: Web Hearing Trends Visualization**
1. Create 2+ hearing screening results with different pass counts
2. **Expected:**
   - Hearing screening section appears below acuity chart
   - Pass count bars (L/R ear) with teal colors
   - Status badge (PASS/REFER)
   - Disclaimer: "Wellness screening only — NOT calibrated dB HL"

**TC10: Web/Mobile Parity**
1. Create same test sequence in both web and mobile
2. **Expected:** Same change alerts, same thresholds, same messaging

---

### ✅ Website (Live Product) Testing (`website/`)

#### Setup
```bash
cd website
# Open index.html in browser (or run local server)
python3 -m http.server 8000
# Open http://localhost:8000
```

#### Test Cases

**TC11: Premium Dashboard Change Alerts**
1. Manually populate `testHistory` in localStorage:
   ```javascript
   localStorage.setItem('testHistory', JSON.stringify([
     {
       test_type: 'visual-acuity',
       test_date: '2026-09-01',
       results: { rightEye: { snellen: '6/12' } }
     },
     {
       test_type: 'visual-acuity',
       test_date: '2026-09-19',
       results: { rightEye: { snellen: '6/18' } }
     }
   ]));
   ```
2. Reload page, navigate to premium dashboard
3. **Expected:**
   - Yellow alert box at top: "📊 Screening Changes Detected"
   - Subtext: "Comparison with prior screening — not a diagnosis"
   - Change alert for right eye acuity

**TC12: Website Hearing Trends**
1. Add hearing screening results to `testHistory`:
   ```javascript
   localStorage.setItem('testHistory', JSON.stringify([
     {
       test_type: 'hearing-screening',
       test_date: '2026-09-01',
       test_data: { leftEarPassCount: 4, rightEarPassCount: 4, totalFrequencies: 4 }
     },
     {
       test_type: 'hearing-screening',
       test_date: '2026-09-19',
       test_data: { leftEarPassCount: 2, rightEarPassCount: 4, totalFrequencies: 4 }
     }
   ]));
   ```
2. **Expected:**
   - Change alert for left ear
   - Hearing trend card in premium insights section

**TC13: Vision Scan Status Flip**
1. Add Vision Scan results with recommendation change:
   ```javascript
   [
     {
       test_type: 'vision-scan',
       test_date: '2026-09-01',
       test_data: { recommendsProfessionalExam: false, alignment: { alignmentIndex: 90 } }
     },
     {
       test_type: 'vision-scan',
       test_date: '2026-09-19',
       test_data: { recommendsProfessionalExam: true, alignment: { alignmentIndex: 75 } }
     }
   ]
   ```
2. **Expected:** Two change alerts (alignment + status change)

---

## Verification Points

### Screening Language ✅
- [ ] All alerts use "screening" terminology
- [ ] No "diagnosis" or "disease" language
- [ ] Professional exam "recommendations" (not "requirements")
- [ ] Hearing disclaimer: "not calibrated dB HL"
- [ ] Vision Scan disclaimer: "not a clinical assessment"

### Change Thresholds ✅
- [ ] Acuity: 0.1 logMAR triggers alert
- [ ] Hearing: 1 frequency change triggers alert
- [ ] Vision Scan: 5-point alignment OR status flip triggers alert

### Data Handling ✅
- [ ] No crashes on missing data (null checks)
- [ ] Backward compatible with legacy formats
- [ ] Participant-scoped results isolated correctly
- [ ] Chronological sorting by `created_at`

### UI/UX ✅
- [ ] Green alerts for improvements
- [ ] Amber alerts for declines
- [ ] Icons consistent (✓ for good, ⚠️ for warning)
- [ ] Last 5 results shown in trend lists
- [ ] Charts render correctly (web)

---

## Known Issues / Limitations

1. **Contrast Sensitivity:** Shows trend but no change threshold alert (future enhancement)
2. **PDF Export:** Trends not included in PDF export yet (future enhancement)
3. **Timespan Filter:** All historical data shown (no 30d/90d/1y filter yet)

---

## Regression Testing

### Must NOT Break
- [ ] Test submission still works (acuity, color, hearing, etc.)
- [ ] Results saved to Supabase `test_results` table
- [ ] Clinical summary page loads without errors
- [ ] Dashboard loads without errors
- [ ] Participant switching still works
- [ ] Export/share functionality unaffected

---

## Device Testing

### Mobile
- [ ] iOS (Expo Go)
- [ ] Android (Expo Go)

### Web Browsers
- [ ] Chrome/Edge (desktop)
- [ ] Safari (desktop)
- [ ] Firefox (desktop)
- [ ] Mobile Safari (iOS)
- [ ] Chrome (Android)

### Website
- [ ] Chrome (desktop)
- [ ] Safari (desktop)
- [ ] Mobile browsers

---

## Deployment Verification

### After Merge
1. **Mobile:** Expo build & publish
2. **Web:** Vercel auto-deploy from main
3. **Website:** `cd website && vercel --prod` (project: spect-it-app1)

### Post-Deploy Smoke Test
1. Visit live site (spect-it.com)
2. Complete 2+ acuity tests
3. Verify trends appear on dashboard
4. Verify change alerts display correctly
5. Verify screening disclaimers present

---

**Questions?** See `WELLNESS_BASELINE_CHANGELOG.md` for detailed implementation notes.

---

**Wellness screening only** — NOT medical diagnoses, clinical exams, or dispensable prescriptions.
