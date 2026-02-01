/**
 * useGameState Hook
 *
 * Manages game state including current question, score, and answers.
 *
 * @module hooks/useGameState
 * @since 1.0.0
 */

import { useState, useCallback, useMemo } from 'react'
import type { Question, GameState, Answer, GameSummary, DifficultyLevel } from '../types/game'
import { BASE_SCORE, STREAK_INCREMENT, MAX_STREAK_MULTIPLIER } from '../constants/game'

/**
 * Game state managed by the hook
 */
export interface GameStateData {
  /** Current game state */
  state: GameState
  /** Array of questions */
  questions: Question[]
  /** Current question index (0-based) */
  currentQuestionIndex: number
  /** Current score */
  score: number
  /** Array of submitted answers */
  answers: Answer[]
  /** Current streak of correct answers */
  streak: number
  /** Game category */
  category: string
  /** Game difficulty */
  difficulty: DifficultyLevel
  /** Start time */
  startTime: Date | null
}

/**
 * Actions returned by the hook
 */
export interface GameStateActions {
  /** Start a new game with questions */
  startGame: (questions: Question[], category: string, difficulty: DifficultyLevel) => void
  /** Submit an answer for the current question */
  submitAnswer: (selectedAnswer: number | null, timeSpent: number) => boolean
  /** Move to the next question */
  nextQuestion: () => void
  /** Pause the game */
  pauseGame: () => void
  /** Resume the game */
  resumeGame: () => void
  /** End the game */
  endGame: () => void
  /** Reset the game state */
  resetGame: () => void
  /** Get the current question */
  getCurrentQuestion: () => Question | null
  /** Get the game summary */
  getSummary: () => GameSummary | null
}

/**
 * Return type of the useGameState hook
 */
export type UseGameStateReturn = GameStateData & GameStateActions

/**
 * Initial game state
 */
const initialState: GameStateData = {
  state: 'idle',
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  answers: [],
  streak: 0,
  category: '',
  difficulty: 'classic',
  startTime: null,
}

/**
 * Custom hook for managing game state
 *
 * @returns Game state data and actions
 *
 * @example
 * ```tsx
 * const {
 *   state,
 *   score,
 *   currentQuestionIndex,
 *   startGame,
 *   submitAnswer,
 *   nextQuestion,
 *   getSummary
 * } = useGameState()
 *
 * // Start a new game
 * startGame(questions, 'Science', 'college')
 *
 * // Submit an answer
 * const isCorrect = submitAnswer(selectedIndex, timeSpent)
 *
 * // Move to next question
 * nextQuestion()
 * ```
 */
export function useGameState(): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameStateData>(initialState)

  /**
   * Calculate score with streak bonus
   */
  const calculateScore = useCallback((streak: number): number => {
    const multiplier = Math.min(1 + streak * STREAK_INCREMENT, MAX_STREAK_MULTIPLIER)
    return Math.round(BASE_SCORE * multiplier)
  }, [])

  /**
   * Start a new game
   */
  const startGame = useCallback(
    (questions: Question[], category: string, difficulty: DifficultyLevel) => {
      setGameState({
        state: 'playing',
        questions,
        currentQuestionIndex: 0,
        score: 0,
        answers: [],
        streak: 0,
        category,
        difficulty,
        startTime: new Date(),
      })
    },
    []
  )

  /**
   * Submit an answer for the current question
   */
  const submitAnswer = useCallback(
    (selectedAnswer: number | null, timeSpent: number): boolean => {
      const currentQuestion = gameState.questions[gameState.currentQuestionIndex]
      if (!currentQuestion || gameState.state !== 'playing') {
        return false
      }

      const isCorrect = selectedAnswer === currentQuestion.correctAnswer

      const answer: Answer = {
        questionId: currentQuestion.id,
        selectedAnswer,
        isCorrect,
        timeSpent,
        timestamp: new Date(),
      }

      setGameState(prev => {
        const newStreak = isCorrect ? prev.streak + 1 : 0
        const scoreIncrease = isCorrect ? calculateScore(prev.streak) : 0

        return {
          ...prev,
          answers: [...prev.answers, answer],
          score: prev.score + scoreIncrease,
          streak: newStreak,
        }
      })

      return isCorrect
    },
    [gameState.questions, gameState.currentQuestionIndex, gameState.state, calculateScore]
  )

  /**
   * Move to the next question
   */
  const nextQuestion = useCallback(() => {
    setGameState(prev => {
      const nextIndex = prev.currentQuestionIndex + 1

      if (nextIndex >= prev.questions.length) {
        return { ...prev, state: 'finished' }
      }

      return { ...prev, currentQuestionIndex: nextIndex }
    })
  }, [])

  /**
   * Pause the game
   */
  const pauseGame = useCallback(() => {
    setGameState(prev => (prev.state === 'playing' ? { ...prev, state: 'paused' } : prev))
  }, [])

  /**
   * Resume the game
   */
  const resumeGame = useCallback(() => {
    setGameState(prev => (prev.state === 'paused' ? { ...prev, state: 'playing' } : prev))
  }, [])

  /**
   * End the game
   */
  const endGame = useCallback(() => {
    setGameState(prev => ({ ...prev, state: 'finished' }))
  }, [])

  /**
   * Reset the game state
   */
  const resetGame = useCallback(() => {
    setGameState(initialState)
  }, [])

  /**
   * Get the current question
   */
  const getCurrentQuestion = useCallback((): Question | null => {
    return gameState.questions[gameState.currentQuestionIndex] ?? null
  }, [gameState.questions, gameState.currentQuestionIndex])

  /**
   * Get the game summary
   */
  const getSummary = useCallback((): GameSummary | null => {
    if (gameState.state !== 'finished' || gameState.answers.length === 0) {
      return null
    }

    const correctAnswers = gameState.answers.filter(a => a.isCorrect).length
    const totalQuestions = gameState.questions.length
    const totalTime = gameState.answers.reduce((sum, a) => sum + a.timeSpent, 0)

    return {
      correctAnswers,
      totalQuestions,
      accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
      totalTime,
      averageTime: gameState.answers.length > 0 ? totalTime / gameState.answers.length : 0,
      finalScore: gameState.score,
    }
  }, [gameState.state, gameState.answers, gameState.questions.length, gameState.score])

  return useMemo(
    () => ({
      ...gameState,
      startGame,
      submitAnswer,
      nextQuestion,
      pauseGame,
      resumeGame,
      endGame,
      resetGame,
      getCurrentQuestion,
      getSummary,
    }),
    [
      gameState,
      startGame,
      submitAnswer,
      nextQuestion,
      pauseGame,
      resumeGame,
      endGame,
      resetGame,
      getCurrentQuestion,
      getSummary,
    ]
  )
}
