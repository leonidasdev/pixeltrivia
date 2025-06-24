/**
 * Generates a cryptographically secure 6-character alphanumeric room code
 * using uppercase letters A-Z and digits 0-9.
 * 
 * @returns {string} A 6-character room code (e.g., "ABC123", "XYZ789")
 */
export function generateRoomCode(): string {
  // Character set: A-Z (26 chars) + 0-9 (10 chars) = 36 total characters
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const codeLength = 6
  
  // Use crypto.getRandomValues for cryptographically secure random generation
  const randomValues = new Uint8Array(codeLength)
  crypto.getRandomValues(randomValues)
  
  let roomCode = ''
  
  for (let i = 0; i < codeLength; i++) {
    // Map the random byte (0-255) to our character set (0-35)
    const randomIndex = randomValues[i] % characters.length
    roomCode += characters[randomIndex]
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
  // Check if code is exactly 6 characters and contains only A-Z and 0-9
  const roomCodePattern = /^[A-Z0-9]{6}$/
  return roomCodePattern.test(code)
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
