/**
 * Unit tests for lib/gameApi.ts
 * Tests game session management utilities
 */

import { createGameSession, type GameQuestion } from '@/lib/gameApi'

describe('gameApi', () => {
  const mockQuestions: GameQuestion[] = [
    {
      id: 1,
      questionNumber: 1,
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 2,
      category: 'Geography',
      difficulty: 'easy',
      timeLimit: 30,
    },
    {
      id: 2,
      questionNumber: 2,
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 1,
      category: 'Science',
      difficulty: 'easy',
      timeLimit: 30,
    },
  ]

  describe('createGameSession', () => {
    it('should create a game session with all required properties', () => {
      const session = createGameSession(mockQuestions, 'Geography', 'easy')

      expect(session).toHaveProperty('sessionId')
      expect(session).toHaveProperty('questions')
      expect(session).toHaveProperty('currentQuestionIndex')
      expect(session).toHaveProperty('score')
      expect(session).toHaveProperty('startTime')
      expect(session).toHaveProperty('answers')
      expect(session).toHaveProperty('category')
      expect(session).toHaveProperty('difficulty')
    })

    it('should generate a unique session ID', () => {
      const session1 = createGameSession(mockQuestions, 'Geography', 'easy')
      const session2 = createGameSession(mockQuestions, 'Geography', 'easy')

      expect(session1.sessionId).not.toBe(session2.sessionId)
    })

    it('should have sessionId starting with "game-"', () => {
      const session = createGameSession(mockQuestions, 'Science', 'medium')

      expect(session.sessionId).toMatch(/^game-/)
    })

    it('should store the provided questions', () => {
      const session = createGameSession(mockQuestions, 'Geography', 'easy')

      expect(session.questions).toEqual(mockQuestions)
      expect(session.questions).toHaveLength(2)
    })

    it('should initialize with zero score', () => {
      const session = createGameSession(mockQuestions, 'Geography', 'easy')

      expect(session.score).toBe(0)
    })

    it('should initialize at first question (index 0)', () => {
      const session = createGameSession(mockQuestions, 'Geography', 'easy')

      expect(session.currentQuestionIndex).toBe(0)
    })

    it('should initialize with empty answers array', () => {
      const session = createGameSession(mockQuestions, 'Geography', 'easy')

      expect(session.answers).toEqual([])
    })

    it('should store the category and difficulty', () => {
      const session = createGameSession(mockQuestions, 'Science', 'hard')

      expect(session.category).toBe('Science')
      expect(session.difficulty).toBe('hard')
    })

    it('should set startTime to current date', () => {
      const before = new Date()
      const session = createGameSession(mockQuestions, 'Geography', 'easy')
      const after = new Date()

      expect(session.startTime.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(session.startTime.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should handle empty questions array', () => {
      const session = createGameSession([], 'None', 'easy')

      expect(session.questions).toHaveLength(0)
      expect(session.currentQuestionIndex).toBe(0)
    })
  })
})
