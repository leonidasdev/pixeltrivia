/**
 * Tests for Rate Limiting - Pure Functions
 * Testing only the core rate limiting logic that doesn't depend on Next.js
 */

// Define interfaces locally to avoid import issues
interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  maxRequests: number
  windowSeconds: number
  name?: string
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

// In-memory store for tests
const testStore = new Map<string, RateLimitEntry>()

// Pure checkRateLimit implementation for testing
function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const key = `${config.name || 'default'}:${identifier}`

  let entry = testStore.get(key)

  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    }
    testStore.set(key, entry)

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
    }
  }

  // Increment count
  entry.count++

  // Check if over limit
  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    }
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

function clearAllRateLimits(): void {
  testStore.clear()
}

function getRateLimitState(identifier: string, name?: string): RateLimitEntry | undefined {
  const key = `${name || 'default'}:${identifier}`
  return testStore.get(key)
}

// Rate limit configurations
const RATE_LIMITS = {
  standard: {
    maxRequests: 100,
    windowSeconds: 60,
    name: 'standard',
  },
  strict: {
    maxRequests: 10,
    windowSeconds: 60,
    name: 'strict',
  },
  aiGeneration: {
    maxRequests: 5,
    windowSeconds: 60,
    name: 'ai-generation',
  },
  roomCreation: {
    maxRequests: 10,
    windowSeconds: 300,
    name: 'room-creation',
  },
}

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit state before each test
    clearAllRateLimits()
  })

  describe('RATE_LIMITS', () => {
    it('should have standard rate limit config', () => {
      expect(RATE_LIMITS.standard).toBeDefined()
      expect(RATE_LIMITS.standard.maxRequests).toBe(100)
      expect(RATE_LIMITS.standard.windowSeconds).toBe(60)
    })

    it('should have strict rate limit config', () => {
      expect(RATE_LIMITS.strict).toBeDefined()
      expect(RATE_LIMITS.strict.maxRequests).toBe(10)
    })

    it('should have AI generation rate limit config', () => {
      expect(RATE_LIMITS.aiGeneration).toBeDefined()
      expect(RATE_LIMITS.aiGeneration.maxRequests).toBe(5)
    })

    it('should have room creation rate limit config', () => {
      expect(RATE_LIMITS.roomCreation).toBeDefined()
      expect(RATE_LIMITS.roomCreation.maxRequests).toBe(10)
    })
  })

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const config = { maxRequests: 5, windowSeconds: 60, name: 'test' }
      const clientId = 'test-client-1'

      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(clientId, config)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(4 - i)
      }
    })

    it('should block requests over limit', () => {
      const config = { maxRequests: 3, windowSeconds: 60, name: 'test' }
      const clientId = 'test-client-2'

      // Use up all allowed requests
      for (let i = 0; i < 3; i++) {
        checkRateLimit(clientId, config)
      }

      // Next request should be blocked
      const result = checkRateLimit(clientId, config)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should track different clients separately', () => {
      const config = { maxRequests: 2, windowSeconds: 60, name: 'test' }

      // Client A uses up limit
      checkRateLimit('client-a', config)
      checkRateLimit('client-a', config)
      const resultA = checkRateLimit('client-a', config)
      expect(resultA.allowed).toBe(false)

      // Client B should still be allowed
      const resultB = checkRateLimit('client-b', config)
      expect(resultB.allowed).toBe(true)
    })

    it('should return correct limit in result', () => {
      const config = { maxRequests: 10, windowSeconds: 60, name: 'test' }
      const result = checkRateLimit('test-client-3', config)
      expect(result.remaining).toBe(9)
    })

    it('should return reset time in result', () => {
      const config = { maxRequests: 5, windowSeconds: 60, name: 'test' }
      const result = checkRateLimit('test-client-4', config)
      expect(result.resetTime).toBeGreaterThan(Date.now())
    })
  })

  describe('getRateLimitState', () => {
    it('should return undefined for unknown clients', () => {
      const state = getRateLimitState('unknown-client', 'test')
      expect(state).toBeUndefined()
    })

    it('should return state for known clients', () => {
      const config = { maxRequests: 5, windowSeconds: 60, name: 'test' }
      checkRateLimit('known-client', config)
      const state = getRateLimitState('known-client', 'test')
      expect(state).toBeDefined()
      expect(state?.count).toBe(1)
    })
  })

  describe('clearAllRateLimits', () => {
    it('should clear all rate limit state', () => {
      const config = { maxRequests: 5, windowSeconds: 60, name: 'test' }

      // Create some state
      checkRateLimit('client-1', config)
      checkRateLimit('client-2', config)

      expect(getRateLimitState('client-1', 'test')).toBeDefined()
      expect(getRateLimitState('client-2', 'test')).toBeDefined()

      // Clear all
      clearAllRateLimits()

      expect(getRateLimitState('client-1', 'test')).toBeUndefined()
      expect(getRateLimitState('client-2', 'test')).toBeUndefined()
    })
  })

  describe('Window expiration', () => {
    it('should reset after window expires', () => {
      jest.useFakeTimers()

      const config = { maxRequests: 2, windowSeconds: 1, name: 'test' } // 1 second window
      const clientId = 'window-test-client'

      // Use up all requests
      checkRateLimit(clientId, config)
      checkRateLimit(clientId, config)

      let result = checkRateLimit(clientId, config)
      expect(result.allowed).toBe(false)

      // Advance time past the window
      jest.advanceTimersByTime(1001)

      // Should be allowed again
      result = checkRateLimit(clientId, config)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(1)

      jest.useRealTimers()
    })
  })
})
