#!/bin/bash

# Submit Android App to Google Play Store
# Developer Account ID: 6438572372972515481

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          📱 ANDROID APP SUBMISSION TO GOOGLE PLAY STORE                  ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 DEVELOPER ACCOUNT INFORMATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Developer Account ID: 6438572372972515481"
echo "Play Console: https://play.google.com/console/u/0/developers/6438572372972515481"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 STEP 1: BUILD ANDROID APP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if logged in
if ! eas whoami &>/dev/null; then
    echo "⚠️  Not logged in to EAS"
    echo "Logging in..."
    eas login
fi

echo "Building Android App Bundle (.aab)..."
echo "This will take 10-20 minutes"
echo ""

eas build --platform android --profile production

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ BUILD COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Download .aab file from:"
echo "   https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
echo ""
echo "2. Go to Play Console:"
echo "   https://play.google.com/console/u/0/developers/6438572372972515481/apps"
echo ""
echo "3. Create app (if not created) or upload .aab file"
echo ""
echo "4. Complete store listing and submit for review"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

