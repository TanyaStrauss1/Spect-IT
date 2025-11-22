#!/bin/bash

# Fully Automated iOS Build Script
# This script will build the iOS app for App Store submission

set -e  # Exit on error

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🍎 AUTOMATED iOS BUILD                                           ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check EAS login
echo "📋 Checking EAS login..."
if ! eas whoami &>/dev/null; then
    echo "⚠️  Not logged in. Please run: eas login"
    exit 1
fi
echo "✅ Logged in to EAS"
echo ""

# Check for existing finished build
echo "🔍 Checking for existing builds..."
LATEST_BUILD=$(eas build:list --platform ios --limit 1 --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

if [ -n "$LATEST_BUILD" ]; then
    BUILD_STATUS=$(eas build:view "$LATEST_BUILD" 2>/dev/null | grep -i "status" | head -1 || echo "")
    if echo "$BUILD_STATUS" | grep -qi "finished\|ready"; then
        echo "✅ Found finished build: $LATEST_BUILD"
        echo "📤 You can submit it with: eas submit --platform ios --latest"
        echo ""
        read -p "Do you want to build a new one anyway? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Using existing build."
            exit 0
        fi
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 BUILDING iOS APP FOR APP STORE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  This will prompt you for:"
echo "   • Apple ID: tanstrauss@gmail.com"
echo "   • Apple ID Password: [Enter your password]"
echo "   • 2FA Code: [If enabled, enter the code]"
echo ""
echo "⏱️  Build time: 10-20 minutes"
echo ""
echo "Starting build..."
echo ""

# Start the build (this will prompt for Apple credentials interactively)
eas build --platform ios --profile production

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║          ✅ iOS BUILD STARTED SUCCESSFULLY!                              ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📊 Monitor your build at:"
    echo "   https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo ""
    echo "📤 Once the build completes, submit to App Store with:"
    echo "   cd /Users/tanyastrauss/Spect-IT/SpectITMobile"
    echo "   eas submit --platform ios --latest"
    echo ""
    echo "   OR run:"
    echo "   ./AUTO_SUBMIT_IOS.sh"
    echo ""
else
    echo ""
    echo "❌ Build failed. Check the error messages above."
    exit $BUILD_EXIT_CODE
fi

