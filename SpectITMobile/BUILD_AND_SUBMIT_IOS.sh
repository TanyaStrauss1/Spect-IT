#!/bin/bash

# Build and Submit iOS App to App Store
# Using: strausstanya93@gmail.com

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 SPECT-IT iOS BUILD & SUBMIT TO APP STORE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$(dirname "$0")"

# Check if logged in
echo "📋 Checking EAS login status..."
if ! eas whoami &>/dev/null; then
    echo "⚠️  Not logged in to EAS"
    echo "🔐 Please login with: strausstanya93@gmail.com"
    echo ""
    echo "Run: eas login"
    echo "Then enter: strausstanya93@gmail.com"
    exit 1
fi

echo "✅ Logged in to EAS"
eas whoami
echo ""

# Verify project configuration
echo "📋 Verifying project configuration..."
if [ ! -f "app.json" ]; then
    echo "❌ app.json not found!"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

echo "✅ Project files found"
echo ""

# Build iOS app
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 BUILDING iOS APP FOR APP STORE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will:"
echo "  1. Build iOS app (.ipa) for App Store"
echo "  2. Upload to App Store Connect"
echo "  3. Make it available for submission"
echo ""
echo "⚠️  You may be prompted for:"
echo "  - Apple ID: strausstanya93@gmail.com"
echo "  - Apple ID password"
echo "  - 2FA code (if enabled)"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Build cancelled"
    exit 1
fi

echo ""
echo "🔨 Starting iOS build..."
echo ""

# Build with production profile
eas build --platform ios --profile production

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 SUBMITTING TO APP STORE CONNECT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Submit to App Store Connect
eas submit --platform ios --latest

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ BUILD & SUBMIT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo "  1. Go to App Store Connect: https://appstoreconnect.apple.com"
echo "  2. Sign in with: strausstanya93@gmail.com"
echo "  3. Complete app listing (screenshots, description, privacy policy)"
echo "  4. Submit for review"
echo ""
echo "🔗 Links:"
echo "  - App Store Connect: https://appstoreconnect.apple.com"
echo "  - Expo Dashboard: https://expo.dev"
echo ""

