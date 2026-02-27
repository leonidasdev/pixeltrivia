/**
 * @jest-environment node
 */

/**
 * Integration tests for /api/ai/generate-questions (mock endpoint)
 */

jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn(() => null),
  RATE_LIMITS: { aiGeneration: { windowMs: 60000, maxRequests: 5 } },
}))

import { POST, GET, PUT, DELETE } from '@/app/api/ai/generate-questions/route'
import { NextRequest } from 'next/server'

function createPostRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/ai/generate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('/api/ai/generate-questions', () => {
  describe('POST - generate mock questions', () => {
    it('returns questions with default count', async () => {
      const response = await POST(
        createPostRequest({
          topic: 'space',
          difficulty: 'medium',
        })
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(5)
    })

    it('returns requested number of questions', async () => {
      const response = await POST(
        createPostRequest({
          topic: 'history',
          difficulty: 'hard',
          questionCount: 3,
        })
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data).toHaveLength(3)
    })

    it('includes topic in question text', async () => {
      const response = await POST(
        createPostRequest({
          topic: 'dinosaurs',
          questionCount: 1,
        })
      )
      const body = await response.json()

      expect(body.data[0].question).toContain('dinosaurs')
    })

    it('returns proper question structure', async () => {
      const response = await POST(
        createPostRequest({
          topic: 'math',
          difficulty: 'easy',
          questionCount: 1,
        })
      )
      const body = await response.json()
      const question = body.data[0]

      expect(question).toHaveProperty('id')
      expect(question).toHaveProperty('question')
      expect(question.options).toHaveLength(4)
      expect(question).toHaveProperty('correctAnswer')
      expect(question).toHaveProperty('difficulty', 'easy')
    })

    it('uses provided difficulty', async () => {
      const response = await POST(
        createPostRequest({
          topic: 'science',
          difficulty: 'hard',
          questionCount: 1,
        })
      )
      const body = await response.json()

      expect(body.data[0].difficulty).toBe('hard')
    })

    it('defaults difficulty to medium', async () => {
      const response = await POST(
        createPostRequest({
          topic: 'science',
          questionCount: 1,
        })
      )
      const body = await response.json()

      expect(body.data[0].difficulty).toBe('medium')
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
      expect(response.status).toBe(405)
    })

    it('DELETE returns 405', async () => {
      const response = DELETE()
      expect(response.status).toBe(405)
    })
  })
})
