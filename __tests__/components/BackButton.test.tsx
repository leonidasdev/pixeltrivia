/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'

// We need to mock usePathname per test
const mockBack = jest.fn()
const mockUsePathname = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: mockBack,
    forward: jest.fn(),
  }),
  usePathname: () => mockUsePathname(),
}))

import BackButton from '@/app/components/BackButton'

describe('BackButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Visibility', () => {
    it('returns null on home page (/)', () => {
      mockUsePathname.mockReturnValue('/')
      const { container } = render(<BackButton />)
      expect(container.innerHTML).toBe('')
    })

    it('returns null on play routes', () => {
      mockUsePathname.mockReturnValue('/game/play')
      const { container } = render(<BackButton />)
      expect(container.innerHTML).toBe('')
    })

    it('returns null on nested play routes', () => {
      mockUsePathname.mockReturnValue('/game/play/results')
      const { container } = render(<BackButton />)
      expect(container.innerHTML).toBe('')
    })

    it('renders on game mode page', () => {
      mockUsePathname.mockReturnValue('/game/mode')
      render(<BackButton />)
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
    })

    it('renders on game select page', () => {
      mockUsePathname.mockReturnValue('/game/select')
      render(<BackButton />)
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('calls router.back() on click', () => {
      mockUsePathname.mockReturnValue('/game/mode')
      render(<BackButton />)

      screen.getByRole('button', { name: /go back/i }).click()
      expect(mockBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('has correct aria-label', () => {
      mockUsePathname.mockReturnValue('/game/mode')
      render(<BackButton />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Go back to previous page')
    })

    it('has title attribute', () => {
      mockUsePathname.mockReturnValue('/game/mode')
      render(<BackButton />)

      expect(screen.getByTitle('Go back')).toBeInTheDocument()
    })

    it('has aria-hidden on decorative arrow', () => {
      mockUsePathname.mockReturnValue('/game/mode')
      render(<BackButton />)

      const arrow = screen.getByText('←')
      expect(arrow).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
