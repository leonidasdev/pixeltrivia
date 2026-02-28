/**
 * Tests for shared session factory
 *
 * @module __tests__/unit/lib/session
 * @since 1.4.0
 */

import { createBaseSession, type BaseSessionFields } from '@/lib/session'

// Mock generateId to produce predictable but unique IDs
let idCounter = 0
jest.mock('@/lib/utils', () => ({
  generateId: (prefix?: string) => {
    idCounter++
    return prefix ? `${prefix}-mock-${idCounter}` : `mock-${idCounter}`
  },
}))

beforeEach(() => {
  idCounter = 0
})

describe('createBaseSession', () => {
  const sampleQuestions = [
    { id: 1, text: 'Question 1' },
    { id: 2, text: 'Question 2' },
    { id: 3, text: 'Question 3' },
  ]

  it('returns an object with all base session fields', () => {
    const session = createBaseSession('game', sampleQuestions)

    expect(session).toHaveProperty('sessionId')
    expect(session).toHaveProperty('questions')
    expect(session).toHaveProperty('currentQuestionIndex')
    expect(session).toHaveProperty('startTime')
  })

  it('generates a sessionId with the given prefix', () => {
    const session = createBaseSession('quick', sampleQuestions)

    expect(session.sessionId).toMatch(/^quick-/)
  })

  it('generates unique sessionIds across calls', () => {
    const session1 = createBaseSession('game', sampleQuestions)
    const session2 = createBaseSession('game', sampleQuestions)

    expect(session1.sessionId).not.toBe(session2.sessionId)
  })

  it('stores the provided questions array', () => {
    const session = createBaseSession('game', sampleQuestions)

    expect(session.questions).toBe(sampleQuestions)
    expect(session.questions).toHaveLength(3)
  })

  it('initialises currentQuestionIndex to 0', () => {
    const session = createBaseSession('game', sampleQuestions)

    expect(session.currentQuestionIndex).toBe(0)
  })

  it('sets startTime to approximately now', () => {
    const before = new Date()
    const session = createBaseSession('game', sampleQuestions)
    const after = new Date()

    expect(session.startTime.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(session.startTime.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('handles an empty questions array', () => {
    const session = createBaseSession('game', [])

    expect(session.questions).toHaveLength(0)
    expect(session.currentQuestionIndex).toBe(0)
  })

  it('preserves generic question type', () => {
    interface CustomQ {
      id: number
      prompt: string
      answer: string
    }
    const questions: CustomQ[] = [{ id: 1, prompt: 'What?', answer: '42' }]
    const session: BaseSessionFields<CustomQ> = createBaseSession('custom', questions)

    expect(session.questions[0].prompt).toBe('What?')
    expect(session.questions[0].answer).toBe('42')
  })

  it('can be spread into a specialised session object', () => {
    const session = {
      ...createBaseSession('game', sampleQuestions),
      score: 0,
      category: 'Science',
    }

    expect(session.sessionId).toMatch(/^game-/)
    expect(session.score).toBe(0)
    expect(session.category).toBe('Science')
    expect(session.currentQuestionIndex).toBe(0)
  })

  it('supports different prefix strings', () => {
    const game = createBaseSession('game', [])
    const quick = createBaseSession('quick', [])
    const custom = createBaseSession('custom', [])

    expect(game.sessionId).toMatch(/^game-/)
    expect(quick.sessionId).toMatch(/^quick-/)
    expect(custom.sessionId).toMatch(/^custom-/)
  })
})
