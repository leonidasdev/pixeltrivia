/**
 * History Storage
 *
 * Game history entry management: add, retrieve, delete, and basic stats.
 *
 * @module lib/storage/history
 * @since 1.0.0
 */

import { STORAGE_KEYS } from '@/constants/game'
import { generateId } from '@/lib/utils'
import type { GameHistoryEntry } from './types'
import { getItem, setItem } from './core'

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
