/**
 * Tests for Validation Schemas
 */

import { z } from 'zod'
import {
  nicknameSchema,
  roomCodeSchema,
  uuidSchema,
  createRoomSchema,
  joinRoomSchema,
  quickQuizSchema,
  customQuizSchema,
  advancedQuizSchema,
  submitAnswerSchema,
  validate,
  formatZodErrors,
  getFirstError,
} from '@/lib/validation'

describe('Validation Schemas', () => {
  describe('nicknameSchema', () => {
    it('should accept valid nicknames', () => {
      expect(nicknameSchema.safeParse('Player1').success).toBe(true)
      expect(nicknameSchema.safeParse('CoolGamer').success).toBe(true)
      expect(nicknameSchema.safeParse('AB').success).toBe(true)
      expect(nicknameSchema.safeParse('A'.repeat(20)).success).toBe(true)
    })

    it('should reject empty nicknames', () => {
      expect(nicknameSchema.safeParse('').success).toBe(false)
    })

    it('should reject nicknames that are too long', () => {
      expect(nicknameSchema.safeParse('A'.repeat(21)).success).toBe(false)
    })

    it('should trim whitespace', () => {
      const result = nicknameSchema.safeParse('  Player  ')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('Player')
      }
    })

    it('should reject nicknames with special characters', () => {
      expect(nicknameSchema.safeParse('Player<script>').success).toBe(false)
      expect(nicknameSchema.safeParse('Player@123').success).toBe(false)
    })
  })

  describe('roomCodeSchema', () => {
    it('should accept valid 6-character uppercase codes', () => {
      expect(roomCodeSchema.safeParse('ABCDEF').success).toBe(true)
      expect(roomCodeSchema.safeParse('123456').success).toBe(true)
      expect(roomCodeSchema.safeParse('ABC123').success).toBe(true)
    })

    it('should transform to uppercase', () => {
      const result = roomCodeSchema.safeParse('abcdef')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('ABCDEF')
      }
    })

    it('should reject codes that are not 6 characters', () => {
      expect(roomCodeSchema.safeParse('ABC').success).toBe(false)
      expect(roomCodeSchema.safeParse('ABCDEFG').success).toBe(false)
    })

    it('should reject codes with special characters', () => {
      expect(roomCodeSchema.safeParse('ABC-12').success).toBe(false)
    })
  })

  describe('uuidSchema', () => {
    it('should accept valid UUIDs', () => {
      expect(uuidSchema.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true)
    })

    it('should reject invalid UUIDs', () => {
      expect(uuidSchema.safeParse('not-a-uuid').success).toBe(false)
      expect(uuidSchema.safeParse('').success).toBe(false)
    })
  })

  describe('createRoomSchema', () => {
    it('should accept valid room creation data', () => {
      const result = createRoomSchema.safeParse({
        hostNickname: 'GameMaster',
        maxPlayers: 8,
      })
      expect(result.success).toBe(true)
    })

    it('should accept minimal data with defaults', () => {
      const result = createRoomSchema.safeParse({
        hostNickname: 'Host',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid maxPlayers', () => {
      expect(
        createRoomSchema.safeParse({
          hostNickname: 'Host',
          maxPlayers: 1,
        }).success
      ).toBe(false)
      expect(
        createRoomSchema.safeParse({
          hostNickname: 'Host',
          maxPlayers: 20,
        }).success
      ).toBe(false)
    })
  })

  describe('joinRoomSchema', () => {
    it('should accept valid join data', () => {
      const result = joinRoomSchema.safeParse({
        roomCode: 'ABC123',
        nickname: 'Player1',
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing fields', () => {
      expect(
        joinRoomSchema.safeParse({
          roomCode: 'ABC123',
        }).success
      ).toBe(false)
    })
  })

  describe('quickQuizSchema', () => {
    it('should accept valid quick quiz request', () => {
      const result = quickQuizSchema.safeParse({
        category: 'gaming',
        difficulty: 'elementary',
        questionCount: 5,
      })
      expect(result.success).toBe(true)
    })

    it('should use defaults for missing fields', () => {
      const result = quickQuizSchema.safeParse({
        category: 'movies',
        difficulty: 'high-school',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.questionCount).toBeDefined()
      }
    })

    it('should reject invalid difficulty', () => {
      expect(
        quickQuizSchema.safeParse({
          category: 'gaming',
          difficulty: 'impossible',
        }).success
      ).toBe(false)
    })
  })

  describe('customQuizSchema', () => {
    it('should accept valid custom quiz request', () => {
      const result = customQuizSchema.safeParse({
        knowledgeLevel: 'college',
        context: 'Focus on military history',
        numberOfQuestions: 5,
      })
      expect(result.success).toBe(true)
    })

    it('should accept minimal data', () => {
      const result = customQuizSchema.safeParse({
        knowledgeLevel: 'middle-school',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid knowledge level', () => {
      expect(
        customQuizSchema.safeParse({
          knowledgeLevel: 'invalid',
        }).success
      ).toBe(false)
    })
  })

  describe('advancedQuizSchema', () => {
    it('should accept valid advanced quiz request', () => {
      const result = advancedQuizSchema.safeParse({
        knowledgeLevel: 'high-school',
        categories: ['physics', 'chemistry'],
        numberOfQuestions: 10,
        timePerQuestion: 30,
        enableHints: true,
      })
      expect(result.success).toBe(true)
    })

    it('should require categories array', () => {
      expect(
        advancedQuizSchema.safeParse({
          knowledgeLevel: 'college',
        }).success
      ).toBe(false)
    })
  })

  describe('submitAnswerSchema', () => {
    it('should accept valid answer submission', () => {
      const result = submitAnswerSchema.safeParse({
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        questionId: 'q1',
        selectedAnswer: 'A',
        timeSpent: 15,
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing required fields', () => {
      expect(
        submitAnswerSchema.safeParse({
          questionId: 'q1',
        }).success
      ).toBe(false)
    })

    it('should reject invalid session ID', () => {
      expect(
        submitAnswerSchema.safeParse({
          sessionId: 'not-a-uuid',
          questionId: 'q1',
          selectedAnswer: 'A',
        }).success
      ).toBe(false)
    })
  })

  describe('validate utility', () => {
    it('should return success result for valid data', () => {
      const result = validate(nicknameSchema, 'ValidName')
      expect(result.success).toBe(true)
    })

    it('should return error result for invalid data', () => {
      const result = validate(nicknameSchema, '')
      expect(result.success).toBe(false)
    })
  })

  describe('formatZodErrors', () => {
    it('should format errors into key-value pairs', () => {
      const schema = z.object({
        name: z.string().min(2),
        age: z.number().min(0),
      })
      const result = schema.safeParse({ name: 'A', age: -1 })
      if (!result.success) {
        const formatted = formatZodErrors(result.error)
        expect(formatted).toHaveProperty('name')
        expect(formatted).toHaveProperty('age')
      }
    })
  })

  describe('getFirstError', () => {
    it('should return first error message', () => {
      const schema = z.object({
        name: z.string().min(2, 'Name too short'),
      })
      const result = schema.safeParse({ name: 'A' })
      if (!result.success) {
        const message = getFirstError(result.error)
        expect(message).toBe('Name too short')
      }
    })

    it('should return default message for empty errors', () => {
      const emptyError = new z.ZodError([])
      expect(getFirstError(emptyError)).toBe('Validation failed')
    })
  })
})
