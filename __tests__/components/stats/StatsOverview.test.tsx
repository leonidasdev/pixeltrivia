/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { StatsOverview } from '@/app/components/stats/StatsOverview'
import type { DetailedStats } from '@/lib/storage'

// ============================================================================
// Test Fixtures
// ============================================================================

function makeStats(overrides: Partial<DetailedStats> = {}): DetailedStats {
  return {
    totalGames: 25,
    totalScore: 12500,
    averageScore: 500,
    averageAccuracy: 78,
    bestScore: 980,
    bestAccuracy: 100,
    bestStreak: 7,
    totalCorrect: 195,
    totalQuestions: 250,
    totalTimePlayed: 3600,
    favoriteMode: 'quick',
    favoriteCategory: 'Science',
    modeBreakdown: {},
    categoryBreakdown: {},
    recentTrend: 'improving',
    gamesThisWeek: 4,
    currentWinStreak: 3,
    ...overrides,
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('StatsOverview', () => {
  describe('empty state', () => {
    it('shows empty state when totalGames is 0', () => {
      render(<StatsOverview stats={makeStats({ totalGames: 0 })} />)
      expect(screen.getByText('NO GAMES YET')).toBeInTheDocument()
      expect(
        screen.getByText('Play your first game to start tracking your stats!')
      ).toBeInTheDocument()
    })

    it('does not render stat cards in empty state', () => {
      render(<StatsOverview stats={makeStats({ totalGames: 0 })} />)
      expect(screen.queryByText('Games Played')).not.toBeInTheDocument()
    })
  })

  describe('primary stats', () => {
    it('displays total games', () => {
      render(<StatsOverview stats={makeStats()} />)
      expect(screen.getByText('Games Played')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
    })

    it('displays average accuracy', () => {
      render(<StatsOverview stats={makeStats()} />)
      expect(screen.getByText('Avg Accuracy')).toBeInTheDocument()
      expect(screen.getByText('78%')).toBeInTheDocument()
    })

    it('displays best score', () => {
      render(<StatsOverview stats={makeStats()} />)
      expect(screen.getByText('Best Score')).toBeInTheDocument()
      expect(screen.getByText('980')).toBeInTheDocument()
    })

    it('displays best streak', () => {
      render(<StatsOverview stats={makeStats()} />)
      expect(screen.getByText('Best Streak')).toBeInTheDocument()
      expect(screen.getByText('7')).toBeInTheDocument()
    })
  })

  describe('secondary stats', () => {
    it('displays total score', () => {
      render(<StatsOverview stats={makeStats()} />)
      expect(screen.getByText('Total Score')).toBeInTheDocument()
      expect(screen.getByText('12,500')).toBeInTheDocument()
    })

    it('displays questions right', () => {
      render(<StatsOverview stats={makeStats()} />)
      expect(screen.getByText('Questions Right')).toBeInTheDocument()
      expect(screen.getByText('195/250')).toBeInTheDocument()
    })

    it('displays time played', () => {
      render(<StatsOverview stats={makeStats()} />)
      expect(screen.getByText('Time Played')).toBeInTheDocument()
    })
  })

  describe('trend display', () => {
    it('shows IMPROVING trend', () => {
      render(<StatsOverview stats={makeStats({ recentTrend: 'improving' })} />)
      expect(screen.getByText('IMPROVING')).toBeInTheDocument()
    })

    it('shows DECLINING trend', () => {
      render(<StatsOverview stats={makeStats({ recentTrend: 'declining' })} />)
      expect(screen.getByText('DECLINING')).toBeInTheDocument()
    })

    it('shows STABLE trend', () => {
      render(<StatsOverview stats={makeStats({ recentTrend: 'stable' })} />)
      expect(screen.getByText('STABLE')).toBeInTheDocument()
    })

    it('shows NEW PLAYER trend', () => {
      render(<StatsOverview stats={makeStats({ recentTrend: 'new' })} />)
      expect(screen.getByText('NEW PLAYER')).toBeInTheDocument()
    })
  })

  describe('conditional fields', () => {
    it('displays favorite mode when available', () => {
      render(<StatsOverview stats={makeStats({ favoriteMode: 'quick' })} />)
      expect(screen.getByText('Favorite Mode')).toBeInTheDocument()
      expect(screen.getByText('> Quick')).toBeInTheDocument()
    })

    it('displays favorite category when available', () => {
      render(<StatsOverview stats={makeStats({ favoriteCategory: 'Science' })} />)
      expect(screen.getByText('Top Category')).toBeInTheDocument()
      expect(screen.getByText('Science')).toBeInTheDocument()
    })

    it('hides favorite mode when null', () => {
      render(<StatsOverview stats={makeStats({ favoriteMode: null })} />)
      expect(screen.queryByText('Favorite Mode')).not.toBeInTheDocument()
    })

    it('hides favorite category when null', () => {
      render(<StatsOverview stats={makeStats({ favoriteCategory: null })} />)
      expect(screen.queryByText('Top Category')).not.toBeInTheDocument()
    })
  })

  describe('accuracy color logic', () => {
    it('uses green for accuracy >= 70%', () => {
      const { container } = render(<StatsOverview stats={makeStats({ averageAccuracy: 85 })} />)
      const cards = container.querySelectorAll('.text-green-400')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('uses yellow for accuracy < 70%', () => {
      const { container } = render(<StatsOverview stats={makeStats({ averageAccuracy: 50 })} />)
      const cards = container.querySelectorAll('.text-yellow-400')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  describe('win streak display', () => {
    it('shows active streak message for streak > 0', () => {
      render(<StatsOverview stats={makeStats({ currentWinStreak: 5 })} />)
      expect(screen.getByText('Win Streak')).toBeInTheDocument()
    })

    it('shows encouragement when streak is 0', () => {
      render(<StatsOverview stats={makeStats({ currentWinStreak: 0 })} />)
      expect(screen.getByText('Start a streak!')).toBeInTheDocument()
    })
  })
})
