#!/bin/bash

# Automated API Key Rotation via API Calls
# Uses Supabase and Google Cloud APIs directly

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🔑 AUTOMATED API KEY ROTATION                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

SUPABASE_PROJECT_ID="lecwenhoatzpnvmhoiua"
SUPABASE_URL="https://lecwenhoatzpnvmhoiua.supabase.co"
OLD_GOOGLE_KEY="AIzaSyCCEQr9H_OwLccYjDNoTTH_u9cFymPXa08"

# Step 1: Supabase Key Rotation via API
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 STEP 1: SUPABASE KEY ROTATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 Supabase Project: $SUPABASE_PROJECT_ID"
echo ""
echo "🌐 Open in browser to rotate:"
echo "   https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/settings/api"
echo ""
echo "Or use Supabase CLI (if authenticated):"
echo "   supabase login"
echo "   supabase projects api-keys --project-ref $SUPABASE_PROJECT_ID"
echo ""

# Check if we have Supabase access token
if [ -n "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "✅ Supabase access token found"
    echo "   Attempting to list API keys..."
    curl -s -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
         "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_ID/api-keys" \
         | jq '.' 2>/dev/null || echo "   ⚠️  Could not fetch keys via API"
else
    echo "💡 To automate, set SUPABASE_ACCESS_TOKEN:"
    echo "   export SUPABASE_ACCESS_TOKEN=your_token"
    echo "   Get token from: https://supabase.com/dashboard/account/tokens"
fi

echo ""

# Step 2: Google Cloud Key Rotation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 STEP 2: GOOGLE CLOUD KEY ROTATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 Old Google API Key: ${OLD_GOOGLE_KEY:0:20}..."
echo ""

# Check if gcloud is available
if command -v gcloud &> /dev/null; then
    echo "✅ Google Cloud CLI found"
    
    # Check if authenticated
    if gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
        ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1)
        echo "✅ Authenticated as: $ACTIVE_ACCOUNT"
        echo ""
        
        # Set project (if needed)
        echo "📝 Listing API keys..."
        gcloud services api-keys list --format="table(name,displayName,createTime)" 2>/dev/null || {
            echo "   ⚠️  API Keys API may need to be enabled"
            echo "   Enable at: https://console.cloud.google.com/apis/library/apikeys.googleapis.com"
        }
        
        echo ""
        echo "To delete old key:"
        echo "   gcloud services api-keys delete KEY_ID"
        echo ""
        echo "To create new key:"
        echo "   gcloud services api-keys create --display-name='Spect-IT-$(date +%Y%m%d)'"
    else
        echo "🔐 Authenticate with:"
        echo "   gcloud auth login"
        echo "   gcloud auth application-default login"
    fi
else
    echo "📥 Install Google Cloud CLI:"
    echo "   brew install --cask google-cloud-sdk"
    echo ""
    echo "🌐 Or use web console:"
    echo "   https://console.cloud.google.com/apis/credentials"
fi

echo ""

# Step 3: Create new keys via API (if possible)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 STEP 3: QUICK ROTATION COMMANDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat > /tmp/rotate_commands.txt << 'CMDS'
# Supabase Key Rotation
# 1. Get access token from: https://supabase.com/dashboard/account/tokens
# 2. Run:
export SUPABASE_ACCESS_TOKEN=your_token_here
curl -X POST \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.supabase.com/v1/projects/lecwenhoatzpnvmhoiua/api-keys" \
  -d '{"name":"anon","type":"anon"}'

# Google Cloud Key Rotation
# 1. Authenticate:
gcloud auth login
gcloud auth application-default login

# 2. List keys:
gcloud services api-keys list

# 3. Delete old key:
gcloud services api-keys delete KEY_ID

# 4. Create new key:
gcloud services api-keys create \
  --display-name="Spect-IT-$(date +%Y%m%d)" \
  --api-target=service=places-backend.googleapis.com \
  --api-target=service=geocoding-backend.googleapis.com \
  --api-target=service=js-api-backend.googleapis.com
CMDS

echo "📋 Quick rotation commands saved to: /tmp/rotate_commands.txt"
echo ""

# Step 4: Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          ✅ AUTOMATED ROTATION READY                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Fastest Method (Web Dashboards):"
echo ""
echo "1. Supabase (30 seconds):"
echo "   https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/settings/api"
echo "   → Click 'Reset' on anon key → Copy new key"
echo ""
echo "2. Google Cloud (1 minute):"
echo "   https://console.cloud.google.com/apis/credentials"
echo "   → Find key → Delete → Create new → Restrict → Copy"
echo ""
echo "3. Update Environment:"
echo "   ./UPDATE_KEYS.sh"
echo ""
echo "📖 See /tmp/rotate_commands.txt for API commands"
echo ""

