#!/bin/bash

# Create Apple Distribution Certificate
# This script guides you through creating a distribution certificate

set -e

cd "$(dirname "$0")"

echo "🎫 Creating Apple Distribution Certificate"
echo "=========================================="
echo ""

# Step 1: Check if certificate already exists
echo "1️⃣  Checking for existing certificates..."
EXISTING_CERT=$(security find-identity -v -p codesigning 2>&1 | grep -i "distribution" | head -1 || echo "")
if [ -n "$EXISTING_CERT" ]; then
    echo "   ✅ Found existing distribution certificate:"
    echo "      $EXISTING_CERT"
    echo ""
    echo "   💡 If this certificate is valid, you can use it!"
    echo "   💡 If expired, create a new one (see guide)"
    echo ""
else
    echo "   ⚠️  No distribution certificate found"
    echo "   → Need to create one"
fi
echo ""

# Step 2: Instructions
echo "2️⃣  How to Create Certificate:"
echo ""
echo "   Option A: Let EAS Create It (Easiest)"
echo "   → https://expo.dev/accounts/spect-it/settings/credentials"
echo "   → iOS → Set up credentials"
echo "   → EAS creates certificate automatically"
echo ""
echo "   Option B: Let Xcode Create It"
echo "   → Open: ios/SpectIT.xcworkspace"
echo "   → Signing & Capabilities → Automatically manage signing"
echo "   → Xcode creates certificate automatically"
echo ""
echo "   Option C: Create Manually"
echo "   → See: GET_APPLE_DISTRIBUTION_CERTIFICATE.md"
echo "   → Follow step-by-step guide"
echo ""

# Step 3: Quick link
echo "3️⃣  Quick Links:"
echo ""
echo "   📋 Apple Developer Certificates:"
echo "      → https://developer.apple.com/account/resources/certificates/list"
echo ""
echo "   🔐 EAS Credentials (Auto-create):"
echo "      → https://expo.dev/accounts/spect-it/settings/credentials"
echo ""
echo "   📖 Full Guide:"
echo "      → GET_APPLE_DISTRIBUTION_CERTIFICATE.md"
echo ""

echo "================================"
echo "✅ Certificate Setup Guide Complete"
echo ""
echo "💡 Recommended: Use EAS to create certificate automatically!"
echo "   → https://expo.dev/accounts/spect-it/settings/credentials"
echo ""

