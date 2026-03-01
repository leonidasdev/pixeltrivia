/**
 * Tests for Achievements Page
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

const mockAchievements = [
  {
    id: 'first_game',
    name: 'First Steps',
    description: 'Complete your first game',
    icon: '🎮',
    tier: 'bronze' as const,
    category: 'gameplay' as const,
    unlocked: true,
    unlockedAt: '2024-01-15T10:00:00Z',
    progress: 1,
    requirement: 1,
  },
  {
    id: 'ten_games',
    name: 'Getting Started',
    description: 'Complete 10 games',
    icon: '🏅',
    tier: 'silver' as const,
    category: 'dedication' as const,
    unlocked: false,
    progress: 0.5,
    requirement: 10,
  },
  {
    id: 'perfect_score',
    name: 'Perfectionist',
    description: 'Get a perfect score',
    icon: '💯',
    tier: 'gold' as const,
    category: 'mastery' as const,
    unlocked: false,
    progress: 0,
    requirement: 1,
  },
]

jest.mock('@/lib/achievements', () => ({
  getAchievements: () => mockAchievements,
  getAchievementSummary: () => ({
    total: 3,
    unlocked: 1,
    percentage: 33,
    byTier: {
      bronze: { total: 1, unlocked: 1 },
      silver: { total: 1, unlocked: 0 },
      gold: { total: 1, unlocked: 0 },
      platinum: { total: 0, unlocked: 0 },
    },
  }),
  getTierDisplay: (tier: string) => {
    const displays: Record<
      string,
      { label: string; color: string; bgColor: string; borderColor: string }
    > = {
      bronze: {
        label: 'Bronze',
        color: 'text-amber-400',
        bgColor: 'bg-amber-900/20',
        borderColor: 'border-amber-600',
      },
      silver: {
        label: 'Silver',
        color: 'text-gray-300',
        bgColor: 'bg-gray-700/20',
        borderColor: 'border-gray-500',
      },
      gold: {
        label: 'Gold',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/20',
        borderColor: 'border-yellow-600',
      },
      platinum: {
        label: 'Platinum',
        color: 'text-cyan-300',
        bgColor: 'bg-cyan-900/20',
        borderColor: 'border-cyan-600',
      },
    }
    return displays[tier] || displays.bronze
  },
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

import AchievementsPage from '@/app/game/achievements/page'

// ── Tests ──────────────────────────────────────────────────────────────────

describe('AchievementsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders page heading', () => {
    render(<AchievementsPage />)
    expect(screen.getByText(/ACHIEVEMENTS/)).toBeInTheDocument()
  })

  it('renders summary bar with progress', () => {
    render(<AchievementsPage />)
    expect(screen.getByText('1/3 (33%)')).toBeInTheDocument()
    expect(screen.getByText('Progress')).toBeInTheDocument()
  })

  it('renders all filter tabs', () => {
    render(<AchievementsPage />)
    expect(screen.getByText('ALL')).toBeInTheDocument()
    expect(screen.getByText('UNLOCKED')).toBeInTheDocument()
    expect(screen.getByText('LOCKED')).toBeInTheDocument()
    expect(screen.getByText('GAMEPLAY')).toBeInTheDocument()
    expect(screen.getByText('MASTERY')).toBeInTheDocument()
    expect(screen.getByText('DEDICATION')).toBeInTheDocument()
    expect(screen.getByText('SPECIAL')).toBeInTheDocument()
  })

  it('shows all achievements by default', () => {
    render(<AchievementsPage />)
    expect(screen.getByText('First Steps')).toBeInTheDocument()
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Perfectionist')).toBeInTheDocument()
  })

  it('filters to unlocked only', () => {
    render(<AchievementsPage />)
    fireEvent.click(screen.getByText('UNLOCKED'))
    expect(screen.getByText('First Steps')).toBeInTheDocument()
    expect(screen.queryByText('Getting Started')).not.toBeInTheDocument()
  })

  it('filters to locked only', () => {
    render(<AchievementsPage />)
    fireEvent.click(screen.getByText('LOCKED'))
    expect(screen.queryByText('First Steps')).not.toBeInTheDocument()
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Perfectionist')).toBeInTheDocument()
  })

  it('filters by category', () => {
    render(<AchievementsPage />)
    fireEvent.click(screen.getByText('DEDICATION'))
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.queryByText('First Steps')).not.toBeInTheDocument()
  })

  it('shows empty state when filter matches nothing', () => {
    render(<AchievementsPage />)
    fireEvent.click(screen.getByText('SPECIAL'))
    expect(screen.getByText('NO ACHIEVEMENTS')).toBeInTheDocument()
  })

  it('shows progress bar for partially completed locked achievements', () => {
    render(<AchievementsPage />)
    const progressBars = screen.getAllByRole('progressbar')
    // Overall summary progress bar + the "Getting Started" achievement (50%)
    expect(progressBars.length).toBeGreaterThanOrEqual(2)
  })

  it('shows unlock date for unlocked achievements', () => {
    render(<AchievementsPage />)
    expect(screen.getByText(/Unlocked/)).toBeInTheDocument()
  })

  it('shows checkmark for unlocked achievements', () => {
    render(<AchievementsPage />)
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('navigates back on BACK button click', () => {
    render(<AchievementsPage />)
    fireEvent.click(screen.getByLabelText('Go back'))
    expect(mockBack).toHaveBeenCalled()
  })

  it('shows tier breakdown in summary', () => {
    render(<AchievementsPage />)
    // Tier labels appear in both summary bar and achievement cards
    expect(screen.getAllByText('BRONZE').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('SILVER').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('GOLD').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('PLATINUM').length).toBeGreaterThanOrEqual(1)
  })

  it('renders footer', () => {
    render(<AchievementsPage />)
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })
})
