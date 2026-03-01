/**
 * Tests for Security Core — Branch Coverage
 *
 * Focuses on validateEnvVars, checkForExposedSecrets, isAllowedOrigin,
 * and getAllowedOrigins branches.
 *
 * @module __tests__/unit/lib/securityCore
 * @since 1.0.0
 */

describe('security.core — branch coverage', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.resetModules()
  })

  // ==========================================================================
  // validateEnvVars
  // ==========================================================================
  describe('validateEnvVars', () => {
    it('returns valid when required env vars are present', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      jest.isolateModules(() => {
        const { validateEnvVars } = require('@/lib/security.core')
        const result = validateEnvVars()
        expect(result.valid).toBe(true)
        expect(result.missing).toHaveLength(0)
      })
    })

    it('returns invalid with missing vars when env vars are absent', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      jest.isolateModules(() => {
        const { validateEnvVars } = require('@/lib/security.core')
        const result = validateEnvVars()
        expect(result.valid).toBe(false)
        expect(result.missing).toContain('NEXT_PUBLIC_SUPABASE_URL')
        expect(result.missing).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
      })
    })

    it('detects partially missing env vars', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      jest.isolateModules(() => {
        const { validateEnvVars } = require('@/lib/security.core')
        const result = validateEnvVars()
        expect(result.valid).toBe(false)
        expect(result.missing).toEqual(['NEXT_PUBLIC_SUPABASE_ANON_KEY'])
      })
    })
  })

  // ==========================================================================
  // checkForExposedSecrets
  // ==========================================================================
  describe('checkForExposedSecrets', () => {
    it('returns empty array when no secrets are exposed', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
      delete process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

      jest.isolateModules(() => {
        const { checkForExposedSecrets } = require('@/lib/security.core')
        expect(checkForExposedSecrets()).toEqual([])
      })
    })

    it('detects NEXT_PUBLIC_ prefixed server-only vars', () => {
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = 'leaked-key'
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY = 'leaked-key-2'

      jest.isolateModules(() => {
        const { checkForExposedSecrets } = require('@/lib/security.core')
        const exposed = checkForExposedSecrets()
        expect(exposed).toContain('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY')
        expect(exposed).toContain('NEXT_PUBLIC_OPENROUTER_API_KEY')
      })
    })

    it('detects single exposed secret', () => {
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = 'leaked'
      delete process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

      jest.isolateModules(() => {
        const { checkForExposedSecrets } = require('@/lib/security.core')
        const exposed = checkForExposedSecrets()
        expect(exposed).toEqual(['NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY'])
      })
    })
  })

  // ==========================================================================
  // isAllowedOrigin
  // ==========================================================================
  describe('isAllowedOrigin', () => {
    it('returns false for null origin', () => {
      jest.isolateModules(() => {
        const { isAllowedOrigin } = require('@/lib/security.core')
        expect(isAllowedOrigin(null)).toBe(false)
      })
    })

    it('allows any origin in development mode', () => {
      // @ts-expect-error -- Jest env override

      process.env.NODE_ENV = 'development'

      jest.isolateModules(() => {
        const { isAllowedOrigin } = require('@/lib/security.core')
        expect(isAllowedOrigin('https://random-origin.com')).toBe(true)
      })
    })

    it('rejects unknown origin in production mode', () => {
      // @ts-expect-error -- Jest env override

      process.env.NODE_ENV = 'production'
      delete process.env.ALLOWED_ORIGINS

      jest.isolateModules(() => {
        const { isAllowedOrigin } = require('@/lib/security.core')
        expect(isAllowedOrigin('https://evil-site.com')).toBe(false)
      })
    })

    it('accepts localhost:3000 in production (base origin)', () => {
      // @ts-expect-error -- Jest env override

      process.env.NODE_ENV = 'production'
      delete process.env.ALLOWED_ORIGINS

      jest.isolateModules(() => {
        const { isAllowedOrigin } = require('@/lib/security.core')
        expect(isAllowedOrigin('http://localhost:3000')).toBe(true)
      })
    })
  })

  // ==========================================================================
  // ALLOWED_ORIGINS from env
  // ==========================================================================
  describe('ALLOWED_ORIGINS', () => {
    it('includes env origins when ALLOWED_ORIGINS is set', () => {
      process.env.ALLOWED_ORIGINS = 'https://pixeltrivia.com,https://www.pixeltrivia.com'

      jest.isolateModules(() => {
        const { ALLOWED_ORIGINS } = require('@/lib/security.core')
        expect(ALLOWED_ORIGINS).toContain('https://pixeltrivia.com')
        expect(ALLOWED_ORIGINS).toContain('https://www.pixeltrivia.com')
        // Still includes base origins
        expect(ALLOWED_ORIGINS).toContain('http://localhost:3000')
      })
    })

    it('only includes default origins when env is not set', () => {
      delete process.env.ALLOWED_ORIGINS

      jest.isolateModules(() => {
        const { ALLOWED_ORIGINS } = require('@/lib/security.core')
        expect(ALLOWED_ORIGINS).toEqual(['http://localhost:3000', 'http://localhost:3001'])
      })
    })

    it('filters empty entries from ALLOWED_ORIGINS', () => {
      process.env.ALLOWED_ORIGINS = 'https://a.com,,  ,https://b.com'

      jest.isolateModules(() => {
        const { ALLOWED_ORIGINS } = require('@/lib/security.core')
        expect(ALLOWED_ORIGINS).toContain('https://a.com')
        expect(ALLOWED_ORIGINS).toContain('https://b.com')
        expect(ALLOWED_ORIGINS).not.toContain('')
      })
    })
  })

  // ==========================================================================
  // CSP buildCSPDirectives branches
  // ==========================================================================
  describe('CSP directives', () => {
    it('includes unsafe-eval in development CSP', () => {
      // @ts-expect-error -- Jest env override

      process.env.NODE_ENV = 'development'

      jest.isolateModules(() => {
        const { CSP_DIRECTIVES } = require('@/lib/security.core')
        expect(CSP_DIRECTIVES['script-src']).toContain("'unsafe-eval'")
      })
    })

    it('excludes unsafe-eval in production CSP', () => {
      // @ts-expect-error -- Jest env override

      process.env.NODE_ENV = 'production'

      jest.isolateModules(() => {
        const { CSP_DIRECTIVES } = require('@/lib/security.core')
        expect(CSP_DIRECTIVES['script-src']).not.toContain("'unsafe-eval'")
      })
    })

    it('includes upgrade-insecure-requests in production', () => {
      // @ts-expect-error -- Jest env override

      process.env.NODE_ENV = 'production'

      jest.isolateModules(() => {
        const { CSP_DIRECTIVES } = require('@/lib/security.core')
        expect(CSP_DIRECTIVES).toHaveProperty('upgrade-insecure-requests')
      })
    })

    it('handles value-less CSP directives in buildCSP', () => {
      jest.isolateModules(() => {
        const { buildCSP } = require('@/lib/security.core')
        const csp = buildCSP({ 'upgrade-insecure-requests': [] })
        expect(csp).toBe('upgrade-insecure-requests')
      })
    })
  })
})
