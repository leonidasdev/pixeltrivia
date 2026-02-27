/**
 * useRoom Hook
 *
 * Manages room state with Supabase Realtime subscriptions
 * and polling fallback. Handles player join/leave events.
 *
 * @module hooks/useRoom
 * @since 1.1.0
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getSupabaseClientSide, isRealtimeAvailable } from '@/lib/supabaseClient'
import { getRoomState, type RoomState } from '@/lib/multiplayerApi'
import { ROOM_POLL_INTERVAL } from '@/constants/game'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface UseRoomOptions {
  roomCode: string
  playerId: number | null
  /** Enable real-time updates (default: true) */
  enableRealtime?: boolean
}

export interface UseRoomReturn {
  /** Current room state */
  room: RoomState | null
  /** Loading state */
  isLoading: boolean
  /** Error message */
  error: string | null
  /** Whether connected via realtime */
  isRealtimeConnected: boolean
  /** Manually refresh room state */
  refresh: () => Promise<void>
}

export function useRoom({
  roomCode,
  playerId: _playerId,
  enableRealtime = true,
}: UseRoomOptions): UseRoomReturn {
  const [room, setRoom] = useState<RoomState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch room state from API
  const fetchRoom = useCallback(async () => {
    if (!roomCode) return

    const result = await getRoomState(roomCode)
    if (result.success && result.data) {
      setRoom(result.data)
      setError(null)
    } else {
      setError(result.error ?? 'Failed to load room')
    }
    setIsLoading(false)
  }, [roomCode])

  // Initial fetch
  useEffect(() => {
    fetchRoom()
  }, [fetchRoom])

  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!enableRealtime || !roomCode || !isRealtimeAvailable()) {
      // Fall back to polling
      pollIntervalRef.current = setInterval(fetchRoom, ROOM_POLL_INTERVAL)
      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      }
    }

    const supabase = getSupabaseClientSide()
    if (!supabase) {
      // Fall back to polling
      pollIntervalRef.current = setInterval(fetchRoom, ROOM_POLL_INTERVAL)
      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      }
    }

    // Subscribe to room changes
    const channel = supabase
      .channel(`room:${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `code=eq.${roomCode}`,
        },
        () => {
          // Room state changed — refresh full state
          fetchRoom()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_code=eq.${roomCode}`,
        },
        () => {
          // Player state changed — refresh full state
          fetchRoom()
        }
      )
      .subscribe(status => {
        setIsRealtimeConnected(status === 'SUBSCRIBED')

        // If subscription fails, fall back to polling
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          pollIntervalRef.current = setInterval(fetchRoom, ROOM_POLL_INTERVAL)
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [roomCode, enableRealtime, fetchRoom])

  // Clean up polling if realtime connects
  useEffect(() => {
    if (isRealtimeConnected && pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }, [isRealtimeConnected])

  return {
    room,
    isLoading,
    error,
    isRealtimeConnected,
    refresh: fetchRoom,
  }
}
