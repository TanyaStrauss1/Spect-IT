# Vision Scan: Closed-Loop Examination Controller v1

> **Adaptive acquisition control for smartphone ocular screening with per-module confidence tracking, automatic coaching, and stopping rules.**

---

## 🎯 What This Implements

Closed-loop measurement control system based on invention disclosure §§25-26, 35-47 that:

1. **Tracks measurement quality** – Per-module confidence + uncertainty quantification
2. **Makes intelligent decisions** – Auto-stop on success, auto-retry with coaching, or mark inconclusive
3. **Generates corrective coaching** – Specific instructions based on quality issues detected
4. **Enforces stopping rules** – Configurable thresholds and max attempts per module
5. **Persists full state** – Confidence, uncertainty, attempts, samples, timestamps across navigation

**Screening-only:** Never generates diagnosis or dispensable prescription values.

---

## 📦 What's Included

### Core Implementation
- ✅ `ExamController` – Main closed-loop logic class
- ✅ Per-module measurement state types
- ✅ Adaptive acquisition decision engine
- ✅ Coaching prompt generation
- ✅ Stopping rule configuration
- ✅ Integration with existing QualityEngine

### React Components
- ✅ `AdaptiveCoachingCard` – Displays corrective instructions
- ✅ `ModuleStateCard` – Shows detailed module state with uncertainty
- ✅ Quality Review V2 screen – Enhanced review using controller state
- ✅ Alignment V2 screen – Full demo of closed-loop integration

### Documentation
- ✅ `CHANGELOG-closed-loop-controller.md` – Full feature specification
- ✅ `TESTING-GUIDE-closed-loop.md` – Comprehensive testing scenarios
- ✅ This README – Quick reference

---

## 🚀 Quick Links

**Pull Request:** [#107](https://github.com/TanyaStrauss1/Spect-IT/pull/107) (Draft)  
**Branch:** `cursor/vision-scan-closed-loop-controller-6481`  
**Files Changed:** 6 new files, 2 modified, ~2,295 lines added  

**Read First:**
1. [CHANGELOG-closed-loop-controller.md](CHANGELOG-closed-loop-controller.md) – Feature overview and architecture
2. [TESTING-GUIDE-closed-loop.md](TESTING-GUIDE-closed-loop.md) – How to test and verify

---

## 🎨 How It Works

### Before (Legacy Quality Review)
```
Module → Capture → QualityEngine → Quality Review → User Decides → Manual Retry
```

### After (Closed-Loop Controller)
```
Module → Capture → ExamController → Auto Decision
                         ├─ Success? → Auto-advance to next module
                         ├─ Low confidence? → Show coaching + retry button
                         └─ Max retries? → Mark inconclusive + continue
```

### State Machine

```
not-started → in-progress → needs-retry ────┐
                         └─→ complete        │
                         └─→ inconclusive ←──┘
                                (max attempts)
```

---

## 📊 Stopping Rules (Configurable)

| Module | Min Confidence | Target Confidence | Min Samples | Max Attempts |
|--------|---------------|-------------------|-------------|--------------|
| Device Qualification | **65%** | 85% | 1 | 2 |
| Calibration | **65%** | 85% | 9 | 3 |
| Alignment | **60%** | 80% | 12 | 3 |
| Motility | **60%** | 80% | 27 | 3 |
| Convergence | **60%** | 80% | 15 | 3 |

**Decision Logic:**
- ✅ **Auto-advance:** Confidence ≥ target OR (confidence ≥ min AND max attempts)
- 🔄 **Retry with coaching:** Confidence < min AND attempts < max
- ⚠️ **Mark inconclusive:** Confidence < min AND attempts ≥ max

---

## 🧪 Testing (60 seconds)

1. **Start app:**
   ```bash
   cd apps/mobile && npm start
   ```

2. **Navigate to:** `/vision-scan/alignment-v2`

3. **Scenario A – Auto-Advance:**
   - Position face properly (centered, stable, good lighting)
   - **Expected:** Confidence ≥ 80% → auto-advance to motility after 2s

4. **Scenario B – Retry with Coaching:**
   - Position face poorly (off-center, head turned, bad lighting)
   - **Expected:** Confidence < 60% → coaching card + retry button
   - Follow coaching, click retry
   - **Expected:** Improved confidence → auto-advance

5. **Scenario C – Inconclusive:**
   - Perform poorly 3 times → max attempts reached
   - **Expected:** Status = "inconclusive" → continue with warning

6. **Navigate to:** `/vision-scan/quality-review-v2`
   - **Verify:** All modules show confidence %, uncertainty, attempts, status

---

## 🛠️ Usage Example

```typescript
import { ExamController } from '@spect-it/cv'

// 1. Initialize in session context
const controller = new ExamController(sessionId, participantId)

// 2. Start module
controller.startModule('alignment')

// 3. Capture data (existing logic)
const result: AlignmentResult = tracker.computeResult()

// 4. Record result → get automatic decision
const decision = controller.recordModuleResult('alignment', result)

// 5. Handle decision
switch (decision.action) {
  case 'stop-success':
    // Auto-advance to next module
    router.push('/vision-scan/motility')
    break

  case 'retry':
    // Show coaching prompts
    showCoaching(decision.coachingPrompts)
    // Display retry button
    break

  case 'stop-inconclusive':
    // Mark inconclusive, recommend professional exam
    showInconclusiveWarning()
    // Allow continue with limited data
    break
}

// 6. Inspect state anytime
const state = controller.getModuleState('alignment')
console.log(`Confidence: ${state.confidence * 100}%`)
console.log(`Uncertainty: ${state.uncertainty.quantifiedUncertainty * 100}%`)
console.log(`Attempts: ${state.attemptNumber}/${state.maxAttempts}`)
```

---

## 📁 File Structure

```
packages/cv/src/vision-scan/
├── exam-controller-types.ts       (NEW) Types for closed-loop state
├── exam-controller.ts             (NEW) Main controller implementation
├── quality-engine.ts              (EXISTING) Wrapped by ExamController
└── index.ts                       (MODIFIED) Exports new types

apps/mobile/
├── components/vision-scan/
│   ├── AdaptiveCoachingCard.tsx   (NEW) Coaching prompt display
│   └── ModuleStateCard.tsx        (NEW) Module state visualization
├── app/vision-scan/
│   ├── quality-review-v2.tsx      (NEW) Enhanced quality review
│   └── alignment-v2.tsx           (NEW) Demo closed-loop integration
└── lib/vision-scan/
    └── vision-scan-context.tsx    (MODIFIED) Integrated ExamController
```

---

## ✅ Constraints Satisfied

- ✅ **Screening only** – No diagnosis or Rx values
- ✅ **Expo SDK 50** – No breaking changes
- ✅ **TypeScript safe** – No Vercel web build issues
- ✅ **Extends QualityEngine** – No rewrite
- ✅ **Draft PR** – Not for immediate merge

---

## 🔮 Out of Scope (Future Work)

- True refraction measurement
- Keratometry
- Full autonomous exam
- Production optimization
- Integration with all modules (only alignment-v2 is fully wired)

---

## 📚 Related PRs

This builds on Vision Scan P1-P5:
- #89 – Device qualification
- #90 – Calibration
- #91 – Alignment tracking
- #92 – Motility tracking
- #93 – Convergence measurement
- #94 – Quality engine
- #95 – Coaching UI
- #96 – PDF generation
- #97 – IPD-first distance + confidence

---

## 🤝 How to Review This PR

1. **Read architecture:** [CHANGELOG-closed-loop-controller.md](CHANGELOG-closed-loop-controller.md)
2. **Understand testing:** [TESTING-GUIDE-closed-loop.md](TESTING-GUIDE-closed-loop.md)
3. **Review code:**
   - `packages/cv/src/vision-scan/exam-controller.ts` – Core logic
   - `apps/mobile/app/vision-scan/alignment-v2.tsx` – Integration example
4. **Test manually:** Run test scenarios in TESTING-GUIDE
5. **Verify constraints:** Screening-only, no breaking changes, TypeScript safe

---

## 📞 Questions?

- **Architecture questions:** See `CHANGELOG-closed-loop-controller.md`
- **Testing questions:** See `TESTING-GUIDE-closed-loop.md`
- **Code questions:** Inline comments in `exam-controller.ts`
- **PR discussion:** [GitHub PR #107](https://github.com/TanyaStrauss1/Spect-IT/pull/107)

---

## 📄 License & Disclaimer

Part of Spect-IT smartphone ocular screening platform.  
**Screening-only implementation** – not for diagnosis or prescription dispensing.  
See invention disclosure for full context.
