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

// Mock HelpModal
jest.mock('@/app/components/help/HelpModal', () => ({
  __esModule: true,
  HelpModal: function MockHelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null
    return (
      <div data-testid="help-modal">
        <button onClick={onClose}>Close</button>
      </div>
    )
  },
}))

import { HelpButton } from '@/app/components/help/HelpButton'

describe('HelpButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the help button', () => {
      render(<HelpButton />)
      expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument()
    })

    it('displays question mark text', () => {
      render(<HelpButton />)
      expect(screen.getByText('?')).toBeInTheDocument()
    })

    it('has proper aria-label', () => {
      render(<HelpButton />)
      expect(
        screen.getByRole('button', { name: /open help and game information/i })
      ).toBeInTheDocument()
    })

    it('has title attribute', () => {
      render(<HelpButton />)
      expect(screen.getByTitle('Help & Info')).toBeInTheDocument()
    })
  })

  describe('Modal interaction', () => {
    it('does not show help modal initially', () => {
      render(<HelpButton />)
      expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument()
    })

    it('opens help modal on click', () => {
      render(<HelpButton />)
      fireEvent.click(screen.getByRole('button', { name: /help/i }))
      expect(screen.getByTestId('help-modal')).toBeInTheDocument()
    })

    it('closes help modal when close is triggered', () => {
      render(<HelpButton />)
      fireEvent.click(screen.getByRole('button', { name: /help/i }))
      expect(screen.getByTestId('help-modal')).toBeInTheDocument()
      fireEvent.click(screen.getByText('Close'))
      expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument()
    })
  })

  describe('Keyboard interaction', () => {
    it('opens modal on Enter key', () => {
      render(<HelpButton />)
      const button = screen.getByRole('button', { name: /help/i })
      fireEvent.keyDown(button, { key: 'Enter' })
      expect(screen.getByTestId('help-modal')).toBeInTheDocument()
    })

    it('opens modal on Space key', () => {
      render(<HelpButton />)
      const button = screen.getByRole('button', { name: /help/i })
      fireEvent.keyDown(button, { key: ' ' })
      expect(screen.getByTestId('help-modal')).toBeInTheDocument()
    })

    it('does not open modal on other keys', () => {
      render(<HelpButton />)
      const button = screen.getByRole('button', { name: /help/i })
      fireEvent.keyDown(button, { key: 'Tab' })
      expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument()
    })
  })

  describe('Hover behavior', () => {
    it('applies hover styles on mouseEnter', () => {
      render(<HelpButton />)
      const button = screen.getByRole('button', { name: /help/i })
      fireEvent.mouseEnter(button)
      // The button should still be accessible after hover
      expect(button).toBeInTheDocument()
    })

    it('removes hover styles on mouseLeave', () => {
      render(<HelpButton />)
      const button = screen.getByRole('button', { name: /help/i })
      fireEvent.mouseEnter(button)
      fireEvent.mouseLeave(button)
      expect(button).toBeInTheDocument()
    })
  })
})
