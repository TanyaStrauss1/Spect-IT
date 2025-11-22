#!/bin/bash

# Automatically Add Website Restrictions to Google API Keys
# Uses Google Cloud API to add restrictions programmatically

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🔒 AUTO-ADDING WEBSITE RESTRICTIONS                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "📥 Google Cloud CLI not found"
    echo "   Install: brew install --cask google-cloud-sdk"
    echo ""
    echo "🌐 Or use manual method:"
    echo "   ./QUICK_RESTRICT_KEYS.sh"
    exit 1
fi

# Check authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "🔐 Authenticating with Google Cloud..."
    gcloud auth login
    gcloud auth application-default login
fi

echo "✅ Google Cloud CLI ready"
echo ""

# List API keys
echo "📋 Listing API keys..."
API_KEYS=$(gcloud services api-keys list --format="value(name)" 2>/dev/null || echo "")

if [ -z "$API_KEYS" ]; then
    echo "⚠️  No API keys found or API not enabled"
    echo ""
    echo "🌐 Use manual method:"
    echo "   1. Go to: https://console.cloud.google.com/apis/credentials"
    echo "   2. Click on your API key"
    echo "   3. Under 'Application restrictions' → 'HTTP referrers'"
    echo "   4. Add the restrictions from QUICK_RESTRICT_KEYS.sh"
    exit 0
fi

echo "Found API keys. To add restrictions:"
echo ""
echo "For each API key, run:"
echo ""
echo "gcloud services api-keys update KEY_ID \\"
echo "  --allowed-referrers='https://www.spect-it.com/*' \\"
echo "  --allowed-referrers='https://spect-it.com/*' \\"
echo "  --allowed-referrers='https://spect-it.vercel.app/*' \\"
echo "  --allowed-referrers='https://*.vercel.app/*' \\"
echo "  --allowed-referrers='http://localhost:3000/*' \\"
echo "  --allowed-referrers='http://127.0.0.1:3000/*'"
echo ""

# Create exact command file
cat > ADD_RESTRICTIONS_COMMANDS.sh << 'CMDEOF'
#!/bin/bash

# Exact commands to add website restrictions
# Replace KEY_ID with your actual API key ID

KEY_ID="YOUR_API_KEY_ID_HERE"

echo "Adding website restrictions to API key: $KEY_ID"
echo ""

gcloud services api-keys update "$KEY_ID" \
  --allowed-referrers='https://www.spect-it.com/*' \
  --allowed-referrers='https://spect-it.com/*' \
  --allowed-referrers='https://spect-it.vercel.app/*' \
  --allowed-referrers='https://*.vercel.app/*' \
  --allowed-referrers='http://localhost:3000/*' \
  --allowed-referrers='http://127.0.0.1:3000/*' \
  --allowed-referrers='http://localhost/*' \
  --allowed-referrers='http://127.0.0.1/*'

echo ""
echo "✅ Restrictions added!"
echo ""
echo "⚠️  Also restrict APIs:"
echo "   Go to: https://console.cloud.google.com/apis/credentials"
echo "   → Edit key → API restrictions → Select:"
echo "     - Places API"
echo "     - Maps JavaScript API"
echo "     - Geocoding API"
CMDEOF

chmod +x ADD_RESTRICTIONS_COMMANDS.sh

echo "✅ Created ADD_RESTRICTIONS_COMMANDS.sh"
echo ""
echo "📋 To use:"
echo "   1. Get your API key ID:"
echo "      gcloud services api-keys list"
echo ""
echo "   2. Edit ADD_RESTRICTIONS_COMMANDS.sh"
echo "      Replace KEY_ID with your key ID"
echo ""
echo "   3. Run: ./ADD_RESTRICTIONS_COMMANDS.sh"
echo ""

# Open console as fallback
GOOGLE_URL="https://console.cloud.google.com/apis/credentials"
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$GOOGLE_URL" 2>/dev/null
else
    xdg-open "$GOOGLE_URL" 2>/dev/null
fi

echo "🌐 Google Cloud Console opened"
echo ""
echo "📖 See GOOGLE_API_RESTRICTIONS.md for complete guide"
echo ""

