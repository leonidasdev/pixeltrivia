/**
 * useSound Hook
 *
 * React hook for playing 8-bit sound effects.
 * Reads volume from player settings and manages audio context lifecycle.
 *
 * @module hooks/useSound
 * @since 1.1.0
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'
import { soundManager, type SoundEffect, type SoundOptions } from '@/lib/soundManager'

// ============================================================================
// Types
// ============================================================================

export interface UseSoundReturn {
  /** Play a named sound effect */
  play: (effect: SoundEffect, options?: SoundOptions) => void
  /** Set volume (0-100 percent) */
  setVolume: (percent: number) => void
  /** Toggle mute */
  toggleMute: () => void
  /** Current muted state */
  isMuted: boolean
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to play 8-bit sound effects with volume control.
 *
 * @param initialVolume - Initial volume percentage (0-100). Defaults to 50.
 *
 * @example
 * ```tsx
 * const { play } = useSound(volume)
 *
 * <button onClick={() => { play('click'); handleAction(); }}>
 *   Click me
 * </button>
 * ```
 */
export function useSound(initialVolume: number = 50): UseSoundReturn {
  const mutedRef = useRef(false)

  // Sync volume to sound manager whenever it changes
  useEffect(() => {
    soundManager.setVolumePercent(initialVolume)
  }, [initialVolume])

  const play = useCallback((effect: SoundEffect, options?: SoundOptions) => {
    soundManager.play(effect, options)
  }, [])

  const setVolume = useCallback((percent: number) => {
    soundManager.setVolumePercent(percent)
  }, [])

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current
    soundManager.muted = mutedRef.current
  }, [])

  return {
    play,
    setVolume,
    toggleMute,
    isMuted: mutedRef.current,
  }
}
