#!/bin/bash

# Quick Google Cloud API Key Rotation via gcloud CLI

set -e

OLD_KEY="AIzaSyCCEQr9H_OwLccYjDNoTTH_u9cFymPXa08"

echo "🔑 Rotating Google Cloud API Key..."
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "📥 Google Cloud CLI not found"
    echo "   Install from: https://cloud.google.com/sdk/docs/install"
    echo "   Or: brew install --cask google-cloud-sdk"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "🔐 Logging in to Google Cloud..."
    gcloud auth login
fi

echo "📋 Old API Key: ${OLD_KEY:0:20}..."
echo ""

# List current API keys
echo "📝 Current API Keys:"
gcloud services api-keys list --format="table(name,displayName,createTime)" 2>/dev/null || {
    echo "⚠️  API Keys API not enabled or no keys found"
    echo ""
    echo "🌐 Use Google Cloud Console:"
    echo "   https://console.cloud.google.com/apis/credentials"
    echo ""
    echo "Steps:"
    echo "1. Find key: ${OLD_KEY:0:20}..."
    echo "2. Click 'Delete' to revoke"
    echo "3. Click 'Create Credentials' → 'API Key'"
    echo "4. Restrict to: Places API, Maps JavaScript API, Geocoding API"
    exit 0
}

echo ""
echo "To delete old key:"
echo "   gcloud services api-keys delete KEY_ID"
echo ""
echo "To create new key:"
echo "   gcloud services api-keys create --display-name='Spect-IT-$(date +%Y%m%d)'"
echo ""

