/**
 * Error Boundary Integration Tests
 *
 * Tests with realistic error scenarios (async errors, deeply nested components,
 * error recovery after re-mounting).
 *
 * @module __tests__/integration/ErrorBoundary
 * @since 1.3.0
 */

/**
 * @jest-environment jsdom
 */
import React, { useState } from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ErrorBoundary, withErrorBoundary } from '@/app/components/ErrorBoundary'

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
    if (typeof args[0] === 'object' && args[0] !== null && 'type' in args[0]) {
      return
    }
    originalError.call(console, ...args)
  }
})
afterAll(() => {
  console.error = originalError
})

// ============================================================================
// Test Components
// ============================================================================

/** Component that throws a specific error type */
function TypeErrorChild() {
  // @ts-expect-error Intentional: testing TypeError
  const obj: null = null
  return <div>{obj.property}</div>
}

/** Component that throws during render based on data */
function DataDrivenChild({ data }: { data: unknown[] | null }) {
  if (data === null) {
    throw new Error('Data failed to load')
  }
  return (
    <ul>
      {data.map((item, i) => (
        <li key={i}>{String(item)}</li>
      ))}
    </ul>
  )
}

/** Deeply nested component tree */
function DeepTree({ depth, throwAtDepth }: { depth: number; throwAtDepth: number }) {
  if (depth === throwAtDepth) {
    throw new Error(`Error at depth ${depth}`)
  }
  if (depth <= 0) {
    return <div>Leaf node</div>
  }
  return (
    <div data-testid={`depth-${depth}`}>
      <DeepTree depth={depth - 1} throwAtDepth={throwAtDepth} />
    </div>
  )
}

/** Interactive component that can trigger errors */
function InteractiveComponent() {
  const [shouldError, setShouldError] = useState(false)

  if (shouldError) {
    throw new Error('User triggered error')
  }

  return (
    <div>
      <p>Interactive content</p>
      <button onClick={() => setShouldError(true)}>Trigger Error</button>
    </div>
  )
}

// ============================================================================
// Tests
// ============================================================================

describe('ErrorBoundary integration scenarios', () => {
  describe('TypeError handling', () => {
    it('catches TypeError from null property access', () => {
      render(
        <ErrorBoundary>
          <TypeErrorChild />
        </ErrorBoundary>
      )

      expect(screen.getByText('GAME OVER')).toBeInTheDocument()
    })
  })

  describe('data-driven errors', () => {
    it('catches error when data is null', () => {
      render(
        <ErrorBoundary>
          <DataDrivenChild data={null} />
        </ErrorBoundary>
      )

      expect(screen.getByText('GAME OVER')).toBeInTheDocument()
    })

    it('renders normally with valid data', () => {
      render(
        <ErrorBoundary>
          <DataDrivenChild data={['a', 'b', 'c']} />
        </ErrorBoundary>
      )

      expect(screen.getByText('a')).toBeInTheDocument()
      expect(screen.getByText('b')).toBeInTheDocument()
    })

    it('recovers after data becomes available', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <DataDrivenChild data={null} />
        </ErrorBoundary>
      )

      expect(screen.getByText('GAME OVER')).toBeInTheDocument()

      // Re-render with valid data and reset
      rerender(
        <ErrorBoundary>
          <DataDrivenChild data={['recovered']} />
        </ErrorBoundary>
      )

      fireEvent.click(screen.getByText(/try again/i))
      expect(screen.getByText('recovered')).toBeInTheDocument()
    })
  })

  describe('deeply nested errors', () => {
    it('catches errors thrown deep in the component tree', () => {
      render(
        <ErrorBoundary>
          <DeepTree depth={5} throwAtDepth={2} />
        </ErrorBoundary>
      )

      expect(screen.getByText('GAME OVER')).toBeInTheDocument()
    })

    it('renders full tree when no error at specified depth', () => {
      render(
        <ErrorBoundary>
          <DeepTree depth={5} throwAtDepth={-1} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Leaf node')).toBeInTheDocument()
    })
  })

  describe('user-triggered errors', () => {
    it('catches errors triggered by user interaction', () => {
      render(
        <ErrorBoundary>
          <InteractiveComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText('Interactive content')).toBeInTheDocument()

      act(() => {
        fireEvent.click(screen.getByText('Trigger Error'))
      })

      expect(screen.getByText('GAME OVER')).toBeInTheDocument()
      expect(screen.queryByText('Interactive content')).not.toBeInTheDocument()
    })
  })

  describe('multiple error boundaries', () => {
    it('only the nearest boundary catches the error', () => {
      render(
        <ErrorBoundary>
          <div>
            <p>Outer content</p>
            <ErrorBoundary>
              <DataDrivenChild data={null} />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      )

      // Inner boundary catches it
      expect(screen.getByText('GAME OVER')).toBeInTheDocument()
      // Outer content is preserved
      expect(screen.getByText('Outer content')).toBeInTheDocument()
    })

    it('isolates errors between sibling boundaries', () => {
      render(
        <div>
          <ErrorBoundary>
            <DataDrivenChild data={null} />
          </ErrorBoundary>
          <ErrorBoundary>
            <DataDrivenChild data={['working']} />
          </ErrorBoundary>
        </div>
      )

      expect(screen.getByText('GAME OVER')).toBeInTheDocument()
      expect(screen.getByText('working')).toBeInTheDocument()
    })
  })

  describe('withErrorBoundary HOC with errors', () => {
    it('wraps a component and catches runtime errors', () => {
      const onError = jest.fn()
      const WrappedDataChild = withErrorBoundary(DataDrivenChild, undefined, onError)

      render(<WrappedDataChild data={null} />)

      expect(screen.getByText('GAME OVER')).toBeInTheDocument()
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Data failed to load' }),
        expect.objectContaining({ componentStack: expect.any(String) })
      )
    })
  })
})
