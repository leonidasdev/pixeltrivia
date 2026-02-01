/**
 * Security Middleware and Utilities
 * Provides security headers, input sanitization, and request validation
 *
 * For pure utility functions (without Next.js dependencies), import from './security.core'
 */

import { NextResponse } from 'next/server'
import type { z } from 'zod'
import { ValidationError } from './errors'
import { validationErrorResponse } from './apiResponse'
import { formatZodErrors, getFirstError } from './validation'

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

// Import for internal use
import {
  SECURITY_HEADERS,
  CSP_DIRECTIVES,
  buildCSP,
  MAX_BODY_SIZES,
  isAllowedOrigin,
} from './security.core'

// ============================================================================
// Response Security Headers
// ============================================================================

/**
 * Add security headers to a response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Add standard security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add CSP header
  response.headers.set('Content-Security-Policy', buildCSP(CSP_DIRECTIVES))

  return response
}

// ============================================================================
// Request Validation
// ============================================================================

/**
 * Parse and validate JSON body with a Zod schema
 * Throws ValidationError on failure
 */
export async function validateRequestBody<T>(request: Request, schema: z.ZodSchema<T>): Promise<T> {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    throw new ValidationError('Invalid JSON body')
  }

  const result = schema.safeParse(body)

  if (!result.success) {
    const formatted = formatZodErrors(result.error)
    throw new ValidationError(getFirstError(result.error), undefined, formatted)
  }

  return result.data
}

/**
 * Parse and validate query parameters with a Zod schema
 */
export function validateQueryParams<T>(request: Request, schema: z.ZodSchema<T>): T {
  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams.entries())

  const result = schema.safeParse(params)

  if (!result.success) {
    const formatted = formatZodErrors(result.error)
    throw new ValidationError(getFirstError(result.error), undefined, formatted)
  }

  return result.data
}

/**
 * Validate request body and return response on error
 * Returns null on success, error response on failure
 */
export async function tryValidateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const data = await validateRequestBody(request, schema)
    return { data, error: null }
  } catch (err) {
    if (err instanceof ValidationError) {
      return {
        data: null,
        error: validationErrorResponse(err.message, err.field, err.validationErrors),
      }
    }
    throw err
  }
}

// ============================================================================
// Request Size Validation
// ============================================================================

/**
 * Check if request body exceeds size limit
 */
export function checkBodySize(request: Request, maxSize: number = MAX_BODY_SIZES.default): boolean {
  const contentLength = request.headers.get('content-length')
  if (!contentLength) return true // Can't determine, allow

  const size = parseInt(contentLength, 10)
  return !isNaN(size) && size <= maxSize
}

// ============================================================================
// CORS Handling
// ============================================================================

/**
 * Add CORS headers to a response
 */
export function addCorsHeaders(response: NextResponse, request: Request): NextResponse {
  const origin = request.headers.get('origin')

  if (origin && isAllowedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    )
    response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
  }

  return response
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflightRequest(request: Request): NextResponse {
  const response = new NextResponse(null, { status: 204 })
  return addCorsHeaders(response, request)
}

// ============================================================================
// API Key Validation
// ============================================================================

/**
 * Validate API key from environment
 * Only used for internal/admin endpoints
 */
export function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get('x-api-key')
  const expectedKey = process.env.INTERNAL_API_KEY

  if (!expectedKey) {
    console.warn('[Security] INTERNAL_API_KEY not configured')
    return process.env.NODE_ENV === 'development'
  }

  return apiKey === expectedKey
}

// ============================================================================
// Combined Security Middleware
// ============================================================================

type ApiHandler = (request: Request) => Promise<NextResponse>

/**
 * Apply all security measures to an API handler
 */
export function withSecurity(
  handler: ApiHandler,
  options: {
    maxBodySize?: number
    requireApiKey?: boolean
  } = {}
): ApiHandler {
  return async (request: Request): Promise<NextResponse> => {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest(request)
    }

    // Check body size
    if (!checkBodySize(request, options.maxBodySize)) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
    }

    // Check API key if required
    if (options.requireApiKey && !validateApiKey(request)) {
      return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
    }

    // Execute handler
    let response = await handler(request)

    // Add security headers
    response = addSecurityHeaders(response)

    // Add CORS headers
    response = addCorsHeaders(response, request)

    return response
  }
}
