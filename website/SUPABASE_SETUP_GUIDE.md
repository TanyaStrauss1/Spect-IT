# 🚀 Supabase Setup Guide for Spect-IT

## Why Supabase?

✅ **PostgreSQL Database** - Robust, SQL-based, production-ready  
✅ **Real-time Features** - Live updates across devices  
✅ **Built-in Authentication** - Secure user management  
✅ **Free Tier** - Generous free plan for startups  
✅ **Easy Integration** - Simple JavaScript SDK  
✅ **Automatic Backups** - Data safety built-in  
✅ **Scalable** - Grows with your needs  

---

## Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Create a new project:
   - **Name:** `spect-it`
   - **Database Password:** (save this securely!)
   - **Region:** Choose closest to your users
   - Click "Create new project"

---

## Step 2: Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

---

## Step 3: Configure Environment Variables

### Option A: Environment Variables (Recommended for Production)

Create a `.env` file in the `website` directory:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Option B: Direct Configuration (Quick Start)

Edit `website/supabase-config.js`:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxx.supabase.co',  // Your Project URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // Your anon key
};
```

---

## Step 4: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the SQL from `supabase-config.js` (the commented schema)
4. Click "Run" to create all tables

**Or use the SQL Editor to run this:**

```sql
-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test Results table
CREATE TABLE IF NOT EXISTS public.test_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    test_type TEXT NOT NULL,
    test_name TEXT NOT NULL,
    score NUMERIC,
    level TEXT,
    decimal_acuity NUMERIC,
    accuracy_rating TEXT,
    test_distance NUMERIC,
    lidar_calibrated BOOLEAN DEFAULT false,
    stability_score TEXT,
    screen_calibration JSONB,
    eye TEXT,
    note TEXT,
    result_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping Cart table
CREATE TABLE IF NOT EXISTS public.shopping_cart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    retailer TEXT,
    price NUMERIC NOT NULL,
    image TEXT,
    quantity INTEGER DEFAULT 1,
    size TEXT,
    color TEXT,
    strength TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    vat NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON public.test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_created_at ON public.test_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_user_id ON public.shopping_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
```

---

## Step 5: Enable Row Level Security (RLS)

The SQL above includes RLS policies, but you need to enable them:

1. Go to **Authentication** → **Policies**
2. For each table (`users`, `test_results`, `shopping_cart`, `orders`):
   - Enable Row Level Security
   - The policies from the SQL will automatically apply

**Or run this SQL:**

```sql
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplified - allows all for now, can be restricted later)
CREATE POLICY "Allow all for users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all for test_results" ON public.test_results FOR ALL USING (true);
CREATE POLICY "Allow all for shopping_cart" ON public.shopping_cart FOR ALL USING (true);
CREATE POLICY "Allow all for orders" ON public.orders FOR ALL USING (true);
```

**Note:** For production, implement proper user-based RLS policies.

---

## Step 6: Test the Integration

1. Open your website: `https://www.spect-it.com`
2. Open browser console (F12)
3. Sign in with email
4. Take a test
5. Check Supabase dashboard → **Table Editor** → `test_results`
6. You should see your test result!

---

## Step 7: Verify Data Sync

### Check Test Results:
```javascript
// In browser console
window.getTestResultsFromSupabase().then(results => console.log(results));
```

### Check Shopping Cart:
```javascript
window.getCartFromSupabase().then(cart => console.log(cart));
```

---

## Features Enabled

✅ **Automatic Sync** - Data saved to Supabase + localStorage (backup)  
✅ **Offline Support** - Falls back to localStorage if Supabase unavailable  
✅ **Data Migration** - Existing localStorage data migrates to Supabase  
✅ **Cross-Device** - Access data from any device (when using same email)  
✅ **Backup** - Data stored in cloud, not just browser  

---

## Monitoring

### View Data in Supabase:
1. Go to **Table Editor** in Supabase dashboard
2. Select table (`test_results`, `shopping_cart`, `orders`)
3. View all data in real-time

### View Logs:
1. Go to **Logs** in Supabase dashboard
2. See all database queries and errors

---

## Production Considerations

### 1. Enable Authentication
- Use Supabase Auth instead of email-only
- More secure user management
- Password reset, email verification

### 2. Implement Proper RLS
- Restrict access to user's own data only
- More secure policies

### 3. Add Backups
- Supabase automatically backs up, but set up additional backups
- Export data regularly

### 4. Monitor Usage
- Check Supabase dashboard for usage
- Upgrade plan if needed

---

## Troubleshooting

### "Supabase not initialized"
- Check that `supabase-config.js` has correct URL and key
- Check browser console for errors
- Verify Supabase project is active

### "Error saving to Supabase"
- Check RLS policies are set correctly
- Verify tables exist
- Check browser console for detailed errors

### Data not syncing
- Check network connection
- Verify Supabase credentials
- Check browser console for errors
- Data will fallback to localStorage

---

## Support

- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
- Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)
- Supabase GitHub: [https://github.com/supabase/supabase](https://github.com/supabase/supabase)

---

## Next Steps

1. ✅ Set up Supabase account
2. ✅ Configure credentials
3. ✅ Create database tables
4. ✅ Test integration
5. ✅ Monitor data sync
6. 🔄 Consider enabling Supabase Auth for better security
7. 🔄 Implement proper RLS policies
8. 🔄 Set up automated backups

