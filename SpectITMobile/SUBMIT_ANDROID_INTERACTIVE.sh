#!/bin/bash

# Interactive Android Submission Script
# This will prompt you for Google Service Account JSON key

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🤖 SUBMITTING ANDROID APP TO PLAY STORE                         ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

# Check EAS login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 1: CHECKING EAS LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

EAS_WHOAMI_OUTPUT=$(eas whoami 2>&1)
if echo "$EAS_WHOAMI_OUTPUT" | grep -q "Not logged in"; then
    echo "⚠️  Not logged in to EAS. Logging in..."
    eas login
    if [ $? -ne 0 ]; then
        echo "❌ EAS login failed. Please try again manually: eas login"
        exit 1
    fi
    echo "✅ Logged in to EAS."
else
    echo "✅ Already logged in to EAS."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 STEP 2: SUBMITTING TO GOOGLE PLAY STORE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  You will be prompted for:"
echo "   1. Google Service Account JSON key file path"
echo "   2. Or you can set it up now"
echo ""
echo "📋 To create a Google Service Account:"
echo "   1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts"
echo "   2. Create a service account"
echo "   3. Download the JSON key"
echo "   4. Grant 'App Manager' role in Google Play Console"
echo ""
echo "Press Enter to continue with submission..."
read

echo ""
echo "Submitting latest Android build..."
echo ""

eas submit --platform android --latest

SUBMIT_STATUS=$?

if [ $SUBMIT_STATUS -eq 0 ]; then
    echo ""
    echo "✅ Android app submitted successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Go to Play Console: https://play.google.com/console/u/0/developers/6438572372972515481"
    echo "   2. Complete store listing (if not done)"
    echo "   3. Submit for review"
else
    echo ""
    echo "❌ Submission failed or requires manual setup."
    echo ""
    echo "📋 Manual Submission Steps:"
    echo ""
    echo "1. Download .aab file:"
    echo "   https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo ""
    echo "2. Go to Play Console:"
    echo "   https://play.google.com/console/u/0/developers/6438572372972515481"
    echo ""
    echo "3. Create app (if needed) or go to existing app"
    echo ""
    echo "4. Go to Release → Production → Create new release"
    echo ""
    echo "5. Upload the .aab file"
    echo ""
    echo "6. Complete store listing and submit for review"
fi

