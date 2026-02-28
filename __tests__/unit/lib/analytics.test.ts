/**
 * Unit tests for lib/analytics.ts
 * Tests event tracking, filtering, summaries, and storage limits
 */

import {
  trackEvent,
  getTrackedEvents,
  getAnalyticsSummary,
  clearAnalytics,
  getEventCount,
} from '@/lib/analytics'

// Mock constants
jest.mock('@/constants/game', () => ({
  STORAGE_KEYS: { ROOT: 'pixeltrivia_test' },
}))

// Mock localStorage
const mockStorage: Record<string, string> = {}
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value
      },
      removeItem: (key: string) => {
        delete mockStorage[key]
      },
    },
    writable: true,
  })
})

const ANALYTICS_KEY = 'pixeltrivia_test_analytics'

describe('analytics', () => {
  beforeEach(() => {
    // Clear storage between tests
    Object.keys(mockStorage).forEach(key => delete mockStorage[key])
  })

  // ─── trackEvent ──────────────────────────────────────────────

  describe('trackEvent', () => {
    it('should store a basic event', () => {
      trackEvent('page_view')
      const events = JSON.parse(mockStorage[ANALYTICS_KEY])
      expect(events).toHaveLength(1)
      expect(events[0].event).toBe('page_view')
      expect(events[0].timestamp).toBeDefined()
    })

    it('should store metadata when provided', () => {
      trackEvent('game_start', { mode: 'quick', category: 'Science' })
      const events = JSON.parse(mockStorage[ANALYTICS_KEY])
      expect(events[0].metadata).toEqual({ mode: 'quick', category: 'Science' })
    })

    it('should not include metadata key when empty or not provided', () => {
      trackEvent('page_view')
      const events = JSON.parse(mockStorage[ANALYTICS_KEY])
      expect(events[0]).not.toHaveProperty('metadata')
    })

    it('should append to existing events', () => {
      trackEvent('page_view')
      trackEvent('game_start')
      trackEvent('game_complete')
      const events = JSON.parse(mockStorage[ANALYTICS_KEY])
      expect(events).toHaveLength(3)
    })

    it('should trim events beyond MAX_EVENTS (500)', () => {
      // Pre-fill with 499 events
      const existingEvents = Array.from({ length: 499 }, (_, i) => ({
        event: 'page_view',
        timestamp: new Date(Date.now() - i * 1000).toISOString(),
      }))
      mockStorage[ANALYTICS_KEY] = JSON.stringify(existingEvents)

      // Add 2 more (total would be 501, should trim to 500)
      trackEvent('game_start')
      trackEvent('game_complete')

      const events = JSON.parse(mockStorage[ANALYTICS_KEY])
      expect(events.length).toBeLessThanOrEqual(500)
    })
  })

  // ─── getTrackedEvents ──────────────────────────────────────

  describe('getTrackedEvents', () => {
    it('should return all events when no filter', () => {
      trackEvent('page_view')
      trackEvent('game_start')
      const events = getTrackedEvents()
      expect(events).toHaveLength(2)
    })

    it('should filter by event type', () => {
      trackEvent('page_view')
      trackEvent('game_start')
      trackEvent('page_view')
      const events = getTrackedEvents('page_view')
      expect(events).toHaveLength(2)
      expect(events.every(e => e.event === 'page_view')).toBe(true)
    })

    it('should return empty array when no events', () => {
      expect(getTrackedEvents()).toEqual([])
    })

    it('should return empty array when filtered type has no matches', () => {
      trackEvent('page_view')
      expect(getTrackedEvents('error')).toEqual([])
    })
  })

  // ─── getEventCount ──────────────────────────────────────────

  describe('getEventCount', () => {
    it('should return 0 when no events', () => {
      expect(getEventCount('page_view')).toBe(0)
    })

    it('should return correct count for specific event', () => {
      trackEvent('page_view')
      trackEvent('game_start')
      trackEvent('page_view')
      trackEvent('page_view')
      expect(getEventCount('page_view')).toBe(3)
      expect(getEventCount('game_start')).toBe(1)
    })
  })

  // ─── getAnalyticsSummary ──────────────────────────────────

  describe('getAnalyticsSummary', () => {
    it('should return empty summary when no events', () => {
      const summary = getAnalyticsSummary()
      expect(summary.totalEvents).toBe(0)
      expect(summary.eventCounts).toEqual({})
      expect(summary.activeDays).toBe(0)
      expect(summary.topEvent).toBeNull()
      expect(summary.dateRange).toBeNull()
      expect(summary.sessionCount).toBe(0)
    })

    it('should count events by type', () => {
      trackEvent('page_view')
      trackEvent('page_view')
      trackEvent('game_start')
      const summary = getAnalyticsSummary()
      expect(summary.totalEvents).toBe(3)
      expect(summary.eventCounts.page_view).toBe(2)
      expect(summary.eventCounts.game_start).toBe(1)
    })

    it('should identify top event', () => {
      trackEvent('page_view')
      trackEvent('game_start')
      trackEvent('page_view')
      trackEvent('page_view')
      const summary = getAnalyticsSummary()
      expect(summary.topEvent).toBe('page_view')
    })

    it('should calculate active days', () => {
      trackEvent('page_view')
      const summary = getAnalyticsSummary()
      expect(summary.activeDays).toBe(1)
    })

    it('should compute date range', () => {
      trackEvent('page_view')
      trackEvent('game_start')
      const summary = getAnalyticsSummary()
      expect(summary.dateRange).not.toBeNull()
      expect(summary.dateRange?.from).toBeTruthy()
      expect(summary.dateRange?.to).toBeTruthy()
    })

    it('should detect sessions based on 30-minute gaps', () => {
      // All events within same session
      trackEvent('page_view')
      trackEvent('game_start')
      trackEvent('game_complete')
      const summary = getAnalyticsSummary()
      expect(summary.sessionCount).toBe(1)
    })

    it('should compute average events per day', () => {
      trackEvent('page_view')
      trackEvent('game_start')
      const summary = getAnalyticsSummary()
      expect(summary.avgEventsPerDay).toBeGreaterThan(0)
    })
  })

  // ─── clearAnalytics ──────────────────────────────────────────

  describe('clearAnalytics', () => {
    it('should remove all events', () => {
      trackEvent('page_view')
      trackEvent('game_start')
      expect(getTrackedEvents()).toHaveLength(2)
      clearAnalytics()
      expect(getTrackedEvents()).toHaveLength(0)
    })

    it('should be safe to call when no events exist', () => {
      expect(() => clearAnalytics()).not.toThrow()
    })
  })
})
