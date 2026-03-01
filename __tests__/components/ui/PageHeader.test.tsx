/**
 * Tests for PageHeader component
 *
 * @module __tests__/components/ui/PageHeader.test
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PageHeader } from '@/app/components/ui/PageHeader'

const mockBack = jest.fn()
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
}))

describe('PageHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders title', () => {
    render(<PageHeader title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Title" subtitle="Sub" />)
    expect(screen.getByText('Sub')).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    const { container } = render(<PageHeader title="Title" />)
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs.length).toBe(0)
  })

  it('renders icon when provided', () => {
    render(<PageHeader title="Title" icon="🎮" />)
    expect(screen.getByText('🎮')).toBeInTheDocument()
  })

  it('shows back button when showBackButton is true', () => {
    render(<PageHeader title="Title" showBackButton />)
    const btn = screen.getByRole('button', { name: /back/i })
    expect(btn).toBeInTheDocument()
  })

  it('calls onBack when onBack is provided and back button clicked', () => {
    const onBack = jest.fn()
    render(<PageHeader title="Title" showBackButton onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalled()
    expect(mockBack).not.toHaveBeenCalled()
  })

  it('calls router.back when no onBack provided', () => {
    render(<PageHeader title="Title" showBackButton />)
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockBack).toHaveBeenCalled()
  })

  it('does not show back button by default', () => {
    render(<PageHeader title="Title" />)
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()
  })

  it('renders rightContent when provided', () => {
    render(<PageHeader title="Title" rightContent={<span data-testid="right">R</span>} />)
    expect(screen.getByTestId('right')).toBeInTheDocument()
  })

  it('does not render rightContent slot when not provided', () => {
    const { container } = render(<PageHeader title="Title" />)
    expect(container.querySelector('.absolute.right-0')).toBeNull()
  })

  it('applies centered className when centered is true (default)', () => {
    const { container } = render(<PageHeader title="Title" />)
    expect(container.innerHTML).toContain('text-center')
  })

  it('does not apply centered className when centered is false', () => {
    const { container } = render(<PageHeader title="Title" centered={false} />)
    // The main content div should not have text-center
    const innerDiv = container.querySelector('header > div:last-child')
    expect(innerDiv?.className).not.toContain('text-center')
  })

  it('uses custom backLabel', () => {
    render(<PageHeader title="Title" showBackButton backLabel="Go back" />)
    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument()
  })

  it('uses custom size', () => {
    const { container } = render(<PageHeader title="Title" size="sm" />)
    // sm size should apply smaller text classes
    expect(container.querySelector('h1')).toBeInTheDocument()
  })

  it('applies className prop', () => {
    const { container } = render(<PageHeader title="Title" className="my-custom" />)
    expect(container.querySelector('header')?.className).toContain('my-custom')
  })
})
