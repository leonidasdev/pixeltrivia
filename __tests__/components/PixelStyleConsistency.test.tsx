/**
 * Pixel Art Style Consistency Tests
 *
 * Verifies that all UI components and pages use the pixel-art design system
 * consistently: font-pixel headings, font-pixel-body text, pixel-border
 * containers, pixel-shadow/pixel-glow-hover on interactive elements,
 * and no rounded-lg/rounded-md on primary UI elements.
 *
 * @module __tests__/components/PixelStyleConsistency.test
 * @since 1.2.0
 */

import React from 'react'
import { render, screen } from '@testing-library/react'

// ─── Mock next/navigation ──────────────────────────────────────────────────
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}))

// ─── Mock hooks ────────────────────────────────────────────────────────────
jest.mock('@/hooks', () => ({
  useSound: () => ({
    play: jest.fn(),
    enabled: true,
    muted: false,
    volume: 50,
    setVolume: jest.fn(),
    toggleMute: jest.fn(),
    toggleEnabled: jest.fn(),
  }),
  usePlayerSettings: () => ({
    playerName: 'TestPlayer',
    avatar: 'knight',
    volume: 50,
    setPlayerName: jest.fn(),
    setAvatar: jest.fn(),
    setVolume: jest.fn(),
  }),
}))

// ─── Mock multiplayer API ──────────────────────────────────────────────────
jest.mock('@/lib/multiplayerApi', () => ({
  createRoom: jest.fn().mockResolvedValue({ success: false, error: 'test' }),
  joinRoom: jest.fn().mockResolvedValue({ success: false, error: 'test' }),
}))

// ─── Mock custom quiz API ──────────────────────────────────────────────────
jest.mock('@/lib/customQuizApi', () => ({
  generateCustomQuiz: jest.fn().mockResolvedValue({ success: false, error: 'test' }),
}))

// ─── Mock logger ───────────────────────────────────────────────────────────
jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

// ─── Mock HelpContext ──────────────────────────────────────────────────────
jest.mock('@/app/components/help/HelpContext', () => ({
  useHelpContext: () => ({
    currentRoute: '/',
    getAvailableHelpTabs: () => ['general', 'quick', 'custom', 'advanced'],
  }),
}))

// ─── Imports ───────────────────────────────────────────────────────────────
import QuickGameSelector from '@/app/components/QuickGameSelector'
import ErrorBoundary from '@/app/components/ErrorBoundary'
import { HelpModal } from '@/app/components/help/HelpModal'
import NotFound from '@/app/not-found'
import ErrorPage from '@/app/error'

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Check that an element's className includes at least one of the expected classes
 */
function expectClassOnElement(element: HTMLElement, ...classes: string[]) {
  const found = classes.some(cls => element.className.includes(cls))
  if (!found) {
    throw new Error(
      `Expected element to have one of [${classes.join(', ')}] but got: "${element.className}"`
    )
  }
}

/**
 * Collect all elements and verify none use rounded-lg/rounded-md on primary UI containers
 */
function assertNoRoundedOnPrimaryContainers(container: HTMLElement) {
  const allElements = container.querySelectorAll('*')
  const violations: string[] = []

  allElements.forEach(el => {
    const classes = el.className
    if (typeof classes !== 'string') return

    // Skip elements that are clearly internal/minor (like svg, path, etc.)
    const tag = el.tagName.toLowerCase()
    if (['svg', 'path', 'circle', 'rect', 'line', 'g'].includes(tag)) return

    // Check for rounded-lg or rounded-md on container-like elements
    if (
      (classes.includes('rounded-lg') || classes.includes('rounded-md')) &&
      (classes.includes('border-4') || classes.includes('border-3') || classes.includes('border-2'))
    ) {
      violations.push(`<${tag}> has rounded + border: "${classes.substring(0, 100)}"`)
    }
  })

  return violations
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('Pixel Art Style Consistency', () => {
  describe('QuickGameSelector', () => {
    it('uses font-pixel on heading', () => {
      render(<QuickGameSelector onCategorySelected={jest.fn()} onCancel={jest.fn()} />)
      const heading = screen.getByText('QUICK GAME')
      expectClassOnElement(heading, 'font-pixel')
    })

    it('uses pixel-border on main container', () => {
      const { container } = render(
        <QuickGameSelector onCategorySelected={jest.fn()} onCancel={jest.fn()} />
      )
      const mainDiv = container.firstElementChild as HTMLElement
      expect(mainDiv.className).toContain('pixel-border')
    })

    it('uses font-pixel-body on description text', () => {
      render(<QuickGameSelector onCategorySelected={jest.fn()} onCancel={jest.fn()} />)
      const desc = screen.getByText(/Choose your difficulty level/)
      expectClassOnElement(desc, 'font-pixel-body')
    })

    it('has no rounded-lg on bordered containers', () => {
      const { container } = render(
        <QuickGameSelector onCategorySelected={jest.fn()} onCancel={jest.fn()} />
      )
      const violations = assertNoRoundedOnPrimaryContainers(container)
      expect(violations).toEqual([])
    })
  })

  describe('HelpModal', () => {
    it('uses font-pixel on modal title', () => {
      render(<HelpModal isOpen={true} onClose={jest.fn()} />)
      const title = screen.getByText('Help & Information')
      expectClassOnElement(title, 'font-pixel')
    })

    it('uses font-pixel on tab buttons', () => {
      render(<HelpModal isOpen={true} onClose={jest.fn()} />)
      const generalTab = screen.getByRole('button', { name: /general/i })
      expectClassOnElement(generalTab, 'font-pixel')
    })

    it('uses pixel-border on the modal container', () => {
      render(<HelpModal isOpen={true} onClose={jest.fn()} />)
      const modal = screen.getByText('Help & Information').closest('[class*="pixel-border"]')
      expect(modal).toBeTruthy()
    })

    it('uses font-pixel-body on content paragraphs', () => {
      render(<HelpModal isOpen={true} onClose={jest.fn()} />)
      const content = screen.getByText(/Fast-paced trivia with preset questions/)
      expectClassOnElement(content, 'font-pixel-body')
    })

    it('has no rounded-lg on bordered containers', () => {
      const { container } = render(<HelpModal isOpen={true} onClose={jest.fn()} />)
      const violations = assertNoRoundedOnPrimaryContainers(container)
      expect(violations).toEqual([])
    })
  })

  describe('NotFound page', () => {
    it('uses font-pixel on 404 heading', () => {
      render(<NotFound />)
      const heading = screen.getByText('404')
      expectClassOnElement(heading, 'font-pixel')
    })

    it('uses font-pixel-body on description', () => {
      render(<NotFound />)
      const desc = screen.getByText(/Looks like this page went on an adventure/)
      expectClassOnElement(desc, 'font-pixel-body')
    })

    it('uses pixel-border on container', () => {
      const { container } = render(<NotFound />)
      const pixelBorderEl = container.querySelector('.pixel-border')
      expect(pixelBorderEl).toBeTruthy()
    })

    it('buttons use font-pixel and pixel-border', () => {
      render(<NotFound />)
      const mainMenuLink = screen.getByText(/MAIN MENU/)
      expectClassOnElement(mainMenuLink, 'font-pixel')
      expectClassOnElement(mainMenuLink, 'pixel-border')
    })

    it('has no rounded-lg on bordered containers', () => {
      const { container } = render(<NotFound />)
      const violations = assertNoRoundedOnPrimaryContainers(container)
      expect(violations).toEqual([])
    })
  })

  describe('Error page', () => {
    const mockReset = jest.fn()
    const mockError = new Error('Test error') as Error & { digest?: string }

    it('uses font-pixel on heading', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />)
      const heading = screen.getByText('Something Went Wrong')
      expectClassOnElement(heading, 'font-pixel')
    })

    it('uses font-pixel-body on description', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />)
      const desc = screen.getByText(/We hit a snag/)
      expectClassOnElement(desc, 'font-pixel-body')
    })

    it('buttons use font-pixel and pixel-border', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />)
      const tryAgainBtn = screen.getByText(/Try Again/)
      expectClassOnElement(tryAgainBtn, 'font-pixel')
      expectClassOnElement(tryAgainBtn, 'pixel-border')
    })

    it('has no rounded-lg on bordered containers', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />)
      const violations = assertNoRoundedOnPrimaryContainers(container)
      expect(violations).toEqual([])
    })
  })

  describe('ErrorBoundary DefaultErrorFallback', () => {
    it('renders pixel-styled fallback on error', () => {
      const ThrowError = () => {
        throw new Error('Test error')
      }

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      // Should show the GAME OVER heading
      const heading = screen.getByText('GAME OVER')
      expectClassOnElement(heading, 'font-pixel')

      // Container should have pixel-border
      const pixelBorderEl = container.querySelector('.pixel-border')
      expect(pixelBorderEl).toBeTruthy()

      // Buttons should have pixel styling
      const tryAgainBtn = screen.getByText(/Try Again/)
      expectClassOnElement(tryAgainBtn, 'font-pixel')
      expectClassOnElement(tryAgainBtn, 'pixel-border')

      consoleSpy.mockRestore()
    })
  })

  describe('Cross-component pixel-art class consistency', () => {
    it('all pixel headings use pixel-text-shadow', () => {
      // NotFound
      const { unmount: u1 } = render(<NotFound />)
      const h404 = screen.getByText('404')
      expectClassOnElement(h404, 'pixel-text-shadow')
      u1()

      // Error
      const mockError = new Error('Test') as Error & { digest?: string }
      const { unmount: u2 } = render(<ErrorPage error={mockError} reset={jest.fn()} />)
      const hErr = screen.getByText('Something Went Wrong')
      expectClassOnElement(hErr, 'pixel-text-shadow')
      u2()

      // HelpModal
      const { unmount: u3 } = render(<HelpModal isOpen={true} onClose={jest.fn()} />)
      const hHelp = screen.getByText('Help & Information')
      expectClassOnElement(hHelp, 'pixel-text-shadow')
      u3()

      // QuickGameSelector
      render(<QuickGameSelector onCategorySelected={jest.fn()} onCancel={jest.fn()} />)
      const hQuick = screen.getByText('QUICK GAME')
      expectClassOnElement(hQuick, 'pixel-text-shadow')
    })

    it('interactive buttons use pixel-glow-hover for hover effects', () => {
      // NotFound
      const { container } = render(<NotFound />)
      const buttons = container.querySelectorAll('[class*="pixel-glow-hover"]')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})
