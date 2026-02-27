/**
 * @jest-environment node
 */

/**
 * Integration tests for /api/quiz/quick
 */

jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn(() => null),
  RATE_LIMITS: { quiz: { windowMs: 60000, maxRequests: 30 } },
}))

jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}))

const mockSupabaseFrom = jest.fn()
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: mockSupabaseFrom }),
}))

import { POST, GET, PUT, DELETE } from '@/app/api/quiz/quick/route'
import { NextRequest } from 'next/server'

function createPostRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/quiz/quick', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const mockQuestions = [
  {
    id: 1,
    question_text: 'Q1?',
    options: ['A', 'B', 'C', 'D'],
    correct_answer: 0,
    category: 'Science',
    difficulty: 'easy',
  },
  {
    id: 2,
    question_text: 'Q2?',
    options: ['A', 'B', 'C', 'D'],
    correct_answer: 1,
    category: 'Science',
    difficulty: 'medium',
  },
  {
    id: 3,
    question_text: 'Q3?',
    options: ['A', 'B', 'C', 'D'],
    correct_answer: 2,
    category: 'Science',
    difficulty: 'easy',
  },
]

describe('/api/quiz/quick', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST - fetch questions', () => {
    it('returns questions for a valid category', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: mockQuestions, error: null }),
          }),
        }),
      })

      const response = await POST(createPostRequest({ category: 'Science' }))
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.length).toBe(3)
      expect(body.data[0]).toHaveProperty('question')
      expect(body.data[0]).toHaveProperty('options')
      expect(body.data[0]).toHaveProperty('correctAnswer')
    })

    it('maps database fields to API format', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [mockQuestions[0]], error: null }),
          }),
        }),
      })

      const response = await POST(createPostRequest({ category: 'Science' }))
      const body = await response.json()

      const q = body.data[0]
      expect(q.question).toBe('Q1?')
      expect(q.correctAnswer).toBe(0)
      expect(q.id).toBe(1)
    })
  })

  describe('Validation', () => {
    it('rejects missing category', async () => {
      const response = await POST(createPostRequest({}))
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error).toMatch(/category/i)
    })

    it('rejects empty string category', async () => {
      const response = await POST(createPostRequest({ category: '   ' }))
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
    })

    it('rejects non-string category', async () => {
      const response = await POST(createPostRequest({ category: 123 }))
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
    })
  })

  describe('Error handling', () => {
    it('returns 404 when no questions found', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      })

      const response = await POST(createPostRequest({ category: 'NonExistent' }))
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
    })

    it('returns 500 on database error', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } }),
          }),
        }),
      })

      const response = await POST(createPostRequest({ category: 'Science' }))
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.success).toBe(false)
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
