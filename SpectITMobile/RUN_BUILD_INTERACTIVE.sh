#!/bin/bash

# Interactive Build Script - Run this in your terminal
# This will prompt you for Apple credentials

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 BUILDING iOS APP FOR APP STORE                               ║"
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
echo "⏱️  This will take 15-30 minutes"
echo ""
echo "🔐 You will be prompted for Apple credentials:"
echo "   1. 'Do you want to log in to your Apple account?' → Type: y"
echo "   2. Apple ID: tanstrauss@gmail.com"
echo "   3. Password: [Enter your password]"
echo "   4. 2FA Code: [If enabled, enter code from device]"
echo ""
echo "🔗 Monitor: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""

# Run the build - this will prompt for credentials
eas build --platform ios --profile production

echo ""
echo "✅ Build command executed!"
echo ""
echo "📋 Next Steps:"
echo "   1. Monitor build: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo "   2. After completion: eas submit --platform ios --latest"
echo "   3. Complete listing: https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight"
echo ""
