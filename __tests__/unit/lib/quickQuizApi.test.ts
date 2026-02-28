/**
 * Unit tests for lib/quickQuizApi.ts
 * Tests quiz session management, validation, and scoring
 */

import {
  validateQuizQuestion,
  createQuickQuizSession,
  recordAnswer,
  calculateQuizResults,
  type QuickQuizQuestion,
  type QuickQuizSession,
} from '@/lib/quickQuizApi'

describe('quickQuizApi', () => {
  // Sample test questions
  const sampleQuestions: QuickQuizQuestion[] = [
    {
      id: 1,
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 2,
      category: 'Geography',
      difficulty: 'easy',
    },
    {
      id: 2,
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      category: 'Math',
      difficulty: 'easy',
    },
    {
      id: 3,
      question: 'Which planet is closest to the Sun?',
      options: ['Venus', 'Mercury', 'Mars', 'Earth'],
      correctAnswer: 1,
      category: 'Science',
      difficulty: 'medium',
    },
  ]

  describe('validateQuizQuestion', () => {
    it('should return true for a valid question', () => {
      expect(validateQuizQuestion(sampleQuestions[0])).toBe(true)
    })

    it('should return false for null or undefined', () => {
      expect(validateQuizQuestion(null)).toBe(false)
      expect(validateQuizQuestion(undefined)).toBe(false)
    })

    it('should return false for non-object values', () => {
      expect(validateQuizQuestion('string')).toBe(false)
      expect(validateQuizQuestion(123)).toBe(false)
      expect(validateQuizQuestion([])).toBe(false)
    })

    it('should return false if id is not a number', () => {
      expect(validateQuizQuestion({ ...sampleQuestions[0], id: 'abc' })).toBe(false)
    })

    it('should return false if question is empty or not a string', () => {
      expect(validateQuizQuestion({ ...sampleQuestions[0], question: '' })).toBe(false)
      expect(validateQuizQuestion({ ...sampleQuestions[0], question: 123 })).toBe(false)
    })

    it('should return false if options is not an array', () => {
      expect(validateQuizQuestion({ ...sampleQuestions[0], options: 'not array' })).toBe(false)
    })

    it('should return false if options has fewer than 2 items', () => {
      expect(validateQuizQuestion({ ...sampleQuestions[0], options: ['only one'] })).toBe(false)
    })

    it('should return false if options contains non-strings', () => {
      expect(validateQuizQuestion({ ...sampleQuestions[0], options: [1, 2, 3, 4] })).toBe(false)
    })

    it('should return false if correctAnswer is out of bounds', () => {
      expect(validateQuizQuestion({ ...sampleQuestions[0], correctAnswer: -1 })).toBe(false)
      expect(validateQuizQuestion({ ...sampleQuestions[0], correctAnswer: 10 })).toBe(false)
    })

    it('should return false if category or difficulty is not a string', () => {
      expect(validateQuizQuestion({ ...sampleQuestions[0], category: 123 })).toBe(false)
      expect(validateQuizQuestion({ ...sampleQuestions[0], difficulty: null })).toBe(false)
    })
  })

  describe('createQuickQuizSession', () => {
    it('should create a session with all required properties', () => {
      const session = createQuickQuizSession(sampleQuestions, 'Science')

      expect(session).toHaveProperty('sessionId')
      expect(session).toHaveProperty('questions')
      expect(session).toHaveProperty('currentQuestionIndex', 0)
      expect(session).toHaveProperty('answers', [])
      expect(session).toHaveProperty('startTime')
      expect(session).toHaveProperty('category', 'Science')
      expect(session).toHaveProperty('isComplete', false)
    })

    it('should generate a unique session ID', () => {
      const session1 = createQuickQuizSession(sampleQuestions, 'Science')
      const session2 = createQuickQuizSession(sampleQuestions, 'Science')

      expect(session1.sessionId).not.toBe(session2.sessionId)
    })

    it('should have sessionId starting with "quick-"', () => {
      const session = createQuickQuizSession(sampleQuestions, 'Science')
      expect(session.sessionId).toMatch(/^quick-/)
    })

    it('should shuffle the questions', () => {
      // Create multiple sessions and check if questions are shuffled
      const sessions = Array.from({ length: 20 }, () =>
        createQuickQuizSession(sampleQuestions, 'Science')
      )

      const orderings = new Set(sessions.map(s => s.questions.map(q => q.id).join(',')))

      // Should have multiple different orderings
      expect(orderings.size).toBeGreaterThan(1)
    })

    it('should set startTime to current date', () => {
      const before = new Date()
      const session = createQuickQuizSession(sampleQuestions, 'Science')
      const after = new Date()

      expect(session.startTime.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(session.startTime.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })

  describe('recordAnswer', () => {
    let session: QuickQuizSession

    beforeEach(() => {
      // Create a session with non-shuffled questions for predictable testing
      session = {
        sessionId: 'test-session',
        questions: sampleQuestions,
        currentQuestionIndex: 0,
        answers: [],
        startTime: new Date(),
        category: 'Test',
        isComplete: false,
      }
    })

    it('should record a correct answer', () => {
      // First question has correctAnswer: 2
      const updated = recordAnswer(session, 2, 5.5)

      expect(updated.answers).toHaveLength(1)
      expect(updated.answers[0].selectedAnswer).toBe(2)
      expect(updated.answers[0].isCorrect).toBe(true)
      expect(updated.answers[0].timeSpent).toBe(5.5)
    })

    it('should record an incorrect answer', () => {
      // First question has correctAnswer: 2, selecting 0 is wrong
      const updated = recordAnswer(session, 0, 3.2)

      expect(updated.answers[0].selectedAnswer).toBe(0)
      expect(updated.answers[0].isCorrect).toBe(false)
    })

    it('should record null answer (skipped/timed out)', () => {
      const updated = recordAnswer(session, null, 30)

      expect(updated.answers[0].selectedAnswer).toBe(null)
      expect(updated.answers[0].isCorrect).toBe(false)
    })

    it('should increment currentQuestionIndex', () => {
      expect(session.currentQuestionIndex).toBe(0)

      const updated = recordAnswer(session, 2, 5)
      expect(updated.currentQuestionIndex).toBe(1)
    })

    it('should set isComplete when last question is answered', () => {
      let currentSession = session

      // Answer all questions
      for (let i = 0; i < sampleQuestions.length; i++) {
        currentSession = recordAnswer(currentSession, 1, 5)
      }

      expect(currentSession.isComplete).toBe(true)
    })

    it('should not mutate the original session', () => {
      const originalAnswersLength = session.answers.length
      const originalIndex = session.currentQuestionIndex

      recordAnswer(session, 2, 5)

      expect(session.answers.length).toBe(originalAnswersLength)
      expect(session.currentQuestionIndex).toBe(originalIndex)
    })

    it('should add timestamp to the answer', () => {
      const before = new Date()
      const updated = recordAnswer(session, 2, 5)
      const after = new Date()

      expect(updated.answers[0].timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(updated.answers[0].timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })

  describe('calculateQuizResults', () => {
    it('should calculate correct results for all correct answers', () => {
      const session: QuickQuizSession = {
        sessionId: 'test',
        questions: sampleQuestions,
        currentQuestionIndex: 3,
        answers: [
          {
            questionId: 1,
            selectedAnswer: 2,
            isCorrect: true,
            timeSpent: 5,
            timestamp: new Date(),
          },
          {
            questionId: 2,
            selectedAnswer: 1,
            isCorrect: true,
            timeSpent: 3,
            timestamp: new Date(),
          },
          {
            questionId: 3,
            selectedAnswer: 1,
            isCorrect: true,
            timeSpent: 7,
            timestamp: new Date(),
          },
        ],
        startTime: new Date(),
        category: 'Test',
        isComplete: true,
      }

      const results = calculateQuizResults(session)

      expect(results.totalQuestions).toBe(3)
      expect(results.correctAnswers).toBe(3)
      expect(results.accuracy).toBe(100)
      expect(results.grade).toBe('A')
    })

    it('should calculate correct results for all wrong answers', () => {
      const session: QuickQuizSession = {
        sessionId: 'test',
        questions: sampleQuestions,
        currentQuestionIndex: 3,
        answers: [
          {
            questionId: 1,
            selectedAnswer: 0,
            isCorrect: false,
            timeSpent: 5,
            timestamp: new Date(),
          },
          {
            questionId: 2,
            selectedAnswer: 0,
            isCorrect: false,
            timeSpent: 3,
            timestamp: new Date(),
          },
          {
            questionId: 3,
            selectedAnswer: 0,
            isCorrect: false,
            timeSpent: 7,
            timestamp: new Date(),
          },
        ],
        startTime: new Date(),
        category: 'Test',
        isComplete: true,
      }

      const results = calculateQuizResults(session)

      expect(results.correctAnswers).toBe(0)
      expect(results.accuracy).toBe(0)
      expect(results.score).toBe(0)
      expect(results.grade).toBe('F')
    })

    it('should calculate average and total time correctly', () => {
      const session: QuickQuizSession = {
        sessionId: 'test',
        questions: sampleQuestions,
        currentQuestionIndex: 3,
        answers: [
          {
            questionId: 1,
            selectedAnswer: 2,
            isCorrect: true,
            timeSpent: 10,
            timestamp: new Date(),
          },
          {
            questionId: 2,
            selectedAnswer: 1,
            isCorrect: true,
            timeSpent: 20,
            timestamp: new Date(),
          },
          {
            questionId: 3,
            selectedAnswer: 1,
            isCorrect: false,
            timeSpent: 30,
            timestamp: new Date(),
          },
        ],
        startTime: new Date(),
        category: 'Test',
        isComplete: true,
      }

      const results = calculateQuizResults(session)

      expect(results.totalTime).toBe(60)
      expect(results.averageTime).toBe(20)
    })

    it('should assign correct grades based on accuracy', () => {
      const createSessionWithAccuracy = (correctCount: number, total: number): QuickQuizSession => {
        const questions = Array.from({ length: total }, (_, i) => ({
          id: i,
          question: `Q${i}`,
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          category: 'Test',
          difficulty: 'easy',
        }))

        const answers = Array.from({ length: total }, (_, i) => ({
          questionId: i,
          selectedAnswer: 0,
          isCorrect: i < correctCount,
          timeSpent: 5,
          timestamp: new Date(),
        }))

        return {
          sessionId: 'test',
          questions,
          currentQuestionIndex: total,
          answers,
          startTime: new Date(),
          category: 'Test',
          isComplete: true,
        }
      }

      // 90%+ = A
      expect(calculateQuizResults(createSessionWithAccuracy(9, 10)).grade).toBe('A')
      expect(calculateQuizResults(createSessionWithAccuracy(10, 10)).grade).toBe('A')

      // 80-89% = B
      expect(calculateQuizResults(createSessionWithAccuracy(8, 10)).grade).toBe('B')
      expect(calculateQuizResults(createSessionWithAccuracy(89, 100)).grade).toBe('B')

      // 70-79% = C
      expect(calculateQuizResults(createSessionWithAccuracy(7, 10)).grade).toBe('C')

      // 60-69% = D
      expect(calculateQuizResults(createSessionWithAccuracy(6, 10)).grade).toBe('D')

      // Below 60% = F
      expect(calculateQuizResults(createSessionWithAccuracy(5, 10)).grade).toBe('F')
      expect(calculateQuizResults(createSessionWithAccuracy(0, 10)).grade).toBe('F')
    })

    it('should give time bonus for fast answers', () => {
      // Fast answer (5 seconds)
      const fastSession: QuickQuizSession = {
        sessionId: 'test',
        questions: [sampleQuestions[0]],
        currentQuestionIndex: 1,
        answers: [
          {
            questionId: 1,
            selectedAnswer: 2,
            isCorrect: true,
            timeSpent: 5,
            timestamp: new Date(),
          },
        ],
        startTime: new Date(),
        category: 'Test',
        isComplete: true,
      }

      // Slow answer (29 seconds)
      const slowSession: QuickQuizSession = {
        sessionId: 'test',
        questions: [sampleQuestions[0]],
        currentQuestionIndex: 1,
        answers: [
          {
            questionId: 1,
            selectedAnswer: 2,
            isCorrect: true,
            timeSpent: 29,
            timestamp: new Date(),
          },
        ],
        startTime: new Date(),
        category: 'Test',
        isComplete: true,
      }

      const fastResults = calculateQuizResults(fastSession)
      const slowResults = calculateQuizResults(slowSession)

      // Both correct, but fast should have higher score due to time bonus
      expect(fastResults.score).toBeGreaterThan(slowResults.score)
    })

    it('should handle empty session', () => {
      const emptySession: QuickQuizSession = {
        sessionId: 'test',
        questions: [],
        currentQuestionIndex: 0,
        answers: [],
        startTime: new Date(),
        category: 'Test',
        isComplete: true,
      }

      const results = calculateQuizResults(emptySession)

      expect(results.totalQuestions).toBe(0)
      expect(results.correctAnswers).toBe(0)
      expect(results.accuracy).toBe(0)
      expect(results.totalTime).toBe(0)
      expect(results.averageTime).toBe(0)
    })
  })
})
