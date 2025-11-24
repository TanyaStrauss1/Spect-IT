// Supabase Storage Integration
// Handles all database operations for Spect-IT

let supabaseClient = null;
let isSupabaseReady = false;

// Initialize Supabase connection
async function initializeSupabaseStorage() {
    const config = getSupabaseConfig();
    
    // Check if Supabase is configured
    if (!config.url || config.url === 'YOUR_SUPABASE_URL' ||
        !config.anonKey || config.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('⚠️ Supabase not configured. Update supabase-config.js with your credentials.');
        console.warn('⚠️ Using localStorage only until Supabase is configured.');
        return;
    }
    
    try {
        if (window.initSupabase) {
            supabaseClient = await window.initSupabase();
            isSupabaseReady = !!supabaseClient;
            
            if (isSupabaseReady) {
                console.log('✅ Supabase connected successfully');
                // Migrate localStorage data to Supabase if user is signed in
                await migrateLocalStorageToSupabase();
            }
        } else {
            console.warn('⚠️ Supabase library not loaded. Using localStorage only.');
        }
    } catch (error) {
        console.error('❌ Supabase initialization failed:', error);
        console.warn('⚠️ Falling back to localStorage');
    }
}

// Get or create user in Supabase
async function getOrCreateUser(email) {
    if (!isSupabaseReady || !supabaseClient) return null;
    
    try {
        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabaseClient
            .from('users')
            .select('id, email')
            .eq('email', email)
            .single();
        
        if (existingUser) {
            return existingUser;
        }
        
        // Create new user (without auth, just email-based)
        // Note: For full auth, use Supabase Auth. This is a simplified version.
        const { data: newUser, error: createError } = await supabaseClient
            .from('users')
            .insert([{ email: email }])
            .select()
            .single();
        
        if (createError) {
            console.error('Error creating user:', createError);
            return null;
        }
        
        return newUser;
    } catch (error) {
        console.error('Error in getOrCreateUser:', error);
        return null;
    }
}

// Save test result to Supabase
async function saveTestResultToSupabase(result) {
    if (!isSupabaseReady || !supabaseClient) {
        // Fallback to localStorage
        return saveToLocalStorage('testHistory', result);
    }
    
    const userEmail = window.getUserEmail ? window.getUserEmail() : null;
    if (!userEmail) {
        console.warn('No user email, saving to localStorage only');
        return saveToLocalStorage('testHistory', result);
    }
    
    try {
        const user = await getOrCreateUser(userEmail);
        if (!user) {
            console.warn('Could not get/create user, saving to localStorage');
            return saveToLocalStorage('testHistory', result);
        }
        
        const { data, error } = await supabaseClient
            .from('test_results')
            .insert([{
                user_id: user.id,
                test_type: result.type,
                test_name: result.name,
                score: result.score,
                level: result.level,
                decimal_acuity: result.decimalAcuity,
                accuracy_rating: result.accuracyRating,
                test_distance: result.testDistance || result.testDistanceMeters,
                lidar_calibrated: result.lidarCalibrated || false,
                stability_score: result.stabilityScore,
                screen_calibration: result.screenCalibration,
                eye: result.eye,
                note: result.note,
                result_data: result
            }])
            .select()
            .single();
        
        if (error) {
            console.error('Error saving test result to Supabase:', error);
            // Fallback to localStorage
            return saveToLocalStorage('testHistory', result);
        }
        
        // Also save to localStorage as backup
        saveToLocalStorage('testHistory', result);
        
        console.log('✅ Test result saved to Supabase:', data.id);
        return data;
    } catch (error) {
        console.error('Error in saveTestResultToSupabase:', error);
        // Fallback to localStorage
        return saveToLocalStorage('testHistory', result);
    }
}

// Get test results from Supabase
async function getTestResultsFromSupabase() {
    if (!isSupabaseReady || !supabaseClient) {
        // Fallback to localStorage
        return getFromLocalStorage('testHistory', []);
    }
    
    const userEmail = window.getUserEmail ? window.getUserEmail() : null;
    if (!userEmail) {
        return getFromLocalStorage('testHistory', []);
    }
    
    try {
        const user = await getOrCreateUser(userEmail);
        if (!user) {
            return getFromLocalStorage('testHistory', []);
        }
        
        const { data, error } = await supabaseClient
            .from('test_results')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching test results:', error);
            return getFromLocalStorage('testHistory', []);
        }
        
        // Merge with localStorage (in case of offline data)
        const localResults = getFromLocalStorage('testHistory', []);
        const merged = [...(data || []), ...localResults];
        
        // Remove duplicates based on date
        const unique = merged.filter((result, index, self) =>
            index === self.findIndex(r => 
                r.date === result.date && 
                r.test_type === result.test_type
            )
        );
        
        return unique;
    } catch (error) {
        console.error('Error in getTestResultsFromSupabase:', error);
        return getFromLocalStorage('testHistory', []);
    }
}

// Save shopping cart to Supabase
async function saveCartToSupabase(cartItems) {
    if (!isSupabaseReady || !supabaseClient) {
        return saveToLocalStorage('shoppingCart', cartItems);
    }
    
    const userEmail = window.getUserEmail ? window.getUserEmail() : null;
    if (!userEmail) {
        return saveToLocalStorage('shoppingCart', cartItems);
    }
    
    try {
        const user = await getOrCreateUser(userEmail);
        if (!user) {
            return saveToLocalStorage('shoppingCart', cartItems);
        }
        
        // Delete existing cart items
        await supabaseClient
            .from('shopping_cart')
            .delete()
            .eq('user_id', user.id);
        
        // Insert new cart items
        if (cartItems.length > 0) {
            const cartData = cartItems.map(item => ({
                user_id: user.id,
                product_id: item.productId || item.id,
                product_name: item.name,
                retailer: item.retailer,
                price: item.price,
                image: item.image,
                quantity: item.quantity || 1,
                size: item.size,
                color: item.color,
                strength: item.strength
            }));
            
            const { error } = await supabaseClient
                .from('shopping_cart')
                .insert(cartData);
            
            if (error) {
                console.error('Error saving cart to Supabase:', error);
                return saveToLocalStorage('shoppingCart', cartItems);
            }
        }
        
        // Also save to localStorage as backup
        saveToLocalStorage('shoppingCart', cartItems);
        
        return true;
    } catch (error) {
        console.error('Error in saveCartToSupabase:', error);
        return saveToLocalStorage('shoppingCart', cartItems);
    }
}

// Get shopping cart from Supabase
async function getCartFromSupabase() {
    if (!isSupabaseReady || !supabaseClient) {
        return getFromLocalStorage('shoppingCart', []);
    }
    
    const userEmail = window.getUserEmail ? window.getUserEmail() : null;
    if (!userEmail) {
        return getFromLocalStorage('shoppingCart', []);
    }
    
    try {
        const user = await getOrCreateUser(userEmail);
        if (!user) {
            return getFromLocalStorage('shoppingCart', []);
        }
        
        const { data, error } = await supabaseClient
            .from('shopping_cart')
            .select('*')
            .eq('user_id', user.id);
        
        if (error) {
            console.error('Error fetching cart:', error);
            return getFromLocalStorage('shoppingCart', []);
        }
        
        // Convert to cart format
        const cartItems = (data || []).map(item => ({
            id: item.id,
            productId: item.product_id,
            name: item.product_name,
            retailer: item.retailer,
            price: parseFloat(item.price),
            image: item.image,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            strength: item.strength
        }));
        
        // Merge with localStorage
        const localCart = getFromLocalStorage('shoppingCart', []);
        return cartItems.length > 0 ? cartItems : localCart;
    } catch (error) {
        console.error('Error in getCartFromSupabase:', error);
        return getFromLocalStorage('shoppingCart', []);
    }
}

// Save order to Supabase
async function saveOrderToSupabase(order) {
    if (!isSupabaseReady || !supabaseClient) {
        return saveToLocalStorage('spectit_orders', order, true);
    }
    
    const userEmail = window.getUserEmail ? window.getUserEmail() : null;
    if (!userEmail) {
        return saveToLocalStorage('spectit_orders', order, true);
    }
    
    try {
        const user = await getOrCreateUser(userEmail);
        if (!user) {
            return saveToLocalStorage('spectit_orders', order, true);
        }
        
        const { data, error } = await supabaseClient
            .from('orders')
            .insert([{
                user_id: user.id,
                order_number: order.orderNumber,
                items: order.items,
                subtotal: order.subtotal,
                vat: order.vat,
                total: order.total,
                status: order.status || 'pending'
            }])
            .select()
            .single();
        
        if (error) {
            console.error('Error saving order to Supabase:', error);
            return saveToLocalStorage('spectit_orders', order, true);
        }
        
        // Also save to localStorage as backup
        saveToLocalStorage('spectit_orders', order, true);
        
        return data;
    } catch (error) {
        console.error('Error in saveOrderToSupabase:', error);
        return saveToLocalStorage('spectit_orders', order, true);
    }
}

// Migrate localStorage data to Supabase
async function migrateLocalStorageToSupabase() {
    const userEmail = window.getUserEmail ? window.getUserEmail() : null;
    if (!userEmail || !isSupabaseReady) return;
    
    try {
        // Migrate test results
        const localResults = getFromLocalStorage('testHistory', []);
        if (localResults.length > 0) {
            console.log(`Migrating ${localResults.length} test results to Supabase...`);
            for (const result of localResults) {
                await saveTestResultToSupabase(result);
            }
        }
        
        // Migrate shopping cart
        const localCart = getFromLocalStorage('shoppingCart', []);
        if (localCart.length > 0) {
            console.log(`Migrating ${localCart.length} cart items to Supabase...`);
            await saveCartToSupabase(localCart);
        }
        
        console.log('✅ Migration complete');
    } catch (error) {
        console.error('Error migrating data:', error);
    }
}

// Helper functions for localStorage (fallback)
function saveToLocalStorage(key, data, isArray = false) {
    try {
        if (isArray) {
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(data);
            localStorage.setItem(key, JSON.stringify(existing));
        } else {
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(data);
            localStorage.setItem(key, JSON.stringify(existing));
        }
        return true;
    } catch (error) {
        console.error(`Error saving to localStorage (${key}):`, error);
        return false;
    }
}

function getFromLocalStorage(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage (${key}):`, error);
        return defaultValue;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeSupabaseStorage();
});

// Export functions
window.saveTestResultToSupabase = saveTestResultToSupabase;
window.getTestResultsFromSupabase = getTestResultsFromSupabase;
window.saveCartToSupabase = saveCartToSupabase;
window.getCartFromSupabase = getCartFromSupabase;
window.saveOrderToSupabase = saveOrderToSupabase;
window.isSupabaseReady = () => isSupabaseReady;

