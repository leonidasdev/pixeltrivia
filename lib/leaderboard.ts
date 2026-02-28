/**
 * Leaderboard Utilities
 *
 * Local leaderboard system built on game history data.
 * Provides ranked entries, filtered views, and personal records.
 *
 * @module lib/leaderboard
 * @since 1.3.0
 */

import { getHistory, type GameHistoryEntry } from './storage'

// ============================================================================
// Types
// ============================================================================

/**
 * A ranked leaderboard entry
 */
export interface LeaderboardEntry {
  /** Rank position (1-based) */
  rank: number
  /** Original history entry */
  entry: GameHistoryEntry
  /** Whether this is a personal best */
  isPersonalBest: boolean
}

/**
 * Time period filter for leaderboard views
 */
export type LeaderboardPeriod = 'all' | 'week' | 'month' | 'today'

/**
 * Sort criteria for leaderboard
 */
export type LeaderboardSort = 'score' | 'accuracy' | 'streak' | 'speed'

/**
 * Filter options for leaderboard queries
 */
export interface LeaderboardFilter {
  /** Time period to include */
  period?: LeaderboardPeriod
  /** Game mode filter */
  mode?: 'quick' | 'custom' | 'advanced' | 'multiplayer'
  /** Category filter */
  category?: string
  /** Sort criteria */
  sortBy?: LeaderboardSort
  /** Maximum entries to return */
  limit?: number
}

/**
 * Complete leaderboard result
 */
export interface LeaderboardResult {
  /** Ranked entries */
  entries: LeaderboardEntry[]
  /** Total games matching the filter */
  totalGames: number
  /** Personal best entry (if any) */
  personalBest: LeaderboardEntry | null
  /** Applied filter */
  filter: Required<LeaderboardFilter>
}

/**
 * Personal records across all games
 */
export interface PersonalRecords {
  /** Highest score ever achieved */
  highestScore: GameHistoryEntry | null
  /** Best accuracy ever achieved */
  bestAccuracy: GameHistoryEntry | null
  /** Longest streak */
  longestStreak: GameHistoryEntry | null
  /** Fastest average answer time */
  fastestGame: GameHistoryEntry | null
  /** Most questions answered in one game */
  mostQuestions: GameHistoryEntry | null
}

// ============================================================================
// Constants
// ============================================================================

/** Default number of leaderboard entries */
const DEFAULT_LIMIT = 10

/** Maximum leaderboard entries */
const MAX_LIMIT = 50

// ============================================================================
// Time Period Helpers
// ============================================================================

/**
 * Get the cutoff timestamp for a given period
 */
function getPeriodCutoff(period: LeaderboardPeriod): number {
  const now = Date.now()
  switch (period) {
    case 'today': {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      return start.getTime()
    }
    case 'week':
      return now - 7 * 24 * 60 * 60 * 1000
    case 'month':
      return now - 30 * 24 * 60 * 60 * 1000
    case 'all':
      return 0
  }
}

// ============================================================================
// Sorting Helpers
// ============================================================================

/**
 * Get sort comparator for given criteria
 */
function getSortComparator(
  sortBy: LeaderboardSort
): (a: GameHistoryEntry, b: GameHistoryEntry) => number {
  switch (sortBy) {
    case 'score':
      return (a, b) => b.score - a.score
    case 'accuracy':
      return (a, b) => b.accuracy - a.accuracy || b.score - a.score
    case 'streak':
      return (a, b) => (b.streak || 0) - (a.streak || 0) || b.score - a.score
    case 'speed':
      // Lower duration is better; normalize by question count
      return (a, b) => {
        const aSpeed = a.totalQuestions > 0 ? a.duration / a.totalQuestions : Infinity
        const bSpeed = b.totalQuestions > 0 ? b.duration / b.totalQuestions : Infinity
        return aSpeed - bSpeed
      }
  }
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get a ranked leaderboard with optional filtering.
 *
 * @param filter - Optional filter/sort options
 * @returns Ranked leaderboard result
 */
export function getLeaderboard(filter: LeaderboardFilter = {}): LeaderboardResult {
  const appliedFilter: Required<LeaderboardFilter> = {
    period: filter.period ?? 'all',
    mode: filter.mode as Required<LeaderboardFilter>['mode'],
    category: filter.category ?? '',
    sortBy: filter.sortBy ?? 'score',
    limit: Math.min(filter.limit ?? DEFAULT_LIMIT, MAX_LIMIT),
  }

  let history = getHistory()

  // Filter by time period
  if (appliedFilter.period !== 'all') {
    const cutoff = getPeriodCutoff(appliedFilter.period)
    history = history.filter(e => new Date(e.playedAt).getTime() >= cutoff)
  }

  // Filter by mode
  if (appliedFilter.mode) {
    history = history.filter(e => e.mode === appliedFilter.mode)
  }

  // Filter by category
  if (appliedFilter.category) {
    history = history.filter(e => e.category === appliedFilter.category)
  }

  const totalGames = history.length

  // Sort
  const comparator = getSortComparator(appliedFilter.sortBy)
  const sorted = [...history].sort(comparator)

  // Find personal best (rank 1)
  const bestEntry = sorted[0] ?? null

  // Apply limit
  const limited = sorted.slice(0, appliedFilter.limit)

  // Build ranked entries
  const entries: LeaderboardEntry[] = limited.map((entry, index) => ({
    rank: index + 1,
    entry,
    isPersonalBest: entry === bestEntry,
  }))

  const personalBest = entries[0] ?? null

  return { entries, totalGames, personalBest, filter: appliedFilter }
}

/**
 * Get personal records across all time.
 *
 * @returns Personal bests in each category
 */
export function getPersonalRecords(): PersonalRecords {
  const history = getHistory()

  if (history.length === 0) {
    return {
      highestScore: null,
      bestAccuracy: null,
      longestStreak: null,
      fastestGame: null,
      mostQuestions: null,
    }
  }

  const highestScore = [...history].sort((a, b) => b.score - a.score)[0]
  const bestAccuracy = [...history].sort((a, b) => b.accuracy - a.accuracy || b.score - a.score)[0]
  const longestStreak = [...history].sort((a, b) => (b.streak || 0) - (a.streak || 0))[0]

  // Fastest = lowest average duration per question (only games with > 0 questions)
  const withQuestions = history.filter(e => e.totalQuestions > 0)
  const fastestGame =
    withQuestions.length > 0
      ? [...withQuestions].sort(
          (a, b) => a.duration / a.totalQuestions - b.duration / b.totalQuestions
        )[0]
      : null

  const mostQuestions = [...history].sort((a, b) => b.totalQuestions - a.totalQuestions)[0]

  return { highestScore, bestAccuracy, longestStreak, fastestGame, mostQuestions }
}

/**
 * Get a list of unique categories from history, sorted by frequency.
 */
export function getLeaderboardCategories(): string[] {
  const history = getHistory()
  const counts: Record<string, number> = {}
  for (const e of history) {
    counts[e.category] = (counts[e.category] || 0) + 1
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat)
}
