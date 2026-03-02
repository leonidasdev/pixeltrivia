/**
 * @jest-environment node
 */

/**
 * Integration tests for /api/room/[code]/next
 *
 * Tests advancing to the next question: host-only, question results,
 * game completion on last question.
 */

jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}))

jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn(() => null),
  RATE_LIMITS: { quiz: { windowMs: 60000, maxRequests: 30 } },
}))

const mockSupabaseFrom = jest.fn()
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: mockSupabaseFrom }),
}))

import { POST, GET, PUT, DELETE } from '@/app/api/room/[code]/next/route'
import { NextRequest } from 'next/server'

/** Creates a self-chaining query mock; .single() or await resolves to `result` */
function mockChain(result: unknown) {
  const chain: Record<string, jest.Mock> = {}
  for (const m of ['select', 'eq', 'order', 'ilike', 'limit', 'update', 'insert']) {
    chain[m] = jest.fn(() => chain)
  }
  chain.single = jest.fn().mockResolvedValue(result)
  ;(chain as any).then = (res: any, rej?: any) => Promise.resolve(result).then(res, rej)
  return chain
}

function makeParams(code: string) {
  return { params: Promise.resolve({ code }) }
}

function createPostRequest(code: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(`http://localhost/api/room/${code}/next`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const HOST_PLAYER = { is_host: true }
const ROOM_MID_GAME = { status: 'active', current_question: 1, total_questions: 5 }
const ROOM_LAST_Q = { status: 'active', current_question: 4, total_questions: 5 }
const CURRENT_QUESTION = { correct_answer: 2 }
const NEXT_QUESTION = {
  question_text: 'Next Question?',
  options: ['A', 'B', 'C', 'D'],
  category: 'science',
  difficulty: 'hard',
}
const PLAYERS = [
  {
    id: 1,
    name: 'Host',
    score: 200,
    current_answer: '2',
    answers: [{ questionIndex: 1, answer: 2, timeMs: 5000, correct: true, score: 100 }],
  },
  {
    id: 2,
    name: 'Player2',
    score: 50,
    current_answer: '0',
    answers: [{ questionIndex: 1, answer: 0, timeMs: 8000, correct: false, score: 0 }],
  },
]

function setupAdvance(overrides?: {
  player?: any
  room?: any
  currentQuestion?: any
  players?: any
  roomUpdateError?: any
  nextQuestion?: any
}) {
  const player = overrides?.player ?? HOST_PLAYER
  const room = overrides?.room ?? ROOM_MID_GAME
  const currentQuestion = overrides?.currentQuestion ?? CURRENT_QUESTION
  const players = overrides?.players ?? PLAYERS
  const roomUpdateError = overrides?.roomUpdateError ?? null
  const nextQuestion = overrides?.nextQuestion ?? NEXT_QUESTION

  const playerHostChain = mockChain({ data: player, error: null })
  const playersListChain = mockChain({ data: players, error: null })
  const playerResetChain = mockChain({ error: null })

  const roomSelectChain = mockChain({ data: room, error: null })
  const roomUpdateChain = mockChain({ error: roomUpdateError })

  const currentQChain = mockChain({ data: currentQuestion, error: null })
  const nextQChain = mockChain({ data: nextQuestion, error: null })

  // Create table objects OUTSIDE the callback so mockReturnValueOnce
  // tracking persists across multiple from() calls to the same table.
  const playersTable = {
    select: jest.fn().mockReturnValueOnce(playerHostChain).mockReturnValueOnce(playersListChain),
    update: jest.fn(() => playerResetChain),
  }
  const roomsTable = {
    select: jest.fn(() => roomSelectChain),
    update: jest.fn(() => roomUpdateChain),
  }
  const gameQuestionsTable = {
    select: jest.fn().mockReturnValueOnce(currentQChain).mockReturnValueOnce(nextQChain),
  }

  mockSupabaseFrom.mockImplementation((table: string) => {
    if (table === 'players') return playersTable
    if (table === 'rooms') return roomsTable
    if (table === 'game_questions') return gameQuestionsTable
    return mockChain({ data: null, error: null })
  })
}

describe('/api/room/[code]/next', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST — advance to next question', () => {
    it('advances to next question mid-game', async () => {
      setupAdvance()
      const req = createPostRequest('ABC123', { playerId: 1 })
      const res = await POST(req, makeParams('ABC123'))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.gameOver).toBe(false)
      expect(body.data.correctAnswer).toBe(2)
      expect(body.data.questionResults).toHaveLength(2)
      expect(body.data.nextQuestion.questionText).toBe('Next Question?')
      expect(body.data.nextQuestion.index).toBe(2) // current_question + 1
      expect(body.data.questionStartTime).toBeDefined()
    })

    it('ends the game on the last question', async () => {
      setupAdvance({ room: ROOM_LAST_Q })
      const req = createPostRequest('ABC123', { playerId: 1 })
      const res = await POST(req, makeParams('ABC123'))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.data.gameOver).toBe(true)
      expect(body.data.finalScores).toHaveLength(2)
      expect(body.data.finalScores[0].totalScore).toBe(200)
      expect(body.data.questionResults).toBeDefined()
    })

    it('includes question results with correct/incorrect flags', async () => {
      setupAdvance()
      const req = createPostRequest('ABC123', { playerId: 1 })
      const res = await POST(req, makeParams('ABC123'))
      const body = await res.json()

      const hostResult = body.data.questionResults.find((r: any) => r.playerId === 1)
      const p2Result = body.data.questionResults.find((r: any) => r.playerId === 2)
      expect(hostResult.correct).toBe(true)
      expect(hostResult.scoreGained).toBe(100)
      expect(p2Result.correct).toBe(false)
      expect(p2Result.scoreGained).toBe(0)
    })

    it('returns 400 for invalid room code', async () => {
      const req = createPostRequest('AB', { playerId: 1 })
      const res = await POST(req, makeParams('AB'))
      expect(res.status).toBe(400)
    })

    it('returns 400 when playerId is missing', async () => {
      const req = createPostRequest('ABC123', {})
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(400)
    })

    it('returns 404 when player not found', async () => {
      const playerChain = mockChain({ data: null, error: null })
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'players') return playerChain
        return mockChain({ data: null, error: null })
      })

      const req = createPostRequest('ABC123', { playerId: 999 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(404)
    })

    it('returns 400 when player is not the host', async () => {
      setupAdvance({ player: { is_host: false } })
      const req = createPostRequest('ABC123', { playerId: 2 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(400)
    })

    it('returns 404 when room not found', async () => {
      const playerChain = mockChain({ data: HOST_PLAYER, error: null })
      const roomChain = mockChain({ data: null, error: null })

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'players') return playerChain
        if (table === 'rooms') return roomChain
        return mockChain({ data: null, error: null })
      })

      const req = createPostRequest('ABC123', { playerId: 1 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(404)
    })

    it('returns 400 when game is not active', async () => {
      setupAdvance({ room: { ...ROOM_MID_GAME, status: 'finished' } })
      const req = createPostRequest('ABC123', { playerId: 1 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(400)
    })

    it('returns 500 when ending game update fails', async () => {
      setupAdvance({ room: ROOM_LAST_Q, roomUpdateError: { code: 'DB', message: 'fail' } })
      const req = createPostRequest('ABC123', { playerId: 1 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(500)
    })

    it('returns 500 when advance update fails', async () => {
      setupAdvance({ roomUpdateError: { code: 'DB', message: 'fail' } })
      const req = createPostRequest('ABC123', { playerId: 1 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(500)
    })
  })

  describe('Method not allowed', () => {
    it('GET returns 405', async () => {
      const res = GET()
      expect(res.status).toBe(405)
    })

    it('PUT returns 405', async () => {
      const res = PUT()
      expect(res.status).toBe(405)
    })

    it('DELETE returns 405', async () => {
      const res = DELETE()
      expect(res.status).toBe(405)
    })
  })
})
