# Spect-IT — Supabase setup checklist

> **Project:** `isebsxoofvbypjwbuymw` (TanyaStrauss1's Project)  
> The old `lecwenhoatzpnvmhoiua` project was permanently paused and replaced.

Run these steps in order to enable cloud bookings, notifications, and the practice console.

## 1. Create tables

In [Supabase SQL Editor](https://supabase.com/dashboard), run:

1. `website/CREATE_APPOINTMENTS_TABLE.sql`
2. `website/CREATE_APPOINTMENTS_RLS_V2.sql` (optional hardening)

## 2. Deploy Edge Functions

```bash
cd /path/to/Spect-IT
supabase login
supabase link --project-ref isebsxoofvbypjwbuymw

supabase functions deploy send-email
supabase functions deploy send-sms
supabase functions deploy provider-auth
```

## 3. Set secrets

```bash
# Email (Resend — https://resend.com)
supabase secrets set RESEND_API_KEY=re_xxxx
supabase secrets set EMAIL_FROM="Spect-IT <noreply@spect-it.com>"

# SMS (Twilio — optional)
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxx
supabase secrets set TWILIO_FROM_NUMBER=+27xxxx

# Practice console PIN
supabase secrets set SPECTIT_PROVIDER_PIN=your-secure-pin
```

## 4. Verify on live site

1. Hard-refresh https://www.spect-it.com (service worker `spectit-v4+`)
2. Open DevTools console → confirm `SupabaseStorage.appointments` exists
3. Book an appointment → check `appointments` table in Supabase
4. Open `/provider.html` → enter PIN → confirm/decline booking
5. Check Resend dashboard for patient email (if configured)

## 5. Monitoring (optional)

Add to `index.html` before `spectit-monitor.js`:

```html
<script>window.SPECTIT_SENTRY_DSN = 'https://xxx@xxx.ingest.sentry.io/xxx';</script>
```

## 6. Security notes

- Rotate the anon key if it was ever committed publicly
- Remove `_mvp_console` RLS policies when provider-auth is live
- Add Supabase Auth magic links for patients before scaling
