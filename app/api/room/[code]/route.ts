/**
 * GET /api/room/[code] — Get room state
 * DELETE /api/room/[code] — Leave or close room
 *
 * @module api/room/[code]
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

interface RouteParams {
  params: Promise<{ code: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params
    const roomCode = code.toUpperCase()

    if (!isValidRoomCode(roomCode)) {
      return validationErrorResponse('Invalid room code format', 'code')
    }

    const supabase = getSupabaseClient()

    // Fetch room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', roomCode)
      .single()

    if (roomError || !room) {
      return notFoundResponse('room', roomCode)
    }

    // Fetch players
    const { data: players } = await supabase
      .from('players')
      .select('id, name, avatar, is_host, score, joined_at, current_answer')
      .eq('room_code', roomCode)
      .order('joined_at', { ascending: true })

    return successResponse({
      code: room.code,
      status: room.status,
      currentQuestion: room.current_question,
      totalQuestions: room.total_questions,
      questionStartTime: room.question_start_time,
      timeLimit: room.time_limit,
      maxPlayers: room.max_players,
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
    })
  } catch (error) {
    logger.error('Get room error:', error)
    return serverErrorResponse(error instanceof Error ? error.message : 'Unknown error')
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params
    const roomCode = code.toUpperCase()

    if (!isValidRoomCode(roomCode)) {
      return validationErrorResponse('Invalid room code format', 'code')
    }

    const supabase = getSupabaseClient()
    const body = await request.json()
    const playerId = typeof body.playerId === 'number' ? body.playerId : null

    if (!playerId) {
      return validationErrorResponse('Player ID is required', 'playerId')
    }

    // Check if player is host
    const { data: player } = await supabase
      .from('players')
      .select('is_host')
      .eq('id', playerId)
      .eq('room_code', roomCode)
      .single()

    if (!player) {
      return notFoundResponse('player', String(playerId))
    }

    if (player.is_host) {
      // Host leaving closes the room
      const { error } = await supabase
        .from('rooms')
        .update({ status: 'finished' })
        .eq('code', roomCode)

      if (error) {
        return databaseErrorResponse('Failed to close room')
      }

      return successResponse({ action: 'room_closed' }, 'Room closed')
    } else {
      // Regular player leaves
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId)
        .eq('room_code', roomCode)

      if (error) {
        return databaseErrorResponse('Failed to leave room')
      }

      return successResponse({ action: 'player_left' }, 'Left room')
    }
  } catch (error) {
    logger.error('Leave room error:', error)
    return serverErrorResponse(error instanceof Error ? error.message : 'Unknown error')
  }
}

export const POST = () => methodNotAllowedResponse('GET, DELETE')
export const PUT = () => methodNotAllowedResponse('GET, DELETE')
