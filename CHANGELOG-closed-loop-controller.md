# Vision Scan: Closed-Loop Examination Controller v1

## Overview

Implements adaptive acquisition control for Vision Scan modules based on Tanya's invention disclosure §§25-26, 35-47. This is a **screening-only** implementation that never generates diagnosis or dispensable prescription values.

## Key Features

### 1. Per-Module Measurement State
- **Confidence tracking** (0-1 scale)
- **Quantified uncertainty** with factor breakdown:
  - Low sample count
  - Poor quality
  - Excessive motion
  - Environmental factors
- **Attempt tracking** (current/max attempts)
- **Sample counting** (collected/target samples)
- **Status lifecycle**: not-started → in-progress → needs-retry | complete | inconclusive

### 2. Adaptive Acquisition Logic
- **Automatic stopping decisions** based on confidence thresholds
- **Corrective coaching generation** when quality is insufficient
- **Selective re-capture** without restarting entire scan
- **Retry limit enforcement** (default 3 attempts per module)

### 3. Stopping Rules
Each module has configurable stopping rules:

| Module | Min Confidence | Target Confidence | Min Samples | Max Attempts |
|--------|---------------|-------------------|-------------|--------------|
| Device Qualification | 65% | 85% | 1 | 2 |
| Calibration | 65% | 85% | 9 | 3 |
| Alignment | 60% | 80% | 12 | 3 |
| Motility | 60% | 80% | 27 | 3 |
| Convergence | 60% | 80% | 15 | 3 |

**Stopping conditions:**
- ✅ **Stop Success**: Confidence ≥ target AND samples ≥ target
- ✅ **Stop Success**: Confidence ≥ minimum AND max attempts reached
- 🔄 **Retry**: Confidence < minimum AND attempts < max → show coaching
- ⚠️ **Inconclusive**: Confidence < minimum AND attempts ≥ max → professional exam recommended

### 4. State Persistence
All measurement state is persisted in `ExamController`:
- Per-module confidence + uncertainty
- Attempt counts
- Quality issues + coaching prompts
- Timestamps (started, last attempt, completed)
- Final result data
- Methodology tracking

### 5. Integration with Existing QualityEngine
- `ExamController` wraps existing `QualityEngine`
- Reuses existing quality assessment logic
- Adds closed-loop control layer on top
- Backward compatible with existing session context

## Architecture

```
┌─────────────────────────────────────┐
│   VisionScanContext (React)         │
│   - Session state management        │
│   - Legacy module result setters    │
│   - NEW: ExamController instance    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   ExamController (Core Logic)       │
│   - Per-module state tracking       │
│   - Stopping decision engine        │
│   - Coaching prompt generation      │
│   - Wraps QualityEngine             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   QualityEngine (Existing)          │
│   - Module confidence assessment    │
│   - Quality issue detection         │
│   - shouldRepeat flag               │
└─────────────────────────────────────┘
```

## New Components

### Backend (packages/cv)
- **`exam-controller-types.ts`** - TypeScript types for closed-loop state
- **`exam-controller.ts`** - Main controller class with stopping logic

### Frontend (apps/mobile)
- **`AdaptiveCoachingCard.tsx`** - Displays corrective coaching prompts
- **`ModuleStateCard.tsx`** - Shows detailed module state with uncertainty
- **`quality-review-v2.tsx`** - Enhanced quality review using controller state
- **`alignment-v2.tsx`** - Demo of alignment module with closed-loop integration

## Usage Example

```typescript
// Initialize controller in session
const examController = new ExamController(sessionId, participantId)

// Start module
examController.startModule('alignment')

// After capture, record result and get decision
const result: AlignmentResult = tracker.computeResult()
const decision = examController.recordModuleResult('alignment', result)

// Handle decision
switch (decision.action) {
  case 'stop-success':
    // Proceed to next module
    router.push('/vision-scan/motility')
    break
    
  case 'retry':
    // Show coaching and retry
    showCoaching(decision.coachingPrompts)
    break
    
  case 'stop-inconclusive':
    // Mark inconclusive, recommend professional exam
    markInconclusive()
    break
}

// Get module state anytime
const state = examController.getModuleState('alignment')
console.log(`Confidence: ${state.confidence * 100}%`)
console.log(`Uncertainty: ${state.uncertainty.quantifiedUncertainty * 100}%`)
console.log(`Attempts: ${state.attemptNumber}/${state.maxAttempts}`)
```

## Testing

### Manual Testing Flow
1. Start new Vision Scan session
2. Navigate to Alignment V2 screen (`/vision-scan/alignment-v2`)
3. Perform alignment test with deliberately poor quality:
   - Move face off-center
   - Turn head significantly
   - Move too far/close
4. Observe automatic coaching prompts when confidence < 60%
5. Retry with improved technique
6. Continue to Quality Review V2 (`/vision-scan/quality-review-v2`)
7. Verify module state cards show:
   - Confidence percentages
   - Uncertainty factors
   - Attempt counts
   - Status indicators

### Integration Points
- **Existing screens** continue to work with legacy quality review
- **New V2 screens** demonstrate closed-loop controller
- **Both flows** coexist in the app for comparison

## Constraints Satisfied

✅ **Screening only** - No diagnosis or dispensable Rx values generated  
✅ **Expo SDK 50 compatible** - No breaking changes to mobile build  
✅ **TypeScript safe** - No breaks for Vercel web builds  
✅ **Extends QualityEngine** - Wraps existing logic, no greenfield rewrite  
✅ **Draft PR only** - Not merged to production  

## Out of Scope (Future Work)

- True refraction measurement
- Keratometry
- Full autonomous exam end-state
- Production deployment (this is a draft/prototype)

## File Manifest

**New Files:**
- `packages/cv/src/vision-scan/exam-controller-types.ts` (167 lines)
- `packages/cv/src/vision-scan/exam-controller.ts` (465 lines)
- `apps/mobile/components/vision-scan/AdaptiveCoachingCard.tsx` (102 lines)
- `apps/mobile/components/vision-scan/ModuleStateCard.tsx` (287 lines)
- `apps/mobile/app/vision-scan/quality-review-v2.tsx` (280 lines)
- `apps/mobile/app/vision-scan/alignment-v2.tsx` (520 lines)
- `CHANGELOG-closed-loop-controller.md` (this file)

**Modified Files:**
- `packages/cv/src/vision-scan/index.ts` (added exports)
- `apps/mobile/lib/vision-scan/vision-scan-context.tsx` (integrated ExamController)

**Total:** 6 new files, 2 modified files, ~1,821 new lines of code

## References

- Invention Disclosure §25-26: Per-module confidence tracking
- Invention Disclosure §35-47: Adaptive acquisition concepts
- Existing PRs: #89-#97 (Vision Scan P1-P5)

## How to Test This Feature

1. **Build the app:**
   ```bash
   cd apps/mobile
   npm install
   npm start
   ```

2. **Navigate to test screens:**
   - Use Alignment V2: `/vision-scan/alignment-v2`
   - Use Quality Review V2: `/vision-scan/quality-review-v2`

3. **Verify closed-loop behavior:**
   - Poor quality → automatic coaching + retry prompt
   - Good quality → auto-advance to next module
   - Max retries → inconclusive status + professional exam recommendation

4. **Check state persistence:**
   - Module states preserved across navigation
   - Attempt counts increment correctly
   - Uncertainty factors update based on capture quality
