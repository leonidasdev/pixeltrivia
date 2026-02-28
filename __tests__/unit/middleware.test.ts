/**
 * @jest-environment node
 */

/**
 * Tests for Next.js Middleware
 *
 * @module __tests__/unit/middleware
 * @since 1.0.0
 */

import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

// Suppress console.warn from security pattern detection
const originalWarn = console.warn
beforeAll(() => {
  console.warn = jest.fn()
})
afterAll(() => {
  console.warn = originalWarn
})

/** Helper to create a NextRequest */
function createRequest(
  path: string,
  options: {
    method?: string
    headers?: Record<string, string>
    origin?: string
  } = {}
): NextRequest {
  const { method = 'GET', headers = {}, origin } = options
  const allHeaders: Record<string, string> = {
    'user-agent': 'Mozilla/5.0 Test',
    ...headers,
  }
  if (origin) {
    allHeaders['origin'] = origin
  }

  return new NextRequest(`http://localhost:3000${path}`, {
    method,
    headers: allHeaders,
  })
}

describe('Middleware', () => {
  // ============================================================================
  // Security Headers
  // ============================================================================

  describe('Security Headers', () => {
    it('should add X-Frame-Options header', () => {
      const req = createRequest('/api/test')
      const res = middleware(req)

      expect(res.headers.get('X-Frame-Options')).toBe('DENY')
    })

    it('should add X-Content-Type-Options header', () => {
      const req = createRequest('/api/test')
      const res = middleware(req)

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
    })

    it('should add X-XSS-Protection header', () => {
      const req = createRequest('/api/test')
      const res = middleware(req)

      expect(res.headers.get('X-XSS-Protection')).toBe('1; mode=block')
    })

    it('should add Referrer-Policy header', () => {
      const req = createRequest('/api/test')
      const res = middleware(req)

      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    })

    it('should add security headers to page routes', () => {
      const req = createRequest('/game/mode')
      const res = middleware(req)

      expect(res.headers.get('X-Frame-Options')).toBe('DENY')
    })
  })

  // ============================================================================
  // CORS
  // ============================================================================

  describe('CORS', () => {
    it('should add CORS headers for API routes with origin', () => {
      const req = createRequest('/api/quiz/quick', {
        method: 'POST',
        origin: 'http://localhost:3000',
      })
      const res = middleware(req)

      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')
      expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    })

    it('should not add CORS headers for non-API routes', () => {
      const req = createRequest('/game/mode', {
        origin: 'http://localhost:3000',
      })
      const res = middleware(req)

      expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
    })

    it('should handle preflight OPTIONS request with 204', () => {
      const req = createRequest('/api/quiz/quick', {
        method: 'OPTIONS',
        origin: 'http://localhost:3000',
      })
      const res = middleware(req)

      expect(res.status).toBe(204)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')
      expect(res.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type')
      expect(res.headers.get('Access-Control-Max-Age')).toBe('86400')
    })
  })

  // ============================================================================
  // Suspicious Pattern Detection
  // ============================================================================

  describe('Suspicious Pattern Detection', () => {
    // Note: NextRequest normalizes URLs (resolves ../, encodes <>) so some
    // attack patterns get sanitized before reaching the middleware regex checks.
    // We test patterns that survive URL normalization + user-agent detection.

    it('should block known malicious user agents', async () => {
      const agents = ['sqlmap/1.0', 'Nikto/2.1.6', 'Nessus/10', 'acunetix/12']

      for (const agent of agents) {
        const req = createRequest('/api/test', {
          headers: { 'user-agent': agent },
        })
        const res = middleware(req)
        expect(res.status).toBe(403)
        const body = await res.json()
        expect(body.error).toBe('Forbidden')
      }
    })

    it('should allow legitimate requests', () => {
      const req = createRequest('/api/quiz/quick', {
        method: 'POST',
        headers: { 'user-agent': 'Mozilla/5.0 Chrome/120' },
      })
      const res = middleware(req)

      expect(res.status).not.toBe(403)
    })

    it('should allow normal page requests', () => {
      const req = createRequest('/game/mode')
      const res = middleware(req)

      expect(res.status).not.toBe(403)
    })
  })

  // ============================================================================
  // Normal Flow
  // ============================================================================

  describe('Normal Request Flow', () => {
    it('should allow regular GET requests', () => {
      const req = createRequest('/api/rooms')
      const res = middleware(req)

      // NextResponse.next() returns a response to continue
      expect(res.status).toBe(200) // next() returns 200
    })

    it('should allow regular POST requests', () => {
      const req = createRequest('/api/quiz/quick', { method: 'POST' })
      const res = middleware(req)

      expect(res.status).not.toBe(403)
    })
  })
})
