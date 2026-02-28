/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'

// Mock CustomGameConfigurator
jest.mock('@/app/components/CustomGameConfigurator', () => ({
  __esModule: true,
  default: function MockCustomGameConfigurator({
    onStartCustomGame,
    onCancel,
    isLoading,
  }: {
    onStartCustomGame: (config: unknown) => void
    onCancel: () => void
    isLoading: boolean
  }) {
    return (
      <div data-testid="custom-configurator">
        <button
          onClick={() =>
            onStartCustomGame({
              knowledgeLevel: 'college',
              context: 'Test context',
              numberOfQuestions: 5,
            })
          }
        >
          Start Custom Game
        </button>
        <button onClick={onCancel}>Cancel</button>
        {isLoading && <span>Generating...</span>}
      </div>
    )
  },
}))

// Mock customQuizApi
jest.mock('@/lib/customQuizApi', () => ({
  generateCustomQuiz: jest.fn(),
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
  usePathname: () => '/game/custom',
}))

import CustomGamePage from '@/app/game/custom/page'
import { generateCustomQuiz } from '@/lib/customQuizApi'

describe('CustomGamePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('Rendering', () => {
    it('renders the page title', () => {
      render(<CustomGamePage />)
      expect(screen.getByText('CUSTOM GAME')).toBeInTheDocument()
    })

    it('renders AI-powered subtitle', () => {
      render(<CustomGamePage />)
      expect(screen.getByText(/ai-powered personalized trivia/i)).toBeInTheDocument()
    })

    it('renders feature badges', () => {
      render(<CustomGamePage />)
      expect(screen.getByText(/powered by advanced ai/i)).toBeInTheDocument()
      expect(screen.getByText(/unlimited topics/i)).toBeInTheDocument()
    })

    it('renders the custom game configurator', () => {
      render(<CustomGamePage />)
      expect(screen.getByTestId('custom-configurator')).toBeInTheDocument()
    })

    it('renders feature cards section', () => {
      render(<CustomGamePage />)
      expect(screen.getByText('Targeted Learning')).toBeInTheDocument()
      expect(screen.getByText('Instant Generation')).toBeInTheDocument()
      expect(screen.getByText('Any Subject')).toBeInTheDocument()
    })

    it('renders how it works section', () => {
      render(<CustomGamePage />)
      expect(screen.getByText(/how custom games work/i)).toBeInTheDocument()
    })

    it('renders knowledge level descriptions', () => {
      render(<CustomGamePage />)
      expect(screen.getByText(/elementary/i)).toBeInTheDocument()
      expect(screen.getByText(/college/i)).toBeInTheDocument()
    })
  })

  describe('Game generation flow', () => {
    it('shows success toast when quiz generates successfully', async () => {
      ;(generateCustomQuiz as jest.Mock).mockResolvedValue({
        success: true,
        data: [{ id: '1', question: 'Test?', options: ['A', 'B', 'C', 'D'], correctAnswer: 0 }],
      })

      render(<CustomGamePage />)
      screen.getByText('Start Custom Game').click()

      await waitFor(() => {
        expect(screen.getByText(/custom quiz generated/i)).toBeInTheDocument()
      })
    })

    it('stores generated questions in session storage', async () => {
      const mockQuestions = [
        { id: '1', question: 'Test?', options: ['A', 'B', 'C', 'D'], correctAnswer: 0 },
      ]
      ;(generateCustomQuiz as jest.Mock).mockResolvedValue({
        success: true,
        data: mockQuestions,
      })

      render(<CustomGamePage />)
      screen.getByText('Start Custom Game').click()

      await waitFor(() => {
        expect(sessionStorage.getItem('customGameQuestions')).toBeTruthy()
      })
    })

    it('shows error toast when generation fails', async () => {
      ;(generateCustomQuiz as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Service unavailable',
      })

      render(<CustomGamePage />)
      screen.getByText('Start Custom Game').click()

      await waitFor(() => {
        expect(screen.getByText(/failed to generate custom game/i)).toBeInTheDocument()
      })
    })

    it('shows error toast when API throws', async () => {
      ;(generateCustomQuiz as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<CustomGamePage />)
      screen.getByText('Start Custom Game').click()

      await waitFor(() => {
        expect(screen.getByText(/failed to generate custom game/i)).toBeInTheDocument()
      })
    })
  })

  describe('Cancel flow', () => {
    it('navigates home when cancel is clicked', () => {
      render(<CustomGamePage />)
      screen.getByText('Cancel').click()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('Accessibility', () => {
    it('has heading structure', () => {
      render(<CustomGamePage />)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('has main as the root element', () => {
      const { container } = render(<CustomGamePage />)
      expect(container.querySelector('main')).toBeInTheDocument()
    })
  })
})
