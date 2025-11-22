#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🔑 UPDATE SUPABASE ANON KEY                                     ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Your Supabase Project URL is already configured:"
echo "https://lecwenhoatzpnvmhoiua.supabase.co"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Get Your Anon Key"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/lecwenhoatzpnvmhoiua"
echo "2. Click: Settings → API"
echo "3. Copy the 'anon' or 'public' key"
echo ""
read -p "Paste your Supabase anon key here: " ANON_KEY

if [ -z "$ANON_KEY" ]; then
    echo "❌ No key provided. Exiting."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Updating Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Update supabase-config.js
sed -i '' "s|anonKey: 'your-anon-key-here'|anonKey: '$ANON_KEY'|g" supabase-config.js

echo "✅ Anon key updated in supabase-config.js"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Create Database Tables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/lecwenhoatzpnvmhoiua/sql"
echo "2. Copy the SQL from: SUPABASE_SETUP.md"
echo "3. Paste and run it in the SQL Editor"
echo ""
read -p "Press Enter when you've created the database tables..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CONFIGURATION COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your Supabase integration is now active!"
echo ""
echo "Test it:"
echo "1. Open your website"
echo "2. Open browser console (F12)"
echo "3. Run: window.SupabaseStorage.isAvailable()"
echo "4. Should return: true"
echo ""
echo "📄 Full guide: SUPABASE_SETUP.md"
echo ""

