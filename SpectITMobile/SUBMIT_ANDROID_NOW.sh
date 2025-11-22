#!/bin/bash

# Submit Android App to Google Play Store
# This is FREE - no payment required!

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🤖 SUBMITTING ANDROID TO GOOGLE PLAY STORE                      ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check EAS login
if ! eas whoami &>/dev/null; then
    echo "❌ Not logged in to EAS. Please run: eas login"
    exit 1
fi
echo "✅ EAS logged in"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 SUBMITTING ANDROID BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Android build is ready: e53ca738-bd80-4318-952d-a5f624c9be6d"
echo ""
echo "⚠️  You will be prompted for:"
echo "   • Google Service Account JSON key (if not configured)"
echo "   • Or you can submit manually via Google Play Console"
echo ""

# Submit Android app
eas submit --platform android --latest

if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║          ✅ ANDROID SUBMITTED!                                            ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📊 Next steps:"
    echo "   1. Go to Google Play Console: https://play.google.com/console"
    echo "   2. Complete app listing (screenshots, description, etc.)"
    echo "   3. Submit for review"
    echo ""
else
    echo ""
    echo "⚠️  Automated submission may require Google Service Account setup."
    echo ""
    echo "📋 MANUAL SUBMISSION OPTION:"
    echo "   1. Download .aab file from:"
    echo "      https://expo.dev/artifacts/eas/uiPgexbzUL4kpsQhc8Z4PB.aab"
    echo ""
    echo "   2. Go to Google Play Console:"
    echo "      https://play.google.com/console"
    echo ""
    echo "   3. Upload the .aab file manually"
    echo ""
fi

