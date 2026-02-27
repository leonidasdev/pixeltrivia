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
 * @deprecated Use getSupabaseClient() instead for lazy initialization.
 * Returns null if env vars are not set — callers must handle this.
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null

// Type definitions for our database schema (DB row shapes)
export interface DbRoom {
  id: number
  code: string
  created_at: string
  host_player_id: string | null
  status: 'waiting' | 'active' | 'finished'
  max_players: number
  current_question: number
  total_questions: number
  question_start_time: string | null
  game_mode: string | null
  category: string | null
  time_limit: number
}

export interface DbPlayer {
  id: number
  room_code: string
  name: string
  avatar: string
  is_host: boolean
  joined_at: string
  score: number
  current_answer: string | null
  answer_time: string | null
  answers: PlayerAnswerRecord[]
}

export interface PlayerAnswerRecord {
  questionIndex: number
  answer: number
  timeMs: number
  correct: boolean
  score: number
}

export interface DbGameQuestion {
  id: number
  room_code: string
  question_index: number
  question_text: string
  options: string[]
  correct_answer: number
  category: string | null
  difficulty: string | null
}

/** Insert shape — id and defaults are optional */
export type DbRoomInsert = Omit<
  DbRoom,
  | 'id'
  | 'created_at'
  | 'status'
  | 'max_players'
  | 'current_question'
  | 'total_questions'
  | 'question_start_time'
  | 'time_limit'
> &
  Partial<
    Pick<
      DbRoom,
      | 'id'
      | 'created_at'
      | 'status'
      | 'max_players'
      | 'current_question'
      | 'total_questions'
      | 'question_start_time'
      | 'time_limit'
    >
  >

export type DbPlayerInsert = Omit<
  DbPlayer,
  'id' | 'joined_at' | 'score' | 'current_answer' | 'answer_time' | 'answers'
> &
  Partial<
    Pick<DbPlayer, 'id' | 'joined_at' | 'score' | 'current_answer' | 'answer_time' | 'answers'>
  >

export type DbGameQuestionInsert = Omit<DbGameQuestion, 'id'>
