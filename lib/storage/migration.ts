/**
 * Storage Migration and Cleanup
 *
 * Handles migration from previous storage versions and provides
 * cleanup utilities.
 *
 * @module lib/storage/migration
 * @since 1.0.0
 */

import { STORAGE_KEYS } from '@/constants/game'
import { isStorageAvailable } from './core'
import { saveProfile } from './profile'
import { saveSettings } from './settings'

/**
 * Migrate storage from previous versions
 */
export function migrateStorage(): void {
  if (!isStorageAvailable()) return

  // Check for previous storage keys and migrate
  const previousKeys = ['pixeltrivia_player', 'pixeltrivia_game_settings']

  for (const key of previousKeys) {
    const data = window.localStorage.getItem(key)
    if (data) {
      try {
        const parsed = JSON.parse(data)
        if (key.includes('player')) {
          saveProfile(parsed)
        } else if (key.includes('settings')) {
          saveSettings(parsed)
        }
        window.localStorage.removeItem(key)
      } catch {
        // Remove corrupted data
        window.localStorage.removeItem(key)
      }
    }
  }
}

/**
 * Clear all PixelTrivia storage
 */
export function clearAllStorage(): void {
  if (!isStorageAvailable()) return

  Object.values(STORAGE_KEYS).forEach(key => {
    window.localStorage.removeItem(key)
  })
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): {
  used: number
  available: boolean
  keys: string[]
} {
  if (!isStorageAvailable()) {
    return { used: 0, available: false, keys: [] }
  }

  let used = 0
  const keys: string[] = []

  for (const key of Object.values(STORAGE_KEYS)) {
    const item = window.localStorage.getItem(key)
    if (item) {
      used += item.length * 2 // UTF-16 characters = 2 bytes each
      keys.push(key)
    }
  }

  return { used, available: true, keys }
}

/**
 * Initialize storage (run migrations if needed)
 */
export function initializeStorage(): void {
  migrateStorage()
}
