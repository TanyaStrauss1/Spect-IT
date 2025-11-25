#!/bin/bash

# Build iOS app for App Store from terminal
# This creates an archive and prepares it for App Store submission

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 BUILD FOR APP STORE - TERMINAL                                ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v xcodebuild >/dev/null 2>&1; then
    echo "❌ xcodebuild not found. Please install Xcode."
    exit 1
fi

if [ ! -d "ios/SpectIT.xcworkspace" ]; then
    echo "❌ Xcode workspace not found. Run: npx expo prebuild --platform ios"
    exit 1
fi

echo "✅ Prerequisites met"
echo ""

# Configuration
WORKSPACE="ios/SpectIT.xcworkspace"
SCHEME="SpectIT"
CONFIGURATION="Release"
ARCHIVE_PATH="build/SpectIT.xcarchive"
EXPORT_PATH="build/AppStore"
EXPORT_OPTIONS_PLIST="ios/ExportOptions.plist"

# Create build directory
mkdir -p build

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 BUILD CONFIGURATION:"
echo "   Workspace: $WORKSPACE"
echo "   Scheme: $SCHEME"
echo "   Configuration: $CONFIGURATION"
echo "   Archive: $ARCHIVE_PATH"
echo ""

# Create ExportOptions.plist if it doesn't exist
if [ ! -f "$EXPORT_OPTIONS_PLIST" ]; then
    echo "📝 Creating ExportOptions.plist..."
    cat > "$EXPORT_OPTIONS_PLIST" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>P7BPRR2MY3</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>destination</key>
    <string>export</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>thinning</key>
    <string>&lt;none&gt;</string>
</dict>
</plist>
EOF
    echo "✅ ExportOptions.plist created"
    echo ""
fi

# Step 1: Clean build folder
echo "🧹 Step 1: Cleaning build folder..."
xcodebuild clean \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    > build/clean.log 2>&1 || echo "⚠️  Clean completed with warnings"
echo "✅ Clean complete"
echo ""

# Step 2: Archive
echo "📦 Step 2: Creating archive..."
echo "   This may take 5-15 minutes..."
xcodebuild archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -archivePath "$ARCHIVE_PATH" \
    -destination "generic/platform=iOS" \
    CODE_SIGN_IDENTITY="Apple Distribution" \
    CODE_SIGN_STYLE="Automatic" \
    DEVELOPMENT_TEAM="P7BPRR2MY3" \
    PROVISIONING_PROFILE_SPECIFIER="" \
    > build/archive.log 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Archive created successfully!"
    echo "   Location: $ARCHIVE_PATH"
else
    echo "❌ Archive failed. Check build/archive.log for details."
    echo ""
    echo "Common issues:"
    echo "  - Signing errors: Check Signing & Capabilities in Xcode"
    echo "  - Team not configured: Set team in Xcode → Signing & Capabilities"
    echo "  - Missing dependencies: Run 'cd ios && pod install'"
    exit 1
fi
echo ""

# Step 3: Export IPA
echo "📤 Step 3: Exporting IPA for App Store..."
xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$EXPORT_PATH" \
    -exportOptionsPlist "$EXPORT_OPTIONS_PLIST" \
    > build/export.log 2>&1

if [ $? -eq 0 ]; then
    IPA_FILE=$(find "$EXPORT_PATH" -name "*.ipa" | head -1)
    if [ -n "$IPA_FILE" ]; then
        echo "✅ IPA exported successfully!"
        echo "   Location: $IPA_FILE"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "📋 NEXT STEPS - UPLOAD TO APP STORE:"
        echo ""
        echo "Option 1: Upload via Transporter app"
        echo "   1. Open Transporter app (from App Store)"
        echo "   2. Drag $IPA_FILE into Transporter"
        echo "   3. Sign in with: tanstrauss@gmail.com"
        echo "   4. Click 'Deliver'"
        echo ""
        echo "Option 2: Upload via Xcode"
        echo "   1. Open Xcode"
        echo "   2. Window → Organizer"
        echo "   3. Select your archive"
        echo "   4. Click 'Distribute App'"
        echo "   5. Choose 'App Store Connect'"
        echo ""
        echo "Option 3: Upload via command line (xcrun altool)"
        echo "   xcrun altool --upload-app --type ios --file \"$IPA_FILE\" --username tanstrauss@gmail.com"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "✅ Build complete! IPA ready for App Store submission."
        echo "   File: $IPA_FILE"
    else
        echo "⚠️  Export completed but IPA file not found"
        echo "   Check: $EXPORT_PATH"
    fi
else
    echo "❌ Export failed. Check build/export.log for details."
    exit 1
fi

echo ""

