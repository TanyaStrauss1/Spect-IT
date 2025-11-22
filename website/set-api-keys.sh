#!/bin/bash

# Script to set Google API keys via terminal

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🔑 SET GOOGLE API KEYS FOR SPECT-IT                             ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Setting up Google API Keys"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Prompt for API keys
read -p "Enter your Google Places API Key: " PLACES_KEY
read -p "Enter your Google Maps API Key: " MAPS_KEY

if [ -z "$PLACES_KEY" ] || [ -z "$MAPS_KEY" ]; then
    echo "❌ Error: API keys cannot be empty"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Setting environment variables in Vercel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Set environment variables in Vercel
vercel env add GOOGLE_PLACES_API_KEY production <<< "$PLACES_KEY"
vercel env add GOOGLE_MAPS_API_KEY production <<< "$MAPS_KEY"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Updating spectit-location.js file..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Update the JavaScript file
sed -i '' "s/YOUR_GOOGLE_PLACES_API_KEY/$PLACES_KEY/g" spectit-location.js
sed -i '' "s/YOUR_GOOGLE_MAPS_API_KEY/$MAPS_KEY/g" spectit-location.js

echo "✅ API keys updated in spectit-location.js"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Redeploying to Vercel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Redeploy
vercel --prod --yes

echo ""
echo "✅ All done! API keys are set and website is redeployed."
echo "🌐 Check: https://www.spect-it.com"

