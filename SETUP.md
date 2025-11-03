# 🚀 Production Setup Guide for Spect-IT

This guide will help you configure all production features in Spect-IT.

## 📋 Required API Keys

### 1. Google Places API

**Purpose:** Find local opticians, optometrists, and eyewear retailers

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Places API" and "Maps JavaScript API"
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Add the key to `config.js`:
   ```javascript
   GOOGLE_PLACES_API_KEY: 'your-actual-api-key-here'
   ```

**Billing:** Google provides $200 free credit monthly, enough for most use cases.

---

### 2. OpenAI API

**Purpose:** AI-powered eye health Q&A

**Steps:**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Add the key to `config.js`:
   ```javascript
   OPENAI_API_KEY: 'sk-your-actual-api-key-here'
   ```

**Billing:** Pay-per-use pricing. Set usage limits to control costs.

---

### 3. Stripe API (Optional - for E-commerce)

**Purpose:** Process payments for eyewear purchases

**Steps:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up or log in
3. Navigate to Developers → API keys
4. Copy your Publishable key
5. Add to `config.js`:
   ```javascript
   STRIPE_PUBLISHABLE_KEY: 'pk_test_your-key-here'
   ```
6. **Important:** You'll also need a backend server to:
   - Create checkout sessions
   - Handle webhooks
   - Process payments securely

**Backend Example (Node.js):**
```javascript
// Create checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: req.body.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: item.amount,
      },
      quantity: item.quantity,
    })),
    mode: 'payment',
    success_url: 'https://your-site.com/success',
    cancel_url: 'https://your-site.com/cancel',
  });
  res.json({ url: session.url });
});
```

---

### 4. Firebase (Optional - for User Authentication)

**Purpose:** Secure user accounts and cloud data storage

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication → Email/Password
4. Enable Firestore Database
5. Copy your config to `config.js`:
   ```javascript
   FIREBASE_CONFIG: {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     // ... rest of config
   }
   ```
6. Set `FEATURES.FIREBASE_AUTH: true` in config.js

---

## 🎯 Feature Configuration

Edit `config.js` to enable/disable features:

```javascript
FEATURES: {
    GOOGLE_PLACES: true,      // Enable Google Places search
    OPENAI_QA: true,          // Enable AI Q&A
    STRIPE_CHECKOUT: true,    // Enable e-commerce checkout
    FIREBASE_AUTH: false,     // Enable Firebase authentication
    FACE_DETECTION: true      // Enable TensorFlow.js face detection
}
```

## 📱 Testing Checklist

- [ ] Google Places API working (search for professionals)
- [ ] OpenAI Q&A responding (ask eye health questions)
- [ ] Face detection loading (check console for errors)
- [ ] Shopping cart functioning
- [ ] User accounts saving test history
- [ ] Virtual try-on working with camera

## 🔒 Security Notes

1. **Never commit API keys** - Add `config.js` to `.gitignore`
2. **Restrict API keys** - Use domain restrictions for Google APIs
3. **Use environment variables** - For production, consider using env vars
4. **HTTPS required** - Camera access requires secure connection
5. **Backend for Stripe** - Never expose secret keys in frontend

## 📚 Additional Resources

- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [TensorFlow.js Face Detection](https://github.com/tensorflow/tfjs-models/tree/master/face-landmarks-detection)

## 🐛 Troubleshooting

**Google Places not working:**
- Check API key is correct
- Verify Places API is enabled in Google Cloud Console
- Check browser console for errors

**Face detection not working:**
- Ensure TensorFlow.js libraries loaded
- Check camera permissions
- Fallback simple overlay should still work

**Stripe checkout not working:**
- Requires backend server (see setup above)
- Check Stripe dashboard for test mode
- Verify API endpoint is correct

---

**Need help?** Check the browser console for detailed error messages.

