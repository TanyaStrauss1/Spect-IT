#!/bin/bash

# Deploy Spect-IT to Vercel
# This script handles the deployment process

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🚀 DEPLOYING SPECT-IT TO VERCEL                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")/apps/web"

echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "🔨 Step 2: Building Next.js app..."
npm run build

echo ""
echo "🚀 Step 3: Deploying to Vercel..."
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site is now live!"
echo "   Check the URL above for your deployment link"
echo ""

