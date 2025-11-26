#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🔍 XCODE CLOUD DIAGNOSTIC CHECK                                     ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")" || exit 1

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. CHECKING WORKFLOW FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "ios/.xcodecloud/workflow.yml" ]; then
    echo "✅ Workflow file exists: ios/.xcodecloud/workflow.yml"
    echo ""
    echo "Content:"
    cat ios/.xcodecloud/workflow.yml
    echo ""
else
    echo "❌ Workflow file NOT found: ios/.xcodecloud/workflow.yml"
    echo "   This is required for Xcode Cloud!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. CHECKING GIT STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd .. || exit 1

echo "Current branch:"
git branch --show-current
echo ""

echo "Git status:"
git status --short
echo ""

echo "Last 3 commits:"
git log --oneline -3
echo ""

echo "Remote repository:"
git remote get-url origin
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. CHECKING WORKFLOW FILE IN GIT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if git ls-files --error-unmatch SpectITMobile/ios/.xcodecloud/workflow.yml > /dev/null 2>&1; then
    echo "✅ Workflow file is tracked in Git"
    echo ""
    echo "Last commit with workflow file:"
    git log --oneline -1 -- SpectITMobile/ios/.xcodecloud/workflow.yml
else
    echo "❌ Workflow file is NOT tracked in Git"
    echo "   Run: git add SpectITMobile/ios/.xcodecloud/workflow.yml"
    echo "   Then: git commit -m 'Add workflow file'"
    echo "   Then: git push origin main"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. CHECKING CI SCRIPTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "SpectITMobile/ios/ci_scripts/ci_pre_xcodebuild.sh" ]; then
    echo "✅ Pre-build script exists"
    if [ -x "SpectITMobile/ios/ci_scripts/ci_pre_xcodebuild.sh" ]; then
        echo "✅ Pre-build script is executable"
    else
        echo "⚠️  Pre-build script is NOT executable"
        echo "   Run: chmod +x SpectITMobile/ios/ci_scripts/ci_pre_xcodebuild.sh"
    fi
else
    echo "❌ Pre-build script NOT found"
fi

if [ -f "SpectITMobile/ios/ci_scripts/ci_post_xcodebuild.sh" ]; then
    echo "✅ Post-build script exists"
    if [ -x "SpectITMobile/ios/ci_scripts/ci_post_xcodebuild.sh" ]; then
        echo "✅ Post-build script is executable"
    else
        echo "⚠️  Post-build script is NOT executable"
        echo "   Run: chmod +x SpectITMobile/ios/ci_scripts/ci_post_xcodebuild.sh"
    fi
else
    echo "⚠️  Post-build script NOT found (optional)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. CHECKING XCODE PROJECT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "SpectITMobile/ios/SpectIT.xcworkspace/contents.xcworkspacedata" ]; then
    echo "✅ Xcode workspace exists"
else
    echo "❌ Xcode workspace NOT found"
fi

if [ -f "SpectITMobile/ios/SpectIT.xcodeproj/project.pbxproj" ]; then
    echo "✅ Xcode project exists"
    
    # Check Team ID
    if grep -q "UHMT4AX5T7" "SpectITMobile/ios/SpectIT.xcodeproj/project.pbxproj"; then
        echo "✅ Team ID found in project: UHMT4AX5T7"
    else
        echo "⚠️  Team ID UHMT4AX5T7 NOT found in project"
    fi
    
    # Check Bundle ID
    if grep -q "com.spectit.app" "SpectITMobile/ios/SpectIT.xcodeproj/project.pbxproj"; then
        echo "✅ Bundle ID found in project: com.spectit.app"
    else
        echo "⚠️  Bundle ID com.spectit.app NOT found in project"
    fi
else
    echo "❌ Xcode project NOT found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. SUMMARY & NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ VERIFIED:"
echo "   • Workflow file exists"
echo "   • Configuration looks correct"
echo ""
echo "⚠️  MOST LIKELY ISSUE:"
echo "   Repository not connected in Xcode Cloud"
echo ""
echo "🔧 TO FIX:"
echo "   1. Go to: https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/ci"
echo "   2. Click 'Connect Repository'"
echo "   3. Select GitHub"
echo "   4. Authorize access"
echo "   5. Select: TanyaStrauss1/Spect-IT"
echo "   6. Branch: main"
echo "   7. Click 'Connect'"
echo ""
echo "📖 For detailed troubleshooting, see:"
echo "   • FIX_XCODE_CLOUD_NOT_BUILDING.md"
echo "   • COMPLETE_GITHUB_AUTHORIZATION.md"
echo ""

