/**
 * POST /api/room/[code]/answer — Submit an answer
 *
 * Request body:
 *   - playerId: number (required)
 *   - answer: number (required, 0-based option index)
 *   - timeMs: number (required, milliseconds taken to answer)
 *
 * @module api/room/[code]/answer
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
import { BASE_SCORE, TIME_BONUS_MULTIPLIER } from '@/constants/game'

interface RouteParams {
  params: Promise<{ code: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params
    const roomCode = code.toUpperCase()

    if (!isValidRoomCode(roomCode)) {
      return validationErrorResponse('Invalid room code format', 'code')
    }

    const supabase = getSupabaseClient()
    const body = await request.json()

    const playerId = typeof body.playerId === 'number' ? body.playerId : null
    const answer = typeof body.answer === 'number' ? body.answer : null
    const timeMs = typeof body.timeMs === 'number' ? body.timeMs : null

    if (!playerId) {
      return validationErrorResponse('Player ID is required', 'playerId')
    }
    if (answer === null || answer < 0) {
      return validationErrorResponse('Answer index is required', 'answer')
    }
    if (timeMs === null || timeMs < 0) {
      return validationErrorResponse('Time taken is required', 'timeMs')
    }

    // Get room state
    const { data: room } = await supabase
      .from('rooms')
      .select('status, current_question, time_limit')
      .eq('code', roomCode)
      .single()

    if (!room) {
      return notFoundResponse('room', roomCode)
    }

    if (room.status !== 'active') {
      return validationErrorResponse('Game is not in progress', 'status')
    }

    // Check player exists and hasn't already answered
    const { data: player } = await supabase
      .from('players')
      .select('id, current_answer, score, answers')
      .eq('id', playerId)
      .eq('room_code', roomCode)
      .single()

    if (!player) {
      return notFoundResponse('player', String(playerId))
    }

    if (player.current_answer !== null) {
      return validationErrorResponse('You have already answered this question', 'answer')
    }

    // Get the correct answer from game_questions
    const { data: question } = await supabase
      .from('game_questions')
      .select('correct_answer')
      .eq('room_code', roomCode)
      .eq('question_index', room.current_question)
      .single()

    if (!question) {
      return serverErrorResponse('Question not found')
    }

    // Calculate score
    const isCorrect = answer === question.correct_answer
    const timeLimitMs = (room.time_limit || 30) * 1000
    const timeBonus = isCorrect ? Math.max(0, 1 - timeMs / timeLimitMs) * TIME_BONUS_MULTIPLIER : 0
    const scoreGained = isCorrect ? Math.round(BASE_SCORE * (1 + timeBonus)) : 0

    // Record the answer
    const existingAnswers = Array.isArray(player.answers) ? player.answers : []
    const updatedAnswers = [
      ...existingAnswers,
      {
        questionIndex: room.current_question,
        answer,
        timeMs,
        correct: isCorrect,
        score: scoreGained,
      },
    ]

    const { error: updateError } = await supabase
      .from('players')
      .update({
        current_answer: String(answer),
        answer_time: new Date().toISOString(),
        score: (player.score || 0) + scoreGained,
        answers: updatedAnswers,
      })
      .eq('id', playerId)

    if (updateError) {
      logger.error('Failed to record answer:', updateError)
      return databaseErrorResponse('Failed to record answer')
    }

    return successResponse(
      {
        accepted: true,
        correct: isCorrect,
        scoreGained,
        totalScore: (player.score || 0) + scoreGained,
      },
      isCorrect ? 'Correct!' : 'Incorrect'
    )
  } catch (error) {
    logger.error('Submit answer error:', error)
    return serverErrorResponse(error instanceof Error ? error.message : 'Unknown error')
  }
}

export const GET = () => methodNotAllowedResponse('POST')
export const PUT = () => methodNotAllowedResponse('POST')
export const DELETE = () => methodNotAllowedResponse('POST')
