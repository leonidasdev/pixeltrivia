/**
 * POST /api/room/[code]/next — Advance to the next question
 *
 * Host-only action. Calculates results for the current question,
 * advances to the next one, or ends the game if it was the last.
 *
 * Request body:
 *   - playerId: number (required, must be host)
 *
 * @module api/room/[code]/next
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

    // Verify host
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
      return validationErrorResponse('Only the host can advance questions', 'playerId')
    }

    // Get room state
    const { data: room } = await supabase
      .from('rooms')
      .select('status, current_question, total_questions')
      .eq('code', roomCode)
      .single()

    if (!room) {
      return notFoundResponse('room', roomCode)
    }

    if (room.status !== 'active') {
      return validationErrorResponse('Game is not in progress', 'status')
    }

    // Get current question's correct answer for results
    const { data: currentQuestion } = await supabase
      .from('game_questions')
      .select('correct_answer')
      .eq('room_code', roomCode)
      .eq('question_index', room.current_question)
      .single()

    // Get all player scores for current question results
    const { data: players } = await supabase
      .from('players')
      .select('id, name, score, current_answer, answers')
      .eq('room_code', roomCode)
      .order('score', { ascending: false })

    const questionResults = (players ?? []).map(p => {
      const currentAnswers = Array.isArray(p.answers) ? p.answers : []
      const thisAnswer = currentAnswers.find(
        (a: { questionIndex: number }) => a.questionIndex === room.current_question
      )
      return {
        playerId: p.id,
        playerName: p.name,
        answer: p.current_answer !== null ? parseInt(p.current_answer) : null,
        correct: thisAnswer?.correct ?? false,
        scoreGained: thisAnswer?.score ?? 0,
        totalScore: p.score,
      }
    })

    const nextQuestionIndex = room.current_question + 1
    const isLastQuestion = nextQuestionIndex >= room.total_questions

    if (isLastQuestion) {
      // End the game
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ status: 'finished', question_start_time: null })
        .eq('code', roomCode)

      if (updateError) {
        logger.error('Failed to end game:', updateError)
        return databaseErrorResponse('Failed to end game')
      }

      return successResponse({
        gameOver: true,
        correctAnswer: currentQuestion?.correct_answer ?? null,
        questionResults,
        finalScores: (players ?? []).map(p => ({
          playerId: p.id,
          playerName: p.name,
          totalScore: p.score,
        })),
      })
    }

    // Advance to next question
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('rooms')
      .update({
        current_question: nextQuestionIndex,
        question_start_time: now,
      })
      .eq('code', roomCode)

    if (updateError) {
      logger.error('Failed to advance question:', updateError)
      return databaseErrorResponse('Failed to advance to next question')
    }

    // Reset player answers for new question
    await supabase
      .from('players')
      .update({ current_answer: null, answer_time: null })
      .eq('room_code', roomCode)

    // Get next question (without correct answer)
    const { data: nextQuestion } = await supabase
      .from('game_questions')
      .select('question_text, options, category, difficulty')
      .eq('room_code', roomCode)
      .eq('question_index', nextQuestionIndex)
      .single()

    return successResponse({
      gameOver: false,
      correctAnswer: currentQuestion?.correct_answer ?? null,
      questionResults,
      nextQuestion: nextQuestion
        ? {
            index: nextQuestionIndex,
            questionText: nextQuestion.question_text,
            options: nextQuestion.options,
            category: nextQuestion.category,
            difficulty: nextQuestion.difficulty,
          }
        : null,
      questionStartTime: now,
    })
  } catch (error) {
    logger.error('Next question error:', error)
    return serverErrorResponse(error instanceof Error ? error.message : 'Unknown error')
  }
}

export const GET = () => methodNotAllowedResponse('POST')
export const PUT = () => methodNotAllowedResponse('POST')
export const DELETE = () => methodNotAllowedResponse('POST')
