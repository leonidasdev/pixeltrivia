/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock Footer component
jest.mock('@/app/components/Footer', () => ({
  __esModule: true,
  default: function MockFooter() {
    return <div data-testid="footer">Footer</div>
  },
}))

const mockPush = jest.fn()
const stableSearchParams = new URLSearchParams()
const stableRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
}
jest.mock('next/navigation', () => ({
  useRouter: () => stableRouter,
  useSearchParams: () => stableSearchParams,
  usePathname: () => '/game/advanced',
}))

import AdvancedGamePage from '@/app/game/advanced/page'
import { STORAGE_KEYS } from '@/constants/game'

describe('AdvancedGamePage', () => {
  const mockConfig = {
    files: [{ id: '1', name: 'test-doc.pdf', size: 1024, content: 'Test content' }],
    timePerQuestion: 30,
    questionFormat: 'short',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    // Suppress console.error from JSON.parse failures in tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Rendering with config', () => {
    it('renders the page title', () => {
      localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(mockConfig))
      render(<AdvancedGamePage />)
      expect(screen.getByText(/ADVANCED GAME/i)).toBeInTheDocument()
    })

    it('renders the subtitle', () => {
      localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(mockConfig))
      render(<AdvancedGamePage />)
      expect(screen.getByText(/solo play with custom documents/i)).toBeInTheDocument()
    })

    it('renders game configuration section', () => {
      localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(mockConfig))
      render(<AdvancedGamePage />)
      expect(screen.getByText('Game Configuration')).toBeInTheDocument()
    })

    it('displays uploaded file name', () => {
      localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(mockConfig))
      render(<AdvancedGamePage />)
      expect(screen.getByText('test-doc.pdf')).toBeInTheDocument()
    })

    it('displays file size', () => {
      localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(mockConfig))
      render(<AdvancedGamePage />)
      expect(screen.getByText('1.0 KB')).toBeInTheDocument()
    })

    it('displays time per question', () => {
      localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(mockConfig))
      render(<AdvancedGamePage />)
      expect(screen.getByText('30 seconds')).toBeInTheDocument()
    })

    it('displays question format', () => {
      localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(mockConfig))
      render(<AdvancedGamePage />)
      expect(screen.getByText('Short Questions')).toBeInTheDocument()
    })

    it('renders start game button', () => {
      localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(mockConfig))
      render(<AdvancedGamePage />)
      expect(screen.getByText(/START GAME/i)).toBeInTheDocument()
    })

    it('renders footer', () => {
      localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(mockConfig))
      render(<AdvancedGamePage />)
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })
  })

  describe('Rendering without files', () => {
    it('shows no documents message when no files uploaded', () => {
      const configNoFiles = { ...mockConfig, files: [] }
      localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(configNoFiles))
      render(<AdvancedGamePage />)
      expect(screen.getByText('No documents uploaded')).toBeInTheDocument()
    })
  })

  describe('Redirect behavior', () => {
    it('redirects to mode page when no config saved', () => {
      render(<AdvancedGamePage />)
      expect(mockPush).toHaveBeenCalledWith('/game/mode')
    })

    it('redirects when config is invalid JSON', () => {
      localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, 'not valid json')
      render(<AdvancedGamePage />)
      expect(mockPush).toHaveBeenCalledWith('/game/mode')
    })
  })

  describe('Game start flow', () => {
    it('calls API on game start and stores questions on success', async () => {
      localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(mockConfig))

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              questions: [
                { id: '1', question: 'Test?', options: ['A', 'B', 'C', 'D'], correctAnswer: 0 },
              ],
              metadata: { numQuestions: 1, format: 'short', timeLimit: 30 },
            },
          }),
      }) as jest.Mock

      render(<AdvancedGamePage />)
      fireEvent.click(screen.getByText(/START GAME/i))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/quiz/advanced',
          expect.objectContaining({ method: 'POST' })
        )
      })

      // Verify questions were stored in localStorage
      await waitFor(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.GENERATED_QUESTIONS)
        expect(stored).not.toBeNull()
      })
    })

    it('shows error when API fails', async () => {
      localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(mockConfig))

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'AI service error' }),
      }) as jest.Mock

      render(<AdvancedGamePage />)
      fireEvent.click(screen.getByText(/START GAME/i))

      await waitFor(() => {
        expect(screen.getByText(/AI service error/i)).toBeInTheDocument()
      })
    })

    it('shows error when fetch throws', async () => {
      localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(mockConfig))

      global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as jest.Mock

      render(<AdvancedGamePage />)
      fireEvent.click(screen.getByText(/START GAME/i))

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has heading structure', () => {
      localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(mockConfig))
      render(<AdvancedGamePage />)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('has main as the root element', () => {
      localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(mockConfig))
      const { container } = render(<AdvancedGamePage />)
      expect(container.querySelector('main')).toBeInTheDocument()
    })
  })
})
