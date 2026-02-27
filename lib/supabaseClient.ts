/**
 * Client-side Supabase Client
 *
 * Provides a Supabase client using the anon key for client-side operations
 * such as Realtime subscriptions. This is separate from the server-side
 * client in `supabase.ts` which uses the service role key.
 *
 * @module lib/supabaseClient
 * @since 1.1.0
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

let _clientInstance: SupabaseClient | null = null

/**
 * Get the client-side Supabase instance (anon key).
 * Used for Realtime subscriptions and client-side reads.
 * Falls back gracefully if env vars are not set.
 */
export function getSupabaseClientSide(): SupabaseClient | null {
  if (_clientInstance) return _clientInstance

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  _clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })

  return _clientInstance
}

/**
 * Check if the client-side Supabase is available
 */
export function isRealtimeAvailable(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}
