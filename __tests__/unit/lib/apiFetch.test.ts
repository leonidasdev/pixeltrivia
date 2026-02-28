/**
 * Tests for apiFetch utility
 *
 * @module __tests__/unit/lib/apiFetch
 * @since 1.3.0
 */

import { apiFetch } from '@/lib/apiFetch'

// Mock logger to prevent console noise
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}))

// Mock global fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  jest.clearAllMocks()
})

describe('apiFetch', () => {
  describe('successful requests', () => {
    it('returns parsed JSON on success', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { items: [1, 2, 3] },
          meta: { timestamp: '2026-01-01T00:00:00Z' },
        }),
      })

      const result = await apiFetch<{ items: number[] }>('/api/test')

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ items: [1, 2, 3] })
    })

    it('sends GET request by default', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      await apiFetch('/api/test')

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('sends POST with JSON body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { id: 1 } }),
      })

      await apiFetch('/api/test', {
        method: 'POST',
        body: { name: 'test', value: 42 },
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test', value: 42 }),
      })
    })

    it('merges custom headers with defaults', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      await apiFetch('/api/test', {
        headers: { Authorization: 'Bearer token123' },
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token123',
        },
      })
    })
  })

  describe('error handling', () => {
    it('returns error response when HTTP status is not ok', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          success: false,
          error: 'Resource not found',
        }),
      })

      const result = await apiFetch('/api/missing')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Resource not found')
    })

    it('falls back to HTTP status message when no error in body', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ success: false }),
      })

      const result = await apiFetch('/api/broken')

      expect(result.success).toBe(false)
      expect(result.error).toBe('HTTP 500: Internal Server Error')
    })

    it('handles network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))

      const result = await apiFetch('/api/unreachable')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch')
      expect(result.message).toContain('Failed to')
    })

    it('handles non-Error thrown values', async () => {
      mockFetch.mockRejectedValue('unexpected string error')

      const result = await apiFetch('/api/weird')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unknown error')
    })

    it('logs errors with errorContext label', async () => {
      const { logger } = jest.requireMock('@/lib/logger')
      mockFetch.mockRejectedValue(new Error('network down'))

      await apiFetch('/api/test', { errorContext: 'fetch questions' })

      expect(logger.error).toHaveBeenCalledWith('fetch questions failed:', expect.any(Error))
    })

    it('logs with URL fallback when no errorContext', async () => {
      const { logger } = jest.requireMock('@/lib/logger')
      mockFetch.mockRejectedValue(new Error('oops'))

      await apiFetch('/api/some-endpoint')

      expect(logger.error).toHaveBeenCalledWith(
        'API call to /api/some-endpoint failed:',
        expect.any(Error)
      )
    })
  })

  describe('request methods', () => {
    it.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const)(
      'supports %s method',
      async method => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ success: true }),
        })

        await apiFetch('/api/test', { method })

        expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({ method }))
      }
    )
  })

  describe('body handling', () => {
    it('does not include body when undefined', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      await apiFetch('/api/test')

      const callArgs = mockFetch.mock.calls[0][1]
      expect(callArgs).not.toHaveProperty('body')
    })

    it('includes body when explicitly set to null', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      await apiFetch('/api/test', { method: 'POST', body: null })

      const callArgs = mockFetch.mock.calls[0][1]
      expect(callArgs.body).toBe('null')
    })
  })
})
