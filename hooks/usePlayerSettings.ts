/**
 * usePlayerSettings Hook
 *
 * Manages player settings from URL params and localStorage.
 * Consolidates duplicated player settings logic across game pages.
 *
 * @module hooks/usePlayerSettings
 * @since 1.0.0
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocalStorage } from './useLocalStorage'
import { getAvatarById, DEFAULT_AVATAR_ID, type AvatarOption } from '@/constants/avatars'
import { STORAGE_KEYS } from '@/constants/game'

// ============================================================================
// Types
// ============================================================================

/**
 * Player settings structure
 */
export interface PlayerSettings {
  /** Player display name */
  name: string
  /** Selected avatar ID */
  avatar: string
  /** Volume level (0-100) */
  volume: number
}

/**
 * Extended player info with avatar details
 */
export interface PlayerInfo extends PlayerSettings {
  /** Full avatar object */
  avatarDetails: AvatarOption
}

/**
 * Hook return type
 */
export interface UsePlayerSettingsReturn {
  /** Current player settings */
  settings: PlayerSettings
  /** Player info with avatar details */
  playerInfo: PlayerInfo
  /** Update player settings */
  updateSettings: (updates: Partial<PlayerSettings>) => void
  /** Set player name */
  setName: (name: string) => void
  /** Set player avatar */
  setAvatar: (avatarId: string) => void
  /** Set volume level */
  setVolume: (volume: number) => void
  /** Reset to defaults */
  reset: () => void
  /** Whether settings are loaded */
  isLoaded: boolean
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_SETTINGS: PlayerSettings = {
  name: 'Player',
  avatar: DEFAULT_AVATAR_ID,
  volume: 50,
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook to manage player settings with URL param and localStorage sync
 *
 * @param options - Configuration options
 * @returns Player settings state and updaters
 *
 * @example
 * ```tsx
 * function GamePage() {
 *   const { playerInfo, updateSettings } = usePlayerSettings()
 *
 *   return (
 *     <div>
 *       <span>{playerInfo.avatarDetails.emoji}</span>
 *       <span>{playerInfo.name}</span>
 *     </div>
 *   )
 * }
 * ```
 */
export function usePlayerSettings(): UsePlayerSettingsReturn {
  const searchParams = useSearchParams()

  // Use localStorage hooks for persistence
  const [storedName, setStoredName] = useLocalStorage<string>(
    STORAGE_KEYS.PLAYER_NAME,
    DEFAULT_SETTINGS.name
  )
  const [storedAvatar, setStoredAvatar] = useLocalStorage<string>(
    STORAGE_KEYS.PLAYER_AVATAR,
    DEFAULT_SETTINGS.avatar
  )
  const [storedVolume, setStoredVolume] = useLocalStorage<number>(
    STORAGE_KEYS.PLAYER_VOLUME,
    DEFAULT_SETTINGS.volume
  )

  const [isLoaded, setIsLoaded] = useState(false)
  const [settings, setSettings] = useState<PlayerSettings>(DEFAULT_SETTINGS)

  // Load settings from URL params or localStorage on mount
  useEffect(() => {
    const name = searchParams.get('name') || storedName || DEFAULT_SETTINGS.name
    const avatar = searchParams.get('avatar') || storedAvatar || DEFAULT_SETTINGS.avatar
    const volumeParam = searchParams.get('volume')
    const volume = volumeParam ? parseInt(volumeParam, 10) : storedVolume

    setSettings({
      name,
      avatar,
      volume: isNaN(volume) ? DEFAULT_SETTINGS.volume : Math.max(0, Math.min(100, volume)),
    })
    setIsLoaded(true)
  }, [searchParams, storedName, storedAvatar, storedVolume])

  // Update functions
  const updateSettings = useCallback(
    (updates: Partial<PlayerSettings>) => {
      setSettings(prev => {
        const newSettings = { ...prev, ...updates }

        // Persist to localStorage
        if (updates.name !== undefined) {
          setStoredName(updates.name)
        }
        if (updates.avatar !== undefined) {
          setStoredAvatar(updates.avatar)
        }
        if (updates.volume !== undefined) {
          setStoredVolume(updates.volume)
        }

        return newSettings
      })
    },
    [setStoredName, setStoredAvatar, setStoredVolume]
  )

  const setName = useCallback((name: string) => updateSettings({ name }), [updateSettings])

  const setAvatar = useCallback((avatar: string) => updateSettings({ avatar }), [updateSettings])

  const setVolume = useCallback(
    (volume: number) => updateSettings({ volume: Math.max(0, Math.min(100, volume)) }),
    [updateSettings]
  )

  const reset = useCallback(() => {
    updateSettings(DEFAULT_SETTINGS)
  }, [updateSettings])

  // Compute player info with avatar details (memoized)
  const playerInfo: PlayerInfo = useMemo(() => {
    const avatarDetails = getAvatarById(settings.avatar) ??
      getAvatarById(DEFAULT_AVATAR_ID) ?? {
        id: DEFAULT_AVATAR_ID,
        name: 'Player',
        emoji: '🤖',
        color: 'bg-blue-500',
      }

    return { ...settings, avatarDetails }
  }, [settings])

  return useMemo(
    () => ({
      settings,
      playerInfo,
      updateSettings,
      setName,
      setAvatar,
      setVolume,
      reset,
      isLoaded,
    }),
    [settings, playerInfo, updateSettings, setName, setAvatar, setVolume, reset, isLoaded]
  )
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Build URL search params from player settings
 *
 * @param settings - Player settings to encode
 * @param additionalParams - Additional params to include
 * @returns URLSearchParams object
 */
export function buildPlayerParams(
  settings: PlayerSettings,
  additionalParams: Record<string, string> = {}
): URLSearchParams {
  return new URLSearchParams({
    name: settings.name,
    avatar: settings.avatar,
    volume: settings.volume.toString(),
    ...additionalParams,
  })
}

/**
 * Build URL string with player settings
 *
 * @param basePath - Base URL path
 * @param settings - Player settings
 * @param additionalParams - Additional params
 * @returns Full URL with query params
 */
export function buildPlayerUrl(
  basePath: string,
  settings: PlayerSettings,
  additionalParams: Record<string, string> = {}
): string {
  const params = buildPlayerParams(settings, additionalParams)
  return `${basePath}?${params.toString()}`
}
