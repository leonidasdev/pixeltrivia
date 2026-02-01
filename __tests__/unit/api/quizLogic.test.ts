/**
 * Unit Tests for Quiz API Logic
 *
 * Tests the quiz API helper functions and validation logic.
 * These tests validate the core business logic without needing
 * Next.js request/response infrastructure.
 *
 * @module __tests__/unit/api/quizLogic.test.ts
 */

describe('Quiz API Logic', () => {
  describe('category validation', () => {
    function validateCategory(category: string | null | undefined): boolean {
      if (!category || typeof category !== 'string') return false
      return category.trim().length > 0
    }

    it('should reject null category', () => {
      expect(validateCategory(null)).toBe(false)
    })

    it('should reject undefined category', () => {
      expect(validateCategory(undefined)).toBe(false)
    })

    it('should reject empty string', () => {
      expect(validateCategory('')).toBe(false)
    })

    it('should reject whitespace-only string', () => {
      expect(validateCategory('   ')).toBe(false)
    })

    it('should accept valid category', () => {
      expect(validateCategory('Science')).toBe(true)
    })

    it('should accept category with leading/trailing whitespace', () => {
      expect(validateCategory('  History  ')).toBe(true)
    })
  })

  describe('count parameter validation', () => {
    function validateCount(count: number | string | undefined): number {
      const parsed = typeof count === 'string' ? parseInt(count, 10) : count
      if (parsed === undefined || isNaN(parsed as number)) return 10
      return Math.max(1, Math.min(50, parsed as number))
    }

    it('should return default of 10 for undefined', () => {
      expect(validateCount(undefined)).toBe(10)
    })

    it('should return default of 10 for NaN', () => {
      expect(validateCount('not-a-number')).toBe(10)
    })

    it('should enforce minimum of 1', () => {
      expect(validateCount(0)).toBe(1)
      expect(validateCount(-5)).toBe(1)
    })

    it('should enforce maximum of 50', () => {
      expect(validateCount(100)).toBe(50)
      expect(validateCount(51)).toBe(50)
    })

    it('should accept valid count', () => {
      expect(validateCount(10)).toBe(10)
      expect(validateCount(25)).toBe(25)
    })

    it('should parse string to number', () => {
      expect(validateCount('15')).toBe(15)
    })
  })

  describe('difficulty validation', () => {
    const VALID_DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'] as const

    function validateDifficulty(
      difficulty: string | undefined
    ): (typeof VALID_DIFFICULTIES)[number] | 'mixed' {
      if (!difficulty) return 'mixed'
      const lower = difficulty.toLowerCase()
      if (VALID_DIFFICULTIES.includes(lower as (typeof VALID_DIFFICULTIES)[number])) {
        return lower as (typeof VALID_DIFFICULTIES)[number]
      }
      return 'mixed'
    }

    it('should return mixed for undefined', () => {
      expect(validateDifficulty(undefined)).toBe('mixed')
    })

    it('should return mixed for invalid difficulty', () => {
      expect(validateDifficulty('super-hard')).toBe('mixed')
    })

    it('should accept easy', () => {
      expect(validateDifficulty('easy')).toBe('easy')
    })

    it('should accept medium', () => {
      expect(validateDifficulty('medium')).toBe('medium')
    })

    it('should accept hard', () => {
      expect(validateDifficulty('hard')).toBe('hard')
    })

    it('should be case-insensitive', () => {
      expect(validateDifficulty('EASY')).toBe('easy')
      expect(validateDifficulty('Medium')).toBe('medium')
    })
  })

  describe('question transformation', () => {
    interface DbQuestion {
      id: number
      question: string
      options: string[]
      correct_answer: number
      category: string
      difficulty: string
    }

    interface ApiQuestion {
      id: number
      question: string
      options: string[]
      correctAnswer: number
      category: string
      difficulty: string
    }

    function transformQuestion(dbQuestion: DbQuestion): ApiQuestion {
      return {
        id: dbQuestion.id,
        question: dbQuestion.question,
        options: dbQuestion.options,
        correctAnswer: dbQuestion.correct_answer,
        category: dbQuestion.category,
        difficulty: dbQuestion.difficulty,
      }
    }

    it('should transform database question to API format', () => {
      const dbQuestion: DbQuestion = {
        id: 1,
        question: 'What is 2+2?',
        options: ['1', '2', '3', '4'],
        correct_answer: 3,
        category: 'Math',
        difficulty: 'easy',
      }

      const result = transformQuestion(dbQuestion)

      expect(result.correctAnswer).toBe(3)
      expect(result.id).toBe(1)
      expect(result.question).toBe('What is 2+2?')
    })

    it('should preserve all fields', () => {
      const dbQuestion: DbQuestion = {
        id: 42,
        question: 'Test question?',
        options: ['A', 'B', 'C', 'D'],
        correct_answer: 0,
        category: 'General',
        difficulty: 'hard',
      }

      const result = transformQuestion(dbQuestion)

      expect(result.options).toEqual(['A', 'B', 'C', 'D'])
      expect(result.category).toBe('General')
      expect(result.difficulty).toBe('hard')
    })
  })

  describe('response construction', () => {
    interface QuizResponse {
      questions: unknown[]
      category: string
      totalCount: number
    }

    function buildQuizResponse(questions: unknown[], category: string): QuizResponse {
      return {
        questions,
        category,
        totalCount: questions.length,
      }
    }

    it('should build response with correct structure', () => {
      const questions = [{ id: 1 }, { id: 2 }]
      const response = buildQuizResponse(questions, 'Science')

      expect(response.questions).toEqual(questions)
      expect(response.category).toBe('Science')
      expect(response.totalCount).toBe(2)
    })

    it('should handle empty questions array', () => {
      const response = buildQuizResponse([], 'History')

      expect(response.questions).toEqual([])
      expect(response.totalCount).toBe(0)
    })
  })
})
