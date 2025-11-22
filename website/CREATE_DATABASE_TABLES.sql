-- Spect-IT Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test Results table
CREATE TABLE IF NOT EXISTS test_results (
    id BIGSERIAL PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    test_type TEXT NOT NULL,
    test_name TEXT NOT NULL,
    test_data JSONB NOT NULL,
    score DECIMAL,
    level TEXT,
    decimal_acuity DECIMAL,
    accuracy_rating TEXT,
    test_date TIMESTAMPTZ NOT NULL,
    eye TEXT,
    lidar_calibrated BOOLEAN DEFAULT FALSE,
    test_distance DECIMAL,
    stability_score TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shopping Carts table
CREATE TABLE IF NOT EXISTS shopping_carts (
    id BIGSERIAL PRIMARY KEY,
    user_email TEXT UNIQUE NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    cart_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    order_id TEXT UNIQUE NOT NULL,
    order_data JSONB NOT NULL,
    total_amount DECIMAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_results_user_email ON test_results(user_email);
CREATE INDEX IF NOT EXISTS idx_test_results_test_date ON test_results(test_date);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - can restrict later)
-- Users: Allow all operations
CREATE POLICY IF NOT EXISTS "Users can view own data" ON users
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert own data" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update own data" ON users
    FOR UPDATE USING (true);

-- Test Results: Allow all operations
CREATE POLICY IF NOT EXISTS "Users can view own test results" ON test_results
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert own test results" ON test_results
    FOR INSERT WITH CHECK (true);

-- Shopping Carts: Allow all operations
CREATE POLICY IF NOT EXISTS "Users can view own cart" ON shopping_carts
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can manage own cart" ON shopping_carts
    FOR ALL USING (true);

-- Orders: Allow all operations
CREATE POLICY IF NOT EXISTS "Users can view own orders" ON orders
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database tables created successfully!';
    RAISE NOTICE '✅ Indexes created for performance';
    RAISE NOTICE '✅ Row Level Security enabled';
    RAISE NOTICE '✅ Policies created';
END $$;

