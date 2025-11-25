#!/bin/bash

# Complete terminal workflow: Build + Upload to App Store Connect
# This script builds the app and uploads it directly to App Store Connect

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 BUILD & UPLOAD TO APP STORE - TERMINAL                        ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# First, build the app
echo "📦 Step 1: Building app for App Store..."
./BUILD_FOR_APP_STORE_TERMINAL.sh

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Cannot proceed with upload."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find the IPA file
IPA_FILE=$(find build/AppStore -name "*.ipa" 2>/dev/null | head -1)

if [ -z "$IPA_FILE" ]; then
    echo "❌ IPA file not found. Cannot upload."
    exit 1
fi

echo "📤 Step 2: Uploading to App Store Connect..."
echo "   IPA: $IPA_FILE"
echo ""

# Check if xcrun altool is available (older method)
if command -v xcrun >/dev/null 2>&1; then
    echo "💡 Uploading via xcrun altool..."
    echo "   You'll be prompted for your Apple ID password"
    echo "   (Use app-specific password if 2FA is enabled)"
    echo ""
    
    read -p "Enter Apple ID (tanstrauss@gmail.com): " APPLE_ID
    APPLE_ID=${APPLE_ID:-tanstrauss@gmail.com}
    
    echo ""
    echo "Uploading..."
    xcrun altool --upload-app \
        --type ios \
        --file "$IPA_FILE" \
        --username "$APPLE_ID" \
        --password "@keychain:Application Loader: $APPLE_ID" \
        2>&1 | tee build/upload.log
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        echo ""
        echo "✅ Upload successful!"
        echo ""
        echo "📋 Next steps:"
        echo "   1. Go to App Store Connect: https://appstoreconnect.apple.com"
        echo "   2. Wait 15-30 minutes for processing"
        echo "   3. Select build in App Store tab"
        echo "   4. Submit for review"
    else
        echo ""
        echo "❌ Upload failed. Check build/upload.log"
        echo ""
        echo "💡 Alternative: Use Transporter app"
        echo "   1. Open Transporter (from App Store)"
        echo "   2. Drag $IPA_FILE into Transporter"
        echo "   3. Sign in and deliver"
    fi
else
    echo "⚠️  xcrun altool not available"
    echo ""
    echo "💡 Use Transporter app instead:"
    echo "   1. Open Transporter app (download from App Store)"
    echo "   2. Drag this file into Transporter:"
    echo "      $IPA_FILE"
    echo "   3. Sign in with: tanstrauss@gmail.com"
    echo "   4. Click 'Deliver'"
    echo ""
    echo "Or use Xcode Organizer:"
    echo "   1. Open Xcode → Window → Organizer"
    echo "   2. Find your archive"
    echo "   3. Click 'Distribute App'"
fi

echo ""

