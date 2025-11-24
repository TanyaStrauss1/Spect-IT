#!/bin/bash

# Build iOS app via Terminal with full capability
# This script handles Apple authentication properly

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 BUILD iOS APP VIA TERMINAL (FULL CAPABILITY)              ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check EAS CLI
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Check login
USER=$(eas whoami 2>/dev/null || echo "")
if [ -z "$USER" ]; then
    echo "⚠️  Not logged in. Logging in..."
    eas login
else
    echo "✅ Logged in as: $USER"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 BUILDING iOS APP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Building iOS app for App Store..."
echo "⏱️  This will take 15-30 minutes"
echo ""
echo "⚠️  IMPORTANT: When prompted, enter:"
echo "   1. 'y' to log in to Apple account"
echo "   2. Apple ID: tanstrauss@gmail.com"
echo "   3. Apple ID Password: [Your password]"
echo "   4. 2FA Code: [If enabled, enter code from your device]"
echo ""
echo "🔗 Monitor build: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""

# Start build - this will prompt interactively
eas build --platform ios --profile production

BUILD_EXIT_CODE=$?

echo ""
if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║          ✅ BUILD STARTED SUCCESSFULLY!                                ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📊 Monitor your build:"
    echo "   https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo ""
    echo "📤 After build completes, submit with:"
    echo "   ./SUBMIT_VIA_TERMINAL.sh"
    echo ""
    echo "   OR:"
    echo "   eas submit --platform ios --latest"
    echo ""
else
    echo "❌ Build failed. Check error messages above."
    echo ""
    echo "Common issues:"
    echo "  - Apple ID credentials incorrect"
    echo "  - 2FA code expired (get a new one)"
    echo "  - Network connection issues"
    echo ""
    echo "Try again with:"
    echo "  ./BUILD_NOW_TERMINAL.sh"
    exit 1
fi

