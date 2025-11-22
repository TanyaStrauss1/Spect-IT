#!/bin/bash
# Quick script to update API keys in environment files

echo "🔑 Updating API Keys..."
echo ""

# Get new keys
echo "Enter new Supabase anon key:"
read -s SUPABASE_KEY
echo ""
echo "Enter new Google Places API key:"
read -s GOOGLE_KEY
echo ""

# Update .env.local if it exists
if [ -f .env.local ]; then
    sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY|" .env.local
    sed -i '' "s|GOOGLE_PLACES_API_KEY=.*|GOOGLE_PLACES_API_KEY=$GOOGLE_KEY|" .env.local
    sed -i '' "s|GOOGLE_MAPS_API_KEY=.*|GOOGLE_MAPS_API_KEY=$GOOGLE_KEY|" .env.local
    echo "✅ Updated .env.local"
else
    echo "📝 Creating .env.local..."
    cat > .env.local << ENVEOF
NEXT_PUBLIC_SUPABASE_URL=https://lecwenhoatzpnvmhoiua.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY
GOOGLE_PLACES_API_KEY=$GOOGLE_KEY
GOOGLE_MAPS_API_KEY=$GOOGLE_KEY
ENVEOF
    echo "✅ Created .env.local"
fi

# Update website files if they exist
if [ -f website/supabase-config.js ]; then
    sed -i '' "s|anonKey: '[^']*'|anonKey: '$SUPABASE_KEY'|" website/supabase-config.js
    echo "✅ Updated website/supabase-config.js"
fi

if [ -f website/specialists.js ]; then
    sed -i '' "s|googlePlacesApiKey: '[^']*'|googlePlacesApiKey: '$GOOGLE_KEY'|g" website/specialists.js
    sed -i '' "s|googleMapsApiKey: '[^']*'|googleMapsApiKey: '$GOOGLE_KEY'|g" website/specialists.js
    echo "✅ Updated website/specialists.js"
fi

echo ""
echo "✅ Keys updated!"
echo ""
echo "⚠️  Next: Update Vercel environment variables:"
echo "   https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
echo ""
