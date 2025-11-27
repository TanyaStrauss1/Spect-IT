#!/bin/bash

# Complete Build Fix - Ensure Everything is Ready
# This script verifies and fixes all configuration for Xcode Cloud builds

set -e

cd "$(dirname "$0")"

echo "🔧 Complete Build Fix"
echo "====================="
echo ""

# Step 1: Verify project structure
echo "1️⃣  Verifying project structure..."
if [ ! -f "package.json" ]; then
    echo "   ❌ package.json not found"
    exit 1
fi
echo "   ✅ package.json exists"

if [ ! -f "ios/SpectIT.xcworkspace/contents.xcworkspacedata" ]; then
    echo "   ❌ Workspace not found"
    exit 1
fi
echo "   ✅ Workspace exists"

if [ ! -f "ios/Podfile" ]; then
    echo "   ❌ Podfile not found"
    exit 1
fi
echo "   ✅ Podfile exists"
echo ""

# Step 2: Verify project settings
echo "2️⃣  Verifying project settings..."
TEAM_COUNT=$(grep -c "DEVELOPMENT_TEAM = P7BPRR2MY3" ios/SpectIT.xcodeproj/project.pbxproj || echo "0")
if [ "$TEAM_COUNT" -gt 0 ]; then
    echo "   ✅ Team ID: P7BPRR2MY3 (found $TEAM_COUNT times)"
else
    echo "   ❌ Team ID not found or incorrect"
    exit 1
fi

BUNDLE_COUNT=$(grep -c "PRODUCT_BUNDLE_IDENTIFIER = com.spectit.app" ios/SpectIT.xcodeproj/project.pbxproj || echo "0")
if [ "$BUNDLE_COUNT" -gt 0 ]; then
    echo "   ✅ Bundle ID: com.spectit.app (found $BUNDLE_COUNT times)"
else
    echo "   ❌ Bundle ID not found or incorrect"
    exit 1
fi

SIGNING_COUNT=$(grep -c "CODE_SIGN_STYLE = Automatic" ios/SpectIT.xcodeproj/project.pbxproj || echo "0")
if [ "$SIGNING_COUNT" -gt 0 ]; then
    echo "   ✅ Code Signing: Automatic (found $SIGNING_COUNT times)"
else
    echo "   ❌ Code Signing not Automatic"
    exit 1
fi
echo ""

# Step 3: Verify entitlements
echo "3️⃣  Verifying entitlements..."
if [ -f "ios/SpectIT/SpectIT.entitlements" ]; then
    if grep -q "production" ios/SpectIT/SpectIT.entitlements; then
        echo "   ✅ Entitlements: production"
    else
        echo "   ⚠️  Entitlements may need update"
    fi
else
    echo "   ⚠️  Entitlements file not found"
fi
echo ""

# Step 4: Verify scheme
echo "4️⃣  Verifying scheme..."
if [ -f "ios/SpectIT.xcodeproj/xcshareddata/xcschemes/SpectIT.xcscheme" ]; then
    if grep -q 'buildConfiguration = "Release"' ios/SpectIT.xcodeproj/xcshareddata/xcschemes/SpectIT.xcscheme | grep -A 1 ArchiveAction; then
        echo "   ✅ Archive uses Release configuration"
    else
        echo "   ⚠️  Archive configuration may need verification"
    fi
else
    echo "   ⚠️  Scheme file not found"
fi
echo ""

# Step 5: Verify workflow file
echo "5️⃣  Verifying workflow file..."
if [ -f "ios/.xcodecloud/workflow.yml" ]; then
    if grep -q "team_id: P7BPRR2MY3" ios/.xcodecloud/workflow.yml; then
        echo "   ✅ Workflow team ID correct"
    else
        echo "   ⚠️  Workflow team ID may need update"
    fi
    if grep -q "bundle_id: com.spectit.app" ios/.xcodecloud/workflow.yml; then
        echo "   ✅ Workflow bundle ID correct"
    else
        echo "   ⚠️  Workflow bundle ID may need update"
    fi
    if grep -q "scheme: SpectIT" ios/.xcodecloud/workflow.yml; then
        echo "   ✅ Workflow scheme correct"
    else
        echo "   ⚠️  Workflow scheme may need update"
    fi
else
    echo "   ⚠️  Workflow file not found (may be created in Xcode)"
fi
echo ""

# Step 6: Verify pre-build script
echo "6️⃣  Verifying pre-build script..."
if [ -f "ios/ci_scripts/ci_pre_xcodebuild.sh" ]; then
    if [ -x "ios/ci_scripts/ci_pre_xcodebuild.sh" ]; then
        echo "   ✅ Pre-build script exists and is executable"
    else
        echo "   ⚠️  Making pre-build script executable..."
        chmod +x ios/ci_scripts/ci_pre_xcodebuild.sh
        echo "   ✅ Fixed"
    fi
    if grep -q "pod install" ios/ci_scripts/ci_pre_xcodebuild.sh; then
        echo "   ✅ Pre-build script includes pod install"
    else
        echo "   ❌ Pre-build script missing pod install"
        exit 1
    fi
else
    echo "   ❌ Pre-build script not found"
    exit 1
fi
echo ""

# Step 7: Verify ExportOptions
echo "7️⃣  Verifying ExportOptions..."
if [ -f "ios/ExportOptions.plist" ]; then
    if grep -q "P7BPRR2MY3" ios/ExportOptions.plist; then
        echo "   ✅ ExportOptions team ID correct"
    else
        echo "   ⚠️  ExportOptions team ID may need update"
    fi
    if grep -q "app-store" ios/ExportOptions.plist; then
        echo "   ✅ ExportOptions method: app-store"
    else
        echo "   ⚠️  ExportOptions method may need update"
    fi
else
    echo "   ⚠️  ExportOptions.plist not found"
fi
echo ""

# Step 8: Check local CocoaPods (for reference)
echo "8️⃣  Checking local CocoaPods..."
if [ -f "ios/Pods/Target Support Files/Pods-SpectIT/Pods-SpectIT.release.xcconfig" ]; then
    echo "   ✅ Local xcconfig files exist (for reference)"
else
    echo "   ⚠️  Local xcconfig files not found (will be created by pre-build script)"
fi
echo ""

echo "================================"
echo "✅ Configuration Verification Complete"
echo ""
echo "📋 Summary:"
echo "   - Project structure: ✅"
echo "   - Team ID: P7BPRR2MY3 ✅"
echo "   - Bundle ID: com.spectit.app ✅"
echo "   - Code Signing: Automatic ✅"
echo "   - Pre-build script: Ready ✅"
echo ""
echo "🚀 Ready for Xcode Cloud Build!"
echo ""
echo "📝 Next Steps:"
echo "   1. Ensure workflow is created in Xcode or App Store Connect"
echo "   2. Monitor build in App Store Connect"
echo "   3. Check build logs if build fails"
echo ""

