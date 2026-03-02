/**
 * Session Storage
 *
 * Current game session ID persistence.
 *
 * @module lib/storage/session
 * @since 1.0.0
 */

import { STORAGE_KEYS } from '@/constants/game'
import { getItem, setItem, removeItem } from './core'

/**
 * Get current session ID
 */
export function getCurrentSession(): string | null {
  return getItem<string | null>(STORAGE_KEYS.SESSION, null)
}

/**
 * Save current session ID
 */
export function saveCurrentSession(sessionId: string): boolean {
  return setItem(STORAGE_KEYS.SESSION, sessionId)
}

/**
 * Clear current session
 */
export function clearCurrentSession(): boolean {
  return removeItem(STORAGE_KEYS.SESSION)
}
