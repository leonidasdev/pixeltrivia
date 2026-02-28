/**
 * Room Code Utilities
 *
 * Generates and validates cryptographically secure room codes.
 *
 * @module lib/roomCode
 * @since 1.0.0
 */

import { ROOM_CODE_CHARACTERS, ROOM_CODE_LENGTH, ROOM_CODE_PATTERN } from '@/constants/game'

/**
 * Generates a cryptographically secure 6-character alphanumeric room code
 * using uppercase letters A-Z and digits 0-9.
 *
 * @returns {string} A 6-character room code (e.g., "ABC123", "XYZ789")
 */
export function generateRoomCode(): string {
  const randomValues = new Uint8Array(ROOM_CODE_LENGTH)
  crypto.getRandomValues(randomValues)

  let roomCode = ''

  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    const randomIndex = randomValues[i] % ROOM_CODE_CHARACTERS.length
    roomCode += ROOM_CODE_CHARACTERS[randomIndex]
  }

  return roomCode
}

/**
 * Validates if a room code follows the correct format
 *
 * @param {string} code - The room code to validate
 * @returns {boolean} True if the code is valid (6 chars, A-Z and 0-9 only)
 */
export function isValidRoomCode(code: string): boolean {
  return ROOM_CODE_PATTERN.test(code)
}

/**
 * Formats a room code with a separator for better readability
 *
 * @param {string} code - The 6-character room code
 * @param {string} separator - The separator to use (default: '-')
 * @returns {string} Formatted room code (e.g., "ABC-123")
 */
export function formatRoomCode(code: string, separator: string = '-'): string {
  if (!isValidRoomCode(code)) {
    throw new Error('Invalid room code format')
  }

  // Split into two groups of 3 characters
  return `${code.slice(0, 3)}${separator}${code.slice(3, 6)}`
}
