#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║     VERIFY SUBMISSION READINESS - COMPREHENSIVE CHECK                    ║
# ╚══════════════════════════════════════════════════════════════════════════╝

set -e

cd "$(dirname "$0")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🔍 VERIFYING SUBMISSION READINESS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check 1: app.json
echo -e "${YELLOW}📱 Checking app.json...${NC}"
if [ ! -f "app.json" ]; then
    echo -e "${RED}❌ app.json not found${NC}"
    ((ERRORS++))
else
    # Check bundle ID
    if grep -q '"bundleIdentifier": "com.spectit.app"' app.json; then
        echo -e "${GREEN}✅ Bundle ID correct${NC}"
    else
        echo -e "${RED}❌ Bundle ID incorrect${NC}"
        ((ERRORS++))
    fi
    
    # Check version
    if grep -q '"version": "1.0.0"' app.json; then
        echo -e "${GREEN}✅ Version correct${NC}"
    else
        echo -e "${YELLOW}⚠️  Version may need update${NC}"
        ((WARNINGS++))
    fi
    
    # Check build number
    if grep -q '"buildNumber": "1"' app.json; then
        echo -e "${GREEN}✅ Build number set${NC}"
    else
        echo -e "${YELLOW}⚠️  Build number may need update${NC}"
        ((WARNINGS++))
    fi
fi
echo ""

# Check 2: iOS Configuration
echo -e "${YELLOW}🍎 Checking iOS Configuration...${NC}"
if [ -d "ios" ]; then
    echo -e "${GREEN}✅ iOS directory exists${NC}"
    
    # Check ExportOptions.plist
    if [ -f "ios/ExportOptions.plist" ]; then
        if grep -q "UHMT4AX5T7" ios/ExportOptions.plist; then
            echo -e "${GREEN}✅ Team ID correct in ExportOptions.plist${NC}"
        else
            echo -e "${RED}❌ Team ID incorrect in ExportOptions.plist${NC}"
            ((ERRORS++))
        fi
    else
        echo -e "${YELLOW}⚠️  ExportOptions.plist not found${NC}"
        ((WARNINGS++))
    fi
    
    # Check Xcode project
    if [ -f "ios/SpectIT.xcodeproj/project.pbxproj" ]; then
        if grep -q "UHMT4AX5T7" ios/SpectIT.xcodeproj/project.pbxproj; then
            echo -e "${GREEN}✅ Team ID correct in Xcode project${NC}"
        else
            echo -e "${RED}❌ Team ID incorrect in Xcode project${NC}"
            ((ERRORS++))
        fi
    else
        echo -e "${YELLOW}⚠️  Xcode project not found${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌ iOS directory not found${NC}"
    ((ERRORS++))
fi
echo ""

# Check 3: Assets
echo -e "${YELLOW}🖼️  Checking Assets...${NC}"
if [ -f "assets/icon.png" ]; then
    echo -e "${GREEN}✅ App icon exists${NC}"
else
    echo -e "${RED}❌ App icon missing${NC}"
    ((ERRORS++))
fi

if [ -f "assets/splash.png" ]; then
    echo -e "${GREEN}✅ Splash screen exists${NC}"
else
    echo -e "${YELLOW}⚠️  Splash screen missing${NC}"
    ((WARNINGS++))
fi
echo ""

# Check 4: Package.json
echo -e "${YELLOW}📦 Checking package.json...${NC}"
if [ -f "package.json" ]; then
    if grep -q '"expo": "~50.0.0"' package.json; then
        echo -e "${GREEN}✅ Expo SDK version correct${NC}"
    else
        echo -e "${YELLOW}⚠️  Expo SDK version may need update${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌ package.json not found${NC}"
    ((ERRORS++))
fi
echo ""

# Check 5: Required Files
echo -e "${YELLOW}📄 Checking Required Files...${NC}"
REQUIRED_FILES=(
    "App.js"
    "src/navigation/AppNavigator.js"
    "src/screens/HomeScreen.js"
    "src/screens/TestsScreen.js"
    "src/screens/ResultsScreen.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
        ((ERRORS++))
    fi
done
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED - READY FOR SUBMISSION${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  READY WITH WARNINGS ($WARNINGS warnings)${NC}"
    exit 0
else
    echo -e "${RED}❌ NOT READY - $ERRORS errors, $WARNINGS warnings${NC}"
    exit 1
fi

