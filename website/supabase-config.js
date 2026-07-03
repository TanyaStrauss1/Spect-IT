// Supabase Configuration and Client Setup
// Provides cloud database storage for test results, user data, and orders

// Supabase Configuration
// ✅ Fully configured and ready to use!
const SUPABASE_CONFIG = {
    url: 'https://lecwenhoatzpnvmhoiua.supabase.co', // ✅ Project URL configured
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlY3dlbmhvYXR6cG52bWhvaXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODk2MDAsImV4cCI6MjA1MDM2NTYwMH0.33ZKy0DgkrYWaV/n9JjQWdyP5ugV3vbydF5LdZx2Tefcu1sDiXggKsGYN32Dr/taUHo8RhxIhOGdR6GGo4ybDg==' // ✅ Anon key configured
};

// To set up Supabase:
// 1. Go to https://supabase.com and create a project
// 2. Get your Project URL and anon key from Settings → API
// 3. Update the values above
// 4. Run the SQL from SUPABASE_SETUP.md in Supabase SQL Editor

// Initialize Supabase client
let supabaseClient = null;

// Check if Supabase is configured
function initSupabase() {
    if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url.includes('your-project') || 
        !SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.anonKey.includes('your-anon-key')) {
        console.warn('Supabase not configured. Using localStorage only.');
        return false;
    }
    
    try {
        // Dynamically load Supabase client
        if (typeof supabase === 'undefined') {
            // Supabase will be loaded via CDN in HTML
            console.warn('Supabase client not loaded. Make sure to include Supabase script in HTML.');
            return false;
        }
        
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return false;
    }
}

// Check if Supabase is available
function isSupabaseAvailable() {
    return supabaseClient !== null && typeof supabaseClient !== 'undefined';
}

// User Management
const UserStorage = {
    // Save user email to Supabase
    async saveUser(email) {
        if (!isSupabaseAvailable()) {
            // Fallback to localStorage
            localStorage.setItem('spectit_user_email', email);
            return { success: true, method: 'localStorage' };
        }
        
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .upsert({
                    email: email,
                    last_seen: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'email'
                });
            
            if (error) throw error;
            
            // Also save to localStorage as backup
            localStorage.setItem('spectit_user_email', email);
            
            return { success: true, method: 'supabase', data };
        } catch (error) {
            console.error('Error saving user to Supabase:', error);
            // Fallback to localStorage
            localStorage.setItem('spectit_user_email', email);
            return { success: true, method: 'localStorage-fallback' };
        }
    },
    
    // Get user by email
    async getUser(email) {
        if (!isSupabaseAvailable()) {
            return localStorage.getItem('spectit_user_email') === email ? { email } : null;
        }
        
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('email', email)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
            
            return data;
        } catch (error) {
            console.error('Error getting user from Supabase:', error);
            return null;
        }
    }
};

// Test Results Storage
const TestResultsStorage = {
    // Save test result to Supabase
    async saveResult(result, userEmail) {
        if (!userEmail) {
            console.warn('No user email provided. Saving to localStorage only.');
            return this.saveToLocalStorage(result);
        }
        
        // Always save to localStorage first (fast, reliable)
        this.saveToLocalStorage(result);
        
        // Then sync to Supabase if available
        if (!isSupabaseAvailable()) {
            return { success: true, method: 'localStorage' };
        }
        
        try {
            const { data, error } = await supabaseClient
                .from('test_results')
                .insert({
                    user_email: userEmail,
                    test_type: result.type,
                    test_name: result.name,
                    test_data: result, // Store full result as JSON
                    score: result.score,
                    level: result.level,
                    decimal_acuity: result.decimalAcuity,
                    accuracy_rating: result.accuracyRating,
                    test_date: result.date || new Date().toISOString(),
                    eye: result.eye,
                    lidar_calibrated: result.lidarCalibrated || false,
                    test_distance: result.testDistance || result.testDistanceMeters,
                    stability_score: result.stabilityScore,
                    created_at: new Date().toISOString()
                });
            
            if (error) throw error;
            
            return { success: true, method: 'supabase', data };
        } catch (error) {
            console.error('Error saving test result to Supabase:', error);
            // Already saved to localStorage, so return success
            return { success: true, method: 'localStorage-fallback' };
        }
    },
    
    // Get test results for a user
    async getResults(userEmail, limit = 50) {
        // Always get from localStorage first (fast)
        const localResults = this.getFromLocalStorage();
        
        if (!isSupabaseAvailable()) {
            return localResults;
        }
        
        try {
            const { data, error } = await supabaseClient
                .from('test_results')
                .select('*')
                .eq('user_email', userEmail)
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            
            // Merge with localStorage results (deduplicate by date)
            const merged = this.mergeResults(localResults, data);
            return merged;
        } catch (error) {
            console.error('Error getting test results from Supabase:', error);
            return localResults;
        }
    },
    
    // LocalStorage helpers
    saveToLocalStorage(result) {
        let testHistory = JSON.parse(localStorage.getItem('testHistory') || '[]');
        testHistory.push(result);
        localStorage.setItem('testHistory', JSON.stringify(testHistory));
    },
    
    getFromLocalStorage() {
        return JSON.parse(localStorage.getItem('testHistory') || '[]');
    },
    
    mergeResults(local, remote) {
        // Combine and deduplicate by date
        const combined = [...local, ...remote.map(r => r.test_data || r)];
        const unique = combined.filter((result, index, self) => 
            index === self.findIndex(r => r.date === result.date && r.type === result.type)
        );
        return unique.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
};

// Shopping Cart Storage
const CartStorage = {
    // Save cart to Supabase
    async saveCart(cart, userEmail) {
        if (!userEmail) {
            localStorage.setItem('shoppingCart', JSON.stringify(cart));
            return { success: true, method: 'localStorage' };
        }
        
        // Always save to localStorage first
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        
        if (!isSupabaseAvailable()) {
            return { success: true, method: 'localStorage' };
        }
        
        try {
            const { data, error } = await supabaseClient
                .from('shopping_carts')
                .upsert({
                    user_email: userEmail,
                    cart_data: cart,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_email'
                });
            
            if (error) throw error;
            
            return { success: true, method: 'supabase', data };
        } catch (error) {
            console.error('Error saving cart to Supabase:', error);
            return { success: true, method: 'localStorage-fallback' };
        }
    },
    
    // Get cart for user
    async getCart(userEmail) {
        // Always get from localStorage first
        const localCart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');
        
        if (!isSupabaseAvailable() || !userEmail) {
            return localCart;
        }
        
        try {
            const { data, error } = await supabaseClient
                .from('shopping_carts')
                .select('cart_data')
                .eq('user_email', userEmail)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            
            // Merge with localStorage (prefer localStorage if both exist)
            return data?.cart_data || localCart;
        } catch (error) {
            console.error('Error getting cart from Supabase:', error);
            return localCart;
        }
    }
};

// Orders Storage
const OrdersStorage = {
    // Save order to Supabase
    async saveOrder(order, userEmail) {
        if (!userEmail) {
            let orders = JSON.parse(localStorage.getItem('spectit_orders') || '[]');
            orders.push(order);
            localStorage.setItem('spectit_orders', JSON.stringify(orders));
            return { success: true, method: 'localStorage' };
        }
        
        // Always save to localStorage first
        let orders = JSON.parse(localStorage.getItem('spectit_orders') || '[]');
        orders.push(order);
        localStorage.setItem('spectit_orders', JSON.stringify(orders));
        
        if (!isSupabaseAvailable()) {
            return { success: true, method: 'localStorage' };
        }
        
        try {
            const { data, error } = await supabaseClient
                .from('orders')
                .insert({
                    user_email: userEmail,
                    order_data: order,
                    order_id: order.id || `order-${Date.now()}`,
                    total_amount: order.total || 0,
                    status: order.status || 'pending',
                    created_at: new Date().toISOString()
                });
            
            if (error) throw error;
            
            return { success: true, method: 'supabase', data };
        } catch (error) {
            console.error('Error saving order to Supabase:', error);
            return { success: true, method: 'localStorage-fallback' };
        }
    },
    
    // Get orders for user
    async getOrders(userEmail) {
        const localOrders = JSON.parse(localStorage.getItem('spectit_orders') || '[]');
        
        if (!isSupabaseAvailable() || !userEmail) {
            return localOrders;
        }
        
        try {
            const { data, error } = await supabaseClient
                .from('orders')
                .select('*')
                .eq('user_email', userEmail)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            // Merge with localStorage
            const merged = [...localOrders, ...(data || [])];
            return merged.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
        } catch (error) {
            console.error('Error getting orders from Supabase:', error);
            return localOrders;
        }
    }
};

// Appointments Storage (bookings with optometrists)
const AppointmentsStorage = {
    _local() { try { return JSON.parse(localStorage.getItem('spectit_appointments') || '[]'); } catch (e) { return []; } },
    _saveLocal(list) { localStorage.setItem('spectit_appointments', JSON.stringify(list)); },

    _row(appt) {
        return {
            appt_id: appt.id,
            user_email: appt.patient && appt.patient.email,
            practice_place_id: appt.specialist && appt.specialist.place_id,
            practice_name: appt.specialist && appt.specialist.name,
            practice_phone: appt.specialist && appt.specialist.phone,
            practice_address: appt.specialist && appt.specialist.address,
            service: appt.service,
            service_label: appt.serviceLabel,
            appt_date: appt.date,
            appt_time: appt.time,
            duration_mins: appt.durationMins,
            status: appt.status || 'requested',
            patient_name: appt.patient && appt.patient.name,
            patient_phone: appt.patient && appt.patient.phone,
            patient_notes: appt.patient && appt.patient.notes,
            results: appt.results || null,
            data: appt,
            created_at: appt.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    },

    // Save/replace an appointment (local-first, then cloud sync).
    async save(appt) {
        const list = this._local();
        const idx = list.findIndex(a => a.id === appt.id);
        if (idx >= 0) list[idx] = appt; else list.push(appt);
        this._saveLocal(list);

        if (!isSupabaseAvailable()) return { success: true, method: 'localStorage' };
        try {
            const { data, error } = await supabaseClient
                .from('appointments')
                .upsert(this._row(appt), { onConflict: 'appt_id' });
            if (error) throw error;
            return { success: true, method: 'supabase', data };
        } catch (error) {
            console.error('Error saving appointment to Supabase:', error);
            return { success: true, method: 'localStorage-fallback' };
        }
    },

    // List a user's appointments (merged local + cloud).
    async list(userEmail) {
        const local = this._local();
        if (!isSupabaseAvailable() || !userEmail) return local;
        try {
            const { data, error } = await supabaseClient
                .from('appointments')
                .select('*')
                .eq('user_email', userEmail)
                .order('appt_date', { ascending: true });
            if (error) throw error;
            const remote = (data || []).map(r => r.data || r);
            const map = {};
            [].concat(local, remote).forEach(a => { if (a && a.id) map[a.id] = a; });
            return Object.keys(map).map(k => map[k]);
        } catch (error) {
            console.error('Error listing appointments from Supabase:', error);
            return local;
        }
    },

    // Provider console: all appointments (optionally filtered by practice).
    async listAll(placeId) {
        if (!isSupabaseAvailable()) return [];
        try {
            let q = supabaseClient.from('appointments').select('*').order('appt_date', { ascending: true });
            if (placeId) q = q.eq('practice_place_id', placeId);
            const { data, error } = await q;
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error listing all appointments:', error);
            return [];
        }
    },

    // Update status (requested/confirmed/declined/cancelled/completed).
    async setStatus(apptId, status) {
        const list = this._local().map(a => (a.id === apptId ? Object.assign({}, a, { status: status }) : a));
        this._saveLocal(list);
        if (!isSupabaseAvailable()) return { success: true, method: 'localStorage' };
        try {
            const { error } = await supabaseClient
                .from('appointments')
                .update({ status: status, updated_at: new Date().toISOString() })
                .eq('appt_id', apptId);
            if (error) throw error;
            return { success: true, method: 'supabase' };
        } catch (error) {
            console.error('Error updating appointment status:', error);
            return { success: true, method: 'localStorage-fallback' };
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initSupabase();
});

// Export for use in other files
window.SupabaseStorage = {
    init: initSupabase,
    isAvailable: isSupabaseAvailable,
    users: UserStorage,
    testResults: TestResultsStorage,
    cart: CartStorage,
    orders: OrdersStorage,
    appointments: AppointmentsStorage
};
