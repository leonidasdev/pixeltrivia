/**
 * Visual Effects Components Tests
 *
 * Tests for PixelConfetti, ScorePopup, AnswerFeedback, PixelTimer, PageTransition.
 *
 * @module __tests__/components/ui/VisualEffects.test.tsx
 */

import React from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ScorePopup } from '@/app/components/ui/ScorePopup'
import { AnswerFeedback, AnswerOptionHighlight } from '@/app/components/ui/AnswerFeedback'
import { PixelTimer } from '@/app/components/ui/PixelTimer'
import { PageTransition, StaggerChildren } from '@/app/components/ui/PageTransition'

// Mock canvas for confetti
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  fillStyle: '',
  globalAlpha: 1,
  imageSmoothingEnabled: true,
})) as unknown as typeof HTMLCanvasElement.prototype.getContext

describe('ScorePopup', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render positive score with + prefix', () => {
    render(<ScorePopup score={100} show={true} />)
    expect(screen.getByText('+100', { exact: false })).toBeInTheDocument()
  })

  it('should render negative score', () => {
    render(<ScorePopup score={-25} show={true} />)
    expect(screen.getByText('-25', { exact: false })).toBeInTheDocument()
  })

  it('should not render when show is false', () => {
    const { container } = render(<ScorePopup score={100} show={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('should call onComplete after timeout', () => {
    const onComplete = jest.fn()
    render(<ScorePopup score={100} show={true} onComplete={onComplete} />)

    act(() => {
      jest.advanceTimersByTime(1100)
    })

    expect(onComplete).toHaveBeenCalled()
  })
})

describe('AnswerFeedback', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render correct feedback', () => {
    render(<AnswerFeedback type="correct" />)
    expect(screen.getByText('CORRECT!')).toBeInTheDocument()
  })

  it('should render wrong feedback', () => {
    render(<AnswerFeedback type="wrong" />)
    expect(screen.getByText('WRONG!')).toBeInTheDocument()
  })

  it('should render timeout feedback', () => {
    render(<AnswerFeedback type="timeout" />)
    expect(screen.getByText("TIME'S UP!")).toBeInTheDocument()
  })

  it('should not render when type is null', () => {
    const { container } = render(<AnswerFeedback type={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render custom message', () => {
    render(<AnswerFeedback type="correct" message="Great job!" />)
    expect(screen.getByText('Great job!')).toBeInTheDocument()
  })

  it('should call onComplete after duration', () => {
    const onComplete = jest.fn()
    render(<AnswerFeedback type="correct" duration={500} onComplete={onComplete} />)

    act(() => {
      jest.advanceTimersByTime(600)
    })

    expect(onComplete).toHaveBeenCalled()
  })

  it('should have assertive aria-live for accessibility', () => {
    render(<AnswerFeedback type="correct" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'assertive')
  })
})

describe('AnswerOptionHighlight', () => {
  it('should render children without effects before reveal', () => {
    render(
      <AnswerOptionHighlight isCorrect={true} isSelected={true} isRevealed={false}>
        <span>Option A</span>
      </AnswerOptionHighlight>
    )
    expect(screen.getByText('Option A')).toBeInTheDocument()
  })

  it('should add green highlight for correct answer after reveal', () => {
    const { container } = render(
      <AnswerOptionHighlight isCorrect={true} isSelected={true} isRevealed={true}>
        <span>Option A</span>
      </AnswerOptionHighlight>
    )
    expect(container.firstChild).toHaveClass('border-green-400')
  })

  it('should add red highlight for wrong selected answer after reveal', () => {
    const { container } = render(
      <AnswerOptionHighlight isCorrect={false} isSelected={true} isRevealed={true}>
        <span>Option B</span>
      </AnswerOptionHighlight>
    )
    expect(container.firstChild).toHaveClass('border-red-400')
  })

  it('should dim unselected wrong answers after reveal', () => {
    const { container } = render(
      <AnswerOptionHighlight isCorrect={false} isSelected={false} isRevealed={true}>
        <span>Option C</span>
      </AnswerOptionHighlight>
    )
    expect(container.firstChild).toHaveClass('opacity-50')
  })

  it('should show checkmark on correct answer after reveal', () => {
    render(
      <AnswerOptionHighlight isCorrect={true} isSelected={false} isRevealed={true}>
        <span>Option A</span>
      </AnswerOptionHighlight>
    )
    expect(screen.getByText('✓')).toBeInTheDocument()
  })
})

describe('PixelTimer', () => {
  it('should display time remaining', () => {
    render(<PixelTimer timeRemaining={15} totalTime={30} />)
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('should have timer role for accessibility', () => {
    render(<PixelTimer timeRemaining={10} totalTime={30} />)
    expect(screen.getByRole('timer')).toBeInTheDocument()
  })

  it('should have progress bar', () => {
    render(<PixelTimer timeRemaining={15} totalTime={30} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should hide progress bar when showProgress is false', () => {
    render(<PixelTimer timeRemaining={15} totalTime={30} showProgress={false} />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('should show warning state at 30% time', () => {
    const { container } = render(<PixelTimer timeRemaining={9} totalTime={30} />)
    expect(container.firstChild).toHaveClass('border-yellow-500')
  })

  it('should show critical state at 15% time', () => {
    const { container } = render(<PixelTimer timeRemaining={3} totalTime={30} />)
    expect(container.firstChild).toHaveClass('border-red-500')
  })

  it('should show normal state above 30% time', () => {
    const { container } = render(<PixelTimer timeRemaining={20} totalTime={30} />)
    expect(container.firstChild).toHaveClass('border-cyan-500/50')
  })

  it('should have proper aria-label', () => {
    render(<PixelTimer timeRemaining={10} totalTime={30} />)
    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '10 seconds remaining')
  })
})

describe('PageTransition', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render children', () => {
    render(
      <PageTransition>
        <span>Content</span>
      </PageTransition>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should start with initial state', () => {
    const { container } = render(
      <PageTransition style="fade">
        <span>Content</span>
      </PageTransition>
    )
    expect(container.firstChild).toHaveClass('opacity-0')
  })

  it('should transition to animated state', () => {
    const { container } = render(
      <PageTransition style="fade">
        <span>Content</span>
      </PageTransition>
    )

    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(container.firstChild).toHaveClass('opacity-100')
  })

  it('should support different styles', () => {
    const { container } = render(
      <PageTransition style="scale">
        <span>Content</span>
      </PageTransition>
    )
    expect(container.firstChild).toHaveClass('scale-90')
  })
})

describe('StaggerChildren', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render all children', () => {
    render(
      <StaggerChildren>
        {[<span key="1">Item 1</span>, <span key="2">Item 2</span>, <span key="3">Item 3</span>]}
      </StaggerChildren>
    )

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })
})
