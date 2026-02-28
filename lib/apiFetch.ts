/**
 * Generic API Fetch Utility
 *
 * Provides a type-safe wrapper around `fetch` for client-side API calls.
 * Eliminates repeated try/catch/response.json boilerplate across API clients.
 *
 * @module lib/apiFetch
 * @since 1.3.0
 */

import { logger } from './logger'

// ============================================================================
// Types
// ============================================================================

/**
 * Standard shape returned by all client-side API functions.
 *
 * Every API client (gameApi, quickQuizApi, customQuizApi, roomApi) returns
 * this envelope. The `data` field carries the response payload on success.
 */
export interface ApiClientResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
  message?: string
  meta?: { timestamp: string }
}

/**
 * Options for {@link apiFetch}.
 */
export interface ApiFetchOptions {
  /** HTTP method (default: `'GET'`). */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** JSON-serialisable request body (automatically stringified). */
  body?: unknown
  /** Additional fetch headers (merged with `Content-Type: application/json`). */
  headers?: Record<string, string>
  /**
   * Human-readable label shown in error logs
   * (e.g. `'fetch questions'`, `'create room'`).
   */
  errorContext?: string
}

// ============================================================================
// Implementation
// ============================================================================

/**
 * Generic, type-safe wrapper around `fetch` for calling internal API routes.
 *
 * Handles JSON serialization/deserialization, HTTP error detection, and
 * structured error logging in a single place so individual API clients
 * don't need to repeat the same boilerplate.
 *
 * @template T - Shape of `response.data` on success
 * @param url - API endpoint (absolute or relative path)
 * @param options - Method, body, headers, and logging context
 * @returns A normalised {@link ApiClientResponse}
 *
 * @example
 * ```ts
 * const result = await apiFetch<{ questions: GameQuestion[] }>(
 *   '/api/game/questions?category=science',
 *   { errorContext: 'fetch questions' }
 * )
 * ```
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<ApiClientResponse<T>> {
  const { method = 'GET', body, headers, errorContext } = options

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })

    const json: ApiClientResponse<T> = await response.json()

    if (!response.ok) {
      throw new Error(json.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return json
  } catch (error) {
    const label = errorContext ?? `API call to ${url}`
    logger.error(`${label} failed:`, error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: `Failed to ${errorContext ?? 'complete request'}`,
    }
  }
}
