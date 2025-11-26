#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║     BUILD iOS APP FROM TERMINAL                                          ║
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
echo -e "${GREEN}🚀 BUILD iOS APP FROM TERMINAL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${RED}❌ EAS CLI not found${NC}"
    echo ""
    echo "Installing EAS CLI..."
    npm install -g eas-cli
    echo -e "${GREEN}✅ EAS CLI installed${NC}"
    echo ""
fi

# Check if logged in to EAS
echo -e "${YELLOW}📋 Checking EAS login status...${NC}"
if eas whoami &> /dev/null; then
    EAS_USER=$(eas whoami)
    echo -e "${GREEN}✅ Logged in as: $EAS_USER${NC}"
else
    echo -e "${YELLOW}⚠️  Not logged in to EAS${NC}"
    echo ""
    echo "Logging in to EAS..."
    eas login
fi
echo ""

# Verify configuration
echo -e "${YELLOW}📋 Verifying configuration...${NC}"

# Check app.json
if [ -f "app.json" ]; then
    BUNDLE_ID=$(grep -o '"bundleIdentifier": "[^"]*"' app.json | cut -d'"' -f4)
    VERSION=$(grep -o '"version": "[^"]*"' app.json | cut -d'"' -f4)
    BUILD_NUMBER=$(grep -o '"buildNumber": "[^"]*"' app.json | cut -d'"' -f4)
    
    echo -e "${GREEN}✅ Bundle ID: $BUNDLE_ID${NC}"
    echo -e "${GREEN}✅ Version: $VERSION${NC}"
    echo -e "${GREEN}✅ Build Number: $BUILD_NUMBER${NC}"
else
    echo -e "${RED}❌ app.json not found${NC}"
    exit 1
fi

# Check team ID
if grep -q "UHMT4AX5T7" ios/SpectIT.xcodeproj/project.pbxproj 2>/dev/null; then
    echo -e "${GREEN}✅ Team ID: UHMT4AX5T7${NC}"
else
    echo -e "${YELLOW}⚠️  Team ID may need verification${NC}"
fi

echo ""

# Choose build method
echo -e "${YELLOW}📋 Choose Build Method:${NC}"
echo ""
echo "1. EAS Cloud Build (Recommended)"
echo "   ✅ Builds in cloud"
echo "   ✅ Automatic upload to App Store Connect"
echo "   ✅ Handles signing automatically"
echo "   ⏱️  15-30 minutes"
echo ""
echo "2. Xcode Command Line Build"
echo "   ✅ Local build"
echo "   ✅ Uses xcodebuild"
echo "   ⏱️  10-20 minutes"
echo ""
read -p "Enter choice (1 or 2): " BUILD_CHOICE

case $BUILD_CHOICE in
    1)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}☁️  EAS CLOUD BUILD${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        
        # Set up credentials if needed
        echo -e "${YELLOW}📋 Setting up credentials...${NC}"
        echo ""
        echo "You'll be prompted for:"
        echo "  • Apple ID: tanstrauss@gmail.com"
        echo "  • Password: (your password or app-specific password)"
        echo ""
        echo "If you have 2FA enabled, use an app-specific password:"
        echo "  https://appleid.apple.com/account/manage"
        echo ""
        read -p "Press Enter to continue..."
        
        # Set up credentials
        eas credentials --platform ios
        
        echo ""
        echo -e "${YELLOW}📦 Starting build...${NC}"
        echo ""
        echo "This will:"
        echo "  • Build your app in the cloud"
        echo "  • Handle code signing automatically"
        echo "  • Upload to App Store Connect when complete"
        echo ""
        echo "⏱️  This takes 15-30 minutes"
        echo ""
        
        # Build
        eas build --platform ios --profile production
        
        echo ""
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ BUILD COMPLETE${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Your build has been uploaded to App Store Connect!"
        echo ""
        echo "Monitor progress:"
        echo "  https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
        echo ""
        echo "Check TestFlight:"
        echo "  https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight"
        echo ""
        ;;
    2)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}🍎 XCODE COMMAND LINE BUILD${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        
        # Check if Xcode is installed
        if ! command -v xcodebuild &> /dev/null; then
            echo -e "${RED}❌ xcodebuild not found${NC}"
            echo "Please install Xcode from the App Store"
            exit 1
        fi
        
        echo -e "${GREEN}✅ xcodebuild found${NC}"
        echo ""
        
        # Check workspace exists
        if [ ! -f "ios/SpectIT.xcworkspace/contents.xcworkspacedata" ]; then
            echo -e "${YELLOW}⚠️  Workspace not found, generating...${NC}"
            cd ios
            pod install
            cd ..
        fi
        
        echo -e "${YELLOW}📦 Step 1: Cleaning build folder...${NC}"
        xcodebuild clean -workspace ios/SpectIT.xcworkspace -scheme SpectIT -configuration Release
        
        echo ""
        echo -e "${YELLOW}📦 Step 2: Building archive...${NC}"
        echo "This will take 10-20 minutes..."
        echo ""
        
        # Create archive
        ARCHIVE_PATH="./build/SpectIT.xcarchive"
        mkdir -p build
        
        xcodebuild archive \
            -workspace ios/SpectIT.xcworkspace \
            -scheme SpectIT \
            -configuration Release \
            -archivePath "$ARCHIVE_PATH" \
            -destination "generic/platform=iOS" \
            CODE_SIGN_IDENTITY="Apple Distribution" \
            DEVELOPMENT_TEAM="UHMT4AX5T7" \
            PROVISIONING_PROFILE_SPECIFIER="" \
            | xcpretty || true
        
        if [ ! -d "$ARCHIVE_PATH" ]; then
            echo -e "${RED}❌ Archive failed${NC}"
            echo "Check the output above for errors"
            exit 1
        fi
        
        echo ""
        echo -e "${GREEN}✅ Archive created successfully${NC}"
        echo ""
        echo -e "${YELLOW}📦 Step 3: Exporting IPA...${NC}"
        
        # Export IPA
        EXPORT_PATH="./build/export"
        mkdir -p "$EXPORT_PATH"
        
        xcodebuild -exportArchive \
            -archivePath "$ARCHIVE_PATH" \
            -exportPath "$EXPORT_PATH" \
            -exportOptionsPlist ios/ExportOptions.plist \
            | xcpretty || true
        
        IPA_FILE="$EXPORT_PATH/SpectIT.ipa"
        if [ ! -f "$IPA_FILE" ]; then
            echo -e "${RED}❌ IPA export failed${NC}"
            echo "Check the output above for errors"
            exit 1
        fi
        
        echo ""
        echo -e "${GREEN}✅ IPA exported successfully${NC}"
        echo ""
        echo -e "${YELLOW}📦 Step 4: Uploading to App Store Connect...${NC}"
        echo ""
        echo "You'll be prompted for:"
        echo "  • Apple ID: tanstrauss@gmail.com"
        echo "  • Password: (your password or app-specific password)"
        echo ""
        read -p "Press Enter to continue with upload..."
        
        # Upload using altool or transporter
        if command -v xcrun altool &> /dev/null; then
            xcrun altool --upload-app \
                --type ios \
                --file "$IPA_FILE" \
                --username "tanstrauss@gmail.com" \
                --password "@keychain:Application Loader: tanstrauss@gmail.com" || \
            xcrun altool --upload-app \
                --type ios \
                --file "$IPA_FILE" \
                --username "tanstrauss@gmail.com" \
                --password "$(read -sp 'Password: ' pwd; echo $pwd)"
        elif command -v xcrun altool &> /dev/null; then
            # Try with Transporter
            xcrun altool --upload-app \
                --type ios \
                --file "$IPA_FILE" \
                --username "tanstrauss@gmail.com" \
                --password "$(read -sp 'Password: ' pwd; echo $pwd)"
        else
            echo -e "${YELLOW}⚠️  Upload tool not found${NC}"
            echo ""
            echo "IPA file created at: $IPA_FILE"
            echo ""
            echo "Upload manually:"
            echo "  1. Open Xcode"
            echo "  2. Window → Organizer"
            echo "  3. Import archive: $ARCHIVE_PATH"
            echo "  4. Distribute App → App Store Connect"
            echo ""
            echo "Or use Transporter app:"
            echo "  https://apps.apple.com/app/transporter/id1450874784"
        fi
        
        echo ""
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ BUILD AND UPLOAD COMPLETE${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Check TestFlight:"
        echo "  https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight"
        echo ""
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 NEXT STEPS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Wait for build to process (15-30 minutes)"
echo ""
echo "2. Check status at:"
echo "   https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight"
echo ""
echo "3. Once status is 'Ready to Submit':"
echo "   • Go to App Store tab"
echo "   • Select the build"
echo "   • Complete submission form"
echo "   • Submit for review"
echo ""

