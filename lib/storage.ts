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

import { STORAGE_KEYS, STORAGE_VERSION } from '@/constants/game'
import { generateId } from './utils'
import { recordCategoryPerformance } from './adaptiveDifficulty'

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
 * Game history entry persisted to localStorage.
 *
 * @see {@link import('@/types/game').GameSession} for the runtime session type
 * @see {@link import('@/types/game').GameSummary} for the computed summary type
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
  streak: number
  playerName: string
  playedAt: string
}

/**
 * Detailed stats breakdown
 */
export interface DetailedStats {
  totalGames: number
  totalScore: number
  averageScore: number
  averageAccuracy: number
  bestScore: number
  bestAccuracy: number
  bestStreak: number
  totalCorrect: number
  totalQuestions: number
  totalTimePlayed: number
  favoriteMode: string | null
  favoriteCategory: string | null
  modeBreakdown: Record<string, ModeStats>
  categoryBreakdown: Record<string, CategoryStats>
  recentTrend: 'improving' | 'declining' | 'stable' | 'new'
  gamesThisWeek: number
  currentWinStreak: number
}

/**
 * Per-mode statistics
 */
export interface ModeStats {
  gamesPlayed: number
  totalScore: number
  averageScore: number
  averageAccuracy: number
  bestScore: number
}

/**
 * Per-category statistics
 */
export interface CategoryStats {
  gamesPlayed: number
  totalScore: number
  averageAccuracy: number
  bestScore: number
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

// Re-export STORAGE_KEYS for consumers that import from lib/storage
export { STORAGE_KEYS }

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
    id: generateId('game'),
    playedAt: new Date().toISOString(),
  }

  // Add to beginning and limit size
  const updated = [newEntry, ...history].slice(0, MAX_HISTORY_ENTRIES)

  // Feed adaptive difficulty engine
  if (entry.category) {
    recordCategoryPerformance(entry.category, entry.accuracy)
  }

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

/**
 * Get detailed statistics with breakdowns by mode, category, and trends
 */
export function getDetailedStats(): DetailedStats {
  const history = getHistory()

  if (history.length === 0) {
    return {
      totalGames: 0,
      totalScore: 0,
      averageScore: 0,
      averageAccuracy: 0,
      bestScore: 0,
      bestAccuracy: 0,
      bestStreak: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      totalTimePlayed: 0,
      favoriteMode: null,
      favoriteCategory: null,
      modeBreakdown: {},
      categoryBreakdown: {},
      recentTrend: 'new',
      gamesThisWeek: 0,
      currentWinStreak: 0,
    }
  }

  const totalGames = history.length
  const totalScore = history.reduce((sum, e) => sum + e.score, 0)
  const averageScore = Math.round(totalScore / totalGames)
  const averageAccuracy = Math.round(history.reduce((sum, e) => sum + e.accuracy, 0) / totalGames)
  const bestScore = Math.max(...history.map(e => e.score))
  const bestAccuracy = Math.max(...history.map(e => e.accuracy))
  const bestStreak = Math.max(...history.map(e => e.streak || 0))
  const totalCorrect = history.reduce((sum, e) => sum + e.correctAnswers, 0)
  const totalQuestions = history.reduce((sum, e) => sum + e.totalQuestions, 0)
  const totalTimePlayed = history.reduce((sum, e) => sum + e.duration, 0)

  // Mode breakdown
  const modeBreakdown: Record<string, ModeStats> = {}
  for (const entry of history) {
    if (!modeBreakdown[entry.mode]) {
      modeBreakdown[entry.mode] = {
        gamesPlayed: 0,
        totalScore: 0,
        averageScore: 0,
        averageAccuracy: 0,
        bestScore: 0,
      }
    }
    const ms = modeBreakdown[entry.mode]
    ms.gamesPlayed++
    ms.totalScore += entry.score
    ms.bestScore = Math.max(ms.bestScore, entry.score)
    ms.averageAccuracy =
      (ms.averageAccuracy * (ms.gamesPlayed - 1) + entry.accuracy) / ms.gamesPlayed
    ms.averageScore = Math.round(ms.totalScore / ms.gamesPlayed)
  }

  // Category breakdown
  const categoryBreakdown: Record<string, CategoryStats> = {}
  for (const entry of history) {
    if (!categoryBreakdown[entry.category]) {
      categoryBreakdown[entry.category] = {
        gamesPlayed: 0,
        totalScore: 0,
        averageAccuracy: 0,
        bestScore: 0,
      }
    }
    const cs = categoryBreakdown[entry.category]
    cs.gamesPlayed++
    cs.totalScore += entry.score
    cs.bestScore = Math.max(cs.bestScore, entry.score)
    cs.averageAccuracy =
      (cs.averageAccuracy * (cs.gamesPlayed - 1) + entry.accuracy) / cs.gamesPlayed
  }

  // Favorite mode & category
  const favoriteMode =
    Object.entries(modeBreakdown).sort((a, b) => b[1].gamesPlayed - a[1].gamesPlayed)[0]?.[0] ??
    null
  const favoriteCategory =
    Object.entries(categoryBreakdown).sort((a, b) => b[1].gamesPlayed - a[1].gamesPlayed)[0]?.[0] ??
    null

  // Recent trend (compare last 5 vs previous 5)
  let recentTrend: DetailedStats['recentTrend'] = 'new'
  if (history.length >= 10) {
    const recent5 = history.slice(0, 5)
    const prev5 = history.slice(5, 10)
    const recentAvg = recent5.reduce((s, e) => s + e.accuracy, 0) / 5
    const prevAvg = prev5.reduce((s, e) => s + e.accuracy, 0) / 5
    const diff = recentAvg - prevAvg
    if (diff > 5) recentTrend = 'improving'
    else if (diff < -5) recentTrend = 'declining'
    else recentTrend = 'stable'
  } else if (history.length >= 3) {
    recentTrend = 'stable'
  }

  // Games this week
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const gamesThisWeek = history.filter(e => new Date(e.playedAt).getTime() > oneWeekAgo).length

  // Current win streak (games with >= 70% accuracy in a row from most recent)
  let currentWinStreak = 0
  for (const entry of history) {
    if (entry.accuracy >= 70) {
      currentWinStreak++
    } else {
      break
    }
  }

  return {
    totalGames,
    totalScore,
    averageScore,
    averageAccuracy,
    bestScore,
    bestAccuracy,
    bestStreak,
    totalCorrect,
    totalQuestions,
    totalTimePlayed,
    favoriteMode,
    favoriteCategory,
    modeBreakdown,
    categoryBreakdown,
    recentTrend,
    gamesThisWeek,
    currentWinStreak,
  }
}

/**
 * Get top N best scores
 */
export function getBestScores(count: number = 5): GameHistoryEntry[] {
  const history = getHistory()
  return [...history].sort((a, b) => b.score - a.score).slice(0, count)
}

/**
 * Get recent games (last N entries)
 */
export function getRecentGames(count: number = 10): GameHistoryEntry[] {
  return getHistory().slice(0, count)
}

/**
 * Delete a single history entry
 */
export function deleteHistoryEntry(id: string): boolean {
  const history = getHistory()
  const filtered = history.filter(entry => entry.id !== id)
  if (filtered.length === history.length) return false
  return setItem(STORAGE_KEYS.HISTORY, filtered)
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
