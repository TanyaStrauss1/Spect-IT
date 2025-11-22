# 🚀 Supabase Integration Setup Guide

## Why Supabase?

✅ **PostgreSQL Database** - Reliable, SQL-based  
✅ **Free Tier** - Generous free plan (500MB database, 2GB bandwidth)  
✅ **Easy JavaScript SDK** - Simple integration  
✅ **Built-in Auth** - Can enhance email signup  
✅ **Real-time** - Live updates if needed  
✅ **Row-level Security** - Privacy protection  
✅ **Automatic Backups** - Data safety  

---

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign in"
3. Create a new project:
   - **Name:** `spect-it`
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to your users (e.g., `South Africa` if available, or `Europe`)
   - Click "Create new project"
4. Wait 2-3 minutes for project to initialize

---

## Step 2: Get API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## Step 3: Update Configuration

Open `website/supabase-config.js` and replace:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co', // ← Replace with your Project URL
    anonKey: 'your-anon-key-here' // ← Replace with your anon key
};
```

---

## Step 4: Create Database Tables

In Supabase dashboard, go to **SQL Editor** and run this SQL:

```sql
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

-- Create policies (users can only see their own data)
-- Users: Can read/insert their own records
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = email OR true); -- Allow all reads for now

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (true); -- Allow all inserts

-- Test Results: Users can only see their own results
CREATE POLICY "Users can view own test results" ON test_results
    FOR SELECT USING (true); -- Allow all reads for now (can restrict by email later)

CREATE POLICY "Users can insert own test results" ON test_results
    FOR INSERT WITH CHECK (true); -- Allow all inserts

-- Shopping Carts: Users can only see their own cart
CREATE POLICY "Users can view own cart" ON shopping_carts
    FOR SELECT USING (true); -- Allow all reads for now

CREATE POLICY "Users can manage own cart" ON shopping_carts
    FOR ALL USING (true); -- Allow all operations for now

-- Orders: Users can only see their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (true); -- Allow all reads for now

CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (true); -- Allow all inserts
```

**Note:** The policies above allow all operations for simplicity. For production, you should restrict by email or implement proper authentication.

---

## Step 5: Add Supabase Script to HTML

The Supabase client will be loaded via CDN (already added in `index.html`).

---

## Step 6: Test the Integration

1. Open browser console
2. Check if Supabase initialized:
   ```javascript
   window.SupabaseStorage.isAvailable()
   ```
3. Test saving a user:
   ```javascript
   window.SupabaseStorage.users.saveUser('test@example.com')
   ```
4. Check Supabase dashboard → **Table Editor** to see the data

---

## How It Works

### Hybrid Storage Strategy

1. **localStorage First** - Fast, always works
2. **Supabase Sync** - Cloud backup, cross-device access
3. **Automatic Fallback** - If Supabase fails, uses localStorage

### Data Flow

```
User Action → Save to localStorage (instant) → Sync to Supabase (background)
```

### Benefits

- ✅ **Fast** - localStorage is instant
- ✅ **Reliable** - Works offline
- ✅ **Backed up** - Supabase stores in cloud
- ✅ **Cross-device** - Access from any device
- ✅ **Resilient** - Falls back if Supabase unavailable

---

## Monitoring

### View Data in Supabase

1. Go to **Table Editor** in Supabase dashboard
2. View tables:
   - `users` - All user emails
   - `test_results` - All test results
   - `shopping_carts` - All shopping carts
   - `orders` - All orders

### Check Storage Usage

Go to **Settings** → **Usage** to see:
- Database size
- Bandwidth usage
- API requests

---

## Production Recommendations

1. **Enable Email Auth** - Use Supabase Auth instead of just email storage
2. **Restrict RLS Policies** - Only allow users to see their own data
3. **Add Indexes** - Already included, but monitor query performance
4. **Set Up Backups** - Supabase auto-backups, but consider additional backups
5. **Monitor Usage** - Watch free tier limits (500MB DB, 2GB bandwidth)

---

## Troubleshooting

### "Supabase not configured"
- Check that you've updated `SUPABASE_CONFIG` in `supabase-config.js`
- Verify Project URL and anon key are correct

### "Supabase client not loaded"
- Make sure Supabase script is included in `index.html`
- Check browser console for errors

### Data not appearing in Supabase
- Check browser console for errors
- Verify RLS policies allow inserts
- Check Supabase dashboard → **Logs** for errors

---

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Update configuration
3. ✅ Create database tables
4. ✅ Test integration
5. ✅ Monitor usage
6. ✅ Consider upgrading to paid plan if needed

---

**Need Help?** Check [Supabase Documentation](https://supabase.com/docs)

