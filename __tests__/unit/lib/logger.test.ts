/**
 * Tests for Logger Utility
 *
 * @module __tests__/unit/lib/logger
 * @since 1.0.0
 */

/* eslint-disable @typescript-eslint/no-var-requires */

// We need to test the logger with different NODE_ENV values, so we use
// jest.isolateModules to re-import with fresh module state.

describe('Logger', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    // @ts-expect-error - NODE_ENV is typed as readonly but we need to override for testing
    process.env.NODE_ENV = originalEnv
    jest.restoreAllMocks()
  })

  // ============================================================================
  // In test environment (default) — logs should be suppressed
  // ============================================================================

  describe('in test environment (suppressed)', () => {
    it('should suppress all log levels in test env', () => {
      // In the test env, shouldLog returns false, so no console calls
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation()
      const infoSpy = jest.spyOn(console, 'info').mockImplementation()
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
      const errorSpy = jest.spyOn(console, 'error').mockImplementation()

      // Import fresh to ensure test env is set
      jest.isolateModules(() => {
        const { logger } = require('@/lib/logger')
        logger.debug('test debug')
        logger.info('test info')
        logger.warn('test warn')
        logger.error('test error')
      })

      expect(consoleSpy).not.toHaveBeenCalled()
      expect(infoSpy).not.toHaveBeenCalled()
      expect(warnSpy).not.toHaveBeenCalled()
      expect(errorSpy).not.toHaveBeenCalled()
    })
  })

  // ============================================================================
  // In development environment — all levels should log
  // ============================================================================

  describe('in development environment', () => {
    beforeEach(() => {
      // @ts-expect-error - override NODE_ENV for testing
      process.env.NODE_ENV = 'development'
    })

    it('should log debug messages', () => {
      const spy = jest.spyOn(console, 'debug').mockImplementation()

      jest.isolateModules(() => {
        const { logger } = require('@/lib/logger')
        logger.debug('debug message')
      })

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls[0][0]).toContain('[DEBUG]')
      expect(spy.mock.calls[0][0]).toContain('debug message')
    })

    it('should log info messages', () => {
      const spy = jest.spyOn(console, 'info').mockImplementation()

      jest.isolateModules(() => {
        const { logger } = require('@/lib/logger')
        logger.info('info message')
      })

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls[0][0]).toContain('[INFO]')
      expect(spy.mock.calls[0][0]).toContain('info message')
    })

    it('should log warn messages', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation()

      jest.isolateModules(() => {
        const { logger } = require('@/lib/logger')
        logger.warn('warning message')
      })

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls[0][0]).toContain('[WARN]')
      expect(spy.mock.calls[0][0]).toContain('warning message')
    })

    it('should log error messages', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation()

      jest.isolateModules(() => {
        const { logger } = require('@/lib/logger')
        logger.error('error message')
      })

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls[0][0]).toContain('[ERROR]')
      expect(spy.mock.calls[0][0]).toContain('error message')
    })

    it('should include data in log output when provided', () => {
      const spy = jest.spyOn(console, 'info').mockImplementation()

      jest.isolateModules(() => {
        const { logger } = require('@/lib/logger')
        logger.info('with data', { key: 'value' })
      })

      expect(spy).toHaveBeenCalledTimes(1)
      const output = spy.mock.calls[0][0]
      expect(output).toContain('"key": "value"')
    })

    it('should include timestamp in ISO format', () => {
      const spy = jest.spyOn(console, 'info').mockImplementation()

      jest.isolateModules(() => {
        const { logger } = require('@/lib/logger')
        logger.info('timestamp test')
      })

      const output = spy.mock.calls[0][0]
      // Should contain an ISO timestamp like [2025-01-01T00:00:00.000Z]
      expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('should include error data when logging errors', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation()

      jest.isolateModules(() => {
        const { logger } = require('@/lib/logger')
        logger.error('something failed', { stack: 'at line 1' })
      })

      const output = spy.mock.calls[0][0]
      expect(output).toContain('something failed')
      expect(output).toContain('at line 1')
    })
  })

  // ============================================================================
  // In production environment — only info+ should log
  // ============================================================================

  describe('in production environment', () => {
    beforeEach(() => {
      // @ts-expect-error - override NODE_ENV for testing
      process.env.NODE_ENV = 'production'
    })

    it('should suppress debug in production', () => {
      const spy = jest.spyOn(console, 'debug').mockImplementation()

      jest.isolateModules(() => {
        const { logger } = require('@/lib/logger')
        logger.debug('should not appear')
      })

      expect(spy).not.toHaveBeenCalled()
    })

    it('should log info in production', () => {
      const spy = jest.spyOn(console, 'info').mockImplementation()

      jest.isolateModules(() => {
        const { logger } = require('@/lib/logger')
        logger.info('should appear')
      })

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should log warn in production', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation()

      jest.isolateModules(() => {
        const { logger } = require('@/lib/logger')
        logger.warn('warning in prod')
      })

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should log error in production', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation()

      jest.isolateModules(() => {
        const { logger } = require('@/lib/logger')
        logger.error('error in prod')
      })

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  // ============================================================================
  // API Convenience Methods
  // ============================================================================

  describe('API convenience methods', () => {
    beforeEach(() => {
      // @ts-expect-error - override NODE_ENV for testing
      process.env.NODE_ENV = 'development'
    })

    it('apiRequest should log method and path at info level', () => {
      const spy = jest.spyOn(console, 'info').mockImplementation()

      jest.isolateModules(() => {
        const { logger } = require('@/lib/logger')
        logger.apiRequest('POST', '/api/quiz')
      })

      const output = spy.mock.calls[0][0]
      expect(output).toContain('API POST /api/quiz')
    })

    it('apiRequest should include data when provided', () => {
      const spy = jest.spyOn(console, 'info').mockImplementation()

      jest.isolateModules(() => {
        const { logger } = require('@/lib/logger')
        logger.apiRequest('POST', '/api/quiz', { category: 'science' })
      })

      const output = spy.mock.calls[0][0]
      expect(output).toContain('science')
    })

    it('apiResponse should log method, path, and status', () => {
      const spy = jest.spyOn(console, 'info').mockImplementation()

      jest.isolateModules(() => {
        const { logger } = require('@/lib/logger')
        logger.apiResponse('GET', '/api/rooms', 200)
      })

      const output = spy.mock.calls[0][0]
      expect(output).toContain('API GET /api/rooms -> 200')
    })

    it('apiError should log at error level', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation()

      jest.isolateModules(() => {
        const { logger } = require('@/lib/logger')
        logger.apiError('POST', '/api/quiz', new Error('timeout'))
      })

      const output = spy.mock.calls[0][0]
      expect(output).toContain('API POST /api/quiz failed')
    })
  })

  // ============================================================================
  // Request ID Utilities
  // ============================================================================

  describe('generateRequestId', () => {
    it('returns a string ID', () => {
      jest.isolateModules(() => {
        const { generateRequestId } = require('@/lib/logger')
        const id = generateRequestId()
        expect(typeof id).toBe('string')
        expect(id.length).toBeGreaterThan(0)
      })
    })

    it('returns UUID when crypto.randomUUID is available', () => {
      const originalCrypto = globalThis.crypto
      Object.defineProperty(globalThis, 'crypto', {
        value: { randomUUID: () => '550e8400-e29b-41d4-a716-446655440000' },
        writable: true,
        configurable: true,
      })

      jest.isolateModules(() => {
        const { generateRequestId } = require('@/lib/logger')
        expect(generateRequestId()).toBe('550e8400-e29b-41d4-a716-446655440000')
      })

      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true,
      })
    })

    it('returns fallback ID when crypto.randomUUID is not available', () => {
      const originalCrypto = globalThis.crypto
      Object.defineProperty(globalThis, 'crypto', {
        value: {},
        writable: true,
        configurable: true,
      })

      jest.isolateModules(() => {
        const { generateRequestId } = require('@/lib/logger')
        const id = generateRequestId()
        expect(id).toMatch(/^req_[a-z0-9]+_[a-z0-9]+$/)
      })

      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true,
      })
    })

    it('returns fallback ID when crypto is undefined', () => {
      const originalCrypto = globalThis.crypto
      // @ts-expect-error - intentionally removing crypto for testing
      delete globalThis.crypto

      jest.isolateModules(() => {
        const { generateRequestId } = require('@/lib/logger')
        const id = generateRequestId()
        expect(id).toMatch(/^req_[a-z0-9]+_[a-z0-9]+$/)
      })

      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true,
      })
    })
  })

  describe('getRequestId', () => {
    function makeRequest(headers: Record<string, string> = {}) {
      return {
        headers: {
          get: (name: string) => headers[name] ?? null,
        },
      } as unknown as Request
    }

    it('extracts x-request-id header', () => {
      jest.isolateModules(() => {
        const { getRequestId } = require('@/lib/logger')
        expect(getRequestId(makeRequest({ 'x-request-id': 'existing-req-id' }))).toBe(
          'existing-req-id'
        )
      })
    })

    it('extracts x-correlation-id header', () => {
      jest.isolateModules(() => {
        const { getRequestId } = require('@/lib/logger')
        expect(getRequestId(makeRequest({ 'x-correlation-id': 'corr-123' }))).toBe('corr-123')
      })
    })

    it('extracts x-trace-id header', () => {
      jest.isolateModules(() => {
        const { getRequestId } = require('@/lib/logger')
        expect(getRequestId(makeRequest({ 'x-trace-id': 'trace-456' }))).toBe('trace-456')
      })
    })

    it('generates new ID when no tracing headers exist', () => {
      jest.isolateModules(() => {
        const { getRequestId } = require('@/lib/logger')
        const id = getRequestId(makeRequest())
        expect(typeof id).toBe('string')
        expect(id.length).toBeGreaterThan(0)
      })
    })

    it('generates new ID when no request is provided', () => {
      jest.isolateModules(() => {
        const { getRequestId } = require('@/lib/logger')
        const id = getRequestId()
        expect(typeof id).toBe('string')
        expect(id.length).toBeGreaterThan(0)
      })
    })
  })
})
