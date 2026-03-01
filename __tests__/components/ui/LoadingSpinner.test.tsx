/**
 * Tests for LoadingSpinner component
 *
 * @module __tests__/components/ui/LoadingSpinner.test
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner, LoadingOverlay } from '@/app/components/ui/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('uses custom label', () => {
    render(<LoadingSpinner label="Please wait" />)
    expect(screen.getByLabelText('Please wait')).toBeInTheDocument()
  })

  it('shows label when showLabel is true', () => {
    render(<LoadingSpinner showLabel label="Fetching..." />)
    // showLabel renders the text visually in addition to sr-only
    const texts = screen.getAllByText('Fetching...')
    expect(texts.length).toBeGreaterThanOrEqual(2) // visible + sr-only
  })

  it('hides label by default', () => {
    const { container } = render(<LoadingSpinner label="Hidden" />)
    // Only the sr-only span should contain the text
    const spans = container.querySelectorAll('span')
    const visibleSpan = Array.from(spans).find(
      s => s.textContent === 'Hidden' && !s.classList.contains('sr-only')
    )
    expect(visibleSpan).toBeUndefined()
  })

  it('applies known color from map', () => {
    const { container } = render(<LoadingSpinner color="cyan" />)
    expect(container.innerHTML).toContain('text-cyan-400')
  })

  it('falls back to text-{color} for unknown color', () => {
    const { container } = render(<LoadingSpinner color="indigo" />)
    expect(container.innerHTML).toContain('text-indigo')
  })

  it('applies className prop', () => {
    const { container } = render(<LoadingSpinner className="my-class" />)
    expect(container.firstElementChild?.className).toContain('my-class')
  })

  it('renders different sizes', () => {
    const { rerender, container } = render(<LoadingSpinner size="sm" />)
    const sm = container.innerHTML
    rerender(<LoadingSpinner size="xl" />)
    const xl = container.innerHTML
    expect(sm).not.toBe(xl) // classes differ
  })
})

describe('LoadingOverlay', () => {
  it('renders with default opaque background', () => {
    const { container } = render(<LoadingOverlay />)
    expect(container.innerHTML).toContain('bg-gray-900')
    expect(container.innerHTML).not.toContain('bg-black/50')
  })

  it('renders with transparent background', () => {
    const { container } = render(<LoadingOverlay transparent />)
    expect(container.innerHTML).toContain('bg-black/50')
  })

  it('renders custom label', () => {
    render(<LoadingOverlay label="Saving..." />)
    expect(screen.getAllByText('Saving...').length).toBeGreaterThanOrEqual(1)
  })
})
