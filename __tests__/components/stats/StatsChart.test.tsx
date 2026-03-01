/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { ModeChart, CategoryChart, StatsCharts } from '@/app/components/stats/StatsChart'
import type { ModeStats, CategoryStats } from '@/lib/storage'

// ============================================================================
// Test Fixtures
// ============================================================================

const sampleModeBreakdown: Record<string, ModeStats> = {
  quick: {
    gamesPlayed: 15,
    totalScore: 7500,
    averageScore: 500,
    averageAccuracy: 82,
    bestScore: 950,
  },
  custom: {
    gamesPlayed: 8,
    totalScore: 4000,
    averageScore: 500,
    averageAccuracy: 75,
    bestScore: 880,
  },
}

const sampleCategoryBreakdown: Record<string, CategoryStats> = {
  Science: {
    gamesPlayed: 10,
    totalScore: 5000,
    averageAccuracy: 80,
    bestScore: 950,
  },
  History: {
    gamesPlayed: 7,
    totalScore: 3200,
    averageAccuracy: 70,
    bestScore: 800,
  },
  Geography: {
    gamesPlayed: 3,
    totalScore: 1200,
    averageAccuracy: 60,
    bestScore: 600,
  },
}

// ============================================================================
// ModeChart Tests
// ============================================================================

describe('ModeChart', () => {
  it('renders empty state when no data', () => {
    render(<ModeChart modeBreakdown={{}} />)
    expect(screen.getByText('NO MODE DATA YET')).toBeInTheDocument()
  })

  it('displays mode breakdown heading', () => {
    render(<ModeChart modeBreakdown={sampleModeBreakdown} />)
    expect(screen.getByText('MODE BREAKDOWN')).toBeInTheDocument()
  })

  it('displays Games Played section', () => {
    render(<ModeChart modeBreakdown={sampleModeBreakdown} />)
    expect(screen.getByText('Games Played')).toBeInTheDocument()
  })

  it('displays Best Scores section', () => {
    render(<ModeChart modeBreakdown={sampleModeBreakdown} />)
    expect(screen.getByText('Best Scores')).toBeInTheDocument()
  })

  it('renders bars for each mode', () => {
    render(<ModeChart modeBreakdown={sampleModeBreakdown} />)
    // "Quick" label appears twice (games + best scores sections)
    const quickLabels = screen.getAllByText('Quick')
    expect(quickLabels.length).toBe(2)
    const customLabels = screen.getAllByText('Custom')
    expect(customLabels.length).toBe(2)
  })

  it('renders progress bars with correct aria attributes', () => {
    render(<ModeChart modeBreakdown={sampleModeBreakdown} />)
    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars.length).toBe(4) // 2 modes * 2 charts (games + scores)
  })

  it('shows accuracy subtext for games section', () => {
    render(<ModeChart modeBreakdown={sampleModeBreakdown} />)
    expect(screen.getByText('Avg accuracy: 82%')).toBeInTheDocument()
    expect(screen.getByText('Avg accuracy: 75%')).toBeInTheDocument()
  })

  it('handles unknown modes with fallback config', () => {
    const unknownMode: Record<string, ModeStats> = {
      mystery: {
        gamesPlayed: 5,
        totalScore: 2500,
        averageScore: 500,
        averageAccuracy: 90,
        bestScore: 1000,
      },
    }
    render(<ModeChart modeBreakdown={unknownMode} />)
    // Uses mode name as label when not in config
    const labels = screen.getAllByText('mystery')
    expect(labels.length).toBe(2)
  })
})

// ============================================================================
// CategoryChart Tests
// ============================================================================

describe('CategoryChart', () => {
  it('renders empty state when no data', () => {
    render(<CategoryChart categoryBreakdown={{}} />)
    expect(screen.getByText('NO CATEGORY DATA YET')).toBeInTheDocument()
  })

  it('displays top categories heading', () => {
    render(<CategoryChart categoryBreakdown={sampleCategoryBreakdown} />)
    expect(screen.getByText('TOP CATEGORIES')).toBeInTheDocument()
  })

  it('renders bars for each category', () => {
    render(<CategoryChart categoryBreakdown={sampleCategoryBreakdown} />)
    expect(screen.getByText('Science')).toBeInTheDocument()
    expect(screen.getByText('History')).toBeInTheDocument()
    expect(screen.getByText('Geography')).toBeInTheDocument()
  })

  it('sorts categories by gamesPlayed (descending)', () => {
    const { container } = render(<CategoryChart categoryBreakdown={sampleCategoryBreakdown} />)
    const labels = container.querySelectorAll('.truncate')
    const labelTexts = Array.from(labels).map(l => l.textContent)
    expect(labelTexts).toEqual(['Science', 'History', 'Geography'])
  })

  it('limits to 8 categories', () => {
    const manyCategories: Record<string, CategoryStats> = {}
    for (let i = 0; i < 12; i++) {
      manyCategories[`Cat${i}`] = {
        gamesPlayed: 12 - i,
        totalScore: 1000,
        averageAccuracy: 70,
        bestScore: 500,
      }
    }
    render(<CategoryChart categoryBreakdown={manyCategories} />)
    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars.length).toBe(8)
  })

  it('shows best score and accuracy sublabels', () => {
    render(<CategoryChart categoryBreakdown={sampleCategoryBreakdown} />)
    expect(screen.getByText(/Best: 950/)).toBeInTheDocument()
    expect(screen.getByText(/Avg: 80%/)).toBeInTheDocument()
  })

  it('shows games count as display value', () => {
    render(<CategoryChart categoryBreakdown={sampleCategoryBreakdown} />)
    expect(screen.getByText('10 games')).toBeInTheDocument()
    expect(screen.getByText('7 games')).toBeInTheDocument()
    expect(screen.getByText('3 games')).toBeInTheDocument()
  })
})

// ============================================================================
// StatsCharts Tests
// ============================================================================

describe('StatsCharts', () => {
  it('returns null when no data', () => {
    const { container } = render(<StatsCharts modeBreakdown={{}} categoryBreakdown={{}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders both charts when data exists', () => {
    render(
      <StatsCharts
        modeBreakdown={sampleModeBreakdown}
        categoryBreakdown={sampleCategoryBreakdown}
      />
    )
    expect(screen.getByText('MODE BREAKDOWN')).toBeInTheDocument()
    expect(screen.getByText('TOP CATEGORIES')).toBeInTheDocument()
  })

  it('renders when only mode data exists', () => {
    render(<StatsCharts modeBreakdown={sampleModeBreakdown} categoryBreakdown={{}} />)
    expect(screen.getByText('MODE BREAKDOWN')).toBeInTheDocument()
    expect(screen.getByText('NO CATEGORY DATA YET')).toBeInTheDocument()
  })

  it('renders when only category data exists', () => {
    render(<StatsCharts modeBreakdown={{}} categoryBreakdown={sampleCategoryBreakdown} />)
    expect(screen.getByText('NO MODE DATA YET')).toBeInTheDocument()
    expect(screen.getByText('TOP CATEGORIES')).toBeInTheDocument()
  })
})
