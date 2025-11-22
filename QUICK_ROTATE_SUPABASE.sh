#!/bin/bash

# Quick Supabase Key Rotation via Supabase CLI

set -e

PROJECT_ID="lecwenhoatzpnvmhoiua"

echo "🔑 Rotating Supabase API Key..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📥 Installing Supabase CLI..."
    brew install supabase/tap/supabase
fi

# Login if needed
if ! supabase projects list &> /dev/null; then
    echo "🔐 Logging in to Supabase..."
    supabase login
fi

echo "📋 Current Supabase Project: $PROJECT_ID"
echo ""
echo "To rotate the anon key:"
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_ID/settings/api"
echo "2. Click 'Reset' next to 'anon public' key"
echo "3. Copy the new key"
echo ""
echo "Or use Supabase Dashboard API:"
echo "   supabase projects api-keys --project-ref $PROJECT_ID"
echo ""

# Try to get current keys (if API supports it)
if supabase projects api-keys --project-ref "$PROJECT_ID" &> /dev/null; then
    echo "Current API keys:"
    supabase projects api-keys --project-ref "$PROJECT_ID"
else
    echo "⚠️  Use the dashboard to rotate keys:"
    echo "   https://supabase.com/dashboard/project/$PROJECT_ID/settings/api"
fi

