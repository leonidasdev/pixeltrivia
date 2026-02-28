/**
 * Next.js Middleware
 *
 * Applies security checks at the edge before requests hit API routes.
 * Security headers and CORS origins are defined in `lib/security.core.ts`.
 *
 * @module middleware
 * @since 1.0.0
 */

import { NextResponse, type NextRequest } from 'next/server'
import { SECURITY_HEADERS, isAllowedOrigin } from '@/lib/security.core'

// ============================================================================
// Request ID Generation
// ============================================================================

/**
 * Generate a unique request ID for tracing.
 * Uses crypto.randomUUID when available, falls back to timestamp-based ID.
 */
function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Apply CORS headers for API routes
 */
function applyCorsHeaders(response: NextResponse, request: NextRequest): void {
  const origin = request.headers.get('origin')

  // Same-origin requests have no origin header; allow them implicitly
  if (origin && isAllowedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, X-API-Key'
    )
    response.headers.set('Access-Control-Max-Age', '86400')
  }
}

/**
 * Handle CORS preflight requests
 */
function handlePreflight(request: NextRequest): NextResponse {
  const response = new NextResponse(null, { status: 204 })
  applyCorsHeaders(response, request)
  return response
}

/**
 * Apply security headers to response
 */
function applySecurityHeaders(response: NextResponse): void {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
}

/**
 * Check for suspicious patterns in the request
 */
function detectSuspiciousPatterns(request: NextRequest): boolean {
  const url = request.nextUrl.pathname
  const userAgent = request.headers.get('user-agent') || ''

  // Block common attack patterns
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS attempt in URL
    /\bonmouseover\b/i, // Event handler injection
    /\bjavascript:/i, // JavaScript protocol
    /\bdata:text\/html/i, // Data URL XSS
    /SELECT.*FROM/i, // SQL injection (basic)
    /UNION.*SELECT/i, // SQL injection
    /exec\s*\(/i, // Command injection
  ]

  // Check URL
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      console.warn(`[Security] Blocked suspicious URL pattern: ${url}`)
      return true
    }
  }

  // Check for known malicious user agents
  const maliciousAgents = [
    /sqlmap/i, // SQL injection tool
    /nikto/i, // Vulnerability scanner
    /nessus/i, // Security scanner
    /acunetix/i, // Web scanner
  ]

  for (const pattern of maliciousAgents) {
    if (pattern.test(userAgent)) {
      console.warn(`[Security] Blocked suspicious user agent: ${userAgent}`)
      return true
    }
  }

  return false
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handlePreflight(request)
  }

  // Block suspicious requests
  if (detectSuspiciousPatterns(request)) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Continue to the route handler
  const response = NextResponse.next()

  // Assign request ID for tracing
  const requestId =
    request.headers.get('x-request-id') ||
    request.headers.get('x-correlation-id') ||
    generateRequestId()
  response.headers.set('x-request-id', requestId)

  // Apply security headers
  applySecurityHeaders(response)

  // Apply CORS for API routes
  if (pathname.startsWith('/api/')) {
    applyCorsHeaders(response, request)
  }

  return response
}

/**
 * Configure which routes use this middleware
 */
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match all pages except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}
