/**
 * Tests for GamePageLayout component
 *
 * @module __tests__/components/ui/GamePageLayout.test
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { GamePageLayout } from '@/app/components/ui/GamePageLayout'

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}))

// Mock AnimatedBackground sub-components
jest.mock('@/app/components/ui/AnimatedBackground', () => ({
  PageBackground: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="page-background" className={className}>
      {children}
    </div>
  ),
  SparklesOverlay: ({ preset, className }: { preset?: string; className?: string }) => (
    <div data-testid="sparkles-overlay" data-preset={preset} className={className} />
  ),
}))

describe('GamePageLayout', () => {
  it('renders children in full background mode by default', () => {
    render(
      <GamePageLayout>
        <div data-testid="child">Hello</div>
      </GamePageLayout>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByTestId('page-background')).toBeInTheDocument()
  })

  it('renders without background when noBackground is true', () => {
    render(
      <GamePageLayout noBackground>
        <div data-testid="child">Hello</div>
      </GamePageLayout>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.queryByTestId('page-background')).not.toBeInTheDocument()
  })

  it('shows sparkles overlay in noBackground mode', () => {
    render(
      <GamePageLayout noBackground>
        <div>Content</div>
      </GamePageLayout>
    )
    expect(screen.getByTestId('sparkles-overlay')).toBeInTheDocument()
  })

  it('hides sparkles overlay when noSparkles and noBackground', () => {
    render(
      <GamePageLayout noBackground noSparkles>
        <div>Content</div>
      </GamePageLayout>
    )
    expect(screen.queryByTestId('sparkles-overlay')).not.toBeInTheDocument()
  })

  it('sets centerContent class when enabled', () => {
    const { container } = render(
      <GamePageLayout centerContent>
        <div>Content</div>
      </GamePageLayout>
    )
    const main = container.querySelector('main')
    expect(main?.className).toContain('justify-center')
  })

  it('does not set centerContent class when disabled', () => {
    const { container } = render(
      <GamePageLayout centerContent={false}>
        <div>Content</div>
      </GamePageLayout>
    )
    const main = container.querySelector('main')
    expect(main?.className).not.toContain('justify-center')
  })

  it('applies maxWidth styles', () => {
    const { container } = render(
      <GamePageLayout maxWidth="xl">
        <div>Content</div>
      </GamePageLayout>
    )
    expect(container.innerHTML).toContain('max-w-xl')
  })

  it('applies custom padding', () => {
    const { container } = render(
      <GamePageLayout padding="none">
        <div>Content</div>
      </GamePageLayout>
    )
    // 'none' padding maps to empty string; default maps to 'p-4'
    const outerDiv = container.querySelector('.relative.z-10')
    expect(outerDiv?.className).not.toContain('p-4')
  })

  it('applies className and contentClassName props', () => {
    const { container } = render(
      <GamePageLayout className="test-outer" contentClassName="test-inner">
        <div>Content</div>
      </GamePageLayout>
    )
    expect(container.innerHTML).toContain('test-outer')
    expect(container.innerHTML).toContain('test-inner')
  })

  it('renders header when provided', () => {
    render(
      <GamePageLayout header={{ title: 'Test Title' }}>
        <div>Content</div>
      </GamePageLayout>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('does not render header slot when not provided', () => {
    const { container } = render(
      <GamePageLayout>
        <div>Content</div>
      </GamePageLayout>
    )
    expect(container.querySelector('.mb-6')).toBeNull()
  })

  it('passes noSparkles to PageBackground as minimal preset', () => {
    render(
      <GamePageLayout noSparkles>
        <div>Content</div>
      </GamePageLayout>
    )
    // When noSparkles is true in full-bg mode, sparklePreset should be 'minimal'
    const bg = screen.getByTestId('page-background')
    expect(bg).toBeInTheDocument()
  })
})
