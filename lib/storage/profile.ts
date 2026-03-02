/**
 * Profile Storage
 *
 * Player profile read/write operations.
 *
 * @module lib/storage/profile
 * @since 1.0.0
 */

import { STORAGE_KEYS } from '@/constants/game'
import type { PlayerProfile } from './types'
import { getItem, setItem, removeItem, createDefaultProfile } from './core'

/**
 * Get player profile
 */
export function getProfile(): PlayerProfile | null {
  return getItem<PlayerProfile | null>(STORAGE_KEYS.PROFILE, null)
}

/**
 * Save player profile
 */
export function saveProfile(profile: Partial<PlayerProfile>): boolean {
  const existing = getProfile() || createDefaultProfile()
  const updated: PlayerProfile = {
    ...existing,
    ...profile,
    lastPlayedAt: new Date().toISOString(),
  }
  return setItem(STORAGE_KEYS.PROFILE, updated)
}

/**
 * Check if profile exists
 */
export function hasProfile(): boolean {
  return getProfile() !== null
}

/**
 * Clear player profile
 */
export function clearProfile(): boolean {
  return removeItem(STORAGE_KEYS.PROFILE)
}
