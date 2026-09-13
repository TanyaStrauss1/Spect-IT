# Supabase Dashboard Configuration Actions

⚠️ **COORDINATOR ACTION REQUIRED** - These settings must be manually configured in the Supabase dashboard.

## Project Details
- **Project ID:** vimcaqophontrgcxhuzn
- **Region:** eu-west-1
- **Project Name:** Spect-IT
- **Dashboard URL:** https://supabase.com/dashboard/project/vimcaqophontrgcxhuzn

## Required Configuration Changes

### Step 1: Navigate to Auth Settings
1. Go to https://supabase.com/dashboard/project/vimcaqophontrgcxhuzn
2. Click **Authentication** in the left sidebar
3. Click **URL Configuration** tab

### Step 2: Update Site URL
**Current value:** (check dashboard)
**Required value:**
```
https://www.spect-it.com
```

### Step 3: Add Redirect URLs
Click "Add redirect URL" and add each of these:

#### Production URLs (Required)
```
https://www.spect-it.com/auth/callback
https://spect-it.com/auth/callback
https://www.spect-it.com/auth/reset-password
https://spect-it.com/auth/reset-password
```

#### Development URLs (Optional - for local testing)
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
```

### Step 4: Save Changes
Click **Save** at the bottom of the URL Configuration page.

## Verification

After applying these changes, test the following flows:

1. **Sign Up Flow**
   - Visit https://www.spect-it.com/auth/signup
   - Create new test account
   - Check email for confirmation link
   - Click link → should redirect to /auth/callback → then /dashboard
   - Verify "Me" participant is automatically created

2. **Password Reset Flow**
   - Visit https://www.spect-it.com/auth/forgot-password
   - Enter test email
   - Click reset link in email
   - Should land on /auth/reset-password
   - Set new password → redirects to /dashboard

3. **Sign In Flow**
   - Visit https://www.spect-it.com/auth/signin
   - Enter credentials
   - Should redirect to /dashboard
   - Verify participant context loads correctly

## Why Both `www` and Non-`www`?

Users may arrive at either:
- `https://www.spect-it.com` (with www)
- `https://spect-it.com` (without www)

Both need to be configured to handle auth callbacks correctly. Consider implementing a DNS-level redirect to standardize on one domain.

## Related Documentation
- Full auth guide: `/workspace/SUPABASE_AUTH_CONFIG.md`
- PR: https://github.com/TanyaStrauss1/Spect-IT/pull/80
