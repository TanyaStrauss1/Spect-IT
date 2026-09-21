# Find Care Nearby - Manual Test Plan

## Overview

This document provides step-by-step instructions for manually testing the "Find Care Nearby" feature on both web and mobile platforms.

## Setup

### Google Places API Key (Optional)

The feature works with or without an API key. To test the full functionality with live provider data:

1. **Create a Google Cloud Project** (if you don't have one)
   - Go to https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Places API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Places API (New)" or "Places API"
   - Click "Enable"

3. **Create API Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
   - (Recommended) Click "Restrict Key":
     - Under "API restrictions", select "Restrict key"
     - Select "Places API" (or "Places API (New)")
     - Under "Application restrictions", add your domain for production

4. **Configure Environment Variable**
   ```bash
   # In apps/web/.env.local
   GOOGLE_PLACES_API_KEY=your-actual-api-key-here
   ```

5. **Restart Development Server**
   ```bash
   cd apps/web
   npm run dev
   ```

### Without API Key

If you don't set the API key, the feature will gracefully fall back to Google Maps deep links. This still provides value to users.

## Test Scenarios

### Scenario 1: Web App WITH API Key

#### Setup
1. Set `GOOGLE_PLACES_API_KEY` in `apps/web/.env.local`
2. Start dev server: `cd apps/web && npm run dev`
3. Navigate to http://localhost:3000
4. Sign in or create account
5. Take a visual acuity test with poor results (miss several letters to get logMAR > 0.3)
   - OR: Mock Vision Scan data with `recommendsProfessionalExam: true`

#### Test Steps

1. **Navigate to Clinical Summary**
   - Go to Dashboard → "View Clinical Summary"
   - Verify "Find Nearby Eye Care" section appears

2. **Test Geolocation Search**
   - Click "📍 Find Care Near Me"
   - Grant location permission when browser prompts
   - **Expected**: Loading indicator appears, then results load
   - **Verify**:
     - Results show with name, address, phone (if available)
     - "Open now" or "Closed" status (if available)
     - Star rating and reviews (if available)
     - "🗺️ Directions" button
     - "📞 Call" button (if phone available)
   - Click "Directions" → **Expected**: Google Maps opens with location
   - Click "Call" → **Expected**: Phone app opens (or prompts to install one)

3. **Test Manual Search**
   - Enter a city name (e.g., "Boston", "San Francisco", "Cape Town")
   - Click "🔍 Search"
   - **Expected**: Results load for that city
   - **Verify**: Same result display as above

4. **Test Error Handling**
   - Deny location permission
   - **Expected**: Error message + fallback to manual search
   - Enter invalid city (e.g., "asdfghjkl")
   - **Expected**: "No providers found" message + fallback Maps link

5. **Verify Disclaimers**
   - **Verify**: Blue disclaimer box appears at top
   - **Verify**: Text mentions "referral aid only — not a medical recommendation"

### Scenario 2: Web App WITHOUT API Key

#### Setup
1. Remove or comment out `GOOGLE_PLACES_API_KEY` from `.env.local`
2. Restart dev server
3. Navigate to Clinical Summary (as above)

#### Test Steps

1. **Verify Graceful Degradation**
   - Click "📍 Find Care Near Me" OR enter city and search
   - **Expected**: 
     - Error message: "Places API is not configured"
     - Fallback box appears with "Open Google Maps Search" button
   - Click "Open Google Maps Search"
   - **Expected**: Google Maps web opens in new tab with search for "optometrist eye care"

2. **Verify Feature Still Useful**
   - **Verify**: User can still find providers via Maps link
   - **Verify**: No JavaScript errors in console
   - **Verify**: Page doesn't break

### Scenario 3: Mobile App (React Native)

#### Setup
1. Start Expo dev server: `cd apps/mobile && npm start`
2. Scan QR code with Expo Go app (or run on simulator)
3. Sign in and create test results (as above)

#### Test Steps

1. **Navigate to Clinical Summary Tab**
   - Tap "Clinical Summary" tab
   - **Verify**: "Find Nearby Eye Care" section appears

2. **Test Location Search**
   - Tap "📍 Find Care Near Me"
   - **Expected**: 
     - On iOS: Apple Maps opens with search
     - On Android: Google Maps opens with search
   - **Verify**: Search query includes "optometrist eye care"

3. **Test Manual Search**
   - Enter a city name
   - Tap "🔍 Search"
   - **Expected**: Either results appear OR Maps app opens with search

4. **Test Quick Maps Button**
   - Tap "🗺️ Open Maps" in fallback box
   - **Expected**: Maps app opens

5. **Test Actions (if results load)**
   - Tap "🗺️ Directions"
   - **Expected**: Maps app opens with navigation
   - Tap "📞 Call"
   - **Expected**: Phone app opens (or prompts)

### Scenario 4: Conditional Display Logic

#### Test Different Screening Results

1. **Good Vision Results (should NOT show)**
   - Create test result with logMAR ≤ 0.3 (e.g., 20/40 or better)
   - Navigate to Clinical Summary
   - **Expected**: "Find Nearby Eye Care" section does NOT appear

2. **Poor Vision Results (should show)**
   - Create test result with logMAR > 0.3 (e.g., 20/63 or worse)
   - Navigate to Clinical Summary
   - **Expected**: "Find Nearby Eye Care" section appears

3. **Vision Scan Referral (should show)**
   - Create Vision Scan result with `recommendsProfessionalExam: true`
   - Navigate to Clinical Summary
   - **Expected**: "Find Nearby Eye Care" section appears

## Expected Behaviors Summary

### With API Key
- ✅ Geolocation search returns real provider data
- ✅ Manual city search returns real provider data
- ✅ Results show name, address, phone, status, ratings
- ✅ Maps and call links work
- ✅ Error handling shows fallback Maps link

### Without API Key
- ✅ Feature still appears when conditions met
- ✅ Error message shown clearly
- ✅ Fallback "Open Google Maps" button always works
- ✅ No crashes or console errors
- ✅ Users can still find providers via Maps

### Mobile-Specific
- ✅ Location search opens native Maps app directly
- ✅ Manual search falls back to Maps app
- ✅ Directions and Call buttons use native intents
- ✅ Works on both iOS (Apple Maps) and Android (Google Maps)

## Known Limitations

1. **API Cost**: Google Places API is pay-per-request. Free tier includes $200/month (~30K searches).
   - Monitor usage in Google Cloud Console
   - Set billing alerts if needed

2. **Rate Limits**: Places API has rate limits
   - Default: 100 requests per second per project
   - Can increase via quota request

3. **Data Accuracy**: Provider data is from Google's database
   - Phone numbers and hours may be outdated
   - Not all providers may be listed

4. **Geolocation Permission**: Requires user consent
   - iOS: Permission prompt on first use
   - Web: Browser prompt on first use
   - If denied, falls back to manual search

5. **No Endorsement**: Feature does NOT recommend specific providers
   - Clear disclaimers present
   - Users choose their own provider

## Security Checklist

- [x] API key is server-side only (Next.js API route)
- [x] API key never exposed to client
- [ ] (Production) API key restricted to domain in Google Cloud Console
- [ ] (Production) API key restricted to Places API only
- [x] No user data sent to Google beyond search query
- [x] No PII in API requests

## Deployment Checklist

- [x] Code committed and pushed
- [x] PR created with test plan
- [ ] Manual testing completed (with and without API key)
- [ ] Mobile testing completed (iOS and Android)
- [ ] Staging deployment tested
- [ ] API key added to Vercel environment variables (for production)
- [ ] API key restrictions configured in Google Cloud Console
- [ ] Billing alerts set up in Google Cloud Console

## Troubleshooting

### "No providers found"
- Check if API key is valid
- Verify Places API is enabled in Google Cloud Console
- Try a different city or broader search query
- Check API quota/usage in Google Cloud Console

### Geolocation not working
- Verify HTTPS (required for geolocation API)
- Check browser permissions
- Try manual city search instead

### API Route errors (500)
- Check server logs: `npm run dev` terminal output
- Verify `GOOGLE_PLACES_API_KEY` is set in `.env.local`
- Restart dev server after changing env vars

### Mobile Maps not opening
- Verify Linking permissions in app.json/info.plist
- Check device has Maps app installed
- Try web fallback URL

## Questions / Issues

If you encounter any issues during testing, please comment on the PR:
https://github.com/TanyaStrauss1/Spect-IT/pull/125
