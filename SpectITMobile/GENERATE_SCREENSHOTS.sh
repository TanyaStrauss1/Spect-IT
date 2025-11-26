#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║     GENERATE SCREENSHOTS FOR APP STORE SUBMISSION                        ║
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
echo -e "${GREEN}📸 SCREENSHOT GENERATION GUIDE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create screenshots directory
mkdir -p screenshots

echo -e "${YELLOW}📋 SCREENSHOT REQUIREMENTS:${NC}"
echo ""
echo "Required Screenshots:"
echo "  • iPhone 6.7\" Display: 1290 x 2796 pixels (Minimum 3)"
echo "  • iPhone 6.5\" Display: 1242 x 2688 pixels (Optional)"
echo ""
echo "Recommended Screenshots:"
echo "  1. Home screen with hero section"
echo "  2. Tests screen showing all 6 vision tests"
echo "  3. Results screen with dashboard"
echo "  4. Specialist finder screen"
echo "  5. Shop screen with products"
echo ""

echo -e "${YELLOW}📱 METHOD 1: iOS Simulator (Recommended)${NC}"
echo ""
cat << 'EOF'
1. Start iOS Simulator:
   cd SpectITMobile
   npm start
   Press 'i' to open iOS simulator

2. Select Device:
   - iPhone 15 Pro Max (6.7" display)
   - Or iPhone 14 Pro Max

3. Navigate to each screen:
   - Home screen
   - Tests screen
   - Results screen
   - Specialists screen
   - Shop screen

4. Take Screenshots:
   - Cmd + S (or Device → Screenshot)
   - Screenshots saved to Desktop

5. Resize Screenshots:
   - Use Preview or ImageMagick
   - iPhone 6.7": 1290 x 2796 pixels
   - iPhone 6.5": 1242 x 2688 pixels

EOF

echo -e "${YELLOW}📱 METHOD 2: Physical Device${NC}"
echo ""
cat << 'EOF'
1. Run app on physical device:
   cd SpectITMobile
   npm start
   Scan QR code with Expo Go app

2. Navigate to each screen

3. Take Screenshots:
   - iPhone: Volume Up + Power button
   - Screenshots saved to Photos

4. Export and resize:
   - Export from Photos
   - Resize to required dimensions

EOF

echo -e "${YELLOW}🖼️  METHOD 3: Automated with ImageMagick (If Installed)${NC}"
echo ""
if command -v convert &> /dev/null; then
    echo -e "${GREEN}✅ ImageMagick is installed${NC}"
    echo ""
    echo "To resize existing screenshots:"
    echo "  convert input.png -resize 1290x2796! output.png"
else
    echo -e "${YELLOW}⚠️  ImageMagick not installed${NC}"
    echo ""
    echo "Install with:"
    echo "  brew install imagemagick"
fi
echo ""

echo -e "${YELLOW}📁 SCREENSHOT ORGANIZATION:${NC}"
echo ""
echo "Screenshots will be organized in:"
echo "  screenshots/"
echo "    ├── iphone-6.7/"
echo "    │   ├── 1-home.png"
echo "    │   ├── 2-tests.png"
echo "    │   ├── 3-results.png"
echo "    │   ├── 4-specialists.png"
echo "    │   └── 5-shop.png"
echo "    └── iphone-6.5/"
echo "        └── (optional)"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ SCREENSHOT GUIDE COMPLETE${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}💡 TIP:${NC}"
echo "   After taking screenshots, place them in:"
echo "   screenshots/iphone-6.7/"
echo ""
echo "   Then run the master script again to continue submission."

