/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock Footer component
jest.mock('@/app/components/Footer', () => ({
  __esModule: true,
  default: function MockFooter() {
    return <div data-testid="footer">Footer</div>
  },
}))

import GameModePage from '@/app/game/mode/page'

describe('GameModePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Rendering', () => {
    it('renders the page title', () => {
      render(<GameModePage />)
      expect(screen.getByText('SELECT GAME MODE')).toBeInTheDocument()
    })

    it('renders all three game mode cards', () => {
      render(<GameModePage />)
      expect(screen.getByText('QUICK GAME')).toBeInTheDocument()
      expect(screen.getByText('CUSTOM GAME')).toBeInTheDocument()
      expect(screen.getByText('ADVANCED GAME')).toBeInTheDocument()
    })

    it('renders game mode descriptions', () => {
      render(<GameModePage />)
      expect(screen.getByText(/jump into instant trivia/i)).toBeInTheDocument()
      expect(screen.getByText(/create ai-powered questions/i)).toBeInTheDocument()
      expect(screen.getByText(/upload your own documents/i)).toBeInTheDocument()
    })

    it('renders game mode icons', () => {
      render(<GameModePage />)
      expect(screen.getByText('⚡')).toBeInTheDocument()
      // 🤖 appears twice: Custom Game icon + default robot avatar
      expect(screen.getAllByText('🤖').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('📚')).toBeInTheDocument()
    })

    it('renders footer', () => {
      render(<GameModePage />)
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })
  })

  describe('Player info', () => {
    it('shows player name from defaults', () => {
      render(<GameModePage />)
      // Default name from mock useSearchParams (empty) falls back to localStorage or "Player1234"
      expect(screen.getByText('Player1234')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has header and heading structure', () => {
      render(<GameModePage />)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('game mode buttons are interactive', () => {
      render(<GameModePage />)
      const buttons = screen.getAllByRole('button')
      // Should have at least 3 game mode buttons
      expect(buttons.length).toBeGreaterThanOrEqual(3)
    })
  })
})
