/**
 * Client-side utilities for quick quiz functionality
 *
 * @module lib/quickQuizApi
 * @since 1.0.0
 */

import { apiFetch } from './apiFetch'
import { createBaseSession } from './session'
import { calculateGameScore, getGrade } from './scoring'
import { shuffleArray } from './utils'
import type { QuickQuizQuestion as _QuickQuizQuestion } from '@/types/quiz'

// Re-export canonical type so existing imports from this module continue to work
export type QuickQuizQuestion = _QuickQuizQuestion

/**
 * Client-side response shape for quick quiz fetches.
 *
 * @see {@link import('@/types/quiz').QuickQuizResponse} for the canonical API contract
 */
export interface QuickQuizResponse {
  success: boolean
  data?: QuickQuizQuestion[]
  error?: string
  code?: string
  message?: string
  meta?: {
    timestamp: string
  }
}

/**
 * Fetches quick quiz questions for a specific category.
 *
 * @param category - Category name to fetch.
 * @param difficulty - Optional difficulty filter (e.g. from adaptive engine). Defaults to mixed.
 */
export async function fetchQuickQuiz(
  category: string,
  difficulty?: string
): Promise<QuickQuizResponse> {
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    return {
      success: false,
      error: 'Category is required and must be a non-empty string',
      message: 'Failed to fetch quiz questions',
    }
  }

  const body: Record<string, string> = { category: category.trim() }
  if (difficulty) body.difficulty = difficulty

  return apiFetch<QuickQuizQuestion[]>('/api/quiz/quick', {
    method: 'POST',
    body,
    errorContext: 'fetch quick quiz',
  }) as Promise<QuickQuizResponse>
}

/**
 * Validates a quiz question structure
 */
export function validateQuizQuestion(question: unknown): question is QuickQuizQuestion {
  if (typeof question !== 'object' || question === null) return false

  const q = question as Record<string, unknown>

  return (
    typeof q.id === 'number' &&
    typeof q.question === 'string' &&
    q.question.length > 0 &&
    Array.isArray(q.options) &&
    q.options.length > 1 &&
    q.options.every((opt: unknown) => typeof opt === 'string') &&
    typeof q.correctAnswer === 'number' &&
    q.correctAnswer >= 0 &&
    q.correctAnswer < q.options.length &&
    typeof q.category === 'string' &&
    typeof q.difficulty === 'string'
  )
}

/**
 * Shuffles the questions array and returns a new array
 * @deprecated Use `shuffleArray` from `lib/utils` directly for new code.
 */
export function shuffleQuestions(questions: QuickQuizQuestion[]): QuickQuizQuestion[] {
  return shuffleArray(questions)
}

/**
 * Creates a quiz session with timing and scoring
 */
export interface QuickQuizSession {
  sessionId: string
  questions: QuickQuizQuestion[]
  currentQuestionIndex: number
  answers: Array<{
    questionId: number
    selectedAnswer: number | null
    isCorrect: boolean
    timeSpent: number
    timestamp: Date
  }>
  startTime: Date
  category: string
  isComplete: boolean
}

export function createQuickQuizSession(
  questions: QuickQuizQuestion[],
  category: string
): QuickQuizSession {
  return {
    ...createBaseSession('quick', shuffleQuestions(questions)),
    answers: [],
    category,
    isComplete: false,
  }
}

/**
 * Records an answer in the quiz session
 */
export function recordAnswer(
  session: QuickQuizSession,
  selectedAnswer: number | null,
  timeSpent: number
): QuickQuizSession {
  const currentQuestion = session.questions[session.currentQuestionIndex]
  if (!currentQuestion) return session

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer

  const updatedSession: QuickQuizSession = {
    ...session,
    answers: [
      ...session.answers,
      {
        questionId: currentQuestion.id,
        selectedAnswer,
        isCorrect,
        timeSpent,
        timestamp: new Date(),
      },
    ],
    currentQuestionIndex: session.currentQuestionIndex + 1,
    isComplete: session.currentQuestionIndex + 1 >= session.questions.length,
  }

  return updatedSession
}

/**
 * Calculates final quiz results
 */
export interface QuizResults {
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  totalTime: number
  averageTime: number
  score: number
  grade: string
}

export function calculateQuizResults(session: QuickQuizSession): QuizResults {
  const result = calculateGameScore(session.answers, session.questions.length, { maxTimeBonus: 20 })

  return {
    totalQuestions: result.totalQuestions,
    correctAnswers: result.correctAnswers,
    accuracy: result.accuracy,
    totalTime: result.totalTime,
    averageTime: result.averageTime,
    score: result.score,
    grade: getGrade(result.accuracy),
  }
}
