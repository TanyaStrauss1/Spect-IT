# 🔑 API Keys Required for Spect-IT

## ✅ Required API Keys (Minimum)

### 1. Google Places API ⭐ REQUIRED
**Purpose:** Find local optometrists, ophthalmologists, and eyewear retailers

**Where to get it:**
1. Go to https://console.cloud.google.com/
2. Sign up (free trial with $200 credit)
3. Create a new project
4. Enable these APIs:
   - "Places API"
   - "Maps JavaScript API"
5. Go to "Credentials" → "Create Credentials" → "API Key"
6. **IMPORTANT:** Restrict the key:
   - Application restrictions: HTTP referrers
   - Add your domain: `*.vercel.app` (or your custom domain)
7. Copy the API key (starts with `AIza...`)

**Cost:** Free $200/month credit (usually enough for most sites)

---

### 2. OpenAI API ⭐ REQUIRED
**Purpose:** AI-powered eye health Q&A feature

**Where to get it:**
1. Go to https://platform.openai.com/
2. Sign up for account
3. Add payment method (required, but you control usage)
4. Go to "API Keys" → "Create new secret key"
5. Copy the key (starts with `sk-...`)
6. **IMPORTANT:** Set usage limits in "Usage Limits" section

**Cost:** Pay-per-use (~$0.002 per question)

---

## 🔵 Optional API Keys

### 3. Stripe (Optional - Only if you want e-commerce)
**Purpose:** Process payments for eyewear purchases

**Required:** Only if you want users to actually purchase products

---

### 4. Firebase OR Supabase (Optional - Only if you want cloud authentication)
**Purpose:** User accounts with cloud storage

**Choose ONE:**
- **Firebase:** Google's platform
- **Supabase:** Open-source alternative (similar features)

**Neither is required** - the app works with local storage only!

---

## ❌ Do I Need Supabase?

**NO!** Supabase is completely optional.

You have two choices:

### Option A: Local Storage Only (Simplest) ✅
- ✅ Works immediately
- ✅ No additional setup needed
- ✅ User data stored in browser
- ❌ Data is lost if user clears browser

### Option B: Firebase or Supabase (For Cloud Storage) 🌐
- ✅ Data syncs across devices
- ✅ Better for production apps
- ❌ Requires additional setup
- ❌ Additional service to manage

**Recommendation:** Start with **Option A** (local storage). Add Firebase/Supabase later if needed.

---

## 📋 Minimum Setup for Deployment

To deploy Spect-IT, you ONLY need:

1. ✅ **Google Places API Key** - For finding professionals/retailers
2. ✅ **OpenAI API Key** - For AI Q&A feature

That's it! Everything else is optional.

---

## 🚀 Quick Start

1. **Get Google Places API Key** (5 minutes)
   - https://console.cloud.google.com/
   - Enable Places API
   - Create API key
   - Restrict to your domain

2. **Get OpenAI API Key** (2 minutes)
   - https://platform.openai.com/
   - Create account
   - Add payment
   - Generate key
   - Set usage limits

3. **Deploy to Vercel** (5 minutes)
   - Import repository
   - Add environment variables:
     - `GOOGLE_PLACES_API_KEY=your-key`
     - `OPENAI_API_KEY=your-key`
   - Deploy!

4. **Test** 🎉

---

## 💡 Feature Impact Without API Keys

| Feature | Without Google Places | Without OpenAI | Without Both |
|---------|---------------------|----------------|--------------|
| Vision Tests | ✅ Works | ✅ Works | ✅ Works |
| Professional Search | ❌ Uses demo data | ✅ Works | ❌ Uses demo data |
| AI Q&A | ✅ Works | ❌ Uses fallback | ❌ Uses fallback |
| Shopping | ✅ Works | ✅ Works | ✅ Works |
| Virtual Try-On | ✅ Works | ✅ Works | ✅ Works |

**Bottom line:** The app works without API keys, but some features use fallback/demo data.

---

## 🔐 Security Best Practices

1. **Never commit API keys** - Already excluded in `.gitignore`
2. **Use Vercel environment variables** - Not in code
3. **Restrict Google API keys** - Add domain restrictions
4. **Set OpenAI usage limits** - Prevent unexpected charges
5. **Monitor usage** - Check dashboards regularly

---

## ❓ FAQ

**Q: Can I deploy without API keys?**  
A: Yes! App works, but professional search and AI Q&A will use demo/fallback data.

**Q: Do I need both Google and OpenAI?**  
A: For full functionality, yes. But you can start with just Google Places API.

**Q: What about Supabase?**  
A: Not needed unless you want cloud authentication (local storage works fine).

**Q: How much will this cost?**  
A: 
- Google: Free $200/month credit (usually free)
- OpenAI: ~$0.002 per question (very cheap)
- Vercel: Free tier is generous

**Q: Can I add API keys later?**  
A: Yes! Just update environment variables in Vercel and redeploy.

---

**TL;DR:** Get Google Places + OpenAI keys. Skip Supabase unless you need cloud auth. Everything else is optional! 🚀

