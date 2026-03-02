/**
 * useRoom Hook Tests
 *
 * Tests for the room state management hook including:
 * - Initial state and loading
 * - API fetching and error handling
 * - Supabase Realtime subscriptions
 * - Polling fallback
 * - Cleanup on unmount
 *
 * @module __tests__/hooks/useRoom
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useRoom } from '@/hooks/useRoom'
import type { RoomState } from '@/lib/multiplayerApi'

// ============================================================================
// Mocks
// ============================================================================

const mockGetRoomState = jest.fn()
const mockIsRealtimeAvailable = jest.fn()
const mockGetSupabaseClientSide = jest.fn()

jest.mock('@/lib/multiplayerApi', () => ({
  getRoomState: (...args: unknown[]) => mockGetRoomState(...args),
}))

jest.mock('@/lib/supabaseClient', () => ({
  getSupabaseClientSide: () => mockGetSupabaseClientSide(),
  isRealtimeAvailable: () => mockIsRealtimeAvailable(),
}))

// ============================================================================
// Fixtures
// ============================================================================

const ROOM_CODE = 'ABC123'

const mockRoom: RoomState = {
  code: ROOM_CODE,
  status: 'waiting',
  currentQuestion: 0,
  totalQuestions: 10,
  questionStartTime: null,
  timeLimit: 30,
  maxPlayers: 8,
  gameMode: 'quick',
  category: 'Science',
  createdAt: '2025-01-01T00:00:00Z',
  players: [
    {
      id: 1,
      name: 'Host',
      avatar: 'pixel-cat',
      score: 0,
      isHost: true,
      hasAnswered: false,
      joinedAt: '2025-01-01T00:00:00Z',
    },
  ],
}

// ============================================================================
// Helpers
// ============================================================================

interface MockChannel {
  on: jest.Mock
  subscribe: jest.Mock
  _triggerStatus: (status: string) => void
  _triggerChange: (table: string) => void
  _handlers: Record<string, () => void>
}

function createMockChannel(): MockChannel {
  const handlers: Record<string, () => void> = {}
  let subscribeCallback: ((status: string) => void) | null = null

  const channel: MockChannel = {
    on: jest.fn(function (
      this: MockChannel,
      _event: string,
      _opts: Record<string, unknown>,
      handler: () => void
    ) {
      // Store the handler by table name
      const table = (_opts as { table?: string }).table ?? 'unknown'
      handlers[table] = handler
      return this
    }),
    subscribe: jest.fn((cb: (status: string) => void): MockChannel => {
      subscribeCallback = cb
      return channel
    }),
    // Helper to trigger subscription status for testing
    _triggerStatus: (status: string) => subscribeCallback?.(status),
    _triggerChange: (table: string) => handlers[table]?.(),
    _handlers: handlers,
  }

  return channel
}

// ============================================================================
// Tests
// ============================================================================

describe('useRoom', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockGetRoomState.mockResolvedValue({ success: true, data: mockRoom })
    mockIsRealtimeAvailable.mockReturnValue(false)
    mockGetSupabaseClientSide.mockReturnValue(null)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  // --------------------------------------------------------------------------
  // Initial State
  // --------------------------------------------------------------------------

  describe('Initial state', () => {
    it('starts with loading=true and null room', () => {
      // Delay the API response so we can observe initial state
      mockGetRoomState.mockReturnValue(new Promise(() => {}))

      const { result } = renderHook(() => useRoom({ roomCode: ROOM_CODE, playerId: 1 }))

      expect(result.current.isLoading).toBe(true)
      expect(result.current.room).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.isRealtimeConnected).toBe(false)
    })

    it('fetches room state on mount', async () => {
      const { result } = renderHook(() => useRoom({ roomCode: ROOM_CODE, playerId: 1 }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockGetRoomState).toHaveBeenCalledWith(ROOM_CODE)
      expect(result.current.room).toEqual(mockRoom)
      expect(result.current.error).toBeNull()
    })

    it('does nothing when roomCode is empty', async () => {
      const { result } = renderHook(() => useRoom({ roomCode: '', playerId: 1 }))

      // Wait a tick for effects to run
      await act(async () => {
        await Promise.resolve()
      })

      expect(mockGetRoomState).not.toHaveBeenCalled()
      expect(result.current.room).toBeNull()
    })
  })

  // --------------------------------------------------------------------------
  // Error Handling
  // --------------------------------------------------------------------------

  describe('Error handling', () => {
    it('sets error on API failure', async () => {
      mockGetRoomState.mockResolvedValue({
        success: false,
        error: 'Room not found',
      })

      const { result } = renderHook(() => useRoom({ roomCode: ROOM_CODE, playerId: 1 }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Room not found')
      expect(result.current.room).toBeNull()
    })

    it('uses fallback message when error is undefined', async () => {
      mockGetRoomState.mockResolvedValue({
        success: false,
      })

      const { result } = renderHook(() => useRoom({ roomCode: ROOM_CODE, playerId: 1 }))

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load room')
      })
    })

    it('clears error on successful fetch', async () => {
      // First call fails
      mockGetRoomState.mockResolvedValueOnce({
        success: false,
        error: 'Network error',
      })

      const { result } = renderHook(() => useRoom({ roomCode: ROOM_CODE, playerId: 1 }))

      await waitFor(() => {
        expect(result.current.error).toBe('Network error')
      })

      // Second call succeeds (via manual refresh)
      mockGetRoomState.mockResolvedValueOnce({
        success: true,
        data: mockRoom,
      })

      await act(async () => {
        await result.current.refresh()
      })

      expect(result.current.error).toBeNull()
      expect(result.current.room).toEqual(mockRoom)
    })
  })

  // --------------------------------------------------------------------------
  // Refresh
  // --------------------------------------------------------------------------

  describe('Refresh', () => {
    it('exposes a refresh function that re-fetches room state', async () => {
      const { result } = renderHook(() => useRoom({ roomCode: ROOM_CODE, playerId: 1 }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const updatedRoom = { ...mockRoom, status: 'active' as const }
      mockGetRoomState.mockResolvedValueOnce({
        success: true,
        data: updatedRoom,
      })

      await act(async () => {
        await result.current.refresh()
      })

      expect(result.current.room).toEqual(updatedRoom)
      expect(mockGetRoomState).toHaveBeenCalledTimes(2)
    })
  })

  // --------------------------------------------------------------------------
  // Polling Fallback
  // --------------------------------------------------------------------------

  describe('Polling fallback', () => {
    it('starts polling when realtime is not available', async () => {
      mockIsRealtimeAvailable.mockReturnValue(false)

      const { result } = renderHook(() => useRoom({ roomCode: ROOM_CODE, playerId: 1 }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Initial fetch = 1 call
      expect(mockGetRoomState).toHaveBeenCalledTimes(1)

      // Advance timer — should trigger poll
      await act(async () => {
        jest.advanceTimersByTime(3000)
      })
      expect(mockGetRoomState).toHaveBeenCalledTimes(2)

      // Another interval
      await act(async () => {
        jest.advanceTimersByTime(3000)
      })
      expect(mockGetRoomState).toHaveBeenCalledTimes(3)
    })

    it('starts polling when supabase client is null', async () => {
      mockIsRealtimeAvailable.mockReturnValue(true)
      mockGetSupabaseClientSide.mockReturnValue(null)

      const { result } = renderHook(() => useRoom({ roomCode: ROOM_CODE, playerId: 1 }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockGetRoomState).toHaveBeenCalledTimes(1)

      await act(async () => {
        jest.advanceTimersByTime(3000)
      })
      expect(mockGetRoomState).toHaveBeenCalledTimes(2)
    })

    it('starts polling when enableRealtime is false', async () => {
      mockIsRealtimeAvailable.mockReturnValue(true)

      const { result } = renderHook(() =>
        useRoom({ roomCode: ROOM_CODE, playerId: 1, enableRealtime: false })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        jest.advanceTimersByTime(3000)
      })
      expect(mockGetRoomState).toHaveBeenCalledTimes(2)
    })

    it('stops polling on unmount', async () => {
      mockIsRealtimeAvailable.mockReturnValue(false)

      const { result, unmount } = renderHook(() => useRoom({ roomCode: ROOM_CODE, playerId: 1 }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      unmount()

      // Advance timer — should not trigger more fetches
      const callCount = mockGetRoomState.mock.calls.length
      await act(async () => {
        jest.advanceTimersByTime(9000)
      })
      expect(mockGetRoomState).toHaveBeenCalledTimes(callCount)
    })
  })

  // --------------------------------------------------------------------------
  // Supabase Realtime
  // --------------------------------------------------------------------------

  describe('Supabase Realtime', () => {
    let mockChannel: ReturnType<typeof createMockChannel>
    let mockRemoveChannel: jest.Mock

    beforeEach(() => {
      mockIsRealtimeAvailable.mockReturnValue(true)
      mockChannel = createMockChannel()
      mockRemoveChannel = jest.fn()
      mockGetSupabaseClientSide.mockReturnValue({
        channel: jest.fn().mockReturnValue(mockChannel),
        removeChannel: mockRemoveChannel,
      })
    })

    it('subscribes to room and player changes', async () => {
      renderHook(() => useRoom({ roomCode: ROOM_CODE, playerId: 1 }))

      await waitFor(() => {
        expect(mockChannel.on).toHaveBeenCalledTimes(2)
      })

      // Check that we subscribe to rooms and players tables
      const calls = mockChannel.on.mock.calls
      expect(calls[0][1]).toEqual(
        expect.objectContaining({ table: 'rooms', filter: `code=eq.${ROOM_CODE}` })
      )
      expect(calls[1][1]).toEqual(
        expect.objectContaining({ table: 'players', filter: `room_code=eq.${ROOM_CODE}` })
      )

      expect(mockChannel.subscribe).toHaveBeenCalledTimes(1)
    })

    it('sets isRealtimeConnected on SUBSCRIBED status', async () => {
      const { result } = renderHook(() => useRoom({ roomCode: ROOM_CODE, playerId: 1 }))

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled()
      })

      act(() => {
        mockChannel._triggerStatus('SUBSCRIBED')
      })

      expect(result.current.isRealtimeConnected).toBe(true)
    })

    it('falls back to polling on CHANNEL_ERROR', async () => {
      const { result } = renderHook(() => useRoom({ roomCode: ROOM_CODE, playerId: 1 }))

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled()
      })

      // Initial fetch
      const initialCalls = mockGetRoomState.mock.calls.length

      act(() => {
        mockChannel._triggerStatus('CHANNEL_ERROR')
      })

      expect(result.current.isRealtimeConnected).toBe(false)

      // Should start polling
      await act(async () => {
        jest.advanceTimersByTime(3000)
      })
      expect(mockGetRoomState.mock.calls.length).toBeGreaterThan(initialCalls)
    })

    it('falls back to polling on TIMED_OUT', async () => {
      const { result } = renderHook(() => useRoom({ roomCode: ROOM_CODE, playerId: 1 }))

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled()
      })

      const initialCalls = mockGetRoomState.mock.calls.length

      act(() => {
        mockChannel._triggerStatus('TIMED_OUT')
      })

      expect(result.current.isRealtimeConnected).toBe(false)

      await act(async () => {
        jest.advanceTimersByTime(3000)
      })
      expect(mockGetRoomState.mock.calls.length).toBeGreaterThan(initialCalls)
    })

    it('refreshes room on postgres_changes events', async () => {
      renderHook(() => useRoom({ roomCode: ROOM_CODE, playerId: 1 }))

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled()
      })

      const initialCalls = mockGetRoomState.mock.calls.length

      // Trigger a room change
      act(() => {
        mockChannel._triggerChange('rooms')
      })

      await waitFor(() => {
        expect(mockGetRoomState.mock.calls.length).toBe(initialCalls + 1)
      })

      // Trigger a player change
      act(() => {
        mockChannel._triggerChange('players')
      })

      await waitFor(() => {
        expect(mockGetRoomState.mock.calls.length).toBe(initialCalls + 2)
      })
    })

    it('removes channel on unmount', async () => {
      const { unmount } = renderHook(() => useRoom({ roomCode: ROOM_CODE, playerId: 1 }))

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled()
      })

      unmount()

      expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannel)
    })

    it('stops polling when realtime connects', async () => {
      // Start with CHANNEL_ERROR so polling begins
      const { result } = renderHook(() => useRoom({ roomCode: ROOM_CODE, playerId: 1 }))

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled()
      })

      act(() => {
        mockChannel._triggerStatus('CHANNEL_ERROR')
      })

      // Confirm polling is active
      await act(async () => {
        jest.advanceTimersByTime(3000)
      })
      const pollCalls = mockGetRoomState.mock.calls.length

      // Now realtime connects — should stop polling
      act(() => {
        mockChannel._triggerStatus('SUBSCRIBED')
      })

      expect(result.current.isRealtimeConnected).toBe(true)

      // Advance timer — polling should be stopped
      await act(async () => {
        jest.advanceTimersByTime(9000)
      })
      expect(mockGetRoomState.mock.calls.length).toBe(pollCalls)
    })
  })
})
