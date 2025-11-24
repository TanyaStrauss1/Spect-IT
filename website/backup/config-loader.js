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
