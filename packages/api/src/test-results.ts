/**
 * Shared API functions for test results
 * Used by both web and mobile apps
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface TestResult {
  id?: number
  user_id: string
  test_type: string
  test_name: string
  test_data: any
  score: number
  decimal_acuity?: number
  test_date: string
  test_distance?: number
  created_at?: string
}

export interface TestResultFilters {
  userId: string
  testType?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

/**
 * Save a test result to the database
 */
export async function saveTestResult(
  supabase: SupabaseClient,
  result: Omit<TestResult, 'id' | 'created_at'>
) {
  const { data, error } = await supabase
    .from('test_results')
    .insert(result)
    .select()
    .single()

  if (error) {
    console.error('Error saving test result:', error)
    throw error
  }

  return data
}

/**
 * Get test results for a user with optional filters
 */
export async function getTestResults(
  supabase: SupabaseClient,
  filters: TestResultFilters
) {
  let query = supabase
    .from('test_results')
    .select('*')
    .eq('user_id', filters.userId)
    .order('created_at', { ascending: false })

  if (filters.testType) {
    query = query.eq('test_type', filters.testType)
  }

  if (filters.startDate) {
    query = query.gte('test_date', filters.startDate)
  }

  if (filters.endDate) {
    query = query.lte('test_date', filters.endDate)
  }

  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching test results:', error)
    throw error
  }

  return data
}

/**
 * Get a single test result by ID
 */
export async function getTestResult(
  supabase: SupabaseClient,
  resultId: number
) {
  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    .eq('id', resultId)
    .single()

  if (error) {
    console.error('Error fetching test result:', error)
    throw error
  }

  return data
}

/**
 * Delete a test result
 */
export async function deleteTestResult(
  supabase: SupabaseClient,
  resultId: number
) {
  const { error } = await supabase
    .from('test_results')
    .delete()
    .eq('id', resultId)

  if (error) {
    console.error('Error deleting test result:', error)
    throw error
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from('test_results')
    .select('test_type, score, decimal_acuity, test_date')
    .eq('user_id', userId)
    .order('test_date', { ascending: false })

  if (error) {
    console.error('Error fetching user stats:', error)
    throw error
  }

  const totalTests = data.length
  const testsByType = data.reduce((acc, result) => {
    acc[result.test_type] = (acc[result.test_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const latestTest = data[0]

  return {
    totalTests,
    testsByType,
    latestTest,
  }
}
