/**
 * API Response Utilities
 *
 * Provides standardized response formatting for all API routes.
 *
 * @module lib/apiResponse
 * @since 1.0.0
 */

import { NextResponse } from 'next/server'
import { logger } from './logger'
import {
  type AppError,
  ValidationError,
  NotFoundError,
  DatabaseError,
  ExternalAPIError,
  RateLimitError,
  isAppError,
  wrapError,
  formatErrorResponse,
} from './errors'

// ============================================================================
// Response Types
// ============================================================================

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
  meta?: {
    timestamp: string
    requestId?: string
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface ApiErrorResponse {
  success: false
  error: string
  code: string
  statusCode: number
  details?: Record<string, unknown>
  meta?: {
    timestamp: string
    requestId?: string
  }
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

// ============================================================================
// Success Response Helpers
// ============================================================================

/**
 * Creates a successful JSON response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    meta: {
      timestamp: new Date().toISOString(),
    },
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Creates a 201 Created response
 */
export function createdResponse<T>(
  data: T,
  message: string = 'Resource created successfully'
): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, message, 201)
}

/**
 * Creates a 204 No Content response
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

/**
 * Creates a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  }
): NextResponse<ApiSuccessResponse<T[]>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  const response: ApiSuccessResponse<T[]> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      pagination: {
        ...pagination,
        totalPages,
      },
    },
  }

  return NextResponse.json(response, { status: 200 })
}

// ============================================================================
// Error Response Helpers
// ============================================================================

/**
 * Creates an error JSON response from an AppError
 */
export function errorResponse(error: AppError): NextResponse<ApiErrorResponse> {
  const formatted = formatErrorResponse(error)

  const response: ApiErrorResponse = {
    success: false,
    error: formatted.error,
    code: formatted.code,
    statusCode: formatted.statusCode,
    ...(formatted.details && { details: formatted.details }),
    meta: {
      timestamp: new Date().toISOString(),
    },
  }

  // Add special headers for rate limiting
  const headers: Record<string, string> = {}
  if (error instanceof RateLimitError) {
    headers['Retry-After'] = String(error.retryAfter)
  }

  return NextResponse.json(response, {
    status: formatted.statusCode,
    headers,
  })
}

/**
 * Creates a validation error response
 */
export function validationErrorResponse(
  message: string,
  field?: string,
  validationErrors?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  return errorResponse(new ValidationError(message, field, validationErrors))
}

/**
 * Creates a not found error response
 */
export function notFoundResponse(
  resource: string,
  identifier?: string
): NextResponse<ApiErrorResponse> {
  return errorResponse(new NotFoundError(resource, identifier))
}

/**
 * Creates a database error response
 */
export function databaseErrorResponse(
  message: string = 'A database error occurred',
  originalError?: Error
): NextResponse<ApiErrorResponse> {
  return errorResponse(new DatabaseError(message, originalError))
}

/**
 * Creates an external API error response
 */
export function externalApiErrorResponse(
  service: string,
  message: string,
  originalError?: Error
): NextResponse<ApiErrorResponse> {
  return errorResponse(new ExternalAPIError(service, message, originalError))
}

/**
 * Creates a rate limit error response
 */
export function rateLimitResponse(retryAfter: number = 60): NextResponse<ApiErrorResponse> {
  return errorResponse(new RateLimitError(retryAfter))
}

/**
 * Creates an unauthorized error response
 */
export function unauthorizedResponse(
  message: string = 'Authentication required'
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error: message,
    code: 'UNAUTHORIZED',
    statusCode: 401,
    meta: {
      timestamp: new Date().toISOString(),
    },
  }

  return NextResponse.json(response, { status: 401 })
}

/**
 * Creates a forbidden error response
 */
export function forbiddenResponse(
  message: string = 'Access denied'
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error: message,
    code: 'FORBIDDEN',
    statusCode: 403,
    meta: {
      timestamp: new Date().toISOString(),
    },
  }

  return NextResponse.json(response, { status: 403 })
}

/**
 * Creates a generic server error response
 */
export function serverErrorResponse(
  message: string = 'An internal server error occurred'
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'An internal server error occurred' : message,
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: 500,
    meta: {
      timestamp: new Date().toISOString(),
    },
  }

  return NextResponse.json(response, { status: 500 })
}

/**
 * Creates a 405 Method Not Allowed response
 */
export function methodNotAllowedResponse(allowed: string = 'POST'): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error: 'Method not allowed',
    code: 'METHOD_NOT_ALLOWED',
    statusCode: 405,
    meta: {
      timestamp: new Date().toISOString(),
    },
  }

  return NextResponse.json(response, {
    status: 405,
    headers: { Allow: allowed },
  })
}

// ============================================================================
// API Handler Wrapper
// ============================================================================

type ApiHandler = (request: Request) => Promise<NextResponse>

/**
 * Wraps an API handler with error handling
 * Catches any errors and returns appropriate error responses
 */
export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (request: Request): Promise<NextResponse> => {
    try {
      return await handler(request)
    } catch (error) {
      // Log error for debugging
      logger.error('[API Error]', {
        url: request.url,
        method: request.method,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      })

      // Return appropriate error response
      if (isAppError(error)) {
        return errorResponse(error)
      }

      // Wrap unknown errors
      const wrappedError = wrapError(error)
      return errorResponse(wrappedError)
    }
  }
}

// ============================================================================
// Request Validation Helpers
// ============================================================================

/**
 * Parses and validates JSON body from request
 */
export async function parseJsonBody<T>(request: Request, requiredFields?: (keyof T)[]): Promise<T> {
  let body: T

  try {
    body = await request.json()
  } catch {
    throw new ValidationError('Invalid JSON body')
  }

  if (requiredFields && requiredFields.length > 0) {
    const missingFields = requiredFields.filter(
      field => body[field] === undefined || body[field] === null
    )

    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`, undefined, {
        required: missingFields.map(String),
      })
    }
  }

  return body
}

/**
 * Validates string is not empty
 */
export function validateRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} is required and must be a non-empty string`, fieldName)
  }
  return value.trim()
}

/**
 * Validates number is within range
 */
export function validateNumberRange(
  value: unknown,
  fieldName: string,
  min: number,
  max: number
): number {
  const num = typeof value === 'number' ? value : Number(value)

  if (isNaN(num)) {
    throw new ValidationError(`${fieldName} must be a valid number`, fieldName)
  }

  if (num < min || num > max) {
    throw new ValidationError(`${fieldName} must be between ${min} and ${max}`, fieldName, {
      min: [String(min)],
      max: [String(max)],
    })
  }

  return num
}
