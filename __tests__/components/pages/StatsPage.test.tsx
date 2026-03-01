/**
 * Tests for Stats Page
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockBack = jest.fn()
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
}))

jest.mock('@/hooks/useSound', () => ({
  useSound: () => ({ play: jest.fn() }),
}))

const mockStats = {
  totalGames: 10,
  totalScore: 5000,
  averageAccuracy: 75,
  currentWinStreak: 3,
  modeBreakdown: {},
  categoryBreakdown: {},
}

const mockHistory = [
  {
    id: '1',
    score: 500,
    totalQuestions: 10,
    mode: 'quick',
    category: 'Science',
    playedAt: new Date().toISOString(),
  },
]

const mockRemoveGame = jest.fn()
const mockClearAll = jest.fn()

jest.mock('@/hooks/useGameHistory', () => ({
  useGameHistory: () => ({
    history: mockHistory,
    stats: mockStats,
    removeGame: mockRemoveGame,
    clearAll: mockClearAll,
    isLoading: false,
  }),
}))

// Mock UI components to avoid complex rendering
jest.mock('@/app/components/ui', () => ({
  SparklesOverlay: () => <div data-testid="sparkles" />,
  PageTransition: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StaggerChildren: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('@/app/components/stats', () => ({
  StatsOverview: ({ stats }: { stats: unknown }) => (
    <div data-testid="stats-overview">Overview</div>
  ),
  GameHistoryList: ({
    onDelete,
    onClearAll,
  }: {
    onDelete: (id: string) => void
    onClearAll: () => void
  }) => (
    <div data-testid="game-history">
      <button onClick={() => onDelete('1')}>Delete</button>
      <button onClick={() => onClearAll()}>Clear All</button>
    </div>
  ),
  StatsCharts: () => <div data-testid="stats-charts">Charts</div>,
}))

jest.mock('@/app/components/Footer', () => ({
  __esModule: true,
  default: () => <footer data-testid="footer" />,
}))

import StatsPage from '@/app/game/stats/page'

// ── Tests ──────────────────────────────────────────────────────────────────

describe('StatsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the page heading', () => {
    render(<StatsPage />)
    expect(screen.getByText(/STATS & HISTORY/)).toBeInTheDocument()
  })

  it('shows quick stat badges when totalGames > 0', () => {
    render(<StatsPage />)
    expect(screen.getByText(/10 GAMES/)).toBeInTheDocument()
    expect(screen.getByText(/5,000 PTS/)).toBeInTheDocument()
    expect(screen.getByText(/75% AVG/)).toBeInTheDocument()
    expect(screen.getByText(/3 STREAK/)).toBeInTheDocument()
  })

  it('renders three tab buttons', () => {
    render(<StatsPage />)
    expect(screen.getByRole('tab', { name: /OVERVIEW/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /HISTORY/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /CHARTS/i })).toBeInTheDocument()
  })

  it('shows overview tab by default', () => {
    render(<StatsPage />)
    expect(screen.getByTestId('stats-overview')).toBeInTheDocument()
  })

  it('switches to history tab on click', () => {
    render(<StatsPage />)
    fireEvent.click(screen.getByRole('tab', { name: /HISTORY/i }))
    expect(screen.getByTestId('game-history')).toBeInTheDocument()
  })

  it('switches to charts tab on click', () => {
    render(<StatsPage />)
    fireEvent.click(screen.getByRole('tab', { name: /CHARTS/i }))
    expect(screen.getByTestId('stats-charts')).toBeInTheDocument()
  })

  it('navigates back when BACK button clicked', () => {
    render(<StatsPage />)
    fireEvent.click(screen.getByText('← BACK'))
    expect(mockBack).toHaveBeenCalled()
  })

  it('navigates to /game/mode when PLAY AGAIN clicked', () => {
    render(<StatsPage />)
    fireEvent.click(screen.getByText(/PLAY AGAIN/))
    expect(mockPush).toHaveBeenCalledWith('/game/mode')
  })

  it('calls removeGame when delete is triggered in history', () => {
    render(<StatsPage />)
    fireEvent.click(screen.getByRole('tab', { name: /HISTORY/i }))
    fireEvent.click(screen.getByText('Delete'))
    expect(mockRemoveGame).toHaveBeenCalledWith('1')
  })

  it('calls clearAll when clear all is triggered in history', () => {
    render(<StatsPage />)
    fireEvent.click(screen.getByRole('tab', { name: /HISTORY/i }))
    fireEvent.click(screen.getByText('Clear All'))
    expect(mockClearAll).toHaveBeenCalled()
  })

  it('renders footer', () => {
    render(<StatsPage />)
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })
})
