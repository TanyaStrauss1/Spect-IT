# 🔐 Expo Login Steps

## Your Account Details
- **Email**: [YOUR_APPLE_ID]
- **Expo Account**: https://expo.dev/accounts/tstrauss

## Login Commands

### Step 1: Navigate to Project
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
```

### Step 2: Login
```bash
eas login
```

**What happens:**
1. Terminal prompts: `Email or username:`
2. Type: `[YOUR_APPLE_ID]`
3. Press Enter
4. Browser opens automatically
5. Click "Allow" or "Authorize" in browser
6. Terminal shows: "Successfully logged in"

### Step 3: Verify
```bash
eas whoami
```

**Expected output:**
```
Logged in as tstrauss
```

### Step 4: Configure Project
```bash
eas build:configure
```

**Follow the prompts:**
- Project name: `spectit-mobile` (or press Enter for default)
- Platform: Select iOS, Android, or both
- This will update `eas.json`

## Quick Copy-Paste

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile && eas login
# When prompted, enter: [YOUR_APPLE_ID]
# Approve in browser when it opens
```

## Troubleshooting

### Browser doesn't open
- Manually go to: https://expo.dev
- Login there first
- Then run `eas login` again

### "Invalid credentials"
- Check email is correct: [YOUR_APPLE_ID]
- Make sure you have an Expo account
- Try resetting password at https://expo.dev

### "Already logged in"
- Run `eas whoami` to verify
- If correct account, proceed to `eas build:configure`

---

**Run `eas login` in your terminal now!**

