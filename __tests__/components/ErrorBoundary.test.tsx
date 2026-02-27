/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary, PageErrorFallback, withErrorBoundary } from '@/app/components/ErrorBoundary'

// Component that throws on demand
function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>Child rendered successfully</div>
}

// Suppress React error boundary console noise during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Error: Uncaught') ||
        args[0].includes('The above error') ||
        args[0].includes('ErrorBoundary caught'))
    ) {
      return
    }
    // Also suppress jsdom unhandled exception reports from Error Boundary tests
    if (typeof args[0] === 'object' && args[0] !== null && 'type' in args[0]) {
      return
    }
    originalError.call(console, ...args)
  }
})
afterAll(() => {
  console.error = originalError
})

describe('ErrorBoundary', () => {
  describe('Normal rendering', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowingChild shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Child rendered successfully')).toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('renders default fallback when child throws', () => {
      render(
        <ErrorBoundary>
          <ThrowingChild shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.queryByText('Child rendered successfully')).not.toBeInTheDocument()
      expect(screen.getByText('GAME OVER')).toBeInTheDocument()
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })

    it('renders custom fallback when provided', () => {
      render(
        <ErrorBoundary fallback={<div>Custom error message</div>}>
          <ThrowingChild shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(screen.queryByText('GAME OVER')).not.toBeInTheDocument()
    })

    it('calls onError callback with error and errorInfo', () => {
      const onError = jest.fn()

      render(
        <ErrorBoundary onError={onError}>
          <ThrowingChild shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Test error message' }),
        expect.objectContaining({ componentStack: expect.any(String) })
      )
    })
  })

  describe('Reset behavior', () => {
    it('resets error state when "Try Again" is clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowingChild shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('GAME OVER')).toBeInTheDocument()

      // Re-render with non-throwing child before clicking try again
      rerender(
        <ErrorBoundary>
          <ThrowingChild shouldThrow={false} />
        </ErrorBoundary>
      )

      fireEvent.click(screen.getByText(/try again/i))

      expect(screen.getByText('Child rendered successfully')).toBeInTheDocument()
      expect(screen.queryByText('GAME OVER')).not.toBeInTheDocument()
    })

    it('resets error state when resetKeys change', () => {
      const { rerender } = render(
        <ErrorBoundary resetKeys={['key1']}>
          <ThrowingChild shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('GAME OVER')).toBeInTheDocument()

      // Change reset keys and provide non-throwing child
      rerender(
        <ErrorBoundary resetKeys={['key2']}>
          <ThrowingChild shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Child rendered successfully')).toBeInTheDocument()
    })
  })

  describe('Default fallback UI', () => {
    it('shows Reload Page button', () => {
      render(
        <ErrorBoundary>
          <ThrowingChild shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/reload page/i)).toBeInTheDocument()
    })
  })
})

describe('PageErrorFallback', () => {
  const mockReset = jest.fn()
  const mockError = Object.assign(new Error('Page error'), { digest: 'abc123' })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders error UI with TRY AGAIN button', () => {
    render(<PageErrorFallback error={mockError} reset={mockReset} />)

    expect(screen.getByText('OOPS! GAME CRASHED')).toBeInTheDocument()
    expect(screen.getByText(/try again/i)).toBeInTheDocument()
  })

  it('calls reset when TRY AGAIN is clicked', () => {
    render(<PageErrorFallback error={mockError} reset={mockReset} />)

    fireEvent.click(screen.getByText(/try again/i))
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('renders MAIN MENU link to /', () => {
    render(<PageErrorFallback error={mockError} reset={mockReset} />)

    const link = screen.getByText(/main menu/i)
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/')
  })
})

describe('withErrorBoundary', () => {
  function SimpleComponent({ text }: { text: string }) {
    return <div>{text}</div>
  }

  it('wraps component with ErrorBoundary', () => {
    const Wrapped = withErrorBoundary(SimpleComponent)

    render(<Wrapped text="Hello World" />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('sets displayName correctly', () => {
    const Wrapped = withErrorBoundary(SimpleComponent)
    expect(Wrapped.displayName).toBe('withErrorBoundary(SimpleComponent)')
  })

  it('catches errors from wrapped component', () => {
    const WrappedThrowing = withErrorBoundary(ThrowingChild)

    render(<WrappedThrowing shouldThrow={true} />)
    expect(screen.getByText('GAME OVER')).toBeInTheDocument()
  })

  it('uses custom fallback when provided', () => {
    const WrappedThrowing = withErrorBoundary(ThrowingChild, <div>Custom HOC fallback</div>)

    render(<WrappedThrowing shouldThrow={true} />)
    expect(screen.getByText('Custom HOC fallback')).toBeInTheDocument()
  })
})
