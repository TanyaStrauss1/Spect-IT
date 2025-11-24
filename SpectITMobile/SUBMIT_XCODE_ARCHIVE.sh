#!/bin/bash

# Submit Xcode Archive to App Store Connect
# This submits an archive you built in Xcode

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          📤 SUBMIT XCODE ARCHIVE TO APP STORE CONNECT                  ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Find recent archives
ARCHIVES_DIR="$HOME/Library/Developer/Xcode/Archives"
RECENT_ARCHIVE=$(find "$ARCHIVES_DIR" -name "*.xcarchive" -type d -mtime -7 2>/dev/null | sort -r | head -1)

if [ -z "$RECENT_ARCHIVE" ]; then
    echo "⚠️  No recent Xcode archive found"
    echo ""
    echo "You need to:"
    echo "1. Build and archive in Xcode (Product → Archive)"
    echo "2. Or build with EAS: ./BUILD_AND_SUBMIT_COMPLETE.sh"
    echo ""
    exit 1
fi

echo "✅ Found archive: $RECENT_ARCHIVE"
echo ""

# Use xcodebuild to export and submit
echo "📤 Submitting archive to App Store Connect..."
echo ""
echo "⚠️  You will be prompted for:"
echo "   - Apple ID: tanstrauss@gmail.com"
echo "   - Password: [Your Apple ID password]"
echo "   - 2FA Code: [If enabled]"
echo ""

# Export options
EXPORT_DIR="./build/export"
mkdir -p "$EXPORT_DIR"

cat > "$EXPORT_DIR/ExportOptions.plist" << EOF
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
</dict>
</plist>
EOF

echo "🔨 Exporting archive..."
xcodebuild -exportArchive \
    -archivePath "$RECENT_ARCHIVE" \
    -exportPath "$EXPORT_DIR" \
    -exportOptionsPlist "$EXPORT_DIR/ExportOptions.plist"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Export failed. Try submitting from Xcode Organizer instead."
    echo ""
    echo "Alternative: Use EAS to build and submit:"
    echo "  ./BUILD_AND_SUBMIT_COMPLETE.sh"
    exit 1
fi

# Find the .ipa file
IPA_FILE=$(find "$EXPORT_DIR" -name "*.ipa" | head -1)

if [ -z "$IPA_FILE" ]; then
    echo "❌ Could not find .ipa file after export"
    exit 1
fi

echo ""
echo "✅ Archive exported: $IPA_FILE"
echo ""
echo "📤 Uploading to App Store Connect..."
echo ""

# Use altool or Transporter to upload
if command -v xcrun altool &> /dev/null; then
    echo "Using altool to upload..."
    xcrun altool --upload-app \
        --type ios \
        --file "$IPA_FILE" \
        --username "tanstrauss@gmail.com" \
        --password "@keychain:Application Loader: tanstrauss@gmail.com" \
        || echo "⚠️  altool upload failed. Try using Transporter app or EAS submit."
else
    echo "⚠️  altool not available. Use one of these:"
    echo ""
    echo "Option 1: Use Transporter app"
    echo "  1. Open Transporter (from Mac App Store)"
    echo "  2. Sign in with: tanstrauss@gmail.com"
    echo "  3. Drag and drop: $IPA_FILE"
    echo "  4. Click 'Deliver'"
    echo ""
    echo "Option 2: Use EAS (Recommended)"
    echo "  ./BUILD_AND_SUBMIT_COMPLETE.sh"
    echo ""
fi

