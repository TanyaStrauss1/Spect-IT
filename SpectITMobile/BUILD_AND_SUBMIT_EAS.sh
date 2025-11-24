#!/bin/bash

# Build and Submit using EAS - Most Reliable Method
# EAS handles all provisioning automatically

set -e

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 BUILD & SUBMIT WITH EAS - MOST RELIABLE                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

APPLE_ID="tanstrauss@gmail.com"
APPLE_PASSWORD="Zara57048576!"

echo "📱 App: Spect-IT"
echo "🍎 Apple ID: $APPLE_ID"
echo "🆔 App Store ID: 6755681856"
echo ""

# Step 1: Verify EAS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 Step 1: Verifying EAS setup..."
echo ""

if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Check login
EAS_USER=$(eas whoami 2>/dev/null || echo "")
if [ -z "$EAS_USER" ]; then
    echo "⚠️  Not logged in. Logging in..."
    eas login
else
    echo "✅ EAS logged in: $EAS_USER"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 2: Build
echo "📦 Step 2: Building iOS app..."
echo ""
echo "⏱️  This will take 15-30 minutes"
echo "📊 Monitor: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""
echo "⚠️  You will be prompted for:"
echo "   - Apple ID: $APPLE_ID"
echo "   - Password: $APPLE_PASSWORD"
echo "   - 2FA Code: [If enabled]"
echo ""

# Use expect to automate if available
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
    eas build --platform ios --profile production --wait
    BUILD_EXIT_CODE=$?
fi

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "✅ Build completed!"
echo ""

# Step 3: Submit
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📤 Step 3: Submitting to App Store Connect..."
echo ""
echo "⏱️  This will take 5-10 minutes"
echo ""

if command -v expect &> /dev/null; then
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
    timeout {
        send_user "\n⏳ Submission in progress...\n"
        exp_continue
    }
    eof {
        send_user "\n✅ Submission completed\n"
    }
}

wait
EOF

    SUBMIT_EXIT_CODE=$?
else
    eas submit --platform ios --latest
    SUBMIT_EXIT_CODE=$?
fi

if [ $SUBMIT_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Submission successful!"
else
    echo ""
    echo "⚠️  Submission may have failed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Complete Build & Submit Finished!"
echo ""
echo "📊 Next Steps:"
echo ""
echo "1. Go to App Store Connect:"
echo "   https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight"
echo ""
echo "2. Wait 10-30 minutes for build to appear"
echo ""
echo "3. Select build and complete app listing"
echo ""
echo "4. Submit for review"
echo ""

