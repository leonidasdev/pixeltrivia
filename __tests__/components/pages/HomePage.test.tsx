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

import HomePage from '@/app/page'

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the game title', () => {
      render(<HomePage />)
      expect(screen.getByText('PIXEL')).toBeInTheDocument()
      expect(screen.getByText('TRIVIA')).toBeInTheDocument()
    })

    it('renders the subtitle', () => {
      render(<HomePage />)
      expect(screen.getByText('~ RETRO QUIZ CHALLENGE ~')).toBeInTheDocument()
    })

    it('renders all menu buttons', () => {
      render(<HomePage />)
      expect(screen.getByRole('menuitem', { name: /start a new trivia game/i })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: /join an existing/i })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: /open player settings/i })).toBeInTheDocument()
    })

    it('renders footer with copyright', () => {
      render(<HomePage />)
      expect(screen.getByText(/© 2026 PixelTrivia/)).toBeInTheDocument()
    })
  })

  describe('Settings modal', () => {
    it('opens settings modal when settings button is clicked', async () => {
      render(<HomePage />)

      const settingsBtn = screen.getByRole('menuitem', { name: /open player settings/i })
      fireEvent.click(settingsBtn)

      await waitFor(() => {
        expect(screen.getByText('⚙️ PLAYER SETTINGS')).toBeInTheDocument()
      })
    })

    it('shows player name input in settings', async () => {
      render(<HomePage />)

      fireEvent.click(screen.getByRole('menuitem', { name: /open player settings/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/player name/i)).toBeInTheDocument()
      })
    })
  })

  describe('Validation', () => {
    it('shows warning toast when starting game with empty name', () => {
      render(<HomePage />)

      // Clear auto-generated name by opening settings and clearing it
      fireEvent.click(screen.getByRole('menuitem', { name: /open player settings/i }))

      const nameInput = screen.getByLabelText(/player name/i)
      fireEvent.change(nameInput, { target: { value: '' } })

      // Close modal and try to start
      fireEvent.click(screen.getByRole('menuitem', { name: /start a new trivia game/i }))

      // Should show validation error in settings modal
      expect(screen.getByText(/before starting a game/i)).toBeInTheDocument()
    })
  })

  describe('Navigation structure', () => {
    it('has a nav element with role="menu"', () => {
      render(<HomePage />)
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('has main as the root element', () => {
      const { container } = render(<HomePage />)
      expect(container.querySelector('main')).toBeInTheDocument()
    })
  })
})
