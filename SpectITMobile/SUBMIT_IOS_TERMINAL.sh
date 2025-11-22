#!/bin/bash
# Submit iOS app to App Store Connect via terminal

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🍎 SUBMITTING iOS APP TO APP STORE CONNECT                     ║"
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
echo "🍎 STEP 2: CHECKING LATEST iOS BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

LATEST_BUILD=$(eas build:list --platform ios --limit 1 --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$LATEST_BUILD" ]; then
    echo "⚠️  No iOS build found. Building now..."
    eas build --platform ios --profile production
    if [ $? -ne 0 ]; then
        echo "❌ iOS build failed. Please check the error messages above."
        exit 1
    fi
    echo "✅ iOS build completed. Proceeding with submission..."
else
    echo "✅ Found latest iOS build: $LATEST_BUILD"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 STEP 3: SUBMITTING TO APP STORE CONNECT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Submitting latest iOS build to App Store Connect..."
echo ""
echo "⚠️  Note: You will be prompted for:"
echo "   • Apple ID: tanstrauss@gmail.com"
echo "   • Apple ID Password: [You will be prompted]"
echo "   • 2FA Code: [If enabled, you will be prompted]"
echo ""
echo "⚠️  Requirements:"
echo "   • App must be created in App Store Connect first"
echo "   • Apple Developer Program membership required"
echo ""

eas submit --platform ios --latest
SUBMIT_STATUS=$?

if [ $SUBMIT_STATUS -ne 0 ]; then
    echo ""
    echo "❌ Submission failed. Please check the error messages above."
    echo ""
    echo "📋 Manual Submission Steps:"
    echo ""
    echo "1. Download .ipa file:"
    echo "   eas build:download $LATEST_BUILD"
    echo "   Or from: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo ""
    echo "2. Go to App Store Connect:"
    echo "   https://appstoreconnect.apple.com"
    echo ""
    echo "3. Sign in with: tanstrauss@gmail.com"
    echo ""
    echo "4. Create app (if not created) or upload .ipa to existing app"
    echo ""
    echo "5. Complete app listing and submit for review"
    exit 1
fi

echo ""
echo "✅ iOS app submitted successfully!"
echo ""

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ✅ iOS APP SUBMITTED!                                           ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Go to App Store Connect:"
echo "   https://appstoreconnect.apple.com"
echo ""
echo "2. Sign in with: tanstrauss@gmail.com"
echo ""
echo "3. Complete app listing:"
echo "   - App description (see APP_STORE_CONTENT.md)"
echo "   - Screenshots (various device sizes)"
echo "   - Privacy policy: https://www.spect-it.com/privacy-policy"
echo "   - App preview video (optional)"
echo ""
echo "4. Submit for review"
echo ""
echo "5. Monitor review status in App Store Connect"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

