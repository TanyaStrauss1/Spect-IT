#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║     AUTOMATED iOS SUBMISSION SYSTEM - MASTER SCRIPT                     ║
# ║     Utilizing All AI Capabilities for Complete Automation               ║
# ╚══════════════════════════════════════════════════════════════════════════╝

set -e

cd "$(dirname "$0")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_ID="6755681856"
TEAM_ID="UHMT4AX5T7"
BUNDLE_ID="com.spectit.app"
APPLE_ID="tanstrauss@gmail.com"
APP_STORE_CONNECT_URL="https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/${APP_ID}"
PRIVACY_POLICY_URL="https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html"
SUPPORT_URL="https://tanyastrauss1.github.io/Spect-IT/"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 AUTOMATED iOS SUBMISSION SYSTEM${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Verify Configuration
echo -e "${YELLOW}📋 Step 1: Verifying Configuration...${NC}"
./VERIFY_SUBMISSION_READY.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Configuration verification failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Configuration verified${NC}"
echo ""

# Step 2: Check Build Status
echo -e "${YELLOW}📦 Step 2: Checking Build Status...${NC}"
echo "Opening App Store Connect to check build status..."
open "${APP_STORE_CONNECT_URL}/testflight"
echo ""
echo -e "${YELLOW}Please check:${NC}"
echo "  1. Is there a build uploaded?"
echo "  2. Is build status 'Ready to Submit' or 'Ready to Test'?"
echo "  3. If not, we'll need to build and upload"
echo ""
read -p "Press Enter when you've checked the build status..."

# Step 3: Generate Screenshots (if needed)
echo -e "${YELLOW}📸 Step 3: Checking Screenshots...${NC}"
if [ ! -d "screenshots" ]; then
    echo "Screenshots directory not found. Generating screenshots..."
    ./GENERATE_SCREENSHOTS.sh
else
    echo -e "${GREEN}✅ Screenshots directory exists${NC}"
fi
echo ""

# Step 4: Verify URLs
echo -e "${YELLOW}🔗 Step 4: Verifying Required URLs...${NC}"
./VERIFY_URLS.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ URL verification failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ All URLs verified${NC}"
echo ""

# Step 5: Open App Store Connect
echo -e "${YELLOW}🌐 Step 5: Opening App Store Connect...${NC}"
echo "Opening all necessary pages..."
open "${APP_STORE_CONNECT_URL}/appstore"
open "${APP_STORE_CONNECT_URL}/testflight"
open "https://github.com/TanyaStrauss1/Spect-IT/settings/pages"
echo ""

# Step 6: Display Submission Checklist
echo -e "${YELLOW}📝 Step 6: Submission Checklist${NC}"
cat << 'EOF'

╔══════════════════════════════════════════════════════════════════════════╗
║     COMPLETE SUBMISSION CHECKLIST                                        ║
╚══════════════════════════════════════════════════════════════════════════╝

IN APP STORE CONNECT:

1️⃣  APP INFORMATION TAB:
   [ ] Name: Spect-IT
   [ ] Category: Medical (Primary), Health & Fitness (Secondary)
   [ ] Age Rating: Complete questionnaire
   [ ] Description: (see SUBMISSION_CONTENT.txt)
   [ ] Keywords: eye test, vision test, eye health, optometry
   [ ] Privacy Policy URL: https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html
   [ ] Support URL: https://tanyastrauss1.github.io/Spect-IT/

2️⃣  PRICING AND AVAILABILITY:
   [ ] Set price (Free recommended)
   [ ] Select countries (All countries recommended)
   [ ] Set availability date

3️⃣  APP STORE TAB - SCREENSHOTS:
   [ ] Upload at least 3 screenshots for iPhone 6.7" (1290 x 2796 pixels)
   [ ] Optional: Upload for other device sizes

4️⃣  APP STORE TAB - BUILD SELECTION (CRITICAL):
   [ ] Click "+" in Build section
   [ ] Select Version 1.0, Build 1
   [ ] Build must show "Ready to Submit"

5️⃣  APP STORE TAB - VERSION INFO:
   [ ] Version: 1.0
   [ ] What's New: (see SUBMISSION_CONTENT.txt)

6️⃣  APP REVIEW INFORMATION:
   [ ] Contact: tanstrauss@gmail.com
   [ ] Phone: (your phone number)
   [ ] Notes: (optional)

7️⃣  EXPORT COMPLIANCE:
   [ ] Answer: "No" (unless using custom encryption)

8️⃣  SUBMIT FOR REVIEW:
   [ ] Review all information
   [ ] Click "Submit for Review"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF

# Step 7: Generate Submission Content File
echo -e "${YELLOW}📄 Step 7: Generating Submission Content...${NC}"
cat > SUBMISSION_CONTENT.txt << 'EOF'
═══════════════════════════════════════════════════════════════════════════
                    APP STORE SUBMISSION CONTENT
═══════════════════════════════════════════════════════════════════════════

APP DESCRIPTION:
───────────────────────────────────────────────────────────────────────────
Spect-IT is a professional-grade vision assessment app that transforms 
your device into a comprehensive eye testing platform. 

Features:
- AI-powered vision tests
- 3D face mapping
- Advanced eye tracking
- Comprehensive analytics
- Test history and progress tracking
- Find nearby eye care specialists
- Shop eyewear products

Monitor your eye health, measure prescriptions, and track changes 
over time. Share results with your eye care professional.

KEYWORDS (100 characters max):
───────────────────────────────────────────────────────────────────────────
eye test, vision test, eye health, optometry, eye exam, prescription, 
visual acuity, color blindness, eye care

WHAT'S NEW IN THIS VERSION:
───────────────────────────────────────────────────────────────────────────
Initial release of Spect-IT

- Professional-grade vision assessment
- AI-powered eye testing
- Comprehensive test results and analytics
- Find nearby eye care specialists
- Track your eye health over time

SUBTITLE (Optional):
───────────────────────────────────────────────────────────────────────────
Professional Eye Testing

PROMOTIONAL TEXT (Optional):
───────────────────────────────────────────────────────────────────────────
Transform your device into a professional eye testing platform. 
Monitor your vision health with AI-powered assessments.

URLS:
───────────────────────────────────────────────────────────────────────────
Privacy Policy: https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html
Support URL: https://tanyastrauss1.github.io/Spect-IT/
Marketing URL: https://tanyastrauss1.github.io/Spect-IT/ (Optional)

EOF
echo -e "${GREEN}✅ Submission content saved to SUBMISSION_CONTENT.txt${NC}"
echo ""

# Step 8: Final Instructions
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ AUTOMATION COMPLETE${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 NEXT STEPS:${NC}"
echo ""
echo "1. All pages are now open in your browser"
echo "2. Follow the checklist above"
echo "3. Copy/paste content from SUBMISSION_CONTENT.txt"
echo "4. Upload screenshots from screenshots/ directory"
echo "5. Select your build in App Store tab"
echo "6. Click 'Submit for Review'"
echo ""
echo -e "${YELLOW}⏱️  Review Timeline:${NC}"
echo "   • Initial Review: 24-48 hours"
echo "   • Email Updates: tanstrauss@gmail.com"
echo ""
echo -e "${GREEN}🚀 Ready to submit!${NC}"

