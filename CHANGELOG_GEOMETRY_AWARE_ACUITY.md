# Geometry-Aware Visual Acuity Implementation

**Invention Disclosure §21: Geometry-Aware Visual Acuity**

## Overview
This implementation ensures that visual acuity test optotypes (Sloan letters) are sized according to the correct visual angle based on measured or estimated viewing distance, with clear disclosure of the distance measurement method and appropriate screening disclaimers.

## What Changed

### Core CV Package (`packages/cv/`)

#### `src/tests/visual-acuity.ts`
- **NEW**: Added `DistanceSource` type to track how viewing distance was determined:
  - `card-calibration`: Credit card calibration (most accurate, clinical-grade)
  - `lidar-measured`: LiDAR/TrueDepth sensor measurement
  - `camera-estimated-ipd`: Camera-based IPD estimation
  - `camera-estimated-face`: Camera-based face width estimation
  - `assumed-default`: Assumed default distance (least accurate)

- **NEW**: Added `DistanceMetadata` interface:
  ```typescript
  {
    source: DistanceSource
    distanceCm: number
    confidence: number // 0-1 scale
    timestamp: number
    isMedicalGrade: boolean // Only true for card-calibration
  }
  ```

- **UPDATED**: `VisualAcuityResult` interface now includes:
  - `distanceMetadata: DistanceMetadata` - Full distance measurement context
  - `version: '2.1-geometry-aware'` - Updated version number
  - Enhanced `methodology` string with distance source disclosure

- **UPDATED**: `VisualAcuityTest.createResult()` now accepts optional `distanceSource` parameter to explicitly set how distance was measured

- **NEW**: Helper functions:
  - `determineDistanceMetadata()`: Infers distance source from calibration data
  - `getConfidenceForSource()`: Returns confidence score (0-1) for each distance source
  - `getDistanceSourceDescription()`: User-friendly description of distance source
  - `getScreeningDisclaimer()`: Context-aware disclaimer based on distance metadata

#### `src/index.ts`
- **UPDATED**: Added exports for new types and functions:
  - `DistanceSource`, `DistanceMetadata`
  - `determineDistanceMetadata`, `getConfidenceForSource`, `getDistanceSourceDescription`, `getScreeningDisclaimer`

### Web Acuity Test (`apps/web/src/app/tests/acuity/page.tsx`)

- **NEW**: Import `DistanceMetadata` and `getScreeningDisclaimer` from `@spect-it/cv`

- **NEW**: State variable `distanceMetadata` to track distance measurement context

- **UPDATED**: `finishTest()` function:
  - Determines `distanceSource` from calibration method
  - Passes `distanceSource` to `test.createResult()`
  - Stores `distanceMetadata` in state
  - Saves `distanceMetadata` to Supabase results

- **NEW**: Distance information banner during test:
  - Shows current viewing distance (e.g., "60cm")
  - Indicates calibration method ("Card-calibrated (clinical-grade)" or "Assumed default (screening-grade)")
  - Color-coded: green for card-calibration, yellow for assumed default

- **UPDATED**: Results page:
  - Prominent distance metadata card showing:
    - Distance measurement method
    - Viewing distance
    - Confidence percentage
    - Medical-grade status
  - Context-aware disclaimer using `getScreeningDisclaimer()`
  - Visual distinction between calibrated (green badge) and uncalibrated (yellow badge) results

### Mobile Acuity Test (`apps/mobile/app/test/acuity.tsx`)

- **NEW**: Import `DistanceMetadata` and `getScreeningDisclaimer` from `@spect-it/cv`

- **NEW**: State variable `distanceMetadata` to track distance measurement context

- **UPDATED**: `finishTest()` function:
  - Determines `distanceSource` from calibration method
  - Passes `distanceSource` to `test.createResult()`
  - Stores `distanceMetadata` in state
  - Saves `distanceMetadata` to Supabase results

- **NEW**: Distance information banner during test (styled for mobile):
  - Shows distance and calibration status
  - Color-coded visual feedback

- **UPDATED**: Results screen:
  - Distance information card with emoji indicators
  - Shows distance, method, and confidence
  - Context-aware disclaimer
  - New styles: `distanceBanner`, `distanceInfo`, color variants

## Key Features

### 1. Angular Sizing
The existing `calculateSloanStrokeWidth()` function already performs geometry-aware angular sizing:
```typescript
calculateSloanStrokeWidth(logMAR, pxPerMm, distanceMm)
```
This ensures optotypes subtend the correct visual angle (5 arc minutes per stroke at 0.0 logMAR).

### 2. Distance Source Tracking
Every test result now records **how** the viewing distance was determined:
- Card calibration → Highest confidence (95%), medical-grade
- LiDAR measurement → High confidence (90%)
- Camera estimation (IPD) → Moderate confidence (75%)
- Camera estimation (face) → Lower confidence (65%)
- Assumed default → Lowest confidence (50%)

### 3. Clinical Transparency
Users see clear visual indicators:
- ✓ **Green badge**: Card-calibrated, clinical-grade
- ℹ️ **Yellow badge**: Estimated or assumed distance, screening-grade

Disclaimers explicitly state:
> "Angular sizing based on assumed default viewing distance (60cm). For clinical-grade results, perform card calibration."

### 4. Backward Compatibility
- Existing calibration flows unchanged
- Default values used when calibration not performed
- Tests can proceed without calibration (with appropriate disclaimers)

## Testing Instructions

### Web App

1. **Test with card calibration** (clinical-grade):
   ```bash
   cd apps/web
   npm run dev
   ```
   - Navigate to `/tests/acuity`
   - Complete credit card calibration when prompted
   - During test: Verify green banner shows "Card-calibrated (clinical-grade)"
   - After test: Verify results show:
     - ✓ "Distance Method: Card Calibration"
     - "Clinical-grade angular sizing"
     - Confidence: 95%

2. **Test without calibration** (screening-grade):
   - Skip calibration or use default
   - During test: Verify yellow banner shows "Assumed default (screening-grade)"
   - After test: Verify results show:
     - ℹ️ "Distance Method: Assumed Default"
     - Disclaimer mentions "assumed default viewing distance"
     - Confidence: 50%

### Mobile App

1. **Test with calibration**:
   ```bash
   cd apps/mobile
   npx expo start
   ```
   - Complete calibration screen
   - Verify distance banner appears
   - Check results show distance metadata

2. **Test without calibration**:
   - Skip calibration
   - Verify screening-grade banner
   - Check appropriate disclaimer

### Vercel Deployment (website/)

The live site (`website/`) is static HTML/CSS/JS and does **not** use this implementation. This PR only affects:
- `apps/web` (Next.js web app)
- `apps/mobile` (Expo mobile app)
- `packages/cv` (shared CV library)

## Clinical Justification

### Why This Matters
Visual acuity testing requires optotypes to subtend precise visual angles:
- At 0.0 logMAR (6/6, 20/20): 5 arc minutes per stroke
- Each 0.1 logMAR step: factor of 10^0.1 ≈ 1.259x

**Without accurate viewing distance**, angular sizing is incorrect, potentially leading to:
- False positives (letters too large → artificially good scores)
- False negatives (letters too small → artificially poor scores)

### Distance Measurement Methods

#### 1. Card Calibration (Clinical-Grade)
- User measures physical credit card width on screen
- Calculates pixels per millimeter
- Confidence: 95%
- **Best for**: Clinical screening, research, telehealth

#### 2. LiDAR/TrueDepth (Future Enhancement)
- Uses device depth sensors (iPad Pro, iPhone Pro)
- Real-time distance tracking
- Confidence: 90%
- **Best for**: Dynamic testing, pediatric screening

#### 3. Camera Estimation (Future Enhancement)
- IPD-based: Measures inter-pupillary distance
- Face-based: Estimates from face width
- Confidence: 65-75%
- **Best for**: Quick screening when calibration unavailable

#### 4. Assumed Default (Fallback)
- Assumes 60cm viewing distance
- Confidence: 50%
- **Best for**: Rough screening, education, demos

## Assumptions Documented

### Screen Calibration (`packages/cv/src/calibration/screen-calibrator.ts`)
- Default PPI: 96 (3.8 px/mm) - typical laptop/tablet
- Default distance: 60cm (standard desktop viewing distance)
- Credit card width: 85.6mm (ISO/IEC 7810 standard)

### Camera Depth Estimation (`packages/cv/src/depth/camera-depth-estimator.ts`)
- Average adult IPD: 63mm (range 54-74mm)
- Average adult face width: 140mm (range 120-160mm)
- Pinhole camera model for distance estimation

### Visual Acuity Standards (`packages/cv/src/tests/visual-acuity.ts`)
- ETDRS chart: 0.1 logMAR steps between lines
- Sloan letters: 5×5 grid geometry, 1:1:1 stroke-gap ratio
- Stroke width at 0.0 logMAR: 5 arc minutes
- Letter height: 5× stroke width = 25 arc minutes

## Database Schema

Test results saved to `test_results` table now include:
```json
{
  "results": {
    "rightEye": { ... },
    "leftEye": { ... },
    "methodology": "...",
    "distanceMetadata": {
      "source": "card-calibration",
      "distanceCm": 60,
      "confidence": 0.95,
      "timestamp": 1726694400000,
      "isMedicalGrade": true
    }
  }
}
```

## Future Enhancements

### Planned (Not in This PR)
1. **Real-time distance monitoring**: Use LiDAR/camera during test to detect if user moves
2. **Adaptive sizing**: Adjust letter size if distance changes mid-test
3. **Distance warnings**: Alert if user is too close/far from calibrated distance
4. **IPD measurement**: Use face landmarks to estimate distance via IPD
5. **Multi-device support**: Save calibration per device (desktop, tablet, phone)

### Out of Scope
- Medical device certification (this is a screening tool, not diagnostic)
- Prescription generation (refer to eye care professional)
- Refractive error measurement (separate tests: astigmatism, prescription screening)

## Standards & References

- **ETDRS Protocol**: Early Treatment Diabetic Retinopathy Study
  - Bailey IL, Lovie JE. "New design principles for visual acuity letter charts." *Am J Optom Physiol Opt.* 1976
  
- **Sloan Letters**: British Standard BS 4274-1:2003, ISO 8596:2017
  - 5×5 grid geometry with 1:1:1 stroke-gap-stroke ratio
  
- **Visual Angle**: Relationship between size and distance
  - tan(θ) = size / distance (small angle approximation)
  - 1° = 60 arc minutes
  - At 0.0 logMAR: stroke = 5', letter = 25'

## Version History

- **v2.1-geometry-aware** (This PR): Added distance source tracking and clinical disclaimers
- **v2.0-clinical**: ETDRS methodology with per-eye testing
- **v1.0**: Initial visual acuity implementation

---

**Date**: September 18, 2026  
**Author**: Cursor Cloud Agent (cursor/geometry-aware-acuity-f388)  
**Repository**: https://github.com/TanyaStrauss1/Spect-IT  
**Branch**: cursor/geometry-aware-acuity-f388
