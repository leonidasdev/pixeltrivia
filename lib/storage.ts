/**
 * Storage Utilities
 *
 * Typed localStorage access with versioning and migration support.
 *
 * @module lib/storage
 * @since 1.0.0
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Storage schema version - increment when storage structure changes
 */
const STORAGE_VERSION = 1

/**
 * Prefix for all storage keys
 */
const STORAGE_PREFIX = 'pixeltrivia'

/**
 * Player profile stored in localStorage
 */
export interface PlayerProfile {
  name: string
  avatarId: string
  createdAt: string
  lastPlayedAt: string
}

/**
 * Game settings stored in localStorage
 */
export interface GameSettings {
  volume: number
  soundEnabled: boolean
  musicEnabled: boolean
  showTimer: boolean
  difficulty: string
  theme: 'dark' | 'light' | 'system'
}

/**
 * Game history entry
 */
export interface GameHistoryEntry {
  id: string
  mode: 'quick' | 'custom' | 'advanced' | 'multiplayer'
  category: string
  difficulty: string
  score: number
  correctAnswers: number
  totalQuestions: number
  accuracy: number
  duration: number
  playedAt: string
}

/**
 * Complete storage schema
 */
export interface StorageSchema {
  version: number
  profile: PlayerProfile | null
  settings: GameSettings
  history: GameHistoryEntry[]
  currentSession: string | null
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default player profile
 */
export const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Player',
  avatarId: 'knight',
  createdAt: new Date().toISOString(),
  lastPlayedAt: new Date().toISOString(),
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
// Storage Keys
// ============================================================================

/**
 * All storage keys used by the application
 */
export const STORAGE_KEYS = {
  ROOT: `${STORAGE_PREFIX}_v${STORAGE_VERSION}`,
  PROFILE: `${STORAGE_PREFIX}_profile`,
  SETTINGS: `${STORAGE_PREFIX}_settings`,
  HISTORY: `${STORAGE_PREFIX}_history`,
  SESSION: `${STORAGE_PREFIX}_session`,
} as const

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
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
function getItem<T>(key: string, defaultValue: T): T {
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
function setItem<T>(key: string, value: T): boolean {
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
function removeItem(key: string): boolean {
  if (!isStorageAvailable()) return false

  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

// ============================================================================
// Profile Functions
// ============================================================================

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
  const existing = getProfile() || DEFAULT_PROFILE
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

// ============================================================================
// Settings Functions
// ============================================================================

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

// ============================================================================
// History Functions
// ============================================================================

/**
 * Maximum history entries to keep
 */
const MAX_HISTORY_ENTRIES = 100

/**
 * Get game history
 */
export function getHistory(): GameHistoryEntry[] {
  return getItem<GameHistoryEntry[]>(STORAGE_KEYS.HISTORY, [])
}

/**
 * Add entry to game history
 */
export function addHistoryEntry(entry: Omit<GameHistoryEntry, 'id' | 'playedAt'>): boolean {
  const history = getHistory()

  const newEntry: GameHistoryEntry = {
    ...entry,
    id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    playedAt: new Date().toISOString(),
  }

  // Add to beginning and limit size
  const updated = [newEntry, ...history].slice(0, MAX_HISTORY_ENTRIES)

  return setItem(STORAGE_KEYS.HISTORY, updated)
}

/**
 * Clear game history
 */
export function clearHistory(): boolean {
  return setItem(STORAGE_KEYS.HISTORY, [])
}

/**
 * Get history statistics
 */
export function getHistoryStats(): {
  totalGames: number
  totalScore: number
  averageAccuracy: number
  favoriteMode: string | null
  favoriteCategory: string | null
} {
  const history = getHistory()

  if (history.length === 0) {
    return {
      totalGames: 0,
      totalScore: 0,
      averageAccuracy: 0,
      favoriteMode: null,
      favoriteCategory: null,
    }
  }

  const totalGames = history.length
  const totalScore = history.reduce((sum, entry) => sum + entry.score, 0)
  const averageAccuracy = history.reduce((sum, entry) => sum + entry.accuracy, 0) / totalGames

  // Find most played mode
  const modeCounts = history.reduce(
    (acc, entry) => {
      acc[entry.mode] = (acc[entry.mode] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  const favoriteMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  // Find most played category
  const categoryCounts = history.reduce(
    (acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  const favoriteCategory =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return {
    totalGames,
    totalScore,
    averageAccuracy,
    favoriteMode,
    favoriteCategory,
  }
}

// ============================================================================
// Session Functions
// ============================================================================

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

// ============================================================================
// Migration & Cleanup
// ============================================================================

/**
 * Migrate storage from old versions
 */
export function migrateStorage(): void {
  if (!isStorageAvailable()) return

  // Check for old storage keys and migrate
  const oldKeys = ['pixeltrivia_player', 'pixeltrivia_game_settings']

  for (const oldKey of oldKeys) {
    const oldData = window.localStorage.getItem(oldKey)
    if (oldData) {
      try {
        const parsed = JSON.parse(oldData)
        // Migrate based on key type
        if (oldKey.includes('player')) {
          saveProfile(parsed)
        } else if (oldKey.includes('settings')) {
          saveSettings(parsed)
        }
        window.localStorage.removeItem(oldKey)
      } catch {
        // Remove corrupted old data
        window.localStorage.removeItem(oldKey)
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

// ============================================================================
// Initialize
// ============================================================================

/**
 * Initialize storage (run migrations if needed)
 */
export function initializeStorage(): void {
  migrateStorage()
}
