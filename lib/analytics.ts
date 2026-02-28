/**
 * Usage Analytics
 *
 * Lightweight client-side analytics for tracking user engagement.
 * Events are stored locally and can optionally be sent to an endpoint.
 * Privacy-first: no PII collected, all data stays on-device by default.
 *
 * @module lib/analytics
 * @since 1.3.0
 */

import { STORAGE_KEYS } from '@/constants/game'

// ============================================================================
// Types
// ============================================================================

/**
 * Tracked event types
 */
export type AnalyticsEvent =
  | 'page_view'
  | 'game_start'
  | 'game_complete'
  | 'game_abandon'
  | 'mode_select'
  | 'category_select'
  | 'file_upload'
  | 'achievement_unlock'
  | 'leaderboard_view'
  | 'settings_change'
  | 'room_create'
  | 'room_join'
  | 'error'

/**
 * Single analytics event record
 */
export interface AnalyticsRecord {
  /** Event type */
  event: AnalyticsEvent
  /** ISO timestamp */
  timestamp: string
  /** Optional metadata */
  metadata?: Record<string, string | number | boolean>
}

/**
 * Analytics summary for a time period
 */
export interface AnalyticsSummary {
  /** Total events tracked */
  totalEvents: number
  /** Events grouped by type */
  eventCounts: Partial<Record<AnalyticsEvent, number>>
  /** Unique days with activity */
  activeDays: number
  /** Average events per active day */
  avgEventsPerDay: number
  /** Most common event */
  topEvent: AnalyticsEvent | null
  /** Date range covered */
  dateRange: { from: string; to: string } | null
  /** Session count (groups of events within 30 min gaps) */
  sessionCount: number
  /** Average session duration in seconds */
  avgSessionDuration: number
}

// ============================================================================
// Constants
// ============================================================================

const ANALYTICS_KEY = `${STORAGE_KEYS.ROOT}_analytics`
const MAX_EVENTS = 500
const SESSION_GAP_MS = 30 * 60 * 1000 // 30 minutes

// ============================================================================
// Storage
// ============================================================================

function getEvents(): AnalyticsRecord[] {
  try {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem(ANALYTICS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveEvents(events: AnalyticsRecord[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events))
    }
  } catch {
    // silent fail — storage full or unavailable
  }
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Track an analytics event.
 *
 * @param event - Event type to track
 * @param metadata - Optional key-value metadata
 */
export function trackEvent(
  event: AnalyticsEvent,
  metadata?: Record<string, string | number | boolean>
): void {
  const record: AnalyticsRecord = {
    event,
    timestamp: new Date().toISOString(),
    ...(metadata && Object.keys(metadata).length > 0 ? { metadata } : {}),
  }

  const events = getEvents()
  events.push(record)

  // Trim oldest events if over limit
  const trimmed = events.length > MAX_EVENTS ? events.slice(-MAX_EVENTS) : events

  saveEvents(trimmed)
}

/**
 * Get all tracked events, optionally filtered by type.
 *
 * @param eventType - Optional event type filter
 */
export function getTrackedEvents(eventType?: AnalyticsEvent): AnalyticsRecord[] {
  const events = getEvents()
  return eventType ? events.filter(e => e.event === eventType) : events
}

/**
 * Get an analytics summary of all tracked data.
 */
export function getAnalyticsSummary(): AnalyticsSummary {
  const events = getEvents()

  if (events.length === 0) {
    return {
      totalEvents: 0,
      eventCounts: {},
      activeDays: 0,
      avgEventsPerDay: 0,
      topEvent: null,
      dateRange: null,
      sessionCount: 0,
      avgSessionDuration: 0,
    }
  }

  // Event counts
  const eventCounts: Partial<Record<AnalyticsEvent, number>> = {}
  for (const e of events) {
    eventCounts[e.event] = (eventCounts[e.event] || 0) + 1
  }

  // Top event
  const topEvent = Object.entries(eventCounts).sort(
    (a, b) => (b[1] as number) - (a[1] as number)
  )[0]?.[0] as AnalyticsEvent | null

  // Active days
  const days = new Set(events.map(e => e.timestamp.split('T')[0]))
  const activeDays = days.size

  // Date range
  const sorted = events.map(e => e.timestamp).sort()
  const dateRange = { from: sorted[0], to: sorted[sorted.length - 1] }

  // Sessions (groups separated by 30+ minute gaps)
  const timestamps = events.map(e => new Date(e.timestamp).getTime()).sort((a, b) => a - b)
  let sessionCount = 1
  let totalSessionDuration = 0
  let sessionStart = timestamps[0]

  for (let i = 1; i < timestamps.length; i++) {
    if (timestamps[i] - timestamps[i - 1] > SESSION_GAP_MS) {
      totalSessionDuration += timestamps[i - 1] - sessionStart
      sessionStart = timestamps[i]
      sessionCount++
    }
  }
  totalSessionDuration += timestamps[timestamps.length - 1] - sessionStart

  const avgSessionDuration =
    sessionCount > 0 ? Math.round(totalSessionDuration / sessionCount / 1000) : 0

  return {
    totalEvents: events.length,
    eventCounts,
    activeDays,
    avgEventsPerDay: activeDays > 0 ? Math.round(events.length / activeDays) : 0,
    topEvent,
    dateRange,
    sessionCount,
    avgSessionDuration,
  }
}

/**
 * Clear all analytics data.
 */
export function clearAnalytics(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ANALYTICS_KEY)
    }
  } catch {
    // silent
  }
}

/**
 * Get event count for a specific type.
 */
export function getEventCount(event: AnalyticsEvent): number {
  return getEvents().filter(e => e.event === event).length
}
