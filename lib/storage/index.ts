/**
 * Storage Utilities
 *
 * Typed localStorage access with versioning and migration support.
 * Split into focused modules for maintainability.
 *
 * @module lib/storage
 * @since 1.0.0
 */

// Types
export type {
  PlayerProfile,
  GameSettings,
  GameHistoryEntry,
  DetailedStats,
  ModeStats,
  CategoryStats,
  StorageSchema,
} from './types'

// Core (defaults & helpers)
export { STORAGE_KEYS, createDefaultProfile, DEFAULT_SETTINGS, DEFAULT_STORAGE } from './core'

// Profile
export { getProfile, saveProfile, hasProfile, clearProfile } from './profile'

// Settings
export { getSettings, saveSettings, resetSettings } from './settings'

// History
export {
  getHistory,
  addHistoryEntry,
  clearHistory,
  getHistoryStats,
  getBestScores,
  getRecentGames,
  deleteHistoryEntry,
} from './history'

// Stats
export { getDetailedStats } from './stats'

// Session
export { getCurrentSession, saveCurrentSession, clearCurrentSession } from './session'

// Migration & cleanup
export { migrateStorage, clearAllStorage, getStorageInfo, initializeStorage } from './migration'
