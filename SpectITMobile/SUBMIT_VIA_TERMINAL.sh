#!/bin/bash

# Submit iOS app to App Store Connect via Terminal
# This bypasses Xcode communication issues

set -e

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          📤 SUBMIT TO APP STORE VIA TERMINAL (FULL CAPABILITY)         ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check EAS CLI
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 1: CHECK EAS LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

USER=$(eas whoami 2>/dev/null || echo "")
if [ -z "$USER" ]; then
    echo "⚠️  Not logged in to EAS"
    echo ""
    echo "Logging in..."
    eas login
    echo ""
else
    echo "✅ Logged in as: $USER"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 STEP 2: CHECK AVAILABLE BUILDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Checking for available iOS builds..."
echo ""

BUILDS=$(eas build:list --platform ios --limit 5 --json 2>/dev/null || echo "[]")

if [ "$BUILDS" = "[]" ] || [ -z "$BUILDS" ]; then
    echo "⚠️  No builds found. You need to build first."
    echo ""
    echo "Building iOS app now..."
    echo ""
    eas build --platform ios --profile production
    echo ""
    echo "⏱️  Build will take 15-30 minutes. After it completes, run this script again."
    exit 0
else
    echo "✅ Found builds. Listing latest:"
    eas build:list --platform ios --limit 3
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 STEP 3: SUBMIT TO APP STORE CONNECT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Submitting latest iOS build to App Store Connect..."
echo ""
echo "⚠️  You will be prompted for:"
echo "   1. Apple ID: tanstrauss@gmail.com"
echo "   2. Apple ID Password: [Your password]"
echo "   3. 2FA Code: [If enabled, enter code from your device]"
echo ""
echo "Starting submission..."
echo ""

# Submit the latest build
eas submit --platform ios --latest

SUBMIT_EXIT_CODE=$?

echo ""
if [ $SUBMIT_EXIT_CODE -eq 0 ]; then
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║          ✅ SUBMISSION SUCCESSFUL!                                     ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. ⏱️  Wait 15-30 minutes for build to process in App Store Connect"
    echo ""
    echo "2. 🌐 Go to App Store Connect:"
    echo "   https://appstoreconnect.apple.com/apps/6755681856"
    echo ""
    echo "3. 📝 Complete app listing:"
    echo "   - Add screenshots"
    echo "   - Fill in description"
    echo "   - Add Privacy Policy: https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html"
    echo "   - Complete all required fields"
    echo ""
    echo "4. ✅ Submit for review:"
    echo "   - Click 'Submit for Review' button"
    echo ""
else
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║          ⚠️  SUBMISSION ENCOUNTERED ISSUES                              ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Check the error messages above for details."
    echo ""
    echo "Common fixes:"
    echo "  - Verify Apple ID credentials"
    echo "  - Check 2FA code is correct"
    echo "  - Ensure Apple Developer Program is active"
    echo "  - Try again with: eas submit --platform ios --latest"
    echo ""
fi

