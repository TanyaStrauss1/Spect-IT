#!/bin/bash

# Auto Build with Authentication - Run this in your terminal
# You'll be able to verify with biometric/password when prompted

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 AUTO BUILD iOS APP FOR APP STORE                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Verify EAS login
echo "✅ Checking EAS login..."
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
echo "⏱️  Estimated time: 15-30 minutes"
echo ""
echo "🔐 Authentication Required:"
echo "   You will be prompted for Apple credentials"
echo "   Use biometric/password when prompted"
echo ""
echo "🔗 Monitor: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""

# Start the build - user will provide credentials interactively
eas build --platform ios --profile production

BUILD_STATUS=$?

echo ""
if [ $BUILD_STATUS -eq 0 ]; then
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║          ✅ BUILD STARTED SUCCESSFULLY!                                  ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Monitor build: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo "   2. After completion, submit with: eas submit --platform ios --latest"
    echo "   3. Complete listing: https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight"
    echo ""
else
    echo "⚠️  Build encountered issues. Check messages above."
    echo "You may need to provide Apple credentials manually."
    echo ""
fi

