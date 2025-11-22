#!/bin/bash

# Automated iOS App Store Submission Script

set -e

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          📤 AUTOMATED iOS APP STORE SUBMISSION                           ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check EAS login
if ! eas whoami &>/dev/null; then
    echo "⚠️  Not logged in. Please run: eas login"
    exit 1
fi

echo "🔍 Finding latest iOS build..."
LATEST_BUILD=$(eas build:list --platform ios --limit 1 --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

if [ -z "$LATEST_BUILD" ]; then
    echo "❌ No iOS builds found. Please build first:"
    echo "   ./AUTO_BUILD_IOS.sh"
    exit 1
fi

BUILD_STATUS=$(eas build:view "$LATEST_BUILD" 2>/dev/null | grep -i "status" | head -1 || echo "")

if ! echo "$BUILD_STATUS" | grep -qi "finished\|ready"; then
    echo "⚠️  Latest build is not finished yet."
    echo "   Build ID: $LATEST_BUILD"
    echo "   Status: $BUILD_STATUS"
    echo ""
    echo "   Monitor at: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    exit 1
fi

echo "✅ Found finished build: $LATEST_BUILD"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 SUBMITTING TO APP STORE CONNECT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

eas submit --platform ios --latest

if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║          ✅ SUBMISSION SUCCESSFUL!                                      ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📱 Check App Store Connect:"
    echo "   https://appstoreconnect.apple.com/apps"
    echo ""
    echo "⏱️  Review typically takes 24-48 hours"
    echo ""
else
    echo ""
    echo "❌ Submission failed. Check the error messages above."
    exit 1
fi

