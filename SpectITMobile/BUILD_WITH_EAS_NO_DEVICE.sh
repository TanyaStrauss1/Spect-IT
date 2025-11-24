#!/bin/bash

# Build iOS app with EAS - No device registration needed
# EAS automatically handles provisioning profiles and device registration

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 BUILD WITH EAS - NO DEVICE REGISTRATION NEEDED                  ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "✅ EAS Build automatically handles:"
echo "   - Device registration"
echo "   - Provisioning profiles"
echo "   - Certificates"
echo "   - No manual setup needed!"
echo ""

# Check EAS CLI
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Check login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 CHECKING EAS LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

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
echo "⚠️  You will be prompted for:"
echo "   1. Apple account login (type 'y' for yes)"
echo "   2. Apple ID: tanstrauss@gmail.com"
echo "   3. Apple ID password"
echo "   4. 2FA code (if enabled)"
echo ""
echo "🔗 Monitor build: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""

read -p "Press Enter to start build..." 

echo ""
echo "🔨 Starting build..."
echo ""

# Build with EAS - handles everything automatically
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
    echo "   eas submit --platform ios --latest"
    echo ""
    echo "   OR use Transporter app (see ALTERNATIVE_SUBMISSION_METHODS.md)"
    echo ""
else
    echo "❌ Build failed. Check error messages above."
    echo ""
    echo "Common fixes:"
    echo "  - Verify Apple ID credentials"
    echo "  - Check 2FA code is correct"
    echo "  - Ensure Apple Developer Program is active"
    exit 1
fi

