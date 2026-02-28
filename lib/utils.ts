/**
 * Shared Utility Functions
 *
 * General-purpose helpers used across the application.
 * Keeps utility logic in one place to avoid duplication.
 *
 * @module lib/utils
 * @since 1.2.0
 */

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate a unique identifier with an optional prefix.
 *
 * Format: `{prefix}-{timestamp}-{random}` or `{timestamp}-{random}`
 *
 * @param prefix - Optional prefix (e.g. "game", "quick", "session")
 * @returns A unique string identifier
 */
export function generateId(prefix?: string): string {
  const random = Math.random().toString(36).substring(2, 11)
  const timestamp = Date.now()
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Format a duration in seconds into a human-readable string.
 *
 * @param seconds - Duration in whole seconds
 * @returns Formatted string (e.g. "45s", "2m 30s", "1h 15m")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  }
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}
