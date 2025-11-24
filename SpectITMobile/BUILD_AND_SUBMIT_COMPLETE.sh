#!/bin/bash

# Complete Build and Submit Process
# Builds iOS app and submits to App Store Connect in one go

set -e

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 COMPLETE BUILD & SUBMIT (FULL TERMINAL CAPABILITY)               ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check EAS CLI
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 1: VERIFY EAS LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

USER=$(eas whoami 2>/dev/null || echo "")
if [ -z "$USER" ]; then
    echo "⚠️  Not logged in. Logging in..."
    eas login
    echo ""
else
    echo "✅ Logged in as: $USER"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 STEP 2: BUILD iOS APP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Building iOS app for App Store..."
echo "⏱️  This will take 15-30 minutes"
echo ""
echo "⚠️  You will be prompted for Apple credentials:"
echo "   - Apple ID: tanstrauss@gmail.com"
echo "   - Password: [Your Apple ID password]"
echo "   - 2FA Code: [If enabled]"
echo ""
echo "🔗 Monitor build: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""

read -p "Press Enter to start build..." 

echo ""
echo "🔨 Starting build..."
echo ""

# Build iOS app
eas build --platform ios --profile production

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ Build failed. Check error messages above."
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 STEP 3: SUBMIT TO APP STORE CONNECT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Submitting build to App Store Connect..."
echo ""
echo "⚠️  You will be prompted for Apple credentials again:"
echo "   - Apple ID: tanstrauss@gmail.com"
echo "   - Password: [Your Apple ID password]"
echo "   - 2FA Code: [If enabled]"
echo ""

read -p "Press Enter to start submission..." 

echo ""
echo "📤 Starting submission..."
echo ""

# Submit to App Store Connect
eas submit --platform ios --latest

SUBMIT_EXIT_CODE=$?

echo ""
if [ $SUBMIT_EXIT_CODE -eq 0 ]; then
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║          ✅ BUILD & SUBMISSION COMPLETE!                                ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. ⏱️  Wait 15-30 minutes for build to process"
    echo ""
    echo "2. 🌐 Go to App Store Connect:"
    echo "   https://appstoreconnect.apple.com/apps/6755681856"
    echo ""
    echo "3. 📝 Complete app listing:"
    echo "   - Screenshots"
    echo "   - Description"
    echo "   - Privacy Policy: https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html"
    echo ""
    echo "4. ✅ Submit for review"
    echo ""
else
    echo "⚠️  Submission encountered issues. Check error messages above."
    echo ""
    echo "You can retry submission with:"
    echo "  eas submit --platform ios --latest"
    echo ""
fi

