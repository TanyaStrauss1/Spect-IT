-- Spect-IT Optometrists Database Table
-- Run this SQL in your Supabase SQL Editor to create the optometrists table

-- Create optometrists table
CREATE TABLE IF NOT EXISTS optometrists (
    id BIGSERIAL PRIMARY KEY,
    place_id TEXT UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'optometrist', 'optician', 'ophthalmologist'
    address TEXT,
    location JSONB, -- {lat: number, lng: number}
    phone TEXT,
    email TEXT,
    website TEXT,
    rating DECIMAL DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    open_now BOOLEAN,
    licensed TEXT, -- 'yes', 'no', 'likely', 'unknown'
    license_info TEXT,
    license_verify_url TEXT,
    source TEXT, -- 'Google Places API', 'scraped', 'known database', etc.
    price_level INTEGER,
    province TEXT, -- South African province
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_optometrists_location ON optometrists USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_optometrists_type ON optometrists(type);
CREATE INDEX IF NOT EXISTS idx_optometrists_province ON optometrists(province);
CREATE INDEX IF NOT EXISTS idx_optometrists_city ON optometrists(city);
CREATE INDEX IF NOT EXISTS idx_optometrists_rating ON optometrists(rating DESC);
CREATE INDEX IF NOT EXISTS idx_optometrists_updated_at ON optometrists(updated_at DESC);

-- Enable Row Level Security (optional - adjust policies as needed)
ALTER TABLE optometrists ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (since this is public directory data)
CREATE POLICY "Public can view optometrists" ON optometrists
    FOR SELECT USING (true);

-- Policy: Only authenticated users can insert/update (adjust as needed)
-- For now, we'll allow inserts from the application
CREATE POLICY "Allow optometrist inserts" ON optometrists
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow optometrist updates" ON optometrists
    FOR UPDATE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_optometrists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER optometrists_updated_at
    BEFORE UPDATE ON optometrists
    FOR EACH ROW
    EXECUTE FUNCTION update_optometrists_updated_at();

-- Add comments for documentation
COMMENT ON TABLE optometrists IS 'Comprehensive database of optometrists, opticians, and ophthalmologists in South Africa';
COMMENT ON COLUMN optometrists.location IS 'JSONB object with lat and lng coordinates';
COMMENT ON COLUMN optometrists.licensed IS 'License status: yes, no, likely, or unknown';
COMMENT ON COLUMN optometrists.source IS 'Data source: Google Places API, web scraping, known database, etc.';

