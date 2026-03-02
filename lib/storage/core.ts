/**
 * Storage Core Utilities
 *
 * Low-level localStorage access with type safety and availability checks.
 * Default values and constants for the storage layer.
 *
 * @module lib/storage/core
 * @since 1.0.0
 */

import { STORAGE_KEYS, STORAGE_VERSION } from '@/constants/game'
import type { PlayerProfile, GameSettings, StorageSchema } from './types'

// Re-export STORAGE_KEYS for consumers that import from lib/storage
export { STORAGE_KEYS }

// ============================================================================
// Default Values
// ============================================================================

/**
 * Create a default player profile with fresh timestamps.
 *
 * Returns a new object each call so `createdAt` / `lastPlayedAt`
 * reflect the actual creation time, not module-load time.
 */
export function createDefaultProfile(): PlayerProfile {
  const now = new Date().toISOString()
  return {
    name: 'Player',
    avatarId: 'robot',
    createdAt: now,
    lastPlayedAt: now,
  }
}

/**
 * Default game settings
 */
export const DEFAULT_SETTINGS: GameSettings = {
  volume: 50,
  soundEnabled: true,
  musicEnabled: true,
  showTimer: true,
  difficulty: 'classic',
  theme: 'dark',
}

/**
 * Default storage state (exported for testing and reference)
 */
export const DEFAULT_STORAGE: StorageSchema = {
  version: STORAGE_VERSION,
  profile: null,
  settings: DEFAULT_SETTINGS,
  history: [],
  currentSession: null,
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const testKey = '__storage_test__'
    window.localStorage.setItem(testKey, testKey)
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Get item from localStorage with type safety
 */
export function getItem<T>(key: string, defaultValue: T): T {
  if (!isStorageAvailable()) return defaultValue

  try {
    const item = window.localStorage.getItem(key)
    if (item === null) return defaultValue
    return JSON.parse(item) as T
  } catch {
    return defaultValue
  }
}

/**
 * Set item in localStorage
 */
export function setItem<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) return false

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    // Storage full or unavailable
    return false
  }
}

/**
 * Remove item from localStorage
 */
export function removeItem(key: string): boolean {
  if (!isStorageAvailable()) return false

  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}
