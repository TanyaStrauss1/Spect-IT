#!/bin/bash

# Complete Spect-IT App Creation - End to End Solution
# This script handles everything possible to get your app to the App Store

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 COMPLETE SPECT-IT APP CREATION - FULL CAPABILITY                   ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Comprehensive Diagnostics
echo "1️⃣  RUNNING COMPREHENSIVE DIAGNOSTICS..."
echo ""

# Check all prerequisites
PREREQS_OK=true

# Xcode
if command -v xcodebuild &> /dev/null; then
    XCODE_VERSION=$(xcodebuild -version 2>&1 | head -1 | awk '{print $2}')
    echo "   ✅ Xcode $XCODE_VERSION"
else
    echo "   ❌ Xcode not found"
    PREREQS_OK=false
fi

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js $NODE_VERSION"
else
    echo "   ❌ Node.js not found"
    PREREQS_OK=false
fi

# EAS CLI
if command -v eas &> /dev/null; then
    EAS_VERSION=$(eas --version 2>&1 | head -1)
    echo "   ✅ EAS CLI: $EAS_VERSION"
else
    echo "   ⚠️  EAS CLI not found - installing..."
    npm install -g eas-cli
fi

# Check EAS login
if eas whoami &> /dev/null; then
    EAS_USER=$(eas whoami 2>&1)
    echo "   ✅ EAS logged in as: $EAS_USER"
else
    echo "   ⚠️  Not logged into EAS"
    echo "   Run: eas login"
fi

# Check project structure
echo ""
echo "   📁 Checking project structure..."
if [ -f "app.json" ]; then
    BUNDLE_ID=$(grep -A 2 '"ios"' app.json | grep 'bundleIdentifier' | cut -d'"' -f4)
    echo "   ✅ app.json found (Bundle ID: $BUNDLE_ID)"
else
    echo "   ❌ app.json not found"
    PREREQS_OK=false
fi

if [ -d "ios" ]; then
    echo "   ✅ iOS project exists"
    if [ -d "ios/SpectIT.xcworkspace" ]; then
        echo "   ✅ Xcode workspace found"
    fi
else
    echo "   ⚠️  iOS folder not found - will generate"
fi

# Check dependencies
if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
        echo "   ⚠️  Installing dependencies..."
        npm install
    else
        echo "   ✅ Dependencies installed"
    fi
fi

if [ "$PREREQS_OK" = false ]; then
    echo ""
    echo "   ❌ Prerequisites not met. Please fix issues above."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 2: Ensure iOS Project Exists
echo "2️⃣  ENSURING iOS PROJECT IS READY..."
echo ""

if [ ! -d "ios" ] || [ ! -d "ios/SpectIT.xcworkspace" ]; then
    echo "   📱 Generating iOS project..."
    npx expo prebuild --platform ios --clean
    echo "   ✅ iOS project generated"
    
    if [ -f "ios/Podfile" ]; then
        echo "   📦 Installing CocoaPods..."
        cd ios
        pod install
        cd ..
        echo "   ✅ CocoaPods installed"
    fi
else
    echo "   ✅ iOS project ready"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 3: Clean Build Artifacts
echo "3️⃣  CLEANING BUILD ARTIFACTS..."
echo ""

rm -rf build/
rm -rf ios/build/
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-* 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/Spect-* 2>/dev/null || true
echo "   ✅ Cleaned"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 4: Verify Configuration
echo "4️⃣  VERIFYING CONFIGURATION..."
echo ""

# Check app.json
if grep -q '"bundleIdentifier": "com.spectit.app"' app.json; then
    echo "   ✅ Bundle ID correct: com.spectit.app"
else
    echo "   ⚠️  Bundle ID may be incorrect"
fi

if grep -q '"appleTeamId": "P7BPRR2MY3"' app.json; then
    echo "   ✅ Team ID correct: P7BPRR2MY3"
else
    echo "   ⚠️  Team ID may be incorrect"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 5: Build Strategy
echo "5️⃣  SELECTING BUILD STRATEGY..."
echo ""

# Check if credentials are set up
CREDS_CHECK=$(eas credentials --platform ios --non-interactive 2>&1 || echo "needs_setup")

if echo "$CREDS_CHECK" | grep -q "needs_setup\|not set up\|Failed\|Input is required"; then
    echo "   ⚠️  EAS credentials need interactive setup"
    echo ""
    echo "   📋 BUILD OPTIONS:"
    echo ""
    echo "   OPTION A: EAS Cloud Build (Recommended)"
    echo "   ──────────────────────────────────────"
    echo "   1. Set up credentials (run in terminal):"
    echo "      eas credentials --platform ios"
    echo "      → Select: production"
    echo "      → Apple ID: tanstrauss@gmail.com"
    echo "      → Password: (app-specific if 2FA)"
    echo ""
    echo "   2. Then build:"
    echo "      eas build --platform ios --profile production"
    echo ""
    echo "   OPTION B: Xcode Build (Local)"
    echo "   ─────────────────────────────"
    echo "   Opening Xcode for local build..."
    open ios/SpectIT.xcworkspace
    echo ""
    echo "   In Xcode:"
    echo "   1. Wait for indexing"
    echo "   2. Configure signing (Team: P7BPRR2MY3)"
    echo "   3. Select 'Any iOS Device'"
    echo "   4. Product → Archive"
    echo "   5. Distribute App → App Store Connect"
    echo ""
    
    BUILD_METHOD="interactive"
else
    echo "   ✅ Credentials appear to be set up"
    echo "   🚀 Attempting EAS build..."
    echo ""
    
    if eas build --platform ios --profile production --non-interactive 2>&1; then
        BUILD_METHOD="eas_success"
    else
        BUILD_METHOD="eas_failed"
        echo "   ⚠️  EAS build failed or requires interaction"
        echo "   💡 Opening Xcode as fallback..."
        open ios/SpectIT.xcworkspace
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 6: Post-Build Instructions
echo "6️⃣  POST-BUILD STEPS..."
echo ""

cat << 'POSTBUILD'

📋 AFTER BUILD COMPLETES:

   1. Wait for Processing (15-30 minutes):
      → https://appstoreconnect.apple.com/apps/6755681856
      → Go to 'TestFlight' tab
      → Wait for build to show 'Ready to Submit'

   2. Select Build in App Store:
      → Go to 'App Store' tab (NOT TestFlight)
      → Scroll to 'Build' section
      → Click 'Select a build before you submit your app'
      → Wait for builds to load (10-30 seconds)
      → Select your build
      → Click 'Done'

   3. Complete Required Fields:
      → Screenshots (minimum 3 per device size)
      → App Description (at least 10 characters)
      → Privacy Policy URL: https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html
      → Support URL: https://www.spect-it.com
      → Category: Health & Fitness or Medical
      → Age Rating: Complete questionnaire

   4. Submit for Review:
      → Click 'Submit for Review' button (top right)
      → Confirm submission
      → Wait for Apple's review (typically 1-3 days)

POSTBUILD

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 7: Create Quick Reference
echo "7️⃣  CREATING QUICK REFERENCE..."
echo ""

cat > QUICK_BUILD_REFERENCE.md << 'QUICKREF'
# 🚀 Quick Build Reference - Spect-IT App

## ✅ Prerequisites Met
- Xcode installed
- Node.js installed
- EAS CLI installed
- Project configured

## 🚀 Build Commands

### Option 1: EAS Cloud Build (Recommended)
```bash
# Set up credentials first (interactive)
eas credentials --platform ios
# Select: production
# Apple ID: tanstrauss@gmail.com
# Password: (app-specific if 2FA)

# Then build
eas build --platform ios --profile production
```

### Option 2: Xcode Build
```bash
# Open Xcode
open ios/SpectIT.xcworkspace

# In Xcode:
# 1. Configure signing (Team: P7BPRR2MY3)
# 2. Select "Any iOS Device"
# 3. Product → Archive
# 4. Distribute App → App Store Connect
```

## 📊 Monitor Builds
- EAS: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
- App Store Connect: https://appstoreconnect.apple.com/apps/6755681856

## 🔗 Important Links
- App Store Connect: https://appstoreconnect.apple.com/apps/6755681856
- TestFlight: https://appstoreconnect.apple.com/apps/6755681856/testflight/ios
- Privacy Policy: https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html
QUICKREF

echo "   ✅ Created: QUICK_BUILD_REFERENCE.md"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ COMPLETE APP CREATION SETUP FINISHED!"
echo ""
echo "📋 Next Steps:"
echo ""
if [ "$BUILD_METHOD" = "interactive" ]; then
    echo "   → Set up EAS credentials (run in terminal)"
    echo "   → Or use Xcode (already opened)"
elif [ "$BUILD_METHOD" = "eas_success" ]; then
    echo "   → Build started! Monitor at:"
    echo "     https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
else
    echo "   → Use Xcode (already opened) to build"
fi
echo ""
echo "📖 Quick Reference: QUICK_BUILD_REFERENCE.md"
echo ""

