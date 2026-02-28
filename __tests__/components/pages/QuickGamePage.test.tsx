/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'

// Mock useSound hook
jest.mock('@/hooks/useSound', () => ({
  useSound: () => ({
    play: jest.fn(),
    setVolume: jest.fn(),
    toggleMute: jest.fn(),
    isMuted: false,
  }),
}))

// Mock QuickGameSelector
const mockOnCategorySelected = jest.fn()
jest.mock('@/app/components/QuickGameSelector', () => ({
  __esModule: true,
  default: function MockQuickGameSelector({
    onCategorySelected,
    onCancel,
  }: {
    onCategorySelected: (cat: string, diff: string) => void
    onCancel: () => void
  }) {
    // Store the callback for external reference
    mockOnCategorySelected.mockImplementation(onCategorySelected)
    return (
      <div data-testid="quick-game-selector">
        <button onClick={() => onCategorySelected('General Knowledge', 'classic')}>
          Select Category
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    )
  },
}))

// Mock gameApi
jest.mock('@/lib/gameApi', () => ({
  fetchQuestions: jest.fn(),
  createGameSession: jest.fn(() => ({ id: 'test-session' })),
}))

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/game/quick',
}))

import QuickGamePage from '@/app/game/quick/page'
import { fetchQuestions } from '@/lib/gameApi'

describe('QuickGamePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Rendering', () => {
    it('renders the page title', () => {
      render(<QuickGamePage />)
      expect(screen.getByText('QUICK GAME')).toBeInTheDocument()
    })

    it('renders the subtitle', () => {
      render(<QuickGamePage />)
      expect(screen.getByText(/jump into a fast-paced trivia challenge/i)).toBeInTheDocument()
    })

    it('renders the quick game selector', () => {
      render(<QuickGamePage />)
      expect(screen.getByTestId('quick-game-selector')).toBeInTheDocument()
    })

    it('renders how it works section', () => {
      render(<QuickGamePage />)
      expect(screen.getByText(/how quick game works/i)).toBeInTheDocument()
    })

    it('renders instruction list', () => {
      render(<QuickGamePage />)
      expect(screen.getByText(/choose your preferred difficulty level/i)).toBeInTheDocument()
      expect(screen.getByText(/select a category that interests you/i)).toBeInTheDocument()
      expect(screen.getByText(/answer 10 questions/i)).toBeInTheDocument()
    })
  })

  describe('Game start flow', () => {
    it('shows success toast when game loads successfully', async () => {
      ;(fetchQuestions as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          questions: [
            {
              id: '1',
              question: 'Test?',
              options: ['A', 'B', 'C', 'D'],
              correctAnswer: 0,
            },
          ],
        },
      })

      render(<QuickGamePage />)
      const selectButton = screen.getByText('Select Category')
      selectButton.click()

      await waitFor(() => {
        expect(screen.getByText(/game loaded/i)).toBeInTheDocument()
      })
    })

    it('shows error toast when game fails to load', async () => {
      ;(fetchQuestions as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Network error',
      })

      render(<QuickGamePage />)
      const selectButton = screen.getByText('Select Category')
      selectButton.click()

      await waitFor(() => {
        expect(screen.getByText(/failed to start the game/i)).toBeInTheDocument()
      })
    })
  })

  describe('Cancel flow', () => {
    it('navigates home when cancel is clicked', () => {
      render(<QuickGamePage />)
      const cancelButton = screen.getByText('Cancel')
      cancelButton.click()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('Accessibility', () => {
    it('has heading structure', () => {
      render(<QuickGamePage />)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('has main as the root element', () => {
      const { container } = render(<QuickGamePage />)
      expect(container.querySelector('main')).toBeInTheDocument()
    })
  })
})
