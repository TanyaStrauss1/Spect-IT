#!/bin/bash

# Fix Environment Variable Usage for Browser Context
# Updates files to use window.env or proper browser-compatible env vars

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🔧 FIXING ENVIRONMENT VARIABLE USAGE                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Update website files to use window.env or config
find website -name "*.js" -type f | while read file; do
    if [ -f "$file" ]; then
        echo "   Fixing: $file"
        
        # Replace process.env with window.env or config object
        sed -i '' 's|process\.env\.GOOGLE_PLACES_API_KEY|(window.ENV && window.ENV.GOOGLE_PLACES_API_KEY) || (window.CONFIG && window.CONFIG.googlePlacesApiKey) || ""|g' "$file" 2>/dev/null || \
        sed -i 's|process\.env\.GOOGLE_PLACES_API_KEY|(window.ENV && window.ENV.GOOGLE_PLACES_API_KEY) || (window.CONFIG && window.CONFIG.googlePlacesApiKey) || ""|g' "$file" 2>/dev/null || true
        
        sed -i '' 's|process\.env\.SUPABASE_ANON_KEY|(window.ENV && window.ENV.SUPABASE_ANON_KEY) || (window.CONFIG && window.CONFIG.supabaseAnonKey) || ""|g' "$file" 2>/dev/null || \
        sed -i 's|process\.env\.SUPABASE_ANON_KEY|(window.ENV && window.ENV.SUPABASE_ANON_KEY) || (window.CONFIG && window.CONFIG.supabaseAnonKey) || ""|g' "$file" 2>/dev/null || true
    fi
done

# Create config loader for website
cat > website/config-loader.js << 'CONFIGEOF'
// Environment Configuration Loader
// Loads API keys from environment or config file

(function() {
    'use strict';
    
    // Try to load from window.ENV (set by build process)
    // Or from config.js (for development)
    window.ENV = window.ENV || {};
    window.CONFIG = window.CONFIG || {};
    
    // Supabase config
    if (!window.ENV.SUPABASE_ANON_KEY && !window.CONFIG.supabaseAnonKey) {
        // Try to load from config.js if it exists
        if (typeof SUPABASE_CONFIG !== 'undefined') {
            window.CONFIG.supabaseAnonKey = SUPABASE_CONFIG.anonKey;
            window.CONFIG.supabaseUrl = SUPABASE_CONFIG.url;
        }
    }
    
    // Google API config
    if (!window.ENV.GOOGLE_PLACES_API_KEY && !window.CONFIG.googlePlacesApiKey) {
        // Will be set via environment variables in production
        window.CONFIG.googlePlacesApiKey = '';
    }
    
    // Helper function to get config values
    window.getConfig = function(key) {
        return window.ENV[key] || window.CONFIG[key] || '';
    };
})();
CONFIGEOF

echo "✅ Environment variable usage fixed"
echo "✅ Created config-loader.js"
echo ""

# Commit changes
git add website/config-loader.js website/*.js
git commit -m "fix: Update environment variable usage for browser context

- Replaced process.env with window.ENV/window.CONFIG
- Created config-loader.js for browser compatibility
- All API keys now loaded from environment or config" || true

echo "✅ Changes committed"
echo ""

