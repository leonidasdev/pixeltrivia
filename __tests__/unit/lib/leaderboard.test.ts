/**
 * Unit tests for lib/leaderboard.ts
 * Tests leaderboard ranking, filtering, sorting, and personal records
 */

import { getLeaderboard, getPersonalRecords, getLeaderboardCategories } from '@/lib/leaderboard'
import type { GameHistoryEntry } from '@/lib/storage'

// Mock storage module
const mockGetHistory = jest.fn(() => [] as GameHistoryEntry[])
jest.mock('@/lib/storage', () => ({
  getHistory: (...args: unknown[]) => mockGetHistory(...args),
}))

function makeEntry(overrides: Partial<GameHistoryEntry> = {}): GameHistoryEntry {
  return {
    id: `game_${Math.random().toString(36).slice(2)}`,
    mode: 'quick',
    category: 'Science',
    difficulty: 'easy',
    score: 500,
    correctAnswers: 5,
    totalQuestions: 10,
    accuracy: 50,
    duration: 60,
    streak: 3,
    playerName: 'Player',
    playedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('leaderboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // â”€â”€â”€ getLeaderboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('getLeaderboard', () => {
    it('should return empty result when no history', () => {
      mockGetHistory.mockReturnValue([])
      const result = getLeaderboard()
      expect(result.entries).toHaveLength(0)
      expect(result.totalGames).toBe(0)
      expect(result.personalBest).toBeNull()
    })

    it('should rank entries by score descending by default', () => {
      mockGetHistory.mockReturnValue([
        makeEntry({ score: 200 }),
        makeEntry({ score: 500 }),
        makeEntry({ score: 300 }),
      ])
      const result = getLeaderboard()
      expect(result.entries[0].entry.score).toBe(500)
      expect(result.entries[1].entry.score).toBe(300)
      expect(result.entries[2].entry.score).toBe(200)
    })

    it('should assign correct ranks', () => {
      mockGetHistory.mockReturnValue([makeEntry({ score: 100 }), makeEntry({ score: 200 })])
      const result = getLeaderboard()
      expect(result.entries[0].rank).toBe(1)
      expect(result.entries[1].rank).toBe(2)
    })

    it('should mark rank 1 as personal best', () => {
      mockGetHistory.mockReturnValue([makeEntry({ score: 100 }), makeEntry({ score: 300 })])
      const result = getLeaderboard()
      expect(result.entries[0].isPersonalBest).toBe(true)
      expect(result.entries[1].isPersonalBest).toBe(false)
    })

    it('should sort by accuracy when specified', () => {
      mockGetHistory.mockReturnValue([
        makeEntry({ accuracy: 60, score: 100 }),
        makeEntry({ accuracy: 90, score: 50 }),
        makeEntry({ accuracy: 75, score: 200 }),
      ])
      const result = getLeaderboard({ sortBy: 'accuracy' })
      expect(result.entries[0].entry.accuracy).toBe(90)
      expect(result.entries[1].entry.accuracy).toBe(75)
      expect(result.entries[2].entry.accuracy).toBe(60)
    })

    it('should sort by streak when specified', () => {
      mockGetHistory.mockReturnValue([
        makeEntry({ streak: 3 }),
        makeEntry({ streak: 10 }),
        makeEntry({ streak: 7 }),
      ])
      const result = getLeaderboard({ sortBy: 'streak' })
      expect(result.entries[0].entry.streak).toBe(10)
      expect(result.entries[1].entry.streak).toBe(7)
      expect(result.entries[2].entry.streak).toBe(3)
    })

    it('should sort by speed (lowest per-question time first)', () => {
      mockGetHistory.mockReturnValue([
        makeEntry({ duration: 100, totalQuestions: 10 }), // 10s/q
        makeEntry({ duration: 50, totalQuestions: 10 }), // 5s/q
        makeEntry({ duration: 80, totalQuestions: 10 }), // 8s/q
      ])
      const result = getLeaderboard({ sortBy: 'speed' })
      expect(result.entries[0].entry.duration).toBe(50)
      expect(result.entries[1].entry.duration).toBe(80)
      expect(result.entries[2].entry.duration).toBe(100)
    })

    it('should filter by mode', () => {
      mockGetHistory.mockReturnValue([
        makeEntry({ mode: 'quick', score: 100 }),
        makeEntry({ mode: 'custom', score: 200 }),
        makeEntry({ mode: 'quick', score: 300 }),
      ])
      const result = getLeaderboard({ mode: 'quick' })
      expect(result.totalGames).toBe(2)
      expect(result.entries).toHaveLength(2)
      expect(result.entries.every(e => e.entry.mode === 'quick')).toBe(true)
    })

    it('should filter by category', () => {
      mockGetHistory.mockReturnValue([
        makeEntry({ category: 'Science' }),
        makeEntry({ category: 'History' }),
        makeEntry({ category: 'Science' }),
      ])
      const result = getLeaderboard({ category: 'Science' })
      expect(result.totalGames).toBe(2)
      expect(result.entries.every(e => e.entry.category === 'Science')).toBe(true)
    })

    it('should filter by time period (today)', () => {
      const today = new Date().toISOString()
      const yesterday = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      mockGetHistory.mockReturnValue([
        makeEntry({ playedAt: today, score: 100 }),
        makeEntry({ playedAt: yesterday, score: 200 }),
      ])
      const result = getLeaderboard({ period: 'today' })
      expect(result.totalGames).toBe(1)
      expect(result.entries[0].entry.score).toBe(100)
    })

    it('should filter by time period (week)', () => {
      const recent = new Date().toISOString()
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      mockGetHistory.mockReturnValue([
        makeEntry({ playedAt: recent }),
        makeEntry({ playedAt: twoWeeksAgo }),
      ])
      const result = getLeaderboard({ period: 'week' })
      expect(result.totalGames).toBe(1)
    })

    it('should respect limit', () => {
      mockGetHistory.mockReturnValue(
        Array.from({ length: 20 }, (_, i) => makeEntry({ score: i * 10 }))
      )
      const result = getLeaderboard({ limit: 5 })
      expect(result.entries).toHaveLength(5)
      expect(result.totalGames).toBe(20)
    })

    it('should cap limit at MAX_LIMIT (50)', () => {
      mockGetHistory.mockReturnValue(Array.from({ length: 60 }, (_, i) => makeEntry({ score: i })))
      const result = getLeaderboard({ limit: 100 })
      expect(result.entries.length).toBeLessThanOrEqual(50)
    })

    it('should return default filter values in result', () => {
      mockGetHistory.mockReturnValue([])
      const result = getLeaderboard()
      expect(result.filter.period).toBe('all')
      expect(result.filter.sortBy).toBe('score')
      expect(result.filter.category).toBe('')
    })

    it('should combine mode and category filters', () => {
      mockGetHistory.mockReturnValue([
        makeEntry({ mode: 'quick', category: 'Science' }),
        makeEntry({ mode: 'quick', category: 'History' }),
        makeEntry({ mode: 'custom', category: 'Science' }),
      ])
      const result = getLeaderboard({ mode: 'quick', category: 'Science' })
      expect(result.totalGames).toBe(1)
    })
  })

  // â”€â”€â”€ getPersonalRecords â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('getPersonalRecords', () => {
    it('should return all nulls when no history', () => {
      mockGetHistory.mockReturnValue([])
      const records = getPersonalRecords()
      expect(records.highestScore).toBeNull()
      expect(records.bestAccuracy).toBeNull()
      expect(records.longestStreak).toBeNull()
      expect(records.fastestGame).toBeNull()
      expect(records.mostQuestions).toBeNull()
    })

    it('should find highest score', () => {
      mockGetHistory.mockReturnValue([
        makeEntry({ score: 100 }),
        makeEntry({ score: 500 }),
        makeEntry({ score: 300 }),
      ])
      const records = getPersonalRecords()
      expect(records.highestScore?.score).toBe(500)
    })

    it('should find best accuracy', () => {
      mockGetHistory.mockReturnValue([
        makeEntry({ accuracy: 70 }),
        makeEntry({ accuracy: 95 }),
        makeEntry({ accuracy: 80 }),
      ])
      const records = getPersonalRecords()
      expect(records.bestAccuracy?.accuracy).toBe(95)
    })

    it('should find longest streak', () => {
      mockGetHistory.mockReturnValue([
        makeEntry({ streak: 3 }),
        makeEntry({ streak: 12 }),
        makeEntry({ streak: 7 }),
      ])
      const records = getPersonalRecords()
      expect(records.longestStreak?.streak).toBe(12)
    })

    it('should find fastest game by per-question time', () => {
      mockGetHistory.mockReturnValue([
        makeEntry({ duration: 100, totalQuestions: 10 }), // 10s/q
        makeEntry({ duration: 30, totalQuestions: 10 }), // 3s/q â† fastest
        makeEntry({ duration: 50, totalQuestions: 10 }), // 5s/q
      ])
      const records = getPersonalRecords()
      expect(records.fastestGame?.duration).toBe(30)
    })

    it('should find most questions answered', () => {
      mockGetHistory.mockReturnValue([
        makeEntry({ totalQuestions: 10 }),
        makeEntry({ totalQuestions: 25 }),
        makeEntry({ totalQuestions: 15 }),
      ])
      const records = getPersonalRecords()
      expect(records.mostQuestions?.totalQuestions).toBe(25)
    })

    it('should handle zero-question entries for fastest game', () => {
      mockGetHistory.mockReturnValue([
        makeEntry({ duration: 30, totalQuestions: 0 }),
        makeEntry({ duration: 50, totalQuestions: 5 }),
      ])
      const records = getPersonalRecords()
      expect(records.fastestGame?.totalQuestions).toBe(5)
    })
  })

  // â”€â”€â”€ getLeaderboardCategories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('getLeaderboardCategories', () => {
    it('should return empty array when no history', () => {
      mockGetHistory.mockReturnValue([])
      expect(getLeaderboardCategories()).toEqual([])
    })

    it('should return unique categories sorted by frequency', () => {
      mockGetHistory.mockReturnValue([
        makeEntry({ category: 'Science' }),
        makeEntry({ category: 'History' }),
        makeEntry({ category: 'Science' }),
        makeEntry({ category: 'Science' }),
        makeEntry({ category: 'History' }),
        makeEntry({ category: 'Art' }),
      ])
      const categories = getLeaderboardCategories()
      expect(categories).toEqual(['Science', 'History', 'Art'])
    })

    it('should return all unique categories', () => {
      mockGetHistory.mockReturnValue([
        makeEntry({ category: 'A' }),
        makeEntry({ category: 'B' }),
        makeEntry({ category: 'C' }),
      ])
      expect(getLeaderboardCategories()).toHaveLength(3)
    })
  })
})
