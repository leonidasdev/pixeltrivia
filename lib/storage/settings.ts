/**
 * Settings Storage
 *
 * Game settings read/write operations.
 *
 * @module lib/storage/settings
 * @since 1.0.0
 */

import { STORAGE_KEYS } from '@/constants/game'
import type { GameSettings } from './types'
import { getItem, setItem, DEFAULT_SETTINGS } from './core'

/**
 * Get game settings
 */
export function getSettings(): GameSettings {
  return getItem<GameSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
}

/**
 * Save game settings
 */
export function saveSettings(settings: Partial<GameSettings>): boolean {
  const existing = getSettings()
  const updated: GameSettings = {
    ...existing,
    ...settings,
  }
  return setItem(STORAGE_KEYS.SETTINGS, updated)
}

/**
 * Reset settings to defaults
 */
export function resetSettings(): boolean {
  return setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
}
