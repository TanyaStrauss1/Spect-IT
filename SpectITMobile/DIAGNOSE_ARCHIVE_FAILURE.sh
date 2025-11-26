#!/bin/bash

# Diagnose Archive Failure in Xcode Cloud
# Run this to check common issues

echo "🔍 Diagnosing Archive Failure"
echo "=============================="
echo ""

cd "$(dirname "$0")"

# Check 1: Verify project structure
echo "1️⃣  Checking project structure..."
if [ -f "ios/SpectIT.xcworkspace/contents.xcworkspacedata" ]; then
    echo "   ✅ Workspace exists"
else
    echo "   ❌ Workspace not found"
fi

if [ -f "ios/Podfile" ]; then
    echo "   ✅ Podfile exists"
else
    echo "   ❌ Podfile not found"
fi

# Check 2: Verify CocoaPods installation
echo ""
echo "2️⃣  Checking CocoaPods installation..."
XCCONFIG_FILE="ios/Pods/Target Support Files/Pods-SpectIT/Pods-SpectIT.release.xcconfig"
if [ -f "$XCCONFIG_FILE" ]; then
    echo "   ✅ Release xcconfig exists: $XCCONFIG_FILE"
else
    echo "   ❌ Release xcconfig missing: $XCCONFIG_FILE"
    echo "   → Run: cd ios && pod install"
fi

# Check 3: Verify project settings
echo ""
echo "3️⃣  Checking project settings..."
if grep -q "DEVELOPMENT_TEAM = P7BPRR2MY3" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Team ID: P7BPRR2MY3"
else
    echo "   ❌ Team ID not found or incorrect"
fi

if grep -q "PRODUCT_BUNDLE_IDENTIFIER = com.spectit.app" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Bundle ID: com.spectit.app"
else
    echo "   ❌ Bundle ID not found or incorrect"
fi

if grep -q "CODE_SIGN_STYLE = Automatic" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Code Signing: Automatic"
else
    echo "   ⚠️  Code Signing: Not Automatic"
fi

# Check 4: Verify scheme configuration
echo ""
echo "4️⃣  Checking scheme configuration..."
if grep -q 'buildConfiguration = "Release"' ios/SpectIT.xcodeproj/xcshareddata/xcschemes/SpectIT.xcscheme | grep -A 1 ArchiveAction; then
    echo "   ✅ Archive uses Release configuration"
else
    echo "   ❌ Archive configuration issue"
fi

# Check 5: Verify ExportOptions
echo ""
echo "5️⃣  Checking ExportOptions..."
if [ -f "ios/ExportOptions.plist" ]; then
    if grep -q "P7BPRR2MY3" ios/ExportOptions.plist; then
        echo "   ✅ ExportOptions team ID correct"
    else
        echo "   ❌ ExportOptions team ID incorrect"
    fi
    if grep -q "app-store" ios/ExportOptions.plist; then
        echo "   ✅ ExportOptions method: app-store"
    else
        echo "   ❌ ExportOptions method incorrect"
    fi
else
    echo "   ⚠️  ExportOptions.plist not found"
fi

# Check 6: Verify pre-build script
echo ""
echo "6️⃣  Checking pre-build script..."
if [ -f "ios/ci_scripts/ci_pre_xcodebuild.sh" ]; then
    if grep -q "pod install" ios/ci_scripts/ci_pre_xcodebuild.sh; then
        echo "   ✅ Pre-build script includes pod install"
    else
        echo "   ❌ Pre-build script missing pod install"
    fi
    if [ -x "ios/ci_scripts/ci_pre_xcodebuild.sh" ]; then
        echo "   ✅ Pre-build script is executable"
    else
        echo "   ⚠️  Pre-build script not executable"
        echo "   → Run: chmod +x ios/ci_scripts/ci_pre_xcodebuild.sh"
    fi
else
    echo "   ❌ Pre-build script not found"
fi

echo ""
echo "=============================="
echo "✅ Diagnosis complete"
echo ""
echo "📋 Next Steps:"
echo "1. Check build logs in App Store Connect for exact error"
echo "2. Verify signing in Xcode (if you have access)"
echo "3. Check distribution certificate in Apple Developer portal"
echo ""

