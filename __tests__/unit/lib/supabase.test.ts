/**
 * Tests for Supabase client module
 */

// Save original env
const savedEnv = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...savedEnv }
})

afterAll(() => {
  process.env = savedEnv
})

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
    auth: { getUser: jest.fn() },
  })),
}))

describe('getSupabaseClient', () => {
  it('throws when NEXT_PUBLIC_SUPABASE_URL is not set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = ''
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'some-key'

    const { getSupabaseClient } = require('@/lib/supabase')
    expect(() => getSupabaseClient()).toThrow('Supabase URL is not configured')
  })

  it('throws when SUPABASE_SERVICE_ROLE_KEY is not set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = ''

    const { getSupabaseClient } = require('@/lib/supabase')
    expect(() => getSupabaseClient()).toThrow('Supabase service key is not configured')
  })

  it('creates a client when both env vars are set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

    const { createClient } = require('@supabase/supabase-js')
    const { getSupabaseClient } = require('@/lib/supabase')
    const client = getSupabaseClient()

    expect(client).toBeDefined()
    expect(createClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-service-key',
      expect.objectContaining({
        auth: { autoRefreshToken: false, persistSession: false },
      })
    )
  })

  it('returns the same instance on subsequent calls (singleton)', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

    const { getSupabaseClient } = require('@/lib/supabase')
    const client1 = getSupabaseClient()
    const client2 = getSupabaseClient()

    expect(client1).toBe(client2)
  })
})
