import { test, expect } from '@playwright/test'

/**
 * Smoke Tests for Spect-IT Web App
 * 
 * These tests verify the core authentication and navigation flows work.
 * They can run against localhost or any deployed environment.
 * 
 * For tests requiring authentication, you can either:
 * 1. Use fixtures/mocks (preferred when secrets aren't available)
 * 2. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.local for real tests
 */

test.describe('Smoke Tests - Unauthenticated', () => {
  test('home page loads successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check for key elements on homepage
    await expect(page.locator('h1')).toContainText('Spect-IT')
    
    // Page should load without errors
    expect(page.url()).toBe('http://localhost:3000/')
  })

  test('sign-in page renders', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Check for sign-in form elements
    await expect(page.locator('h1')).toContainText('Sign In')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('sign-up page renders', async ({ page }) => {
    await page.goto('/auth/signup')
    
    // Check for sign-up form elements
    await expect(page.locator('h1')).toContainText('Create Account')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
  })

  test('forgot-password page renders', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    
    await expect(page.locator('h1')).toContainText('Reset Password')
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('dashboard redirects to sign-in when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to sign-in page
    await page.waitForURL('**/auth/signin', { timeout: 5000 })
    expect(page.url()).toContain('/auth/signin')
  })

  test('acuity test page redirects to sign-in when unauthenticated', async ({ page }) => {
    await page.goto('/tests/acuity')
    
    // Should redirect to sign-in page
    await page.waitForURL('**/auth/signin', { timeout: 5000 })
    expect(page.url()).toContain('/auth/signin')
  })
})

test.describe('Smoke Tests - Navigation', () => {
  test('can navigate from home to sign-in', async ({ page }) => {
    await page.goto('/')
    
    // Find and click sign-in link (might be in header or hero)
    const signInLink = page.getByRole('link', { name: /sign in/i }).first()
    await signInLink.click()
    
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  test('can navigate from sign-in to sign-up', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Find and click sign-up link
    const signUpLink = page.getByRole('link', { name: /sign up/i })
    await signUpLink.click()
    
    await expect(page).toHaveURL(/\/auth\/signup/)
  })

  test('can navigate from sign-in to forgot-password', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Find and click forgot password link
    const forgotLink = page.getByRole('link', { name: /forgot password/i })
    await forgotLink.click()
    
    await expect(page).toHaveURL(/\/auth\/forgot-password/)
  })
})

test.describe('Smoke Tests - Error Handling', () => {
  test('sign-in shows error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show error message (wait for it)
    const errorMessage = page.locator('text=/error|invalid|wrong/i').first()
    await expect(errorMessage).toBeVisible({ timeout: 5000 })
  })

  test('sign-up validates password matching', async ({ page }) => {
    await page.goto('/auth/signup')
    
    // Fill in mismatched passwords
    await page.fill('input[type="email"]', 'test@example.com')
    const passwordInputs = page.locator('input[type="password"]')
    await passwordInputs.nth(0).fill('password123')
    await passwordInputs.nth(1).fill('different456')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show error about passwords not matching
    const errorMessage = page.locator('text=/passwords.*not match/i')
    await expect(errorMessage).toBeVisible({ timeout: 5000 })
  })
})

/**
 * To run these tests:
 * 
 * Local development:
 *   npm run test:e2e
 * 
 * CI mode (without starting dev server):
 *   PLAYWRIGHT_TEST_BASE_URL=https://your-app.vercel.app npx playwright test
 * 
 * For authenticated tests (optional - not implemented in this basic smoke suite):
 *   1. Create test user in Supabase
 *   2. Set credentials in .env.test.local
 *   3. Add authenticated test scenarios
 */
