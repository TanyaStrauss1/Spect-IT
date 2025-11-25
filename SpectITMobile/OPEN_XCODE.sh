#!/bin/bash

# Open Xcode for Spect-IT Mobile Project

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🍎 OPENING XCODE                                                ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Xcode is installed
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 1: Checking Xcode Installation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! command -v xcode-select &> /dev/null; then
    echo "❌ Xcode command line tools not found"
    echo ""
    echo "📥 Install Xcode:"
    echo "   1. Open Mac App Store"
    echo "   2. Search for 'Xcode'"
    echo "   3. Click 'Get' or 'Install'"
    echo "   4. Wait for download (10-15 GB)"
    echo ""
    echo "Or install command line tools:"
    echo "   xcode-select --install"
    exit 1
fi

XCODE_PATH=$(xcode-select -p 2>/dev/null)
if [ -z "$XCODE_PATH" ]; then
    echo "⚠️  Xcode path not set"
    echo "   Installing command line tools..."
    xcode-select --install
    echo "   Please complete installation, then try again"
    exit 1
fi

echo "✅ Xcode found at: $XCODE_PATH"

# Check Xcode version
XCODE_VERSION=$(xcodebuild -version 2>/dev/null | head -1)
if [ -n "$XCODE_VERSION" ]; then
    echo "✅ $XCODE_VERSION"
else
    echo "⚠️  Could not determine Xcode version"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 2: Checking iOS Project"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PROJECT_PATH=""
if [ -f "ios/SpectIT.xcworkspace/contents.xcworkspacedata" ]; then
    PROJECT_PATH="ios/SpectIT.xcworkspace"
    echo "✅ Found workspace: $PROJECT_PATH"
elif [ -f "ios/SpectIT.xcodeproj/project.pbxproj" ]; then
    PROJECT_PATH="ios/SpectIT.xcodeproj"
    echo "✅ Found project: $PROJECT_PATH"
else
    echo "⚠️  iOS project not found"
    echo ""
    echo "📱 Generating iOS project..."
    npx expo prebuild --platform ios --clean
    
    if [ -f "ios/SpectIT.xcworkspace/contents.xcworkspacedata" ]; then
        PROJECT_PATH="ios/SpectIT.xcworkspace"
        echo "✅ Workspace created: $PROJECT_PATH"
    elif [ -f "ios/SpectIT.xcodeproj/project.pbxproj" ]; then
        PROJECT_PATH="ios/SpectIT.xcodeproj"
        echo "✅ Project created: $PROJECT_PATH"
    else
        echo "❌ Failed to generate iOS project"
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 3: Opening Xcode"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Opening: $PROJECT_PATH"
echo ""

# Try to open Xcode
if open "$PROJECT_PATH" 2>/dev/null; then
    echo "✅ Xcode should be opening now..."
    echo ""
    echo "⏳ Wait 1-2 minutes for Xcode to load"
    echo ""
    echo "📋 Once Xcode opens:"
    echo "   1. Wait for project to index (2-5 minutes)"
    echo "   2. Verify scheme shows 'SpectIT' (top toolbar)"
    echo "   3. Select 'Any iOS Device' as target"
    echo "   4. Product → Clean Build Folder (Cmd + Shift + K)"
    echo "   5. Product → Archive"
else
    echo "❌ Failed to open Xcode"
    echo ""
    echo "🔧 Try manually:"
    echo "   1. Open Xcode application"
    echo "   2. File → Open"
    echo "   3. Navigate to: $(pwd)/$PROJECT_PATH"
    echo "   4. Click Open"
    echo ""
    echo "Or use:"
    echo "   open -a Xcode $PROJECT_PATH"
    
    # Try alternative method
    echo ""
    echo "Trying alternative method..."
    open -a Xcode "$PROJECT_PATH" 2>&1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DONE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

