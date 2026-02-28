/**
 * Adaptive Difficulty
 *
 * Tracks per-category question accuracy in localStorage and computes
 * a recommended difficulty level based on recent performance.
 *
 * The algorithm uses a sliding window of the last N games per category
 * and maps average accuracy to a difficulty tier:
 *
 * | Accuracy      | Recommended Difficulty |
 * |---------------|------------------------|
 * | ≥ 90 %        | college                |
 * | ≥ 75 %        | high-school            |
 * | ≥ 55 %        | middle-school          |
 * | < 55 %        | elementary             |
 *
 * No prior data → defaults to `classic` (mixed difficulty).
 *
 * @module lib/adaptiveDifficulty
 * @since 1.2.0
 */

import type { DifficultyLevel } from '@/types/game'
import { STORAGE_PREFIX } from '@/constants/game'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** localStorage key for the category performance map. */
export const ADAPTIVE_KEY = `${STORAGE_PREFIX}adaptive_difficulty`

/** Maximum performance entries kept per category. */
const MAX_ENTRIES_PER_CATEGORY = 10

/** Sliding window size used for recommendation. */
const WINDOW_SIZE = 5

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single performance data-point for one game. */
export interface PerformanceEntry {
  /** Accuracy 0-100. */
  accuracy: number
  /** ISO timestamp. */
  playedAt: string
}

/** Map of category → list of recent performance entries. */
export type CategoryPerformanceMap = Record<string, PerformanceEntry[]>

/** Recommendation returned by the adaptive engine. */
export interface DifficultyRecommendation {
  /** Recommended difficulty level. */
  level: DifficultyLevel
  /** Display label for the level. */
  label: string
  /** Average accuracy used for the recommendation (0-100). */
  averageAccuracy: number
  /** Number of games in the window. */
  gamesPlayed: number
  /** Human-readable reasoning. */
  reason: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadMap(): CategoryPerformanceMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(ADAPTIVE_KEY)
    return raw ? (JSON.parse(raw) as CategoryPerformanceMap) : {}
  } catch {
    return {}
  }
}

function saveMap(map: CategoryPerformanceMap): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ADAPTIVE_KEY, JSON.stringify(map))
  } catch {
    // Storage full — silently ignore
  }
}

function mapAccuracyToLevel(accuracy: number): { level: DifficultyLevel; label: string } {
  if (accuracy >= 90) return { level: 'college', label: 'College Level' }
  if (accuracy >= 75) return { level: 'high-school', label: 'High School' }
  if (accuracy >= 55) return { level: 'middle-school', label: 'Middle School' }
  return { level: 'elementary', label: 'Elementary' }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Record a game result for a given category.
 *
 * @param category - The category name (case-insensitive, stored lowercase).
 * @param accuracy - Accuracy percentage (0-100).
 */
export function recordCategoryPerformance(category: string, accuracy: number): void {
  const key = category.toLowerCase().trim()
  if (!key) return

  const map = loadMap()
  const existing = map[key] ?? []

  existing.push({ accuracy, playedAt: new Date().toISOString() })

  // Keep only the most recent entries
  if (existing.length > MAX_ENTRIES_PER_CATEGORY) {
    existing.splice(0, existing.length - MAX_ENTRIES_PER_CATEGORY)
  }

  map[key] = existing
  saveMap(map)
}

/**
 * Get the recommended difficulty for a category based on past performance.
 *
 * @param category - Category name (case-insensitive).
 * @returns Recommendation with difficulty level and reasoning.
 */
export function getRecommendedDifficulty(category: string): DifficultyRecommendation {
  const key = category.toLowerCase().trim()
  const map = loadMap()
  const entries = map[key]

  // No data — default to classic
  if (!entries || entries.length === 0) {
    return {
      level: 'classic',
      label: 'Classic',
      averageAccuracy: 0,
      gamesPlayed: 0,
      reason: 'No previous games in this category — starting with mixed difficulty.',
    }
  }

  // Use the most-recent window
  const window = entries.slice(-WINDOW_SIZE)
  const avg = Math.round(window.reduce((sum, e) => sum + e.accuracy, 0) / window.length)
  const { level, label } = mapAccuracyToLevel(avg)

  const reason =
    window.length >= WINDOW_SIZE
      ? `Based on your last ${WINDOW_SIZE} games (${avg}% avg accuracy).`
      : `Based on ${window.length} game${window.length === 1 ? '' : 's'} (${avg}% avg accuracy).`

  return { level, label, averageAccuracy: avg, gamesPlayed: window.length, reason }
}

/**
 * Get performance summaries for all tracked categories.
 *
 * @returns Array of category names with their average accuracy and recommended level.
 */
export function getAllCategoryPerformance(): Array<{
  category: string
  averageAccuracy: number
  gamesPlayed: number
  recommendation: DifficultyLevel
}> {
  const map = loadMap()

  return Object.entries(map).map(([category, entries]) => {
    const window = entries.slice(-WINDOW_SIZE)
    const avg = Math.round(window.reduce((sum, e) => sum + e.accuracy, 0) / window.length)
    const { level } = mapAccuracyToLevel(avg)

    return {
      category,
      averageAccuracy: avg,
      gamesPlayed: entries.length,
      recommendation: level,
    }
  })
}

/**
 * Clear performance data for a specific category (or all categories).
 *
 * @param category - Category to clear. Omit to clear everything.
 */
export function clearCategoryPerformance(category?: string): void {
  if (!category) {
    if (typeof window !== 'undefined') localStorage.removeItem(ADAPTIVE_KEY)
    return
  }

  const key = category.toLowerCase().trim()
  const map = loadMap()
  delete map[key]
  saveMap(map)
}
