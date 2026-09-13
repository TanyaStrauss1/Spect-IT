# Supabase Auth Configuration for Production

This document outlines the required Supabase Auth configuration for reliable production authentication on spect-it.com.

## Critical: Redirect URLs Configuration

To ensure reliable sign-in, password reset, and email confirmation flows, the following URLs **must** be configured in your Supabase project dashboard:

### Location in Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/vimcaqophontrgcxhuzn
2. Navigate to **Authentication** → **URL Configuration**
3. Update the following fields:

### Site URL
```
https://www.spect-it.com
```

### Redirect URLs (Add all of these)
```
https://www.spect-it.com/auth/callback
https://spect-it.com/auth/callback
https://www.spect-it.com/auth/reset-password
https://spect-it.com/auth/reset-password
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
```

**Why both `www.spect-it.com` and `spect-it.com`?**
- Users may arrive at either domain
- Both domains should be configured to ensure seamless auth flows
- Consider implementing a redirect from one to the other at the DNS/hosting level for consistency

## Auth Flow Overview

### Sign Up Flow
1. User submits email/password at `/auth/signup`
2. Supabase sends confirmation email
3. User clicks link → redirected to `/auth/callback`
4. Callback validates session → redirects to `/dashboard`
5. **New in this PR:** If no participants exist, auto-creates default "Me" participant

### Sign In Flow
1. User submits credentials at `/auth/signin`
2. On success → client-side redirect to `/dashboard`
3. ParticipantProvider loads participants
4. **New in this PR:** If list is empty, creates default "Me" participant

### Password Reset Flow
1. User enters email at `/auth/forgot-password`
2. Supabase sends reset email with link to `/auth/reset-password`
3. User sets new password
4. Redirects to `/dashboard`

## First-Run Participant Creation

### Problem Statement
The participant migration (20260913180000_participants.sql) only backfilled "Me" participants for users who already had test_results. New users signing up after the migration would have zero participants, breaking the dashboard UI.

### Solution
Added `ensureSelfParticipant()` logic to both web and mobile ParticipantProviders:

```typescript
// Auto-creates "Me" participant if list is empty after user login
if (participantsList.length === 0) {
  const selfParticipant = await ensureSelfParticipant()
  if (selfParticipant) {
    participantsList = [selfParticipant]
  }
}
```

This ensures every authenticated user always has at least one participant ("Me") for taking tests.

## Files Changed
- `apps/web/src/lib/participants/participant-context.tsx` - Added ensure-self-participant logic
- `apps/mobile/lib/participants/participant-context.tsx` - Added ensure-self-participant logic (mobile)

## Testing Checklist

### Manual Testing Required
- [ ] Sign up a new test account at https://www.spect-it.com/auth/signup
- [ ] Confirm email and verify redirect to `/auth/callback` works
- [ ] Verify automatic redirect to `/dashboard` after callback
- [ ] Confirm "Me" participant is automatically created and active
- [ ] Test password reset flow from both `www` and non-`www` domains
- [ ] Verify existing users still see their participants correctly

### Production Deployment Steps
1. Apply Supabase redirect URL configuration (see above)
2. Deploy this branch to production (Vercel)
3. Test complete auth flow with new account
4. Monitor Sentry/logs for auth errors in first 24h

## Environment Variables

Ensure these are set in production (Vercel):
```env
NEXT_PUBLIC_SUPABASE_URL=https://vimcaqophontrgcxhuzn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

## Related Documentation
- Supabase Auth docs: https://supabase.com/docs/guides/auth
- Next.js App Router auth: https://supabase.com/docs/guides/auth/server-side/nextjs
