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

import { PageErrorFallback } from './components/ErrorBoundary'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <PageErrorFallback error={error} reset={reset} />
      </body>
    </html>
  )
}
