/**
 * Stats Components Tests
 *
 * Tests for StatsOverview, GameHistoryList, and StatsChart components.
 *
 * @module __tests__/components/stats.test
 * @since 1.0.0
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { StatsOverview } from '@/app/components/stats/StatsOverview'
import { GameHistoryList } from '@/app/components/stats/GameHistoryList'
import { ModeChart, CategoryChart, StatsCharts } from '@/app/components/stats/StatsChart'
import type { DetailedStats, GameHistoryEntry, ModeStats, CategoryStats } from '@/lib/storage'

// ============================================================================
// Test Data
// ============================================================================

const emptyStats: DetailedStats = {
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
  recentTrend: 'new',
  gamesThisWeek: 0,
  currentWinStreak: 0,
}

const sampleStats: DetailedStats = {
  totalGames: 25,
  totalScore: 15000,
  averageScore: 600,
  averageAccuracy: 72,
  bestScore: 1200,
  bestAccuracy: 100,
  bestStreak: 8,
  totalCorrect: 180,
  totalQuestions: 250,
  totalTimePlayed: 3600,
  favoriteMode: 'quick',
  favoriteCategory: 'Science',
  modeBreakdown: {
    quick: {
      gamesPlayed: 15,
      totalScore: 9000,
      averageScore: 600,
      averageAccuracy: 75,
      bestScore: 1200,
    },
    custom: {
      gamesPlayed: 10,
      totalScore: 6000,
      averageScore: 600,
      averageAccuracy: 68,
      bestScore: 1000,
    },
  },
  categoryBreakdown: {
    Science: { gamesPlayed: 10, totalScore: 6000, averageAccuracy: 78, bestScore: 1200 },
    History: { gamesPlayed: 8, totalScore: 4000, averageAccuracy: 65, bestScore: 900 },
    Math: { gamesPlayed: 7, totalScore: 5000, averageAccuracy: 70, bestScore: 1100 },
  },
  recentTrend: 'improving',
  gamesThisWeek: 5,
  currentWinStreak: 3,
}

function createHistoryEntry(overrides: Partial<GameHistoryEntry> = {}): GameHistoryEntry {
  return {
    id: `game-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
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
    playedAt: new Date().toISOString(),
    ...overrides,
  }
}

// ============================================================================
// StatsOverview Tests
// ============================================================================

describe('StatsOverview', () => {
  it('shows empty state when no games played', () => {
    render(<StatsOverview stats={emptyStats} />)
    expect(screen.getByText('NO GAMES YET')).toBeInTheDocument()
    expect(screen.getByText(/Play your first game/)).toBeInTheDocument()
  })

  it('displays total games played', () => {
    render(<StatsOverview stats={sampleStats} />)
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  it('displays average accuracy', () => {
    render(<StatsOverview stats={sampleStats} />)
    expect(screen.getByText('72%')).toBeInTheDocument()
  })

  it('displays best score', () => {
    render(<StatsOverview stats={sampleStats} />)
    expect(screen.getByText('1,200')).toBeInTheDocument()
  })

  it('displays best streak', () => {
    render(<StatsOverview stats={sampleStats} />)
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('displays total score', () => {
    render(<StatsOverview stats={sampleStats} />)
    expect(screen.getByText('15,000')).toBeInTheDocument()
  })

  it('displays trend indicator', () => {
    render(<StatsOverview stats={sampleStats} />)
    expect(screen.getByText('IMPROVING')).toBeInTheDocument()
  })

  it('displays favorite mode', () => {
    render(<StatsOverview stats={sampleStats} />)
    expect(screen.getByText('⚡ Quick')).toBeInTheDocument()
  })

  it('displays favorite category', () => {
    render(<StatsOverview stats={sampleStats} />)
    expect(screen.getByText('Science')).toBeInTheDocument()
  })

  it('displays win streak', () => {
    render(<StatsOverview stats={sampleStats} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})

// ============================================================================
// GameHistoryList Tests
// ============================================================================

describe('GameHistoryList', () => {
  it('shows empty state when no history', () => {
    render(<GameHistoryList history={[]} />)
    expect(screen.getByText('NO HISTORY')).toBeInTheDocument()
    expect(screen.getByText(/Completed games will appear here/)).toBeInTheDocument()
  })

  it('renders history entries', () => {
    const entries = [
      createHistoryEntry({ category: 'Science', score: 800 }),
      createHistoryEntry({ category: 'Math', score: 500 }),
    ]
    render(<GameHistoryList history={entries} />)
    expect(screen.getByText('Science')).toBeInTheDocument()
    expect(screen.getByText('Math')).toBeInTheDocument()
    expect(screen.getByText('800')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('shows entry count', () => {
    const entries = [createHistoryEntry(), createHistoryEntry(), createHistoryEntry()]
    render(<GameHistoryList history={entries} />)
    expect(screen.getByText('Showing 3 of 3 games')).toBeInTheDocument()
  })

  it('expands entry details on click', () => {
    const entries = [createHistoryEntry({ correctAnswers: 7, totalQuestions: 10 })]
    render(<GameHistoryList history={entries} />)

    // Click to expand
    const button = screen.getByRole('button', { name: /Game details/i })
    fireEvent.click(button)

    expect(screen.getByText('7/10')).toBeInTheDocument()
  })

  it('calls onDelete when delete button clicked', () => {
    const onDelete = jest.fn()
    const entries = [createHistoryEntry({ id: 'test-id-1' })]
    render(<GameHistoryList history={entries} onDelete={onDelete} />)

    // Expand first
    const detailButton = screen.getByRole('button', { name: /Game details/i })
    fireEvent.click(detailButton)

    // Click delete
    const deleteButton = screen.getByLabelText('Delete this game entry')
    fireEvent.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith('test-id-1')
  })

  it('shows clear confirmation dialog', () => {
    const onClearAll = jest.fn()
    const entries = [createHistoryEntry()]
    render(<GameHistoryList history={entries} onClearAll={onClearAll} />)

    const clearButton = screen.getByLabelText('Clear all history')
    fireEvent.click(clearButton)

    expect(screen.getByText('DELETE ALL HISTORY?')).toBeInTheDocument()
  })

  it('calls onClearAll when confirmed', () => {
    const onClearAll = jest.fn()
    const entries = [createHistoryEntry()]
    render(<GameHistoryList history={entries} onClearAll={onClearAll} />)

    // Open dialog
    fireEvent.click(screen.getByLabelText('Clear all history'))
    // Confirm
    fireEvent.click(screen.getByText('YES, DELETE ALL'))

    expect(onClearAll).toHaveBeenCalled()
  })

  it('filters by mode', () => {
    const entries = [
      createHistoryEntry({ mode: 'quick', category: 'Science' }),
      createHistoryEntry({ mode: 'custom', category: 'Math' }),
    ]
    render(<GameHistoryList history={entries} />)

    // Click "QUICK" filter
    const quickFilter = screen.getByText('⚡ QUICK')
    fireEvent.click(quickFilter)

    expect(screen.getByText('Showing 1 of 2 games')).toBeInTheDocument()
    expect(screen.getByText('Science')).toBeInTheDocument()
  })

  it('sorts by score', () => {
    const entries = [
      createHistoryEntry({ score: 200, category: 'Low' }),
      createHistoryEntry({ score: 900, category: 'High' }),
    ]
    render(<GameHistoryList history={entries} />)

    // Change sort to score
    const sortSelect = screen.getByLabelText('Sort by')
    fireEvent.change(sortSelect, { target: { value: 'score' } })

    const buttons = screen.getAllByRole('button', { name: /Game details/i })
    expect(buttons).toHaveLength(2)
  })
})

// ============================================================================
// StatsChart Tests
// ============================================================================

describe('ModeChart', () => {
  it('shows empty state when no data', () => {
    render(<ModeChart modeBreakdown={{}} />)
    expect(screen.getByText('NO MODE DATA YET')).toBeInTheDocument()
  })

  it('renders mode bars', () => {
    const breakdown: Record<string, ModeStats> = {
      quick: {
        gamesPlayed: 10,
        totalScore: 5000,
        averageScore: 500,
        averageAccuracy: 75,
        bestScore: 1000,
      },
      custom: {
        gamesPlayed: 5,
        totalScore: 3000,
        averageScore: 600,
        averageAccuracy: 80,
        bestScore: 900,
      },
    }
    render(<ModeChart modeBreakdown={breakdown} />)
    expect(screen.getByText('📊 MODE BREAKDOWN')).toBeInTheDocument()
    // Each mode appears twice (Games Played + Best Scores)
    expect(screen.getAllByText('Quick')).toHaveLength(2)
    expect(screen.getAllByText('Custom')).toHaveLength(2)
  })
})

describe('CategoryChart', () => {
  it('shows empty state when no data', () => {
    render(<CategoryChart categoryBreakdown={{}} />)
    expect(screen.getByText('NO CATEGORY DATA YET')).toBeInTheDocument()
  })

  it('renders category bars', () => {
    const breakdown: Record<string, CategoryStats> = {
      Science: { gamesPlayed: 10, totalScore: 5000, averageAccuracy: 75, bestScore: 1000 },
      History: { gamesPlayed: 5, totalScore: 3000, averageAccuracy: 80, bestScore: 900 },
    }
    render(<CategoryChart categoryBreakdown={breakdown} />)
    expect(screen.getByText('📂 TOP CATEGORIES')).toBeInTheDocument()
    expect(screen.getByText('Science')).toBeInTheDocument()
    expect(screen.getByText('History')).toBeInTheDocument()
  })
})

describe('StatsCharts', () => {
  it('renders nothing when no data', () => {
    const { container } = render(<StatsCharts modeBreakdown={{}} categoryBreakdown={{}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders both charts when data exists', () => {
    const modeBreakdown: Record<string, ModeStats> = {
      quick: {
        gamesPlayed: 5,
        totalScore: 3000,
        averageScore: 600,
        averageAccuracy: 70,
        bestScore: 900,
      },
    }
    const categoryBreakdown: Record<string, CategoryStats> = {
      Science: { gamesPlayed: 5, totalScore: 3000, averageAccuracy: 70, bestScore: 900 },
    }
    render(<StatsCharts modeBreakdown={modeBreakdown} categoryBreakdown={categoryBreakdown} />)
    expect(screen.getByText('📊 MODE BREAKDOWN')).toBeInTheDocument()
    expect(screen.getByText('📂 TOP CATEGORIES')).toBeInTheDocument()
  })
})
