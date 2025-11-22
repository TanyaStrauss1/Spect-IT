// Configuration file for Spect-IT
// Contains API keys and configuration

const CONFIG = {
    // Google Places API Key
    GOOGLE_PLACES_API_KEY: 'AIzaSyCCEQr9H_OwLccYjDNoTTH_u9cFymPXa08',
    GOOGLE_MAPS_API_KEY: 'AIzaSyCCEQr9H_OwLccYjDNoTTH_u9cFymPXa08',
    
    // Supabase Configuration (loaded from supabase-config.js)
    // Will be merged with window.SUPABASE_CONFIG if available
};

// Make config available globally
window.CONFIG = CONFIG;

// Load Supabase config if available
if (typeof window.SUPABASE_CONFIG !== 'undefined') {
    Object.assign(CONFIG, window.SUPABASE_CONFIG);
}


