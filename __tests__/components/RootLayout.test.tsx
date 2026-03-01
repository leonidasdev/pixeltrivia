/**
 * Tests for RootLayout
 */

import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock next/font/google to avoid font loading
jest.mock('next/font/google', () => ({
  Press_Start_2P: () => ({ variable: '--font-pixel' }),
  VT323: () => ({ variable: '--font-pixel-body' }),
}))

// Mock child components
jest.mock('@/app/components/MainMenuLogo', () => ({
  __esModule: true,
  default: () => <div data-testid="logo">Logo</div>,
}))

jest.mock('@/app/components/BackButton', () => ({
  __esModule: true,
  default: () => <div data-testid="back-button">Back</div>,
}))

jest.mock('@/app/components/help', () => ({
  HelpButton: () => <button data-testid="help-button">Help</button>,
  HelpProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="help-provider">{children}</div>,
}))

import RootLayout from '@/app/layout'

describe('RootLayout', () => {
  it('renders children within main content area', () => {
    // RootLayout renders html/body which causes validateDOMNesting warnings
    // but the structure is still testable
    const { container } = render(
      <RootLayout>
        <div data-testid="child-content">Hello</div>
      </RootLayout>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('renders MainMenuLogo', () => {
    render(
      <RootLayout>
        <div>content</div>
      </RootLayout>
    )
    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })

  it('renders BackButton', () => {
    render(
      <RootLayout>
        <div>content</div>
      </RootLayout>
    )
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })

  it('renders HelpButton', () => {
    render(
      <RootLayout>
        <div>content</div>
      </RootLayout>
    )
    expect(screen.getByTestId('help-button')).toBeInTheDocument()
  })

  it('wraps content in HelpProvider', () => {
    render(
      <RootLayout>
        <div>content</div>
      </RootLayout>
    )
    expect(screen.getByTestId('help-provider')).toBeInTheDocument()
  })

  it('includes skip-to-content link for accessibility', () => {
    render(
      <RootLayout>
        <div>content</div>
      </RootLayout>
    )
    const skipLink = screen.getByText('Skip to main content')
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })

  it('has main-content id on content wrapper', () => {
    const { container } = render(
      <RootLayout>
        <div>content</div>
      </RootLayout>
    )
    expect(container.querySelector('#main-content')).toBeInTheDocument()
  })
})
