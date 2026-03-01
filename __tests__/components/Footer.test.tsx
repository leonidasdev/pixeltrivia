/**
 * Tests for Footer Component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import Footer from '@/app/components/Footer'

describe('Footer', () => {
  it('renders copyright text', () => {
    render(<Footer />)
    expect(screen.getByText(/PixelTrivia/)).toBeInTheDocument()
  })

  it('renders hint when provided', () => {
    render(<Footer hint="Press Enter to continue" />)
    expect(screen.getByText('Press Enter to continue')).toBeInTheDocument()
  })

  it('omits hint paragraph when no hint provided', () => {
    const { container } = render(<Footer />)
    const paragraphs = container.querySelectorAll('p')
    // Only the copyright paragraph
    expect(paragraphs).toHaveLength(1)
  })

  it('applies custom className', () => {
    const { container } = render(<Footer className="mt-8" />)
    const footer = container.querySelector('footer')
    expect(footer).toHaveClass('mt-8')
  })

  it('has default styling classes', () => {
    const { container } = render(<Footer />)
    const footer = container.querySelector('footer')
    expect(footer).toHaveClass('text-center')
    expect(footer).toHaveClass('text-gray-400')
  })
})
