#!/bin/bash

# Run iOS Build - This script will guide you through the build process
# Run this in your terminal: ./RUN_BUILD_NOW.sh

set -e

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 BUILDING iOS APP FOR APP STORE                               ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check EAS CLI
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Check login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "VERIFYING EAS LOGIN"
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
echo "STARTING iOS BUILD"
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

# Run the build - this will prompt for Apple credentials
eas build --platform ios --profile production

echo ""
echo "✅ Build process started!"
echo ""
echo "📋 Next Steps:"
echo "   1. Monitor build progress at:"
echo "      https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""
echo "   2. After build completes, submit with:"
echo "      eas submit --platform ios --latest"
echo ""
echo "   3. Complete app listing at:"
echo "      https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight"
echo ""
