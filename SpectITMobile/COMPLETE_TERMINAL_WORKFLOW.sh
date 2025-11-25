#!/bin/bash

# Complete Terminal Workflow: Build + Prepare for Transporter Upload
# Everything from Cursor terminal - no Xcode GUI needed

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 COMPLETE TERMINAL WORKFLOW - BUILD & UPLOAD                   ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
WORKSPACE="ios/SpectIT.xcworkspace"
SCHEME="SpectIT"
CONFIGURATION="Release"
ARCHIVE_PATH="build/SpectIT.xcarchive"
EXPORT_PATH="build/AppStore"
EXPORT_OPTIONS_PLIST="ios/ExportOptions.plist"

# Create directories
mkdir -p build
mkdir -p "$EXPORT_PATH"

echo "📋 Configuration:"
echo "   Workspace: $WORKSPACE"
echo "   Scheme: $SCHEME"
echo "   Team: P7BPRR2MY3"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v xcodebuild >/dev/null 2>&1; then
    echo "❌ xcodebuild not found. Please install Xcode."
    exit 1
fi

if [ ! -d "$WORKSPACE" ]; then
    echo "❌ Xcode workspace not found: $WORKSPACE"
    echo "   Run: npx expo prebuild --platform ios"
    exit 1
fi

echo "✅ Prerequisites met"
echo ""

# Create ExportOptions.plist
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

# Step 1: Clean
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧹 Step 1: Cleaning build folder..."
xcodebuild clean \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    > build/clean.log 2>&1 || echo "⚠️  Clean completed with warnings"
echo "✅ Clean complete"
echo ""

# Step 2: Archive
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Step 2: Creating archive..."
echo "   This may take 5-15 minutes..."
echo ""

xcodebuild archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -archivePath "$ARCHIVE_PATH" \
    -destination "generic/platform=iOS" \
    CODE_SIGN_STYLE="Automatic" \
    DEVELOPMENT_TEAM="P7BPRR2MY3" \
    PROVISIONING_PROFILE_SPECIFIER="" \
    > build/archive.log 2>&1

ARCHIVE_EXIT_CODE=$?

# Check for common errors
if [ $ARCHIVE_EXIT_CODE -ne 0 ]; then
    echo "❌ Archive failed!"
    echo ""
    
    # Check for signing errors
    if grep -q "conflicting provisioning settings" build/archive.log; then
        echo "🔧 SIGNING ERROR DETECTED"
        echo ""
        echo "The project needs signing configured first."
        echo ""
        echo "Quick fix:"
        echo "1. Open Xcode: open ios/SpectIT.xcworkspace"
        echo "2. Project → Target → Signing & Capabilities"
        echo "3. ✅ Check 'Automatically manage signing'"
        echo "4. Select Team: Tanya Strauss (P7BPRR2MY3)"
        echo "5. Try building once: Product → Build (Cmd+B)"
        echo "6. Then run this script again"
        echo ""
        echo "Or check build/archive.log for details"
        exit 1
    fi
    
    echo "Check build/archive.log for error details:"
    tail -20 build/archive.log
    exit 1
fi

if [ ! -d "$ARCHIVE_PATH" ]; then
    echo "❌ Archive directory not created. Check build/archive.log"
    exit 1
fi

echo "✅ Archive created successfully!"
echo "   Location: $ARCHIVE_PATH"
echo ""

# Step 3: Export IPA
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📤 Step 3: Exporting IPA for App Store..."
echo "   This may take 5-10 minutes..."
echo ""

xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$EXPORT_PATH" \
    -exportOptionsPlist "$EXPORT_OPTIONS_PLIST" \
    > build/export.log 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Export failed. Check build/export.log for details"
    tail -20 build/export.log
    exit 1
fi

# Find IPA file
IPA_FILE=$(find "$EXPORT_PATH" -name "*.ipa" 2>/dev/null | head -1)

if [ -z "$IPA_FILE" ]; then
    echo "❌ IPA file not found in $EXPORT_PATH"
    echo "Check build/export.log for details"
    exit 1
fi

echo "✅ IPA exported successfully!"
echo "   File: $IPA_FILE"
echo "   Size: $(du -h "$IPA_FILE" | cut -f1)"
echo ""

# Step 4: Prepare for Transporter
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Step 4: Preparing for Transporter upload..."
echo ""

# Copy IPA to Desktop for easy access
DESKTOP_IPA="$HOME/Desktop/SpectIT.ipa"
cp "$IPA_FILE" "$DESKTOP_IPA"
echo "✅ IPA copied to Desktop: $DESKTOP_IPA"
echo ""

# Check if Transporter is installed
if [ -d "/Applications/Transporter.app" ]; then
    echo "✅ Transporter app found"
    echo ""
    echo "🚀 Opening Transporter..."
    open -a Transporter
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📤 UPLOAD INSTRUCTIONS:"
    echo ""
    echo "1. Transporter should now be open"
    echo "2. Sign in with: tanstrauss@gmail.com"
    echo "3. Drag this file into Transporter:"
    echo "   $DESKTOP_IPA"
    echo "4. Verify information:"
    echo "   - App Name: Spect-IT"
    echo "   - Version: 1.0.0"
    echo "   - Bundle ID: com.spectit.app"
    echo "5. Click 'Deliver'"
    echo "6. Wait for upload (5-10 minutes)"
    echo ""
else
    echo "⚠️  Transporter app not found"
    echo ""
    echo "📥 INSTALL TRANSPORTER:"
    echo "   1. Open Mac App Store"
    echo "   2. Search: 'Transporter'"
    echo "   3. Install (free, by Apple)"
    echo "   4. Then run this script again or manually upload:"
    echo "      $DESKTOP_IPA"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ BUILD COMPLETE!"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "After uploading with Transporter:"
echo "1. Go to: https://appstoreconnect.apple.com/apps/6755681856"
echo "2. Wait 15-30 minutes for processing"
echo "3. Click 'App Store' tab"
echo "4. Select your build"
echo "5. Complete required fields"
echo "6. Submit for review"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Files created:"
echo "   Archive: $ARCHIVE_PATH"
echo "   IPA: $IPA_FILE"
echo "   Desktop copy: $DESKTOP_IPA"
echo ""

