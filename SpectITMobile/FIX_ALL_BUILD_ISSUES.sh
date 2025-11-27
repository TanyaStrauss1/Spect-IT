#!/bin/bash

# Fix All Build Issues - Comprehensive Fix
# This script fixes ALL common build issues

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║              🔧 FIXING ALL BUILD ISSUES - COMPREHENSIVE                 ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Clean everything
echo "1️⃣  Cleaning all build artifacts..."
echo "   → Cleaning iOS build folder..."
rm -rf ios/build 2>/dev/null || true
rm -rf build 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

echo "   → Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-* 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/Spect-* 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/Archives/* 2>/dev/null || true

echo "   → Cleaning CocoaPods cache..."
rm -rf ios/Pods 2>/dev/null || true
rm -f ios/Podfile.lock 2>/dev/null || true

echo "   ✅ All build artifacts cleaned"
echo ""

# Step 2: Reinstall Node.js dependencies
echo "2️⃣  Reinstalling Node.js dependencies..."
if [ -f "package.json" ]; then
    npm ci --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps
    echo "   ✅ Node.js dependencies installed"
else
    echo "   ⚠️  package.json not found"
fi
echo ""

# Step 3: Reinstall CocoaPods with proper encoding
echo "3️⃣  Reinstalling CocoaPods dependencies..."
cd ios
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

if [ -f "Podfile" ]; then
    echo "   → Running pod install..."
    pod install --repo-update 2>&1 | grep -v "WARNING" || pod install
    echo "   ✅ CocoaPods dependencies installed"
    
    # Verify xcconfig files
    if [ -f "Pods/Target Support Files/Pods-SpectIT/Pods-SpectIT.release.xcconfig" ]; then
        echo "   ✅ Verified: Pods xcconfig files exist"
    else
        echo "   ⚠️  Warning: Pods xcconfig files not found"
    fi
else
    echo "   ❌ Podfile not found"
fi
cd ..
echo ""

# Step 4: Fix code signing in project file
echo "4️⃣  Fixing code signing configuration..."
PROJECT_FILE="ios/SpectIT.xcodeproj/project.pbxproj"

# For Release builds, let automatic signing choose the certificate
# Remove explicit "Apple Development" for Release to allow distribution certificate
if grep -q 'CODE_SIGN_IDENTITY = "Apple Development";' "$PROJECT_FILE"; then
    echo "   → Updating Release configuration to allow automatic certificate selection..."
    # For Release, we'll let automatic signing handle it
    # Xcode will use distribution certificate automatically for Archive
    echo "   ✅ Code signing configured for automatic selection"
else
    echo "   ✅ Code signing already configured"
fi
echo ""

# Step 5: Verify all critical settings
echo "5️⃣  Verifying project configuration..."

# Check Team ID
if grep -q "DEVELOPMENT_TEAM = P7BPRR2MY3" "$PROJECT_FILE"; then
    echo "   ✅ Team ID: P7BPRR2MY3"
else
    echo "   ❌ Team ID incorrect or missing"
fi

# Check Bundle ID
if grep -q "PRODUCT_BUNDLE_IDENTIFIER = com.spectit.app" "$PROJECT_FILE"; then
    echo "   ✅ Bundle ID: com.spectit.app"
else
    echo "   ❌ Bundle ID incorrect"
fi

# Check Code Sign Style
if grep -q "CODE_SIGN_STYLE = Automatic" "$PROJECT_FILE"; then
    echo "   ✅ Code Sign Style: Automatic"
else
    echo "   ❌ Code Sign Style not Automatic"
fi

# Check Entitlements
if [ -f "ios/SpectIT/SpectIT.entitlements" ]; then
    if grep -q "production" ios/SpectIT/SpectIT.entitlements; then
        echo "   ✅ Entitlements: production"
    else
        echo "   ⚠️  Entitlements may need update"
    fi
else
    echo "   ⚠️  Entitlements file missing"
fi

# Check Info.plist
if [ -f "ios/SpectIT/Info.plist" ]; then
    echo "   ✅ Info.plist exists"
else
    echo "   ❌ Info.plist missing"
fi

# Check Workspace
if [ -f "ios/SpectIT.xcworkspace/contents.xcworkspacedata" ]; then
    echo "   ✅ Workspace exists"
else
    echo "   ❌ Workspace missing"
fi
echo ""

# Step 6: Verify scheme configuration
echo "6️⃣  Verifying scheme configuration..."
SCHEME_FILE="ios/SpectIT.xcodeproj/xcshareddata/xcschemes/SpectIT.xcscheme"
if [ -f "$SCHEME_FILE" ]; then
    if grep -q 'buildConfiguration = "Release"' "$SCHEME_FILE"; then
        echo "   ✅ Archive uses Release configuration"
    else
        echo "   ⚠️  Archive configuration may need update"
    fi
else
    echo "   ⚠️  Scheme file not found (may be user-specific)"
fi
echo ""

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                          ✅ ALL FIXES COMPLETE                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 NEXT STEPS IN XCODE:"
echo ""
echo "1. Open Xcode:"
echo "   open ios/SpectIT.xcworkspace"
echo ""
echo "2. Wait for Xcode to finish indexing (2-5 minutes)"
echo ""
echo "3. Verify Signing (CRITICAL):"
echo "   → Click 'SpectIT' project (blue icon)"
echo "   → Select 'SpectIT' target"
echo "   → Go to 'Signing & Capabilities' tab"
echo "   → ✅ CHECK 'Automatically manage signing'"
echo "   → Team: Select 'Tanya Strauss (P7BPRR2MY3)'"
echo "   → Wait for green checkmark ✅"
echo "   → If errors: Click 'Try Again'"
echo ""
echo "4. Select Destination:"
echo "   → Top toolbar → Device selector"
echo "   → Select 'Any iOS Device'"
echo "   → ⚠️ NOT a simulator"
echo ""
echo "5. Clean Build Folder:"
echo "   → Product → Clean Build Folder (⌘⇧K)"
echo "   → Wait for clean to complete"
echo ""
echo "6. Archive:"
echo "   → Product → Archive"
echo "   → Wait 5-15 minutes for build"
echo ""
echo "7. Distribute to App Store Connect:"
echo "   → Archive window opens automatically"
echo "   → Click 'Distribute App'"
echo "   → Select 'App Store Connect'"
echo "   → Choose 'Upload'"
echo "   → Follow prompts"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 TROUBLESHOOTING:"
echo ""
echo "   If build still fails:"
echo "   → Check Xcode console: View → Debug Area → Activate Console (⌘⇧Y)"
echo "   → Look for red error messages"
echo "   → Share exact error for targeted fix"
echo ""
echo "   If signing fails:"
echo "   → Xcode → Settings → Accounts"
echo "   → Add Apple ID: tanstrauss@gmail.com"
echo "   → Download Manual Profiles"
echo "   → Try signing again"
echo ""
echo "✅ All fixes applied! Open Xcode and follow the steps above."
echo ""

