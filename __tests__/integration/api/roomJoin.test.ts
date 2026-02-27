/**
 * @jest-environment node
 */

/**
 * Integration tests for /api/room/join
 *
 * Tests joining an existing multiplayer room: validates room code,
 * player name, room status, capacity, and duplicate names.
 */

jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn(() => null),
  RATE_LIMITS: { roomCreation: { windowMs: 60000, maxRequests: 10 } },
}))

jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}))

const mockSupabaseFrom = jest.fn()
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: mockSupabaseFrom }),
}))

import { POST, GET, PUT, DELETE } from '@/app/api/room/join/route'
import { NextRequest } from 'next/server'

function createJoinRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/room/join', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

// Helper to build standard mock chains
function createSelectMock(result: { data: unknown; error: unknown }) {
  return jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue(result),
      order: jest.fn().mockResolvedValue(result),
    }),
  })
}

describe('/api/room/join', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST - join room', () => {
    it('returns validation error for invalid room code', async () => {
      const response = await POST(createJoinRequest({ roomCode: 'AB', playerName: 'Test' }))
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
    })

    it('returns validation error for empty player name', async () => {
      const response = await POST(createJoinRequest({ roomCode: 'ABC123', playerName: '' }))
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
    })

    it('returns 404 when room not found', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows' },
            }),
          }),
        }),
      })

      const response = await POST(
        createJoinRequest({ roomCode: 'XYZ999', playerName: 'Test', avatar: 'knight' })
      )
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
    })

    it('returns error when room is not in waiting status', async () => {
      const roomData = {
        code: 'ABC123',
        status: 'active',
        max_players: 8,
      }

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'rooms') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: roomData, error: null }),
              }),
            }),
          }
        }
        return {}
      })

      const response = await POST(
        createJoinRequest({ roomCode: 'ABC123', playerName: 'Test', avatar: 'knight' })
      )
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error).toContain('no longer accepting')
    })

    it('joins room successfully', async () => {
      const roomData = {
        code: 'ABC123',
        status: 'waiting',
        max_players: 8,
        time_limit: 30,
        total_questions: 10,
        game_mode: 'quick',
        category: null,
        created_at: '2026-01-01T00:00:00Z',
      }

      const callOrder: string[] = []

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'rooms') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: roomData, error: null }),
              }),
            }),
          }
        }
        if (table === 'players') {
          return {
            select: jest.fn().mockImplementation((...args: unknown[]) => {
              const selectStr = typeof args[0] === 'string' ? args[0] : ''
              // Count query
              if (typeof args[1] === 'object' && args[1] !== null && 'count' in args[1]) {
                callOrder.push('count')
                return {
                  eq: jest.fn().mockResolvedValue({ count: 2, error: null }),
                }
              }
              // Duplicate check (select id)
              if (selectStr === 'id') {
                callOrder.push('duplicate')
                return {
                  eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                      single: jest.fn().mockResolvedValue({ data: null, error: null }),
                    }),
                  }),
                }
              }
              // Player list
              callOrder.push('list')
              return {
                eq: jest.fn().mockReturnValue({
                  order: jest.fn().mockResolvedValue({
                    data: [
                      {
                        id: 1,
                        name: 'Host',
                        avatar: 'knight',
                        is_host: true,
                        score: 0,
                        joined_at: '2026-01-01T00:00:00Z',
                        current_answer: null,
                      },
                      {
                        id: 42,
                        name: 'NewPlayer',
                        avatar: 'mage',
                        is_host: false,
                        score: 0,
                        joined_at: '2026-01-01T00:01:00Z',
                        current_answer: null,
                      },
                    ],
                    error: null,
                  }),
                }),
              }
            }),
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: 42, room_code: 'ABC123', name: 'NewPlayer', is_host: false },
                  error: null,
                }),
              }),
            }),
          }
        }
        return {}
      })

      const response = await POST(
        createJoinRequest({ roomCode: 'ABC123', playerName: 'NewPlayer', avatar: 'mage' })
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.playerId).toBe(42)
      expect(body.data.room.code).toBe('ABC123')
      expect(body.data.room.players).toHaveLength(2)
    })
  })

  describe('Method not allowed', () => {
    it('GET returns 405', async () => {
      const response = GET()
      expect(response.status).toBe(405)
    })

    it('PUT returns 405', async () => {
      const response = PUT()
      expect(response.status).toBe(405)
    })

    it('DELETE returns 405', async () => {
      const response = DELETE()
      expect(response.status).toBe(405)
    })
  })
})
