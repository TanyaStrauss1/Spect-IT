// Shopping Service - Handles products, cart, and orders
// Integrates with Supabase for real shopping functionality

const ShoppingService = {
    // ========== PRODUCTS ==========
    
    async getProducts(category = null) {
        try {
            if (!window.SupabaseClient || !window.SupabaseClient.supabase) {
                // Fallback to local products
                return this.getLocalProducts(category);
            }
            
            let query = window.SupabaseClient.supabase
                .from('products')
                .select('*')
                .eq('in_stock', true)
                .order('created_at', { ascending: false });
            
            if (category) {
                query = query.eq('category', category);
            }
            
            const { data, error } = await query;
            
            if (error) {
                console.error('Error fetching products:', error);
                return this.getLocalProducts(category);
            }
            
            return data || [];
        } catch (error) {
            console.error('Error in getProducts:', error);
            return this.getLocalProducts(category);
        }
    },
    
    async getProductById(productId) {
        try {
            if (!window.SupabaseClient || !window.SupabaseClient.supabase) {
                return null;
            }
            
            const { data, error } = await window.SupabaseClient.supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();
            
            if (error) {
                console.error('Error fetching product:', error);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Error in getProductById:', error);
            return null;
        }
    },
    
    getLocalProducts(category = null) {
        // Fallback product data
        const allProducts = [
            { id: 1, name: 'Classic Black Frames', price: 89.99, emoji: '👓', category: 'frames', description: 'Timeless black acetate frames', in_stock: true },
            { id: 2, name: 'Tortoise Shell Frames', price: 99.99, emoji: '👓', category: 'frames', description: 'Vintage-inspired tortoise shell', in_stock: true },
            { id: 3, name: 'Modern Wire Frames', price: 119.99, emoji: '👓', category: 'frames', description: 'Sleek metal wire frames', in_stock: true },
            { id: 4, name: 'Bold Color Frames', price: 79.99, emoji: '👓', category: 'frames', description: 'Vibrant colored frames', in_stock: true },
            { id: 5, name: 'Aviator Sunglasses', price: 129.99, emoji: '🕶️', category: 'sunglasses', description: 'Classic aviator style', in_stock: true },
            { id: 6, name: 'Wayfarer Sunglasses', price: 109.99, emoji: '🕶️', category: 'sunglasses', description: 'Iconic wayfarer design', in_stock: true },
            { id: 7, name: 'Daily Contact Lenses', price: 49.99, emoji: '🔵', category: 'contacts', description: '30-day supply', in_stock: true },
            { id: 8, name: 'Monthly Contact Lenses', price: 89.99, emoji: '🔵', category: 'contacts', description: '6-month supply', in_stock: true }
        ];
        
        if (category) {
            return allProducts.filter(p => p.category === category);
        }
        return allProducts;
    },
    
    // ========== CART ==========
    
    async getCart() {
        try {
            const user = await window.SupabaseClient?.getUser();
            const sessionId = this.getSessionId();
            
            if (user && window.SupabaseClient?.supabase) {
                // Get user cart from Supabase
                const { data, error } = await window.SupabaseClient.supabase
                    .from('carts')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();
                
                if (!error && data) {
                    return data.items || [];
                }
            } else if (sessionId && window.SupabaseClient?.supabase) {
                // Get guest cart from Supabase
                const { data, error } = await window.SupabaseClient.supabase
                    .from('carts')
                    .select('*')
                    .eq('session_id', sessionId)
                    .maybeSingle();
                
                if (!error && data) {
                    return data.items || [];
                }
            }
            
            // Fallback to localStorage
            return this.getLocalCart();
        } catch (error) {
            console.error('Error getting cart:', error);
            return this.getLocalCart();
        }
    },
    
    async saveCart(items) {
        try {
            const user = await window.SupabaseClient?.getUser();
            const sessionId = this.getSessionId();
            
            if (window.SupabaseClient?.supabase) {
                if (user) {
                    // Upsert user cart
                    const { error } = await window.SupabaseClient.supabase
                        .from('carts')
                        .upsert({
                            user_id: user.id,
                            items: items,
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'user_id'
                        });
                    
                    if (error) {
                        console.error('Error saving cart:', error);
                    }
                } else if (sessionId) {
                    // Upsert guest cart
                    const { error } = await window.SupabaseClient.supabase
                        .from('carts')
                        .upsert({
                            session_id: sessionId,
                            items: items,
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'session_id'
                        });
                    
                    if (error) {
                        console.error('Error saving cart:', error);
                    }
                }
            }
            
            // Always save to localStorage as backup
            localStorage.setItem('spectit_cart', JSON.stringify(items));
        } catch (error) {
            console.error('Error saving cart:', error);
            localStorage.setItem('spectit_cart', JSON.stringify(items));
        }
    },
    
    getLocalCart() {
        const saved = localStorage.getItem('spectit_cart');
        return saved ? JSON.parse(saved) : [];
    },
    
    getSessionId() {
        let sessionId = sessionStorage.getItem('spectit_session_id');
        if (!sessionId) {
            sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('spectit_session_id', sessionId);
        }
        return sessionId;
    },
    
    // ========== ORDERS ==========
    
    async createOrder(cartItems, shippingAddress, billingAddress) {
        try {
            const user = await window.SupabaseClient?.getUser();
            
            if (!window.SupabaseClient?.supabase) {
                throw new Error('Supabase not available');
            }
            
            // Calculate totals
            const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const taxAmount = subtotal * 0.08; // 8% tax (adjust as needed)
            const shippingAmount = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
            const totalAmount = subtotal + taxAmount + shippingAmount;
            
            // Generate order number
            const orderNumber = 'ORD-' + new Date().toISOString().slice(0,10).replace(/-/g, '') + '-' + 
                               Math.random().toString(36).substr(2, 5).toUpperCase();
            
            // Create order
            const { data: order, error: orderErr } = await window.SupabaseClient.supabase
                .from('orders')
                .insert({
                    user_id: user?.id || null,
                    order_number: orderNumber,
                    status: 'pending',
                    total_amount: totalAmount,
                    subtotal: subtotal,
                    tax_amount: taxAmount,
                    shipping_amount: shippingAmount,
                    currency: 'USD',
                    shipping_address: shippingAddress,
                    billing_address: billingAddress || shippingAddress
                })
                .select()
                .single();
            
            if (orderErr) {
                throw orderErr;
            }
            
            // Create order items
            const orderItems = cartItems.map(item => ({
                order_id: order.id,
                product_id: item.product_id || null,
                product_name: item.name,
                product_sku: item.sku || null,
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.price * item.quantity
            }));
            
            const { error: itemsError } = await window.SupabaseClient.supabase
                .from('order_items')
                .insert(orderItems);
            
            if (itemsError) {
                throw itemsError;
            }
            
            return order;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },
    
    async getOrders() {
        try {
            const user = await window.SupabaseClient?.getUser();
            
            if (!user || !window.SupabaseClient?.supabase) {
                return [];
            }
            
            const { data, error } = await window.SupabaseClient.supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Error fetching orders:', error);
                return [];
            }
            
            return data || [];
        } catch (error) {
            console.error('Error in getOrders:', error);
            return [];
        }
    },
    
    async updateOrderStatus(orderId, status, paymentIntentId = null, sessionId = null) {
        try {
            if (!window.SupabaseClient?.supabase) {
                return false;
            }
            
            const updateData = {
                status: status,
                updated_at: new Date().toISOString()
            };
            
            if (paymentIntentId) {
                updateData.payment_intent_id = paymentIntentId;
            }
            
            if (sessionId) {
                updateData.stripe_session_id = sessionId;
            }
            
            const { error } = await window.SupabaseClient.supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId);
            
            if (error) {
                console.error('Error updating order:', error);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error in updateOrderStatus:', error);
            return false;
        }
    }
};

// Make it globally accessible
if (typeof window !== 'undefined') {
    window.ShoppingService = ShoppingService;
}

