#!/bin/bash

# Script to create GitHub repository and push Spect-IT code

cd /Users/tanyastrauss/Spect-IT

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 CREATING GITHUB REPOSITORY FOR SPECT-IT                      ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found"
    echo ""
    echo "Creating private repository 'Spect-IT' on GitHub..."
    echo ""
    
    gh repo create Spect-IT \
        --private \
        --description "Premium eye testing app with advanced AI-powered vision analysis" \
        --source=. \
        --remote=origin \
        --push
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "╔══════════════════════════════════════════════════════════════════════════╗"
        echo "║          ✅ REPOSITORY CREATED AND PUSHED!                                ║"
        echo "╚══════════════════════════════════════════════════════════════════════════╝"
        echo ""
        echo "📦 Repository URL:"
        gh repo view --web 2>/dev/null || echo "   https://github.com/$(gh api user --jq .login)/Spect-IT"
        echo ""
    else
        echo ""
        echo "❌ Failed to create repository. Please create it manually:"
        echo "   1. Go to: https://github.com/new"
        echo "   2. Name: Spect-IT"
        echo "   3. Visibility: Private"
        echo "   4. Then run: git remote add origin https://github.com/YOUR_USERNAME/Spect-IT.git"
        echo "   5. Then run: git push -u origin main"
        exit 1
    fi
else
    echo "⚠️  GitHub CLI not installed"
    echo ""
    echo "📋 MANUAL STEPS:"
    echo ""
    echo "1. Go to: https://github.com/new"
    echo ""
    echo "2. Fill in:"
    echo "   • Repository name: Spect-IT"
    echo "   • Description: Premium eye testing app with advanced AI-powered vision analysis"
    echo "   • Visibility: Private ✅"
    echo "   • Click 'Create repository'"
    echo ""
    echo "3. After creating, run these commands:"
    echo ""
    echo "   cd /Users/tanyastrauss/Spect-IT"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/Spect-IT.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "💡 Tip: Install GitHub CLI for easier setup:"
    echo "   brew install gh"
    echo "   gh auth login"
    echo ""
fi

