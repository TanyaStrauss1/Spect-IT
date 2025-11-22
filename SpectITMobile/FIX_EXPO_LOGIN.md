# 🔧 Fix Expo Login Error

## ❌ Error: "Your username, email, or password was incorrect"

### Possible Causes:
1. **Expo account doesn't exist** with `tanstrauss@gmail.com`
2. **Wrong password** for Expo account
3. **Account needs to be created** first

---

## ✅ Solution 1: Create Expo Account

### If account doesn't exist:

1. **Go to:** https://expo.dev/signup
2. **Sign up with:** `tanstrauss@gmail.com`
3. **Create password** (save it securely - this is different from Apple ID password!)
4. **Verify email** (check inbox)
5. **Then try login again:**
   ```bash
   eas login
   ```

---

## ✅ Solution 2: Reset Expo Password

### If account exists but password is wrong:

1. **Go to:** https://expo.dev/forgot-password
2. **Enter:** `tanstrauss@gmail.com`
3. **Follow password reset steps**
4. **Check email for reset link**
5. **Set new password**
6. **Then try login again:**
   ```bash
   eas login
   ```

---

## ✅ Solution 3: Check if Account Exists

1. **Go to:** https://expo.dev/login
2. **Try to sign in** with: `tanstrauss@gmail.com`
3. **If "account doesn't exist"** → Create account (Solution 1)
4. **If "wrong password"** → Reset password (Solution 2)

---

## ⚠️ Important: Expo Password vs Apple ID Password

**These are DIFFERENT passwords:**

- **Expo Account Password:** Used for `eas login` (Expo/Expo.dev)
- **Apple ID Password:** `Tulip105!` (used during iOS build for Apple Developer)

**You need BOTH:**
- Expo account password → For EAS login
- Apple ID password → For iOS build (already configured)

---

## 📋 Step-by-Step Fix

### Step 1: Create/Verify Expo Account
- Visit: https://expo.dev
- Sign up or sign in with `tanstrauss@gmail.com`
- Make sure you can access the account

### Step 2: Login to EAS
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas login
```
- Enter: `tanstrauss@gmail.com`
- Enter: **Your Expo account password** (not Apple ID password)

### Step 3: Verify Login
```bash
eas whoami
```
Should show: `Logged in as tanstrauss@gmail.com`

### Step 4: Build iOS App
```bash
./build_with_tanstrauss.exp
```

---

## 🔗 Useful Links

- **Expo Signup:** https://expo.dev/signup
- **Expo Login:** https://expo.dev/login
- **Forgot Password:** https://expo.dev/forgot-password
- **Expo Dashboard:** https://expo.dev/accounts/tanstrauss

---

## 💡 Quick Checklist

- [ ] Expo account exists with `tanstrauss@gmail.com`
- [ ] Know the Expo account password (different from Apple ID)
- [ ] Can sign in at https://expo.dev/login
- [ ] Ready to run `eas login`

---

**After fixing the login, you can proceed with the iOS build!**

