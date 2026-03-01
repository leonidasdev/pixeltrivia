/**
 * Tests for Error Pages
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}))

// Mock ErrorBoundary's PageErrorFallback
jest.mock('@/app/components/ErrorBoundary', () => ({
  PageErrorFallback: ({ error, reset }: { error: Error; reset: () => void }) => (
    <div data-testid="page-error-fallback">
      <span>{error.message}</span>
      <button onClick={reset}>Reset</button>
    </div>
  ),
}))

import ErrorPage from '@/app/error'
import GlobalError from '@/app/global-error'

describe('Error Page', () => {
  const mockReset = jest.fn()
  const mockError = Object.assign(new Error('Test error'), { digest: 'abc123' })

  beforeEach(() => {
    mockReset.mockClear()
  })

  it('renders error message icon', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />)
    expect(screen.getByText('!')).toBeInTheDocument()
  })

  it('renders "Something Went Wrong" heading', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />)
    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
  })

  it('renders Try Again button that calls reset', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />)
    const btn = screen.getByText(/Try Again/)
    fireEvent.click(btn)
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('renders Main Menu link', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />)
    const link = screen.getByText(/Main Menu/)
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/')
  })

  it('logs the error via logger', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { logger } = require('@/lib/logger')
    render(<ErrorPage error={mockError} reset={mockReset} />)
    expect(logger.error).toHaveBeenCalledWith('Route error', mockError)
  })
})

describe('GlobalError Page', () => {
  const mockReset = jest.fn()
  const mockError = Object.assign(new Error('Global error'), { digest: 'xyz789' })

  it('renders PageErrorFallback with error and reset', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    expect(screen.getByTestId('page-error-fallback')).toBeInTheDocument()
    expect(screen.getByText('Global error')).toBeInTheDocument()
  })

  it('reset button triggers reset prop', () => {
    render(<GlobalError error={mockError} reset={mockReset} />)
    fireEvent.click(screen.getByText('Reset'))
    expect(mockReset).toHaveBeenCalledTimes(1)
  })
})
