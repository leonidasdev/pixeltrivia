/**
 * useGameHistory Hook Tests
 *
 * Tests for the useGameHistory React hook that manages game history state.
 *
 * @module __tests__/hooks/useGameHistory.test
 * @since 1.0.0
 */

import { renderHook, act } from '@testing-library/react'
import { useGameHistory } from '@/hooks/useGameHistory'
import { addHistoryEntry, type GameHistoryEntry } from '@/lib/storage'

// ============================================================================
// Helpers
// ============================================================================

function createEntry(
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
    streak: 2,
    playerName: 'Tester',
    ...overrides,
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('useGameHistory', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty state when no history exists', () => {
    const { result } = renderHook(() => useGameHistory())

    expect(result.current.history).toEqual([])
    expect(result.current.stats.totalGames).toBe(0)
    expect(result.current.bestScores).toEqual([])
    expect(result.current.recentGames).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('loads existing history from storage', () => {
    addHistoryEntry(createEntry({ score: 800 }))
    addHistoryEntry(createEntry({ score: 600 }))

    const { result } = renderHook(() => useGameHistory())

    expect(result.current.history).toHaveLength(2)
    expect(result.current.stats.totalGames).toBe(2)
    expect(result.current.stats.totalScore).toBe(1400)
  })

  it('addGame adds an entry and updates state', () => {
    const { result } = renderHook(() => useGameHistory())

    act(() => {
      result.current.addGame(createEntry({ score: 1000 }))
    })

    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].score).toBe(1000)
    expect(result.current.stats.totalGames).toBe(1)
    expect(result.current.stats.totalScore).toBe(1000)
  })

  it('removeGame deletes an entry', () => {
    addHistoryEntry(createEntry({ score: 400 }))
    addHistoryEntry(createEntry({ score: 800 }))

    const { result } = renderHook(() => useGameHistory())
    const idToRemove = result.current.history[0].id

    act(() => {
      result.current.removeGame(idToRemove)
    })

    expect(result.current.history).toHaveLength(1)
  })

  it('clearAll clears all history', () => {
    addHistoryEntry(createEntry())
    addHistoryEntry(createEntry())
    addHistoryEntry(createEntry())

    const { result } = renderHook(() => useGameHistory())
    expect(result.current.history).toHaveLength(3)

    act(() => {
      result.current.clearAll()
    })

    expect(result.current.history).toEqual([])
    expect(result.current.stats.totalGames).toBe(0)
  })

  it('refresh reloads data from storage', () => {
    const { result } = renderHook(() => useGameHistory())
    expect(result.current.history).toHaveLength(0)

    // Add directly to storage (bypassing hook)
    addHistoryEntry(createEntry({ score: 999 }))

    act(() => {
      result.current.refresh()
    })

    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].score).toBe(999)
  })

  it('bestScores returns entries sorted by score', () => {
    addHistoryEntry(createEntry({ score: 100 }))
    addHistoryEntry(createEntry({ score: 900 }))
    addHistoryEntry(createEntry({ score: 500 }))

    const { result } = renderHook(() => useGameHistory())

    expect(result.current.bestScores[0].score).toBe(900)
    expect(result.current.bestScores[1].score).toBe(500)
    expect(result.current.bestScores[2].score).toBe(100)
  })

  it('stats updates after addGame', () => {
    const { result } = renderHook(() => useGameHistory())

    act(() => {
      result.current.addGame(
        createEntry({ mode: 'custom', category: 'Math', accuracy: 90, streak: 5 })
      )
    })

    expect(result.current.stats.favoriteMode).toBe('custom')
    expect(result.current.stats.favoriteCategory).toBe('Math')
    expect(result.current.stats.bestStreak).toBe(5)
  })
})
