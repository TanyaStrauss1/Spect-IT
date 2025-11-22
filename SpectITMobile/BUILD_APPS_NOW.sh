#!/bin/bash

# Build Spect-IT Mobile Apps for Play Store and App Store
# This script builds both Android and iOS apps

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 BUILDING SPECT-IT MOBILE APPS                               ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

# Check EAS login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 1: CHECKING EAS LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

EAS_WHOAMI_OUTPUT=$(eas whoami 2>&1)
if echo "$EAS_WHOAMI_OUTPUT" | grep -q "Not logged in"; then
    echo "⚠️  Not logged in to EAS. Please log in now."
    echo "Running 'eas login'..."
    eas login
    if [ $? -ne 0 ]; then
        echo "❌ EAS login failed. Please try again manually: eas login"
        exit 1
    fi
    echo "✅ Logged in to EAS."
else
    echo "✅ Already logged in to EAS."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 STEP 2: BUILDING ANDROID APP (.aab)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Building Android App Bundle (.aab) for Google Play Store..."
echo "This may take 10-20 minutes in the Expo cloud."
echo ""

eas build --platform android --profile production --non-interactive

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Android build started successfully!"
    echo "Monitor at: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
else
    echo ""
    echo "❌ Android build failed. Check the error messages above."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🍎 STEP 3: BUILDING iOS APP (.ipa)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Building iOS app (.ipa) for App Store..."
echo "This may take 10-20 minutes in the Expo cloud."
echo ""

eas build --platform ios --profile production --non-interactive

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ iOS build started successfully!"
    echo "Monitor at: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
else
    echo ""
    echo "❌ iOS build failed. Check the error messages above."
    exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ✅ BUILDS STARTED!                                             ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📱 Monitor builds at:"
echo "   https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""
echo "⏱️  Build time: 10-20 minutes per build"
echo ""
echo "📤 After builds complete, run:"
echo "   ./SUBMIT_AFTER_BUILDS.sh"
echo ""

