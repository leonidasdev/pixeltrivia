/**
 * useMultiplayerGame Hook
 *
 * Manages the multiplayer game state: current question, timer,
 * answer submission, and score tracking. Works with useRoom
 * for real-time state updates.
 *
 * @module hooks/useMultiplayerGame
 * @since 1.1.0
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  startGame as apiStartGame,
  submitAnswer as apiSubmitAnswer,
  nextQuestion as apiNextQuestion,
  getCurrentQuestion,
  type StartGameResult,
  type SubmitAnswerResult,
  type NextQuestionResult,
  type RoomState,
} from '@/lib/multiplayerApi'
import type { MultiplayerQuestion } from '@/types/room'
import { ANSWER_REVEAL_DURATION } from '@/constants/game'

export type MultiplayerGamePhase =
  | 'lobby' // Waiting for game to start
  | 'playing' // Answering a question
  | 'answered' // Player has submitted answer, waiting for others
  | 'revealing' // Showing correct answer and scores
  | 'finished' // Game over, showing final scores

export interface UseMultiplayerGameOptions {
  roomCode: string
  playerId: number | null
  isHost: boolean
  room: RoomState | null
  onRefresh: () => Promise<void>
}

export interface UseMultiplayerGameReturn {
  /** Current game phase */
  phase: MultiplayerGamePhase
  /** Current question data */
  currentQuestion: MultiplayerQuestion | null
  /** Time remaining in seconds */
  timeRemaining: number
  /** Whether the player has answered */
  hasAnswered: boolean
  /** Player's selected answer index */
  selectedAnswer: number | null
  /** Whether the selected answer was correct */
  wasCorrect: boolean | null
  /** Score gained from last answer */
  scoreGained: number
  /** Correct answer index (shown during reveal phase) */
  correctAnswer: number | null
  /** Player scores after a question */
  questionResults: NextQuestionResult['questionResults'] | null
  /** Final scores when game ends */
  finalScores: NextQuestionResult['finalScores'] | null
  /** Loading state */
  isLoading: boolean
  /** Error message */
  error: string | null

  /** Actions */
  startGame: () => Promise<StartGameResult | null>
  submitAnswer: (answer: number) => Promise<SubmitAnswerResult | null>
  nextQuestion: () => Promise<void>
}

export function useMultiplayerGame({
  roomCode,
  playerId,
  isHost,
  room,
  onRefresh,
}: UseMultiplayerGameOptions): UseMultiplayerGameReturn {
  const [phase, setPhase] = useState<MultiplayerGamePhase>('lobby')
  const [currentQuestion, setCurrentQuestion] = useState<MultiplayerQuestion | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null)
  const [scoreGained, setScoreGained] = useState(0)
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null)
  const [questionResults, setQuestionResults] = useState<
    NextQuestionResult['questionResults'] | null
  >(null)
  const [finalScores, setFinalScores] = useState<NextQuestionResult['finalScores'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const questionStartRef = useRef<number>(0)
  const timeLimitRef = useRef<number>(30)

  // Clear timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Start the countdown timer
  const startTimer = useCallback(
    (startTime: string, timeLimit: number) => {
      clearTimer()
      const startMs = new Date(startTime).getTime()
      questionStartRef.current = startMs
      timeLimitRef.current = timeLimit

      const tick = () => {
        const elapsed = (Date.now() - startMs) / 1000
        const remaining = Math.max(0, timeLimit - elapsed)
        setTimeRemaining(Math.ceil(remaining))

        if (remaining <= 0) {
          clearTimer()
        }
      }

      tick() // Immediate tick
      timerRef.current = setInterval(tick, 250) // Update every 250ms for smooth countdown
    },
    [clearTimer]
  )

  // React to room state changes
  useEffect(() => {
    if (!room) return

    if (room.status === 'waiting') {
      setPhase('lobby')
    } else if (room.status === 'finished') {
      setPhase('finished')
      clearTimer()
    } else if (room.status === 'active' && phase === 'lobby') {
      // Game just started — fetch the current question
      if (playerId) {
        fetchCurrentQuestion()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.status, room?.currentQuestion])

  // Fetch and display the current question
  const fetchCurrentQuestion = useCallback(async () => {
    if (!playerId) return

    const result = await getCurrentQuestion(roomCode, playerId)
    if (result.success && result.data) {
      setCurrentQuestion(result.data.question)
      setHasAnswered(result.data.hasAnswered)
      setSelectedAnswer(null)
      setWasCorrect(null)
      setScoreGained(0)
      setCorrectAnswer(null)
      setQuestionResults(null)

      if (result.data.hasAnswered) {
        setPhase('answered')
      } else {
        setPhase('playing')
        if (result.data.questionStartTime) {
          startTimer(result.data.questionStartTime, result.data.timeLimit)
        }
      }
    } else {
      setError(result.error ?? 'Failed to load question')
    }
  }, [roomCode, playerId, startTimer])

  // When room's current question changes, fetch it
  useEffect(() => {
    if (room?.status === 'active' && playerId && phase !== 'revealing') {
      fetchCurrentQuestion()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.currentQuestion])

  // Start game action (host only)
  const handleStartGame = useCallback(async (): Promise<StartGameResult | null> => {
    if (!isHost || !playerId) return null

    setIsLoading(true)
    setError(null)

    const result = await apiStartGame(roomCode, playerId)
    setIsLoading(false)

    if (result.success && result.data) {
      setCurrentQuestion(result.data.currentQuestion)
      setPhase('playing')
      startTimer(result.data.questionStartTime, room?.timeLimit ?? 30)
      await onRefresh()
      return result.data
    } else {
      setError(result.error ?? 'Failed to start game')
      return null
    }
  }, [isHost, playerId, roomCode, room?.timeLimit, startTimer, onRefresh])

  // Submit answer action
  const handleSubmitAnswer = useCallback(
    async (answer: number): Promise<SubmitAnswerResult | null> => {
      if (!playerId || hasAnswered) return null

      const timeMs = Date.now() - questionStartRef.current

      setIsLoading(true)
      setSelectedAnswer(answer)

      const result = await apiSubmitAnswer(roomCode, playerId, answer, timeMs)
      setIsLoading(false)

      if (result.success && result.data) {
        setHasAnswered(true)
        setWasCorrect(result.data.correct)
        setScoreGained(result.data.scoreGained)
        setPhase('answered')
        await onRefresh()
        return result.data
      } else {
        setError(result.error ?? 'Failed to submit answer')
        setSelectedAnswer(null)
        return null
      }
    },
    [playerId, hasAnswered, roomCode, onRefresh]
  )

  // Next question action (host only)
  const handleNextQuestion = useCallback(async () => {
    if (!isHost || !playerId) return

    setIsLoading(true)
    setError(null)
    clearTimer()

    const result = await apiNextQuestion(roomCode, playerId)
    setIsLoading(false)

    if (result.success && result.data) {
      setCorrectAnswer(result.data.correctAnswer)
      setQuestionResults(result.data.questionResults)
      setPhase('revealing')

      if (result.data.gameOver) {
        setFinalScores(result.data.finalScores ?? null)
        // Short delay, then show final scores
        setTimeout(() => {
          setPhase('finished')
          onRefresh()
        }, ANSWER_REVEAL_DURATION)
      } else {
        // Show results briefly, then load next question
        setTimeout(async () => {
          if (result.data?.nextQuestion) {
            setCurrentQuestion(result.data.nextQuestion)
            setHasAnswered(false)
            setSelectedAnswer(null)
            setWasCorrect(null)
            setScoreGained(0)
            setCorrectAnswer(null)
            setQuestionResults(null)
            setPhase('playing')
            if (result.data.questionStartTime) {
              startTimer(result.data.questionStartTime, room?.timeLimit ?? 30)
            }
          }
          await onRefresh()
        }, ANSWER_REVEAL_DURATION)
      }
    } else {
      setError(result.error ?? 'Failed to advance')
    }
  }, [isHost, playerId, roomCode, room?.timeLimit, clearTimer, startTimer, onRefresh])

  // Cleanup
  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  return {
    phase,
    currentQuestion,
    timeRemaining,
    hasAnswered,
    selectedAnswer,
    wasCorrect,
    scoreGained,
    correctAnswer,
    questionResults,
    finalScores,
    isLoading,
    error,
    startGame: handleStartGame,
    submitAnswer: handleSubmitAnswer,
    nextQuestion: handleNextQuestion,
  }
}
