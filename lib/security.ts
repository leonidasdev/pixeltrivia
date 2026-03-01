/**
 * Security Middleware Re-exports
 *
 * Re-exports pure utility functions from security.core for convenience.
 * For direct imports without Next.js dependencies, use './security.core'.
 *
 * @module lib/security
 * @since 1.0.0
 */

// Re-export pure functions from core module (for convenience)
export {
  SECURITY_HEADERS,
  CSP_DIRECTIVES,
  buildCSP,
  sanitizeString,
  sanitizeObject,
  MAX_BODY_SIZES,
  ALLOWED_ORIGINS,
  isAllowedOrigin,
  REQUIRED_ENV_VARS,
  SERVER_ONLY_ENV_VARS,
  validateEnvVars,
  checkForExposedSecrets,
} from './security.core'
