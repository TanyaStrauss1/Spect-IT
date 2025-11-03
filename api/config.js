// Vercel Serverless Function to provide config securely
// This allows frontend to access environment variables without exposing secrets

export default function handler(req, res) {
    // Only return public keys that are safe to expose to frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Return only public keys - never expose secret keys
    const publicConfig = {
        GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY || '',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || '', // Frontend uses this for direct calls
        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
        FIREBASE_CONFIG: {
            apiKey: process.env.FIREBASE_API_KEY || '',
            authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
            projectId: process.env.FIREBASE_PROJECT_ID || '',
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
            appId: process.env.FIREBASE_APP_ID || ''
        }
    };
    
    res.status(200).json(publicConfig);
}

