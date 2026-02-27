/**
 * @jest-environment jsdom
 */

/**
 * Unit tests for lib/multiplayerApi
 *
 * Tests all client-side API functions with mocked fetch.
 */

import {
  createRoom,
  joinRoom,
  getRoomState,
  startGame,
  submitAnswer,
  nextQuestion,
  getCurrentQuestion,
  leaveRoom,
} from '@/lib/multiplayerApi'

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

function mockSuccess(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: true, data, message: 'OK' }),
  })
}

function mockError(status: number, error: string) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ success: false, error, message: error }),
  })
}

describe('multiplayerApi', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('createRoom', () => {
    it('calls create endpoint with params', async () => {
      const result = { roomCode: 'ABC123', playerId: 1 }
      mockSuccess(result)

      const response = await createRoom({
        playerName: 'Host',
        avatar: 'knight',
        maxPlayers: 6,
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/room/create',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ playerName: 'Host', avatar: 'knight', maxPlayers: 6 }),
        })
      )
      expect(response.success).toBe(true)
      expect(response.data?.roomCode).toBe('ABC123')
    })

    it('returns error on failure', async () => {
      mockError(400, 'Invalid name')

      const response = await createRoom({ playerName: '', avatar: 'knight' })
      expect(response.success).toBe(false)
      expect(response.error).toBe('Invalid name')
    })
  })

  describe('joinRoom', () => {
    it('calls join endpoint with params', async () => {
      mockSuccess({ playerId: 42, room: { code: 'ABC123', players: [] } })

      const response = await joinRoom({
        roomCode: 'ABC123',
        playerName: 'Player2',
        avatar: 'mage',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/room/join',
        expect.objectContaining({ method: 'POST' })
      )
      expect(response.success).toBe(true)
      expect(response.data?.playerId).toBe(42)
    })
  })

  describe('getRoomState', () => {
    it('calls GET on room endpoint', async () => {
      mockSuccess({ code: 'ABC123', status: 'waiting', players: [] })

      const response = await getRoomState('ABC123')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/room/ABC123',
        expect.objectContaining({
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        })
      )
      expect(response.success).toBe(true)
      expect(response.data?.code).toBe('ABC123')
    })
  })

  describe('startGame', () => {
    it('calls start endpoint with host playerId', async () => {
      mockSuccess({ started: true, totalQuestions: 10 })

      const response = await startGame('ABC123', 1)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/room/ABC123/start',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ playerId: 1 }),
        })
      )
      expect(response.success).toBe(true)
      expect(response.data?.started).toBe(true)
    })
  })

  describe('submitAnswer', () => {
    it('sends answer with time', async () => {
      mockSuccess({ accepted: true, correct: true, scoreGained: 100, totalScore: 100 })

      const response = await submitAnswer('ABC123', 1, 2, 5000)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/room/ABC123/answer',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ playerId: 1, answer: 2, timeMs: 5000 }),
        })
      )
      expect(response.success).toBe(true)
      expect(response.data?.correct).toBe(true)
    })
  })

  describe('nextQuestion', () => {
    it('calls next endpoint', async () => {
      mockSuccess({ gameOver: false, nextQuestion: { index: 1 } })

      const response = await nextQuestion('ABC123', 1)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/room/ABC123/next',
        expect.objectContaining({ method: 'POST' })
      )
      expect(response.success).toBe(true)
      expect(response.data?.gameOver).toBe(false)
    })
  })

  describe('getCurrentQuestion', () => {
    it('calls question endpoint with playerId', async () => {
      mockSuccess({ question: { index: 0 }, totalQuestions: 10 })

      const response = await getCurrentQuestion('ABC123', 42)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/room/ABC123/question?playerId=42',
        expect.objectContaining({
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        })
      )
      expect(response.success).toBe(true)
    })
  })

  describe('leaveRoom', () => {
    it('calls DELETE on room endpoint', async () => {
      mockSuccess({ action: 'left' })

      const response = await leaveRoom('ABC123', 42)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/room/ABC123',
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ playerId: 42 }),
        })
      )
      expect(response.success).toBe(true)
    })
  })

  describe('network errors', () => {
    it('handles fetch failure gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const response = await createRoom({ playerName: 'Test', avatar: 'knight' })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Network error')
    })
  })
})
