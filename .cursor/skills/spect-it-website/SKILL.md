---
name: spect-it-website
description: Build and deploy the live Spect-IT vision screening site. Use when editing website/, spect-it.com, Vercel deploys, shop checkout, specialist booking, or provider console.
---

# Spect-IT website

Live product is the static app in `website/`, not `apps/web`. Domain: `https://www.spect-it.com`.

## Deploy

Vercel project **spect-it-app1** (team `equi-ledger`) serves `website/`.

```bash
cd website && vercel --prod --yes --scope equi-ledger
```

Do not change the repo-root `vercel.json` Next.js build. That path is not the live site.

## Medical framing

- Results are **screening**, never a diagnosis or dispensable prescription.
- Keep the footer / FAQ disclaimer on every patient-facing page.
- Prescription estimates come from subjective tests (acuity, duochrome, astigmatism) plus calibrated distance — not face geometry.

## Shop

- Curated catalog only. Do not scrape retailer sites.
- No fake payments, PayFast redirects, or “order placed” copy unless a real gateway exists.
- Checkout is an **enquiry / request-to-order**. Persist locally (and Supabase if available) as `status: enquiry`.

## Booking

- Times in the booking modal are **requested times**, not live availability.
- Find Specialists must work offline from GPS/Places using the curated SA directory in `specialists.js`.

## Provider console

- Page: `website/provider.html` → `/provider`
- Auth via Supabase edge function `provider-auth`. Do not hardcode new PINs in the client.

## Verify

Exercise the changed flow in the browser: homepage, a test start, shop cart + enquiry, specialist search or booking, provider sign-in if you touched it.
