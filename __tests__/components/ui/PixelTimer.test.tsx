/**
 * Tests for PixelTimer component
 *
 * @module __tests__/components/ui/PixelTimer.test
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { PixelTimer } from '@/app/components/ui/PixelTimer'

describe('PixelTimer', () => {
  it('renders time remaining', () => {
    render(<PixelTimer timeRemaining={25} totalTime={30} />)
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  it('has timer role with aria-label', () => {
    render(<PixelTimer timeRemaining={10} totalTime={30} />)
    const timer = screen.getByRole('timer')
    expect(timer).toHaveAttribute('aria-label', '10 seconds remaining')
  })

  // ── Visual states ──

  it('shows cyan (normal) state when time is ample', () => {
    const { container } = render(<PixelTimer timeRemaining={25} totalTime={30} />)
    expect(container.firstChild).toHaveClass('border-cyan-500/50')
    expect(screen.getByText('TIME')).toBeInTheDocument()
  })

  it('shows yellow (warning) state at 30% remaining', () => {
    // 30% of 30 = 9, so 9 seconds remaining triggers warning
    const { container } = render(<PixelTimer timeRemaining={9} totalTime={30} />)
    expect(container.firstChild).toHaveClass('border-yellow-500')
    expect(screen.getByText('BOLT')).toBeInTheDocument()
  })

  it('shows red (critical) state at 15% remaining', () => {
    // 15% of 30 = 4.5, so 4 seconds remaining triggers critical
    const { container } = render(<PixelTimer timeRemaining={4} totalTime={30} />)
    expect(container.firstChild).toHaveClass('border-red-500')
    expect(screen.getByText('FIRE')).toBeInTheDocument()
  })

  // ── Sizes ──

  it('uses medium size by default', () => {
    render(<PixelTimer timeRemaining={10} totalTime={30} />)
    const timer = screen.getByRole('timer')
    expect(timer).toHaveClass('px-4', 'py-2')
  })

  it('renders small variant', () => {
    render(<PixelTimer timeRemaining={10} totalTime={30} size="sm" />)
    const timer = screen.getByRole('timer')
    expect(timer).toHaveClass('px-3', 'py-1')
  })

  it('renders large variant', () => {
    render(<PixelTimer timeRemaining={10} totalTime={30} size="lg" />)
    const timer = screen.getByRole('timer')
    expect(timer).toHaveClass('px-6', 'py-3')
  })

  // ── Progress bar ──

  it('shows progress bar by default', () => {
    render(<PixelTimer timeRemaining={15} totalTime={30} />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '15')
    expect(progressbar).toHaveAttribute('aria-valuemax', '30')
  })

  it('hides progress bar when showProgress is false', () => {
    render(<PixelTimer timeRemaining={15} totalTime={30} showProgress={false} />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  // ── Edge cases ──

  it('handles zero totalTime without crashing', () => {
    render(<PixelTimer timeRemaining={0} totalTime={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<PixelTimer timeRemaining={10} totalTime={30} className="custom-timer" />)
    const timer = screen.getByRole('timer')
    expect(timer).toHaveClass('custom-timer')
  })
})
