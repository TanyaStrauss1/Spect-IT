#!/bin/bash
# Submit existing completed builds to app stores

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          📤 SUBMITTING EXISTING BUILDS TO STORES                        ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

# Check EAS login
EAS_WHOAMI_OUTPUT=$(eas whoami 2>&1)
if echo "$EAS_WHOAMI_OUTPUT" | grep -q "Not logged in"; then
    echo "⚠️  Not logged in to EAS. Logging in..."
    eas login
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 SUBMITTING ANDROID BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get latest finished Android build
ANDROID_BUILD=$(eas build:list --platform android --limit 1 --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$ANDROID_BUILD" ]; then
    echo "✅ Found Android build: $ANDROID_BUILD"
    echo "Submitting to Google Play Store..."
    eas submit --platform android --latest
else
    echo "⚠️  No Android build found. Use BUILD_BOTH_APPS.sh to build first."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🍎 SUBMITTING iOS BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get latest finished iOS build
IOS_BUILD=$(eas build:list --platform ios --limit 1 --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$IOS_BUILD" ]; then
    echo "✅ Found iOS build: $IOS_BUILD"
    echo "Submitting to App Store Connect..."
    echo "⚠️  You may be prompted for Apple ID credentials"
    eas submit --platform ios --latest
else
    echo "⚠️  No iOS build found. Use BUILD_IOS_APP.sh to build first."
fi

echo ""
echo "✅ Submission process complete!"
echo ""

