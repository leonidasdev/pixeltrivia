/**
 * API Cache Utilities
 *
 * SWR-based caching layer for API responses.
 * Provides typed hooks for cached data fetching with automatic
 * revalidation, deduplication, and stale-while-revalidate strategy.
 *
 * @module lib/apiCache
 * @since 1.3.0
 */

import useSWR, { type SWRConfiguration } from 'swr'

// ============================================================================
// Fetcher
// ============================================================================

/**
 * Standard JSON fetcher for SWR.
 * Throws on non-OK responses with the error message from the API.
 */
export async function apiFetcher<T>(url: string): Promise<T> {
  const response = await fetch(url)
  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || `API error: ${response.status}`)
  }

  return data.data as T
}

// ============================================================================
// Default Config
// ============================================================================

/**
 * Default SWR configuration for API calls.
 * - Revalidate on focus for fresh data
 * - Deduplicate requests within 5 seconds
 * - Retry failed requests up to 3 times
 */
export const DEFAULT_SWR_CONFIG: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  shouldRetryOnError: true,
}

/**
 * SWR config for data that rarely changes (e.g., categories, settings).
 * - Longer deduplication window
 * - No revalidation on focus
 */
export const STATIC_SWR_CONFIG: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000, // 1 minute
  errorRetryCount: 2,
}

/**
 * SWR config for data that should never be auto-refetched.
 * Use for one-time loads like generated questions.
 */
export const IMMUTABLE_SWR_CONFIG: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  dedupingInterval: Infinity,
}

// ============================================================================
// Typed Hooks
// ============================================================================

/**
 * Generic cached API hook.
 *
 * @param key - SWR cache key (typically the API URL); null to skip fetching
 * @param config - Optional SWR config overrides
 * @returns SWR response with typed data
 *
 * @example
 * ```tsx
 * const { data, error, isLoading } = useApiCache<QuestionData[]>(
 *   `/api/game/questions?category=Science&count=10`
 * )
 * ```
 */
export function useApiCache<T>(key: string | null, config?: SWRConfiguration) {
  return useSWR<T, Error>(key, apiFetcher, {
    ...DEFAULT_SWR_CONFIG,
    ...config,
  })
}

/**
 * Cached hook for game questions.
 * Uses immutable config since generated questions don't change.
 *
 * @param params - Query parameters for the questions API
 * @param enabled - Whether to fetch (set false to skip)
 */
export function useCachedQuestions(
  params: { category: string; count: number; difficulty?: string } | null
) {
  const key =
    params != null
      ? `/api/game/questions?category=${encodeURIComponent(params.category)}&count=${params.count}${params.difficulty ? `&difficulty=${encodeURIComponent(params.difficulty)}` : ''}`
      : null

  return useApiCache<{ questions: unknown[] }>(key, IMMUTABLE_SWR_CONFIG)
}

// ============================================================================
// Cache Management
// ============================================================================

export { mutate } from 'swr'

/**
 * Invalidate a specific cache key, forcing re-fetch on next access.
 *
 * @param key - The SWR cache key to invalidate
 */
export async function invalidateCache(key: string): Promise<void> {
  const { mutate } = await import('swr')
  await mutate(key, undefined, { revalidate: true })
}

/**
 * Pre-populate a cache entry with known data to avoid a fetch.
 *
 * @param key - The SWR cache key
 * @param data - Data to populate
 */
export async function primeCache<T>(key: string, data: T): Promise<void> {
  const { mutate } = await import('swr')
  await mutate(key, data, { revalidate: false })
}
