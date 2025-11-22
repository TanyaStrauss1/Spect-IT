#!/bin/bash
# Submit Android app to Google Play Store via terminal

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          📱 SUBMITTING ANDROID APP TO GOOGLE PLAY STORE                  ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Navigate to the SpectITMobile directory
cd /Users/tanyastrauss/Spect-IT/SpectITMobile

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI is not installed. Installing now..."
    npm install -g eas-cli
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install EAS CLI. Please install manually: npm install -g eas-cli"
        exit 1
    fi
    echo "✅ EAS CLI installed successfully"
fi

# Check EAS login status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 1: CHECKING EAS LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

EAS_WHOAMI_OUTPUT=$(eas whoami 2>&1)
if echo "$EAS_WHOAMI_OUTPUT" | grep -q "Not logged in"; then
    echo "⚠️  Not logged in to EAS. Please log in now."
    echo "Running 'eas login'..."
    eas login
    if [ $? -ne 0 ]; then
        echo "❌ EAS login failed. Please try again manually: eas login"
        exit 1
    fi
    echo "✅ Logged in to EAS."
else
    echo "✅ Already logged in to EAS."
    echo "$EAS_WHOAMI_OUTPUT"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 STEP 2: CHECKING LATEST ANDROID BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

LATEST_BUILD=$(eas build:list --platform android --limit 1 --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$LATEST_BUILD" ]; then
    echo "⚠️  No Android build found. Building now..."
    eas build --platform android --profile production
    if [ $? -ne 0 ]; then
        echo "❌ Android build failed. Please check the error messages above."
        exit 1
    fi
    echo "✅ Android build completed. Proceeding with submission..."
else
    echo "✅ Found latest Android build: $LATEST_BUILD"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 STEP 3: SUBMITTING TO GOOGLE PLAY STORE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Submitting latest Android build to Google Play Store..."
echo ""
echo "⚠️  Note: You may need to:"
echo "   1. Create the app in Play Console first (if not created)"
echo "   2. Complete store listing (screenshots, description, privacy policy)"
echo "   3. Accept the submission in Play Console"
echo ""

eas submit --platform android --latest
SUBMIT_STATUS=$?

if [ $SUBMIT_STATUS -ne 0 ]; then
    echo ""
    echo "❌ Submission failed. Please check the error messages above."
    echo ""
    echo "📋 Manual Submission Steps:"
    echo ""
    echo "1. Download .aab file:"
    echo "   eas build:download $LATEST_BUILD"
    echo "   Or from: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo ""
    echo "2. Go to Play Console:"
    echo "   https://play.google.com/console/u/0/developers/6438572372972515481"
    echo ""
    echo "3. Create app (if not created) or upload .aab to existing app"
    echo ""
    echo "4. Complete store listing and submit for review"
    exit 1
fi

echo ""
echo "✅ Android app submitted successfully!"
echo ""

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ✅ ANDROID APP SUBMITTED!                                       ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Go to Play Console:"
echo "   https://play.google.com/console/u/0/developers/6438572372972515481"
echo ""
echo "2. Complete store listing:"
echo "   - App description (see APP_STORE_CONTENT.md)"
echo "   - Screenshots (at least 2 for phone)"
echo "   - Privacy policy: https://www.spect-it.com/privacy-policy"
echo "   - Feature graphic"
echo ""
echo "3. Submit for review"
echo ""
echo "4. Monitor review status in Play Console"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

