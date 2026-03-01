/**
 * Tests for Rate Limiting Module — Actual imports
 *
 * Tests the real rateLimit.ts module exports (not duplicated pure functions).
 * Covers: checkRateLimit, resetRateLimit, RATE_LIMITS, getClientIdentifier,
 *         rateLimit middleware, clearAllRateLimits, getRateLimitState.
 */

// Must mock next/server before importing
jest.mock('next/server', () => {
  const json = jest.fn(
    (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
      status: init?.status ?? 200,
      json: async () => body,
      headers: new Map(Object.entries(init?.headers ?? {})),
    })
  )
  return { NextResponse: { json } }
})

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}))

jest.mock('@/lib/apiResponse', () => ({
  errorResponse: jest.fn((error: Error & { retryAfter?: number }) => ({
    status: 429,
    error: error.message,
    retryAfter: error.retryAfter,
  })),
}))

jest.mock('@/lib/errors', () => {
  class RateLimitError extends Error {
    retryAfter?: number
    constructor(retryAfter?: number) {
      super('Too many requests')
      this.name = 'RateLimitError'
      this.retryAfter = retryAfter
    }
  }
  return { RateLimitError }
})

import {
  checkRateLimit,
  resetRateLimit,
  RATE_LIMITS,
  getClientIdentifier,
  rateLimit,
  clearAllRateLimits,
  getRateLimitState,
} from '@/lib/rateLimit'

describe('rateLimit module', () => {
  beforeEach(() => {
    clearAllRateLimits()
  })

  // ==========================================================================
  // RATE_LIMITS configurations
  // ==========================================================================
  describe('RATE_LIMITS', () => {
    it('should have standard config: 100 requests / 60s', () => {
      expect(RATE_LIMITS.standard).toMatchObject({
        maxRequests: 100,
        windowSeconds: 60,
        name: 'standard',
      })
    })

    it('should have strict config: 10 requests / 60s', () => {
      expect(RATE_LIMITS.strict).toMatchObject({
        maxRequests: 10,
        windowSeconds: 60,
        name: 'strict',
      })
    })

    it('should have aiGeneration config: 5 requests / 60s', () => {
      expect(RATE_LIMITS.aiGeneration).toMatchObject({
        maxRequests: 5,
        windowSeconds: 60,
        name: 'ai-generation',
      })
    })

    it('should have roomCreation config: 10 requests / 300s', () => {
      expect(RATE_LIMITS.roomCreation).toMatchObject({
        maxRequests: 10,
        windowSeconds: 300,
        name: 'room-creation',
      })
    })

    it('should have auth config: 5 requests / 900s', () => {
      expect(RATE_LIMITS.auth).toMatchObject({
        maxRequests: 5,
        windowSeconds: 900,
        name: 'auth',
      })
    })

    it('should have quiz config: 30 requests / 60s', () => {
      expect(RATE_LIMITS.quiz).toMatchObject({
        maxRequests: 30,
        windowSeconds: 60,
        name: 'quiz',
      })
    })
  })

  // ==========================================================================
  // checkRateLimit
  // ==========================================================================
  describe('checkRateLimit', () => {
    const testConfig = { maxRequests: 3, windowSeconds: 60, name: 'test' }

    it('should allow first request', () => {
      const result = checkRateLimit('client-1', testConfig)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)
    })

    it('should decrement remaining on each request', () => {
      const r1 = checkRateLimit('client-dec', testConfig)
      const r2 = checkRateLimit('client-dec', testConfig)
      const r3 = checkRateLimit('client-dec', testConfig)
      expect(r1.remaining).toBe(2)
      expect(r2.remaining).toBe(1)
      expect(r3.remaining).toBe(0)
    })

    it('should block requests exceeding limit', () => {
      for (let i = 0; i < 3; i++) checkRateLimit('client-block', testConfig)
      const result = checkRateLimit('client-block', testConfig)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should track different identifiers independently', () => {
      for (let i = 0; i < 3; i++) checkRateLimit('client-a', testConfig)
      expect(checkRateLimit('client-a', testConfig).allowed).toBe(false)
      expect(checkRateLimit('client-b', testConfig).allowed).toBe(true)
    })

    it('should return a future resetTime', () => {
      const before = Date.now()
      const result = checkRateLimit('client-reset', testConfig)
      expect(result.resetTime).toBeGreaterThan(before)
    })

    it('should use default name when not specified', () => {
      const noName = { maxRequests: 5, windowSeconds: 60 }
      const result = checkRateLimit('no-name', noName)
      expect(result.allowed).toBe(true)
    })

    it('should reset after window expiry', () => {
      jest.useFakeTimers()
      const shortConfig = { maxRequests: 1, windowSeconds: 1, name: 'short' }

      checkRateLimit('expire-test', shortConfig)
      expect(checkRateLimit('expire-test', shortConfig).allowed).toBe(false)

      jest.advanceTimersByTime(1100)
      expect(checkRateLimit('expire-test', shortConfig).allowed).toBe(true)

      jest.useRealTimers()
    })
  })

  // ==========================================================================
  // resetRateLimit
  // ==========================================================================
  describe('resetRateLimit', () => {
    it('should clear rate limit for a specific identifier', () => {
      const config = { maxRequests: 1, windowSeconds: 60, name: 'reset-test' }
      checkRateLimit('resettable', config)
      expect(checkRateLimit('resettable', config).allowed).toBe(false)

      resetRateLimit('resettable', 'reset-test')
      expect(checkRateLimit('resettable', config).allowed).toBe(true)
    })

    it('should use default name when none specified', () => {
      const config = { maxRequests: 1, windowSeconds: 60 }
      checkRateLimit('default-name', config)
      resetRateLimit('default-name')
      expect(checkRateLimit('default-name', config).allowed).toBe(true)
    })
  })

  // ==========================================================================
  // getRateLimitState / clearAllRateLimits
  // ==========================================================================
  describe('getRateLimitState', () => {
    it('should return undefined for unknown identifiers', () => {
      expect(getRateLimitState('ghost', 'test')).toBeUndefined()
    })

    it('should return entry after a request', () => {
      const config = { maxRequests: 5, windowSeconds: 60, name: 'state-test' }
      checkRateLimit('state-client', config)
      const state = getRateLimitState('state-client', 'state-test')
      expect(state).toBeDefined()
      expect(state!.count).toBe(1)
      expect(state!.resetTime).toBeGreaterThan(Date.now() - 1000)
    })
  })

  describe('clearAllRateLimits', () => {
    it('should remove all stored entries', () => {
      const config = { maxRequests: 5, windowSeconds: 60, name: 'clear-test' }
      checkRateLimit('c1', config)
      checkRateLimit('c2', config)

      clearAllRateLimits()

      expect(getRateLimitState('c1', 'clear-test')).toBeUndefined()
      expect(getRateLimitState('c2', 'clear-test')).toBeUndefined()
    })
  })

  // ==========================================================================
  // getClientIdentifier
  // ==========================================================================
  describe('getClientIdentifier', () => {
    function makeRequest(headers: Record<string, string> = {}): Request {
      return {
        headers: {
          get: (name: string) => headers[name.toLowerCase()] ?? null,
        },
      } as unknown as Request
    }

    it('should use cf-connecting-ip when available', () => {
      const req = makeRequest({ 'cf-connecting-ip': '1.2.3.4' })
      expect(getClientIdentifier(req)).toBe('1.2.3.4')
    })

    it('should use x-real-ip when available', () => {
      const req = makeRequest({ 'x-real-ip': '5.6.7.8' })
      expect(getClientIdentifier(req)).toBe('5.6.7.8')
    })

    it('should use x-forwarded-for (first IP)', () => {
      const req = makeRequest({ 'x-forwarded-for': '10.0.0.1, 10.0.0.2' })
      expect(getClientIdentifier(req)).toBe('10.0.0.1')
    })

    it('should prefer cf-connecting-ip over x-real-ip', () => {
      const req = makeRequest({
        'cf-connecting-ip': '1.1.1.1',
        'x-real-ip': '2.2.2.2',
      })
      expect(getClientIdentifier(req)).toBe('1.1.1.1')
    })

    it('should fall back to user-agent hash when no IP headers', () => {
      const req = makeRequest({ 'user-agent': 'TestBrowser/1.0' })
      const id = getClientIdentifier(req)
      expect(id).toMatch(/^ua:/)
    })

    it('should handle missing user-agent gracefully', () => {
      const req = makeRequest({})
      const id = getClientIdentifier(req)
      expect(id).toMatch(/^ua:/)
    })

    it('should return consistent hash for same user-agent', () => {
      const req1 = makeRequest({ 'user-agent': 'Consistent/1.0' })
      const req2 = makeRequest({ 'user-agent': 'Consistent/1.0' })
      expect(getClientIdentifier(req1)).toBe(getClientIdentifier(req2))
    })
  })

  // ==========================================================================
  // rateLimit middleware
  // ==========================================================================
  describe('rateLimit (middleware)', () => {
    function makeRequest(ip: string = '127.0.0.1'): Request {
      return {
        headers: {
          get: (name: string) => {
            if (name.toLowerCase() === 'x-forwarded-for') return ip
            return null
          },
        },
      } as unknown as Request
    }

    it('should return null when under limit', () => {
      const req = makeRequest('10.0.0.100')
      const result = rateLimit(req, { maxRequests: 100, windowSeconds: 60, name: 'mw-test' })
      expect(result).toBeNull()
    })

    it('should return error response when over limit', () => {
      const config = { maxRequests: 1, windowSeconds: 60, name: 'mw-block' }
      const req = makeRequest('10.0.0.200')

      rateLimit(req, config)
      const result = rateLimit(req, config)
      expect(result).not.toBeNull()
      expect((result as any).status).toBe(429)
    })

    it('should use standard config by default', () => {
      const req = makeRequest('10.0.0.201')
      // Should not throw, uses RATE_LIMITS.standard internally
      const result = rateLimit(req)
      expect(result).toBeNull()
    })
  })
})
