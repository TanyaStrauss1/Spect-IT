#!/bin/bash

# Prepare App for App Store Submission
# Complete checklist and verification

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     📱 PREPARE SPECT-IT FOR APP STORE SUBMISSION                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Verify Configuration
echo "1️⃣  VERIFYING APP CONFIGURATION..."
echo ""

APP_NAME=$(grep -A 1 '"name"' app.json | grep -v '"name"' | head -1 | sed 's/.*"\(.*\)".*/\1/')
BUNDLE_ID=$(grep '"bundleIdentifier"' app.json | sed 's/.*"\(.*\)".*/\1/')
VERSION=$(grep '"version"' app.json | sed 's/.*"\(.*\)".*/\1/')
BUILD_NUMBER=$(grep '"buildNumber"' app.json | sed 's/.*"\(.*\)".*/\1/')

echo "   App Name: $APP_NAME"
echo "   Bundle ID: $BUNDLE_ID"
echo "   Version: $VERSION"
echo "   Build Number: $BUILD_NUMBER"
echo ""

if [ "$APP_NAME" != "Spect-IT" ]; then
    echo "   ⚠️  Warning: App name should be 'Spect-IT'"
fi

if [ "$BUNDLE_ID" != "com.spectit.app" ]; then
    echo "   ⚠️  Warning: Bundle ID should be 'com.spectit.app'"
fi

echo "   ✅ Configuration verified"
echo ""

# Step 2: Check Assets
echo "2️⃣  CHECKING ASSETS..."
echo ""

if [ -f "assets/icon.png" ]; then
    echo "   ✅ App icon exists"
else
    echo "   ❌ App icon missing: assets/icon.png"
fi

if [ -f "assets/splash.png" ]; then
    echo "   ✅ Splash screen exists"
else
    echo "   ❌ Splash screen missing: assets/splash.png"
fi

echo ""

# Step 3: Check Permissions
echo "3️⃣  VERIFYING PERMISSIONS..."
echo ""

if grep -q "NSCameraUsageDescription" app.json; then
    echo "   ✅ Camera permission configured"
else
    echo "   ❌ Camera permission missing"
fi

if grep -q "NSLocationWhenInUseUsageDescription" app.json; then
    echo "   ✅ Location permission configured"
else
    echo "   ❌ Location permission missing"
fi

if grep -q "NSPhotoLibraryUsageDescription" app.json; then
    echo "   ✅ Photo library permission configured"
else
    echo "   ❌ Photo library permission missing"
fi

echo ""

# Step 4: Display Submission Checklist
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 APP STORE SUBMISSION CHECKLIST"
echo ""
echo "Before submitting, ensure you have:"
echo ""
echo "✅ App Information:"
echo "   → Name: Spect-IT"
echo "   → Subtitle: Professional Eye Testing Platform"
echo "   → Category: Health & Fitness"
echo "   → Age Rating: Complete questionnaire"
echo ""
echo "✅ Version Information:"
echo "   → Description: (at least 10 characters)"
echo "   → Keywords: eye test, vision, optometry, health, medical"
echo "   → Support URL: https://www.spect-it.com"
echo "   → Privacy Policy URL: https://www.spect-it.com/privacy-policy"
echo ""
echo "✅ Screenshots:"
echo "   → iPhone 6.7\" Display: Minimum 3 screenshots (1290 x 2796)"
echo "   → iPhone 6.5\" Display: Minimum 3 screenshots (1242 x 2688)"
echo ""
echo "✅ Build:"
echo "   → Build uploaded to App Store Connect"
echo "   → Build status: 'Ready to Submit'"
echo "   → Build selected in App Store tab"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 5: Build Options
echo "🚀 NEXT STEPS:"
echo ""
echo "1. Build the app:"
echo "   ./BUILD_IOS_INTERACTIVE.sh"
echo ""
echo "2. Go to App Store Connect:"
echo "   https://appstoreconnect.apple.com"
echo ""
echo "3. Complete all required information"
echo ""
echo "4. Submit for review"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 Full guide: COMPLETE_SUBMISSION_GUIDE.md"
echo ""

