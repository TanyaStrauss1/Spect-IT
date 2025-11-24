#!/bin/bash

# Automatic Build and Deploy to App Store using Xcode CLI
# This script builds, archives, and submits to App Store Connect automatically

set -e  # Exit on error

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 AUTOMATIC XCODE BUILD & DEPLOY TO APP STORE                     ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
APP_NAME="spectit-mobile"
SCHEME="spectit-mobile"
BUNDLE_ID="com.spectit.app"
TEAM_ID="P7BPRR2MY3"
APPLE_ID="tanstrauss@gmail.com"
WORKSPACE_PATH="ios/${APP_NAME}.xcworkspace"
ARCHIVE_PATH="build/${APP_NAME}.xcarchive"
EXPORT_PATH="build/export"
EXPORT_OPTIONS_PLIST="build/ExportOptions.plist"

# Create build directory
mkdir -p build

echo "📋 Configuration:"
echo "   App Name: $APP_NAME"
echo "   Bundle ID: $BUNDLE_ID"
echo "   Team ID: $TEAM_ID"
echo "   Apple ID: $APPLE_ID"
echo ""

# Step 1: Check if iOS project exists
if [ ! -d "ios" ]; then
    echo "📱 Generating iOS project..."
    export LANG=en_US.UTF-8
    npx expo prebuild --platform ios
    if [ $? -ne 0 ]; then
        echo "❌ Failed to generate iOS project"
        exit 1
    fi
fi

# Step 2: Check if workspace exists
if [ ! -f "$WORKSPACE_PATH" ] && [ ! -f "ios/${APP_NAME}.xcodeproj" ]; then
    echo "❌ Xcode project not found"
    exit 1
fi

# Use project if workspace doesn't exist
if [ ! -f "$WORKSPACE_PATH" ]; then
    PROJECT_PATH="ios/${APP_NAME}.xcodeproj"
    echo "📦 Using Xcode project (not workspace)"
else
    PROJECT_PATH="$WORKSPACE_PATH"
    echo "📦 Using Xcode workspace"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 3: Clean build folder
echo "🧹 Cleaning build folder..."
xcodebuild clean \
    -workspace "$WORKSPACE_PATH" \
    -scheme "$SCHEME" \
    -configuration Release 2>/dev/null || \
xcodebuild clean \
    -project "$PROJECT_PATH" \
    -scheme "$SCHEME" \
    -configuration Release 2>/dev/null || echo "⚠️  Clean failed (may not exist yet)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 4: Build and Archive
echo "📦 Building and archiving..."
echo "   This may take 5-15 minutes..."
echo ""

xcodebuild archive \
    -workspace "$WORKSPACE_PATH" \
    -scheme "$SCHEME" \
    -configuration Release \
    -archivePath "$ARCHIVE_PATH" \
    -destination "generic/platform=iOS" \
    CODE_SIGN_IDENTITY="Apple Distribution" \
    DEVELOPMENT_TEAM="$TEAM_ID" \
    PROVISIONING_PROFILE_SPECIFIER="" \
    -allowProvisioningUpdates 2>&1 | tee build/archive.log || \
xcodebuild archive \
    -project "$PROJECT_PATH" \
    -scheme "$SCHEME" \
    -configuration Release \
    -archivePath "$ARCHIVE_PATH" \
    -destination "generic/platform=iOS" \
    CODE_SIGN_IDENTITY="Apple Distribution" \
    DEVELOPMENT_TEAM="$TEAM_ID" \
    PROVISIONING_PROFILE_SPECIFIER="" \
    -allowProvisioningUpdates 2>&1 | tee build/archive.log

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Archive failed. Check build/archive.log for details"
    exit 1
fi

echo ""
echo "✅ Archive created successfully!"
echo ""

# Step 5: Create Export Options Plist
echo "📝 Creating export options..."
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

# Step 6: Export Archive
echo "📤 Exporting archive for App Store..."
echo "   This may take 5-10 minutes..."
echo ""

xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$EXPORT_PATH" \
    -exportOptionsPlist "$EXPORT_OPTIONS_PLIST" \
    -allowProvisioningUpdates 2>&1 | tee build/export.log

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Export failed. Check build/export.log for details"
    exit 1
fi

echo ""
echo "✅ Export completed!"
echo ""

# Step 7: Find the .ipa file
IPA_FILE=$(find "$EXPORT_PATH" -name "*.ipa" | head -1)

if [ -z "$IPA_FILE" ]; then
    echo "❌ IPA file not found in $EXPORT_PATH"
    exit 1
fi

echo "📦 Found IPA: $IPA_FILE"
echo ""

# Step 8: Upload to App Store Connect
echo "🚀 Uploading to App Store Connect..."
echo "   You may be prompted for Apple ID password"
echo ""

# Try using altool (older method)
if command -v xcrun &> /dev/null; then
    echo "📤 Uploading with xcrun altool..."
    
    # Check if we need to use app-specific password
    read -p "Do you have an app-specific password? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -sp "Enter app-specific password: " APP_SPECIFIC_PASSWORD
        echo ""
        
        xcrun altool --upload-app \
            --type ios \
            --file "$IPA_FILE" \
            --username "$APPLE_ID" \
            --password "$APP_SPECIFIC_PASSWORD" \
            2>&1 | tee build/upload.log
    else
        echo "📝 Using regular password (may require 2FA)..."
        xcrun altool --upload-app \
            --type ios \
            --file "$IPA_FILE" \
            --username "$APPLE_ID" \
            --password "@keychain:Application Loader: ${APPLE_ID}" \
            2>&1 | tee build/upload.log || \
        echo "⚠️  Keychain method failed. Please enter password manually:"
        xcrun altool --upload-app \
            --type ios \
            --file "$IPA_FILE" \
            --username "$APPLE_ID" \
            --password "$(read -sp 'Password: '; echo $REPLY)" \
            2>&1 | tee build/upload.log
    fi
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Upload successful!"
    else
        echo ""
        echo "⚠️  Upload may have failed. Check build/upload.log"
        echo "   You can also upload manually via Transporter app"
    fi
else
    echo "❌ xcrun not found. Please install Xcode Command Line Tools"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Build and upload process completed!"
echo ""
echo "📊 Next Steps:"
echo "   1. Go to App Store Connect:"
echo "      https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight"
echo ""
echo "   2. Wait 10-30 minutes for build to appear"
echo ""
echo "   3. Select the build and complete app listing"
echo ""
echo "   4. Submit for review"
echo ""
echo "📁 Build artifacts saved in: build/"
echo ""

