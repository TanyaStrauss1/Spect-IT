# Changelog: Cover-Uncover Screening Feature

## [Draft PR #108] - 2026-09-18

### Added

#### Clinical Screening
- **Cover-uncover (occlusion) screening test** integrated into vision scan flow
- 5-phase test sequence: baseline → cover-left → uncover-left → cover-right → uncover-right
- Camera-verified occlusion detection using face/eye landmark visibility
- Eye position shift calculation (horizontal & vertical, in degrees)
- Asymmetry scoring (0-100 scale) with clinical threshold (~2° / score 40)
- Screening assessment with professional exam recommendation when appropriate

#### Quality Controls
- Head displacement quality gate (<50mm movement from baseline)
- Minimum 5 frames per phase requirement
- Occlusion confidence threshold (0.6+)
- Frame quality scoring (0.5+ threshold)
- Real-time user feedback for occlusion verification

#### User Interface
- New cover-uncover screen component (`apps/mobile/app/vision-scan/cover-uncover.tsx`)
- Phase-based animated instructions
- Real-time warnings for improper coverage or head movement
- Results display with eye shift measurements and asymmetry indicators
- Skip option (test is optional in scan flow)
- Retry functionality for quality issues

#### Honest Limitations
- Explicit reliability disclaimers in results
- Acknowledgment of heuristic-based detection limitations
- Clear statement that results are screening-only, not diagnostic
- Professional examination recommendation for definitive assessment

#### Technical Implementation
- `CoverUncoverTracker` class (`packages/cv/src/vision-scan/cover-uncover-tracker.ts`)
- `detectOcclusion()` helper function for camera-based verification
- New types: `CoverUncoverPhase`, `OcclusionStatus`, `CoverUncoverFrame`, `CoverUncoverResult`
- Session state integration with optional `coverUncover` field
- Progress stepper updated to show "Cover Test" step

### Changed

#### Vision Scan Flow
- Inserted cover-uncover step between alignment and motility
- Updated sequence: Qualification → Calibration → Alignment → **Cover-Uncover** → Motility → Convergence → Quality Review
- Alignment screen now navigates to cover-uncover instead of directly to motility

#### Session Management
- `VisionScanSession` includes optional `coverUncover: CoverUncoverResult | null`
- Screening summary considers cover-uncover asymmetry in issues list
- Added `setCoverUncover` action to session actions

#### Progress Tracking
- Progress stepper includes new "Cover Test" step
- Module enumeration includes 'cover-uncover'
- Repeat attempt tracking supports cover-uncover module

### Technical Details

#### Files Created (2)
- `packages/cv/src/vision-scan/cover-uncover-tracker.ts` - Core tracking logic (360 lines)
- `apps/mobile/app/vision-scan/cover-uncover.tsx` - Screen component (634 lines)

#### Files Modified (7)
- `packages/cv/src/vision-scan/types.ts` - Type definitions
- `packages/cv/src/vision-scan/session-types.ts` - Session state types
- `packages/cv/src/vision-scan/index.ts` - Module exports
- `packages/cv/src/index.ts` - Package exports
- `apps/mobile/lib/vision-scan/vision-scan-context.tsx` - Session context
- `apps/mobile/components/vision-scan/ProgressStepper.tsx` - UI component
- `apps/mobile/app/vision-scan/alignment.tsx` - Navigation update

#### Dependencies
- Uses existing Expo Camera and Face Detector APIs
- Compatible with Expo SDK 50
- TypeScript types are web-safe (no mobile-only types in core package)

### Screening Language

All user-facing text adheres to screening-only language:
- ✅ "Eye alignment variation detected"
- ✅ "Professional examination recommended"
- ✅ "Asymmetry detected during screening"
- ❌ No diagnosis claims (e.g., "strabismus")

### Limitations Acknowledged

Explicitly disclosed in reliability notes:
1. Occlusion detection is heuristic-based, not perfect
2. Eye position estimates are approximate
3. Professional examination required for definitive assessment
4. Requires user compliance (correct coverage, head stability)

### Testing Status

- [x] Code implementation complete
- [x] TypeScript types defined
- [x] Integration with vision scan flow
- [x] PR created (draft)
- [ ] Manual device testing pending
- [ ] TypeScript compilation verification pending
- [ ] Performance testing pending
- [ ] Clinical/legal review of screening language pending

### References

- Invention disclosure §§19, 62 (monocular occlusion alignment)
- Pull Request: https://github.com/TanyaStrauss1/Spect-IT/pull/108
- Branch: `cursor/cover-uncover-screening-c51b`
- Implementation docs: `COVER_UNCOVER_IMPLEMENTATION.md`

### Next Steps

1. Manual testing on physical iOS/Android devices
2. Verify TypeScript compilation across web/mobile
3. Test occlusion detection accuracy in various lighting
4. Review screening language with clinical team
5. Performance testing on older devices
6. Consider accessibility improvements
7. Gather user feedback on instructions clarity

---

## Notes for Reviewers

### Key Design Decisions

1. **Optional Test:** Cover-uncover is optional (can be skipped) to avoid blocking scan completion if user has difficulty
2. **5-Phase Flow:** Baseline → cover-left → uncover-left → cover-right → uncover-right provides comprehensive data
3. **Heuristic Detection:** Uses face/eye landmark visibility as occlusion proxy (honest about limitations)
4. **Screening-Only:** Explicitly avoids diagnosis claims, frames results as screening requiring professional follow-up
5. **Quality Gates:** Multiple quality checks ensure data reliability (head stability, occlusion verification, frame quality)

### Testing Priorities

1. **Occlusion Detection Accuracy:** Most critical - does it reliably detect covered eyes?
2. **User Experience:** Are instructions clear? Is feedback helpful?
3. **Edge Cases:** Wrong eye covered, incomplete coverage, head movement
4. **Device Compatibility:** Works on various devices/cameras?
5. **Lighting Robustness:** Functions in different lighting conditions?

### Known Risks

1. **Occlusion detection may fail** with certain hand positions or lighting
2. **Eye position estimates are approximate** - not clinical-grade precision
3. **User compliance required** - results invalid if instructions not followed
4. **Performance impact** - camera + face detection is resource-intensive

### Future Enhancements (Out of Scope)

- Machine learning for better occlusion detection
- Historical tracking of cover-uncover results over time
- Integration with clinical reports/exports
- More sophisticated eye tracking algorithms
- Device sensor integration (gyroscope, accelerometer)
