#!/bin/bash

# Edit and Remove API Keys from All Files
# Replaces hardcoded keys with environment variables

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          ✏️  EDITING FILES TO REMOVE API KEYS                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

OLD_GOOGLE_KEY="AIzaSyCCEQr9H_OwLccYjDNoTTH_u9cFymPXa08"
OLD_SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlY3dlbmhvYXR6cG52bWhvaXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODk2MDAsImV4cCI6MjA1MDM2NTYwMH0.33ZKy0DgkrYWaV/n9JjQWdyP5ugV3vbydF5LdZx2Tefcu1sDiXggKsGYN32Dr/taUHo8RhxIhOGdR6GGo4ybDg=="

# Find all files with API keys
echo "🔍 Finding files with API keys..."
FILES_WITH_KEYS=$(find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.md" \) \
    -not -path "./node_modules/*" \
    -not -path "./.git/*" \
    -not -path "./.next/*" \
    -not -path "./dist/*" \
    -not -path "./build/*" \
    -exec grep -l "$OLD_GOOGLE_KEY\|$OLD_SUPABASE_KEY" {} \; 2>/dev/null)

if [ -z "$FILES_WITH_KEYS" ]; then
    echo "✅ No files found with API keys"
    exit 0
fi

echo "📝 Files to edit:"
echo "$FILES_WITH_KEYS" | while read file; do
    echo "   - $file"
done
echo ""

# Edit each file
echo "✏️  Editing files..."
echo "$FILES_WITH_KEYS" | while read file; do
    if [ -f "$file" ]; then
        echo "   Editing: $file"
        
        # Replace Google API key
        sed -i '' "s|$OLD_GOOGLE_KEY|process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || 'YOUR_GOOGLE_API_KEY_HERE'|g" "$file" 2>/dev/null || \
        sed -i "s|$OLD_GOOGLE_KEY|process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || 'YOUR_GOOGLE_API_KEY_HERE'|g" "$file" 2>/dev/null || true
        
        # Replace Supabase key
        sed -i '' "s|$OLD_SUPABASE_KEY|process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE'|g" "$file" 2>/dev/null || \
        sed -i "s|$OLD_SUPABASE_KEY|process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE'|g" "$file" 2>/dev/null || true
        
        # Replace Supabase URL
        sed -i '' "s|https://lecwenhoatzpnvmhoiua\.supabase\.co|process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE'|g" "$file" 2>/dev/null || \
        sed -i "s|https://lecwenhoatzpnvmhoiua\.supabase\.co|process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE'|g" "$file" 2>/dev/null || true
    fi
done

echo "✅ Files edited"
echo ""

# Commit changes
echo "📤 Committing changes..."
git add -A
git commit -m "security: Replace hardcoded API keys with environment variables

- Replaced Google API keys with env variables
- Replaced Supabase keys with env variables
- All keys now use process.env or placeholders" || true

echo "✅ Changes committed"
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          ✅ ALL FILES EDITED                                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ API keys replaced with environment variables"
echo "✅ Files updated and committed"
echo ""
echo "⚠️  Next: Push changes and rotate keys"
echo "   git push origin main"
echo ""

