/**
 * Tests for Logger Module
 *
 * Tests logger methods, formatting, and child logger.
 * Since shouldLog() suppresses all output when NODE_ENV=test,
 * we test by overriding the environment.
 */

// Save original env
const originalEnv = process.env.NODE_ENV

describe('logger module', () => {
  let logger: typeof import('@/lib/logger').logger
  let consoleSpy: {
    debug: jest.SpyInstance
    info: jest.SpyInstance
    warn: jest.SpyInstance
    error: jest.SpyInstance
  }

  beforeAll(() => {
    consoleSpy = {
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    }
  })

  afterAll(() => {
    consoleSpy.debug.mockRestore()
    consoleSpy.info.mockRestore()
    consoleSpy.warn.mockRestore()
    consoleSpy.error.mockRestore()
    // @ts-expect-error -- Jest env override

    process.env.NODE_ENV = originalEnv
  })

  beforeEach(() => {
    consoleSpy.debug.mockClear()
    consoleSpy.info.mockClear()
    consoleSpy.warn.mockClear()
    consoleSpy.error.mockClear()
  })

  // Helper: load logger in development mode
  async function loadDevLogger() {
    // @ts-expect-error -- Jest env override

    process.env.NODE_ENV = 'development'
    jest.resetModules()
    const mod = await import('@/lib/logger')
    return mod.logger
  }

  // Helper: load logger in production mode
  async function loadProdLogger() {
    // @ts-expect-error -- Jest env override

    process.env.NODE_ENV = 'production'
    jest.resetModules()
    const mod = await import('@/lib/logger')
    return mod.logger
  }

  // Helper: load logger in test mode
  async function loadTestLogger() {
    // @ts-expect-error -- Jest env override

    process.env.NODE_ENV = 'test'
    jest.resetModules()
    const mod = await import('@/lib/logger')
    return mod.logger
  }

  // ==========================================================================
  // Suppression in test environment
  // ==========================================================================
  describe('test environment', () => {
    it('should suppress all log output in test mode', async () => {
      logger = await loadTestLogger()

      logger.debug('debug msg')
      logger.info('info msg')
      logger.warn('warn msg')
      logger.error('error msg')

      expect(consoleSpy.debug).not.toHaveBeenCalled()
      expect(consoleSpy.info).not.toHaveBeenCalled()
      expect(consoleSpy.warn).not.toHaveBeenCalled()
      expect(consoleSpy.error).not.toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // Development mode
  // ==========================================================================
  describe('development mode', () => {
    beforeEach(async () => {
      logger = await loadDevLogger()
    })

    it('should output debug messages in dev mode', () => {
      logger.debug('debug test')
      expect(consoleSpy.debug).toHaveBeenCalledTimes(1)
      expect(consoleSpy.debug.mock.calls[0][0]).toContain('DEBUG')
      expect(consoleSpy.debug.mock.calls[0][0]).toContain('debug test')
    })

    it('should output info messages', () => {
      logger.info('info test')
      expect(consoleSpy.info).toHaveBeenCalledTimes(1)
      expect(consoleSpy.info.mock.calls[0][0]).toContain('INFO')
    })

    it('should output warn messages', () => {
      logger.warn('warn test')
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1)
      expect(consoleSpy.warn.mock.calls[0][0]).toContain('WARN')
    })

    it('should output error messages', () => {
      logger.error('error test')
      expect(consoleSpy.error).toHaveBeenCalledTimes(1)
      expect(consoleSpy.error.mock.calls[0][0]).toContain('ERROR')
    })

    it('should include data in output', () => {
      logger.info('with data', { foo: 'bar' })
      const output = consoleSpy.info.mock.calls[0][0]
      expect(output).toContain('foo')
      expect(output).toContain('bar')
    })

    it('should include requestId when provided', () => {
      logger.info('req-test', undefined, 'req-123')
      const output = consoleSpy.info.mock.calls[0][0]
      expect(output).toContain('req-123')
    })

    it('should format output as human-readable (not JSON)', () => {
      logger.info('readable')
      const output = consoleSpy.info.mock.calls[0][0]
      // Dev format uses brackets, not JSON object
      expect(output).toMatch(/^\[/)
    })
  })

  // ==========================================================================
  // Production mode
  // ==========================================================================
  describe('production mode', () => {
    beforeEach(async () => {
      logger = await loadProdLogger()
    })

    it('should suppress debug in production', () => {
      logger.debug('should be suppressed')
      expect(consoleSpy.debug).not.toHaveBeenCalled()
    })

    it('should output info in production', () => {
      logger.info('prod info')
      expect(consoleSpy.info).toHaveBeenCalledTimes(1)
    })

    it('should format output as JSON in production', () => {
      logger.info('json test')
      const output = consoleSpy.info.mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed).toHaveProperty('level', 'info')
      expect(parsed).toHaveProperty('msg', 'json test')
      expect(parsed).toHaveProperty('time')
    })

    it('should serialize Error objects in production', () => {
      const err = new Error('test error')
      logger.error('error obj', err)
      const output = consoleSpy.error.mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed.error).toHaveProperty('name', 'Error')
      expect(parsed.error).toHaveProperty('message', 'test error')
      expect(parsed.error).toHaveProperty('stack')
    })

    it('should include data in JSON output', () => {
      logger.info('data test', { key: 'value' })
      const output = consoleSpy.info.mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed.data).toEqual({ key: 'value' })
    })

    it('should include requestId in JSON output', () => {
      logger.warn('req test', undefined, 'req-456')
      const output = consoleSpy.warn.mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed.requestId).toBe('req-456')
    })
  })

  // ==========================================================================
  // API convenience methods
  // ==========================================================================
  describe('API convenience methods', () => {
    beforeEach(async () => {
      logger = await loadDevLogger()
    })

    it('apiRequest should log with method and path', () => {
      logger.apiRequest('GET', '/api/quiz')
      expect(consoleSpy.info).toHaveBeenCalledTimes(1)
      expect(consoleSpy.info.mock.calls[0][0]).toContain('GET')
      expect(consoleSpy.info.mock.calls[0][0]).toContain('/api/quiz')
    })

    it('apiResponse should log status code', () => {
      logger.apiResponse('POST', '/api/room', 201)
      const output = consoleSpy.info.mock.calls[0][0]
      expect(output).toContain('201')
    })

    it('apiError should log at error level', () => {
      logger.apiError('DELETE', '/api/game', new Error('fail'))
      expect(consoleSpy.error).toHaveBeenCalledTimes(1)
      expect(consoleSpy.error.mock.calls[0][0]).toContain('DELETE')
    })
  })

  // ==========================================================================
  // Child logger
  // ==========================================================================
  describe('child logger', () => {
    beforeEach(async () => {
      logger = await loadDevLogger()
    })

    it('should bind requestId to all methods', () => {
      const child = logger.child('child-req-1')

      child.info('child info')
      expect(consoleSpy.info.mock.calls[0][0]).toContain('child-req-1')

      child.warn('child warn')
      expect(consoleSpy.warn.mock.calls[0][0]).toContain('child-req-1')

      child.error('child error')
      expect(consoleSpy.error.mock.calls[0][0]).toContain('child-req-1')

      child.debug('child debug')
      expect(consoleSpy.debug.mock.calls[0][0]).toContain('child-req-1')
    })

    it('should support API methods with bound requestId', () => {
      const child = logger.child('api-req-1')

      child.apiRequest('GET', '/test')
      expect(consoleSpy.info.mock.calls[0][0]).toContain('api-req-1')

      child.apiResponse('GET', '/test', 200)
      expect(consoleSpy.info.mock.calls[1][0]).toContain('api-req-1')

      child.apiError('GET', '/test', new Error('oops'))
      expect(consoleSpy.error.mock.calls[0][0]).toContain('api-req-1')
    })
  })
})
