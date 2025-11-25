#!/bin/bash

# Push Build from Cursor - Complete Solution
# This script handles the build process with all necessary steps

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 PUSH BUILD FROM CURSOR - COMPLETE SOLUTION                        ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if EAS is logged in
echo "1️⃣  Checking EAS authentication..."
if eas whoami &> /dev/null; then
    EAS_USER=$(eas whoami 2>&1)
    echo "   ✅ Logged in as: $EAS_USER"
else
    echo "   ❌ Not logged into EAS"
    echo "   Run: eas login"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check credentials status
echo "2️⃣  Checking credentials status..."
echo ""

# Try to check credentials without interactive prompts
CREDENTIALS_STATUS=$(eas credentials --platform ios --non-interactive 2>&1 || echo "needs_setup")

if echo "$CREDENTIALS_STATUS" | grep -q "needs_setup\|not set up\|Failed"; then
    echo "   ⚠️  Credentials need to be set up"
    echo ""
    echo "   📋 To set up credentials, run this in your terminal:"
    echo "      eas credentials --platform ios"
    echo ""
    echo "   When prompted:"
    echo "   - Select: iOS"
    echo "   - Select: production"
    echo "   - Choose: Set up new credentials"
    echo "   - Apple ID: tanstrauss@gmail.com"
    echo "   - Password: (use app-specific password if 2FA enabled)"
    echo ""
    echo "   💡 If you have 2FA, get app-specific password:"
    echo "      https://appleid.apple.com/account/manage → Security → App-Specific Passwords"
    echo ""
    read -p "   Have you set up credentials? (y/n): " CREDS_SETUP
    
    if [ "$CREDS_SETUP" != "y" ] && [ "$CREDS_SETUP" != "Y" ]; then
        echo ""
        echo "   ⚠️  Please set up credentials first, then run this script again"
        exit 1
    fi
else
    echo "   ✅ Credentials appear to be set up"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start build
echo "3️⃣  Starting EAS build..."
echo ""
echo "   📋 Build Configuration:"
echo "      Platform: iOS"
echo "      Profile: production"
echo "      Distribution: App Store"
echo ""
echo "   ⏱️  This will take 15-30 minutes"
echo "   📊 Monitor at: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""

# Try to start build
echo "   🚀 Starting build..."
echo ""

if eas build --platform ios --profile production --non-interactive 2>&1; then
    echo ""
    echo "   ✅ Build started successfully!"
else
    echo ""
    echo "   ⚠️  Build requires interactive input"
    echo ""
    echo "   📋 Run this command in your terminal:"
    echo "      eas build --platform ios --profile production"
    echo ""
    echo "   Or use the interactive script:"
    echo "      ./RUN_EAS_BUILD_NOW.sh"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ BUILD STARTED!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "   1. Monitor Build Progress:"
echo "      https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""
echo "   2. Wait for Build to Complete (15-30 minutes)"
echo ""
echo "   3. Build will automatically upload to App Store Connect"
echo ""
echo "   4. After Upload:"
echo "      → Go to: https://appstoreconnect.apple.com/apps/6755681856"
echo "      → Wait for processing (15-30 minutes)"
echo "      → Go to 'App Store' tab"
echo "      → Select your build"
echo "      → Complete required fields"
echo "      → Submit for review"
echo ""

