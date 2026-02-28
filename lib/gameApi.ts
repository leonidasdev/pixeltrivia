/**
 * Game API Client
 *
 * Types and utilities for game questions and sessions.
 *
 * @module lib/gameApi
 * @since 1.0.0
 */

import { logger } from './logger'
import { generateId } from './utils'
import type { Question } from '@/types'

export interface GameQuestion extends Question {
  id: number
  questionNumber: number
  timeLimit: number
}

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
  try {
    const params = new URLSearchParams({
      category,
      difficulty,
      limit: limit.toString(),
    })

    const response = await fetch(`/api/game/questions?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data: FetchQuestionsResponse = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch questions')
    }

    return data
  } catch (error) {
    logger.error('Error fetching questions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to fetch questions',
    }
  }
}

/**
 * Game session management
 */
export interface GameSession {
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
 * Creates a new game session
 */
export function createGameSession(
  questions: GameQuestion[],
  category: string,
  difficulty: string
): GameSession {
  return {
    sessionId: generateId('game'),
    questions,
    currentQuestionIndex: 0,
    score: 0,
    startTime: new Date(),
    answers: [],
    category,
    difficulty,
  }
}
