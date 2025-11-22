// Supabase Client Setup
// This file initializes the Supabase client for the web app

let supabaseClient = null;

// Initialize Supabase client
function initSupabase() {
    if (typeof supabase === 'undefined') {
        console.error('Supabase library not loaded. Make sure to include the Supabase script in index.html');
        return null;
    }

    // Get config from window.CONFIG or environment
    const supabaseUrl = (window.CONFIG && window.CONFIG.SUPABASE_URL) || 
                       (typeof process !== 'undefined' && process.env.SUPABASE_URL) ||
                       '';
    
    const supabaseAnonKey = (window.CONFIG && window.CONFIG.SUPABASE_ANON_KEY) || 
                           (typeof process !== 'undefined' && process.env.SUPABASE_ANON_KEY) ||
                           '';

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase credentials not configured. Some features will be disabled.');
        return null;
    }

    supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized');
    return supabaseClient;
}

// Get Supabase client instance
function getSupabaseClient() {
    if (!supabaseClient) {
        return initSupabase();
    }
    return supabaseClient;
}

// Check if user is authenticated
async function isAuthenticated() {
    const client = getSupabaseClient();
    if (!client) return false;
    
    const { data: { session } } = await client.auth.getSession();
    return !!session;
}

// Get current user
async function getCurrentUser() {
    const client = getSupabaseClient();
    if (!client) return null;
    
    const { data: { user } } = await client.auth.getUser();
    return user;
}

// Sign up with email and password
async function signUp(email, password, fullName = '') {
    const client = getSupabaseClient();
    if (!client) {
        throw new Error('Supabase not configured');
    }

    const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName
            }
        }
    });

    if (error) throw error;
    return data;
}

// Sign in with email and password
async function signIn(email, password) {
    const client = getSupabaseClient();
    if (!client) {
        throw new Error('Supabase not configured');
    }

    const { data, error } = await client.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    return data;
}

// Sign out
async function signOut() {
    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await client.auth.signOut();
    if (error) throw error;
}

// Reset password
async function resetPassword(email) {
    const client = getSupabaseClient();
    if (!client) {
        throw new Error('Supabase not configured');
    }

    const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
}

// Listen to auth state changes
function onAuthStateChange(callback) {
    const client = getSupabaseClient();
    if (!client) return null;

    return client.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

// Export functions for use in other files
window.SupabaseClient = {
    init: initSupabase,
    getClient: getSupabaseClient,
    isAuthenticated,
    getCurrentUser,
    signUp,
    signIn,
    signOut,
    resetPassword,
    onAuthStateChange
};

