/**
 * Player Display Component
 *
 * Reusable component to display player avatar and info.
 * Used across game pages for consistent player representation.
 *
 * @module app/components/ui/PlayerDisplay
 * @since 1.0.0
 */

'use client'

import React from 'react'
import type { PlayerInfo } from '@/hooks/usePlayerSettings'
import type { AvatarOption } from '@/constants/avatars'

// ============================================================================
// Types
// ============================================================================

export interface PlayerDisplayProps {
  /**
   * Player info from usePlayerSettings hook
   */
  player:
    | PlayerInfo
    | {
        name: string
        avatar?: string
        avatarDetails?: AvatarOption
      }

  /**
   * Display size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /**
   * Show player name
   * @default true
   */
  showName?: boolean

  /**
   * Show avatar class/type label
   * @default false
   */
  showClass?: boolean

  /**
   * Layout direction
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical'

  /**
   * Optional className
   */
  className?: string
}

export interface AvatarDisplayProps {
  /**
   * Avatar option object
   */
  avatar: AvatarOption

  /**
   * Display size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /**
   * Show border/pixel styling
   * @default true
   */
  showBorder?: boolean

  /**
   * Optional className
   */
  className?: string
}

// ============================================================================
// Styles
// ============================================================================

const avatarSizeStyles = {
  sm: {
    container: 'w-8 h-8',
    emoji: 'text-lg',
  },
  md: {
    container: 'w-10 h-10',
    emoji: 'text-xl',
  },
  lg: {
    container: 'w-12 h-12',
    emoji: 'text-2xl',
  },
  xl: {
    container: 'w-16 h-16',
    emoji: 'text-3xl',
  },
}

const nameSizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

const classSizeStyles = {
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm',
  xl: 'text-base',
}

// ============================================================================
// Components
// ============================================================================

/**
 * Standalone avatar display component
 */
export function AvatarDisplay({
  avatar,
  size = 'md',
  showBorder = true,
  className = '',
}: AvatarDisplayProps) {
  const sizeStyles = avatarSizeStyles[size]

  return (
    <div
      className={`
        ${sizeStyles.container} ${avatar.color}
        ${showBorder ? 'border-2 border-gray-600 pixel-border' : ''}
        rounded-lg flex items-center justify-center
        ${className}
      `}
    >
      <span className={sizeStyles.emoji} role="img" aria-label={avatar.name}>
        {avatar.emoji}
      </span>
    </div>
  )
}

/**
 * Full player display with avatar and name
 */
export function PlayerDisplay({
  player,
  size = 'md',
  showName = true,
  showClass = false,
  direction = 'horizontal',
  className = '',
}: PlayerDisplayProps) {
  // Get avatar details from player info
  const avatarDetails =
    'avatarDetails' in player && player.avatarDetails ? player.avatarDetails : undefined

  // Fallback avatar if not provided
  const defaultAvatar: AvatarOption = {
    id: 'default',
    name: 'Player',
    emoji: '👤',
    color: 'bg-gray-500',
  }

  const avatar = avatarDetails || defaultAvatar

  const isVertical = direction === 'vertical'

  return (
    <div
      className={`
        flex ${isVertical ? 'flex-col items-center' : 'items-center'}
        ${isVertical ? 'space-y-2' : 'space-x-3'}
        ${className}
      `}
    >
      <AvatarDisplay avatar={avatar} size={size} />

      {(showName || showClass) && (
        <div className={isVertical ? 'text-center' : 'text-left'}>
          {showName && (
            <div className={`${nameSizeStyles[size]} text-white font-bold`}>{player.name}</div>
          )}
          {showClass && (
            <div className={`${classSizeStyles[size]} text-gray-400`}>{avatar.name}</div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Compact player badge for lists
 */
export interface PlayerBadgeProps {
  /**
   * Player info
   */
  player:
    | PlayerInfo
    | {
        name: string
        avatarDetails?: AvatarOption
      }

  /**
   * Show score
   */
  score?: number

  /**
   * Highlight as current player
   */
  isCurrentPlayer?: boolean

  /**
   * Optional className
   */
  className?: string
}

export function PlayerBadge({
  player,
  score,
  isCurrentPlayer = false,
  className = '',
}: PlayerBadgeProps) {
  const avatarDetails =
    'avatarDetails' in player && player.avatarDetails
      ? player.avatarDetails
      : { emoji: '👤', color: 'bg-gray-500', name: 'Player', id: 'default' }

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5
        ${avatarDetails.color} bg-opacity-30
        ${isCurrentPlayer ? 'ring-2 ring-yellow-400' : ''}
        rounded-full border border-gray-600
        ${className}
      `}
    >
      <span role="img" aria-label={avatarDetails.name}>
        {avatarDetails.emoji}
      </span>
      <span className="text-white text-sm font-medium">{player.name}</span>
      {score !== undefined && <span className="text-yellow-400 text-sm font-bold">{score}</span>}
    </div>
  )
}

/**
 * Player list for multiplayer games
 */
export interface PlayerListProps {
  /**
   * Array of players
   */
  players: Array<PlayerInfo | { name: string; avatarDetails?: AvatarOption }>

  /**
   * Current player ID/name (for highlighting)
   */
  currentPlayerName?: string

  /**
   * Map of player names to scores
   */
  scores?: Record<string, number>

  /**
   * Direction of the list
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal'

  /**
   * Optional className
   */
  className?: string
}

export function PlayerList({
  players,
  currentPlayerName,
  scores,
  direction = 'vertical',
  className = '',
}: PlayerListProps) {
  return (
    <div
      className={`
        flex ${direction === 'vertical' ? 'flex-col space-y-2' : 'flex-wrap gap-2'}
        ${className}
      `}
    >
      {players.map((player, index) => (
        <PlayerBadge
          key={player.name || index}
          player={player}
          score={scores?.[player.name]}
          isCurrentPlayer={player.name === currentPlayerName}
        />
      ))}
    </div>
  )
}
