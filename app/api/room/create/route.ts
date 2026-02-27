/**
 * POST /api/room/create — Create a multiplayer game room
 *
 * Creates a room with a unique code and adds the host as the first player.
 *
 * Request body:
 *   - playerName: string (required)
 *   - avatar: string (required)
 *   - gameMode: 'quick' | 'custom' | 'advanced' (default: 'quick')
 *   - category: string (optional)
 *   - maxPlayers: number (default: 8)
 *   - timeLimit: number in seconds (default: 30)
 *   - questionCount: number (default: 10)
 *
 * @module api/room/create
 * @since 1.1.0
 */

import { type NextRequest } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { generateRoomCode, isValidRoomCode } from '@/lib/roomCode'
import { logger } from '@/lib/logger'
import {
  createdResponse,
  validationErrorResponse,
  databaseErrorResponse,
  serverErrorResponse,
  methodNotAllowedResponse,
} from '@/lib/apiResponse'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'
import {
  DEFAULT_MAX_PLAYERS,
  DEFAULT_TIME_LIMIT,
  DEFAULT_QUESTION_COUNT,
  MAX_PLAYERS,
  MIN_NICKNAME_LENGTH,
  MAX_NICKNAME_LENGTH,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  MIN_TIME_LIMIT,
  MAX_TIME_LIMIT,
} from '@/constants/game'

export async function POST(request: NextRequest) {
  const rateLimited = rateLimit(request, RATE_LIMITS.roomCreation)
  if (rateLimited) return rateLimited

  try {
    const supabase = getSupabaseClient()

    // Parse request body
    let body: Record<string, unknown> = {}
    try {
      body = await request.json()
    } catch {
      // Allow empty body for backward compatibility
    }

    const playerName = typeof body.playerName === 'string' ? body.playerName.trim() : ''
    const avatar = typeof body.avatar === 'string' ? body.avatar.trim() : 'knight'
    const gameMode = typeof body.gameMode === 'string' ? body.gameMode : 'quick'
    const category = typeof body.category === 'string' ? body.category.trim() : null
    const maxPlayers =
      typeof body.maxPlayers === 'number'
        ? Math.min(Math.max(2, body.maxPlayers), MAX_PLAYERS)
        : DEFAULT_MAX_PLAYERS
    const timeLimit =
      typeof body.timeLimit === 'number'
        ? Math.min(Math.max(MIN_TIME_LIMIT, body.timeLimit), MAX_TIME_LIMIT)
        : DEFAULT_TIME_LIMIT
    const questionCount =
      typeof body.questionCount === 'number'
        ? Math.min(Math.max(MIN_QUESTIONS, body.questionCount), MAX_QUESTIONS)
        : DEFAULT_QUESTION_COUNT

    // Validate player name
    if (playerName.length < MIN_NICKNAME_LENGTH || playerName.length > MAX_NICKNAME_LENGTH) {
      return validationErrorResponse(
        `Player name must be between ${MIN_NICKNAME_LENGTH} and ${MAX_NICKNAME_LENGTH} characters`,
        'playerName'
      )
    }

    // Generate unique room code
    let roomCode: string = ''
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10

    do {
      roomCode = generateRoomCode()
      attempts++
      const { data: existingRoom, error: checkError } = await supabase
        .from('rooms')
        .select('code')
        .eq('code', roomCode)
        .single()

      if (checkError && checkError.code === 'PGRST116') {
        isUnique = true
      } else if (checkError) {
        return databaseErrorResponse('Database error while checking room code')
      } else if (existingRoom) {
        isUnique = false
      }
      if (attempts >= maxAttempts) {
        return serverErrorResponse('Unable to generate unique room code after multiple attempts')
      }
    } while (!isUnique)

    if (!isValidRoomCode(roomCode)) {
      return serverErrorResponse('Generated room code is invalid')
    }

    // Create the room
    const { data: newRoom, error: insertError } = await supabase
      .from('rooms')
      .insert({
        code: roomCode,
        created_at: new Date().toISOString(),
        status: 'waiting',
        max_players: maxPlayers,
        total_questions: questionCount,
        time_limit: timeLimit,
        game_mode: gameMode,
        category: category,
      })
      .select()
      .single()

    if (insertError) {
      logger.error('Failed to create room:', insertError)
      return databaseErrorResponse('Failed to create room in database')
    }

    // Add host as first player
    const { data: hostPlayer, error: playerError } = await supabase
      .from('players')
      .insert({
        room_code: roomCode,
        name: playerName,
        avatar: avatar,
        is_host: true,
      })
      .select()
      .single()

    if (playerError) {
      logger.error('Failed to add host player:', playerError)
      // Clean up room if player creation fails
      await supabase.from('rooms').delete().eq('code', roomCode)
      return databaseErrorResponse('Failed to add host player')
    }

    return createdResponse(
      {
        roomCode: newRoom.code,
        playerId: hostPlayer.id,
        createdAt: newRoom.created_at,
        status: newRoom.status,
        maxPlayers: newRoom.max_players,
        timeLimit: newRoom.time_limit,
        questionCount: newRoom.total_questions,
        gameMode: newRoom.game_mode,
      },
      'Room created successfully'
    )
  } catch (error) {
    logger.error('Room creation error:', error)
    return serverErrorResponse(error instanceof Error ? error.message : 'Unknown error occurred')
  }
}

// Handle unsupported HTTP methods
export const GET = () => methodNotAllowedResponse('POST')
export const PUT = () => methodNotAllowedResponse('POST')
export const DELETE = () => methodNotAllowedResponse('POST')
