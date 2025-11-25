#!/bin/bash

# Build with EAS (Cloud Build) - No device registration needed
# This is the easiest way to build for App Store from terminal

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ☁️  EAS CLOUD BUILD - NO DEVICE NEEDED                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if EAS CLI is installed
if ! command -v eas >/dev/null 2>&1; then
    echo "❌ EAS CLI not installed"
    echo ""
    echo "📥 Install EAS CLI:"
    echo "   npm install -g eas-cli"
    echo ""
    exit 1
fi

# Check if logged in
EAS_USER=$(eas whoami 2>&1 | head -1)
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to EAS"
    echo ""
    echo "🔐 Login:"
    echo "   eas login"
    echo ""
    exit 1
fi

echo "✅ Logged in as: $EAS_USER"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Starting EAS Build for App Store..."
echo ""
echo "📋 This will:"
echo "   ✅ Build in the cloud (no local Xcode needed)"
echo "   ✅ Handle provisioning automatically"
echo "   ✅ Upload directly to App Store Connect"
echo "   ✅ No device registration required"
echo ""
echo "⏱️  Time: 15-30 minutes"
echo ""

# Build for App Store
echo "Building..."
eas build --platform ios --profile production --non-interactive

BUILD_EXIT_CODE=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo ""
    echo "📋 NEXT STEPS:"
    echo ""
    echo "1. Go to App Store Connect:"
    echo "   https://appstoreconnect.apple.com/apps/6755681856"
    echo ""
    echo "2. Wait 15-30 minutes for processing"
    echo ""
    echo "3. Click 'App Store' tab"
    echo ""
    echo "4. Select your build"
    echo ""
    echo "5. Complete required fields and submit"
    echo ""
else
    echo "❌ Build failed"
    echo ""
    echo "💡 Check build logs:"
    echo "   https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo ""
    echo "Common fixes:"
    echo "  - Verify Apple ID credentials"
    echo "  - Check Apple Developer Program is active"
    echo "  - Use app-specific password if 2FA enabled"
    echo ""
fi

echo ""

