#!/bin/bash

# Simple Fix - Direct Terminal Build
# This builds the app directly from terminal without Xcode GUI

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🔧 SIMPLE FIX - TERMINAL BUILD                                        ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check workspace
if [ ! -d "ios/SpectIT.xcworkspace" ]; then
    echo "❌ Xcode workspace not found"
    echo "   Generating iOS project..."
    npx expo prebuild --platform ios --clean
    cd ios && pod install && cd ..
fi

echo "✅ Workspace found"
echo ""

# Clean first
echo "🧹 Cleaning..."
xcodebuild clean -workspace ios/SpectIT.xcworkspace -scheme SpectIT 2>&1 | tail -5
echo ""

# Build and Archive
echo "📦 Building and Archiving..."
echo "   This will take 5-15 minutes..."
echo ""

ARCHIVE_PATH="build/SpectIT.xcarchive"

mkdir -p build

xcodebuild archive \
  -workspace ios/SpectIT.xcworkspace \
  -scheme SpectIT \
  -configuration Release \
  -archivePath "$ARCHIVE_PATH" \
  -allowProvisioningUpdates \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=P7BPRR2MY3 \
  PROVISIONING_PROFILE_SPECIFIER="" \
  2>&1 | tee build.log

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Archive created successfully!"
    echo ""
    echo "📦 Archive location: $ARCHIVE_PATH"
    echo ""
    echo "📋 Next: Upload to App Store Connect"
    echo ""
    echo "   Option 1: Use Transporter app"
    echo "   Option 2: Use Xcode Organizer"
    echo "   Option 3: Use altool/xcrun"
    echo ""
    
    # Try to open Organizer
    open -a Xcode "$ARCHIVE_PATH" 2>/dev/null || echo "   Open Xcode → Window → Organizer to upload"
else
    echo ""
    echo "❌ Build failed. Check build.log for details"
    exit 1
fi

