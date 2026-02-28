/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock createPortal for Modal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}))

// Mock Footer component
jest.mock('@/app/components/Footer', () => ({
  __esModule: true,
  default: function MockFooter() {
    return <div data-testid="footer">Footer</div>
  },
}))

// Mock AdvancedGameConfigurator
jest.mock('@/app/components/AdvancedGameConfigurator', () => ({
  __esModule: true,
  default: function MockAdvancedGameConfigurator({
    onConfigChange,
  }: {
    onConfigChange: (config: unknown) => void
  }) {
    return <div data-testid="advanced-configurator">Advanced Configurator</div>
  },
}))

const mockPush = jest.fn()
const mockBack = jest.fn()
const stableSearchParams = new URLSearchParams()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: mockBack,
    forward: jest.fn(),
  }),
  useSearchParams: () => stableSearchParams,
  usePathname: () => '/game/select',
}))

import GameSelectPage from '@/app/game/select/page'

describe('GameSelectPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Rendering', () => {
    it('renders the page title', () => {
      render(<GameSelectPage />)
      expect(screen.getByText('SELECT GAME MODE')).toBeInTheDocument()
    })

    it('renders greeting with player name', () => {
      render(<GameSelectPage />)
      expect(screen.getByText(/choose your trivia adventure, Player1234/i)).toBeInTheDocument()
    })

    it('renders all three game mode cards', () => {
      render(<GameSelectPage />)
      expect(screen.getByText('QUICK GAME')).toBeInTheDocument()
      expect(screen.getByText('CUSTOM GAME')).toBeInTheDocument()
      expect(screen.getByText('ADVANCED GAME')).toBeInTheDocument()
    })

    it('renders game mode descriptions', () => {
      render(<GameSelectPage />)
      expect(screen.getByText(/jump into instant trivia/i)).toBeInTheDocument()
      expect(screen.getByText(/create ai-powered questions/i)).toBeInTheDocument()
      expect(screen.getByText(/upload your own documents/i)).toBeInTheDocument()
    })

    it('renders game mode icons', () => {
      render(<GameSelectPage />)
      expect(screen.getByText('⚡')).toBeInTheDocument()
      expect(screen.getAllByText('🤖').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('📚')).toBeInTheDocument()
    })

    it('renders footer', () => {
      render(<GameSelectPage />)
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('renders player avatar', () => {
      render(<GameSelectPage />)
      // Default avatar renders an emoji with role="img"
      const avatarEmojis = screen.getAllByRole('img')
      expect(avatarEmojis.length).toBeGreaterThan(0)
    })
  })

  describe('Game mode selection', () => {
    it('shows play options after selecting quick game', () => {
      render(<GameSelectPage />)
      fireEvent.click(screen.getByText('QUICK GAME'))
      expect(screen.getByText(/QUICK GAME SELECTED/i)).toBeInTheDocument()
    })

    it('shows play options after selecting custom game', () => {
      render(<GameSelectPage />)
      fireEvent.click(screen.getByText('CUSTOM GAME'))
      expect(screen.getByText(/CUSTOM GAME SELECTED/i)).toBeInTheDocument()
    })

    it('shows play options after selecting advanced game', () => {
      render(<GameSelectPage />)
      fireEvent.click(screen.getByText('ADVANCED GAME'))
      expect(screen.getByText(/ADVANCED GAME SELECTED/i)).toBeInTheDocument()
    })

    it('shows solo, create, and join options after mode selection', () => {
      render(<GameSelectPage />)
      fireEvent.click(screen.getByText('QUICK GAME'))
      expect(screen.getByText('PLAY SOLO')).toBeInTheDocument()
      expect(screen.getByText('CREATE ROOM')).toBeInTheDocument()
      expect(screen.getByText('JOIN ROOM')).toBeInTheDocument()
    })

    it('shows advanced configurator when advanced mode selected', () => {
      render(<GameSelectPage />)
      fireEvent.click(screen.getByText('ADVANCED GAME'))
      expect(screen.getByTestId('advanced-configurator')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('navigates to /game/quick when solo quick game selected', () => {
      render(<GameSelectPage />)
      fireEvent.click(screen.getByText('QUICK GAME'))
      fireEvent.click(screen.getByText('PLAY SOLO'))
      expect(mockPush).toHaveBeenCalledWith('/game/quick')
    })

    it('navigates to /game/custom when solo custom game selected', () => {
      render(<GameSelectPage />)
      fireEvent.click(screen.getByText('CUSTOM GAME'))
      fireEvent.click(screen.getByText('PLAY SOLO'))
      expect(mockPush).toHaveBeenCalledWith('/game/custom')
    })

    it('navigates to /game/create with params when creating room', () => {
      render(<GameSelectPage />)
      fireEvent.click(screen.getByText('QUICK GAME'))
      fireEvent.click(screen.getByText('CREATE ROOM'))
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/game/create'))
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('mode=quick'))
    })

    it('navigates to /game/join with params when joining room', () => {
      render(<GameSelectPage />)
      fireEvent.click(screen.getByText('QUICK GAME'))
      fireEvent.click(screen.getByText('JOIN ROOM'))
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/game/join'))
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('mode=quick'))
    })
  })

  describe('Accessibility', () => {
    it('has heading structure', () => {
      render(<GameSelectPage />)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('has main as the root element', () => {
      const { container } = render(<GameSelectPage />)
      expect(container.querySelector('main')).toBeInTheDocument()
    })

    it('game mode buttons are interactive', () => {
      render(<GameSelectPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Keyboard navigation', () => {
    it('navigates back on Escape key when game mode selected', () => {
      render(<GameSelectPage />)
      fireEvent.click(screen.getByText('QUICK GAME'))
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/game/mode'))
    })
  })
})
