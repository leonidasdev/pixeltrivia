/**
 * Room-related Type Definitions
 *
 * Types for multiplayer room management.
 *
 * @module types/room
 * @since 1.0.0
 */

import type { Player, DifficultyLevel } from './game'

// ============================================================================
// Room Types
// ============================================================================

/**
 * Represents a multiplayer game room
 */
export interface Room {
  /** Unique 6-character room code */
  code: string
  /** Room host's player ID */
  hostId: string
  /** Array of players in the room */
  players: Player[]
  /** Current room status */
  status: RoomStatus
  /** Room settings */
  settings: RoomSettings
  /** When the room was created */
  createdAt: Date
  /** When the room was last updated */
  updatedAt: Date
}

/**
 * Possible room statuses
 *
 * @remarks
 * Matches the database CHECK constraint: `waiting`, `active`, `finished`.
 */
export type RoomStatus = 'waiting' | 'active' | 'finished'

/**
 * Room configuration settings
 */
export interface RoomSettings {
  /** Maximum number of players allowed */
  maxPlayers: number
  /** Whether the room is private (invite-only) */
  isPrivate: boolean
  /** Game difficulty level */
  difficulty: DifficultyLevel
  /** Number of questions per round */
  questionCount: number
  /** Time limit per question in seconds */
  timeLimit: number
  /** Categories to include in the game */
  categories: string[]
  /** Whether to allow late joining */
  allowLateJoin: boolean
}

// ============================================================================
// Multiplayer Game Types
// ============================================================================

/**
 * A question as seen by players (no correct answer)
 */
export interface MultiplayerQuestion {
  /** Question index within the game */
  index: number
  /** The question text */
  questionText: string
  /** Answer options */
  options: string[]
  /** Category if available */
  category?: string
  /** Difficulty if available */
  difficulty?: string
  /** Optional image URL displayed alongside the question text */
  imageUrl?: string
}

/**
 * Player state in a multiplayer game
 */
export interface MultiplayerPlayer {
  /** Database player ID */
  id: number
  /** Player display name */
  name: string
  /** Avatar identifier */
  avatar: string
  /** Whether this player is the room host */
  isHost: boolean
  /** Total score */
  score: number
  /** Whether the player has answered the current question */
  hasAnswered: boolean
  /** When the player joined */
  joinedAt: string
}

/**
 * Scores displayed after a question
 */
export interface QuestionResult {
  /** The correct answer index */
  correctAnswer: number
  /** Player scores for this question */
  playerResults: {
    playerId: number
    playerName: string
    answer: number | null
    correct: boolean
    scoreGained: number
    totalScore: number
    timeMs: number
  }[]
}
