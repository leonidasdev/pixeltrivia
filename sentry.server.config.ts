/**
 * Sentry Server-Side Configuration
 *
 * Initializes Sentry error tracking on the server (API routes, SSR).
 * Set the SENTRY_DSN environment variable to enable.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 * @module sentry.server.config
 * @since 1.2.0
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Performance monitoring sample rate
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Environment tag
    environment: process.env.NODE_ENV,

    // Only send errors in production
    enabled: process.env.NODE_ENV === 'production',
  })
}
