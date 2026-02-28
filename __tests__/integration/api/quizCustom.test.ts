/**
 * @jest-environment node
 */

/**
 * Integration tests for /api/quiz/custom
 */

jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn(() => null),
  RATE_LIMITS: { aiGeneration: { windowMs: 60000, maxRequests: 5 } },
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

// Save original fetch
const originalFetch = global.fetch

import { POST, GET, PUT, DELETE } from '@/app/api/quiz/custom/route'
import { NextRequest } from 'next/server'

function createPostRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/quiz/custom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('/api/quiz/custom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set API key so validation tests reach the validation logic
    process.env.OPENROUTER_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    global.fetch = originalFetch
    delete process.env.OPENROUTER_API_KEY
  })

  describe('POST - validation', () => {
    it('rejects missing knowledgeLevel', async () => {
      const response = await POST(
        createPostRequest({
          context: 'test',
          numQuestions: 5,
        })
      )
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
    })

    it('rejects invalid numQuestions (too low)', async () => {
      const response = await POST(
        createPostRequest({
          knowledgeLevel: 'college',
          context: 'test',
          numQuestions: 0,
        })
      )
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
    })

    it('rejects invalid numQuestions (too high)', async () => {
      const response = await POST(
        createPostRequest({
          knowledgeLevel: 'college',
          context: 'test',
          numQuestions: 51,
        })
      )
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
    })

    it('rejects non-numeric numQuestions', async () => {
      const response = await POST(
        createPostRequest({
          knowledgeLevel: 'college',
          context: 'test',
          numQuestions: 'abc',
        })
      )
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
    })
  })

  describe('POST - API key missing', () => {
    it('returns server error when API key is not configured', async () => {
      const savedKey = process.env.OPENROUTER_API_KEY
      delete process.env.OPENROUTER_API_KEY

      const response = await POST(
        createPostRequest({
          knowledgeLevel: 'college',
          context: 'test',
          numQuestions: 5,
        })
      )
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.success).toBe(false)

      // Restore
      if (savedKey) process.env.OPENROUTER_API_KEY = savedKey
    })
  })

  describe('POST - successful generation', () => {
    it('returns formatted questions on success', async () => {
      process.env.OPENROUTER_API_KEY = 'test-key'

      const mockQuestions = {
        questions: [
          {
            question: 'What is 2+2?',
            options: ['1', '2', '3', '4'],
            correctAnswer: 3,
            category: 'Math',
            difficulty: 'easy',
          },
        ],
      }

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: JSON.stringify(mockQuestions),
                },
              },
            ],
          }),
      }) as jest.Mock

      const response = await POST(
        createPostRequest({
          knowledgeLevel: 'college',
          context: 'math',
          numQuestions: 1,
        })
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(1)
      expect(body.data[0]).toHaveProperty('id')
      expect(body.data[0].question).toBe('What is 2+2?')
      expect(body.data[0].options).toHaveLength(4)
    })

    it('handles markdown-wrapped JSON responses', async () => {
      process.env.OPENROUTER_API_KEY = 'test-key'

      const mockQuestions = {
        questions: [
          {
            question: 'Test?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            category: 'Test',
            difficulty: 'easy',
          },
        ],
      }

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: '```json\n' + JSON.stringify(mockQuestions) + '\n```',
                },
              },
            ],
          }),
      }) as jest.Mock

      const response = await POST(
        createPostRequest({
          knowledgeLevel: 'elementary',
          context: '',
          numQuestions: 1,
        })
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
    })
  })

  describe('POST - error handling', () => {
    it('handles OpenRouter API error', async () => {
      process.env.OPENROUTER_API_KEY = 'test-key'

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal server error'),
      }) as jest.Mock

      const response = await POST(
        createPostRequest({
          knowledgeLevel: 'college',
          context: 'test',
          numQuestions: 5,
        })
      )
      const body = await response.json()

      expect(response.status).toBe(502)
      expect(body.success).toBe(false)
    })

    it('handles invalid JSON from AI', async () => {
      process.env.OPENROUTER_API_KEY = 'test-key'

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: 'not valid json at all',
                },
              },
            ],
          }),
      }) as jest.Mock

      const response = await POST(
        createPostRequest({
          knowledgeLevel: 'college',
          context: 'test',
          numQuestions: 5,
        })
      )
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.success).toBe(false)
    })

    it('handles empty AI response', async () => {
      process.env.OPENROUTER_API_KEY = 'test-key'

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: null,
                },
              },
            ],
          }),
      }) as jest.Mock

      const response = await POST(
        createPostRequest({
          knowledgeLevel: 'college',
          context: 'test',
          numQuestions: 5,
        })
      )
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
