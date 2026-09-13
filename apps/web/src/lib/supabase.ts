/**
 * Supabase Client Configuration
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface TestResult {
  id: string
  user_id: string
  test_type: string
  result_data: any
  created_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

