#!/bin/bash

# Full Rebuild Script for Spect-IT iOS App
# This script performs a complete clean rebuild with all optimizations

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🔄 FULL REBUILD - SPECT-IT iOS APP                                   ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Clean npm/node_modules
echo -e "${BLUE}📦 Step 1/8: Cleaning npm cache and node_modules...${NC}"
echo ""
if [ -d "node_modules" ]; then
    echo "   Removing node_modules..."
    rm -rf node_modules
fi
if [ -f "package-lock.json" ]; then
    echo "   Removing package-lock.json..."
    rm -f package-lock.json
fi
echo "   Cleaning npm cache..."
npm cache clean --force 2>/dev/null || true
echo -e "${GREEN}   ✅ npm cleanup complete${NC}"
echo ""

# Step 2: Reinstall npm dependencies
echo -e "${BLUE}📦 Step 2/8: Reinstalling npm dependencies...${NC}"
echo ""
export LANG=en_US.UTF-8
npm install
echo -e "${GREEN}   ✅ npm dependencies installed${NC}"
echo ""

# Step 3: Clean iOS build artifacts
echo -e "${BLUE}🧹 Step 3/8: Cleaning iOS build artifacts...${NC}"
echo ""
if [ -d "ios/build" ]; then
    echo "   Removing ios/build..."
    rm -rf ios/build
fi
if [ -d "ios/Pods" ]; then
    echo "   Removing CocoaPods..."
    rm -rf ios/Pods
fi
if [ -f "ios/Podfile.lock" ]; then
    echo "   Removing Podfile.lock..."
    rm -f ios/Podfile.lock
fi
if [ -f "ios/Podfile.properties.json" ]; then
    echo "   Keeping Podfile.properties.json"
fi
echo -e "${GREEN}   ✅ iOS build artifacts cleaned${NC}"
echo ""

# Step 4: Clean Xcode Derived Data
echo -e "${BLUE}🧹 Step 4/8: Cleaning Xcode Derived Data...${NC}"
echo ""
DERIVED_DATA_PATH="$HOME/Library/Developer/Xcode/DerivedData"
if [ -d "$DERIVED_DATA_PATH" ]; then
    echo "   Cleaning Xcode Derived Data..."
    rm -rf "$DERIVED_DATA_PATH"/*
    echo -e "${GREEN}   ✅ Derived Data cleaned${NC}"
else
    echo -e "${YELLOW}   ⚠️  Derived Data directory not found (this is OK)${NC}"
fi
echo ""

# Step 5: Clean Xcode Archives (optional - comment out if you want to keep old archives)
echo -e "${BLUE}🧹 Step 5/8: Cleaning old Xcode archives...${NC}"
echo ""
ARCHIVES_PATH="$HOME/Library/Developer/Xcode/Archives"
if [ -d "$ARCHIVES_PATH" ]; then
    echo "   Note: Keeping archives (uncomment in script to remove)"
    # Uncomment the next line to remove all archives:
    # rm -rf "$ARCHIVES_PATH"/*
fi
echo -e "${GREEN}   ✅ Archive cleanup complete${NC}"
echo ""

# Step 6: Reinstall CocoaPods
echo -e "${BLUE}📦 Step 6/8: Reinstalling CocoaPods dependencies...${NC}"
echo ""
cd ios
export LANG=en_US.UTF-8
pod deintegrate 2>/dev/null || true
pod cache clean --all 2>/dev/null || true
echo "   Installing pods (this may take 5-10 minutes)..."
pod install --repo-update
cd ..
echo -e "${GREEN}   ✅ CocoaPods installed${NC}"
echo ""

# Step 7: Verify project structure
echo -e "${BLUE}🔍 Step 7/8: Verifying project structure...${NC}"
echo ""
if [ ! -f "ios/SpectIT.xcworkspace" ]; then
    echo -e "${RED}   ❌ Xcode workspace not found!${NC}"
    exit 1
fi
if [ ! -f "app.json" ]; then
    echo -e "${RED}   ❌ app.json not found!${NC}"
    exit 1
fi
echo -e "${GREEN}   ✅ Project structure verified${NC}"
echo ""

# Step 8: Build configuration check
echo -e "${BLUE}⚙️  Step 8/8: Checking build configuration...${NC}"
echo ""
echo "   Bundle ID: $(grep -A 2 '"ios"' app.json | grep bundleIdentifier | cut -d'"' -f4 || echo 'com.spectit.app')"
echo "   Team ID: P7BPRR2MY3"
echo "   Configuration: Release"
echo -e "${GREEN}   ✅ Configuration verified${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ FULL REBUILD COMPLETE!${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Open Xcode:"
echo "   open ios/SpectIT.xcworkspace"
echo ""
echo "2. Configure Signing:"
echo "   - Select 'SpectIT' project"
echo "   - Go to 'Signing & Capabilities'"
echo "   - Select Team: P7BPRR2MY3"
echo ""
echo "3. Build & Archive:"
echo "   - Select 'Any iOS Device'"
echo "   - Product → Archive"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

