/**
 * API-related Type Definitions
 *
 * Types for API requests, responses, and error handling.
 *
 * @module types/api
 * @since 1.0.0
 */

// ============================================================================
// Base Response Types
// ============================================================================

/**
 * Standard successful API response structure
 * @template T - The type of the data payload
 */
export interface ApiSuccessResponse<T = unknown> {
  /** Indicates the request was successful */
  success: true
  /** The response data */
  data: T
  /** Optional success message */
  message?: string
  /** Response metadata */
  meta?: ResponseMetadata
}

/**
 * Standard error API response structure
 */
export interface ApiErrorResponse {
  /** Indicates the request failed */
  success: false
  /** Human-readable error message */
  error: string
  /** Machine-readable error code */
  code: string
  /** HTTP status code */
  statusCode: number
  /** Additional error details */
  details?: Record<string, unknown>
  /** Response metadata */
  meta?: ResponseMetadata
}

/**
 * Union type for all API responses
 * @template T - The type of the data payload for success responses
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Metadata included in API responses
 */
export interface ResponseMetadata {
  /** ISO timestamp of the response */
  timestamp: string
  /** Unique request identifier for tracing */
  requestId?: string
  /** Pagination information if applicable */
  pagination?: PaginationMetadata
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMetadata {
  /** Current page number (1-based) */
  page: number
  /** Items per page */
  limit: number
  /** Total number of items */
  total: number
  /** Total number of pages */
  totalPages: number
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Error codes used across the application
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_API_ERROR'
  | 'CONFIGURATION_ERROR'
  | 'TIMEOUT_ERROR'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'

/**
 * HTTP status codes used in the application
 */
export type HttpStatusCode =
  | 200 // OK
  | 201 // Created
  | 204 // No Content
  | 400 // Bad Request
  | 401 // Unauthorized
  | 403 // Forbidden
  | 404 // Not Found
  | 409 // Conflict
  | 422 // Unprocessable Entity
  | 429 // Too Many Requests
  | 500 // Internal Server Error
  | 502 // Bad Gateway
  | 503 // Service Unavailable
  | 504 // Gateway Timeout

// ============================================================================
// Request Types
// ============================================================================

/**
 * Common query parameters for list endpoints
 */
export interface ListQueryParams {
  /** Page number (1-based) */
  page?: number
  /** Items per page */
  limit?: number
  /** Sort field */
  sortBy?: string
  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
  /** Search query */
  search?: string
}

/**
 * Request headers used across API calls
 */
export interface ApiRequestHeaders {
  'Content-Type': 'application/json'
  Authorization?: string
  'X-Request-ID'?: string
  'X-Client-Version'?: string
}

// ============================================================================
// Rate Limiting Types
// ============================================================================

/**
 * Rate limit information returned in response headers
 */
export interface RateLimitInfo {
  /** Maximum requests allowed in the window */
  limit: number
  /** Remaining requests in current window */
  remaining: number
  /** Unix timestamp when the window resets */
  reset: number
  /** Seconds until the window resets */
  retryAfter?: number
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation error details
 */
export interface ValidationErrorDetails {
  /** Field that failed validation */
  field: string
  /** Validation error message */
  message: string
  /** The invalid value (sanitized) */
  value?: unknown
}

/**
 * Result of a validation operation
 */
export interface ValidationResult<T = unknown> {
  /** Whether validation passed */
  isValid: boolean
  /** Validated and transformed data (if valid) */
  data?: T
  /** Array of validation errors (if invalid) */
  errors?: ValidationErrorDetails[]
}
