#!/bin/bash

# Optimized Build Script - Builds with full optimizations for App Store

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 OPTIMIZED BUILD - SPECT-IT iOS APP                                ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

export LANG=en_US.UTF-8

# Verify workspace exists
if [ ! -d "ios/SpectIT.xcworkspace" ]; then
    echo "❌ Xcode workspace not found!"
    echo "   Run ./FULL_REBUILD.sh first"
    exit 1
fi

echo "✅ Workspace verified"
echo ""

# Build configuration
SCHEME="SpectIT"
WORKSPACE="ios/SpectIT.xcworkspace"
CONFIGURATION="Release"
TEAM_ID="P7BPRR2MY3"
BUNDLE_ID="com.spectit.app"

echo "📋 Build Configuration:"
echo "   Scheme: $SCHEME"
echo "   Configuration: $CONFIGURATION"
echo "   Team ID: $TEAM_ID"
echo "   Bundle ID: $BUNDLE_ID"
echo ""

# Option 1: Build via command line (requires proper signing setup)
echo "🔨 Building archive..."
echo ""
echo "   This will create an archive ready for App Store distribution"
echo "   Note: Requires automatic signing to be configured in Xcode"
echo ""

# Create archive directory
mkdir -p ios/build

# Build archive with optimizations
xcodebuild clean archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -archivePath "./ios/build/SpectIT.xcarchive" \
    -destination "generic/platform=iOS" \
    -allowProvisioningUpdates \
    DEVELOPMENT_TEAM="$TEAM_ID" \
    CODE_SIGN_STYLE=Automatic \
    CODE_SIGN_IDENTITY="Apple Distribution" \
    PROVISIONING_PROFILE_SPECIFIER="" \
    GCC_OPTIMIZATION_LEVEL=s \
    SWIFT_OPTIMIZATION_LEVEL=-O \
    STRIP_INSTALLED_PRODUCT=YES \
    COPY_PHASE_STRIP=YES \
    DEPLOYMENT_POSTPROCESSING=YES \
    2>&1 | tee ios/build.log

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✅ ARCHIVE CREATED SUCCESSFULLY!"
    echo ""
    echo "📦 Archive location:"
    echo "   ios/build/SpectIT.xcarchive"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. Open Xcode Organizer:"
    echo "   open -a Xcode ios/build/SpectIT.xcarchive"
    echo ""
    echo "2. Or distribute via command line:"
    echo "   xcodebuild -exportArchive \\"
    echo "     -archivePath ios/build/SpectIT.xcarchive \\"
    echo "     -exportPath ios/build/export \\"
    echo "     -exportOptionsPlist ios/ExportOptions.plist"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo ""
    echo "❌ Build failed. Check ios/build.log for details"
    echo ""
    echo "💡 Alternative: Build via Xcode GUI"
    echo "   1. open ios/SpectIT.xcworkspace"
    echo "   2. Product → Archive"
    exit 1
fi

