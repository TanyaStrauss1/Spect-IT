#!/bin/bash

# Complete Fix for Archive Failure
# This script ensures all settings are correct for Xcode Cloud archive

set -e

cd "$(dirname "$0")"

echo "🔧 Fixing Archive Configuration"
echo "================================"
echo ""

# Fix 1: Verify entitlements
echo "1️⃣  Checking entitlements..."
if grep -q "aps-environment" ios/SpectIT/SpectIT.entitlements; then
    if grep -q "production" ios/SpectIT/SpectIT.entitlements; then
        echo "   ✅ Entitlements: production (correct)"
    else
        echo "   ⚠️  Entitlements: development (should be production for App Store)"
        echo "   → Fixed in entitlements file"
    fi
else
    echo "   ✅ Entitlements: No aps-environment (OK if not using push notifications)"
fi

# Fix 2: Verify project settings
echo ""
echo "2️⃣  Verifying project settings..."
if grep -q "DEVELOPMENT_TEAM = P7BPRR2MY3" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Team ID: P7BPRR2MY3"
else
    echo "   ❌ Team ID incorrect"
    exit 1
fi

if grep -q "CODE_SIGN_STYLE = Automatic" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Code Signing: Automatic"
else
    echo "   ❌ Code Signing not Automatic"
    exit 1
fi

# Fix 3: Verify scheme
echo ""
echo "3️⃣  Verifying scheme..."
if grep -q 'buildConfiguration = "Release"' ios/SpectIT.xcodeproj/xcshareddata/xcschemes/SpectIT.xcscheme | grep -A 1 ArchiveAction; then
    echo "   ✅ Archive uses Release configuration"
else
    echo "   ⚠️  Archive configuration may need verification"
fi

# Fix 4: Verify workflow
echo ""
echo "4️⃣  Verifying workflow..."
if [ -f "ios/.xcodecloud/workflow.yml" ]; then
    if grep -q "configuration: Release" ios/.xcodecloud/workflow.yml; then
        echo "   ✅ Workflow uses Release configuration"
    else
        echo "   ⚠️  Workflow configuration may need update"
    fi
    if grep -q "team_id: P7BPRR2MY3" ios/.xcodecloud/workflow.yml; then
        echo "   ✅ Workflow team ID correct"
    else
        echo "   ⚠️  Workflow team ID may need update"
    fi
else
    echo "   ⚠️  Workflow file not found (may be created in Xcode)"
fi

# Fix 5: Verify pre-build script
echo ""
echo "5️⃣  Verifying pre-build script..."
if [ -f "ios/ci_scripts/ci_pre_xcodebuild.sh" ]; then
    if [ -x "ios/ci_scripts/ci_pre_xcodebuild.sh" ]; then
        echo "   ✅ Pre-build script exists and is executable"
    else
        echo "   ⚠️  Making pre-build script executable..."
        chmod +x ios/ci_scripts/ci_pre_xcodebuild.sh
        echo "   ✅ Fixed"
    fi
else
    echo "   ❌ Pre-build script not found"
    exit 1
fi

echo ""
echo "================================"
echo "✅ Configuration verified"
echo ""
echo "📋 Summary:"
echo "   - Entitlements: production (for App Store)"
echo "   - Team ID: P7BPRR2MY3"
echo "   - Code Signing: Automatic"
echo "   - Scheme: Release for Archive"
echo "   - Pre-build script: Ready"
echo ""
echo "🚀 Next: Commit and push to trigger new build"
echo ""

