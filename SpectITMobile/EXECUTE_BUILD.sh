#!/bin/bash

# Execute iOS Build - Run this script in your terminal
# This will start the build process with full capabilities

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 EXECUTING iOS BUILD FOR APP STORE                            ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Export Expo token if available
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Verify EAS login
echo "✅ Verifying EAS login..."
eas whoami

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STARTING iOS BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Platform: iOS"
echo "📦 Profile: production"
echo "🎯 Distribution: App Store"
echo "⏱️  Estimated time: 15-30 minutes"
echo ""
echo "⚠️  You will be prompted for Apple credentials:"
echo "   • Apple ID: tanstrauss@gmail.com"
echo "   • Password: [Enter your password]"
echo "   • 2FA Code: [If enabled]"
echo ""
echo "🔗 Monitor: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""

# Execute the build
eas build --platform ios --profile production

echo ""
echo "✅ Build command executed!"
echo ""
echo "📋 Next Steps:"
echo "   1. Monitor build at: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo "   2. After completion, submit with: eas submit --platform ios --latest"
echo "   3. Complete listing at: https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight"
echo ""
