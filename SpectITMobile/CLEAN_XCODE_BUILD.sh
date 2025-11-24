#!/bin/bash

# Clean Xcode Build Folder and Derived Data
# This script cleans all Xcode build artifacts

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🧹 CLEANING XCODE BUILD FOLDER                                 ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Clean iOS build folder
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 1: Cleaning iOS build folder"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "ios/build" ]; then
    echo "Removing ios/build..."
    rm -rf ios/build
    echo "✅ Cleaned ios/build"
else
    echo "✅ ios/build doesn't exist (already clean)"
fi

# Clean Xcode Derived Data
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 2: Cleaning Xcode Derived Data"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

DERIVED_DATA_PATH="$HOME/Library/Developer/Xcode/DerivedData"

if [ -d "$DERIVED_DATA_PATH" ]; then
    # Find SpectIT-related derived data
    SPECTIT_DERIVED=$(find "$DERIVED_DATA_PATH" -maxdepth 1 -type d -name "*SpectIT*" 2>/dev/null)
    
    if [ -n "$SPECTIT_DERIVED" ]; then
        echo "Found SpectIT derived data:"
        echo "$SPECTIT_DERIVED"
        echo ""
        read -p "Remove SpectIT derived data? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$SPECTIT_DERIVED"
            echo "✅ Removed SpectIT derived data"
        else
            echo "⏭️  Skipped derived data cleanup"
        fi
    else
        echo "✅ No SpectIT derived data found"
    fi
else
    echo "✅ Derived data folder doesn't exist"
fi

# Clean Pods build
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 3: Cleaning Pods build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "ios/Pods" ]; then
    echo "Note: Pods folder kept (will reinstall if needed)"
    echo "To reinstall pods, run: cd ios && pod install"
fi

# Clean node_modules/.cache if exists
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 4: Cleaning Expo/Metro cache"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "✅ Cleaned node_modules/.cache"
else
    echo "✅ No cache found"
fi

# Verify scheme
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 5: Verifying Xcode Scheme"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SCHEME_FILE="ios/SpectIT.xcodeproj/xcshareddata/xcschemes/SpectIT.xcscheme"

if [ -f "$SCHEME_FILE" ]; then
    echo "✅ Scheme file found: $SCHEME_FILE"
    
    # Check scheme name
    SCHEME_NAME=$(grep -o 'name="[^"]*"' "$SCHEME_FILE" | head -1 | sed 's/name="\(.*\)"/\1/')
    if [ -n "$SCHEME_NAME" ]; then
        echo "   Scheme name: $SCHEME_NAME"
        if [ "$SCHEME_NAME" = "SpectIT" ]; then
            echo "   ✅ Scheme name is correct (SpectIT)"
        else
            echo "   ⚠️  Scheme name is '$SCHEME_NAME' (expected 'SpectIT')"
        fi
    fi
else
    echo "⚠️  Scheme file not found at: $SCHEME_FILE"
    echo "   This is normal if scheme hasn't been shared yet"
fi

# Verify project configuration
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 6: Verifying Project Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PROJECT_FILE="ios/SpectIT.xcodeproj/project.pbxproj"

if [ -f "$PROJECT_FILE" ]; then
    echo "✅ Project file found"
    
    # Check PRODUCT_NAME
    PRODUCT_NAME=$(grep "PRODUCT_NAME = " "$PROJECT_FILE" | grep -v "//" | head -1 | sed 's/.*PRODUCT_NAME = \([^;]*\);.*/\1/')
    if [ -n "$PRODUCT_NAME" ]; then
        echo "   PRODUCT_NAME: $PRODUCT_NAME"
        if [ "$PRODUCT_NAME" = "SpectIT" ]; then
            echo "   ✅ PRODUCT_NAME is correct (SpectIT)"
        else
            echo "   ⚠️  PRODUCT_NAME is '$PRODUCT_NAME' (expected 'SpectIT')"
        fi
    fi
    
    # Check Bundle ID
    BUNDLE_ID=$(grep "PRODUCT_BUNDLE_IDENTIFIER = " "$PROJECT_FILE" | grep -v "//" | head -1 | sed 's/.*PRODUCT_BUNDLE_IDENTIFIER = \([^;]*\);.*/\1/')
    if [ -n "$BUNDLE_ID" ]; then
        echo "   Bundle ID: $BUNDLE_ID"
        if [ "$BUNDLE_ID" = "com.spectit.app" ]; then
            echo "   ✅ Bundle ID is correct (com.spectit.app)"
        else
            echo "   ⚠️  Bundle ID is '$BUNDLE_ID' (expected 'com.spectit.app')"
        fi
    fi
    
    # Check Team ID
    TEAM_ID=$(grep "DEVELOPMENT_TEAM = " "$PROJECT_FILE" | grep -v "//" | head -1 | sed 's/.*DEVELOPMENT_TEAM = \([^;]*\);.*/\1/')
    if [ -n "$TEAM_ID" ]; then
        echo "   Team ID: $TEAM_ID"
        if [ "$TEAM_ID" = "P7BPRR2MY3" ]; then
            echo "   ✅ Team ID is correct (P7BPRR2MY3)"
        else
            echo "   ⚠️  Team ID is '$TEAM_ID' (expected 'P7BPRR2MY3')"
        fi
    fi
else
    echo "❌ Project file not found: $PROJECT_FILE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CLEANUP COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Close Xcode if it's open"
echo "2. Reopen Xcode:"
echo "   open ios/SpectIT.xcworkspace"
echo ""
echo "3. In Xcode:"
echo "   - Product → Clean Build Folder (Cmd + Shift + K)"
echo "   - Verify scheme shows 'SpectIT' in top toolbar"
echo "   - Select 'Any iOS Device' as build target"
echo ""
echo "4. If you see 'Spect' anywhere:"
echo "   - Check the scheme dropdown (top left)"
echo "   - Make sure it says 'SpectIT'"
echo "   - If not, select 'SpectIT' from the dropdown"
echo ""

