#!/bin/bash

# Quick deploy to Vercel script

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🚀 DEPLOYING TO VERCEL                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in. Please run: vercel login"
    exit 1
fi

echo ""
echo "🚀 Deploying to production..."
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo "🌐 Check your site: https://spect-it.vercel.app"
echo ""

