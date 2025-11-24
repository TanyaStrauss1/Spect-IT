#!/bin/bash

# Complete Build and Deploy for Spect-IT
# The best way to build and submit your app through terminal

set -e  # Exit on error

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 COMPLETE BUILD & DEPLOY - SPECT-IT                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
APP_NAME="Spect-IT"
BUNDLE_ID="com.spectit.app"
APPLE_ID="tanstrauss@gmail.com"
APP_STORE_ID="6755681856"

echo "📱 App: $APP_NAME"
echo "📦 Bundle ID: $BUNDLE_ID"
echo "🍎 Apple ID: $APPLE_ID"
echo "🆔 App Store ID: $APP_STORE_ID"
echo ""

# Step 1: Verify prerequisites
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 Step 1: Verifying prerequisites..."
echo ""

# Check EAS CLI
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi
echo "✅ EAS CLI installed"

# Check if logged in
EAS_USER=$(eas whoami 2>/dev/null || echo "")
if [ -z "$EAS_USER" ]; then
    echo "⚠️  Not logged into EAS. Please log in:"
    eas login
fi
echo "✅ EAS logged in as: $(eas whoami)"

# Check assets
if [ ! -f "assets/icon.png" ]; then
    echo "📦 Creating missing assets..."
    ./create_assets.sh 2>/dev/null || echo "⚠️  Assets may need manual creation"
fi
echo "✅ Assets verified"

# Check iOS project
if [ ! -d "ios" ]; then
    echo "📱 Generating iOS project..."
    export LANG=en_US.UTF-8
    npx expo prebuild --platform ios
fi
echo "✅ iOS project ready"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 2: Clear old credentials
echo "🧹 Step 2: Clearing old cached credentials..."
security delete-internet-password -s appleid.apple.com -a "$APPLE_ID" 2>/dev/null || true
echo "✅ Credentials cleared"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 3: Build
echo "📦 Step 3: Building iOS app for App Store..."
echo ""
echo "⏱️  This will take 15-30 minutes"
echo "📊 Monitor progress at:"
echo "   https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""
echo "⚠️  You will be prompted for:"
echo "   - Apple ID: $APPLE_ID"
echo "   - Password: [Enter your NEW password]"
echo "   - 2FA Code: [If enabled, enter code from device]"
echo ""

read -p "Ready to start build? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Build cancelled"
    exit 0
fi

echo ""
echo "🚀 Starting build..."
echo ""

# Build with wait flag to complete before continuing
eas build --platform ios --profile production --wait --non-interactive=false

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "🔍 Troubleshooting:"
    echo "   1. Check error messages above"
    echo "   2. Verify your NEW password is correct"
    echo "   3. If 2FA enabled, you may need app-specific password"
    echo "   4. Check build logs at:"
    echo "      https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo ""
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"
echo ""

# Step 4: Get build info
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━══════════════════════════════════"
echo ""
echo "📋 Step 4: Getting build information..."
echo ""

LATEST_BUILD=$(eas build:list --platform ios --limit 1 --json 2>/dev/null | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")

if [ -n "$LATEST_BUILD" ]; then
    echo "✅ Latest build ID: $LATEST_BUILD"
else
    echo "⚠️  Could not get build ID automatically"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 5: Submit to App Store Connect
echo "📤 Step 5: Submitting to App Store Connect..."
echo ""
echo "⏱️  Upload takes 5-10 minutes"
echo ""
echo "⚠️  You will be prompted for:"
echo "   - Apple ID: $APPLE_ID"
echo "   - Password: [Enter your NEW password again]"
echo "   - 2FA Code: [If enabled]"
echo ""

read -p "Ready to submit? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "⚠️  Submission skipped"
    echo "   You can submit manually later with:"
    echo "   eas submit --platform ios --latest"
    exit 0
fi

echo ""
echo "🚀 Submitting to App Store Connect..."
echo ""

eas submit --platform ios --latest --non-interactive=false

SUBMIT_EXIT_CODE=$?

if [ $SUBMIT_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Submission successful!"
    echo ""
else
    echo ""
    echo "⚠️  Submission may have failed"
    echo "   Check error messages above"
    echo "   You can try manually:"
    echo "   eas submit --platform ios --latest"
    echo ""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Complete Build & Deploy Process Finished!"
echo ""
echo "📊 Next Steps:"
echo ""
echo "1. Monitor Build Status:"
echo "   https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""
echo "2. Go to App Store Connect:"
echo "   https://appstoreconnect.apple.com/apps/$APP_STORE_ID/distribution/ios/version/inflight"
echo ""
echo "3. Wait for Build to Appear (10-30 minutes):"
echo "   - Refresh the page periodically"
echo "   - Build will show in 'Build' section"
echo ""
echo "4. Select Build:"
echo "   - Click 'Select a build before you submit your app'"
echo "   - Choose your uploaded build"
echo "   - Click 'Done'"
echo ""
echo "5. Complete App Listing:"
echo "   - Add screenshots (required)"
echo "   - Fill in description"
echo "   - Add keywords"
echo "   - Complete all required fields"
echo ""
echo "6. Submit for Review:"
echo "   - Click 'Submit for Review'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Your app is being processed!"
echo "   Check App Store Connect in 10-30 minutes"
echo ""

