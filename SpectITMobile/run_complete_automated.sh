#!/bin/bash

# Complete Automated Build Process
# Email: strausstanya93@gmail.com
# Password: [configured in expect script]

set -e

cd "$(dirname "$0")"

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 COMPLETE AUTOMATED BUILD PROCESS                                ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: EAS Login (requires browser)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 1: EAS LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! eas whoami &>/dev/null; then
    echo "⚠️  Not logged in to EAS"
    echo "🌐 Browser will open for authentication"
    echo "📧 Email: strausstanya93@gmail.com"
    echo ""
    echo "Please approve the login in your browser, then press Enter..."
    read
    
    eas login
    echo ""
    echo "✅ EAS login complete!"
else
    echo "✅ Already logged in to EAS:"
    eas whoami
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 STEP 2: BUILDING iOS APP (AUTOMATED)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Starting automated build with Apple ID credentials..."
echo "This may take 10-20 minutes"
echo ""

# Run the expect script for automated build
./build_with_password.exp

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ✅ PROCESS COMPLETE!                                             ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

