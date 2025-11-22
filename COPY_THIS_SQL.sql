-- ============================================
-- SPECT-IT DATABASE SCHEMA
-- Copy this entire file and paste into Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- TEST RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.test_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    test_type TEXT NOT NULL, -- 'acuity', 'color', 'astigmatism', 'prescription', etc.
    test_data JSONB NOT NULL, -- Flexible JSON storage for test-specific data
    results JSONB, -- Test results in structured format
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on test_results
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own test results
CREATE POLICY "Users can view own test results" ON public.test_results
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own test results
CREATE POLICY "Users can insert own test results" ON public.test_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own test results
CREATE POLICY "Users can update own test results" ON public.test_results
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own test results
CREATE POLICY "Users can delete own test results" ON public.test_results
    FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON public.test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_type ON public.test_results(test_type);
CREATE INDEX IF NOT EXISTS idx_test_results_created_at ON public.test_results(created_at DESC);

-- ============================================
-- PRESCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prescription_data JSONB NOT NULL, -- OD, OS, PD, etc.
    measurement_method TEXT, -- 'lidar', 'camera', 'manual'
    accuracy_score DECIMAL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on prescriptions
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own prescriptions
CREATE POLICY "Users can view own prescriptions" ON public.prescriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own prescriptions
CREATE POLICY "Users can insert own prescriptions" ON public.prescriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own prescriptions
CREATE POLICY "Users can update own prescriptions" ON public.prescriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own prescriptions
CREATE POLICY "Users can delete own prescriptions" ON public.prescriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON public.prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_created_at ON public.prescriptions(created_at DESC);

-- ============================================
-- SHARED RESULTS TABLE (for sharing with doctors)
-- ============================================
CREATE TABLE IF NOT EXISTS public.shared_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    test_result_id UUID REFERENCES public.test_results(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE NOT NULL, -- Unique token for sharing
    shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_email TEXT, -- Optional: specific email
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on shared_results
ALTER TABLE public.shared_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view shares they created
CREATE POLICY "Users can view own shares" ON public.shared_results
    FOR SELECT USING (auth.uid() = shared_by);

-- Policy: Token holders can view shared results (handled via application logic)
CREATE POLICY "Token holders can view shared results" ON public.shared_results
    FOR SELECT USING (true); -- Will be filtered by application logic

-- Index
CREATE INDEX IF NOT EXISTS idx_shared_results_token ON public.shared_results(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_results_shared_by ON public.shared_results(shared_by);

-- ============================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_results_updated_at BEFORE UPDATE ON public.test_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VIEW: User test history summary
-- ============================================
CREATE OR REPLACE VIEW public.user_test_summary AS
SELECT 
    user_id,
    test_type,
    COUNT(*) as test_count,
    MAX(created_at) as last_test_date,
    MIN(created_at) as first_test_date
FROM public.test_results
GROUP BY user_id, test_type;

-- Enable RLS on view
ALTER VIEW public.user_test_summary SET (security_invoker = true);

