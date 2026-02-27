/**
 * GET /api/room/[code]/question — Get the current question
 *
 * Returns the current question for the game (without the correct answer).
 * Query params:
 *   - playerId: number (required)
 *
 * @module api/room/[code]/question
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
  serverErrorResponse,
  methodNotAllowedResponse,
} from '@/lib/apiResponse'

interface RouteParams {
  params: Promise<{ code: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params
    const roomCode = code.toUpperCase()

    if (!isValidRoomCode(roomCode)) {
      return validationErrorResponse('Invalid room code format', 'code')
    }

    const supabase = getSupabaseClient()

    // Get playerId from query params
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')

    if (!playerId) {
      return validationErrorResponse('Player ID is required', 'playerId')
    }

    // Verify player belongs to this room
    const { data: player } = await supabase
      .from('players')
      .select('id, current_answer')
      .eq('id', parseInt(playerId))
      .eq('room_code', roomCode)
      .single()

    if (!player) {
      return notFoundResponse('player', playerId)
    }

    // Get room state
    const { data: room } = await supabase
      .from('rooms')
      .select('status, current_question, total_questions, question_start_time, time_limit')
      .eq('code', roomCode)
      .single()

    if (!room) {
      return notFoundResponse('room', roomCode)
    }

    if (room.status !== 'active') {
      return validationErrorResponse('Game is not in progress', 'status')
    }

    // Get current question (WITHOUT correct_answer)
    const { data: question } = await supabase
      .from('game_questions')
      .select('question_text, options, category, difficulty')
      .eq('room_code', roomCode)
      .eq('question_index', room.current_question)
      .single()

    if (!question) {
      return notFoundResponse('question', String(room.current_question))
    }

    // Get player answer status for all players
    const { data: players } = await supabase
      .from('players')
      .select('id, name, avatar, is_host, score, current_answer')
      .eq('room_code', roomCode)
      .order('score', { ascending: false })

    return successResponse({
      question: {
        index: room.current_question,
        questionText: question.question_text,
        options: question.options,
        category: question.category,
        difficulty: question.difficulty,
      },
      totalQuestions: room.total_questions,
      questionStartTime: room.question_start_time,
      timeLimit: room.time_limit,
      hasAnswered: player.current_answer !== null,
      players: (players ?? []).map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isHost: p.is_host,
        score: p.score,
        hasAnswered: p.current_answer !== null,
      })),
    })
  } catch (error) {
    logger.error('Get question error:', error)
    return serverErrorResponse(error instanceof Error ? error.message : 'Unknown error')
  }
}

export const POST = () => methodNotAllowedResponse('GET')
export const PUT = () => methodNotAllowedResponse('GET')
export const DELETE = () => methodNotAllowedResponse('GET')
