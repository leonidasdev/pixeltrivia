/**
 * @jest-environment node
 */

/**
 * Integration tests for /api/room/[code]
 *
 * Tests GET (room state) and DELETE (leave/close room) endpoints.
 */

jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}))

const mockSupabaseFrom = jest.fn()
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: mockSupabaseFrom }),
}))

import { GET, DELETE } from '@/app/api/room/[code]/route'
import { NextRequest } from 'next/server'

function makeParams(code: string) {
  return { params: Promise.resolve({ code }) }
}

describe('/api/room/[code]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET - room state', () => {
    it('returns validation error for invalid code', async () => {
      const request = new NextRequest('http://localhost/api/room/AB')
      const response = await GET(request, makeParams('AB'))
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

      const request = new NextRequest('http://localhost/api/room/XYZ999')
      const response = await GET(request, makeParams('XYZ999'))
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
    })

    it('returns room state with players', async () => {
      const roomData = {
        code: 'ABC123',
        status: 'waiting',
        current_question: 0,
        total_questions: 10,
        question_start_time: null,
        time_limit: 30,
        max_players: 8,
        game_mode: 'quick',
        category: null,
        created_at: '2026-01-01T00:00:00Z',
      }

      const playerData = [
        {
          id: 1,
          name: 'Host',
          avatar: 'knight',
          is_host: true,
          score: 100,
          joined_at: '2026-01-01T00:00:00Z',
          current_answer: null,
        },
      ]

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
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: playerData, error: null }),
              }),
            }),
          }
        }
        return {}
      })

      const request = new NextRequest('http://localhost/api/room/ABC123')
      const response = await GET(request, makeParams('ABC123'))
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.code).toBe('ABC123')
      expect(body.data.status).toBe('waiting')
      expect(body.data.players).toHaveLength(1)
      expect(body.data.players[0].isHost).toBe(true)
    })
  })

  describe('DELETE - leave room', () => {
    it('returns validation error when playerId missing', async () => {
      const request = new NextRequest('http://localhost/api/room/ABC123', {
        method: 'DELETE',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })
      const response = await DELETE(request, makeParams('ABC123'))
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
    })
  })
})
