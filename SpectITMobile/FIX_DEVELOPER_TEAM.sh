#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║     FIX: "SpectIT does not have an associated developer team"            ║
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
echo -e "${RED}🔧 FIXING DEVELOPER TEAM ASSOCIATION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

TEAM_ID="UHMT4AX5T7"
PROJECT_FILE="ios/SpectIT.xcodeproj/project.pbxproj"

echo -e "${YELLOW}📋 Step 1: Verifying team ID in project file...${NC}"

# Check if team ID exists
if grep -q "DEVELOPMENT_TEAM = $TEAM_ID" "$PROJECT_FILE"; then
    echo -e "${GREEN}✅ Team ID found in project file: $TEAM_ID${NC}"
else
    echo -e "${RED}❌ Team ID not found - this is the problem!${NC}"
    exit 1
fi

# Count occurrences
TEAM_COUNT=$(grep -c "DEVELOPMENT_TEAM = $TEAM_ID" "$PROJECT_FILE" || echo "0")
echo -e "${GREEN}✅ Found $TEAM_COUNT team ID references${NC}"

echo ""
echo -e "${YELLOW}📋 Step 2: Checking project-level team setting...${NC}"

# Check if project-level team is set (not just target-level)
if grep -q "DEVELOPMENT_TEAM = $TEAM_ID" "$PROJECT_FILE" | grep -q "83CBBA"; then
    echo -e "${GREEN}✅ Project-level team is set${NC}"
else
    echo -e "${YELLOW}⚠️  Project-level team may need to be set in Xcode${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Step 3: Opening Xcode to configure team...${NC}"
echo ""
echo "Xcode will open. Follow these steps:"
echo ""
echo "1. Wait for Xcode to finish indexing (2-5 minutes)"
echo ""
echo "2. Click the project name (blue icon) in left sidebar"
echo "   → Should show 'SpectIT' project"
echo ""
echo "3. In the main editor area, click 'PROJECT' (not TARGETS)"
echo "   → Select 'SpectIT' under PROJECT"
echo ""
echo "4. Go to 'Signing & Capabilities' tab"
echo ""
echo "5. Set Team for PROJECT:"
echo "   → Team dropdown → Select 'Tanya Strauss (UHMT4AX5T7)'"
echo "   → Or: 'tanstrauss@gmail.com'"
echo ""
echo "6. Then select 'TARGETS' → 'SpectIT'"
echo ""
echo "7. Go to 'Signing & Capabilities' tab"
echo ""
echo "8. Enable Automatic Signing:"
echo "   → ✅ CHECK 'Automatically manage signing'"
echo "   → Team: Select 'Tanya Strauss (UHMT4AX5T7)'"
echo "   → Bundle Identifier: com.spectit.app"
echo ""
echo "9. If team not listed:"
echo "   → Click 'Add Account...'"
echo "   → Apple ID: tanstrauss@gmail.com"
echo "   → Password: (your password)"
echo ""
echo "10. Wait for green checkmark ✅"
echo ""
echo "11. If errors appear, click 'Try Again'"
echo ""

read -p "Press Enter to open Xcode..."

# Open Xcode
open ios/SpectIT.xcworkspace

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ XCODE OPENING${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Follow the steps above in Xcode to set the developer team."
echo ""
echo "After setting the team:"
echo "  • No red errors should appear"
echo "  • Green checkmark should show"
echo "  • Team should be listed"
echo ""

