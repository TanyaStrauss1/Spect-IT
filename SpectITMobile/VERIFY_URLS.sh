#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║     VERIFY REQUIRED URLs ARE ACCESSIBLE                                  ║
# ╚══════════════════════════════════════════════════════════════════════════╝

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🔗 VERIFYING REQUIRED URLs${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# URLs to verify
PRIVACY_POLICY="https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html"
SUPPORT_URL="https://tanyastrauss1.github.io/Spect-IT/"

# Function to check URL
check_url() {
    local url=$1
    local name=$2
    
    echo -e "${YELLOW}Checking $name...${NC}"
    
    # Use curl to check if URL is accessible
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ $name is accessible (HTTP $HTTP_CODE)${NC}"
        return 0
    elif [ "$HTTP_CODE" = "000" ]; then
        echo -e "${RED}❌ $name is not accessible (timeout or connection error)${NC}"
        echo -e "${YELLOW}   URL: $url${NC}"
        return 1
    else
        echo -e "${RED}❌ $name returned HTTP $HTTP_CODE${NC}"
        echo -e "${YELLOW}   URL: $url${NC}"
        return 1
    fi
}

# Check Privacy Policy
if ! check_url "$PRIVACY_POLICY" "Privacy Policy"; then
    ((ERRORS++))
fi
echo ""

# Check Support URL
if ! check_url "$SUPPORT_URL" "Support URL"; then
    ((ERRORS++))
fi
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL URLs ARE ACCESSIBLE${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME URLs ARE NOT ACCESSIBLE ($ERRORS errors)${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  ACTION REQUIRED:${NC}"
    echo "   1. Ensure GitHub Pages is enabled"
    echo "   2. Verify repository is public"
    echo "   3. Check URLs are correct"
    exit 1
fi

