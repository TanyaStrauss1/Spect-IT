# 🔧 Fix EAS Login Issues

## Common Problems and Solutions

### 1. "Command not found: eas"

**Problem:** EAS CLI is not installed

**Solution:**
```bash
npm install -g eas-cli
```

Or if using npx:
```bash
npx eas-cli login
```

---

### 2. "Input is required, but stdin is not readable"

**Problem:** Running in non-interactive terminal

**Solution:**
- Run the command in YOUR terminal (not through automation)
- Use: `eas login` directly in terminal
- Or use browser-only login: `eas login --web`

---

### 3. Browser Not Opening

**Problem:** Browser doesn't open automatically

**Solution:**
```bash
eas login --web
```

This will:
- Show you a URL to open manually
- Copy the URL and paste in browser
- Complete authentication there

---

### 4. "Not logged in" After Login

**Problem:** Login didn't complete properly

**Solution:**
1. Try logging in again: `eas login`
2. Make sure you approved in browser
3. Check with: `eas whoami`
4. If still not working, try: `eas logout` then `eas login` again

---

### 5. Network/Connection Issues

**Problem:** Can't connect to Expo servers

**Solution:**
```bash
# Check internet connection
ping expo.dev

# Try with verbose output
eas login --verbose

# Check Expo status
# Visit: https://status.expo.dev
```

---

## Alternative Login Methods

### Method 1: Browser-Only Login
```bash
eas login --web
```
- Shows URL to open in browser
- No terminal interaction needed
- Most reliable method

### Method 2: Using Access Token
```bash
# Get token from: https://expo.dev/accounts/[username]/settings/access-tokens
eas login --access-token YOUR_TOKEN
```

### Method 3: Reinstall EAS CLI
```bash
npm uninstall -g eas-cli
npm install -g eas-cli
eas login
```

---

## Step-by-Step Fix

### Step 1: Verify EAS CLI Installation
```bash
which eas
eas --version
```

If not found:
```bash
npm install -g eas-cli
```

### Step 2: Try Browser-Only Login
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas login --web
```

### Step 3: Follow Browser Instructions
- Copy the URL shown
- Open in browser
- Sign in with: `tanstrauss@gmail.com`
- Approve access

### Step 4: Verify Login
```bash
eas whoami
```

Should show: `Logged in as tanstrauss@gmail.com`

---

## Still Not Working?

1. **Check Expo account exists:**
   - Visit: https://expo.dev
   - Try signing in with: `tanstrauss@gmail.com`
   - If account doesn't exist, create one first

2. **Clear cache:**
   ```bash
   rm -rf ~/.expo
   eas login
   ```

3. **Check for updates:**
   ```bash
   npm update -g eas-cli
   ```

4. **Contact Expo support:**
   - Visit: https://expo.dev/support
   - Or check: https://docs.expo.dev

---

## Quick Test

Run this to test everything:
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas --version
eas whoami
```

If `eas whoami` shows "Not logged in", then run:
```bash
eas login --web
```

