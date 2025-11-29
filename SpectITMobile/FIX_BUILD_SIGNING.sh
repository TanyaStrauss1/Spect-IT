#!/bin/bash

# Fix Build Signing Issues

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🔧 FIXING BUILD SIGNING ISSUES                                       ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# The issue: Automatic signing is enabled, but there's a conflict
# Solution: Use Xcode GUI which handles this automatically

echo "✅ The project is configured for automatic signing"
echo ""
echo "📋 To fix the build failure:"
echo ""
echo "1. Open Xcode (if not already open):"
echo "   open ios/SpectIT.xcworkspace"
echo ""
echo "2. Configure Signing:"
echo "   - Click 'SpectIT' project (blue icon)"
echo "   - Select 'SpectIT' under TARGETS"
echo "   - Go to 'Signing & Capabilities' tab"
echo "   - ✅ Ensure 'Automatically manage signing' is CHECKED"
echo "   - Select Team: Tanya Strauss (P7BPRR2MY3)"
echo "   - Wait for green checkmark ✅"
echo ""
echo "3. For Archive builds, Xcode will automatically:"
echo "   - Use 'Apple Distribution' certificate for Release builds"
echo "   - Create App Store provisioning profile"
echo "   - Handle all signing automatically"
echo ""
echo "4. Build in Xcode:"
echo "   - Select 'Any iOS Device' (not simulator)"
echo "   - Product → Archive"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Why command line build failed:"
echo "   - Command line tried to force 'Apple Distribution'"
echo "   - But project is set to automatic signing"
echo "   - Xcode GUI handles this automatically"
echo ""
echo "✅ Solution: Use Xcode GUI for building (recommended)"
echo ""

# Open Xcode if not already open
if ! pgrep -x "Xcode" > /dev/null; then
    echo "🚀 Opening Xcode..."
    open ios/SpectIT.xcworkspace
else
    echo "✅ Xcode is already open"
fi

echo ""
echo "Follow the steps above to configure signing and build! 🚀"
echo ""

