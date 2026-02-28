/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, act } from '@testing-library/react'

// Override usePathname mock for these tests
let mockPathname = '/'
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => mockPathname,
}))

import { HelpProvider, useHelpContext } from '@/app/components/help/HelpContext'

// Test consumer component
function TestConsumer() {
  const { visitedRoutes, currentRoute, getAvailableHelpTabs } = useHelpContext()
  const tabs = getAvailableHelpTabs()
  return (
    <div>
      <span data-testid="current-route">{currentRoute}</span>
      <span data-testid="visited-count">{visitedRoutes.length}</span>
      <span data-testid="visited-routes">{visitedRoutes.join(',')}</span>
      <span data-testid="available-tabs">{tabs.join(',')}</span>
    </div>
  )
}

describe('HelpContext', () => {
  beforeEach(() => {
    mockPathname = '/'
  })

  describe('HelpProvider', () => {
    it('provides current route', () => {
      mockPathname = '/game/mode'
      render(
        <HelpProvider>
          <TestConsumer />
        </HelpProvider>
      )
      expect(screen.getByTestId('current-route').textContent).toBe('/game/mode')
    })

    it('tracks visited routes', () => {
      mockPathname = '/'
      render(
        <HelpProvider>
          <TestConsumer />
        </HelpProvider>
      )
      expect(screen.getByTestId('visited-routes').textContent).toContain('/')
    })

    it('always includes general tab', () => {
      render(
        <HelpProvider>
          <TestConsumer />
        </HelpProvider>
      )
      expect(screen.getByTestId('available-tabs').textContent).toContain('general')
    })

    it('includes quick tab when game/mode visited', () => {
      mockPathname = '/game/mode'
      render(
        <HelpProvider>
          <TestConsumer />
        </HelpProvider>
      )
      expect(screen.getByTestId('available-tabs').textContent).toContain('quick')
    })

    it('includes quick tab when game/quick visited', () => {
      mockPathname = '/game/quick'
      render(
        <HelpProvider>
          <TestConsumer />
        </HelpProvider>
      )
      expect(screen.getByTestId('available-tabs').textContent).toContain('quick')
    })

    it('includes custom tab when game/custom visited', () => {
      mockPathname = '/game/custom'
      render(
        <HelpProvider>
          <TestConsumer />
        </HelpProvider>
      )
      expect(screen.getByTestId('available-tabs').textContent).toContain('custom')
    })

    it('includes custom tab when game/create visited', () => {
      mockPathname = '/game/create'
      render(
        <HelpProvider>
          <TestConsumer />
        </HelpProvider>
      )
      expect(screen.getByTestId('available-tabs').textContent).toContain('custom')
    })

    it('includes advanced tab when game/advanced visited', () => {
      mockPathname = '/game/advanced'
      render(
        <HelpProvider>
          <TestConsumer />
        </HelpProvider>
      )
      expect(screen.getByTestId('available-tabs').textContent).toContain('advanced')
    })

    it('does not include quick tab on home page', () => {
      mockPathname = '/'
      render(
        <HelpProvider>
          <TestConsumer />
        </HelpProvider>
      )
      expect(screen.getByTestId('available-tabs').textContent).not.toContain('quick')
    })
  })

  describe('useHelpContext', () => {
    it('throws when used outside provider', () => {
      // Suppress console.error for this test
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
      expect(() => render(<TestConsumer />)).toThrow(
        'useHelpContext must be used within a HelpProvider'
      )
      spy.mockRestore()
    })
  })
})
