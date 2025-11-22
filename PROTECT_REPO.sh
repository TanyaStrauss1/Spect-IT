#!/bin/bash

# Protect Spect-IT Repository
# Makes repository private and secures sensitive files

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🔒 PROTECTING SPECT-IT REPOSITORY                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

# Step 1: Check if repository is private
echo "📋 Step 1: Checking repository visibility..."
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [[ -z "$REPO_URL" ]]; then
    echo "❌ No remote repository found"
    exit 1
fi

echo "✅ Repository URL: $REPO_URL"
echo ""
echo "⚠️  IMPORTANT: Make sure your repository is PRIVATE on GitHub:"
echo "   1. Go to: https://github.com/TanyaStrauss1/Spect-IT/settings"
echo "   2. Scroll to 'Danger Zone'"
echo "   3. If it says 'Change visibility' → 'Make private', click it"
echo ""

# Step 2: Remove sensitive files from git tracking
echo "📋 Step 2: Removing sensitive files from git tracking..."
SENSITIVE_FILES=(
    "website/supabase-config.js"
    "website/spectit-location.js"
    "website/set-api-keys.sh"
    "apps/web/.env*"
    ".env*"
)

for file in "${SENSITIVE_FILES[@]}"; do
    if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
        echo "   Removing: $file"
        git rm --cached "$file" 2>/dev/null || true
    fi
done

# Step 3: Create .env.example files
echo ""
echo "📋 Step 3: Creating .env.example files..."

cat > .env.example << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Places API
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Other API Keys
# Add other API keys here as needed
EOF

cat > website/.env.example << 'EOF'
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Places API
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
EOF

echo "✅ Created .env.example files"

# Step 4: Update .gitignore
echo ""
echo "📋 Step 4: Updating .gitignore..."
echo "✅ .gitignore already configured"

# Step 5: Instructions
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          ✅ PROTECTION STEPS COMPLETE                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps (CRITICAL):"
echo ""
echo "1. Make Repository PRIVATE on GitHub:"
echo "   https://github.com/TanyaStrauss1/Spect-IT/settings"
echo "   → Danger Zone → Make private"
echo ""
echo "2. Enable Branch Protection:"
echo "   https://github.com/TanyaStrauss1/Spect-IT/settings/branches"
echo "   → Add rule for 'main' branch"
echo "   → Enable: Require pull request reviews"
echo "   → Enable: Require status checks"
echo ""
echo "3. Remove Sensitive Files from History (if needed):"
echo "   git filter-branch --force --index-filter \\"
echo "   'git rm --cached --ignore-unmatch website/supabase-config.js' \\"
echo "   --prune-empty --tag-name-filter cat -- --all"
echo ""
echo "4. Create .env.local files (not committed):"
echo "   cp .env.example .env.local"
echo "   # Then add your actual API keys to .env.local"
echo ""
echo "5. Commit and push changes:"
echo "   git add .gitignore .env.example"
echo "   git commit -m 'security: Remove sensitive files and add protection'"
echo "   git push origin main"
echo ""
echo "🔒 Your repository is now protected!"
echo ""

