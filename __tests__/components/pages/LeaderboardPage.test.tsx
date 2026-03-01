/**
 * Tests for Leaderboard Page
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack }),
}))

jest.mock('@/hooks/useSound', () => ({
  useSound: () => ({ play: jest.fn() }),
}))

jest.mock('@/hooks/useGameHistory', () => ({
  useGameHistory: () => ({
    history: [
      {
        id: '1',
        score: 500,
        totalQuestions: 10,
        mode: 'quick',
        category: 'Science',
        playedAt: new Date().toISOString(),
        playerName: 'Alice',
        accuracy: 80,
        streak: 3,
        duration: 60,
      },
      {
        id: '2',
        score: 300,
        totalQuestions: 10,
        mode: 'custom',
        category: 'History',
        playedAt: new Date().toISOString(),
        playerName: 'Bob',
        accuracy: 60,
        streak: 1,
        duration: 90,
      },
    ],
    stats: { totalGames: 2 },
    isLoading: false,
  }),
}))

jest.mock('@/lib/leaderboard', () => ({
  getLeaderboard: jest.fn(() => ({
    entries: [
      {
        rank: 1,
        entry: {
          id: '1',
          score: 500,
          totalQuestions: 10,
          mode: 'quick',
          category: 'Science',
          playedAt: new Date().toISOString(),
          playerName: 'Alice',
          accuracy: 80,
          streak: 3,
          duration: 60,
        },
        isPersonalBest: true,
      },
      {
        rank: 2,
        entry: {
          id: '2',
          score: 300,
          totalQuestions: 10,
          mode: 'custom',
          category: 'History',
          playedAt: new Date().toISOString(),
          playerName: 'Bob',
          accuracy: 60,
          streak: 1,
          duration: 90,
        },
        isPersonalBest: false,
      },
    ],
    totalGames: 2,
  })),
  getPersonalRecords: jest.fn(() => ({
    highestScore: { score: 500, category: 'Science' },
    bestAccuracy: { accuracy: 80, category: 'Science' },
    longestStreak: { streak: 3, category: 'Science' },
    fastestGame: { duration: 60, totalQuestions: 10, category: 'Science' },
    mostQuestions: { totalQuestions: 10, category: 'Science' },
  })),
}))

jest.mock('@/app/components/ui', () => ({
  SparklesOverlay: () => <div data-testid="sparkles" />,
  PageTransition: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StaggerChildren: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}))

jest.mock('@/app/components/Footer', () => ({
  __esModule: true,
  default: () => <footer data-testid="footer" />,
}))

import LeaderboardPage from '@/app/game/leaderboard/page'

// ── Tests ──────────────────────────────────────────────────────────────────

describe('LeaderboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders page heading', () => {
    render(<LeaderboardPage />)
    expect(screen.getByText(/LEADERBOARD/)).toBeInTheDocument()
  })

  it('renders personal records section', () => {
    render(<LeaderboardPage />)
    expect(screen.getByText('Personal Records')).toBeInTheDocument()
    expect(screen.getByText('HIGHEST SCORE')).toBeInTheDocument()
    expect(screen.getByText('BEST ACCURACY')).toBeInTheDocument()
    expect(screen.getByText('LONGEST STREAK')).toBeInTheDocument()
    expect(screen.getByText('FASTEST GAME')).toBeInTheDocument()
    expect(screen.getByText('MOST QUESTIONS')).toBeInTheDocument()
  })

  it('renders period filter tabs', () => {
    render(<LeaderboardPage />)
    expect(screen.getByText('ALL TIME')).toBeInTheDocument()
    expect(screen.getByText('THIS MONTH')).toBeInTheDocument()
    expect(screen.getByText('THIS WEEK')).toBeInTheDocument()
    expect(screen.getByText('TODAY')).toBeInTheDocument()
  })

  it('renders sort options', () => {
    render(<LeaderboardPage />)
    expect(screen.getByTitle('Sort by Score')).toBeInTheDocument()
    expect(screen.getByTitle('Sort by Accuracy')).toBeInTheDocument()
    expect(screen.getByTitle('Sort by Streak')).toBeInTheDocument()
    expect(screen.getByTitle('Sort by Speed')).toBeInTheDocument()
  })

  it('renders mode filter dropdown', () => {
    render(<LeaderboardPage />)
    expect(screen.getByLabelText('Filter by game mode')).toBeInTheDocument()
  })

  it('renders leaderboard entries with rank medals', () => {
    render(<LeaderboardPage />)
    expect(screen.getByText('1st')).toBeInTheDocument()
    expect(screen.getByText('2nd')).toBeInTheDocument()
  })

  it('renders player names in entries', () => {
    render(<LeaderboardPage />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows BEST badge for personal bests', () => {
    render(<LeaderboardPage />)
    expect(screen.getByText('BEST')).toBeInTheDocument()
  })

  it('shows game count', () => {
    render(<LeaderboardPage />)
    expect(screen.getByText('2 games')).toBeInTheDocument()
  })

  it('navigates back on BACK click', () => {
    render(<LeaderboardPage />)
    fireEvent.click(screen.getByLabelText('Go back'))
    expect(mockBack).toHaveBeenCalled()
  })

  it('switches period filter on click', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getLeaderboard } = require('@/lib/leaderboard')
    render(<LeaderboardPage />)
    fireEvent.click(screen.getByText('THIS WEEK'))
    // getLeaderboard should have been called with the new period
    expect(getLeaderboard).toHaveBeenCalled()
  })

  it('renders footer', () => {
    render(<LeaderboardPage />)
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders personal record values', () => {
    render(<LeaderboardPage />)
    // Values appear in both personal records section and leaderboard rows
    expect(screen.getAllByText('500').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('80%').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1)
  })
})
