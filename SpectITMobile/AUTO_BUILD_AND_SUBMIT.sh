#!/bin/bash

# Automatic Build and Submit for Spect-IT
# Uses provided password for full automation

set -e  # Exit on error

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 AUTOMATIC BUILD & SUBMIT - SPECT-IT                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
APPLE_ID="tanstrauss@gmail.com"
APPLE_PASSWORD="Zara57048576!"
APP_STORE_ID="6755681856"

echo "📱 App: Spect-IT"
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
echo "✅ EAS CLI ready"

# Check if logged in
EAS_USER=$(eas whoami 2>/dev/null || echo "")
if [ -z "$EAS_USER" ]; then
    echo "⚠️  Not logged into EAS. Logging in..."
    eas login
fi
echo "✅ EAS logged in"

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

# Use expect to automate password entry
if command -v expect &> /dev/null; then
    echo "🚀 Starting automated build..."
    echo ""
    
    expect << EOF
set timeout 3600
spawn eas build --platform ios --profile production --wait

expect {
    "Do you want to log in to your Apple account?" {
        send "yes\r"
        exp_continue
    }
    -re "Apple ID.*:" {
        send "$APPLE_ID\r"
        exp_continue
    }
    -re "Password.*:" {
        send "$APPLE_PASSWORD\r"
        exp_continue
    }
    "2FA" {
        send_user "\n⚠️  2FA code required - please enter manually\n"
        interact
    }
    "Building" {
        send_user "\n✅ Build started!\n"
        exp_continue
    }
    "finished" {
        send_user "\n✅ Build finished!\n"
    }
    "failed" {
        send_user "\n❌ Build failed\n"
        exit 1
    }
    timeout {
        send_user "\n⏳ Build in progress...\n"
        exp_continue
    }
    eof {
        send_user "\n✅ Build process completed\n"
    }
}

wait
EOF

    BUILD_EXIT_CODE=$?
else
    echo "⚠️  expect not found, running interactively..."
    echo "   You'll need to enter password manually"
    eas build --platform ios --profile production --wait
    BUILD_EXIT_CODE=$?
fi

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "🔍 Troubleshooting:"
    echo "   1. Check error messages above"
    echo "   2. Verify password is correct"
    echo "   3. If 2FA enabled, you may need app-specific password"
    echo "   4. Check build logs at:"
    echo "      https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo ""
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"
echo ""

# Step 4: Submit
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📤 Step 4: Submitting to App Store Connect..."
echo ""
echo "⏱️  Upload takes 5-10 minutes"
echo ""

# Submit with automated password
if command -v expect &> /dev/null; then
    echo "🚀 Starting automated submission..."
    echo ""
    
    expect << EOF
set timeout 600
spawn eas submit --platform ios --latest

expect {
    -re "Apple ID.*:" {
        send "$APPLE_ID\r"
        exp_continue
    }
    -re "Password.*:" {
        send "$APPLE_PASSWORD\r"
        exp_continue
    }
    "2FA" {
        send_user "\n⚠️  2FA code required - please enter manually\n"
        interact
    }
    "Uploading" {
        send_user "\n✅ Upload started!\n"
        exp_continue
    }
    "successfully" {
        send_user "\n✅ Submission successful!\n"
    }
    "failed" {
        send_user "\n❌ Submission failed\n"
        exit 1
    }
    timeout {
        send_user "\n⏳ Submission in progress...\n"
        exp_continue
    }
    eof {
        send_user "\n✅ Submission process completed\n"
    }
}

wait
EOF

    SUBMIT_EXIT_CODE=$?
else
    echo "⚠️  expect not found, running interactively..."
    eas submit --platform ios --latest
    SUBMIT_EXIT_CODE=$?
fi

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
echo "✅ Complete Build & Submit Process Finished!"
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
echo "🎉 Your app is being processed!"
echo ""

