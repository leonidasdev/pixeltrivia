/**
 * Storage History & Stats Tests
 *
 * Tests for game history, detailed stats, best scores, and data management.
 *
 * @module __tests__/unit/lib/storageHistory.test
 * @since 1.0.0
 */

import {
  getHistory,
  addHistoryEntry,
  clearHistory,
  deleteHistoryEntry,
  getHistoryStats,
  getDetailedStats,
  getBestScores,
  getRecentGames,
  type GameHistoryEntry,
} from '@/lib/storage'

// ============================================================================
// Test Helpers
// ============================================================================

function createMockEntry(
  overrides: Partial<Omit<GameHistoryEntry, 'id' | 'playedAt'>> = {}
): Omit<GameHistoryEntry, 'id' | 'playedAt'> {
  return {
    mode: 'quick',
    category: 'Science',
    difficulty: 'medium',
    score: 500,
    correctAnswers: 5,
    totalQuestions: 10,
    accuracy: 50,
    duration: 60,
    streak: 3,
    playerName: 'TestPlayer',
    ...overrides,
  }
}

function seedHistory(
  count: number,
  overrides: Partial<Omit<GameHistoryEntry, 'id' | 'playedAt'>>[] = []
) {
  clearHistory()
  for (let i = 0; i < count; i++) {
    addHistoryEntry(
      createMockEntry({
        score: 100 * (i + 1),
        accuracy: 10 * (i + 1),
        ...(overrides[i] || {}),
      })
    )
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('Storage History Functions', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // --------------------------------------------------------------------------
  // Basic CRUD
  // --------------------------------------------------------------------------

  describe('getHistory', () => {
    it('returns empty array when no history exists', () => {
      expect(getHistory()).toEqual([])
    })

    it('returns history entries after adding', () => {
      addHistoryEntry(createMockEntry())
      const history = getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].mode).toBe('quick')
      expect(history[0].category).toBe('Science')
    })
  })

  describe('addHistoryEntry', () => {
    it('adds entry with auto-generated id and playedAt', () => {
      const success = addHistoryEntry(createMockEntry())
      expect(success).toBe(true)

      const history = getHistory()
      expect(history[0].id).toMatch(/^game-/)
      expect(history[0].playedAt).toBeTruthy()
      expect(new Date(history[0].playedAt).getTime()).not.toBeNaN()
    })

    it('adds entries in reverse chronological order', () => {
      addHistoryEntry(createMockEntry({ score: 100 }))
      addHistoryEntry(createMockEntry({ score: 200 }))

      const history = getHistory()
      expect(history[0].score).toBe(200) // Most recent first
      expect(history[1].score).toBe(100)
    })

    it('limits to MAX_HISTORY_ENTRIES (100)', () => {
      for (let i = 0; i < 110; i++) {
        addHistoryEntry(createMockEntry({ score: i }))
      }

      const history = getHistory()
      expect(history).toHaveLength(100)
    })

    it('preserves new fields: streak and playerName', () => {
      addHistoryEntry(createMockEntry({ streak: 7, playerName: 'BigBrain' }))
      const entry = getHistory()[0]
      expect(entry.streak).toBe(7)
      expect(entry.playerName).toBe('BigBrain')
    })
  })

  describe('deleteHistoryEntry', () => {
    it('deletes a specific entry by id', () => {
      addHistoryEntry(createMockEntry({ score: 100 }))
      addHistoryEntry(createMockEntry({ score: 200 }))

      const history = getHistory()
      const idToDelete = history[0].id

      const success = deleteHistoryEntry(idToDelete)
      expect(success).toBe(true)
      expect(getHistory()).toHaveLength(1)
      expect(getHistory()[0].score).toBe(100)
    })

    it('returns false for non-existent id', () => {
      addHistoryEntry(createMockEntry())
      const success = deleteHistoryEntry('nonexistent-id')
      expect(success).toBe(false)
      expect(getHistory()).toHaveLength(1)
    })
  })

  describe('clearHistory', () => {
    it('removes all history entries', () => {
      seedHistory(5)
      expect(getHistory()).toHaveLength(5)

      const success = clearHistory()
      expect(success).toBe(true)
      expect(getHistory()).toEqual([])
    })
  })

  // --------------------------------------------------------------------------
  // Basic Stats
  // --------------------------------------------------------------------------

  describe('getHistoryStats', () => {
    it('returns zeros for empty history', () => {
      const stats = getHistoryStats()
      expect(stats.totalGames).toBe(0)
      expect(stats.totalScore).toBe(0)
      expect(stats.averageAccuracy).toBe(0)
      expect(stats.favoriteMode).toBeNull()
      expect(stats.favoriteCategory).toBeNull()
    })

    it('calculates correct totals', () => {
      addHistoryEntry(createMockEntry({ score: 100, accuracy: 80 }))
      addHistoryEntry(createMockEntry({ score: 200, accuracy: 60 }))

      const stats = getHistoryStats()
      expect(stats.totalGames).toBe(2)
      expect(stats.totalScore).toBe(300)
      expect(stats.averageAccuracy).toBe(70)
    })

    it('identifies favorite mode and category', () => {
      addHistoryEntry(createMockEntry({ mode: 'quick', category: 'Science' }))
      addHistoryEntry(createMockEntry({ mode: 'quick', category: 'Science' }))
      addHistoryEntry(createMockEntry({ mode: 'custom', category: 'History' }))

      const stats = getHistoryStats()
      expect(stats.favoriteMode).toBe('quick')
      expect(stats.favoriteCategory).toBe('Science')
    })
  })

  // --------------------------------------------------------------------------
  // Detailed Stats
  // --------------------------------------------------------------------------

  describe('getDetailedStats', () => {
    it('returns default values for empty history', () => {
      const stats = getDetailedStats()
      expect(stats.totalGames).toBe(0)
      expect(stats.averageScore).toBe(0)
      expect(stats.bestScore).toBe(0)
      expect(stats.bestStreak).toBe(0)
      expect(stats.recentTrend).toBe('new')
      expect(stats.modeBreakdown).toEqual({})
      expect(stats.categoryBreakdown).toEqual({})
    })

    it('calculates correct overall stats', () => {
      addHistoryEntry(
        createMockEntry({
          score: 800,
          accuracy: 80,
          streak: 5,
          correctAnswers: 8,
          totalQuestions: 10,
          duration: 120,
        })
      )
      addHistoryEntry(
        createMockEntry({
          score: 600,
          accuracy: 60,
          streak: 3,
          correctAnswers: 6,
          totalQuestions: 10,
          duration: 90,
        })
      )

      const stats = getDetailedStats()
      expect(stats.totalGames).toBe(2)
      expect(stats.totalScore).toBe(1400)
      expect(stats.averageScore).toBe(700)
      expect(stats.averageAccuracy).toBe(70)
      expect(stats.bestScore).toBe(800)
      expect(stats.bestAccuracy).toBe(80)
      expect(stats.bestStreak).toBe(5)
      expect(stats.totalCorrect).toBe(14)
      expect(stats.totalQuestions).toBe(20)
      expect(stats.totalTimePlayed).toBe(210)
    })

    it('builds mode breakdown', () => {
      addHistoryEntry(createMockEntry({ mode: 'quick', score: 500, accuracy: 70 }))
      addHistoryEntry(createMockEntry({ mode: 'quick', score: 800, accuracy: 90 }))
      addHistoryEntry(createMockEntry({ mode: 'custom', score: 300, accuracy: 50 }))

      const stats = getDetailedStats()
      expect(stats.modeBreakdown.quick.gamesPlayed).toBe(2)
      expect(stats.modeBreakdown.quick.bestScore).toBe(800)
      expect(stats.modeBreakdown.custom.gamesPlayed).toBe(1)
    })

    it('builds category breakdown', () => {
      addHistoryEntry(createMockEntry({ category: 'Science', score: 700 }))
      addHistoryEntry(createMockEntry({ category: 'Science', score: 900 }))
      addHistoryEntry(createMockEntry({ category: 'History', score: 400 }))

      const stats = getDetailedStats()
      expect(stats.categoryBreakdown.Science.gamesPlayed).toBe(2)
      expect(stats.categoryBreakdown.Science.bestScore).toBe(900)
      expect(stats.categoryBreakdown.History.gamesPlayed).toBe(1)
    })

    it('detects improving trend', () => {
      // Add 10 entries: older ones with low accuracy, recent with high
      clearHistory()
      for (let i = 0; i < 5; i++) {
        addHistoryEntry(createMockEntry({ accuracy: 40 })) // These become older (pushed down)
      }
      for (let i = 0; i < 5; i++) {
        addHistoryEntry(createMockEntry({ accuracy: 90 })) // These are most recent
      }

      const stats = getDetailedStats()
      expect(stats.recentTrend).toBe('improving')
    })

    it('detects declining trend', () => {
      clearHistory()
      for (let i = 0; i < 5; i++) {
        addHistoryEntry(createMockEntry({ accuracy: 90 })) // These become older
      }
      for (let i = 0; i < 5; i++) {
        addHistoryEntry(createMockEntry({ accuracy: 40 })) // These are most recent
      }

      const stats = getDetailedStats()
      expect(stats.recentTrend).toBe('declining')
    })

    it('detects stable trend', () => {
      clearHistory()
      for (let i = 0; i < 10; i++) {
        addHistoryEntry(createMockEntry({ accuracy: 70 }))
      }

      const stats = getDetailedStats()
      expect(stats.recentTrend).toBe('stable')
    })

    it('counts games this week', () => {
      addHistoryEntry(createMockEntry()) // This one is "just now"

      const stats = getDetailedStats()
      expect(stats.gamesThisWeek).toBeGreaterThanOrEqual(1)
    })

    it('calculates current win streak', () => {
      clearHistory()
      addHistoryEntry(createMockEntry({ accuracy: 50 })) // This is pushed to position 3
      addHistoryEntry(createMockEntry({ accuracy: 80 })) // Position 2
      addHistoryEntry(createMockEntry({ accuracy: 75 })) // Position 1 (most recent)

      const stats = getDetailedStats()
      // Most recent 2 are >=70%, then one at 50%, so streak = 2
      expect(stats.currentWinStreak).toBe(2)
    })

    it('identifies favorite mode and category correctly', () => {
      clearHistory()
      addHistoryEntry(createMockEntry({ mode: 'advanced', category: 'Math' }))
      addHistoryEntry(createMockEntry({ mode: 'quick', category: 'Math' }))
      addHistoryEntry(createMockEntry({ mode: 'quick', category: 'Science' }))

      const stats = getDetailedStats()
      expect(stats.favoriteMode).toBe('quick')
      expect(stats.favoriteCategory).toBe('Math')
    })
  })

  // --------------------------------------------------------------------------
  // Best Scores & Recent Games
  // --------------------------------------------------------------------------

  describe('getBestScores', () => {
    it('returns top scores sorted by score descending', () => {
      seedHistory(5)
      const best = getBestScores(3)
      expect(best).toHaveLength(3)
      expect(best[0].score).toBe(500) // 100*5
      expect(best[1].score).toBe(400) // 100*4
      expect(best[2].score).toBe(300) // 100*3
    })

    it('returns all entries if fewer than requested', () => {
      addHistoryEntry(createMockEntry({ score: 100 }))
      const best = getBestScores(5)
      expect(best).toHaveLength(1)
    })

    it('returns empty array for empty history', () => {
      expect(getBestScores()).toEqual([])
    })
  })

  describe('getRecentGames', () => {
    it('returns most recent entries', () => {
      seedHistory(15)
      const recent = getRecentGames(5)
      expect(recent).toHaveLength(5)
    })

    it('defaults to 10 entries', () => {
      seedHistory(15)
      const recent = getRecentGames()
      expect(recent).toHaveLength(10)
    })

    it('returns empty array for empty history', () => {
      expect(getRecentGames()).toEqual([])
    })
  })
})
