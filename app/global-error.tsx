'use client'

import { PageErrorFallback } from './components/ErrorBoundary'

/**
 * Global error page for Next.js App Router
 * Catches errors in route segments and displays a fallback UI
 */
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
