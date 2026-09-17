# Vision Scan - Prototype 1 Implementation

## Overview

Self-administered smartphone eye-screening sequence using front-facing camera, depth sensors (when available), eye tracking, screen, device sensors, and software analysis.

**Objective:** Generate a repeatable digital ocular-function profile and flag results that warrant professional examination. NOT to diagnose disease or issue spectacle prescriptions.

**Duration:** 3–5 minutes for full sequence.

## Prototype 1 Features Implemented

### ✅ 1. Device & Environment Qualification
- **Location:** `packages/cv/src/vision-scan/device-qualifier.ts`
- **Mobile UI:** `apps/mobile/app/vision-scan/qualification.tsx`
- Assesses device capabilities (TrueDepth, LiDAR, cameras, IMU)
- Evaluates environment quality (lighting, distance, stability)
- Generates quality score (excellent/good/acceptable/poor)
- **Quality Gate:** Poor quality data is never treated as clinical data
- Determines capability mode: **full** (sensor-based) vs **degraded** (estimate-based)

### ✅ 2. Automatic Face/Eye Calibration
- **Location:** `packages/cv/src/vision-scan/calibrator.ts`
- **Mobile UI:** `apps/mobile/app/vision-scan/calibration.tsx`
- 9-point calibration sequence (center + 8 peripheral positions)
- User follows dots on screen with eyes
- Builds per-user calibration model
- Validates calibration quality (average error < 50px, max error < 100px)
- Allows selective repeat if calibration fails

### ✅ 3. Resting Alignment / Central Fixation
- **Location:** `packages/cv/src/vision-scan/alignment-tracker.ts`
- **Mobile UI:** `apps/mobile/app/vision-scan/alignment.tsx`
- Multi-frame capture (30 frames at 10 FPS)
- Measures eye alignment at central fixation
- Computes Alignment Index (0-100)
- **Screening language only:** "No significant deviation" vs "Professional assessment recommended"
- NO diagnosis language (e.g., never says "you have strabismus")

### ✅ 4. 9-Position Ocular Motility
- **Location:** `packages/cv/src/vision-scan/motility-tracker.ts`
- **Mobile UI:** `apps/mobile/app/vision-scan/motility.tsx`
- Guided gaze sequence through 9 positions
- Distinguishes head motion from eye motion
- **Rejects frames with excessive head motion:**
  - Head rotation > 5°/sec
  - Head displacement > 50mm from starting position
- Computes motility profile (range & smoothness per position)
- Screening note based on motility pattern

### ✅ 5. Dynamic Convergence Scan
- **Location:** `packages/cv/src/vision-scan/convergence-tracker.ts`
- **Mobile UI:** `apps/mobile/app/vision-scan/convergence.tsx`
- Guided phone approach/recede while fixating on screen target
- Captures distance vs binocular convergence curve
- Identifies near point of convergence
- Screening note: "appears normal" vs "professional exam recommended"

### ✅ 6. Quality & Confidence Engine
- **Location:** `packages/cv/src/vision-scan/quality-engine.ts`
- Per-module confidence assessment
- Overall confidence score (0-1)
- **Selective repeat:** Flags low-confidence modules for re-test
- Threshold: confidence < 0.50 triggers repeat recommendation

### ✅ 7. Results Summary
- **Mobile UI:** `apps/mobile/app/vision-scan/results.tsx`
- Displays all module results
- **Screening language only** - no diagnoses or Rx
- Shows capability mode (full vs degraded)
- Data quality confidence score
- Technical innovation notice (patent context)

### ✅ 8. Home Entry Point
- **Updated:** `apps/mobile/app/(tabs)/index.tsx`
- "Vision Scan (NEW)" button added to home screen
- All routes registered in `apps/mobile/app/_layout.tsx`

## Capability Matrix: Full vs Degraded Mode

### Full Mode (Sensor-Based Measurements)
**Requirements:** TrueDepth or LiDAR + acceptable environment quality

| Feature | Method | Accuracy |
|---------|--------|----------|
| Depth Measurement | TrueDepth/LiDAR sensor | High |
| Gaze Tracking | ARKit face tracking | High |
| Head Pose | IMU + visual tracking | High |
| Distance Measurement | Depth sensor | High |
| **Alignment Accuracy** | - | **High** |
| **Motility Accuracy** | - | **High** |
| **Convergence Accuracy** | - | **High** |

### Degraded Mode (Estimate-Based Measurements)
**Used when:** No depth sensor OR poor environment quality

| Feature | Method | Accuracy |
|---------|--------|----------|
| Depth Measurement | Face size estimation | Medium |
| Gaze Tracking | Geometric approximation | Medium |
| Head Pose | Visual tracking only | Medium |
| Distance Measurement | Face size estimation | Low-Medium |
| **Alignment Accuracy** | - | **Medium** |
| **Motility Accuracy** | - | **Medium** |
| **Convergence Accuracy** | - | **Low** |

**Key Difference:**
- **Full mode:** Direct sensor measurements (mm, degrees, angles)
- **Degraded mode:** Estimated from visual/geometric cues; results are screening-level only

**Both modes:**
- Display appropriate warnings to user
- Use screening language (not diagnostic)
- Record which mode was used in results

## Technical Core (Conceptual Model)

At each timestamp `t`, the system captures a synchronized vector of:

- **L/R eye position & orientation** (x, y, z in degrees/mm)
- **Gaze estimate** (screen coordinates, calibrated)
- **Facial depth** (mm from camera)
- **Phone-to-face distance** (mm)
- **Head pose** (pitch, yaw, roll in degrees)
- **Device pose** (accelerometer, gyroscope)
- **Displayed stimulus** (position, type, color)
- **Screen parameters** (resolution, PPI, brightness)
- **Image quality metrics** (lighting score, blur, coverage)

**Derived metrics:**
- Alignment Index
- Motility Profile (per gaze position)
- Convergence Curve (distance vs vergence)
- Fixation Stability
- Quality Index (per module)

## Sensors vs Estimates: Documentation

### Sensor-Based Approach (Full Mode)
When device has TrueDepth (Face ID) or LiDAR:
- **Depth:** Direct infrared depth map (sub-mm precision)
- **Gaze:** ARKit gaze vectors from face mesh tracking
- **Head Pose:** Fusion of IMU (gyro/accel) + visual tracking
- **Distance:** Computed from depth map face plane

**Advantages:**
- Absolute measurements (not relative)
- High temporal resolution (60+ FPS)
- Robust to lighting variations
- Clinically relevant accuracy

**Limitations:**
- Requires specific hardware (iPhone X+, iPad Pro)
- May fail with glasses/contacts (depending on implementation)

### Estimate-Based Approach (Degraded Mode)
When device lacks depth sensors:
- **Depth:** Estimated from face bounding box size vs known average face width
- **Gaze:** Estimated from pupil/iris position in eye region + head pose
- **Head Pose:** Estimated from 2D facial landmarks (visual only)
- **Distance:** Estimated from face size + camera FOV

**Advantages:**
- Works on any smartphone with front camera
- No special hardware required
- Wider device compatibility

**Limitations:**
- **Lower precision:** ~20-30% error vs ground truth
- **Sensitive to lighting:** Poor lighting degrades face detection
- **Relative measurements:** Scale ambiguity (depends on assumed face size)
- **Motion artifacts:** Visual-only tracking is less stable

**Recommendation:**
- Degraded mode results are **screening-level only**
- Higher threshold for "professional exam recommended"
- Explicit user warning about accuracy limitations

## Out of Scope (Prototype 1)

The following are explicitly **NOT** implemented in P1:

❌ Near visual acuity with distance gating  
❌ Contrast sensitivity  
❌ Fixation-controlled central visual field  
❌ Longitudinal change index  
❌ Full screening report UX polish  
❌ Pupil measurement  
❌ Blink analysis  
❌ Photorefraction  
❌ Children's game mode  
❌ Rear-camera assist  

❌ **No Rx (sphere/cylinder/axis)**  
❌ **No disease diagnosis claims** (glaucoma, retina, cataract, DR, AMD)  

## Honesty & Regulatory Context

### Language Constraints
- Use **"screening"** terminology, not "diagnostic"
- **"No significant signal detected"** instead of "your eyes are normal"
- **"Professional assessment recommended"** instead of "you have [condition]"
- NO clinical cutoffs presented as validated until clinical pilot complete

### Patent Note for Builders
This implementation is NOT claiming novelty for:
- Generic "app eye test"
- Generic "LiDAR eye test"
- Generic "eye + hearing app"

**Potential novelty areas** (subject to patent counsel review):
- Guided protocol with synchronized multi-sensor capture
- Quality gating with selective module repeat
- Multi-parameter screening output (alignment + motility + convergence)
- Capability matrix (full vs degraded mode) with transparent accuracy reporting

Patent counsel owns prior-art search. Builders should not make claims.

## Platform & Deployment

- **Primary:** Expo `apps/mobile` (React Native)
- **Sensors:** TrueDepth/LiDAR where available, graceful degradation otherwise
- **Auth:** Uses existing Spect-IT participant-aware patterns
- **Website:** Do NOT expand deprecated `website/` for this feature

## File Structure

```
packages/cv/src/vision-scan/
├── types.ts                    # All TypeScript types
├── device-qualifier.ts         # Module 1: Device & environment qualification
├── calibrator.ts               # Module 2: Gaze calibration
├── alignment-tracker.ts        # Module 3: Resting alignment
├── motility-tracker.ts         # Module 4: 9-position motility
├── convergence-tracker.ts      # Module 5: Dynamic convergence
├── quality-engine.ts           # Module 6: Quality & confidence assessment
└── index.ts                    # Exports

apps/mobile/app/vision-scan/
├── index.tsx                   # Entry screen (what/why/requirements)
├── qualification.tsx           # Device & environment qualification
├── calibration.tsx             # 9-point gaze calibration
├── alignment.tsx               # Resting alignment capture
├── motility.tsx                # 9-position motility sequence
├── convergence.tsx             # Dynamic convergence (approach/recede)
└── results.tsx                 # Results summary (screening language)
```

## Next Steps (Future Prototypes)

**Prototype 2 candidates:**
- Persistent storage of results (Supabase)
- Historical comparison (detect change over time)
- Near visual acuity (with auto distance measurement)
- Contrast sensitivity test
- Fixation-controlled visual field
- Longitudinal change index

**Not before clinical validation:**
- Any diagnostic language
- Any Rx generation (sphere/cyl/axis)
- Any disease-specific claims
