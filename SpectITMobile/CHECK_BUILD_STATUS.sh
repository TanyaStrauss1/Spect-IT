#!/bin/bash

# Check build status and diagnose issues

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🔍 CHECK BUILD STATUS & DIAGNOSE ISSUES                       ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 CHECKING LATEST BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BUILDS=$(eas build:list --platform ios --limit 3 2>/dev/null || echo "")

if [ -n "$BUILDS" ]; then
    echo "$BUILDS"
    echo ""
    echo "🔗 View detailed logs:"
    echo "   https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo ""
else
    echo "⚠️  No builds found"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VERIFYING SETUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check EAS login
echo "1. Checking EAS login..."
USER=$(eas whoami 2>/dev/null || echo "")
if [ -n "$USER" ]; then
    echo "   ✅ Logged in as: $USER"
else
    echo "   ❌ Not logged in"
    echo "   Run: eas login"
fi

echo ""
echo "2. Checking Apple Developer account..."
echo "   Go to: https://developer.apple.com/account"
echo "   Sign in with: tanstrauss@gmail.com"
echo "   Verify account is active"
echo ""

echo "3. Checking App ID..."
echo "   Go to: https://developer.apple.com/account/resources/identifiers/list"
echo "   Verify: com.spectit.app exists"
echo ""

echo "4. Checking Team ID..."
TEAM_ID=$(grep -A 5 '"ios"' app.json | grep 'appleTeamId' | cut -d'"' -f4 || echo "")
if [ "$TEAM_ID" = "P7BPRR2MY3" ]; then
    echo "   ✅ Team ID correct: $TEAM_ID"
else
    echo "   ⚠️  Team ID: $TEAM_ID (should be: P7BPRR2MY3)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 QUICK FIXES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Option 1: Retry build"
echo "  eas build --platform ios --profile production"
echo ""

echo "Option 2: Clear credentials and retry"
echo "  eas credentials"
echo "  (Select iOS → production → regenerate)"
echo ""

echo "Option 3: Create App ID manually"
echo "  https://developer.apple.com/account/resources/identifiers/list"
echo "  Create: com.spectit.app"
echo ""

echo "Option 4: Use app-specific password"
echo "  https://appleid.apple.com/account/manage"
echo "  Generate app-specific password for EAS"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📖 Full troubleshooting guide: TROUBLESHOOT_BUILD_FAILURE.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
