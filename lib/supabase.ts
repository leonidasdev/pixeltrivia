import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

// Lazy-loaded Supabase client to avoid build-time initialization errors
let _supabase: SupabaseClient | null = null

/**
 * Get the Supabase client instance.
 * Uses lazy initialization to avoid build-time errors when env vars are not available.
 * @throws Error if Supabase URL is not configured (only at runtime, not build time)
 */
export function getSupabaseClient(): SupabaseClient {
  if (_supabase) {
    return _supabase
  }

  if (!supabaseUrl) {
    throw new Error(
      'Supabase URL is not configured. Please set NEXT_PUBLIC_SUPABASE_URL environment variable.'
    )
  }

  if (!supabaseServiceKey) {
    throw new Error(
      'Supabase service key is not configured. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.'
    )
  }

  _supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return _supabase
}

/**
 * @deprecated Use getSupabaseClient() instead for lazy initialization
 * This export is kept for backward compatibility but will fail at module load
 * if env vars are not set.
 */
export const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : (null as unknown as SupabaseClient)

// Type definitions for our database schema
export interface Room {
  id?: number
  code: string
  created_at?: string
  host_player_id?: string
  status?: 'waiting' | 'active' | 'finished'
  max_players?: number
}

export interface Player {
  id?: number
  room_code: string
  name: string
  avatar: string
  is_host: boolean
  joined_at?: string
}
