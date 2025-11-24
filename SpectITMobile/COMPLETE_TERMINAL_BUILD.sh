#!/bin/bash

# Complete Build and Deploy from Terminal
# Builds, archives, and submits to App Store Connect - all from terminal

set -e  # Exit on error

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 COMPLETE TERMINAL BUILD & DEPLOY - SPECT-IT                      ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
APP_NAME="SpectIT"
SCHEME="SpectIT"
BUNDLE_ID="com.spectit.app"
TEAM_ID="P7BPRR2MY3"
APPLE_ID="tanstrauss@gmail.com"
APPLE_PASSWORD="Zara57048576!"
APP_STORE_ID="6755681856"

# Find project files dynamically (exclude internal workspace files)
WORKSPACE_PATH=$(find ios -maxdepth 1 -name "*.xcworkspace" -type d 2>/dev/null | head -1)
PROJECT_PATH=$(find ios -maxdepth 1 -name "*.xcodeproj" -type d 2>/dev/null | head -1)

ARCHIVE_PATH="build/${APP_NAME}.xcarchive"
EXPORT_PATH="build/export"
EXPORT_OPTIONS_PLIST="build/ExportOptions.plist"

# Create build directory
mkdir -p build

echo "📱 App: Spect-IT"
echo "📦 Bundle ID: $BUNDLE_ID"
echo "🍎 Apple ID: $APPLE_ID"
echo "🆔 Team ID: $TEAM_ID"
echo "🆔 App Store ID: $APP_STORE_ID"
echo ""

# Step 1: Verify prerequisites
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 Step 1: Verifying prerequisites..."
echo ""

# Check Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode not found. Please install Xcode from Mac App Store"
    exit 1
fi
echo "✅ Xcode found: $(xcodebuild -version | head -1)"

# Check if project exists
if [ -n "$WORKSPACE_PATH" ] && [ -d "$WORKSPACE_PATH" ]; then
    BUILD_PATH="$WORKSPACE_PATH"
    BUILD_TYPE="-workspace"
    echo "✅ Using Xcode workspace: $WORKSPACE_PATH"
elif [ -n "$PROJECT_PATH" ] && [ -d "$PROJECT_PATH" ]; then
    BUILD_PATH="$PROJECT_PATH"
    BUILD_TYPE="-project"
    echo "✅ Using Xcode project: $PROJECT_PATH"
else
    echo "❌ Xcode project not found"
    echo "   Looking for: ios/*.xcworkspace or ios/*.xcodeproj"
    echo "   Found workspace: $WORKSPACE_PATH"
    echo "   Found project: $PROJECT_PATH"
    echo ""
    echo "   Available files in ios/:"
    ls -la ios/*.xcodeproj ios/*.xcworkspace 2>/dev/null || echo "   No project files found"
    exit 1
fi

# Check CocoaPods
if [ -d "ios/Pods" ]; then
    echo "✅ CocoaPods installed"
else
    echo "⚠️  CocoaPods not found, installing..."
    cd ios && pod install && cd ..
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 2: Clean build
echo "🧹 Step 2: Cleaning build folder..."
echo ""

xcodebuild clean \
    $BUILD_TYPE "$BUILD_PATH" \
    -scheme "$SCHEME" \
    -configuration Release 2>&1 | grep -v "note:" || echo "✅ Clean completed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 3: Build and Archive
echo "📦 Step 3: Building and archiving..."
echo ""
echo "⏱️  This will take 5-15 minutes"
echo ""

xcodebuild archive \
    $BUILD_TYPE "$BUILD_PATH" \
    -scheme "$SCHEME" \
    -configuration Release \
    -archivePath "$ARCHIVE_PATH" \
    -destination "generic/platform=iOS" \
    DEVELOPMENT_TEAM="$TEAM_ID" \
    CODE_SIGN_STYLE="Automatic" \
    -allowProvisioningUpdates 2>&1 | tee build/archive.log | grep -E "(error|warning|succeeded|Archive)" || true

if [ ! -d "$ARCHIVE_PATH" ]; then
    echo ""
    echo "❌ Archive failed. Check build/archive.log for details"
    exit 1
fi

echo ""
echo "✅ Archive created successfully!"
echo ""

# Step 4: Create Export Options
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Step 4: Creating export options..."
echo ""

cat > "$EXPORT_OPTIONS_PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>$TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>destination</key>
    <string>upload</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>stripSwiftSymbols</key>
    <true/>
</dict>
</plist>
EOF

echo "✅ Export options created"
echo ""

# Step 5: Export Archive
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📤 Step 5: Exporting archive for App Store..."
echo ""
echo "⏱️  This will take 5-10 minutes"
echo ""

xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$EXPORT_PATH" \
    -exportOptionsPlist "$EXPORT_OPTIONS_PLIST" \
    -allowProvisioningUpdates 2>&1 | tee build/export.log | grep -E "(error|warning|succeeded|Export)" || true

# Find IPA file
IPA_FILE=$(find "$EXPORT_PATH" -name "*.ipa" | head -1)

if [ -z "$IPA_FILE" ]; then
    echo ""
    echo "❌ IPA file not found. Check build/export.log"
    exit 1
fi

echo ""
echo "✅ Export completed!"
echo "📦 IPA file: $IPA_FILE"
echo ""

# Step 6: Upload to App Store Connect
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Step 6: Uploading to App Store Connect..."
echo ""
echo "⏱️  This will take 5-10 minutes"
echo ""

# Use altool for upload
if command -v xcrun &> /dev/null; then
    echo "📤 Uploading with xcrun altool..."
    echo ""
    
    # Try with password
    xcrun altool --upload-app \
        --type ios \
        --file "$IPA_FILE" \
        --username "$APPLE_ID" \
        --password "$APPLE_PASSWORD" \
        2>&1 | tee build/upload.log
    
    UPLOAD_EXIT_CODE=${PIPESTATUS[0]}
    
    if [ $UPLOAD_EXIT_CODE -eq 0 ]; then
        echo ""
        echo "✅ Upload successful!"
    else
        echo ""
        echo "⚠️  Upload may have failed. Check build/upload.log"
        echo ""
        echo "💡 Alternative: Upload manually via Transporter app"
        echo "   1. Download Transporter from Mac App Store"
        echo "   2. Open Transporter"
        echo "   3. Drag and drop: $IPA_FILE"
        echo "   4. Click Deliver"
    fi
else
    echo "❌ xcrun not found"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Complete Terminal Build & Deploy Finished!"
echo ""
echo "📊 Next Steps:"
echo ""
echo "1. Go to App Store Connect:"
echo "   https://appstoreconnect.apple.com/apps/$APP_STORE_ID/distribution/ios/version/inflight"
echo ""
echo "2. Wait for Build (10-30 minutes):"
echo "   - Build needs to process on Apple's servers"
echo "   - Refresh page periodically"
echo ""
echo "3. Select Build:"
echo "   - Click 'Select a build before you submit your app'"
echo "   - Choose your uploaded build"
echo ""
echo "4. Complete App Listing:"
echo "   - Add screenshots (required)"
echo "   - Fill in description"
echo "   - Complete all required fields"
echo ""
echo "5. Submit for Review:"
echo "   - Click 'Submit for Review'"
echo ""
echo "📁 Build artifacts saved in: build/"
echo ""

