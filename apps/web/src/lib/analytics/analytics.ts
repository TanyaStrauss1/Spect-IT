/**
 * Advanced Analytics and Performance Monitoring
 * Privacy-first analytics with Vercel Analytics and custom events
 */

'use client'

// import { Analytics as VercelAnalytics } from '@vercel/analytics/react' // Disabled for now
// import { SpeedInsights } from '@vercel/speed-insights/next' // Disabled for now

// Custom analytics events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // Vercel Analytics
    if ((window as any).va) {
      (window as any).va('track', eventName, properties)
    }
    
    // Custom analytics (privacy-first)
    console.log('[Analytics]', eventName, properties)
    
    // Send to your analytics service if needed
    // Example: sendToAnalytics(eventName, properties)
  }
}

// Performance tracking
export const trackPerformance = (metricName: string, value: number, unit: string = 'ms') => {
  trackEvent('performance', {
    metric: metricName,
    value,
    unit,
    timestamp: Date.now(),
  })
}

// User action tracking
export const trackUserAction = (action: string, details?: Record<string, any>) => {
  trackEvent('user_action', {
    action,
    ...details,
    timestamp: Date.now(),
  })
}

// Test completion tracking
export const trackTestCompletion = (testType: string, score: number, duration: number) => {
  trackEvent('test_completed', {
    test_type: testType,
    score,
    duration,
    timestamp: Date.now(),
  })
}

export const Analytics = () => null // VercelAnalytics
export const SpeedInsights = () => null

