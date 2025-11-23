#!/bin/bash

# Script to disable Vercel Deployment Protection
# This fixes the authentication issue preventing the site from displaying

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🔓 DISABLE VERCEL PROTECTION                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

PROJECT_NAME="spect-it-app1"
TEAM_NAME="equi-ledger"

echo "📋 To disable Vercel Protection:"
echo ""
echo "Method 1: Vercel Dashboard (Easiest)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select project: $PROJECT_NAME"
echo "3. Go to: Settings → Deployment Protection"
echo "4. Click: Disable Protection"
echo "5. Save changes"
echo ""
echo "Method 2: Vercel CLI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI found"
    echo ""
    echo "Run these commands:"
    echo "  vercel projects ls"
    echo "  vercel project --help"
    echo ""
    echo "Or use the dashboard method above (easier)"
else
    echo "⚠️  Vercel CLI not installed"
    echo "   Use Method 1 (Dashboard) instead"
fi

echo ""
echo "🌐 After disabling protection, your site will be public:"
echo "   https://spect-it-app1-azta2k3rt-equi-ledger.vercel.app"
echo ""
echo "📖 See FIX_VERCEL_DEPLOYMENT.md for complete guide"
echo ""

# Try to open dashboard
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "https://vercel.com/dashboard" 2>/dev/null
    echo "✅ Opened Vercel Dashboard in browser"
fi

