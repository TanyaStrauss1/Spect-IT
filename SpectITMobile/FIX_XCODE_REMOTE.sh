#!/bin/bash

# Fix Xcode "no remote repository" issue

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🔧 FIXING XCODE REMOTE REPOSITORY                                ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check git repository
echo "📦 Checking git repository..."
cd ../..
REPO_ROOT=$(pwd)
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "Not found")

echo "   Repository root: $REPO_ROOT"
echo "   Remote URL: $REMOTE_URL"
echo ""

# Check if remote exists
if [ "$REMOTE_URL" != "Not found" ]; then
    echo "✅ Git remote repository exists"
    echo "   URL: $REMOTE_URL"
else
    echo "❌ No git remote found"
    echo "   Adding remote..."
    git remote add origin https://github.com/TanyaStrauss1/Spect-IT.git 2>/dev/null || echo "   (Remote may already exist)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 XCODE CONFIGURATION STEPS:"
echo ""
echo "1️⃣  Open Xcode:"
echo "   open ios/SpectIT.xcworkspace"
echo ""
echo "2️⃣  Configure Source Control:"
echo "   Xcode → Settings → Source Control"
echo "   ✅ Enable Source Control"
echo ""
echo "3️⃣  Add Repository (if needed):"
echo "   File → Source Control → Repositories..."
echo "   Add: $REPO_ROOT"
echo "   Remote: $REMOTE_URL"
echo ""
echo "4️⃣  Verify Project Name:"
echo "   - Should show 'SpectIT' (not 'Spect')"
echo "   - Check scheme dropdown (top left)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 ALTERNATIVE: Use Terminal Git (Recommended)"
echo ""
echo "   Xcode source control is optional. You can use terminal:"
echo ""
echo "   cd $REPO_ROOT"
echo "   git status"
echo "   git add ."
echo "   git commit -m 'message'"
echo "   git push origin main"
echo ""
echo "   Xcode will still build/archive without source control configured!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 Full guide: FIX_XCODE_REMOTE_REPOSITORY.md"
echo ""

