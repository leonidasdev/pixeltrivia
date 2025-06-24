import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a Supabase client with service role for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

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
