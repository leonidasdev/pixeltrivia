/**
 * useQuizSession Hook
 *
 * Complete quiz session management including questions, answers, and scoring.
 *
 * @module hooks/useQuizSession
 * @since 1.0.0
 */

import { useState, useCallback, useMemo } from 'react'
import type {
  Question,
  QuizSession,
  QuizAnswer,
  QuizResults,
  QuizType,
  QuizSessionSettings,
} from '../types'
import { DEFAULT_QUIZ_SETTINGS } from '../types/quiz'
import { BASE_SCORE } from '../constants/game'

/**
 * Quiz session actions
 */
export interface QuizSessionActions {
  /** Initialize a new quiz session */
  initSession: (
    questions: Question[],
    quizType: QuizType,
    settings?: Partial<QuizSessionSettings>
  ) => void
  /** Submit an answer for the current question */
  submitAnswer: (selectedAnswer: number | null, timeSpent: number) => boolean
  /** Skip the current question */
  skipQuestion: () => void
  /** Get the current question */
  getCurrentQuestion: () => Question | null
  /** Move to the next question (after reviewing answer) */
  nextQuestion: () => void
  /** Complete the quiz and get results */
  completeQuiz: () => QuizResults | null
  /** Reset the session */
  resetSession: () => void
  /** Check if there are more questions */
  hasNextQuestion: () => boolean
}

/**
 * Quiz session state for display
 */
export interface QuizSessionState {
  /** Current session data (null if not started) */
  session: QuizSession | null
  /** Whether a session is active */
  isActive: boolean
  /** Current question number (1-based for display) */
  currentQuestionNumber: number
  /** Total questions in session */
  totalQuestions: number
  /** Number of correct answers so far */
  correctCount: number
  /** Current score */
  currentScore: number
  /** Whether showing answer feedback */
  isShowingFeedback: boolean
  /** Last answer result (for feedback) */
  lastAnswerResult: QuizAnswer | null
}

/**
 * Return type of the useQuizSession hook
 */
export type UseQuizSessionReturn = QuizSessionState & QuizSessionActions

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Generate a unique session ID
 */
function generateSessionId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Custom hook for managing complete quiz sessions
 *
 * @returns Quiz session state and actions
 *
 * @example
 * ```tsx
 * const {
 *   session,
 *   isActive,
 *   currentQuestionNumber,
 *   totalQuestions,
 *   correctCount,
 *   initSession,
 *   submitAnswer,
 *   nextQuestion,
 *   completeQuiz
 * } = useQuizSession()
 *
 * // Start a quiz
 * initSession(questions, 'quick', { timeLimit: 30 })
 *
 * // Submit answer
 * const isCorrect = submitAnswer(selectedIndex, timeSpentMs)
 *
 * // After feedback, move to next
 * nextQuestion()
 *
 * // Get final results
 * const results = completeQuiz()
 * ```
 */
export function useQuizSession(): UseQuizSessionReturn {
  const [session, setSession] = useState<QuizSession | null>(null)
  const [isShowingFeedback, setIsShowingFeedback] = useState(false)
  const [lastAnswerResult, setLastAnswerResult] = useState<QuizAnswer | null>(null)

  /**
   * Initialize a new quiz session
   */
  const initSession = useCallback(
    (questions: Question[], quizType: QuizType, settings: Partial<QuizSessionSettings> = {}) => {
      const mergedSettings: QuizSessionSettings = {
        ...DEFAULT_QUIZ_SETTINGS,
        ...settings,
      }

      const processedQuestions = mergedSettings.shuffleQuestions
        ? shuffleArray(questions)
        : [...questions]

      const newSession: QuizSession = {
        sessionId: generateSessionId(quizType),
        quizType,
        questions: processedQuestions,
        currentQuestionIndex: 0,
        answers: [],
        startTime: new Date(),
        isComplete: false,
        settings: mergedSettings,
      }

      setSession(newSession)
      setIsShowingFeedback(false)
      setLastAnswerResult(null)
    },
    []
  )

  /**
   * Submit an answer for the current question
   */
  const submitAnswer = useCallback(
    (selectedAnswer: number | null, timeSpent: number): boolean => {
      if (!session || session.isComplete) return false

      const currentQuestion = session.questions[session.currentQuestionIndex]
      if (!currentQuestion) return false

      const isCorrect = selectedAnswer === currentQuestion.correctAnswer

      const answer: QuizAnswer = {
        questionId: currentQuestion.id,
        selectedAnswer,
        isCorrect,
        timeSpent,
        timestamp: new Date(),
      }

      setLastAnswerResult(answer)

      if (session.settings.showFeedback) {
        setIsShowingFeedback(true)
      }

      setSession(prev => {
        if (!prev) return null
        return {
          ...prev,
          answers: [...prev.answers, answer],
        }
      })

      return isCorrect
    },
    [session]
  )

  /**
   * Skip the current question
   */
  const skipQuestion = useCallback(() => {
    if (!session || session.isComplete || !session.settings.allowSkip) return

    // Submit null answer for skipped question
    submitAnswer(null, 0)
  }, [session, submitAnswer])

  /**
   * Get the current question
   */
  const getCurrentQuestion = useCallback((): Question | null => {
    if (!session) return null
    return session.questions[session.currentQuestionIndex] ?? null
  }, [session])

  /**
   * Move to the next question
   */
  const nextQuestion = useCallback(() => {
    setIsShowingFeedback(false)
    setLastAnswerResult(null)

    setSession(prev => {
      if (!prev) return null

      const nextIndex = prev.currentQuestionIndex + 1
      const isComplete = nextIndex >= prev.questions.length

      return {
        ...prev,
        currentQuestionIndex: isComplete ? prev.currentQuestionIndex : nextIndex,
        isComplete,
      }
    })
  }, [])

  /**
   * Check if there are more questions
   */
  const hasNextQuestion = useCallback((): boolean => {
    if (!session) return false
    return session.currentQuestionIndex < session.questions.length - 1
  }, [session])

  /**
   * Complete the quiz and get results
   */
  const completeQuiz = useCallback((): QuizResults | null => {
    if (!session) return null

    const correctCount = session.answers.filter(a => a.isCorrect).length
    const totalTime = session.answers.reduce((sum, a) => sum + a.timeSpent, 0)
    const accuracy =
      session.questions.length > 0 ? (correctCount / session.questions.length) * 100 : 0

    // Calculate score with time bonus
    const baseScore = correctCount * BASE_SCORE
    const avgTimePerQuestion = session.answers.length > 0 ? totalTime / session.answers.length : 0
    const timeBonus = Math.max(0, (session.settings.timeLimit * 1000 - avgTimePerQuestion) / 100)
    const finalScore = Math.round(baseScore + timeBonus * correctCount)

    const results: QuizResults = {
      sessionId: session.sessionId,
      quizType: session.quizType,
      correctCount,
      totalQuestions: session.questions.length,
      accuracy,
      totalTime,
      averageTime: avgTimePerQuestion,
      score: finalScore,
      answers: session.answers,
      completedAt: new Date(),
    }

    // Mark session as complete
    setSession(prev => (prev ? { ...prev, isComplete: true } : null))

    return results
  }, [session])

  /**
   * Reset the session
   */
  const resetSession = useCallback(() => {
    setSession(null)
    setIsShowingFeedback(false)
    setLastAnswerResult(null)
  }, [])

  // Computed state values
  const state = useMemo((): QuizSessionState => {
    const isActive = session !== null && !session.isComplete
    const currentQuestionNumber = session ? session.currentQuestionIndex + 1 : 0
    const totalQuestions = session?.questions.length ?? 0
    const correctCount = session?.answers.filter(a => a.isCorrect).length ?? 0
    const currentScore = correctCount * BASE_SCORE // Simplified for display

    return {
      session,
      isActive,
      currentQuestionNumber,
      totalQuestions,
      correctCount,
      currentScore,
      isShowingFeedback,
      lastAnswerResult,
    }
  }, [session, isShowingFeedback, lastAnswerResult])

  return {
    ...state,
    initSession,
    submitAnswer,
    skipQuestion,
    getCurrentQuestion,
    nextQuestion,
    completeQuiz,
    resetSession,
    hasNextQuestion,
  }
}
