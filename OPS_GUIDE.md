# Spect-IT Operations Guide

## Overview

This guide documents operational recommendations for deploying and maintaining the Spect-IT platform, including Vercel project structure, deployment workflows, and screening-honesty compliance.

---

## Vercel Deployment Architecture

### Recommended: Single Primary Production Project

**Primary Production Deployment:**
- **Project**: `apps/web` (Next.js 15)
- **Domain**: `spect-it.com` and `www.spect-it.com`
- **Framework**: Next.js with App Router
- **Purpose**: Comprehensive vision screening web application

**Configuration:**
- Root Directory: `apps/web`
- Build Command: `cd ../.. && npm install && cd apps/web && npm run build`
- Output Directory: `.next`
- Framework Preset: Next.js

**Why this architecture?**
- `apps/web` is the current production-ready application with full feature parity
- Consolidates maintenance, monitoring, and deployment to a single primary project
- Reduces complexity and potential version drift across multiple deployments
- Aligns with monorepo best practices (single source of truth per environment)

### Legacy and Deprecation Candidates

**⚠️ `website/` Directory — Deprecated**
- **Status**: Legacy static HTML/CSS/JS application
- **Current State**: Superseded by `apps/web` (Next.js)
- **Recommendation**: 
  - DO NOT deploy `website/` to production
  - DO NOT expand or add features to `website/`
  - Retain in codebase for historical reference only
  - Document deprecation in all relevant READMEs

**Vercel Projects Audit:**
If multiple Vercel projects currently exist pointing to different directories:
1. Identify which projects are actively serving `spect-it.com`
2. Consolidate to a single primary project targeting `apps/web`
3. Archive or delete legacy Vercel projects that pointed to `website/`
4. Update DNS records to ensure all traffic routes to the primary project

**Migration Checklist:**
- [ ] Audit all active Vercel projects in the Spect-IT organization
- [ ] Identify deployments pointing to `website/` (if any)
- [ ] Verify `apps/web` is the primary production deployment
- [ ] Archive or delete unused Vercel projects
- [ ] Update team documentation to reference `apps/web` as the canonical source
- [ ] Add deprecation notice to `website/README.md`

---

## Mobile App Store Deployment

### iOS (Apple App Store)

**Prerequisites:**
- Apple Developer Program membership ($99/year)
- Expo account with EAS CLI configured
- App created in App Store Connect

**Build & Submit:**
```bash
cd apps/mobile
eas build -p ios --profile production
eas submit -p ios --profile production
```

**Checklist:**
- [ ] Terms of Service URL configured: `https://spect-it.com/terms`
- [ ] Privacy Policy URL configured: `https://spect-it.com/privacy`
- [ ] App Store description emphasizes "screening only, not diagnosis"
- [ ] Medical disclaimers present in all test flows
- [ ] TestFlight internal testing complete
- [ ] Screenshots show screening disclaimers
- [ ] App Review notes clarify wellness screening positioning

**See:** `apps/mobile/APP_STORE_CHECKLIST.md` for complete submission guide

### Android (Google Play Store)

**Prerequisites:**
- Google Play Console account ($25 one-time fee)
- Expo account with EAS CLI configured
- App created in Play Console

**Build & Submit:**
```bash
cd apps/mobile
eas build -p android --profile production
# Upload AAB manually to Play Console or use eas submit
```

**Checklist:**
- [ ] Privacy Policy URL configured: `https://spect-it.com/privacy`
- [ ] Terms of Service URL configured: `https://spect-it.com/terms`
- [ ] Data Safety form completed (screening data usage disclosed)
- [ ] Content rating questionnaire emphasizes "no medical diagnosis"
- [ ] Store listing uses "screening" language, not "diagnosis"
- [ ] Internal testing track validated before production rollout

**See:** `apps/mobile/PLAY_STORE_CHECKLIST.md` for complete submission guide

---

## Screening-Honesty Compliance Checklist

Spect-IT is a **wellness screening tool**, not a medical device or diagnostic platform. All patient-facing copy, marketing materials, and technical documentation must maintain this positioning.

### Core Principles (from Product Roadmap)

1. **Screening Honesty**
   - Every patient-facing result is clearly labeled as **screening**, not diagnosis
   - No measurements are presented as prescriptions
   - Results explicitly state: "This is a screening tool. Consult an eye care professional for diagnosis and prescription."

2. **Confidence Over Certainty**
   - All measurements include confidence intervals or quality scores
   - "Inconclusive" is a valid and valuable result
   - We never fake precision when data quality is insufficient

3. **No Fake Rx**
   - We do not generate prescriptions from screening data
   - No automated "prescription" output or simulated optometrist reports
   - Clear referral pathways to licensed professionals

4. **Clinical Integration, Not Replacement**
   - Designed to complement, not replace, professional eye care
   - Built-in referral mechanisms to optometrists and ophthalmologists

### Compliance Checklist for New Features

Before merging any patient-facing feature, verify:

**User-Facing Copy:**
- [ ] Uses "screening" terminology, never "diagnosis" or "prescription"
- [ ] Includes disclaimer: "This is a screening tool. Results should be confirmed by a licensed optometrist or ophthalmologist."
- [ ] Avoids language that implies clinical certainty (e.g., "You have X condition")
- [ ] References "screening estimates" or "screening findings," not "results" alone
- [ ] Includes clear referral pathways to professional eye care

**Technical Outputs:**
- [ ] PDF exports include prominent screening disclaimers
- [ ] CSV exports include header disclaimers
- [ ] Share/export actions prepend screening language
- [ ] API responses include `screening: true` metadata where applicable
- [ ] No fields named "prescription", "diagnosis", or "clinical_result"

**UI/UX:**
- [ ] Test result screens display screening disclaimer prominently
- [ ] Result cards use neutral colors (avoid green "all clear" without context)
- [ ] "Refer to professional" recommendations are clear and actionable
- [ ] Quality scores/confidence intervals are visible to users
- [ ] "Inconclusive" results display explanation, not error state

**Store Listings & Marketing:**
- [ ] App Store / Play Store descriptions emphasize wellness screening
- [ ] Marketing materials avoid medical claims
- [ ] Website landing pages include screening disclaimers
- [ ] Blog posts and social media content reference "screening" positioning
- [ ] Press releases clarify non-diagnostic status

**Legal & Regulatory:**
- [ ] Terms of Service disclaim medical device status
- [ ] Privacy Policy discloses screening data usage
- [ ] Age rating justifications reference wellness screening (not medical diagnosis)
- [ ] Content rating questionnaires answered correctly ("Does your app diagnose medical conditions?" → No)

### Review Triggers

Initiate compliance review if:
- Adding new vision tests or screening modalities
- Changing result display language or formatting
- Updating PDF/CSV export templates
- Preparing App Store / Play Store submissions
- Receiving user feedback about "medical accuracy" expectations
- Planning marketing campaigns or press releases

### Escalation

If unsure whether copy or features comply with screening-honesty doctrine:
1. Review `SPECT_IT_PRODUCT_ROADMAP.md` → Doctrine section
2. Consult product/clinical leadership before merging
3. Flag for legal review if medical claims are unclear

---

## Monitoring & Maintenance

### Recommended Monitoring

**Vercel:**
- Set up deployment notifications (Slack/email)
- Monitor build logs for `apps/web` deployments
- Configure custom domains and SSL certificates
- Enable Vercel Analytics for usage insights

**Mobile (EAS):**
- Subscribe to build notifications from Expo
- Monitor App Store Connect / Play Console for crash reports
- Track TestFlight feedback for iOS beta testing
- Review Play Console internal testing feedback

**Supabase:**
- Monitor database query performance (Row-Level Security overhead)
- Track authentication success rates
- Review edge function logs for errors
- Set up alerts for high database connection counts

### Routine Maintenance Tasks

**Weekly:**
- Review Vercel deployment logs for errors
- Check Supabase dashboard for anomalies
- Triage user feedback from app stores

**Monthly:**
- Review npm package updates (security patches)
- Audit Expo SDK compatibility (avoid breaking major upgrades)
- Check App Store / Play Store review status
- Review screening-honesty compliance across new PRs

**Quarterly:**
- Audit Vercel projects (consolidate/archive unused)
- Review deprecated code paths (e.g., `website/`)
- Update dependencies (Expo, Next.js, Supabase libraries)
- Refresh app store screenshots if UI changes

---

## Deployment Workflows

### Production Deployment (apps/web)

1. **Merge PR to `main` branch**
   - Vercel automatically deploys on merge
   - Preview deployments available on PR branches

2. **Verify deployment**
   - Check Vercel dashboard for build success
   - Test production URL: `https://spect-it.com`
   - Verify environment variables are set correctly

3. **Rollback (if needed)**
   - Vercel Dashboard → Deployments → Redeploy previous version
   - Or revert commit and push to `main`

### Mobile App Updates

1. **Bump version in `apps/mobile/app.config.js`**
   - Increment `version` (e.g., `1.0.0` → `1.0.1`)
   - Increment `android.versionCode` and `ios.buildNumber`

2. **Build and submit**
   ```bash
   cd apps/mobile
   eas build -p ios --profile production
   eas build -p android --profile production
   eas submit -p ios --profile production
   # Upload Android AAB to Play Console manually or via eas submit
   ```

3. **Wait for review**
   - iOS: 24-48 hours typical (can take up to 7 days)
   - Android: 1-7 days (faster after first approval)

4. **Monitor rollout**
   - Enable staged rollout (Play Console: 20% → 50% → 100%)
   - Watch crash reports and user reviews

---

## Environment Variables

### Required for Production

**`apps/web` (Vercel):**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `NODE_ENV=production` — Automatically set by Vercel

**`apps/mobile` (EAS Secrets):**
```bash
eas secret:create --scope project --name SUPABASE_URL --value "your-url"
eas secret:create --scope project --name SUPABASE_ANON_KEY --value "your-key"
```

Reference in `app.config.js`:
```js
extra: {
  supabaseUrl: process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
}
```

---

## Supabase Database

### Migrations

Run migrations via Supabase CLI:
```bash
supabase link --project-ref your-project-ref
supabase db push
```

Or run SQL manually in Supabase Dashboard → SQL Editor.

### Row-Level Security (RLS)

**All tables must have RLS enabled.**
- `test_results` — Users can only read/write their own results
- `participants` — Users can only manage their own participants
- `user_profiles` — Users can only access their own profile

**Audit RLS policies quarterly** to ensure no security gaps.

---

## Troubleshooting

### Vercel Build Fails

**Issue:** "Module not found" or workspace dependency errors

**Solution:**
1. Ensure `package.json` in root has `workspaces` configured
2. Update build command to install from root:
   ```
   cd ../.. && npm install && cd apps/web && npm run build
   ```
3. Check Vercel Root Directory is set to `apps/web`

### EAS Build Fails

**Issue:** Workspace dependencies not resolving

**Solution:**
1. Add `eas-build-pre-install` script in `apps/mobile/package.json`:
   ```json
   "scripts": {
     "eas-build-pre-install": "cd ../.. && npm install"
   }
   ```
2. Or use `pnpm` for better monorepo support

### App Store Rejection (Medical Claims)

**Issue:** Apple/Google rejects app for making medical claims

**Solution:**
1. Review all in-app copy for "diagnosis" or "prescription" language
2. Update store listing to emphasize "screening only"
3. Add more prominent disclaimers in test result screens
4. Provide detailed response in App Review notes clarifying wellness positioning
5. Reference FDA guidance on wellness apps (non-medical device classification)

---

## Security & Privacy

### Data Handling

- **Screening results are PHI (Protected Health Information)** under HIPAA if used in clinical context
- **Supabase RLS enforces data isolation** between users
- **No third-party analytics SDKs** that transmit PHI without consent
- **Privacy Policy URL must be accessible** at all times: `https://spect-it.com/privacy`

### Secrets Management

- **Never commit secrets** to version control (`.env`, API keys)
- **Use Vercel Environment Variables** for web deployments
- **Use EAS Secrets** for mobile builds
- **Rotate Supabase keys** if compromised

---

## Contact & Escalation

For operational issues:
- **Vercel support:** https://vercel.com/support
- **Expo EAS support:** https://expo.dev/support
- **Supabase support:** https://supabase.com/support

For product/clinical questions:
- Review `SPECT_IT_PRODUCT_ROADMAP.md`
- Consult product and clinical leadership

---

**Document Status:** Living operational guide  
**Last Updated:** September 2026  
**Owner:** Engineering & Operations Team
