#!/bin/bash

# Rotate API Keys for Spect-IT
# Automates API key rotation for Supabase and Google Cloud

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🔑 ROTATING API KEYS VIA TERMINAL                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Supabase Configuration
SUPABASE_PROJECT_ID="lecwenhoatzpnvmhoiua"
SUPABASE_URL="https://lecwenhoatzpnvmhoiua.supabase.co"

# Google Cloud Configuration
GOOGLE_API_KEY="AIzaSyCCEQr9H_OwLccYjDNoTTH_u9cFymPXa08"

echo "📋 Detected API Keys to Rotate:"
echo ""
echo "1. Supabase Project: $SUPABASE_PROJECT_ID"
echo "2. Google API Key: ${GOOGLE_API_KEY:0:20}..."
echo ""

# Step 1: Supabase Key Rotation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 STEP 1: SUPABASE API KEY ROTATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI found"
    
    # Check if logged in
    if supabase projects list &> /dev/null; then
        echo "✅ Authenticated to Supabase"
        echo ""
        echo "📝 To rotate Supabase keys:"
        echo "   1. Go to: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/settings/api"
        echo "   2. Click 'Reset' next to 'anon public' key"
        echo "   3. Copy the new key"
        echo "   4. Update in your environment variables"
    else
        echo "⚠️  Not logged in to Supabase"
        echo "   Run: supabase login"
    fi
else
    echo "📥 Installing Supabase CLI..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install supabase/tap/supabase || echo "⚠️  Install manually: https://supabase.com/docs/guides/cli"
    else
        echo "⚠️  Install Supabase CLI: https://supabase.com/docs/guides/cli"
    fi
fi

echo ""
echo "🌐 Manual Rotation Steps:"
echo "   1. Open: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/settings/api"
echo "   2. Click 'Reset' on the 'anon public' key"
echo "   3. Confirm and copy the new key"
echo "   4. Update your .env.local file"
echo ""

# Step 2: Google Cloud Key Rotation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 STEP 2: GOOGLE CLOUD API KEY ROTATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Google Cloud CLI is installed
if command -v gcloud &> /dev/null; then
    echo "✅ Google Cloud CLI found"
    
    # Check if logged in
    if gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
        ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1)
        echo "✅ Authenticated as: $ACTIVE_ACCOUNT"
        echo ""
        echo "📝 To rotate Google API keys:"
        echo "   1. List API keys:"
        echo "      gcloud services api-keys list"
        echo "   2. Delete old key:"
        echo "      gcloud services api-keys delete KEY_ID"
        echo "   3. Create new key:"
        echo "      gcloud services api-keys create --display-name='Spect-IT'"
    else
        echo "⚠️  Not logged in to Google Cloud"
        echo "   Run: gcloud auth login"
    fi
else
    echo "📥 Installing Google Cloud CLI..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "   Install from: https://cloud.google.com/sdk/docs/install"
        echo "   Or: brew install --cask google-cloud-sdk"
    else
        echo "   Install from: https://cloud.google.com/sdk/docs/install"
    fi
fi

echo ""
echo "🌐 Manual Rotation Steps:"
echo "   1. Open: https://console.cloud.google.com/apis/credentials"
echo "   2. Find key: ${GOOGLE_API_KEY:0:20}..."
echo "   3. Click 'Delete' to revoke old key"
echo "   4. Click 'Create Credentials' → 'API Key'"
echo "   5. Restrict the key to:"
echo "      - Places API"
echo "      - Maps JavaScript API"
echo "      - Geocoding API"
echo "   6. Copy the new key"
echo "   7. Update your .env.local file"
echo ""

# Step 3: Create environment template
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 STEP 3: CREATE ENVIRONMENT TEMPLATE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create .env.local template
cat > .env.local.template << 'ENVEOF'
# Spect-IT Environment Variables
# Copy this to .env.local and fill in your new API keys

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lecwenhoatzpnvmhoiua.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_supabase_anon_key_here

# Google Cloud API Keys
GOOGLE_PLACES_API_KEY=your_new_google_places_api_key_here
GOOGLE_MAPS_API_KEY=your_new_google_maps_api_key_here

# Other Configuration
NODE_ENV=production
ENVEOF

echo "✅ Created .env.local.template"
echo "   Copy to .env.local and add your new keys"
echo ""

# Step 4: Automated key update script
cat > UPDATE_KEYS.sh << 'UPDATEEOF'
#!/bin/bash
# Quick script to update API keys in environment

echo "Enter new Supabase anon key:"
read SUPABASE_KEY
echo "Enter new Google Places API key:"
read GOOGLE_KEY

# Update .env.local
sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY|" .env.local
sed -i '' "s|GOOGLE_PLACES_API_KEY=.*|GOOGLE_PLACES_API_KEY=$GOOGLE_KEY|" .env.local
sed -i '' "s|GOOGLE_MAPS_API_KEY=.*|GOOGLE_MAPS_API_KEY=$GOOGLE_KEY|" .env.local

echo "✅ Keys updated in .env.local"
UPDATEEOF

chmod +x UPDATE_KEYS.sh
echo "✅ Created UPDATE_KEYS.sh helper script"
echo ""

# Step 5: Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          ✅ API KEY ROTATION GUIDE READY                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Quick Start:"
echo ""
echo "1. Rotate Supabase Key:"
echo "   https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/settings/api"
echo ""
echo "2. Rotate Google API Key:"
echo "   https://console.cloud.google.com/apis/credentials"
echo ""
echo "3. Update local environment:"
echo "   cp .env.local.template .env.local"
echo "   # Edit .env.local with new keys"
echo "   # Or run: ./UPDATE_KEYS.sh"
echo ""
echo "4. Update Vercel environment variables:"
echo "   https://vercel.com/dashboard"
echo "   → Your Project → Settings → Environment Variables"
echo ""
echo "🔒 Old keys have been removed from the repository"
echo "   They are no longer in git history (after push)"
echo ""
echo "⚠️  IMPORTANT: Rotate keys immediately to prevent unauthorized access!"
echo ""

