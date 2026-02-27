'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKeys?: unknown[]
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary component to catch JavaScript errors in child components
 * and display a fallback UI instead of crashing the whole app
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error)
      console.error('Component stack:', errorInfo.componentStack)
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state if resetKeys changed
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      )
      if (hasResetKeyChanged) {
        this.reset()
      }
    }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} onReset={this.reset} />
    }

    return this.props.children
  }
}

/**
 * Default error fallback UI with retro pixel styling
 */
interface DefaultErrorFallbackProps {
  error: Error | null
  onReset: () => void
}

function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps) {
  return (
    <div className="min-h-[300px] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900 bg-opacity-95 border-4 border-red-600 pixel-border p-6 text-center">
        <div className="text-6xl mb-4">💥</div>
        <h2 className="text-lg font-pixel text-red-400 pixel-text-shadow mb-2">GAME OVER</h2>
        <p className="text-gray-300 font-pixel-body text-base mb-4">
          Something went wrong. Don&apos;t worry, your progress is safe!
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-4 text-left">
            <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
              Technical Details
            </summary>
            <pre className="mt-2 p-3 bg-gray-800 pixel-border text-xs text-red-300 overflow-auto max-h-32 font-pixel-body">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-pixel text-xs
                       border-4 border-cyan-700 hover:border-cyan-600 pixel-border transition-all duration-150
                       focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50
                       hover:scale-105 active:scale-95 pixel-glow-hover"
          >
            🔄 Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-pixel text-xs
                       border-4 border-gray-700 hover:border-gray-600 pixel-border transition-all duration-150
                       focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50
                       hover:scale-105 active:scale-95 pixel-glow-hover"
          >
            🏠 Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Page-level error fallback for route errors
 */
export function PageErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-lg bg-gray-900 bg-opacity-95 border-4 border-red-600 pixel-border p-8 text-center">
        <div className="text-8xl mb-6 animate-pixel-bounce">🎮</div>
        <h1 className="text-lg font-pixel text-red-400 pixel-text-shadow mb-3">
          OOPS! GAME CRASHED
        </h1>
        <p className="text-gray-300 font-pixel-body text-base mb-6">
          We encountered an unexpected error. This has been logged and we&apos;ll fix it soon!
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 text-left bg-gray-800 pixel-border p-4">
            <p className="font-pixel text-[8px] text-gray-400 mb-2">Error Details:</p>
            <p className="text-red-300 font-pixel-body text-base break-all">{error.message}</p>
            {error.digest && <p className="text-gray-500 text-xs mt-2">Digest: {error.digest}</p>}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-pixel text-xs
                       border-4 border-purple-800 hover:border-purple-600 transition-all duration-150
                       focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50
                       hover:scale-105 active:scale-95 pixel-border pixel-glow-hover"
          >
            🔄 TRY AGAIN
          </button>
          <a
            href="/"
            className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-pixel text-xs
                       border-4 border-cyan-800 hover:border-cyan-600 transition-all duration-150
                       focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-opacity-50
                       hover:scale-105 active:scale-95 pixel-border pixel-glow-hover text-center"
          >
            🏠 MAIN MENU
          </a>
        </div>
      </div>
    </div>
  )
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component'

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`

  return ComponentWithErrorBoundary
}

export default ErrorBoundary
