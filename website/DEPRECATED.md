# DEPRECATED: Static Website Version

**⚠️ This directory contains the legacy static HTML/CSS/JS version of Spect-IT.**

## Status

This implementation is **deprecated** and should not be used for new development.

## Why Deprecated?

The static `website/` implementation has been superseded by the modern app architecture:

- **Primary Production App**: `/apps/web` (Next.js) - deployed at spect-it.com
- **Mobile App**: `/apps/mobile` (React Native + Expo)
- **Shared Clinical Algorithms**: `/packages/cv` - the source of truth for all vision tests

## Key Differences

### Old (website/ - DEPRECATED)
- Single `tests.js` file with all tests
- No structured package separation
- Manual DOM manipulation
- Deployment via Vercel from this directory

### New (apps/web + packages/cv - CURRENT)
- Modular TypeScript architecture
- Clinical algorithms in `@spect-it/cv` package
- Type-safe with full test coverage
- Framework-agnostic vision testing logic
- Proper separation: UI (apps) vs algorithms (packages)

## Migration Notes

All clinical test logic from `website/tests.js` has been ported to:
- `/packages/cv/src/tests/visual-acuity.ts` (ETDRS/LogMAR)
- `/packages/cv/src/tests/color-vision.ts` (confusion-line plates)
- `/packages/cv/src/tests/contrast.ts` (Pelli-Robson style)
- `/packages/cv/src/tests/astigmatism.ts` (clock dial)
- `/packages/cv/src/tests/visual-field.ts` (Amsler grid)
- `/packages/cv/src/tests/prescription.ts` (pinhole screening)

## Current Deployment

**Live Site**: The deployed spect-it.com runs from `/apps/web`, **not** from `/website/`.

If you're looking to deploy updates:
```bash
# Deploy the modern app (from /apps/web)
cd apps/web
vercel --prod
```

## Removal Timeline

This directory is kept temporarily for reference but may be removed in a future cleanup.
For all new work, use `/apps/web` and `/apps/mobile` with the `@spect-it/cv` package.

---

**Last Updated**: September 2026  
**Superseded By**: apps/web + packages/cv architecture (PR #58)
