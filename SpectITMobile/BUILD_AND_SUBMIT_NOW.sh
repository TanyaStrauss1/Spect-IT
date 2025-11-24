#!/bin/bash

# Build and Submit iOS App to App Store Connect
# App Store Connect: https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight

set -e

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 BUILD & SUBMIT iOS APP TO APP STORE CONNECT                  ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

# Check EAS CLI
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Check login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: VERIFY EAS LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

USER=$(eas whoami 2>/dev/null || echo "")
if [ -z "$USER" ]; then
    echo "⚠️  Not logged in. Please login:"
    eas login
else
    echo "✅ Logged in as: $USER"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: BUILD iOS APP FOR APP STORE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Building iOS app for App Store..."
echo "⏱️  This will take 15-30 minutes"
echo ""
echo "⚠️  You may be prompted for:"
echo "   - Apple ID: tanstrauss@gmail.com"
echo "   - Apple ID password"
echo "   - 2FA code (if enabled)"
echo ""
read -p "Press Enter to start build..." 

echo ""
echo "🔨 Starting build..."
eas build --platform ios --profile production

echo ""
echo "✅ Build complete!"
echo ""

# Step 3: Submit
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: SUBMIT TO APP STORE CONNECT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📤 Submitting latest build to App Store Connect..."
echo "🔗 App Store Connect: https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight"
echo ""
read -p "Press Enter to submit..." 

eas submit --platform ios --latest

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ✅ BUILD & SUBMIT COMPLETE!                                     ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Go to App Store Connect:"
echo "   https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight"
echo ""
echo "2. Complete app listing:"
echo "   - Add screenshots"
echo "   - Complete description"
echo "   - Add privacy policy URL"
echo "   - Set age rating"
echo ""
echo "3. Select the uploaded build"
echo ""
echo "4. Submit for review"
echo ""
echo "🔗 Monitor builds: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""

