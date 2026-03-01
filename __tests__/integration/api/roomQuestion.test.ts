/**
 * @jest-environment node
 */

/**
 * Integration tests for /api/room/[code]/question
 *
 * Tests fetching the current question for a game in progress.
 */

jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}))

const mockSupabaseFrom = jest.fn()
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: mockSupabaseFrom }),
}))

import { GET, POST, PUT, DELETE } from '@/app/api/room/[code]/question/route'
import { NextRequest } from 'next/server'

/** Creates a self-chaining query mock; .single() or await resolves to `result` */
function mockChain(result: unknown) {
  const chain: Record<string, jest.Mock> = {}
  for (const m of ['select', 'eq', 'order', 'ilike', 'limit', 'update', 'insert']) {
    chain[m] = jest.fn(() => chain)
  }
  chain.single = jest.fn().mockResolvedValue(result)
  ;(chain as any).then = (res: any, rej?: any) =>
    Promise.resolve(result).then(res, rej)
  return chain
}

function makeParams(code: string) {
  return { params: Promise.resolve({ code }) }
}

function createGetRequest(code: string, playerId?: string): NextRequest {
  const url = playerId
    ? `http://localhost/api/room/${code}/question?playerId=${playerId}`
    : `http://localhost/api/room/${code}/question`
  return new NextRequest(url)
}

const PLAYER = { id: 1, current_answer: null }
const ROOM = {
  status: 'active',
  current_question: 0,
  total_questions: 10,
  question_start_time: '2026-01-01T00:00:00Z',
  time_limit: 30,
}
const QUESTION = {
  question_text: 'What is 2+2?',
  options: ['1', '2', '3', '4'],
  category: 'math',
  difficulty: 'easy',
}
const PLAYERS_LIST = [
  { id: 1, name: 'Host', avatar: 'knight', is_host: true, score: 100, current_answer: null },
  { id: 2, name: 'Player2', avatar: 'mage', is_host: false, score: 50, current_answer: '1' },
]

function setupHappyPath(overrides?: {
  player?: any
  room?: any
  question?: any
  playersList?: any
}) {
  const player = overrides?.player ?? PLAYER
  const room = overrides?.room ?? ROOM
  const question = overrides?.question ?? QUESTION
  const playersList = overrides?.playersList ?? PLAYERS_LIST

  const playerSingleChain = mockChain({ data: player, error: null })
  const playersListChain = mockChain({ data: playersList, error: null })
  const roomChain = mockChain({ data: room, error: null })
  const questionChain = mockChain({ data: question, error: null })

  // Create table objects OUTSIDE the callback so mockReturnValueOnce
  // tracking persists across multiple from('players') calls.
  const playersTable = {
    select: jest.fn()
      .mockReturnValueOnce(playerSingleChain)
      .mockReturnValueOnce(playersListChain),
  }

  mockSupabaseFrom.mockImplementation((table: string) => {
    if (table === 'players') return playersTable
    if (table === 'rooms') return roomChain
    if (table === 'game_questions') return questionChain
    return mockChain({ data: null, error: null })
  })
}

describe('/api/room/[code]/question', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET — fetch current question', () => {
    it('returns the current question with player data', async () => {
      setupHappyPath()
      const req = createGetRequest('ABC123', '1')
      const res = await GET(req, makeParams('ABC123'))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.question.questionText).toBe('What is 2+2?')
      expect(body.data.question.options).toEqual(['1', '2', '3', '4'])
      expect(body.data.question.index).toBe(0)
      expect(body.data.totalQuestions).toBe(10)
      expect(body.data.hasAnswered).toBe(false)
      expect(body.data.players).toHaveLength(2)
      expect(body.data.players[0].isHost).toBe(true)
      expect(body.data.players[1].hasAnswered).toBe(true)
    })

    it('returns 400 for invalid room code', async () => {
      const req = createGetRequest('AB', '1')
      const res = await GET(req, makeParams('AB'))
      expect(res.status).toBe(400)
    })

    it('returns 400 when playerId is missing', async () => {
      const req = createGetRequest('ABC123')
      const res = await GET(req, makeParams('ABC123'))
      expect(res.status).toBe(400)
    })

    it('returns 404 when player not found', async () => {
      const playerChain = mockChain({ data: null, error: null })
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'players') return playerChain
        return mockChain({ data: null, error: null })
      })

      const req = createGetRequest('ABC123', '999')
      const res = await GET(req, makeParams('ABC123'))
      expect(res.status).toBe(404)
    })

    it('returns 404 when room not found', async () => {
      const playerChain = mockChain({ data: PLAYER, error: null })
      const roomChain = mockChain({ data: null, error: null })

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'players') return playerChain
        if (table === 'rooms') return roomChain
        return mockChain({ data: null, error: null })
      })

      const req = createGetRequest('ABC123', '1')
      const res = await GET(req, makeParams('ABC123'))
      expect(res.status).toBe(404)
    })

    it('returns 400 when game is not active', async () => {
      const playerChain = mockChain({ data: PLAYER, error: null })
      const roomChain = mockChain({ data: { ...ROOM, status: 'waiting' }, error: null })

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'players') return playerChain
        if (table === 'rooms') return roomChain
        return mockChain({ data: null, error: null })
      })

      const req = createGetRequest('ABC123', '1')
      const res = await GET(req, makeParams('ABC123'))
      expect(res.status).toBe(400)
    })

    it('returns 404 when question not found', async () => {
      const playerChain = mockChain({ data: PLAYER, error: null })
      const roomChain = mockChain({ data: ROOM, error: null })
      const questionChain = mockChain({ data: null, error: null })

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'players') return playerChain
        if (table === 'rooms') return roomChain
        if (table === 'game_questions') return questionChain
        return mockChain({ data: null, error: null })
      })

      const req = createGetRequest('ABC123', '1')
      const res = await GET(req, makeParams('ABC123'))
      expect(res.status).toBe(404)
    })

    it('indicates hasAnswered is true when player already answered', async () => {
      setupHappyPath({ player: { id: 1, current_answer: '2' } })
      const req = createGetRequest('ABC123', '1')
      const res = await GET(req, makeParams('ABC123'))
      const body = await res.json()

      expect(body.data.hasAnswered).toBe(true)
    })
  })

  describe('Method not allowed', () => {
    it('POST returns 405', async () => {
      const res = POST()
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
