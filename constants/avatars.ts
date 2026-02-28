/**
 * Avatar Constants
 *
 * Defines available avatar options for player customization.
 *
 * @module constants/avatars
 * @since 1.0.0
 */

/**
 * Avatar option structure
 */
export interface AvatarOption {
  /** Unique identifier for the avatar */
  id: string
  /** Display name */
  name: string
  /** Emoji representation */
  emoji: string
  /** CSS color class for background */
  color: string
}

/**
 * Available avatar options for players
 *
 * @remarks
 * These avatars use emoji representations for the pixel-art aesthetic.
 * Each avatar has a unique color scheme for easy identification in multiplayer.
 */
export const AVATAR_OPTIONS: readonly AvatarOption[] = [
  { id: 'robot', name: 'Robot', emoji: '🤖', color: 'bg-blue-500' },
  { id: 'alien', name: 'Alien', emoji: '👽', color: 'bg-green-500' },
  { id: 'ghost', name: 'Ghost', emoji: '👻', color: 'bg-purple-500' },
  { id: 'wizard', name: 'Wizard', emoji: '🧙', color: 'bg-indigo-500' },
  { id: 'ninja', name: 'Ninja', emoji: '🥷', color: 'bg-gray-700' },
  { id: 'astronaut', name: 'Astronaut', emoji: '👨‍🚀', color: 'bg-orange-500' },
  { id: 'pirate', name: 'Pirate', emoji: '🏴‍☠️', color: 'bg-yellow-600' },
  { id: 'dragon', name: 'Dragon', emoji: '🐉', color: 'bg-red-500' },
  { id: 'unicorn', name: 'Unicorn', emoji: '🦄', color: 'bg-pink-500' },
  { id: 'cat', name: 'Cat', emoji: '🐱', color: 'bg-amber-500' },
  { id: 'dog', name: 'Dog', emoji: '🐕', color: 'bg-amber-700' },
  { id: 'fox', name: 'Fox', emoji: '🦊', color: 'bg-orange-600' },
] as const

/**
 * Default avatar ID when none is selected
 */
export const DEFAULT_AVATAR_ID = 'robot'

/**
 * Get an avatar by its ID
 *
 * @param id - The avatar ID to look up
 * @returns The avatar option or undefined if not found
 */
export function getAvatarById(id: string): AvatarOption | undefined {
  return AVATAR_OPTIONS.find(avatar => avatar.id === id)
}

/**
 * Get the default avatar
 *
 * @returns The default avatar option
 */
export function getDefaultAvatar(): AvatarOption {
  return AVATAR_OPTIONS.find(avatar => avatar.id === DEFAULT_AVATAR_ID) ?? AVATAR_OPTIONS[0]
}
