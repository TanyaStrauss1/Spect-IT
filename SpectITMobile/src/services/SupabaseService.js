import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';

// Initialize Supabase client only if credentials are provided
let supabase = null;
const isSupabaseConfigured = SUPABASE_URL && 
  SUPABASE_URL !== 'https://your-project.supabase.co' && 
  SUPABASE_ANON_KEY && 
  SUPABASE_ANON_KEY !== 'your-anon-key';

if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } catch (error) {
    console.warn('Supabase initialization failed, using local storage only:', error);
  }
}

export class SupabaseService {
  // Save test results
  static async saveTestResult(testData) {
    try {
      // Try Supabase if configured
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('test_results')
          .insert([{
            test_type: testData.type,
            test_name: testData.name,
            results: testData.results,
            metadata: testData.metadata || {},
            user_email: testData.email,
            created_at: new Date().toISOString(),
          }])
          .select()
          .single();

        if (!error && data) return data;
      }
    } catch (error) {
      console.warn('Supabase save failed, using local storage:', error);
    }
    
    // Fallback to local storage
    try {
      const localResults = JSON.parse(await AsyncStorage.getItem('test_results') || '[]');
      const newResult = { ...testData, id: Date.now(), date: new Date().toISOString() };
      localResults.push(newResult);
      await AsyncStorage.setItem('test_results', JSON.stringify(localResults));
      return newResult;
    } catch (error) {
      console.error('Error saving to local storage:', error);
      return { id: Date.now(), ...testData };
    }
  }

  // Get test results for user
  static async getTestResults(email) {
    try {
      // Try Supabase if configured
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('test_results')
          .select('*')
          .eq('user_email', email)
          .order('created_at', { ascending: false });

        if (!error && data) return data;
      }
    } catch (error) {
      console.warn('Supabase get failed, using local storage:', error);
    }
    
    // Fallback to local storage
    try {
      const localResults = JSON.parse(await AsyncStorage.getItem('test_results') || '[]');
      if (email) {
        return localResults.filter(r => r.email === email);
      }
      return localResults;
    } catch (error) {
      console.error('Error getting from local storage:', error);
      return [];
    }
  }

  // Save user email
  static async saveUserEmail(email) {
    try {
      await AsyncStorage.setItem('user_email', email);
      
      // Optionally save to Supabase if configured
      if (supabase && isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('users')
            .upsert([{ email, updated_at: new Date().toISOString() }], {
              onConflict: 'email',
            });

          if (!error && data) return data;
        } catch (error) {
          console.warn('Supabase email save failed (using local only):', error);
        }
      }
      
      return { email };
    } catch (error) {
      console.error('Error saving user email:', error);
      return null;
    }
  }

  // Get user email
  static async getUserEmail() {
    try {
      return await AsyncStorage.getItem('user_email');
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  }
}

export default supabase;

