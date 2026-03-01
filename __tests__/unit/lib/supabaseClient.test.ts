/**
 * Tests for Client-Side Supabase Client
 *
 * Tests getSupabaseClientSide() singleton, isRealtimeAvailable(),
 * and env-var fallback branches.
 *
 * @module __tests__/unit/lib/supabaseClient
 * @since 1.1.0
 */

const mockCreateClient = jest.fn().mockReturnValue({ from: jest.fn() })

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}))

describe('supabaseClient', () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
    jest.resetModules()
    mockCreateClient.mockClear()
  })

  describe('getSupabaseClientSide', () => {
    it('returns null when SUPABASE_URL is missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = ''
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      jest.isolateModules(() => {
        const { getSupabaseClientSide } = require('@/lib/supabaseClient')
        expect(getSupabaseClientSide()).toBeNull()
      })
    })

    it('returns null when SUPABASE_ANON_KEY is missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ''

      jest.isolateModules(() => {
        const { getSupabaseClientSide } = require('@/lib/supabaseClient')
        expect(getSupabaseClientSide()).toBeNull()
      })
    })

    it('returns null when both env vars are missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = ''
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ''

      jest.isolateModules(() => {
        const { getSupabaseClientSide } = require('@/lib/supabaseClient')
        expect(getSupabaseClientSide()).toBeNull()
        expect(mockCreateClient).not.toHaveBeenCalled()
      })
    })

    it('creates client when env vars are set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      jest.isolateModules(() => {
        const { getSupabaseClientSide } = require('@/lib/supabaseClient')
        const client = getSupabaseClientSide()
        expect(client).not.toBeNull()
        expect(mockCreateClient).toHaveBeenCalledWith(
          'https://test.supabase.co',
          'test-anon-key',
          expect.objectContaining({
            auth: expect.objectContaining({
              autoRefreshToken: false,
              persistSession: false,
            }),
          })
        )
      })
    })

    it('returns same instance on subsequent calls (singleton)', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      jest.isolateModules(() => {
        const { getSupabaseClientSide } = require('@/lib/supabaseClient')
        const first = getSupabaseClientSide()
        const second = getSupabaseClientSide()
        expect(first).toBe(second)
        expect(mockCreateClient).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('isRealtimeAvailable', () => {
    it('returns true when both env vars are set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      jest.isolateModules(() => {
        const { isRealtimeAvailable } = require('@/lib/supabaseClient')
        expect(isRealtimeAvailable()).toBe(true)
      })
    })

    it('returns false when URL is empty', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = ''
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      jest.isolateModules(() => {
        const { isRealtimeAvailable } = require('@/lib/supabaseClient')
        expect(isRealtimeAvailable()).toBe(false)
      })
    })

    it('returns false when anon key is empty', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ''

      jest.isolateModules(() => {
        const { isRealtimeAvailable } = require('@/lib/supabaseClient')
        expect(isRealtimeAvailable()).toBe(false)
      })
    })
  })
})
