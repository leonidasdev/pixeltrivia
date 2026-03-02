/**
 * Storage Type Definitions
 *
 * Interfaces for all data persisted to localStorage.
 *
 * @module lib/storage/types
 * @since 1.0.0
 */

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
