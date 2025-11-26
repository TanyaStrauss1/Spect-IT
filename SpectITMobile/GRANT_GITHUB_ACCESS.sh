#!/bin/bash

# Grant GitHub Access to Xcode Cloud and Configure Email Notifications

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🔗 GRANTING GITHUB ACCESS TO XCODE CLOUD                            ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 CONFIGURATION:"
echo ""
echo "   Repository: TanyaStrauss1/Spect-IT"
echo "   Branch: main"
echo "   Email: tanstrauss@gmail.com"
echo "   Team ID: P7BPRR2MY3"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 STEP 1: OPEN XCODE CLOUD SETUP PAGE"
echo ""

# Open the Xcode Cloud setup page
open "https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/ci-setup/782ba1bc-eb0a-41f8-a4f1-988d4d6e6526"

echo "   ✅ Opened Xcode Cloud setup page in browser"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 STEP 2: IN APP STORE CONNECT (Browser)"
echo ""
echo "   1. Click 'Connect Repository' or 'Add Repository'"
echo "   2. Select 'GitHub' as source control provider"
echo "   3. Authorize GitHub access (sign in with GitHub)"
echo "   4. Select repository: TanyaStrauss1/Spect-IT"
echo "   5. Select branch: main"
echo "   6. Click 'Connect' or 'Save'"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📧 STEP 3: CONFIGURE EMAIL NOTIFICATIONS"
echo ""
echo "   1. In Xcode Cloud setup page, find 'Notifications' or 'Email Settings'"
echo "   2. Add email: tanstrauss@gmail.com"
echo "   3. Enable notifications for:"
echo "      ✅ Build started"
echo "      ✅ Build succeeded"
echo "      ✅ Build failed"
echo "      ✅ Build ready for testing"
echo "   4. Save settings"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 STEP 4: CREATE WORKFLOW IN XCODE"
echo ""

# Open Xcode workspace
if [ -f "ios/SpectIT.xcworkspace/contents.xcworkspacedata" ]; then
    echo "   Opening Xcode workspace..."
    open ios/SpectIT.xcworkspace
    echo "   ✅ Xcode opened"
else
    echo "   ⚠️  Workspace not found at ios/SpectIT.xcworkspace"
    echo "   → Run: cd /Users/tanyastrauss/Spect-IT/SpectITMobile"
    echo "   → Then: open ios/SpectIT.xcworkspace"
fi

echo ""
echo "   In Xcode:"
echo "   1. Product → Xcode Cloud → Create Workflow"
echo "   2. Configure:"
echo "      → Name: Build and Distribute Spect-IT"
echo "      → Repository: TanyaStrauss1/Spect-IT"
echo "      → Branch: main"
echo "      → Scheme: SpectIT"
echo "      → Configuration: Release"
echo "   3. Add Actions:"
echo "      → ✅ Archive"
echo "      → ✅ Distribute"
echo "   4. Save workflow"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ STEP 5: VERIFY CONFIGURATION"
echo ""

# Check workflow file
if [ -f "ios/.xcodecloud/workflow.yml" ]; then
    echo "   ✅ Workflow file exists: ios/.xcodecloud/workflow.yml"
    TEAM_ID=$(grep "team_id" ios/.xcodecloud/workflow.yml | cut -d: -f2 | tr -d ' ' || echo "")
    if [ -n "$TEAM_ID" ]; then
        echo "   → Team ID: $TEAM_ID"
    fi
else
    echo "   ⚠️  Workflow file not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 STEP 6: TEST THE BUILD"
echo ""
echo "   After completing steps above, push to GitHub:"
echo ""
echo "   cd /Users/tanyastrauss/Spect-IT"
echo "   git add ."
echo "   git commit -m 'Configure Xcode Cloud with GitHub access'"
echo "   git push origin main"
echo ""
echo "   → Xcode Cloud will automatically build"
echo "   → You'll receive email at tanstrauss@gmail.com"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📧 EMAIL NOTIFICATIONS:"
echo ""
echo "   You'll receive emails at tanstrauss@gmail.com for:"
echo "   • Build started"
echo "   • Build succeeded"
echo "   • Build failed"
echo "   • Build ready for TestFlight"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ SETUP COMPLETE!"
echo ""
echo "   Follow the steps in the browser and Xcode to complete setup."
echo ""

