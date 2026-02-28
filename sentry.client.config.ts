/**
 * Sentry Client-Side Configuration
 *
 * Initializes Sentry error tracking in the browser.
 * Set the NEXT_PUBLIC_SENTRY_DSN environment variable to enable.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 * @module sentry.client.config
 * @since 1.2.0
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Performance monitoring sample rate (0.0 to 1.0)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session replay for debugging UI issues
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Environment tag
    environment: process.env.NODE_ENV,

    // Only send errors in production
    enabled: process.env.NODE_ENV === 'production',

    // Filter out noisy errors
    ignoreErrors: [
      // Browser extensions
      'ResizeObserver loop',
      // Network errors from user navigation
      'AbortError',
      'Load failed',
      'Failed to fetch',
      // User-caused errors
      'ChunkLoadError',
    ],
  })
}
