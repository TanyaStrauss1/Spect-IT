#!/bin/bash

# Exact commands to add website restrictions to Google API keys
# Replace KEY_ID with your actual API key ID

KEY_ID="YOUR_API_KEY_ID_HERE"

echo "Adding website restrictions to API key: $KEY_ID"
echo ""

# Get key ID first
echo "📋 To get your API key ID, run:"
echo "   gcloud services api-keys list"
echo ""
echo "Then edit this file and replace KEY_ID above"
echo ""

# Uncomment and run when KEY_ID is set:
# gcloud services api-keys update "$KEY_ID" \
#   --allowed-referrers='https://www.spect-it.com/*' \
#   --allowed-referrers='https://spect-it.com/*' \
#   --allowed-referrers='https://spect-it.vercel.app/*' \
#   --allowed-referrers='https://*.vercel.app/*' \
#   --allowed-referrers='http://localhost:3000/*' \
#   --allowed-referrers='http://127.0.0.1:3000/*' \
#   --allowed-referrers='http://localhost/*' \
#   --allowed-referrers='http://127.0.0.1/*'

echo ""
echo "✅ After running, also restrict APIs:"
echo "   Go to: https://console.cloud.google.com/apis/credentials"
echo "   → Edit key → API restrictions → Select:"
echo "     - Places API"
echo "     - Maps JavaScript API"
echo "     - Geocoding API"
