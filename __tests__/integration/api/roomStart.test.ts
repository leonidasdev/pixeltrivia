/**
 * @jest-environment node
 */

/**
 * Integration tests for /api/room/[code]/start
 *
 * Tests starting a multiplayer game: host-only, minimum players,
 * question selection, initial state setup.
 */

jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}))

jest.mock('@/lib/utils', () => ({
  shuffleArray: jest.fn((arr: unknown[]) => arr),
}))

const mockSupabaseFrom = jest.fn()
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: mockSupabaseFrom }),
}))

import { POST, GET, PUT, DELETE } from '@/app/api/room/[code]/start/route'
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
  return new NextRequest(`http://localhost/api/room/${code}/start`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const HOST_PLAYER = { is_host: true }
const ROOM = {
  status: 'waiting',
  total_questions: 10,
  category: null,
  code: 'ABC123',
}
const AVAILABLE_QUESTIONS = Array.from({ length: 12 }, (_, i) => ({
  question_text: `Question ${i}`,
  options: ['A', 'B', 'C', 'D'],
  correct_answer: i % 4,
  category: 'general',
  difficulty: 'medium',
}))

function setupHappyPath(overrides?: {
  player?: any
  room?: any
  playerCount?: number
  questions?: any
  questionsError?: any
  insertError?: any
  updateError?: any
}) {
  const player = overrides?.player ?? HOST_PLAYER
  const room = overrides?.room ?? ROOM
  const playerCount = overrides?.playerCount ?? 3
  const questions = overrides?.questions ?? AVAILABLE_QUESTIONS
  const questionsError = overrides?.questionsError ?? null
  const insertError = overrides?.insertError ?? null
  const updateError = overrides?.updateError ?? null

  const playerHostChain = mockChain({ data: player, error: null })
  const playerCountChain = mockChain({ count: playerCount })
  const playerResetChain = mockChain({ error: null })
  const roomSelectChain = mockChain({ data: room, error: null })
  const roomUpdateChain = mockChain({ error: updateError })
  const questionsChain = mockChain({ data: questions, error: questionsError })
  const gameQuestionsChain = mockChain({ error: insertError })

  // Create table objects OUTSIDE the callback so mockReturnValueOnce
  // tracking persists across multiple from() calls to the same table.
  const playersTable = {
    select: jest.fn().mockReturnValueOnce(playerHostChain).mockReturnValueOnce(playerCountChain),
    update: jest.fn(() => playerResetChain),
  }
  const roomsTable = {
    select: jest.fn(() => roomSelectChain),
    update: jest.fn(() => roomUpdateChain),
  }

  mockSupabaseFrom.mockImplementation((table: string) => {
    if (table === 'players') return playersTable
    if (table === 'rooms') return roomsTable
    if (table === 'questions') return questionsChain
    if (table === 'game_questions') return gameQuestionsChain
    return mockChain({ data: null, error: null })
  })
}

describe('/api/room/[code]/start', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST — start game', () => {
    it('starts a game successfully', async () => {
      setupHappyPath()
      const req = createPostRequest('ABC123', { playerId: 1 })
      const res = await POST(req, makeParams('ABC123'))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.started).toBe(true)
      expect(body.data.totalQuestions).toBe(10)
      expect(body.data.currentQuestion.index).toBe(0)
      expect(body.data.currentQuestion.questionText).toBe('Question 0')
      expect(body.data.questionStartTime).toBeDefined()
      expect(body.message).toBe('Game started')
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
      setupHappyPath({ player: null })
      // Override to return null player
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
      setupHappyPath({ player: { is_host: false } })
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

    it('returns 400 when game has already started', async () => {
      setupHappyPath({ room: { ...ROOM, status: 'active' } })
      const req = createPostRequest('ABC123', { playerId: 1 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(400)
    })

    it('returns 400 when not enough players', async () => {
      setupHappyPath({ playerCount: 1 })
      const req = createPostRequest('ABC123', { playerId: 1 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(400)
    })

    it('returns 500 when no questions available', async () => {
      setupHappyPath({ questions: [], questionsError: null })
      const req = createPostRequest('ABC123', { playerId: 1 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(500)
    })

    it('returns 500 when question fetch has DB error', async () => {
      setupHappyPath({
        questions: null,
        questionsError: { code: 'DB_ERR', message: 'Query failed' },
      })
      const req = createPostRequest('ABC123', { playerId: 1 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(500)
    })

    it('returns 500 when inserting game questions fails', async () => {
      setupHappyPath({ insertError: { code: 'DB_ERR', message: 'Insert failed' } })
      const req = createPostRequest('ABC123', { playerId: 1 })
      const res = await POST(req, makeParams('ABC123'))
      expect(res.status).toBe(500)
    })

    it('returns 500 when updating room status fails', async () => {
      setupHappyPath({ updateError: { code: 'DB_ERR', message: 'Update failed' } })
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
