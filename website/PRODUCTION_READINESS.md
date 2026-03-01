# Spect-IT Production Readiness

This checklist tracks the final steps to launch Spect-IT safely for real users.

## Completed in code

- PWA install support (`manifest.json`, service worker, app icons).
- Offline fallback (`offline.html`) and static asset caching.
- Expanded multi-test suite with safety pre-check prompts.
- Legal pages added: `privacy.html`, `terms.html`.
- Footer legal links + stronger medical disclaimer.
- Supabase CLI project linking compatibility updated (`supabase/config.toml`).

## Required before public launch

1. **Custom domain and SSL**
   - In Vercel, attach your production domain (for example, `spect-it.com`).
   - Verify apex + `www` redirects and HTTPS enforcement.

2. **Monitoring and alerts**
   - Add Sentry (frontend runtime errors).
   - Add uptime checks (Vercel + root URL + key route checks).
   - Configure alert destination (email/SMS/Slack).

3. **Supabase data policy hardening**
   - Review all active tables and Row Level Security policies in production.
   - Confirm only intended data paths are writable from anon clients.
   - Move privileged writes to server-side/Edge Functions if needed.

4. **Privacy and legal review**
   - Replace placeholder policy text with jurisdiction-specific language.
   - Add support contact email and data deletion request endpoint/process.
   - Confirm medical disclaimer language with legal/compliance review.

5. **Clinical-quality validation**
   - Device matrix test: iOS Safari, Android Chrome, desktop Chrome/Edge/Safari.
   - Verify test repeatability under different brightness/lighting conditions.
   - Define and document referral criteria for urgent findings.

6. **App Store / distribution (optional)**
   - If shipping native mobile builds, align disclaimer text and metadata with store policy.
   - Verify screenshots and app description match implemented functionality.

## Quick verify commands

```bash
# Local website smoke check
cd website
python3 -m http.server 8080
# open http://localhost:8080
```

```bash
# Supabase status
cd ..
supabase projects list
supabase link --project-ref lecwenhoatzpnvmhoiua
supabase db push
```
