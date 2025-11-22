#!/bin/bash

# One-Click API Key Rotation
# Opens dashboards and provides exact commands

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🔑 ONE-CLICK API KEY ROTATION                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

SUPABASE_URL="https://supabase.com/dashboard/project/lecwenhoatzpnvmhoiua/settings/api"
GOOGLE_URL="https://console.cloud.google.com/apis/credentials"

echo "🚀 Opening rotation dashboards..."
echo ""

# Open Supabase dashboard
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$SUPABASE_URL" 2>/dev/null || echo "   Open manually: $SUPABASE_URL"
    sleep 2
    open "$GOOGLE_URL" 2>/dev/null || echo "   Open manually: $GOOGLE_URL"
else
    xdg-open "$SUPABASE_URL" 2>/dev/null || echo "   Open manually: $SUPABASE_URL"
    sleep 2
    xdg-open "$GOOGLE_URL" 2>/dev/null || echo "   Open manually: $GOOGLE_URL"
fi

echo ""
echo "📋 Follow these steps:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  SUPABASE (30 seconds)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   ✓ Dashboard opened above"
echo "   → Click 'Reset' next to 'anon public' key"
echo "   → Confirm reset"
echo "   → Copy the NEW anon key"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  GOOGLE CLOUD (1 minute)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   ✓ Dashboard opened above"
echo "   → Find key: AIzaSyCCEQr9H_OwLccY..."
echo "   → Click 'Delete' → Confirm"
echo "   → Click 'Create Credentials' → 'API Key'"
echo "   → Restrict to: Places API, Maps JavaScript API, Geocoding API"
echo "   → Copy the NEW API key"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  UPDATE KEYS IN TERMINAL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   Run this command after you have the new keys:"
echo ""
echo "   ./UPDATE_KEYS.sh"
echo ""
echo "   (It will prompt you to enter the new keys)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  UPDATE VERCEL (if deployed)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   Go to: https://vercel.com/dashboard"
echo "   → Your Project → Settings → Environment Variables"
echo "   → Update:"
echo "     - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "     - GOOGLE_PLACES_API_KEY"
echo "     - GOOGLE_MAPS_API_KEY"
echo ""

echo "✅ Dashboards opened! Follow steps above, then run: ./UPDATE_KEYS.sh"
echo ""

