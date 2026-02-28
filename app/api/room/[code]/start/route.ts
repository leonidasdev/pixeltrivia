/**
 * POST /api/room/[code]/start — Start the multiplayer game
 *
 * Host-only action. Selects questions and begins the game.
 *
 * Request body:
 *   - playerId: number (required, must be host)
 *
 * @module api/room/[code]/start
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
import { MIN_PLAYERS_TO_START } from '@/constants/game'
import { shuffleArray } from '@/lib/utils'

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

    if (!playerId) {
      return validationErrorResponse('Player ID is required', 'playerId')
    }

    // Verify player is the host
    const { data: player } = await supabase
      .from('players')
      .select('is_host')
      .eq('id', playerId)
      .eq('room_code', roomCode)
      .single()

    if (!player) {
      return notFoundResponse('player', String(playerId))
    }

    if (!player.is_host) {
      return validationErrorResponse('Only the host can start the game', 'playerId')
    }

    // Fetch room
    const { data: room } = await supabase.from('rooms').select('*').eq('code', roomCode).single()

    if (!room) {
      return notFoundResponse('room', roomCode)
    }

    if (room.status !== 'waiting') {
      return validationErrorResponse('Game has already started or finished', 'status')
    }

    // Check minimum players
    const { count: playerCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('room_code', roomCode)

    if ((playerCount ?? 0) < MIN_PLAYERS_TO_START) {
      return validationErrorResponse(
        `Need at least ${MIN_PLAYERS_TO_START} players to start`,
        'players'
      )
    }

    // Select questions for the game
    const questionCount = room.total_questions || 10

    let questionQuery = supabase
      .from('questions')
      .select('question_text, options, correct_answer, category, difficulty')

    // Apply category filter if set
    if (room.category) {
      questionQuery = questionQuery.ilike('category', `%${room.category}%`)
    }

    const { data: availableQuestions, error: questionsError } = await questionQuery.limit(50)

    if (questionsError || !availableQuestions || availableQuestions.length === 0) {
      logger.error('Failed to fetch questions:', questionsError)
      return databaseErrorResponse('No questions available for this game configuration')
    }

    // Shuffle and select the required number of questions
    const shuffled = shuffleArray(availableQuestions)
    const selectedQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length))

    // Store questions in game_questions table
    const gameQuestions = selectedQuestions.map((q, index) => ({
      room_code: roomCode,
      question_index: index,
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      category: q.category,
      difficulty: q.difficulty,
    }))

    const { error: insertError } = await supabase.from('game_questions').insert(gameQuestions)

    if (insertError) {
      logger.error('Failed to store game questions:', insertError)
      return databaseErrorResponse('Failed to prepare game questions')
    }

    // Update room status to active
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('rooms')
      .update({
        status: 'active',
        current_question: 0,
        total_questions: selectedQuestions.length,
        question_start_time: now,
      })
      .eq('code', roomCode)

    if (updateError) {
      logger.error('Failed to start game:', updateError)
      return databaseErrorResponse('Failed to start game')
    }

    // Reset all player answers
    await supabase
      .from('players')
      .update({ current_answer: null, answer_time: null, score: 0 })
      .eq('room_code', roomCode)

    // Return first question (without correct answer)
    const firstQuestion = selectedQuestions[0]
    return successResponse(
      {
        started: true,
        totalQuestions: selectedQuestions.length,
        currentQuestion: {
          index: 0,
          questionText: firstQuestion.question_text,
          options: firstQuestion.options,
          category: firstQuestion.category,
          difficulty: firstQuestion.difficulty,
        },
        questionStartTime: now,
      },
      'Game started'
    )
  } catch (error) {
    logger.error('Start game error:', error)
    return serverErrorResponse(error instanceof Error ? error.message : 'Unknown error')
  }
}

export const GET = () => methodNotAllowedResponse('POST')
export const PUT = () => methodNotAllowedResponse('POST')
export const DELETE = () => methodNotAllowedResponse('POST')
