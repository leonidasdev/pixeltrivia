/**
 * Tests for MainMenuLogo Component
 *
 * @module __tests__/components/MainMenuLogo
 * @since 1.0.0
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import MainMenuLogo from '@/app/components/MainMenuLogo'

// Mock next/navigation
const mockPush = jest.fn()
let mockPathname = '/game/mode'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}))

describe('MainMenuLogo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname = '/game/mode'
  })

  describe('Rendering', () => {
    it('should render on non-play pages', () => {
      render(<MainMenuLogo />)
      expect(screen.getByRole('button', { name: /main menu/i })).toBeInTheDocument()
    })

    it('should show PIXEL text', () => {
      render(<MainMenuLogo />)
      expect(screen.getByText('PIXEL')).toBeInTheDocument()
    })

    it('should show TRIVIA text', () => {
      render(<MainMenuLogo />)
      expect(screen.getByText('TRIVIA')).toBeInTheDocument()
    })

    it('should show game emoji', () => {
      render(<MainMenuLogo />)
      expect(screen.getByText('🎮')).toBeInTheDocument()
    })

    it('should have correct aria-label', () => {
      render(<MainMenuLogo />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'PixelTrivia - Go to main menu')
    })
  })

  describe('Hidden on Play Pages', () => {
    it('should not render on /play path', () => {
      mockPathname = '/game/play/ABC123'
      const { container } = render(<MainMenuLogo />)
      expect(container.innerHTML).toBe('')
    })

    it('should not render on any path containing /play', () => {
      mockPathname = '/game/play/room123'
      const { container } = render(<MainMenuLogo />)
      expect(container.innerHTML).toBe('')
    })

    it('should render on /game/create', () => {
      mockPathname = '/game/create'
      render(<MainMenuLogo />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate to home on click', () => {
      render(<MainMenuLogo />)
      fireEvent.click(screen.getByRole('button'))
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('should navigate on Enter key', () => {
      render(<MainMenuLogo />)
      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('should navigate on Space key', () => {
      render(<MainMenuLogo />)
      fireEvent.keyDown(screen.getByRole('button'), { key: ' ' })
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('should not navigate on other keys', () => {
      render(<MainMenuLogo />)
      fireEvent.keyDown(screen.getByRole('button'), { key: 'Tab' })
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Hover State', () => {
    it('should change style on mouseEnter', () => {
      render(<MainMenuLogo />)
      const button = screen.getByRole('button')

      fireEvent.mouseEnter(button)
      expect(button.className).toContain('scale-105')
    })

    it('should reset style on mouseLeave', () => {
      render(<MainMenuLogo />)
      const button = screen.getByRole('button')

      fireEvent.mouseEnter(button)
      fireEvent.mouseLeave(button)
      expect(button.className).toContain('hover:scale-105')
    })
  })
})
