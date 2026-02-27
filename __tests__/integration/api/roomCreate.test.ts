/**
 * @jest-environment node
 */

/**
 * Integration tests for /api/room/create
 *
 * Tests the multiplayer room creation flow: validates
 * player name, generates unique code, creates room + host player.
 */

// Mock dependencies before imports
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

import { POST, GET, PUT, DELETE } from '@/app/api/room/create/route'
import { NextRequest } from 'next/server'

function createPostRequest(body: Record<string, unknown> = {}): NextRequest {
  return new NextRequest('http://localhost/api/room/create', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('/api/room/create', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST - create room', () => {
    it('creates a room successfully', async () => {
      // Mock: uniqueness check returns "not found" (PGRST116 = no rows)
      const mockSelectRooms = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116', message: 'No rows found' },
          }),
        }),
      })

      // Mock: insert room returns new room
      const mockInsertRoom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { code: 'ABC123', created_at: '2026-01-01T00:00:00Z', status: 'waiting' },
            error: null,
          }),
        }),
      })

      // Mock: insert player returns host player
      const mockInsertPlayer = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 42, room_code: 'ABC123', name: 'TestHost', is_host: true },
            error: null,
          }),
        }),
      })

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'rooms') {
          return { select: mockSelectRooms, insert: mockInsertRoom }
        }
        if (table === 'players') {
          return { insert: mockInsertPlayer }
        }
        return {}
      })

      const response = await POST(createPostRequest({ playerName: 'TestHost', avatar: 'knight' }))
      const body = await response.json()

      expect(response.status).toBe(201)
      expect(body.success).toBe(true)
      expect(body.data.roomCode).toBe('ABC123')
      expect(body.data.playerId).toBe(42)
      expect(body.data.status).toBe('waiting')
      expect(body.message).toBe('Room created successfully')
    })

    it('returns validation error when playerName is missing', async () => {
      const response = await POST(createPostRequest({}))
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
    })

    it('returns validation error when playerName is too short', async () => {
      const response = await POST(createPostRequest({ playerName: '' }))
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
    })

    it('returns error when database insert fails', async () => {
      // Uniqueness check passes
      const mockSelectRooms = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116', message: 'No rows found' },
          }),
        }),
      })

      // Insert fails
      const mockInsertRoom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'DB_ERROR', message: 'Insert failed' },
          }),
        }),
      })

      mockSupabaseFrom.mockReturnValue({
        select: mockSelectRooms,
        insert: mockInsertRoom,
      })

      const response = await POST(createPostRequest({ playerName: 'TestHost', avatar: 'knight' }))
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.success).toBe(false)
    })

    it('returns error when uniqueness check fails with DB error', async () => {
      const mockSelectRooms = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'UNEXPECTED_ERROR', message: 'Connection failed' },
          }),
        }),
      })

      mockSupabaseFrom.mockReturnValue({ select: mockSelectRooms })

      const response = await POST(createPostRequest({ playerName: 'TestHost', avatar: 'knight' }))
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.success).toBe(false)
    })
  })

  describe('Method not allowed', () => {
    it('GET returns 405', async () => {
      const response = GET()
      const body = await response.json()

      expect(response.status).toBe(405)
      expect(body.success).toBe(false)
    })

    it('PUT returns 405', async () => {
      const response = PUT()
      const body = await response.json()

      expect(response.status).toBe(405)
      expect(body.success).toBe(false)
    })

    it('DELETE returns 405', async () => {
      const response = DELETE()
      const body = await response.json()

      expect(response.status).toBe(405)
      expect(body.success).toBe(false)
    })
  })
})
