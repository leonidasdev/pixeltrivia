/**
 * Security Utilities - Core Functions
 *
 * Pure functions without Next.js dependencies (testable in Node.js).
 *
 * @module lib/security.core
 * @since 1.0.0
 */

// ============================================================================
// Security Headers Configuration
// ============================================================================

/**
 * Security headers to add to all responses
 */
export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // XSS protection
  'X-XSS-Protection': '1; mode=block',
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Permissions policy (disable sensitive features)
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const

/**
 * Content Security Policy directives
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"], // Next.js needs these
  'style-src': ["'self'", "'unsafe-inline'"], // Tailwind needs inline styles
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", 'https://*.supabase.co', 'https://openrouter.ai'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
}

/**
 * Build CSP header string from directives
 */
export function buildCSP(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

// ============================================================================
// Input Sanitization
// ============================================================================

/**
 * Sanitize a string to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: URIs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: URIs (can be used for XSS)
}

/**
 * Sanitize an object's string values recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj }

  for (const key in result) {
    const value = result[key]
    if (typeof value === 'string') {
      ;(result as Record<string, unknown>)[key] = sanitizeString(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      ;(result as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>)
    } else if (Array.isArray(value)) {
      ;(result as Record<string, unknown>)[key] = value.map(item =>
        typeof item === 'string' ? sanitizeString(item) : item
      )
    }
  }

  return result
}

// ============================================================================
// Request Size Limits
// ============================================================================

/**
 * Maximum request body sizes (in bytes)
 */
export const MAX_BODY_SIZES = {
  /** Default: 1MB */
  default: 1 * 1024 * 1024,
  /** Small payloads: 10KB (room codes, answers) */
  small: 10 * 1024,
  /** Medium payloads: 100KB (custom context) */
  medium: 100 * 1024,
  /** Large payloads: 5MB (future file uploads) */
  large: 5 * 1024 * 1024,
} as const

// ============================================================================
// CORS Configuration
// ============================================================================

/**
 * Allowed origins for CORS.
 * In production, set ALLOWED_ORIGINS env var as a comma-separated list.
 * Example: ALLOWED_ORIGINS=https://pixeltrivia.com,https://www.pixeltrivia.com
 */
function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS
  const baseOrigins = ['http://localhost:3000', 'http://localhost:3001']

  if (envOrigins) {
    return [
      ...baseOrigins,
      ...envOrigins
        .split(',')
        .map(o => o.trim())
        .filter(Boolean),
    ]
  }

  return baseOrigins
}

export const ALLOWED_ORIGINS = getAllowedOrigins()

/**
 * Check if origin is allowed
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  if (process.env.NODE_ENV === 'development') return true
  return ALLOWED_ORIGINS.includes(origin)
}

// ============================================================================
// Environment Variable Validation
// ============================================================================

/**
 * Required environment variables
 */
export const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

/**
 * Server-only environment variables (should not start with NEXT_PUBLIC_)
 */
export const SERVER_ONLY_ENV_VARS = ['SUPABASE_SERVICE_ROLE_KEY', 'OPENROUTER_API_KEY'] as const

/**
 * Validate required environment variables
 */
export function validateEnvVars(): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Check for accidentally exposed server secrets
 */
export function checkForExposedSecrets(): string[] {
  const exposed: string[] = []

  for (const varName of SERVER_ONLY_ENV_VARS) {
    // Check if server-only var is accidentally prefixed with NEXT_PUBLIC_
    const publicVersion = `NEXT_PUBLIC_${varName}`
    if (process.env[publicVersion]) {
      exposed.push(publicVersion)
    }
  }

  return exposed
}
