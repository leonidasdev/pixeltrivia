/**
 * Tests for Security Utilities
 * Testing only pure functions that don't depend on Next.js server modules
 */

// Import pure utility functions from core module (avoids Next.js server imports)
import {
  sanitizeString,
  sanitizeObject,
  buildCSP,
  CSP_DIRECTIVES,
  SECURITY_HEADERS,
  MAX_BODY_SIZES,
  ALLOWED_ORIGINS,
  REQUIRED_ENV_VARS,
} from '@/lib/security.core'

describe('Security Utilities', () => {
  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello')
    })

    it('should remove angle brackets', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
    })

    it('should remove javascript: URIs', () => {
      expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)')
    })

    it('should remove event handlers', () => {
      expect(sanitizeString('onclick=alert(1)')).toBe('alert(1)')
      expect(sanitizeString('onmouseover=evil()')).toBe('evil()')
    })

    it('should remove data: URIs', () => {
      expect(sanitizeString('data:text/html,<script>')).toBe('text/html,script')
    })

    it('should handle normal strings unchanged', () => {
      expect(sanitizeString('Hello World')).toBe('Hello World')
      expect(sanitizeString('player123')).toBe('player123')
    })

    it('should be case insensitive for dangerous patterns', () => {
      expect(sanitizeString('JAVASCRIPT:alert(1)')).toBe('alert(1)')
      expect(sanitizeString('ONCLICK=test')).toBe('test')
    })
  })

  describe('sanitizeObject', () => {
    it('should sanitize string values in objects', () => {
      const input = {
        name: '<script>evil</script>',
        score: 100,
      }
      const result = sanitizeObject(input)
      expect(result.name).toBe('scriptevil/script')
      expect(result.score).toBe(100)
    })

    it('should sanitize nested objects', () => {
      const input = {
        user: {
          name: '<script>',
          age: 25,
        },
      }
      const result = sanitizeObject(input)
      expect(result.user.name).toBe('script')
      expect(result.user.age).toBe(25)
    })

    it('should sanitize arrays of strings', () => {
      const input = {
        tags: ['<b>bold</b>', 'normal', 'javascript:alert(1)'],
      }
      const result = sanitizeObject(input)
      expect(result.tags).toEqual(['bbold/b', 'normal', 'alert(1)'])
    })

    it('should preserve non-string array items', () => {
      const input = {
        items: [1, 2, { nested: '<script>' }],
      }
      const result = sanitizeObject(input)
      expect(result.items[0]).toBe(1)
      expect(result.items[1]).toBe(2)
    })
  })

  describe('buildCSP', () => {
    it('should build CSP string from directives', () => {
      const directives = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
      }
      const result = buildCSP(directives)
      expect(result).toBe("default-src 'self'; script-src 'self' 'unsafe-inline'")
    })

    it('should build CSP from actual directives', () => {
      const csp = buildCSP(CSP_DIRECTIVES)
      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain('frame-ancestors')
    })
  })

  describe('SECURITY_HEADERS', () => {
    it('should have required security headers', () => {
      expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY')
      expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff')
      expect(SECURITY_HEADERS['X-XSS-Protection']).toBe('1; mode=block')
    })
  })

  describe('MAX_BODY_SIZES', () => {
    it('should have reasonable size limits', () => {
      expect(MAX_BODY_SIZES.small).toBe(10 * 1024) // 10KB
      expect(MAX_BODY_SIZES.medium).toBe(100 * 1024) // 100KB
      expect(MAX_BODY_SIZES.default).toBe(1 * 1024 * 1024) // 1MB
      expect(MAX_BODY_SIZES.large).toBe(5 * 1024 * 1024) // 5MB
    })
  })

  describe('ALLOWED_ORIGINS', () => {
    it('should include localhost for development', () => {
      expect(ALLOWED_ORIGINS).toContain('http://localhost:3000')
      expect(ALLOWED_ORIGINS).toContain('http://localhost:3001')
    })
  })

  describe('REQUIRED_ENV_VARS', () => {
    it('should list required env vars', () => {
      expect(REQUIRED_ENV_VARS).toContain('NEXT_PUBLIC_SUPABASE_URL')
      expect(REQUIRED_ENV_VARS).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    })
  })
})
