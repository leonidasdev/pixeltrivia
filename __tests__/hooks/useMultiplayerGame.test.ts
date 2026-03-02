/**
 * useMultiplayerGame Hook Tests
 *
 * Tests for the multiplayer game state management hook including:
 * - Phase transitions (lobby → playing → answered → revealing → finished)
 * - Starting a game (host only)
 * - Submitting answers
 * - Advancing to next question (host only)
 * - Timer management
 * - Error handling
 *
 * @module __tests__/hooks/useMultiplayerGame
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame'
import type { RoomState } from '@/lib/multiplayerApi'
import type { MultiplayerQuestion } from '@/types/room'

// ============================================================================
// Mocks
// ============================================================================

const mockStartGame = jest.fn()
const mockSubmitAnswer = jest.fn()
const mockNextQuestion = jest.fn()
const mockGetCurrentQuestion = jest.fn()

jest.mock('@/lib/multiplayerApi', () => ({
  startGame: (...args: unknown[]) => mockStartGame(...args),
  submitAnswer: (...args: unknown[]) => mockSubmitAnswer(...args),
  nextQuestion: (...args: unknown[]) => mockNextQuestion(...args),
  getCurrentQuestion: (...args: unknown[]) => mockGetCurrentQuestion(...args),
}))

// ============================================================================
// Fixtures
// ============================================================================

const ROOM_CODE = 'ABC123'
const PLAYER_ID = 1

const mockQuestion: MultiplayerQuestion = {
  index: 0,
  questionText: 'What is the capital of France?',
  options: ['London', 'Paris', 'Berlin', 'Madrid'],
  category: 'Geography',
}

const nextMockQuestion: MultiplayerQuestion = {
  index: 1,
  questionText: 'What is 2 + 2?',
  options: ['3', '4', '5', '6'],
  category: 'Math',
}

function makeRoom(overrides: Partial<RoomState> = {}): RoomState {
  return {
    code: ROOM_CODE,
    status: 'waiting',
    currentQuestion: 0,
    totalQuestions: 10,
    questionStartTime: null,
    timeLimit: 30,
    maxPlayers: 8,
    gameMode: 'quick',
    category: 'Science',
    createdAt: '2025-01-01T00:00:00Z',
    players: [
      {
        id: PLAYER_ID,
        name: 'Host',
        avatar: 'pixel-cat',
        score: 0,
        isHost: true,
        hasAnswered: false,
        joinedAt: '2025-01-01T00:00:00Z',
      },
    ],
    ...overrides,
  }
}

const defaultProps = {
  roomCode: ROOM_CODE,
  playerId: PLAYER_ID,
  isHost: true,
  room: makeRoom(),
  onRefresh: jest.fn().mockResolvedValue(undefined),
}

// ============================================================================
// Tests
// ============================================================================

describe('useMultiplayerGame', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockStartGame.mockResolvedValue({ success: false })
    mockSubmitAnswer.mockResolvedValue({ success: false })
    mockNextQuestion.mockResolvedValue({ success: false })
    mockGetCurrentQuestion.mockResolvedValue({ success: false })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  // --------------------------------------------------------------------------
  // Initial State
  // --------------------------------------------------------------------------

  describe('Initial state', () => {
    it('starts in lobby phase', () => {
      const { result } = renderHook(() => useMultiplayerGame(defaultProps))

      expect(result.current.phase).toBe('lobby')
      expect(result.current.currentQuestion).toBeNull()
      expect(result.current.timeRemaining).toBe(0)
      expect(result.current.hasAnswered).toBe(false)
      expect(result.current.selectedAnswer).toBeNull()
      expect(result.current.wasCorrect).toBeNull()
      expect(result.current.scoreGained).toBe(0)
      expect(result.current.correctAnswer).toBeNull()
      expect(result.current.questionResults).toBeNull()
      expect(result.current.finalScores).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  // --------------------------------------------------------------------------
  // Phase Transitions from Room Status
  // --------------------------------------------------------------------------

  describe('Phase transitions from room status', () => {
    it('stays in lobby when room status is waiting', () => {
      const { result } = renderHook(() =>
        useMultiplayerGame({ ...defaultProps, room: makeRoom({ status: 'waiting' }) })
      )
      expect(result.current.phase).toBe('lobby')
    })

    it('transitions to finished when room status is finished', () => {
      const { result, rerender } = renderHook(props => useMultiplayerGame(props), {
        initialProps: defaultProps,
      })

      expect(result.current.phase).toBe('lobby')

      rerender({ ...defaultProps, room: makeRoom({ status: 'finished' }) })

      expect(result.current.phase).toBe('finished')
    })

    it('fetches question when room becomes active from lobby', async () => {
      mockGetCurrentQuestion.mockResolvedValue({
        success: true,
        data: {
          question: mockQuestion,
          totalQuestions: 10,
          questionStartTime: new Date().toISOString(),
          timeLimit: 30,
          hasAnswered: false,
          players: [],
        },
      })

      const { result, rerender } = renderHook(props => useMultiplayerGame(props), {
        initialProps: defaultProps,
      })

      expect(result.current.phase).toBe('lobby')

      // Room becomes active
      rerender({ ...defaultProps, room: makeRoom({ status: 'active' }) })

      await waitFor(() => {
        expect(mockGetCurrentQuestion).toHaveBeenCalledWith(ROOM_CODE, PLAYER_ID)
      })

      await waitFor(() => {
        expect(result.current.phase).toBe('playing')
        expect(result.current.currentQuestion).toEqual(mockQuestion)
      })
    })

    it('sets answered phase if player already answered', async () => {
      mockGetCurrentQuestion.mockResolvedValue({
        success: true,
        data: {
          question: mockQuestion,
          totalQuestions: 10,
          questionStartTime: new Date().toISOString(),
          timeLimit: 30,
          hasAnswered: true,
          players: [],
        },
      })

      const { result, rerender } = renderHook(props => useMultiplayerGame(props), {
        initialProps: defaultProps,
      })

      rerender({ ...defaultProps, room: makeRoom({ status: 'active' }) })

      await waitFor(() => {
        expect(result.current.phase).toBe('answered')
        expect(result.current.hasAnswered).toBe(true)
      })
    })
  })

  // --------------------------------------------------------------------------
  // Start Game
  // --------------------------------------------------------------------------

  describe('startGame', () => {
    it('starts game and transitions to playing phase', async () => {
      const now = new Date().toISOString()
      mockStartGame.mockResolvedValue({
        success: true,
        data: {
          started: true,
          totalQuestions: 10,
          currentQuestion: mockQuestion,
          questionStartTime: now,
        },
      })

      const { result } = renderHook(() => useMultiplayerGame(defaultProps))

      let startResult: unknown
      await act(async () => {
        startResult = await result.current.startGame()
      })

      expect(mockStartGame).toHaveBeenCalledWith(ROOM_CODE, PLAYER_ID)
      expect(startResult).toEqual(expect.objectContaining({ started: true, totalQuestions: 10 }))
      expect(result.current.phase).toBe('playing')
      expect(result.current.currentQuestion).toEqual(mockQuestion)
      expect(result.current.isLoading).toBe(false)
      expect(defaultProps.onRefresh).toHaveBeenCalled()
    })

    it('sets error on failure', async () => {
      mockStartGame.mockResolvedValue({
        success: false,
        error: 'Not enough players',
      })

      const { result } = renderHook(() => useMultiplayerGame(defaultProps))

      await act(async () => {
        await result.current.startGame()
      })

      expect(result.current.error).toBe('Not enough players')
      expect(result.current.phase).toBe('lobby')
    })

    it('uses fallback error message', async () => {
      mockStartGame.mockResolvedValue({ success: false })

      const { result } = renderHook(() => useMultiplayerGame(defaultProps))

      await act(async () => {
        await result.current.startGame()
      })

      expect(result.current.error).toBe('Failed to start game')
    })

    it('returns null when not host', async () => {
      const { result } = renderHook(() => useMultiplayerGame({ ...defaultProps, isHost: false }))

      let startResult: unknown
      await act(async () => {
        startResult = await result.current.startGame()
      })

      expect(startResult).toBeNull()
      expect(mockStartGame).not.toHaveBeenCalled()
    })

    it('returns null when playerId is null', async () => {
      const { result } = renderHook(() => useMultiplayerGame({ ...defaultProps, playerId: null }))

      let startResult: unknown
      await act(async () => {
        startResult = await result.current.startGame()
      })

      expect(startResult).toBeNull()
      expect(mockStartGame).not.toHaveBeenCalled()
    })
  })

  // --------------------------------------------------------------------------
  // Submit Answer
  // --------------------------------------------------------------------------

  describe('submitAnswer', () => {
    it('submits answer and transitions to answered phase', async () => {
      mockSubmitAnswer.mockResolvedValue({
        success: true,
        data: {
          accepted: true,
          correct: true,
          scoreGained: 100,
          totalScore: 100,
        },
      })

      const { result } = renderHook(() => useMultiplayerGame(defaultProps))

      let submitResult: unknown
      await act(async () => {
        submitResult = await result.current.submitAnswer(1)
      })

      expect(mockSubmitAnswer).toHaveBeenCalledWith(ROOM_CODE, PLAYER_ID, 1, expect.any(Number))
      expect(submitResult).toEqual(expect.objectContaining({ correct: true, scoreGained: 100 }))
      expect(result.current.phase).toBe('answered')
      expect(result.current.hasAnswered).toBe(true)
      expect(result.current.wasCorrect).toBe(true)
      expect(result.current.scoreGained).toBe(100)
      expect(result.current.selectedAnswer).toBe(1)
      expect(defaultProps.onRefresh).toHaveBeenCalled()
    })

    it('handles incorrect answer', async () => {
      mockSubmitAnswer.mockResolvedValue({
        success: true,
        data: {
          accepted: true,
          correct: false,
          scoreGained: 0,
          totalScore: 0,
        },
      })

      const { result } = renderHook(() => useMultiplayerGame(defaultProps))

      await act(async () => {
        await result.current.submitAnswer(2)
      })

      expect(result.current.wasCorrect).toBe(false)
      expect(result.current.scoreGained).toBe(0)
      expect(result.current.selectedAnswer).toBe(2)
    })

    it('sets error on failure and clears selectedAnswer', async () => {
      mockSubmitAnswer.mockResolvedValue({
        success: false,
        error: 'Too late',
      })

      const { result } = renderHook(() => useMultiplayerGame(defaultProps))

      await act(async () => {
        await result.current.submitAnswer(0)
      })

      expect(result.current.error).toBe('Too late')
      expect(result.current.selectedAnswer).toBeNull()
      expect(result.current.hasAnswered).toBe(false)
    })

    it('returns null when playerId is null', async () => {
      const { result } = renderHook(() => useMultiplayerGame({ ...defaultProps, playerId: null }))

      let submitResult: unknown
      await act(async () => {
        submitResult = await result.current.submitAnswer(1)
      })

      expect(submitResult).toBeNull()
      expect(mockSubmitAnswer).not.toHaveBeenCalled()
    })

    it('prevents double submission', async () => {
      mockSubmitAnswer.mockResolvedValue({
        success: true,
        data: { accepted: true, correct: true, scoreGained: 50, totalScore: 50 },
      })

      const { result } = renderHook(() => useMultiplayerGame(defaultProps))

      // First submission
      await act(async () => {
        await result.current.submitAnswer(1)
      })

      expect(mockSubmitAnswer).toHaveBeenCalledTimes(1)

      // Second submission — should be prevented
      await act(async () => {
        const res = await result.current.submitAnswer(2)
        expect(res).toBeNull()
      })

      expect(mockSubmitAnswer).toHaveBeenCalledTimes(1)
    })
  })

  // --------------------------------------------------------------------------
  // Next Question
  // --------------------------------------------------------------------------

  describe('nextQuestion', () => {
    it('shows results then advances to the next question', async () => {
      const nextStartTime = new Date().toISOString()
      mockNextQuestion.mockResolvedValue({
        success: true,
        data: {
          gameOver: false,
          correctAnswer: 1,
          questionResults: [
            {
              playerId: 1,
              playerName: 'Host',
              answer: 1,
              correct: true,
              scoreGained: 100,
              totalScore: 100,
              timeMs: 5000,
            },
          ],
          nextQuestion: nextMockQuestion,
          questionStartTime: nextStartTime,
        },
      })

      const { result } = renderHook(() => useMultiplayerGame(defaultProps))

      await act(async () => {
        await result.current.nextQuestion()
      })

      expect(mockNextQuestion).toHaveBeenCalledWith(ROOM_CODE, PLAYER_ID)
      expect(result.current.phase).toBe('revealing')
      expect(result.current.correctAnswer).toBe(1)
      expect(result.current.questionResults).toHaveLength(1)

      // After ANSWER_REVEAL_DURATION (3000ms), should transition to playing
      await act(async () => {
        jest.advanceTimersByTime(3000)
      })

      await waitFor(() => {
        expect(result.current.phase).toBe('playing')
        expect(result.current.currentQuestion).toEqual(nextMockQuestion)
        expect(result.current.hasAnswered).toBe(false)
        expect(result.current.selectedAnswer).toBeNull()
      })
    })

    it('transitions to finished when game is over', async () => {
      mockNextQuestion.mockResolvedValue({
        success: true,
        data: {
          gameOver: true,
          correctAnswer: 2,
          questionResults: [
            {
              playerId: 1,
              playerName: 'Host',
              answer: 2,
              correct: true,
              scoreGained: 100,
              totalScore: 500,
              timeMs: 3000,
            },
          ],
          finalScores: [{ playerId: 1, playerName: 'Host', totalScore: 500 }],
        },
      })

      const { result } = renderHook(() => useMultiplayerGame(defaultProps))

      await act(async () => {
        await result.current.nextQuestion()
      })

      expect(result.current.phase).toBe('revealing')
      expect(result.current.finalScores).toEqual([
        { playerId: 1, playerName: 'Host', totalScore: 500 },
      ])

      // After reveal duration, should go to finished
      await act(async () => {
        jest.advanceTimersByTime(3000)
      })

      await waitFor(() => {
        expect(result.current.phase).toBe('finished')
      })
    })

    it('sets error on failure', async () => {
      mockNextQuestion.mockResolvedValue({
        success: false,
        error: 'Game not active',
      })

      const { result } = renderHook(() => useMultiplayerGame(defaultProps))

      await act(async () => {
        await result.current.nextQuestion()
      })

      expect(result.current.error).toBe('Game not active')
    })

    it('uses fallback error message', async () => {
      mockNextQuestion.mockResolvedValue({ success: false })

      const { result } = renderHook(() => useMultiplayerGame(defaultProps))

      await act(async () => {
        await result.current.nextQuestion()
      })

      expect(result.current.error).toBe('Failed to advance')
    })

    it('does nothing when not host', async () => {
      const { result } = renderHook(() => useMultiplayerGame({ ...defaultProps, isHost: false }))

      await act(async () => {
        await result.current.nextQuestion()
      })

      expect(mockNextQuestion).not.toHaveBeenCalled()
    })

    it('does nothing when playerId is null', async () => {
      const { result } = renderHook(() => useMultiplayerGame({ ...defaultProps, playerId: null }))

      await act(async () => {
        await result.current.nextQuestion()
      })

      expect(mockNextQuestion).not.toHaveBeenCalled()
    })
  })

  // --------------------------------------------------------------------------
  // Timer
  // --------------------------------------------------------------------------

  describe('Timer', () => {
    it('starts timer when question starts via startGame', async () => {
      const now = new Date().toISOString()
      mockStartGame.mockResolvedValue({
        success: true,
        data: {
          started: true,
          totalQuestions: 10,
          currentQuestion: mockQuestion,
          questionStartTime: now,
        },
      })

      const { result } = renderHook(() => useMultiplayerGame(defaultProps))

      await act(async () => {
        await result.current.startGame()
      })

      // Timer should be set (~30s)
      expect(result.current.timeRemaining).toBeGreaterThan(0)
      expect(result.current.timeRemaining).toBeLessThanOrEqual(30)

      // Advance time — timer should decrease
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      expect(result.current.timeRemaining).toBeLessThanOrEqual(29)
    })

    it('stops timer when phase transitions to finished', () => {
      const { result, rerender } = renderHook(props => useMultiplayerGame(props), {
        initialProps: defaultProps,
      })

      // Transition to finished
      rerender({ ...defaultProps, room: makeRoom({ status: 'finished' }) })

      expect(result.current.phase).toBe('finished')
      expect(result.current.timeRemaining).toBe(0)
    })

    it('cleans up timer on unmount', async () => {
      const now = new Date().toISOString()
      mockStartGame.mockResolvedValue({
        success: true,
        data: {
          started: true,
          totalQuestions: 10,
          currentQuestion: mockQuestion,
          questionStartTime: now,
        },
      })

      const { result, unmount } = renderHook(() => useMultiplayerGame(defaultProps))

      await act(async () => {
        await result.current.startGame()
      })

      unmount()

      // No error from orphan timers — jest will complain about async operations
      // if cleanup is missing
    })
  })

  // --------------------------------------------------------------------------
  // Error state
  // --------------------------------------------------------------------------

  describe('Error state', () => {
    it('sets error when fetchCurrentQuestion fails', async () => {
      mockGetCurrentQuestion.mockResolvedValue({
        success: false,
        error: 'Question not found',
      })

      const { result, rerender } = renderHook(props => useMultiplayerGame(props), {
        initialProps: defaultProps,
      })

      rerender({ ...defaultProps, room: makeRoom({ status: 'active' }) })

      await waitFor(() => {
        expect(result.current.error).toBe('Question not found')
      })
    })

    it('clears error when starting new action', async () => {
      mockStartGame
        .mockResolvedValueOnce({ success: false, error: 'Error' })
        .mockResolvedValueOnce({
          success: true,
          data: {
            started: true,
            totalQuestions: 5,
            currentQuestion: mockQuestion,
            questionStartTime: new Date().toISOString(),
          },
        })

      const { result } = renderHook(() => useMultiplayerGame(defaultProps))

      await act(async () => {
        await result.current.startGame()
      })
      expect(result.current.error).toBe('Error')

      await act(async () => {
        await result.current.startGame()
      })
      expect(result.current.error).toBeNull()
    })
  })
})
