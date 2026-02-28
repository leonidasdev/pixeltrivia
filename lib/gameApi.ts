/**
 * Game API Client
 *
 * Types and utilities for game questions and sessions.
 *
 * @module lib/gameApi
 * @since 1.0.0
 */

import { apiFetch } from './apiFetch'
import { createBaseSession } from './session'
import type { Question } from '@/types'

export interface GameQuestion extends Question {
  id: number
  questionNumber: number
  timeLimit: number
}

/**
 * Client-side response shape for fetching game questions.
 *
 * @see {@link import('@/types/api').ApiResponse} for the canonical API envelope
 */
export interface FetchQuestionsResponse {
  success: boolean
  data?: {
    questions: GameQuestion[]
    totalQuestions: number
    selectedCategory: string
    selectedDifficulty: string
    timeLimit: number
  }
  error?: string
  code?: string
  message?: string
  meta?: {
    timestamp: string
  }
}

/**
 * Fetches questions for a quick game
 */
export async function fetchQuestions(
  category: string,
  difficulty: string,
  limit: number = 10
): Promise<FetchQuestionsResponse> {
  const params = new URLSearchParams({
    category,
    difficulty,
    limit: limit.toString(),
  })

  return apiFetch<FetchQuestionsResponse['data']>(`/api/game/questions?${params}`, {
    errorContext: 'fetch questions',
  }) as Promise<FetchQuestionsResponse>
}

/**
 * Game session management
 */
/**
 * Client-side game session state (lightweight).
 *
 * Unlike the canonical {@link import('@/types/game').GameSession GameSession},
 * this type omits `state`, `isComplete`, and `timestamp` on answers, since
 * those are managed in the component layer for the active game.
 *
 * @see {@link import('@/types/game').GameSession} for the full session type
 */
export interface ActiveGameSession {
  sessionId: string
  questions: GameQuestion[]
  currentQuestionIndex: number
  score: number
  startTime: Date
  answers: Array<{
    questionId: number
    selectedAnswer: number
    isCorrect: boolean
    timeSpent: number
  }>
  category: string
  difficulty: string
}

/**
 * @deprecated Use {@link ActiveGameSession} instead. Kept for backward compatibility.
 */
export type GameSession = ActiveGameSession

/**
 * Creates a new game session
 */
export function createGameSession(
  questions: GameQuestion[],
  category: string,
  difficulty: string
): ActiveGameSession {
  return {
    ...createBaseSession('game', questions),
    score: 0,
    answers: [],
    category,
    difficulty,
  }
}
