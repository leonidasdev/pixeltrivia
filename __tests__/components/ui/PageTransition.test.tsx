/**
 * Tests for PageTransition and StaggerChildren components
 *
 * @module __tests__/components/ui/PageTransition.test
 */

import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { PageTransition, StaggerChildren } from '@/app/components/ui/PageTransition'

// ── PageTransition ──

describe('PageTransition', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('renders children', () => {
    render(
      <PageTransition>
        <p>Hello World</p>
      </PageTransition>
    )
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('starts with initial (hidden) state', () => {
    const { container } = render(
      <PageTransition>
        <p>Content</p>
      </PageTransition>
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('opacity-0')
  })

  it('transitions to visible state', () => {
    const { container } = render(
      <PageTransition>
        <p>Content</p>
      </PageTransition>
    )
    act(() => jest.advanceTimersByTime(100))
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('opacity-100')
  })

  it('respects custom delay', () => {
    const { container } = render(
      <PageTransition delay={200}>
        <p>Content</p>
      </PageTransition>
    )
    // Still hidden before delay + 50ms
    act(() => jest.advanceTimersByTime(200))
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('opacity-0')

    // Visible after delay + 50ms
    act(() => jest.advanceTimersByTime(50))
    expect(wrapper.className).toContain('opacity-100')
  })

  it('applies fade style', () => {
    const { container } = render(
      <PageTransition style="fade">
        <p>Content</p>
      </PageTransition>
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('opacity-0')
    // Should NOT have translate-y
    expect(wrapper.className).not.toContain('translate-y')
  })

  it('applies slide-up style by default', () => {
    const { container } = render(
      <PageTransition>
        <p>Content</p>
      </PageTransition>
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('translate-y-8')
  })

  it('applies additional className', () => {
    const { container } = render(
      <PageTransition className="custom-class">
        <p>Content</p>
      </PageTransition>
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('custom-class')
  })

  it('cleans up timer on unmount', () => {
    const { unmount } = render(
      <PageTransition>
        <p>Content</p>
      </PageTransition>
    )
    // Should not throw when timer fires after unmount
    unmount()
    act(() => jest.advanceTimersByTime(100))
  })
})

// ── StaggerChildren ──

describe('StaggerChildren', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('renders all children', () => {
    render(
      <StaggerChildren>
        {[<p key="1">First</p>, <p key="2">Second</p>, <p key="3">Third</p>]}
      </StaggerChildren>
    )
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByText('Third')).toBeInTheDocument()
  })

  it('applies stagger delay to each child', () => {
    const { container } = render(
      <StaggerChildren staggerDelay={100}>
        {[<p key="1">First</p>, <p key="2">Second</p>]}
      </StaggerChildren>
    )
    const wrappers = container.querySelectorAll('div')
    // Both start hidden
    expect(wrappers[0].className).toContain('opacity-0')
    expect(wrappers[1].className).toContain('opacity-0')

    // After 50ms, first should be visible (delay=0 + 50ms base)
    act(() => jest.advanceTimersByTime(50))
    expect(wrappers[0].className).toContain('opacity-100')
    expect(wrappers[1].className).toContain('opacity-0')

    // After total 150ms, second should be visible (delay=100 + 50ms base)
    act(() => jest.advanceTimersByTime(100))
    expect(wrappers[1].className).toContain('opacity-100')
  })
})
