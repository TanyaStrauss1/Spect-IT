#!/bin/bash

# Submit iOS Build to App Store Connect
# This script will help you submit your latest build

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          📤 SUBMIT iOS BUILD TO APP STORE CONNECT                        ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check EAS login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "VERIFYING EAS LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

USER=$(eas whoami 2>/dev/null || echo "")
if [ -z "$USER" ]; then
    echo "⚠️  Not logged in. Logging in..."
    eas login
else
    echo "✅ Logged in as: $USER"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "LISTING RECENT iOS BUILDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# List recent builds
echo "📋 Recent iOS builds:"
eas build:list --platform ios --limit 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUBMITTING LATEST BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📤 Submitting latest iOS build to App Store Connect..."
echo "🔗 App: https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight"
echo ""
echo "⚠️  You will be prompted for Apple credentials:"
echo "   • Apple ID: tanstrauss@gmail.com"
echo "   • Password: [Enter your password]"
echo "   • 2FA Code: [If enabled]"
echo ""

# Submit latest build
eas submit --platform ios --latest

echo ""
echo "✅ Submit process completed!"
echo ""
echo "📋 Next Steps:"
echo "   1. Go to App Store Connect:"
echo "      https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight"
echo ""
echo "   2. Select the uploaded build"
echo ""
echo "   3. Complete app listing (screenshots, description, etc.)"
echo ""
echo "   4. Submit for review"
echo ""

