#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║     BUILD AND UPLOAD iOS APP TO APP STORE CONNECT                        ║
# ╚══════════════════════════════════════════════════════════════════════════╝

set -e

cd "$(dirname "$0")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 BUILD AND UPLOAD iOS APP${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}📋 Choose Build Method:${NC}"
echo ""
echo "1. EAS Cloud Build (Recommended)"
echo "   ✅ Builds in cloud (no local Xcode needed)"
echo "   ✅ Automatically uploads to App Store Connect"
echo "   ✅ Handles signing automatically"
echo "   ⏱️  Takes 15-30 minutes"
echo ""
echo "2. Xcode Build (Local)"
echo "   ✅ More control over build process"
echo "   ✅ Can see build progress locally"
echo "   ⏱️  Takes 10-20 minutes"
echo ""
read -p "Enter choice (1 or 2): " BUILD_CHOICE

case $BUILD_CHOICE in
    1)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}☁️  EAS CLOUD BUILD${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}Step 1: Setting up credentials...${NC}"
        echo ""
        echo "You'll be prompted for:"
        echo "  • Apple ID: tanstrauss@gmail.com"
        echo "  • Password: (your password or app-specific password)"
        echo ""
        echo "If you have 2FA enabled, use an app-specific password:"
        echo "  https://appleid.apple.com/account/manage"
        echo "  → Security → App-Specific Passwords"
        echo ""
        read -p "Press Enter to continue with credential setup..."
        
        # Set up credentials
        eas credentials --platform ios
        
        echo ""
        echo -e "${YELLOW}Step 2: Building app...${NC}"
        echo ""
        echo "This will:"
        echo "  • Build your app in the cloud"
        echo "  • Handle code signing automatically"
        echo "  • Upload to App Store Connect when complete"
        echo ""
        echo "⏱️  This takes 15-30 minutes"
        echo ""
        read -p "Press Enter to start build..."
        
        # Build
        eas build --platform ios --profile production
        
        echo ""
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ BUILD COMPLETE${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Your build has been uploaded to App Store Connect!"
        echo ""
        echo "Next steps:"
        echo "  1. Wait 15-30 minutes for processing"
        echo "  2. Check TestFlight: https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight"
        echo "  3. Once status is 'Ready to Submit', proceed with submission"
        echo ""
        ;;
    2)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}🍎 XCODE BUILD${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Opening Xcode..."
        echo ""
        
        # Open Xcode
        open ios/SpectIT.xcworkspace
        
        echo -e "${YELLOW}📋 Follow these steps in Xcode:${NC}"
        echo ""
        echo "1. Wait for Xcode to index (2-5 minutes)"
        echo ""
        echo "2. Configure Signing:"
        echo "   • Click 'SpectIT' project (blue icon) in left sidebar"
        echo "   • Select 'SpectIT' under TARGETS"
        echo "   • Go to 'Signing & Capabilities' tab"
        echo "   • ✅ Check 'Automatically manage signing'"
        echo "   • Select Team: 'Tanya Strauss (UHMT4AX5T7)'"
        echo "   • Verify Bundle ID: com.spectit.app"
        echo ""
        echo "3. Select Device:"
        echo "   • In top toolbar, select 'Any iOS Device' (not simulator)"
        echo ""
        echo "4. Archive:"
        echo "   • Product → Archive"
        echo "   • Wait 5-15 minutes for archive"
        echo ""
        echo "5. Distribute:"
        echo "   • Organizer window opens automatically"
        echo "   • Click 'Distribute App'"
        echo "   • Select 'App Store Connect'"
        echo "   • Click 'Next'"
        echo "   • Select 'Upload'"
        echo "   • Click 'Next'"
        echo "   • Review options, click 'Next'"
        echo "   • Sign in with: tanstrauss@gmail.com"
        echo "   • Wait for upload (5-10 minutes)"
        echo ""
        echo "6. After Upload:"
        echo "   • Wait 15-30 minutes for processing"
        echo "   • Check TestFlight: https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight"
        echo ""
        echo -e "${GREEN}Xcode is opening... Follow the steps above.${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 MONITOR BUILD STATUS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Check build status at:"
echo "  • TestFlight: https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight"
echo ""
if [ "$BUILD_CHOICE" = "1" ]; then
    echo "  • EAS Builds: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
fi
echo ""
echo "Build status will change:"
echo "  ⏳ Processing → ✅ Ready to Submit"
echo ""
echo "Once 'Ready to Submit', you can:"
echo "  1. Select the build in App Store tab"
echo "  2. Complete submission form"
echo "  3. Submit for review"
echo ""

