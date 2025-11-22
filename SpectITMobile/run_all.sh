#!/bin/bash

# Complete Build and Submit Process
# Email: strausstanya93@gmail.com

set -e

cd "$(dirname "$0")"

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 COMPLETE BUILD & SUBMIT PROCESS                                ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check/Login to EAS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 1: EAS LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! eas whoami &>/dev/null; then
    echo "⚠️  Not logged in. Starting login process..."
    echo "📧 Email: strausstanya93@gmail.com"
    echo "🌐 Browser will open for authentication"
    echo ""
    eas login
else
    echo "✅ Already logged in:"
    eas whoami
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 STEP 2: BUILD iOS APP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Building iOS app for App Store..."
echo "This may take 10-20 minutes"
echo ""
echo "⚠️  You may be prompted for:"
echo "  - Apple ID: strausstanya93@gmail.com"
echo "  - Apple ID password"
echo "  - 2FA code (if enabled)"
echo ""

eas build --platform ios --profile production

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 STEP 3: SUBMIT TO APP STORE CONNECT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

eas submit --platform ios --latest

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ✅ BUILD & SUBMIT COMPLETE!                                     ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo "  1. Go to App Store Connect: https://appstoreconnect.apple.com"
echo "  2. Sign in with: strausstanya93@gmail.com"
echo "  3. Complete app listing (screenshots, description, privacy policy)"
echo "  4. Submit for review"
echo ""
echo "🔗 Monitor build: https://expo.dev/accounts/strausstanya93/projects/spectit-mobile/builds"
echo ""

