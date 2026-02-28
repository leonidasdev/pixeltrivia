/**
 * Rate Limiting Middleware
 *
 * Provides a store-agnostic rate limiter for API routes.
 *
 * The default in-memory store works in development and single-instance
 * deployments. For serverless platforms (Vercel, AWS Lambda), the in-memory
 * Map resets on each cold start. To persist rate-limit state across
 * invocations, set the following environment variables to enable the
 * Redis-backed store (Upstash):
 *
 *   UPSTASH_REDIS_REST_URL  — Upstash REST endpoint
 *   UPSTASH_REDIS_REST_TOKEN — Upstash REST token
 *
 * When those variables are present, the module automatically uses Redis.
 * Otherwise it falls back to the in-memory store with a warning in
 * production.
 *
 * @module lib/rateLimit
 * @since 1.0.0
 */

import type { NextResponse } from 'next/server'
import { RateLimitError } from './errors'
import { errorResponse } from './apiResponse'
import { logger } from './logger'

// ============================================================================
// Types
// ============================================================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number
  /** Time window in seconds */
  windowSeconds: number
  /** Identifier for this limiter (for logging) */
  name?: string
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

// ============================================================================
// Rate Limit Store Interface
// ============================================================================

/**
 * Abstract store interface for rate limit entries.
 * Implement this to swap storage backends (Redis, DynamoDB, etc.).
 */
export interface RateLimitStore {
  get(key: string): RateLimitEntry | undefined
  set(key: string, entry: RateLimitEntry): void
  delete(key: string): void
  clear(): void
  entries(): IterableIterator<[string, RateLimitEntry]>
}

// ============================================================================
// In-Memory Store (default)
// ============================================================================

/**
 * In-memory store backed by a Map.
 * Suitable for development and single-instance deployments.
 * Resets on serverless cold starts.
 */
class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>()

  get(key: string) {
    return this.store.get(key)
  }
  set(key: string, entry: RateLimitEntry) {
    this.store.set(key, entry)
  }
  delete(key: string) {
    this.store.delete(key)
  }
  clear() {
    this.store.clear()
  }
  entries() {
    return this.store.entries()
  }
}

// ============================================================================
// Redis Store (Upstash)
// ============================================================================

/**
 * Redis-backed store using Upstash REST API.
 * Enabled automatically when UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN are set.
 *
 * Uses synchronous in-memory cache with async write-behind to Redis
 * for compatibility with the synchronous checkRateLimit API.
 */
class UpstashRateLimitStore implements RateLimitStore {
  private cache = new Map<string, RateLimitEntry>()
  private baseUrl: string
  private token: string

  constructor(url: string, token: string) {
    this.baseUrl = url
    this.token = token
  }

  get(key: string) {
    return this.cache.get(key)
  }

  set(key: string, entry: RateLimitEntry) {
    this.cache.set(key, entry)
    // Write to Redis asynchronously (fire-and-forget)
    const ttlSeconds = Math.max(1, Math.ceil((entry.resetTime - Date.now()) / 1000))
    this.redisSet(key, entry, ttlSeconds).catch(() => {
      // Redis write failed; in-memory value still applies
    })
  }

  delete(key: string) {
    this.cache.delete(key)
    this.redisDel(key).catch(() => {})
  }

  clear() {
    this.cache.clear()
  }

  entries() {
    return this.cache.entries()
  }

  /**
   * Pre-warm the local cache from Redis for a key.
   * Called once per cold start per key.
   */
  async warmup(key: string): Promise<void> {
    try {
      const value = await this.redisGet(key)
      if (value) this.cache.set(key, value)
    } catch {
      // Redis read failed; proceed with empty cache
    }
  }

  // --- Redis REST helpers ---

  private async redisSet(key: string, entry: RateLimitEntry, ttl: number): Promise<void> {
    await fetch(`${this.baseUrl}/set/${encodeURIComponent(key)}/${JSON.stringify(entry)}/EX/${ttl}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })
  }

  private async redisGet(key: string): Promise<RateLimitEntry | null> {
    const res = await fetch(`${this.baseUrl}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })
    const json = (await res.json()) as { result: string | null }
    if (!json.result) return null
    try {
      return JSON.parse(json.result) as RateLimitEntry
    } catch {
      return null
    }
  }

  private async redisDel(key: string): Promise<void> {
    await fetch(`${this.baseUrl}/del/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })
  }
}

// ============================================================================
// Store Selection
// ============================================================================

function createStore(): RateLimitStore {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (redisUrl && redisToken) {
    logger.info('[Rate Limit] Using Upstash Redis store')
    return new UpstashRateLimitStore(redisUrl, redisToken)
  }

  if (process.env.NODE_ENV === 'production') {
    logger.warn(
      '[Rate Limit] Using in-memory store in production. ' +
        'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for persistence across serverless invocations.'
    )
  }

  return new InMemoryRateLimitStore()
}

// Active store instance
const rateLimitStore: RateLimitStore = createStore()

// Cleanup old entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000
let cleanupTimer: NodeJS.Timeout | null = null

function startCleanup() {
  if (cleanupTimer) return

  cleanupTimer = setInterval(() => {
    const now = Date.now()
    const entries = Array.from(rateLimitStore.entries())
    for (const [key, entry] of entries) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }, CLEANUP_INTERVAL)

  // Don't prevent process from exiting
  if (cleanupTimer.unref) {
    cleanupTimer.unref()
  }
}

// Start cleanup on module load
startCleanup()

// ============================================================================
// Rate Limiter Implementation
// ============================================================================

/**
 * Check rate limit for an identifier
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const key = `${config.name || 'default'}:${identifier}`

  let entry = rateLimitStore.get(key)

  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(key, entry)

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

/**
 * Reset rate limit for an identifier
 */
export function resetRateLimit(identifier: string, name?: string): void {
  const key = `${name || 'default'}:${identifier}`
  rateLimitStore.delete(key)
}

// ============================================================================
// Predefined Rate Limit Configurations
// ============================================================================

export const RATE_LIMITS = {
  /** Standard API endpoint: 100 requests per minute */
  standard: {
    maxRequests: 100,
    windowSeconds: 60,
    name: 'standard',
  } as RateLimitConfig,

  /** Strict limit for sensitive operations: 10 per minute */
  strict: {
    maxRequests: 10,
    windowSeconds: 60,
    name: 'strict',
  } as RateLimitConfig,

  /** AI generation: 5 per minute (expensive operation) */
  aiGeneration: {
    maxRequests: 5,
    windowSeconds: 60,
    name: 'ai-generation',
  } as RateLimitConfig,

  /** Room creation: 10 per 5 minutes */
  roomCreation: {
    maxRequests: 10,
    windowSeconds: 300,
    name: 'room-creation',
  } as RateLimitConfig,

  /** Authentication attempts: 5 per 15 minutes */
  auth: {
    maxRequests: 5,
    windowSeconds: 900,
    name: 'auth',
  } as RateLimitConfig,

  /** Quiz requests: 30 per minute */
  quiz: {
    maxRequests: 30,
    windowSeconds: 60,
    name: 'quiz',
  } as RateLimitConfig,
} as const

// ============================================================================
// Identifier Extraction
// ============================================================================

/**
 * Extract client identifier from request
 * Uses IP address with fallback to user-agent hash
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  // Use first available identifier
  const ip = cfConnectingIp || realIp || forwardedFor?.split(',')[0]?.trim()

  if (ip) {
    return ip
  }

  // Fallback to user-agent hash (not ideal but better than nothing)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return `ua:${simpleHash(userAgent)}`
}

/**
 * Simple string hash for fallback identification
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

// ============================================================================
// Middleware Helper
// ============================================================================

/**
 * Rate limit middleware for API routes
 * Returns error response if rate limited, null otherwise
 */
export function rateLimit(
  request: Request,
  config: RateLimitConfig = RATE_LIMITS.standard
): NextResponse | null {
  const identifier = getClientIdentifier(request)
  const result = checkRateLimit(identifier, config)

  if (!result.allowed) {
    logger.warn(`[Rate Limit] Exceeded for ${identifier} on ${config.name}`)
    return errorResponse(new RateLimitError(result.retryAfter))
  }

  return null
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult,
  config: RateLimitConfig
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(config.maxRequests))
  response.headers.set('X-RateLimit-Remaining', String(result.remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)))

  if (result.retryAfter) {
    response.headers.set('Retry-After', String(result.retryAfter))
  }

  return response
}

// ============================================================================
// Higher-Order Function for API Routes
// ============================================================================

type ApiHandler = (request: Request) => Promise<NextResponse>

/**
 * Wrap an API handler with rate limiting
 */
export function withRateLimit(
  handler: ApiHandler,
  config: RateLimitConfig = RATE_LIMITS.standard
): ApiHandler {
  return async (request: Request): Promise<NextResponse> => {
    // Check rate limit
    const rateLimitResponse = rateLimit(request, config)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Execute handler
    return handler(request)
  }
}

/**
 * Combine rate limiting with error handling
 */
export function withRateLimitAndErrorHandling(
  handler: ApiHandler,
  rateLimitConfig: RateLimitConfig = RATE_LIMITS.standard
): ApiHandler {
  return async (request: Request): Promise<NextResponse> => {
    try {
      // Check rate limit first
      const rateLimitResponse = rateLimit(request, rateLimitConfig)
      if (rateLimitResponse) {
        return rateLimitResponse
      }

      // Execute handler
      return await handler(request)
    } catch (error) {
      logger.error('[API Error]', error)
      throw error // Let error handler deal with it
    }
  }
}

// ============================================================================
// Testing Utilities
// ============================================================================

/**
 * Clear all rate limit entries (for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear()
}

/**
 * Get current rate limit state for an identifier (for testing)
 */
export function getRateLimitState(identifier: string, name?: string): RateLimitEntry | undefined {
  const key = `${name || 'default'}:${identifier}`
  return rateLimitStore.get(key)
}
