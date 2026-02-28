/**
 * Unit tests for lib/achievements.ts
 * Tests achievement evaluation, summaries, tier display, and new-unlock detection
 */

import {
  getAchievements,
  getUnlockedAchievements,
  getAchievementSummary,
  checkNewAchievements,
  getTierDisplay,
  TOTAL_ACHIEVEMENTS,
} from '@/lib/achievements'
import type { GameHistoryEntry, DetailedStats } from '@/lib/storage'

// Mock storage module
const mockGetHistory = jest.fn(() => [] as GameHistoryEntry[])
const mockGetDetailedStats = jest.fn(() => ({
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
  recentTrend: 'new' as const,
  gamesThisWeek: 0,
  currentWinStreak: 0,
}))
jest.mock('@/lib/storage', () => ({
  getHistory: (...args: unknown[]) => mockGetHistory(...args),
  getDetailedStats: (...args: unknown[]) => mockGetDetailedStats(...args),
}))

// Mock constants
jest.mock('@/constants/game', () => ({
  STORAGE_KEYS: { ROOT: 'pixeltrivia_test' },
}))

// Mock localStorage
const mockStorage: Record<string, string> = {}
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value
      },
      removeItem: (key: string) => {
        delete mockStorage[key]
      },
    },
    writable: true,
  })
})

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

function makeStats(overrides: Partial<DetailedStats> = {}): DetailedStats {
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
    recentTrend: 'new' as const,
    gamesThisWeek: 0,
    currentWinStreak: 0,
    ...overrides,
  }
}

describe('achievements', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear stored timestamps
    Object.keys(mockStorage).forEach(key => delete mockStorage[key])
  })

  // â”€â”€â”€ TOTAL_ACHIEVEMENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it('should export correct total number of achievements', () => {
    expect(TOTAL_ACHIEVEMENTS).toBe(20)
  })

  // â”€â”€â”€ getAchievements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('getAchievements', () => {
    it('should return all achievements', () => {
      mockGetHistory.mockReturnValue([])
      mockGetDetailedStats.mockReturnValue(makeStats())
      const achievements = getAchievements()
      expect(achievements).toHaveLength(20)
    })

    it('should return achievements with correct shape', () => {
      mockGetHistory.mockReturnValue([])
      mockGetDetailedStats.mockReturnValue(makeStats())
      const [first] = getAchievements()
      expect(first).toHaveProperty('id')
      expect(first).toHaveProperty('name')
      expect(first).toHaveProperty('description')
      expect(first).toHaveProperty('icon')
      expect(first).toHaveProperty('tier')
      expect(first).toHaveProperty('unlocked')
      expect(first).toHaveProperty('progress')
      expect(first).toHaveProperty('unlockedAt')
      expect(first).toHaveProperty('category')
    })

    it('should unlock first_game when history has entries', () => {
      mockGetHistory.mockReturnValue([makeEntry()])
      mockGetDetailedStats.mockReturnValue(makeStats({ totalGames: 1 }))
      const achievements = getAchievements()
      const firstGame = achievements.find(a => a.id === 'first_game')
      expect(firstGame?.unlocked).toBe(true)
      expect(firstGame?.progress).toBe(1)
    })

    it('should track progress for ten_games', () => {
      mockGetHistory.mockReturnValue(Array.from({ length: 3 }, () => makeEntry()))
      mockGetDetailedStats.mockReturnValue(makeStats({ totalGames: 3 }))
      const achievements = getAchievements()
      const tenGames = achievements.find(a => a.id === 'ten_games')
      expect(tenGames?.unlocked).toBe(false)
      expect(tenGames?.progress).toBeCloseTo(0.3)
    })

    it('should unlock perfect_score at 100% accuracy', () => {
      mockGetHistory.mockReturnValue([makeEntry({ accuracy: 100 })])
      mockGetDetailedStats.mockReturnValue(makeStats({ totalGames: 1 }))
      const achievements = getAchievements()
      const perfect = achievements.find(a => a.id === 'perfect_score')
      expect(perfect?.unlocked).toBe(true)
    })

    it('should unlock high_scorer at 1000+ points', () => {
      mockGetHistory.mockReturnValue([makeEntry({ score: 1500 })])
      mockGetDetailedStats.mockReturnValue(makeStats({ totalGames: 1 }))
      const achievements = getAchievements()
      const highScorer = achievements.find(a => a.id === 'high_scorer')
      expect(highScorer?.unlocked).toBe(true)
    })

    it('should unlock streak_five at streak >= 5', () => {
      mockGetHistory.mockReturnValue([makeEntry({ streak: 7 })])
      mockGetDetailedStats.mockReturnValue(makeStats())
      const achievements = getAchievements()
      const streak5 = achievements.find(a => a.id === 'streak_five')
      expect(streak5?.unlocked).toBe(true)
    })

    it('should unlock speed_demon for fast answers', () => {
      mockGetHistory.mockReturnValue([makeEntry({ duration: 40, totalQuestions: 10 })]) // 4s/q
      mockGetDetailedStats.mockReturnValue(makeStats())
      const achievements = getAchievements()
      const speed = achievements.find(a => a.id === 'speed_demon')
      expect(speed?.unlocked).toBe(true)
    })

    it('should unlock all_modes when all 3 modes played', () => {
      mockGetHistory.mockReturnValue([
        makeEntry({ mode: 'quick' }),
        makeEntry({ mode: 'custom' }),
        makeEntry({ mode: 'advanced' }),
      ])
      mockGetDetailedStats.mockReturnValue(makeStats())
      const achievements = getAchievements()
      const allModes = achievements.find(a => a.id === 'all_modes')
      expect(allModes?.unlocked).toBe(true)
    })

    it('should unlock total_score_10k from stats', () => {
      mockGetHistory.mockReturnValue([makeEntry()])
      mockGetDetailedStats.mockReturnValue(makeStats({ totalScore: 15000 }))
      const achievements = getAchievements()
      const scoreCollector = achievements.find(a => a.id === 'total_score_10k')
      expect(scoreCollector?.unlocked).toBe(true)
    })

    it('should unlock win_streak_three from stats', () => {
      mockGetHistory.mockReturnValue([makeEntry()])
      mockGetDetailedStats.mockReturnValue(makeStats({ currentWinStreak: 5 }))
      const achievements = getAchievements()
      const hatTrick = achievements.find(a => a.id === 'win_streak_three')
      expect(hatTrick?.unlocked).toBe(true)
    })

    it('should unlock improving achievement from stats trend', () => {
      mockGetHistory.mockReturnValue([makeEntry()])
      mockGetDetailedStats.mockReturnValue(makeStats({ recentTrend: 'improving' }))
      const achievements = getAchievements()
      const improving = achievements.find(a => a.id === 'improving')
      expect(improving?.unlocked).toBe(true)
    })

    it('should save unlock timestamps to localStorage', () => {
      mockGetHistory.mockReturnValue([makeEntry()])
      mockGetDetailedStats.mockReturnValue(makeStats())
      getAchievements()
      const stored = mockStorage['pixeltrivia_test_achievements']
      expect(stored).toBeDefined()
      const parsed = JSON.parse(stored)
      expect(parsed).toHaveProperty('first_game')
    })
  })

  // â”€â”€â”€ getUnlockedAchievements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('getUnlockedAchievements', () => {
    it('should return only unlocked achievements', () => {
      mockGetHistory.mockReturnValue([makeEntry()])
      mockGetDetailedStats.mockReturnValue(makeStats())
      const unlocked = getUnlockedAchievements()
      expect(unlocked.every(a => a.unlocked)).toBe(true)
      expect(unlocked.length).toBeGreaterThan(0)
      expect(unlocked.length).toBeLessThan(20)
    })

    it('should return empty array when none unlocked', () => {
      mockGetHistory.mockReturnValue([])
      mockGetDetailedStats.mockReturnValue(makeStats())
      const unlocked = getUnlockedAchievements()
      expect(unlocked).toHaveLength(0)
    })
  })

  // â”€â”€â”€ getAchievementSummary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('getAchievementSummary', () => {
    it('should return correct totals', () => {
      mockGetHistory.mockReturnValue([])
      mockGetDetailedStats.mockReturnValue(makeStats())
      const summary = getAchievementSummary()
      expect(summary.total).toBe(20)
      expect(summary.unlocked).toBe(0)
      expect(summary.percentage).toBe(0)
    })

    it('should compute percentage correctly', () => {
      // first_game only unlocks 1 achievement
      mockGetHistory.mockReturnValue([makeEntry()])
      mockGetDetailedStats.mockReturnValue(makeStats())
      const summary = getAchievementSummary()
      expect(summary.unlocked).toBeGreaterThan(0)
      expect(summary.percentage).toBe(Math.round((summary.unlocked / 20) * 100))
    })

    it('should have all tiers in byTier', () => {
      mockGetHistory.mockReturnValue([])
      mockGetDetailedStats.mockReturnValue(makeStats())
      const summary = getAchievementSummary()
      expect(summary.byTier).toHaveProperty('bronze')
      expect(summary.byTier).toHaveProperty('silver')
      expect(summary.byTier).toHaveProperty('gold')
      expect(summary.byTier).toHaveProperty('platinum')
    })

    it('should have all categories in byCategory', () => {
      mockGetHistory.mockReturnValue([])
      mockGetDetailedStats.mockReturnValue(makeStats())
      const summary = getAchievementSummary()
      expect(summary.byCategory).toHaveProperty('gameplay')
      expect(summary.byCategory).toHaveProperty('mastery')
      expect(summary.byCategory).toHaveProperty('dedication')
      expect(summary.byCategory).toHaveProperty('special')
    })

    it('should match tier totals to total achievements', () => {
      mockGetHistory.mockReturnValue([])
      mockGetDetailedStats.mockReturnValue(makeStats())
      const summary = getAchievementSummary()
      const tierTotal = Object.values(summary.byTier).reduce((s, t) => s + t.total, 0)
      expect(tierTotal).toBe(20)
    })
  })

  // â”€â”€â”€ checkNewAchievements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('checkNewAchievements', () => {
    it('should detect new unlocks', () => {
      mockGetHistory.mockReturnValue([makeEntry()])
      mockGetDetailedStats.mockReturnValue(makeStats())
      const newlyUnlocked = checkNewAchievements(new Set())
      expect(newlyUnlocked.length).toBeGreaterThan(0)
      expect(newlyUnlocked.every(a => a.unlocked)).toBe(true)
    })

    it('should not return previously unlocked', () => {
      mockGetHistory.mockReturnValue([makeEntry()])
      mockGetDetailedStats.mockReturnValue(makeStats())
      const previouslyUnlocked = new Set(['first_game'])
      const newlyUnlocked = checkNewAchievements(previouslyUnlocked)
      expect(newlyUnlocked.find(a => a.id === 'first_game')).toBeUndefined()
    })

    it('should return empty if all already unlocked', () => {
      mockGetHistory.mockReturnValue([makeEntry()])
      mockGetDetailedStats.mockReturnValue(makeStats())
      // Get all currently unlocked IDs
      const all = getAchievements()
        .filter(a => a.unlocked)
        .map(a => a.id)
      const newlyUnlocked = checkNewAchievements(new Set(all))
      expect(newlyUnlocked).toHaveLength(0)
    })
  })

  // â”€â”€â”€ getTierDisplay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('getTierDisplay', () => {
    it('should return correct display for bronze', () => {
      const display = getTierDisplay('bronze')
      expect(display.label).toBe('Bronze')
      expect(display.color).toContain('amber')
    })

    it('should return correct display for silver', () => {
      const display = getTierDisplay('silver')
      expect(display.label).toBe('Silver')
      expect(display.color).toContain('gray')
    })

    it('should return correct display for gold', () => {
      const display = getTierDisplay('gold')
      expect(display.label).toBe('Gold')
      expect(display.color).toContain('yellow')
    })

    it('should return correct display for platinum', () => {
      const display = getTierDisplay('platinum')
      expect(display.label).toBe('Platinum')
      expect(display.color).toContain('cyan')
    })

    it('should include bgColor and borderColor for all tiers', () => {
      for (const tier of ['bronze', 'silver', 'gold', 'platinum'] as const) {
        const display = getTierDisplay(tier)
        expect(display.bgColor).toBeTruthy()
        expect(display.borderColor).toBeTruthy()
      }
    })
  })
})
