/**
 * @jest-environment node
 */

/**
 * Integration tests for /api/game/questions
 */

jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn(() => null),
  RATE_LIMITS: { quiz: { windowMs: 60000, maxRequests: 30 } },
}))

jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}))

const mockSupabaseChain = {
  select: jest.fn(),
  eq: jest.fn(),
  limit: jest.fn(),
}

const mockSupabaseFrom = jest.fn()
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: mockSupabaseFrom }),
}))

import { GET, POST } from '@/app/api/game/questions/route'
import { NextRequest } from 'next/server'

function createGetRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/game/questions')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new NextRequest(url, { method: 'GET' })
}

const mockQuestions = [
  {
    id: 1,
    question_text: 'Q1?',
    options: ['A', 'B', 'C', 'D'],
    correct_answer: 0,
    category: 'science',
    difficulty: 'easy',
  },
  {
    id: 2,
    question_text: 'Q2?',
    options: ['A', 'B', 'C', 'D'],
    correct_answer: 1,
    category: 'science',
    difficulty: 'easy',
  },
  {
    id: 3,
    question_text: 'Q3?',
    options: ['A', 'B', 'C', 'D'],
    correct_answer: 2,
    category: 'science',
    difficulty: 'medium',
  },
]

describe('/api/game/questions', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup chainable mock: from().select().eq().limit() or from().select().limit()
    mockSupabaseChain.limit.mockResolvedValue({ data: mockQuestions, error: null })
    mockSupabaseChain.eq.mockReturnValue({ limit: mockSupabaseChain.limit })
    mockSupabaseChain.select.mockReturnValue({
      eq: mockSupabaseChain.eq,
      limit: mockSupabaseChain.limit,
    })
    mockSupabaseFrom.mockReturnValue({ select: mockSupabaseChain.select })
  })

  describe('GET - fetch questions', () => {
    it('returns questions with valid params', async () => {
      const response = await GET(
        createGetRequest({
          category: 'science',
          difficulty: 'high-school',
        })
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data.questions)).toBe(true)
      expect(body.data.selectedCategory).toBe('science')
      expect(body.data.selectedDifficulty).toBe('high-school')
      expect(body.data.timeLimit).toBe(30)
    })

    it('maps difficulty levels correctly', async () => {
      // high-school → medium difficulty in DB
      await GET(createGetRequest({ category: 'science', difficulty: 'high-school' }))

      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('difficulty', 'medium')
    })

    it('handles classic mode without difficulty filter', async () => {
      await GET(createGetRequest({ category: 'science', difficulty: 'classic' }))

      // Classic mode should NOT filter by difficulty (uses limit directly)
      expect(mockSupabaseChain.eq).not.toHaveBeenCalledWith('difficulty', expect.any(String))
    })

    it('respects custom limit parameter', async () => {
      const response = await GET(
        createGetRequest({
          category: 'science',
          difficulty: 'elementary',
          limit: '5',
        })
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data.questions.length).toBeLessThanOrEqual(5)
    })

    it('formats questions with questionNumber and timeLimit', async () => {
      const response = await GET(
        createGetRequest({
          category: 'science',
          difficulty: 'high-school',
        })
      )
      const body = await response.json()
      const q = body.data.questions[0]

      expect(q).toHaveProperty('questionNumber')
      expect(q).toHaveProperty('timeLimit', 30)
      expect(q).toHaveProperty('question')
      expect(q).toHaveProperty('options')
      expect(q).toHaveProperty('correctAnswer')
    })
  })

  describe('Validation', () => {
    it('rejects missing category', async () => {
      const response = await GET(createGetRequest({ difficulty: 'easy' }))
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error).toMatch(/category/i)
    })

    it('rejects missing difficulty', async () => {
      const response = await GET(createGetRequest({ category: 'science' }))
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error).toMatch(/difficulty/i)
    })

    it('rejects limit below 1', async () => {
      const response = await GET(
        createGetRequest({
          category: 'science',
          difficulty: 'easy',
          limit: '0',
        })
      )
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
    })

    it('rejects limit above 50', async () => {
      const response = await GET(
        createGetRequest({
          category: 'science',
          difficulty: 'easy',
          limit: '100',
        })
      )
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
    })
  })

  describe('Error handling', () => {
    it('returns 404 when no questions found', async () => {
      mockSupabaseChain.limit.mockResolvedValue({ data: [], error: null })

      const response = await GET(
        createGetRequest({
          category: 'nonexistent',
          difficulty: 'easy',
        })
      )
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
    })

    it('returns 500 on database error', async () => {
      mockSupabaseChain.limit.mockResolvedValue({
        data: null,
        error: { message: 'Connection refused' },
      })

      const response = await GET(
        createGetRequest({
          category: 'science',
          difficulty: 'easy',
        })
      )
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.success).toBe(false)
    })
  })

  describe('Method not allowed', () => {
    it('POST returns 405', async () => {
      const response = POST()
      expect(response.status).toBe(405)
    })
  })
})
