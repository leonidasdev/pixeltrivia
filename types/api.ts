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
// External API Response Types
// ============================================================================

/**
 * Response shape from the OpenRouter chat completions API.
 * Used by both custom and advanced quiz generation routes.
 */
export interface OpenRouterResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}
