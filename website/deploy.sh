#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 DEPLOYING SPECT-IT TO VERCEL                                 ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🔗 Linking to Vercel project: spect-it-app1"
echo ""

# Deploy to Vercel
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo "🌐 Website: https://www.spect-it.com"
