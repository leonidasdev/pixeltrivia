'use client'

import { useEffect } from 'react'

/**
 * Error page for route segments
 * Catches errors in nested routes and displays a user-friendly message
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Route Error:', error)
    }
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 bg-opacity-95 border-4 border-red-600 pixel-border p-6 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-lg font-pixel text-red-400 pixel-text-shadow mb-2">
          Something Went Wrong
        </h2>
        <p className="text-gray-300 font-pixel-body text-base mb-4">
          We hit a snag loading this page. Let&apos;s try again!
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left">
            <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
              Error Details
            </summary>
            <pre className="mt-2 p-3 bg-gray-800 pixel-border text-xs text-red-300 overflow-auto max-h-32 font-pixel-body">
              {error.message}
            </pre>
            {error.digest && <p className="text-gray-500 text-xs mt-2">Digest: {error.digest}</p>}
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-pixel text-xs
                       border-4 border-cyan-800 hover:border-cyan-600 pixel-border transition-all duration-150
                       focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-opacity-50
                       hover:scale-105 active:scale-95 pixel-glow-hover"
          >
            🔄 Try Again
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-pixel text-xs
                       border-4 border-gray-800 hover:border-gray-600 pixel-border transition-all duration-150
                       focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50
                       hover:scale-105 active:scale-95 pixel-glow-hover text-center"
          >
            🏠 Main Menu
          </a>
        </div>
      </div>
    </div>
  )
}
