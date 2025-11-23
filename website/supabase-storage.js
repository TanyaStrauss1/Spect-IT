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

// ============================================
// OPTOMETRIST DATABASE FUNCTIONS
// ============================================

// Save optometrist to Supabase database
async function saveOptometristToSupabase(optometrist) {
    if (!isSupabaseReady || !supabaseClient) {
        console.warn('Supabase not ready, skipping optometrist save');
        return null;
    }
    
    try {
        // Check if optometrist already exists (by place_id or name+address)
        const { data: existing } = await supabaseClient
            .from('optometrists')
            .select('id')
            .or(`place_id.eq.${optometrist.place_id},and(name.eq.${optometrist.name},address.eq.${optometrist.address})`)
            .limit(1)
            .single();
        
        if (existing) {
            // Update existing record
            const { data, error } = await supabaseClient
                .from('optometrists')
                .update({
                    name: optometrist.name,
                    type: optometrist.type,
                    address: optometrist.address,
                    location: optometrist.location,
                    phone: optometrist.phone || '',
                    email: optometrist.email || '',
                    website: optometrist.website || '',
                    rating: optometrist.rating || 0,
                    rating_count: optometrist.rating_count || 0,
                    open_now: optometrist.open_now,
                    licensed: optometrist.licensed || 'unknown',
                    license_info: optometrist.license_info || '',
                    license_verify_url: optometrist.license_verify_url || '',
                    source: optometrist.source || 'unknown',
                    price_level: optometrist.price_level,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } else {
            // Insert new record
            const { data, error } = await supabaseClient
                .from('optometrists')
                .insert([{
                    place_id: optometrist.place_id,
                    name: optometrist.name,
                    type: optometrist.type,
                    address: optometrist.address,
                    location: optometrist.location,
                    phone: optometrist.phone || '',
                    email: optometrist.email || '',
                    website: optometrist.website || '',
                    rating: optometrist.rating || 0,
                    rating_count: optometrist.rating_count || 0,
                    open_now: optometrist.open_now,
                    licensed: optometrist.licensed || 'unknown',
                    license_info: optometrist.license_info || '',
                    license_verify_url: optometrist.license_verify_url || '',
                    source: optometrist.source || 'unknown',
                    price_level: optometrist.price_level
                }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        }
    } catch (error) {
        console.error('Error saving optometrist to Supabase:', error);
        return null;
    }
}

// Batch save multiple optometrists
async function saveOptometristsBatchToSupabase(optometrists) {
    if (!isSupabaseReady || !supabaseClient) {
        console.warn('Supabase not ready, skipping batch save');
        return { saved: 0, failed: optometrists.length };
    }
    
    let saved = 0;
    let failed = 0;
    
    // Process in batches of 50 to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < optometrists.length; i += batchSize) {
        const batch = optometrists.slice(i, i + batchSize);
        const promises = batch.map(opt => saveOptometristToSupabase(opt));
        const results = await Promise.allSettled(promises);
        
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
                saved++;
            } else {
                failed++;
            }
        });
    }
    
    console.log(`✅ Saved ${saved} optometrists to database, ${failed} failed`);
    return { saved, failed };
}

// Get optometrists from Supabase (with location filtering)
async function getOptometristsFromSupabase(location, maxDistance = 500) {
    if (!isSupabaseReady || !supabaseClient) {
        return [];
    }
    
    try {
        // Get all optometrists (we'll filter by distance in JavaScript)
        // For large datasets, consider using PostGIS for spatial queries
        const { data, error } = await supabaseClient
            .from('optometrists')
            .select('*')
            .order('rating', { ascending: false });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            return [];
        }
        
        // Filter by distance and calculate distances
        const optometrists = data.map(opt => {
            if (opt.location && location) {
                const distance = calculateDistance(location, opt.location);
                return { ...opt, distance };
            }
            return { ...opt, distance: 999 };
        })
        .filter(opt => opt.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance);
        
        return optometrists;
    } catch (error) {
        console.error('Error fetching optometrists from Supabase:', error);
        return [];
    }
}

// Helper function to calculate distance (if not already available)
function calculateDistance(loc1, loc2) {
    if (!loc1 || !loc2 || !loc1.lat || !loc2.lat) return 999;
    
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Export functions
window.saveTestResultToSupabase = saveTestResultToSupabase;
window.getTestResultsFromSupabase = getTestResultsFromSupabase;
window.saveCartToSupabase = saveCartToSupabase;
window.getCartFromSupabase = getCartFromSupabase;
window.saveOrderToSupabase = saveOrderToSupabase;
window.isSupabaseReady = () => isSupabaseReady;
window.saveOptometristToSupabase = saveOptometristToSupabase;
window.saveOptometristsBatchToSupabase = saveOptometristsBatchToSupabase;
window.getOptometristsFromSupabase = getOptometristsFromSupabase;

