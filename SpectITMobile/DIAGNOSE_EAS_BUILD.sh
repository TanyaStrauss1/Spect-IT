#!/bin/bash

# Diagnose EAS Build Failure
# Check common issues and provide fixes

set -e

cd "$(dirname "$0")"

echo "🔍 Diagnosing EAS Build Failure"
echo "================================"
echo ""

# Step 1: Check EAS login
echo "1️⃣  Checking EAS login..."
if eas whoami &> /dev/null; then
    USER=$(eas whoami 2>/dev/null | head -1)
    echo "   ✅ Logged in as: $USER"
else
    echo "   ❌ Not logged in to EAS"
    echo "   → Run: eas login"
    exit 1
fi
echo ""

# Step 2: Check recent builds
echo "2️⃣  Checking recent builds..."
echo "   Latest build status:"
eas build:list --platform ios --limit 1 2>&1 | head -10 || echo "   ⚠️  Could not fetch builds"
echo ""

# Step 3: Verify configuration
echo "3️⃣  Verifying configuration..."
if grep -q '"bundleIdentifier": "com.spectit.app"' app.json; then
    echo "   ✅ Bundle ID: com.spectit.app"
else
    echo "   ❌ Bundle ID incorrect"
fi

if grep -q '"projectId": "8479efbf-f284-4b6f-a6f5-66eceee62c92"' app.json; then
    echo "   ✅ Project ID configured"
else
    echo "   ❌ Project ID missing"
fi

if [ -f "eas.json" ]; then
    if grep -q '"distribution": "store"' eas.json; then
        echo "   ✅ Production profile: store distribution"
    else
        echo "   ⚠️  Production profile may need update"
    fi
else
    echo "   ❌ eas.json not found"
fi
echo ""

# Step 4: Check credentials
echo "4️⃣  Checking credentials..."
echo "   💡 To check/configure credentials:"
echo "      → https://expo.dev/accounts/spect-it/settings/credentials"
echo "      → Or run: eas credentials"
echo ""

# Step 5: Verify Apple Developer account
echo "5️⃣  Apple Developer account check..."
echo "   💡 Verify account is active:"
echo "      → https://developer.apple.com/account"
echo "      → Sign in with: tanstrauss@gmail.com"
echo "      → Check Developer Program status"
echo ""

echo "================================"
echo "✅ Diagnosis Complete"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Check build logs:"
echo "   → https://expo.dev/accounts/spect-it/projects/spectit-mobile/builds"
echo "   → Click on failed build → View logs"
echo ""
echo "2. Configure credentials if needed:"
echo "   → https://expo.dev/accounts/spect-it/settings/credentials"
echo "   → iOS → Set up credentials"
echo ""
echo "3. Get app-specific password (if 2FA enabled):"
echo "   → https://appleid.apple.com/account/manage"
echo "   → Security → App-Specific Passwords"
echo ""
echo "4. Try building again:"
echo "   ./BUILD_WITH_EAS_NOW.sh"
echo ""

