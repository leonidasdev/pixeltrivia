/**
 * POST /api/room/join — Join an existing multiplayer room
 *
 * Request body:
 *   - roomCode: string (required, 6-char alphanumeric)
 *   - playerName: string (required)
 *   - avatar: string (required)
 *
 * @module api/room/join
 * @since 1.1.0
 */

import { type NextRequest } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { isValidRoomCode } from '@/lib/roomCode'
import { logger } from '@/lib/logger'
import {
  successResponse,
  validationErrorResponse,
  notFoundResponse,
  databaseErrorResponse,
  serverErrorResponse,
  methodNotAllowedResponse,
} from '@/lib/apiResponse'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'
import { MIN_NICKNAME_LENGTH, MAX_NICKNAME_LENGTH } from '@/constants/game'

export async function POST(request: NextRequest) {
  const rateLimited = rateLimit(request, RATE_LIMITS.roomCreation)
  if (rateLimited) return rateLimited

  try {
    const supabase = getSupabaseClient()
    const body = await request.json()

    const roomCode = typeof body.roomCode === 'string' ? body.roomCode.trim().toUpperCase() : ''
    const playerName = typeof body.playerName === 'string' ? body.playerName.trim() : ''
    const avatar = typeof body.avatar === 'string' ? body.avatar.trim() : 'knight'

    // Validate inputs
    if (!isValidRoomCode(roomCode)) {
      return validationErrorResponse('Invalid room code format', 'roomCode')
    }

    if (playerName.length < MIN_NICKNAME_LENGTH || playerName.length > MAX_NICKNAME_LENGTH) {
      return validationErrorResponse(
        `Player name must be between ${MIN_NICKNAME_LENGTH} and ${MAX_NICKNAME_LENGTH} characters`,
        'playerName'
      )
    }

    // Find the room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', roomCode)
      .single()

    if (roomError || !room) {
      return notFoundResponse('room', roomCode)
    }

    // Check room status
    if (room.status !== 'waiting') {
      return validationErrorResponse(
        'This room is no longer accepting players. The game may have already started.',
        'roomCode'
      )
    }

    // Check player count
    const { count: playerCount, error: countError } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('room_code', roomCode)

    if (countError) {
      return databaseErrorResponse('Failed to check player count')
    }

    if ((playerCount ?? 0) >= room.max_players) {
      return validationErrorResponse('Room is full', 'roomCode')
    }

    // Check for duplicate names in the room
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('room_code', roomCode)
      .eq('name', playerName)
      .single()

    if (existingPlayer) {
      return validationErrorResponse('A player with this name is already in the room', 'playerName')
    }

    // Add the player
    const { data: newPlayer, error: playerError } = await supabase
      .from('players')
      .insert({
        room_code: roomCode,
        name: playerName,
        avatar: avatar,
        is_host: false,
      })
      .select()
      .single()

    if (playerError) {
      logger.error('Failed to add player to room:', playerError)
      return databaseErrorResponse('Failed to join room')
    }

    // Fetch all players in the room
    const { data: players } = await supabase
      .from('players')
      .select('id, name, avatar, is_host, score, joined_at, current_answer')
      .eq('room_code', roomCode)
      .order('joined_at', { ascending: true })

    return successResponse(
      {
        playerId: newPlayer.id,
        room: {
          code: room.code,
          status: room.status,
          maxPlayers: room.max_players,
          timeLimit: room.time_limit,
          questionCount: room.total_questions,
          gameMode: room.game_mode,
          category: room.category,
          createdAt: room.created_at,
          players: (players ?? []).map(p => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            isHost: p.is_host,
            score: p.score,
            hasAnswered: p.current_answer !== null,
            joinedAt: p.joined_at,
          })),
        },
      },
      'Joined room successfully'
    )
  } catch (error) {
    logger.error('Room join error:', error)
    return serverErrorResponse(error instanceof Error ? error.message : 'Unknown error occurred')
  }
}

export const GET = () => methodNotAllowedResponse('POST')
export const PUT = () => methodNotAllowedResponse('POST')
export const DELETE = () => methodNotAllowedResponse('POST')
