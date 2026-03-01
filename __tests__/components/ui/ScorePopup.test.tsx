/**
 * Tests for ScorePopup component
 *
 * @module __tests__/components/ui/ScorePopup.test
 */

import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { ScorePopup } from '@/app/components/ui/ScorePopup'

describe('ScorePopup', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('renders nothing when show is false', () => {
    const { container } = render(<ScorePopup score={100} show={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders positive score with + prefix', () => {
    render(<ScorePopup score={100} show={true} />)
    expect(screen.getByText('+100', { exact: false })).toBeInTheDocument()
  })

  it('renders negative score without + prefix', () => {
    render(<ScorePopup score={-25} show={true} />)
    expect(screen.getByText('-25', { exact: false })).toBeInTheDocument()
  })

  it('renders zero score without prefix', () => {
    render(<ScorePopup score={0} show={true} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('applies green color for positive scores', () => {
    const { container } = render(<ScorePopup score={50} show={true} />)
    expect(container.firstChild).toHaveClass('text-green-400')
  })

  it('applies red color for negative scores', () => {
    const { container } = render(<ScorePopup score={-10} show={true} />)
    expect(container.firstChild).toHaveClass('text-red-400')
  })

  it('applies gray color for zero score', () => {
    const { container } = render(<ScorePopup score={0} show={true} />)
    expect(container.firstChild).toHaveClass('text-gray-400')
  })

  it('is hidden from screen readers', () => {
    const { container } = render(<ScorePopup score={100} show={true} />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('calls onComplete after animation', () => {
    const onComplete = jest.fn()
    render(<ScorePopup score={100} show={true} onComplete={onComplete} />)
    expect(onComplete).not.toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(1000))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('hides after animation completes', () => {
    render(<ScorePopup score={100} show={true} />)
    expect(screen.getByText('+100', { exact: false })).toBeInTheDocument()
    act(() => jest.advanceTimersByTime(1000))
    expect(screen.queryByText('+100', { exact: false })).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<ScorePopup score={100} show={true} className="top-10 left-5" />)
    expect(container.firstChild).toHaveClass('top-10')
    expect(container.firstChild).toHaveClass('left-5')
  })
})
