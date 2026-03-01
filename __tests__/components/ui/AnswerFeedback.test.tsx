/**
 * Tests for AnswerFeedback and AnswerOptionHighlight components
 *
 * @module __tests__/components/ui/AnswerFeedback.test
 */

import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { AnswerFeedback, AnswerOptionHighlight } from '@/app/components/ui/AnswerFeedback'

// ── AnswerFeedback ──

describe('AnswerFeedback', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('renders nothing when type is null', () => {
    const { container } = render(<AnswerFeedback type={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders correct feedback', () => {
    render(<AnswerFeedback type="correct" />)
    expect(screen.getByText('CORRECT!')).toBeInTheDocument()
    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('renders wrong feedback', () => {
    render(<AnswerFeedback type="wrong" />)
    expect(screen.getByText('WRONG!')).toBeInTheDocument()
    expect(screen.getByText('X')).toBeInTheDocument()
  })

  it('renders timeout feedback', () => {
    render(<AnswerFeedback type="timeout" />)
    expect(screen.getByText("TIME'S UP!")).toBeInTheDocument()
    expect(screen.getByText('TIME')).toBeInTheDocument()
  })

  it('uses custom message when provided', () => {
    render(<AnswerFeedback type="correct" message="Great job!" />)
    expect(screen.getByText('Great job!')).toBeInTheDocument()
  })

  it('has status role and assertive aria-live', () => {
    render(<AnswerFeedback type="correct" />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'assertive')
  })

  it('calls onComplete after duration', () => {
    const onComplete = jest.fn()
    render(<AnswerFeedback type="correct" duration={500} onComplete={onComplete} />)
    expect(onComplete).not.toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(500))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('uses default duration of 1500ms', () => {
    const onComplete = jest.fn()
    render(<AnswerFeedback type="wrong" onComplete={onComplete} />)
    act(() => jest.advanceTimersByTime(1499))
    expect(onComplete).not.toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(1))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('hides after duration expires', () => {
    render(<AnswerFeedback type="correct" duration={500} />)
    expect(screen.getByText('CORRECT!')).toBeInTheDocument()
    act(() => jest.advanceTimersByTime(500))
    expect(screen.queryByText('CORRECT!')).not.toBeInTheDocument()
  })

  it('cleans up timer on unmount', () => {
    const onComplete = jest.fn()
    const { unmount } = render(
      <AnswerFeedback type="correct" duration={500} onComplete={onComplete} />
    )
    unmount()
    act(() => jest.advanceTimersByTime(500))
    expect(onComplete).not.toHaveBeenCalled()
  })
})

// ── AnswerOptionHighlight ──

describe('AnswerOptionHighlight', () => {
  it('renders children without highlight when not revealed', () => {
    render(
      <AnswerOptionHighlight isCorrect={true} isSelected={true} isRevealed={false}>
        <span>Option A</span>
      </AnswerOptionHighlight>
    )
    expect(screen.getByText('Option A')).toBeInTheDocument()
  })

  it('applies correct highlight when revealed and correct', () => {
    const { container } = render(
      <AnswerOptionHighlight isCorrect={true} isSelected={true} isRevealed={true}>
        <span>Option A</span>
      </AnswerOptionHighlight>
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('border-green-400')
    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('applies wrong highlight when revealed and selected but incorrect', () => {
    const { container } = render(
      <AnswerOptionHighlight isCorrect={false} isSelected={true} isRevealed={true}>
        <span>Option B</span>
      </AnswerOptionHighlight>
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('border-red-400')
  })

  it('dims unselected incorrect options when revealed', () => {
    const { container } = render(
      <AnswerOptionHighlight isCorrect={false} isSelected={false} isRevealed={true}>
        <span>Option C</span>
      </AnswerOptionHighlight>
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('opacity-50')
  })

  it('applies custom className', () => {
    const { container } = render(
      <AnswerOptionHighlight
        isCorrect={false}
        isSelected={false}
        isRevealed={false}
        className="custom-class"
      >
        <span>Option D</span>
      </AnswerOptionHighlight>
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('custom-class')
  })
})
