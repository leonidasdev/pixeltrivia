/**
 * Unit tests for lib/customQuizApi.ts
 * Tests validation and utility functions (API calls are mocked)
 */

import {
  validateCustomQuizConfig,
  formatKnowledgeLevel,
  getEstimatedGenerationTime,
  type CustomQuizRequest,
} from '@/lib/customQuizApi'

describe('customQuizApi', () => {
  describe('validateCustomQuizConfig', () => {
    it('should validate a correct configuration', () => {
      const config: CustomQuizRequest = {
        knowledgeLevel: 'college',
        context: 'Ancient Greek mythology',
        numQuestions: 10,
      }

      const result = validateCustomQuizConfig(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept all valid knowledge levels', () => {
      const validLevels = ['classic', 'college', 'high-school', 'middle-school', 'elementary']

      validLevels.forEach(level => {
        const config: CustomQuizRequest = {
          knowledgeLevel: level,
          context: '',
          numQuestions: 10,
        }

        const result = validateCustomQuizConfig(config)
        expect(result.isValid).toBe(true)
      })
    })

    it('should reject invalid knowledge levels', () => {
      const config: CustomQuizRequest = {
        knowledgeLevel: 'invalid-level',
        context: '',
        numQuestions: 10,
      }

      const result = validateCustomQuizConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Knowledge level must be one of: classic, college, high-school, middle-school, elementary'
      )
    })

    it('should reject empty knowledge level', () => {
      const config: CustomQuizRequest = {
        knowledgeLevel: '',
        context: '',
        numQuestions: 10,
      }

      const result = validateCustomQuizConfig(config)
      expect(result.isValid).toBe(false)
    })

    it('should reject numQuestions less than 1', () => {
      const config: CustomQuizRequest = {
        knowledgeLevel: 'college',
        context: '',
        numQuestions: 0,
      }

      const result = validateCustomQuizConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Number of questions must be between 1 and 50')
    })

    it('should reject numQuestions greater than 50', () => {
      const config: CustomQuizRequest = {
        knowledgeLevel: 'college',
        context: '',
        numQuestions: 51,
      }

      const result = validateCustomQuizConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Number of questions must be between 1 and 50')
    })

    it('should accept numQuestions at boundaries (1 and 50)', () => {
      const config1: CustomQuizRequest = {
        knowledgeLevel: 'college',
        context: '',
        numQuestions: 1,
      }

      const config50: CustomQuizRequest = {
        knowledgeLevel: 'college',
        context: '',
        numQuestions: 50,
      }

      expect(validateCustomQuizConfig(config1).isValid).toBe(true)
      expect(validateCustomQuizConfig(config50).isValid).toBe(true)
    })

    it('should reject context longer than 1000 characters', () => {
      const config: CustomQuizRequest = {
        knowledgeLevel: 'college',
        context: 'a'.repeat(1001),
        numQuestions: 10,
      }

      const result = validateCustomQuizConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Context must be 1000 characters or less')
    })

    it('should accept context at exactly 1000 characters', () => {
      const config: CustomQuizRequest = {
        knowledgeLevel: 'college',
        context: 'a'.repeat(1000),
        numQuestions: 10,
      }

      const result = validateCustomQuizConfig(config)
      expect(result.isValid).toBe(true)
    })

    it('should collect multiple errors', () => {
      const config: CustomQuizRequest = {
        knowledgeLevel: 'invalid',
        context: 'a'.repeat(1001),
        numQuestions: 100,
      }

      const result = validateCustomQuizConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('formatKnowledgeLevel', () => {
    it('should format known knowledge levels', () => {
      expect(formatKnowledgeLevel('classic')).toBe('Classic')
      expect(formatKnowledgeLevel('college')).toBe('College Level')
      expect(formatKnowledgeLevel('high-school')).toBe('High School')
      expect(formatKnowledgeLevel('middle-school')).toBe('Middle School')
      expect(formatKnowledgeLevel('elementary')).toBe('Elementary')
    })

    it('should return original value for unknown levels', () => {
      expect(formatKnowledgeLevel('unknown')).toBe('unknown')
      expect(formatKnowledgeLevel('custom-level')).toBe('custom-level')
    })
  })

  describe('getEstimatedGenerationTime', () => {
    it('should return minimum 5 seconds', () => {
      expect(getEstimatedGenerationTime(0)).toBe(5)
      expect(getEstimatedGenerationTime(-5)).toBe(5)
    })

    it('should return base time + 1 second per question', () => {
      expect(getEstimatedGenerationTime(5)).toBe(10) // 5 + 5
      expect(getEstimatedGenerationTime(10)).toBe(15) // 5 + 10
      expect(getEstimatedGenerationTime(20)).toBe(25) // 5 + 20
    })

    it('should scale linearly with question count', () => {
      const time1 = getEstimatedGenerationTime(10)
      const time2 = getEstimatedGenerationTime(20)

      expect(time2 - time1).toBe(10) // 10 more questions = 10 more seconds
    })
  })
})
