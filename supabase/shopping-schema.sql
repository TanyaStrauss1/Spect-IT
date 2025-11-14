-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'frames', 'sunglasses', 'contacts'
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    emoji TEXT DEFAULT '👓',
    in_stock BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    brand TEXT,
    material TEXT, -- 'plastic', 'metal', 'acetate', etc.
    frame_type TEXT, -- 'full', 'semi-rimless', 'rimless'
    lens_type TEXT, -- 'single', 'bifocal', 'progressive'
    colors JSONB, -- Array of available colors
    sizes JSONB, -- Array of available sizes
    features JSONB, -- Array of features
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on products (public read, admin write)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view products
CREATE POLICY "Products are viewable by everyone" ON public.products
    FOR SELECT USING (true);

-- Policy: Only authenticated users can insert (for now, can be restricted to admins later)
CREATE POLICY "Authenticated users can insert products" ON public.products
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only authenticated users can update
CREATE POLICY "Authenticated users can update products" ON public.products
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL, -- Human-readable order number
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    total_amount DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_amount DECIMAL(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    shipping_address JSONB,
    billing_address JSONB,
    payment_method TEXT, -- 'stripe', 'paypal', etc.
    payment_intent_id TEXT, -- Stripe payment intent ID
    stripe_session_id TEXT, -- Stripe checkout session ID
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own orders
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own orders
CREATE POLICY "Users can insert own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own orders (for status updates)
CREATE POLICY "Users can update own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL, -- Store name in case product is deleted
    product_sku TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view order items for their orders
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Policy: Users can insert order items for their orders
CREATE POLICY "Users can insert own order items" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ============================================
-- CART TABLE (for persistent carts)
-- ============================================
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT, -- For guest carts
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on carts
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own carts
CREATE POLICY "Users can view own carts" ON public.carts
    FOR SELECT USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Policy: Users can insert their own carts
CREATE POLICY "Users can insert own carts" ON public.carts
    FOR INSERT WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

-- Policy: Users can update their own carts
CREATE POLICY "Users can update own carts" ON public.carts
    FOR UPDATE USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Policy: Users can delete their own carts
CREATE POLICY "Users can delete own carts" ON public.carts
    FOR DELETE USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON public.carts(session_id);

-- ============================================
-- FUNCTION: Generate order number
-- ============================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_order_number TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate format: ORD-YYYYMMDD-XXXXX (random 5 chars)
        new_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                           UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 5));
        
        -- Check if it exists
        SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_number = new_order_number) INTO exists_check;
        
        -- Exit loop if unique
        EXIT WHEN NOT exists_check;
    END LOOP;
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-update updated_at for products
-- ============================================
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INSERT SAMPLE PRODUCTS
-- ============================================
INSERT INTO public.products (name, description, category, price, emoji, sku, brand, material, frame_type, colors, in_stock, stock_quantity, rating, review_count) VALUES
('Classic Black Frames', 'Timeless black acetate frames perfect for everyday wear. Lightweight and durable.', 'frames', 89.99, '👓', 'FRM-BLK-001', 'Spect-IT', 'acetate', 'full', '["black", "matte black"]'::jsonb, true, 50, 4.5, 23),
('Tortoise Shell Frames', 'Vintage-inspired tortoise shell pattern. Classic style with modern comfort.', 'frames', 99.99, '👓', 'FRM-TRT-001', 'Spect-IT', 'acetate', 'full', '["tortoise", "brown tortoise", "black tortoise"]'::jsonb, true, 45, 4.7, 31),
('Modern Wire Frames', 'Sleek metal wire frames with minimalist design. Ultra-lightweight titanium construction.', 'frames', 119.99, '👓', 'FRM-WIR-001', 'Spect-IT', 'titanium', 'semi-rimless', '["silver", "gold", "gunmetal"]'::jsonb, true, 38, 4.6, 19),
('Bold Color Frames', 'Vibrant colored frames to express your personality. Available in multiple colors.', 'frames', 79.99, '👓', 'FRM-COL-001', 'Spect-IT', 'plastic', 'full', '["blue", "red", "green", "purple"]'::jsonb, true, 60, 4.4, 28),
('Aviator Sunglasses', 'Classic aviator style with UV400 protection. Polarized lenses available.', 'sunglasses', 129.99, '🕶️', 'SUN-AVI-001', 'Spect-IT', 'metal', 'full', '["black", "gold", "silver"]'::jsonb, true, 42, 4.8, 45),
('Wayfarer Sunglasses', 'Iconic wayfarer design with premium lenses. 100% UV protection.', 'sunglasses', 109.99, '🕶️', 'SUN-WAY-001', 'Spect-IT', 'acetate', 'full', '["black", "tortoise", "blue"]'::jsonb, true, 55, 4.6, 38),
('Sport Sunglasses', 'Lightweight sport sunglasses with wraparound design. Impact resistant.', 'sunglasses', 149.99, '🕶️', 'SUN-SPT-001', 'Spect-IT', 'plastic', 'full', '["black", "blue", "red"]'::jsonb, true, 30, 4.5, 22),
('Daily Contact Lenses', 'Comfortable daily disposable contact lenses. 30-day supply.', 'contacts', 49.99, '🔵', 'CNT-DLY-001', 'Spect-IT', NULL, NULL, '["clear"]'::jsonb, true, 100, 4.7, 67),
('Monthly Contact Lenses', 'Extended wear monthly contact lenses. 6-month supply.', 'contacts', 89.99, '🔵', 'CNT-MTH-001', 'Spect-IT', NULL, NULL, '["clear"]'::jsonb, true, 80, 4.6, 52),
('Toric Contact Lenses', 'Specialty toric lenses for astigmatism. 30-day supply.', 'contacts', 79.99, '🔵', 'CNT-TOR-001', 'Spect-IT', NULL, NULL, '["clear"]'::jsonb, true, 40, 4.8, 34)
ON CONFLICT (sku) DO NOTHING;

