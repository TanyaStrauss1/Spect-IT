/**
 * Advanced Rate Limiting
 * Prevents abuse and ensures fair usage
 */

interface RateLimitOptions {
  maxRequests: number
  windowMs: number
  keyGenerator?: (req: Request) => string
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private maxRequests: number
  private windowMs: number
  private keyGenerator: (req: Request) => string

  constructor(options: RateLimitOptions) {
    this.maxRequests = options.maxRequests
    this.windowMs = options.windowMs
    this.keyGenerator = options.keyGenerator || ((req) => {
      // Default: use IP address
      return req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown'
    })
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(
        (ts) => now - ts < this.windowMs
      )
      if (validTimestamps.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, validTimestamps)
      }
    }
  }

  check(req: Request): { allowed: boolean; remaining: number; reset: number } {
    this.cleanup()
    
    const key = this.keyGenerator(req)
    const now = Date.now()
    const timestamps = this.requests.get(key) || []
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(
      (ts) => now - ts < this.windowMs
    )
    
    const remaining = Math.max(0, this.maxRequests - validTimestamps.length)
    const allowed = remaining > 0
    
    if (allowed) {
      validTimestamps.push(now)
      this.requests.set(key, validTimestamps)
    }
    
    const reset = now + this.windowMs
    
    return { allowed, remaining, reset }
  }
}

// Create rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter({
  maxRequests: 100, // 100 requests
  windowMs: 60 * 1000, // per minute
})

export const testRateLimiter = new RateLimiter({
  maxRequests: 10, // 10 tests
  windowMs: 60 * 1000, // per minute
})

export const authRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 attempts
  windowMs: 15 * 60 * 1000, // per 15 minutes
})

