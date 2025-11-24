#!/bin/bash

# Get .ipa file from various sources
# This helps you get the .ipa file needed for Transporter or other upload methods

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          📦 GET .ipa FILE FOR SUBMISSION                                ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 OPTION 1: DOWNLOAD FROM EAS BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for EAS builds
echo "Checking for available builds..."
BUILDS=$(eas build:list --platform ios --limit 3 2>/dev/null || echo "")

if [ -n "$BUILDS" ] && echo "$BUILDS" | grep -q "finished"; then
    echo "✅ Found completed builds!"
    echo ""
    echo "$BUILDS"
    echo ""
    echo "To download a build:"
    echo "  eas build:download [BUILD_ID]"
    echo ""
    echo "Or visit: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
else
    echo "⚠️  No completed builds found"
    echo ""
    echo "You need to build first:"
    echo "  eas build --platform ios --profile production"
    echo ""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 OPTION 2: EXPORT FROM XCODE ARCHIVE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ARCHIVES_DIR="$HOME/Library/Developer/Xcode/Archives"
RECENT_ARCHIVE=$(find "$ARCHIVES_DIR" -name "*.xcarchive" -type d -mtime -7 2>/dev/null | sort -r | head -1)

if [ -n "$RECENT_ARCHIVE" ]; then
    echo "✅ Found recent archive:"
    echo "   $RECENT_ARCHIVE"
    echo ""
    echo "To export .ipa:"
    echo "   1. Open Xcode"
    echo "   2. Window → Organizer"
    echo "   3. Select archive"
    echo "   4. Click 'Distribute App'"
    echo "   5. Choose 'Export' (not Upload)"
    echo "   6. Save .ipa file"
else
    echo "⚠️  No recent Xcode archives found"
    echo ""
    echo "To create archive:"
    echo "   1. Open Xcode"
    echo "   2. Product → Archive"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 OPTION 3: BUILD LOCALLY AND EXPORT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "ios" ]; then
    echo "✅ iOS project exists"
    echo ""
    echo "To build and export:"
    echo "   1. open ios/SpectIT.xcworkspace"
    echo "   2. Select 'Any iOS Device'"
    echo "   3. Product → Archive"
    echo "   4. Distribute App → Export"
else
    echo "⚠️  iOS project not found"
    echo ""
    echo "Generate it with:"
    echo "   npx expo prebuild --platform ios"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 NEXT: UPLOAD WITH TRANSPORTER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Once you have the .ipa file:"
echo ""
echo "1. Install Transporter from Mac App Store"
echo "2. Open Transporter"
echo "3. Sign in with: tanstrauss@gmail.com"
echo "4. Drag .ipa file into Transporter"
echo "5. Click 'Deliver'"
echo ""

