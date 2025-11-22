#!/bin/bash

# Continue Build After EAS Login
cd "$(dirname "$0")"

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 CONTINUING BUILD PROCESS                                     ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if logged in
if ! eas whoami &>/dev/null; then
    echo "❌ Not logged in to EAS"
    echo ""
    echo "Please run: eas login"
    echo "Then run this script again: ./CONTINUE_AFTER_LOGIN.sh"
    exit 1
fi

echo "✅ Logged in to EAS:"
eas whoami
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 STARTING AUTOMATED iOS BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

./build_with_password.exp

