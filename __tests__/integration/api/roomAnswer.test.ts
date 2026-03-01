/**
 * @jest-environment node
 */

/**
 * Integration tests for /api/room/[code]/answer
 *
 * Tests the answer submission flow: validates input,
 * checks game/player state, calculates score, records answer.
 */

jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}))

const mockSupabaseFrom = jest.fn()
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: mockSupabaseFrom }),
}))

import { POST, GET, PUT, DELETE } from '@/app/api/room/[code]/answer/route'
import { NextRequest } from 'next/server'

/** Creates a self-chaining query mock; .single() or await resolves to `result` */
function mockChain(result: unknown) {
  const chain: Record<string, jest.Mock> = {}
  for (const m of ['select', 'eq', 'order', 'ilike', 'limit', 'update', 'insert']) {
    chain[m] = jest.fn(() => chain)
  }
  chain.single = jest.fn().mockResolvedValue(result)
  // Make chain thenable so `await chain.update().eq()` works
  ;(chain as any).then = (res: any, rej?: any) =>
    Promise.resolve(result).then(res, rej)
  return chain
}

function makeParams(code: string) {
  return { params: Promise.resolve({ code }) }
}

function createPostRequest(code: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(`http://localhost/api/room/${code}/answer`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

// Default happy-path data
const ROOM = { status: 'active', current_question: 0, time_limit: 30 }
const PLAYER = { id: 1, current_answer: null, score: 0, answers: [] }
const QUESTION = { correct_answer: 2 }

function setupHappyPath(overrides?: {
  room?: any
  player?: any
  question?: any
  updateError?: any
}) {
  const room = overrides?.room ?? ROOM
  const player = overrides?.player ?? PLAYER
  const question = overrides?.question ?? QUESTION
  const updateError = overrides?.updateError ?? null

  const roomsChain = mockChain({ data: room, error: null })
  const playerSelectChain = mockChain({ data: player, error: null })
  const playerUpdateChain = mockChain({ error: updateError })
  const questionsChain = mockChain({ data: question, error: null })

  mockSupabaseFrom.mockImplementation((table: string) => {
    if (table === 'rooms') return roomsChain
    if (table === 'players') {
      return {
        select: jest.fn(() => playerSelectChain),
        update: jest.fn(() => playerUpdateChain),
      }
    }
    if (table === 'game_questions') return questionsChain
    return mockChain({ data: null, error: null })
  })
}

describe('/api/room/[code]/answer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST — submit answer', () => {
    it('accepts a correct answer and awards score with time bonus', async () => {
      setupHappyPath()
      const req = createPostRequest('ABC123', {
        playerId: 1,
        answer: 2, // matches correct_answer
        timeMs: 5000,
      })
      const res = await POST(req, makeParams('ABC123'))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.accepted).toBe(true)
      expect(body.data.correct).toBe(true)
      expect(body.data.scoreGained).toBeGreaterThan(0)
      expect(body.data.totalScore).toBe(body.data.scoreGained)
    })

    it('accepts an incorrect answer with zero score', async () => {
      setupHappyPath()
      const req = createPostRequest('ABC123', {
        playerId: 1,
        answer: 0, // wrong
        timeMs: 5000,
      })
      const res = await POST(req, makeParams('ABC123'))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.data.correct).toBe(false)
      expect(body.data.scoreGained).toBe(0)
    })

    it('returns 400 for invalid room code', async () => {
      const req = createPostRequest('AB', { playerId: 1, answer: 0, timeMs: 1000 })
      const res = await POST(req, makeParams('AB'))
      expect(res.status).toBe(400)
    })

    it('returns 400 when playerId is missing', async () => {
      const req = createPostRequest('ABC123', { answer: 0, timeMs: 1000 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(400)
    })

    it('returns 400 when answer is missing', async () => {
      const req = createPostRequest('ABC123', { playerId: 1, timeMs: 1000 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(400)
    })

    it('returns 400 when answer is negative', async () => {
      const req = createPostRequest('ABC123', { playerId: 1, answer: -1, timeMs: 1000 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(400)
    })

    it('returns 400 when timeMs is missing', async () => {
      const req = createPostRequest('ABC123', { playerId: 1, answer: 0 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(400)
    })

    it('returns 400 when timeMs is negative', async () => {
      const req = createPostRequest('ABC123', { playerId: 1, answer: 0, timeMs: -1 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(400)
    })

    it('returns 404 when room not found', async () => {
      setupHappyPath({ room: null })
      // Override rooms chain to return null data
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'rooms') return mockChain({ data: null, error: null })
        return mockChain({ data: null, error: null })
      })

      const req = createPostRequest('ABC123', { playerId: 1, answer: 0, timeMs: 1000 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(404)
    })

    it('returns 400 when game is not active', async () => {
      setupHappyPath({ room: { ...ROOM, status: 'waiting' } })
      const req = createPostRequest('ABC123', { playerId: 1, answer: 0, timeMs: 1000 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(400)
    })

    it('returns 404 when player not found', async () => {
      const roomsChain = mockChain({ data: ROOM, error: null })
      const playerChain = mockChain({ data: null, error: null })

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'rooms') return roomsChain
        if (table === 'players') return playerChain
        return mockChain({ data: null, error: null })
      })

      const req = createPostRequest('ABC123', { playerId: 999, answer: 0, timeMs: 1000 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(404)
    })

    it('returns 400 when player already answered', async () => {
      setupHappyPath({ player: { ...PLAYER, current_answer: '1' } })
      const req = createPostRequest('ABC123', { playerId: 1, answer: 0, timeMs: 1000 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(400)
    })

    it('returns 500 when question not found in game_questions', async () => {
      const roomsChain = mockChain({ data: ROOM, error: null })
      const playerSelectChain = mockChain({ data: PLAYER, error: null })
      const questionsChain = mockChain({ data: null, error: null })

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'rooms') return roomsChain
        if (table === 'players') return { select: jest.fn(() => playerSelectChain) }
        if (table === 'game_questions') return questionsChain
        return mockChain({ data: null, error: null })
      })

      const req = createPostRequest('ABC123', { playerId: 1, answer: 0, timeMs: 1000 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(500)
    })

    it('returns 500 when database update fails', async () => {
      setupHappyPath({ updateError: { code: 'DB_ERR', message: 'Update failed' } })
      const req = createPostRequest('ABC123', { playerId: 1, answer: 2, timeMs: 1000 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(500)
    })

    it('calculates time bonus correctly for fast answers', async () => {
      // time_limit = 30s → timeLimitMs = 30000
      // timeMs = 0 → timeBonus = 1.0 * 0.5 = 0.5  → score = 100 * 1.5 = 150
      setupHappyPath()
      const req = createPostRequest('ABC123', { playerId: 1, answer: 2, timeMs: 0 })
      const res = await POST(req, makeParams('ABC123'))
      const body = await res.json()

      expect(body.data.scoreGained).toBe(150) // BASE_SCORE * (1 + 0.5)
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
