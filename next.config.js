/** @type {import('next').NextConfig} */

const { withSentryConfig } = require('@sentry/nextjs')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // ESLint configuration
  eslint: {
    // Enforce ESLint during production builds
    ignoreDuringBuilds: false,
  },

  // Security headers applied globally
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // API routes - add additional API-specific headers
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Strict mode for React
  reactStrictMode: true,

  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Enable compression
    compress: true,
  }),
}

// Apply Sentry only when DSN is configured
const sentryEnabled = !!process.env.NEXT_PUBLIC_SENTRY_DSN || !!process.env.SENTRY_DSN

const finalConfig = withBundleAnalyzer(nextConfig)

module.exports = sentryEnabled
  ? withSentryConfig(finalConfig, {
      // Suppress source map upload warnings when auth token is missing
      silent: true,
      // Don't widen the Next.js server-side build tracing
      disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
      disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
    })
  : finalConfig
