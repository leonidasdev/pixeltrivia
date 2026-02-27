/**
 * Game History Hook
 *
 * React hook for managing game history and statistics.
 * Wraps localStorage storage functions with React state management.
 *
 * @module hooks/useGameHistory
 * @since 1.0.0
 */

import { useState, useCallback, useEffect } from 'react'
import {
  getHistory,
  addHistoryEntry,
  clearHistory,
  deleteHistoryEntry,
  getDetailedStats,
  getBestScores,
  getRecentGames,
  type GameHistoryEntry,
  type DetailedStats,
} from '@/lib/storage'

// ============================================================================
// Types
// ============================================================================

export interface UseGameHistoryReturn {
  /** Full history array */
  history: GameHistoryEntry[]
  /** Detailed statistics */
  stats: DetailedStats
  /** Top best scores */
  bestScores: GameHistoryEntry[]
  /** Recent game entries */
  recentGames: GameHistoryEntry[]
  /** Whether history is loading */
  isLoading: boolean
  /** Add a new game to history */
  addGame: (entry: Omit<GameHistoryEntry, 'id' | 'playedAt'>) => boolean
  /** Remove a single entry from history */
  removeGame: (id: string) => boolean
  /** Clear all history */
  clearAll: () => boolean
  /** Refresh history data from storage */
  refresh: () => void
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for accessing and managing game history & stats
 *
 * @example
 * ```tsx
 * const { history, stats, addGame, clearAll } = useGameHistory()
 *
 * // Add a completed game
 * addGame({
 *   mode: 'quick',
 *   category: 'Science',
 *   difficulty: 'medium',
 *   score: 850,
 *   correctAnswers: 8,
 *   totalQuestions: 10,
 *   accuracy: 80,
 *   duration: 120,
 *   streak: 5,
 *   playerName: 'Player1',
 * })
 * ```
 */
export function useGameHistory(): UseGameHistoryReturn {
  const [history, setHistory] = useState<GameHistoryEntry[]>([])
  const [stats, setStats] = useState<DetailedStats>(() => getDetailedStats())
  const [bestScores, setBestScores] = useState<GameHistoryEntry[]>([])
  const [recentGames, setRecentGames] = useState<GameHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Load all history data from storage
   */
  const loadData = useCallback(() => {
    setHistory(getHistory())
    setStats(getDetailedStats())
    setBestScores(getBestScores(5))
    setRecentGames(getRecentGames(10))
    setIsLoading(false)
  }, [])

  // Load on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  /**
   * Add a new game entry
   */
  const addGame = useCallback(
    (entry: Omit<GameHistoryEntry, 'id' | 'playedAt'>): boolean => {
      const success = addHistoryEntry(entry)
      if (success) {
        loadData()
      }
      return success
    },
    [loadData]
  )

  /**
   * Remove a game entry by ID
   */
  const removeGame = useCallback(
    (id: string): boolean => {
      const success = deleteHistoryEntry(id)
      if (success) {
        loadData()
      }
      return success
    },
    [loadData]
  )

  /**
   * Clear all history
   */
  const clearAll = useCallback((): boolean => {
    const success = clearHistory()
    if (success) {
      loadData()
    }
    return success
  }, [loadData])

  /**
   * Refresh data from storage
   */
  const refresh = useCallback(() => {
    loadData()
  }, [loadData])

  return {
    history,
    stats,
    bestScores,
    recentGames,
    isLoading,
    addGame,
    removeGame,
    clearAll,
    refresh,
  }
}
