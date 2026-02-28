/**
 * Sentry Edge Runtime Configuration
 *
 * Initializes Sentry for edge middleware functions.
 * Set the SENTRY_DSN environment variable to enable.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 * @module sentry.edge.config
 * @since 1.2.0
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Associate errors with the deployed release (set at build time)
    release: process.env.SENTRY_RELEASE || process.env.NEXT_PUBLIC_SENTRY_RELEASE || undefined,

    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    environment: process.env.NODE_ENV,

    enabled: process.env.NODE_ENV === 'production',
  })
}
