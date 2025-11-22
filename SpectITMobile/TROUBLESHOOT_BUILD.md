# 🔍 Troubleshooting Build Failure

## ❌ Common Issues

### 1. EAS Login Not Completed
**Symptom:** "Not logged in" error

**Solution:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas login
```
- Enter: `tanstrauss@gmail.com`
- Press Enter for password (uses browser)
- Approve in browser

---

### 2. Apple Developer Program Not Approved
**Symptom:** Build fails with "Apple Developer Program" error

**Solution:**
- Wait 24-48 hours after purchase for approval email
- Verify access at: https://developer.apple.com/account
- Check email for approval confirmation

---

### 3. Apple ID Password Incorrect
**Symptom:** "Authentication failed" or "Password incorrect"

**Solution:**
- Current password configured: `Tulip105!`
- If incorrect, update in `build_with_tanstrauss.exp`
- Or reset at: https://iforgot.apple.com

---

### 4. Account Locked
**Symptom:** "Account locked" error

**Solution:**
- Go to: https://iforgot.apple.com
- Enter: `tanstrauss@gmail.com`
- Follow recovery steps

---

## ✅ Step-by-Step Fix

### Step 1: Verify EAS Login
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas whoami
```

Should show: `Logged in as tanstrauss@gmail.com` (or your Expo username)

If not logged in:
```bash
eas login
```

---

### Step 2: Check Apple Developer Status
- Go to: https://developer.apple.com/account
- Sign in with: `tanstrauss@gmail.com`
- Verify Developer Program shows as "Active"

---

### Step 3: Try Build Again
```bash
./build_with_tanstrauss.exp
```

---

## 📊 Check Build Status

```bash
eas build:list --platform ios --limit 5
```

Or check dashboard:
https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds

---

## 🆘 Still Having Issues?

1. **Check build logs** at Expo dashboard
2. **Verify credentials** are correct
3. **Ensure Apple Developer Program** is approved
4. **Check account status** at appleid.apple.com

---

## 📋 Quick Checklist

- [ ] Logged in to EAS (`eas whoami` works)
- [ ] Apple Developer Program approved (24-48 hours after purchase)
- [ ] Can access https://developer.apple.com/account
- [ ] Apple ID password is correct (`Tulip105!`)
- [ ] Account is not locked

