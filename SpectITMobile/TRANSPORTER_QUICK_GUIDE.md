# 📤 Quick Guide: Upload with Transporter (Option 1)

## ✅ Complete Workflow

### Step 1: Build the App

**Option A: Build in Xcode (Recommended for first time)**

1. **Open Xcode:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   open ios/SpectIT.xcworkspace
   ```

2. **Configure Signing:**
   - Click project → Select "SpectIT" target
   - "Signing & Capabilities" tab
   - ✅ Check "Automatically manage signing"
   - Select Team: "Tanya Strauss (P7BPRR2MY3)"
   - Bundle ID: `com.spectit.app`

3. **Build & Archive:**
   - Select "Any iOS Device" (not simulator)
   - **Product → Archive**
   - Wait 5-15 minutes

4. **Export IPA:**
   - After archive completes, click **"Distribute App"**
   - Select **"App Store Connect"**
   - Choose **"Export"** (not Upload)
   - Save IPA file to: `~/Desktop/SpectIT.ipa`

**Option B: Build via Terminal (After signing configured)**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./BUILD_FOR_APP_STORE_TERMINAL.sh
```

IPA will be at: `build/AppStore/SpectIT.ipa`

---

### Step 2: Install Transporter

1. **Open Mac App Store**
2. **Search:** "Transporter"
3. **Install** (free, by Apple)
4. **Open** from Applications

---

### Step 3: Upload with Transporter

1. **Open Transporter**
2. **Sign in** with: `tanstrauss@gmail.com`
3. **Drag IPA file** into Transporter window
   - From Xcode: `~/Desktop/SpectIT.ipa`
   - From Terminal: `build/AppStore/SpectIT.ipa`
4. **Verify information:**
   - App Name: Spect-IT
   - Version: 1.0.0
   - Bundle ID: com.spectit.app
5. **Click "Deliver"**
6. **Wait** for upload (5-10 minutes)

---

### Step 4: Wait for Processing

1. **Go to:** https://appstoreconnect.apple.com/apps/6755681856
2. **Click "TestFlight" tab**
3. **Wait 15-30 minutes** for processing
4. **Status:** "Processing" → "Ready to Submit"

---

### Step 5: Submit for Review

1. **Go to "App Store" tab**
2. **Select build** in Build section
3. **Complete required fields**
4. **Click "Submit for Review"**

---

## 💡 Why Xcode First?

**First build should be in Xcode because:**
- ✅ Sets up signing certificates automatically
- ✅ Creates provisioning profiles
- ✅ Configures team properly
- ✅ After that, terminal builds work

**Then you can use terminal builds for future updates!**

---

## 📋 Checklist

- [ ] Signing configured in Xcode
- [ ] App built and archived
- [ ] IPA file exported
- [ ] Transporter installed
- [ ] Signed in to Transporter
- [ ] IPA uploaded
- [ ] Build processing (wait 15-30 min)
- [ ] Build selected in App Store tab
- [ ] Submitted for review

---

**Transporter is the easiest upload method!**

