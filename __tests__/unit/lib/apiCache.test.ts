/**
 * Unit tests for lib/apiCache.ts
 * Tests SWR configuration presets, fetcher, and cache management utilities
 */

import {
  apiFetcher,
  DEFAULT_SWR_CONFIG,
  STATIC_SWR_CONFIG,
  IMMUTABLE_SWR_CONFIG,
  invalidateCache,
  primeCache,
  useApiCache,
  useCachedQuestions,
} from '@/lib/apiCache'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock swr — jest.fn inline to avoid hoisting issues
const mockUseSWR = jest.fn(() => ({ data: undefined, error: undefined, isLoading: true }))
jest.mock('swr', () => {
  const fn = jest.fn(() => ({ data: undefined, error: undefined, isLoading: true }))
  return {
    __esModule: true,
    default: fn,
    mutate: jest.fn(),
    _getMockUseSWR: () => fn,
  }
})

// Import after mock setup
import { mutate as mockMutate } from 'swr'
import swr from 'swr'
const swrDefault = swr as unknown as jest.Mock

describe('apiCache', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── apiFetcher ──────────────────────────────────────────────

  describe('apiFetcher', () => {
    it('should fetch and return data from a successful API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { questions: [] } }),
      })
      const result = await apiFetcher<{ questions: unknown[] }>('/api/test')
      expect(result).toEqual({ questions: [] })
      expect(mockFetch).toHaveBeenCalledWith('/api/test')
    })

    it('should throw on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ success: false, error: 'Server error' }),
      })
      await expect(apiFetcher('/api/test')).rejects.toThrow('Server error')
    })

    it('should throw on unsuccessful API response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Validation failed' }),
      })
      await expect(apiFetcher('/api/test')).rejects.toThrow('Validation failed')
    })

    it('should throw with status code when no error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ success: false }),
      })
      await expect(apiFetcher('/api/test')).rejects.toThrow('API error: 404')
    })
  })

  // ─── Config Presets ──────────────────────────────────────────

  describe('config presets', () => {
    it('DEFAULT_SWR_CONFIG should revalidate on focus', () => {
      expect(DEFAULT_SWR_CONFIG.revalidateOnFocus).toBe(true)
      expect(DEFAULT_SWR_CONFIG.revalidateOnReconnect).toBe(true)
      expect(DEFAULT_SWR_CONFIG.dedupingInterval).toBe(5000)
      expect(DEFAULT_SWR_CONFIG.errorRetryCount).toBe(3)
    })

    it('STATIC_SWR_CONFIG should not revalidate on focus', () => {
      expect(STATIC_SWR_CONFIG.revalidateOnFocus).toBe(false)
      expect(STATIC_SWR_CONFIG.revalidateOnReconnect).toBe(false)
      expect(STATIC_SWR_CONFIG.dedupingInterval).toBe(60000)
    })

    it('IMMUTABLE_SWR_CONFIG should never auto-refetch', () => {
      expect(IMMUTABLE_SWR_CONFIG.revalidateOnFocus).toBe(false)
      expect(IMMUTABLE_SWR_CONFIG.revalidateOnReconnect).toBe(false)
      expect(IMMUTABLE_SWR_CONFIG.revalidateIfStale).toBe(false)
      expect(IMMUTABLE_SWR_CONFIG.dedupingInterval).toBe(Infinity)
    })
  })

  // ─── Cache Management ──────────────────────────────────────

  describe('invalidateCache', () => {
    it('should call mutate with revalidate: true', async () => {
      await invalidateCache('/api/test')
      expect(mockMutate).toHaveBeenCalledWith('/api/test', undefined, { revalidate: true })
    })
  })

  describe('primeCache', () => {
    it('should call mutate with data and revalidate: false', async () => {
      const data = { questions: [{ id: 1 }] }
      await primeCache('/api/test', data)
      expect(mockMutate).toHaveBeenCalledWith('/api/test', data, { revalidate: false })
    })
  })

  // ─── Hook Wrappers (verify SWR is called correctly) ──────

  describe('useApiCache', () => {
    it('should call useSWR with key and default config', () => {
      useApiCache('/api/test')
      expect(swrDefault).toHaveBeenCalledWith(
        '/api/test',
        expect.any(Function),
        expect.objectContaining({
          revalidateOnFocus: true,
        })
      )
    })

    it('should call useSWR with null key to skip', () => {
      useApiCache(null)
      expect(swrDefault).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object))
    })

    it('should merge custom config', () => {
      useApiCache('/api/test', { errorRetryCount: 0 })
      expect(swrDefault).toHaveBeenCalledWith(
        '/api/test',
        expect.any(Function),
        expect.objectContaining({
          errorRetryCount: 0,
        })
      )
    })
  })

  describe('useCachedQuestions', () => {
    it('should generate key with category and count', () => {
      useCachedQuestions({ category: 'Science', count: 10 })
      expect(swrDefault).toHaveBeenCalledWith(
        expect.stringContaining('category=Science'),
        expect.any(Function),
        expect.objectContaining({ revalidateOnFocus: false })
      )
    })

    it('should include difficulty when provided', () => {
      useCachedQuestions({ category: 'Science', count: 10, difficulty: 'hard' })
      expect(swrDefault).toHaveBeenCalledWith(
        expect.stringContaining('difficulty=hard'),
        expect.any(Function),
        expect.any(Object)
      )
    })

    it('should not include difficulty when omitted', () => {
      useCachedQuestions({ category: 'Art', count: 5 })
      const key = swrDefault.mock.calls[swrDefault.mock.calls.length - 1][0]
      expect(key).not.toContain('difficulty')
    })

    it('should pass null key when params is null', () => {
      useCachedQuestions(null)
      expect(swrDefault).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object))
    })

    it('should encode special characters in category', () => {
      useCachedQuestions({ category: 'Science & Nature', count: 10 })
      const key = swrDefault.mock.calls[swrDefault.mock.calls.length - 1][0]
      expect(key).toContain('Science%20%26%20Nature')
    })
  })
})
