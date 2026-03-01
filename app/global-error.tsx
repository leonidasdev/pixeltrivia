/**
 * Global Error Page
 *
 * Top-level error boundary for the Next.js App Router.
 * Catches errors that escape individual route segments.
 *
 * @module app/global-error
 * @since 1.0.0
 */

'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { PageErrorFallback } from './components/ErrorBoundary'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <PageErrorFallback error={error} reset={reset} />
      </body>
    </html>
  )
}
