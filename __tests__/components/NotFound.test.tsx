/**
 * Tests for NotFound Page
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import NotFound from '@/app/not-found'

describe('NotFound Page', () => {
  it('renders 404 heading', () => {
    render(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders "Page Not Found" subheading', () => {
    render(<NotFound />)
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
  })

  it('renders search icon', () => {
    render(<NotFound />)
    expect(screen.getByText('🔍')).toBeInTheDocument()
  })

  it('renders Main Menu link to /', () => {
    render(<NotFound />)
    const link = screen.getByText(/MAIN MENU/)
    expect(link.closest('a')).toHaveAttribute('href', '/')
  })

  it('renders Quick Game link to /game/quick', () => {
    render(<NotFound />)
    const link = screen.getByText(/QUICK GAME/)
    expect(link.closest('a')).toHaveAttribute('href', '/game/quick')
  })

  it('renders descriptive message', () => {
    render(<NotFound />)
    expect(screen.getByText(/Looks like this page went on an adventure/)).toBeInTheDocument()
  })
})
