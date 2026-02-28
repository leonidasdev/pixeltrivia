/**
 * Tests for the adaptive difficulty engine.
 *
 * @module tests/lib/adaptiveDifficulty
 */

import {
  recordCategoryPerformance,
  getRecommendedDifficulty,
  getAllCategoryPerformance,
  clearCategoryPerformance,
  ADAPTIVE_KEY,
} from '@/lib/adaptiveDifficulty'

// ---------------------------------------------------------------------------
// Setup — mock localStorage
// ---------------------------------------------------------------------------

const mockStorage: Record<string, string> = {}

beforeEach(() => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k])
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(k => mockStorage[k] ?? null)
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => {
    mockStorage[k] = String(v)
  })
  jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(k => {
    delete mockStorage[k]
  })
})

afterEach(() => {
  jest.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// recordCategoryPerformance
// ---------------------------------------------------------------------------

describe('recordCategoryPerformance', () => {
  it('stores an entry for a new category', () => {
    recordCategoryPerformance('Science', 80)

    const stored = JSON.parse(mockStorage[ADAPTIVE_KEY])
    expect(stored.science).toHaveLength(1)
    expect(stored.science[0].accuracy).toBe(80)
  })

  it('appends entries for the same category', () => {
    recordCategoryPerformance('History', 70)
    recordCategoryPerformance('History', 90)

    const stored = JSON.parse(mockStorage[ADAPTIVE_KEY])
    expect(stored.history).toHaveLength(2)
  })

  it('lowercases and trims the category name', () => {
    recordCategoryPerformance('  MATH  ', 60)

    const stored = JSON.parse(mockStorage[ADAPTIVE_KEY])
    expect(stored.math).toBeDefined()
    expect(stored[' MATH ']).toBeUndefined()
  })

  it('ignores empty category', () => {
    recordCategoryPerformance('', 50)
    expect(mockStorage[ADAPTIVE_KEY]).toBeUndefined()
  })

  it('caps entries at 10 per category', () => {
    for (let i = 0; i < 15; i++) {
      recordCategoryPerformance('Art', 50 + i)
    }

    const stored = JSON.parse(mockStorage[ADAPTIVE_KEY])
    expect(stored.art).toHaveLength(10)
    // Oldest entries removed, newest kept
    expect(stored.art[0].accuracy).toBe(55)
    expect(stored.art[9].accuracy).toBe(64)
  })
})

// ---------------------------------------------------------------------------
// getRecommendedDifficulty
// ---------------------------------------------------------------------------

describe('getRecommendedDifficulty', () => {
  it('returns classic for an unknown category', () => {
    const rec = getRecommendedDifficulty('Unknown')
    expect(rec.level).toBe('classic')
    expect(rec.gamesPlayed).toBe(0)
    expect(rec.reason).toContain('No previous games')
  })

  it('recommends elementary for low accuracy', () => {
    recordCategoryPerformance('Math', 30)
    recordCategoryPerformance('Math', 40)
    recordCategoryPerformance('Math', 35)

    const rec = getRecommendedDifficulty('Math')
    expect(rec.level).toBe('elementary')
    expect(rec.label).toBe('Elementary')
    expect(rec.averageAccuracy).toBeLessThan(55)
  })

  it('recommends middle-school for moderate accuracy', () => {
    recordCategoryPerformance('Science', 60)
    recordCategoryPerformance('Science', 65)
    recordCategoryPerformance('Science', 58)

    const rec = getRecommendedDifficulty('Science')
    expect(rec.level).toBe('middle-school')
  })

  it('recommends high-school for good accuracy', () => {
    recordCategoryPerformance('History', 80)
    recordCategoryPerformance('History', 78)
    recordCategoryPerformance('History', 82)

    const rec = getRecommendedDifficulty('History')
    expect(rec.level).toBe('high-school')
  })

  it('recommends college for excellent accuracy', () => {
    recordCategoryPerformance('Geography', 95)
    recordCategoryPerformance('Geography', 92)
    recordCategoryPerformance('Geography', 100)

    const rec = getRecommendedDifficulty('Geography')
    expect(rec.level).toBe('college')
  })

  it('uses only the last 5 entries for the window', () => {
    // 3 old low-scoring games
    recordCategoryPerformance('Music', 20)
    recordCategoryPerformance('Music', 25)
    recordCategoryPerformance('Music', 30)
    // 5 recent high-scoring games
    for (let i = 0; i < 5; i++) {
      recordCategoryPerformance('Music', 95)
    }

    const rec = getRecommendedDifficulty('Music')
    // Should only see 95s (college)
    expect(rec.level).toBe('college')
    expect(rec.averageAccuracy).toBe(95)
    expect(rec.gamesPlayed).toBe(5)
  })

  it('is case-insensitive', () => {
    recordCategoryPerformance('Art', 90)
    const rec = getRecommendedDifficulty('ART')
    expect(rec.level).toBe('college')
  })
})

// ---------------------------------------------------------------------------
// getAllCategoryPerformance
// ---------------------------------------------------------------------------

describe('getAllCategoryPerformance', () => {
  it('returns empty array when no data', () => {
    expect(getAllCategoryPerformance()).toEqual([])
  })

  it('returns summaries for all tracked categories', () => {
    recordCategoryPerformance('Science', 80)
    recordCategoryPerformance('Math', 50)

    const all = getAllCategoryPerformance()
    expect(all).toHaveLength(2)
    expect(all.map(a => a.category).sort()).toEqual(['math', 'science'])
  })
})

// ---------------------------------------------------------------------------
// clearCategoryPerformance
// ---------------------------------------------------------------------------

describe('clearCategoryPerformance', () => {
  it('clears all categories when no argument', () => {
    recordCategoryPerformance('A', 80)
    recordCategoryPerformance('B', 90)

    clearCategoryPerformance()
    expect(mockStorage[ADAPTIVE_KEY]).toBeUndefined()
  })

  it('clears only the specified category', () => {
    recordCategoryPerformance('A', 80)
    recordCategoryPerformance('B', 90)

    clearCategoryPerformance('A')
    const stored = JSON.parse(mockStorage[ADAPTIVE_KEY])
    expect(stored.a).toBeUndefined()
    expect(stored.b).toBeDefined()
  })
})
