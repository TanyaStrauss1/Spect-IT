#!/bin/bash

# Automated iOS Build and Submit Script
# This script will guide you through the build and submission process

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🍎 AUTOMATED iOS BUILD & SUBMIT                                 ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

# Upgrade EAS CLI
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 STEP 1: UPGRADING EAS CLI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm install -g eas-cli@latest
echo "✅ EAS CLI upgraded"

# Check EAS login
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 2: CHECKING EAS LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

EAS_WHOAMI_OUTPUT=$(eas whoami 2>&1)
if echo "$EAS_WHOAMI_OUTPUT" | grep -q "Not logged in"; then
    echo "⚠️  Not logged in to EAS. Logging in..."
    eas login
    if [ $? -ne 0 ]; then
        echo "❌ EAS login failed. Please try again manually: eas login"
        exit 1
    fi
    echo "✅ Logged in to EAS."
else
    echo "✅ Already logged in to EAS."
fi

# Check for existing iOS build
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🍎 STEP 3: CHECKING iOS BUILD STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

LATEST_IOS_BUILD=$(eas build:list --platform ios --limit 1 --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
BUILD_STATUS=$(eas build:list --platform ios --limit 1 2>/dev/null | grep -i "status" | head -1)

if [ -n "$LATEST_IOS_BUILD" ] && echo "$BUILD_STATUS" | grep -qi "finished"; then
    echo "✅ Found finished iOS build: $LATEST_IOS_BUILD"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📤 STEP 4: SUBMITTING TO APP STORE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Submitting latest iOS build to App Store Connect..."
    echo ""
    eas submit --platform ios --latest
    exit $?
else
    echo "⚠️  No finished iOS build found. Building now..."
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔨 STEP 4: BUILDING iOS APP"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "⚠️  You will be prompted for:"
    echo "   • Apple ID: tanstrauss@gmail.com"
    echo "   • Apple ID Password: [You will be prompted]"
    echo "   • 2FA Code: [If enabled, you will be prompted]"
    echo ""
    echo "Building iOS app for App Store..."
    echo "This will take 10-20 minutes"
    echo ""
    
    eas build --platform ios --profile production
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ iOS build started successfully!"
        echo "Monitor at: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
        echo ""
        echo "📤 After build completes, run this script again to submit:"
        echo "   ./AUTO_BUILD_AND_SUBMIT_IOS.sh"
    else
        echo ""
        echo "❌ iOS build failed. Check the error messages above."
        exit 1
    fi
fi


