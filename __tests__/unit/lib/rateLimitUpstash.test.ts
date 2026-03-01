/**
 * Tests for UpstashRateLimitStore
 *
 * Tests the Redis-backed rate limit store by isolating the module
 * with UPSTASH env vars set and mocking global fetch.
 *
 * @module __tests__/unit/lib/rateLimitUpstash
 * @since 1.0.0
 */

// Mock logger before anything else
jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}))

// Mock errors and apiResponse to avoid Next.js imports
jest.mock('@/lib/errors', () => ({
  RateLimitError: class RateLimitError extends Error {
    retryAfter: number
    constructor(retryAfter?: number) {
      super('Rate limit exceeded')
      this.retryAfter = retryAfter ?? 60
    }
  },
}))

jest.mock('@/lib/apiResponse', () => ({
  errorResponse: jest.fn(() => ({ status: 429 })),
}))

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('UpstashRateLimitStore', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.resetModules()
    mockFetch.mockClear()
  })

  function loadWithUpstash() {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'

    // Need to clear timers set by module initialization
    jest.useFakeTimers()

    let mod: typeof import('@/lib/rateLimit')
    jest.isolateModules(() => {
      mod = require('@/lib/rateLimit')
    })

    jest.useRealTimers()
    return mod!
  }

  it('uses Upstash store when env vars are set', () => {
    const { logger } = require('@/lib/logger')
    loadWithUpstash()
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Upstash Redis'))
  })

  it('checkRateLimit works with Upstash store', () => {
    const { checkRateLimit } = loadWithUpstash()

    const result = checkRateLimit('test-client', {
      maxRequests: 5,
      windowSeconds: 60,
      name: 'upstash-test',
    })

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('write-behind fires async Redis SET on checkRateLimit', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ result: 'OK' }),
    })

    const { checkRateLimit } = loadWithUpstash()

    checkRateLimit('set-test-client', {
      maxRequests: 10,
      windowSeconds: 60,
      name: 'set-test',
    })

    // Allow async write-behind to fire
    await new Promise(r => setTimeout(r, 50))

    // Should have called fetch with a SET command to Upstash
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://redis.upstash.io/set/'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token' },
      })
    )
  })

  it('resetRateLimit triggers async Redis DEL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ result: 1 }),
    })

    const { checkRateLimit, resetRateLimit } = loadWithUpstash()

    // Create an entry first
    checkRateLimit('del-test', {
      maxRequests: 5,
      windowSeconds: 60,
      name: 'del-test',
    })

    mockFetch.mockClear()

    resetRateLimit('del-test', 'del-test')

    // Allow async write to fire
    await new Promise(r => setTimeout(r, 50))

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://redis.upstash.io/del/'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token' },
      })
    )
  })

  it('handles Redis SET failure gracefully (fire-and-forget)', async () => {
    mockFetch.mockRejectedValue(new Error('Redis unavailable'))

    const { checkRateLimit } = loadWithUpstash()

    // Should not throw even when Redis fails
    const result = checkRateLimit('fail-test', {
      maxRequests: 5,
      windowSeconds: 60,
      name: 'fail-test',
    })

    await new Promise(r => setTimeout(r, 50))

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('clearAllRateLimits clears local cache', () => {
    const { checkRateLimit, clearAllRateLimits, getRateLimitState } = loadWithUpstash()

    checkRateLimit('clear-test', {
      maxRequests: 5,
      windowSeconds: 60,
      name: 'clear-test',
    })

    expect(getRateLimitState('clear-test', 'clear-test')).toBeDefined()

    clearAllRateLimits()

    expect(getRateLimitState('clear-test', 'clear-test')).toBeUndefined()
  })
})

describe('InMemoryRateLimitStore (production warning)', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.resetModules()
  })

  it('warns when using in-memory store in production', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    const { logger } = require('@/lib/logger')

    jest.useFakeTimers()
    jest.isolateModules(() => {
      require('@/lib/rateLimit')
    })
    jest.useRealTimers()

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('in-memory store in production')
    )
  })
})
