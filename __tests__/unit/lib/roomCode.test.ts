/**
 * Unit tests for lib/roomCode.ts
 * Tests room code generation, validation, and formatting
 */

import { generateRoomCode, isValidRoomCode, formatRoomCode } from '@/lib/roomCode'

describe('roomCode', () => {
  describe('generateRoomCode', () => {
    it('should generate a 6-character code', () => {
      const code = generateRoomCode()
      expect(code).toHaveLength(6)
    })

    it('should only contain uppercase letters and digits', () => {
      const code = generateRoomCode()
      expect(code).toMatch(/^[A-Z0-9]{6}$/)
    })

    it('should generate unique codes on multiple calls', () => {
      const codes = new Set<string>()
      // Generate 100 codes and check for uniqueness
      for (let i = 0; i < 100; i++) {
        codes.add(generateRoomCode())
      }
      // With 36^6 possible combinations, 100 codes should almost always be unique
      expect(codes.size).toBeGreaterThan(95)
    })

    it('should generate different codes each time', () => {
      const code1 = generateRoomCode()
      const code2 = generateRoomCode()
      const code3 = generateRoomCode()

      // At least 2 should be different (statistically almost certain)
      const uniqueCodes = new Set([code1, code2, code3])
      expect(uniqueCodes.size).toBeGreaterThan(1)
    })
  })

  describe('isValidRoomCode', () => {
    it('should return true for valid 6-character alphanumeric codes', () => {
      expect(isValidRoomCode('ABC123')).toBe(true)
      expect(isValidRoomCode('XYZ789')).toBe(true)
      expect(isValidRoomCode('000000')).toBe(true)
      expect(isValidRoomCode('AAAAAA')).toBe(true)
      expect(isValidRoomCode('A1B2C3')).toBe(true)
    })

    it('should return false for codes with wrong length', () => {
      expect(isValidRoomCode('ABC12')).toBe(false) // Too short
      expect(isValidRoomCode('ABC1234')).toBe(false) // Too long
      expect(isValidRoomCode('')).toBe(false) // Empty
      expect(isValidRoomCode('A')).toBe(false) // Single char
    })

    it('should return false for codes with lowercase letters', () => {
      expect(isValidRoomCode('abc123')).toBe(false)
      expect(isValidRoomCode('Abc123')).toBe(false)
      expect(isValidRoomCode('ABCabc')).toBe(false)
    })

    it('should return false for codes with special characters', () => {
      expect(isValidRoomCode('ABC-12')).toBe(false)
      expect(isValidRoomCode('ABC_12')).toBe(false)
      expect(isValidRoomCode('ABC 12')).toBe(false)
      expect(isValidRoomCode('ABC!23')).toBe(false)
    })

    it('should validate generated codes', () => {
      // Every generated code should be valid
      for (let i = 0; i < 50; i++) {
        const code = generateRoomCode()
        expect(isValidRoomCode(code)).toBe(true)
      }
    })
  })

  describe('formatRoomCode', () => {
    it('should format code with default separator', () => {
      expect(formatRoomCode('ABC123')).toBe('ABC-123')
      expect(formatRoomCode('XYZ789')).toBe('XYZ-789')
    })

    it('should format code with custom separator', () => {
      expect(formatRoomCode('ABC123', ' ')).toBe('ABC 123')
      expect(formatRoomCode('ABC123', '.')).toBe('ABC.123')
      expect(formatRoomCode('ABC123', '')).toBe('ABC123')
    })

    it('should throw error for invalid room code', () => {
      expect(() => formatRoomCode('abc123')).toThrow('Invalid room code format')
      expect(() => formatRoomCode('ABC12')).toThrow('Invalid room code format')
      expect(() => formatRoomCode('')).toThrow('Invalid room code format')
    })

    it('should format generated codes correctly', () => {
      const code = generateRoomCode()
      const formatted = formatRoomCode(code)

      // Should have format XXX-XXX
      expect(formatted).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/)
    })
  })
})
