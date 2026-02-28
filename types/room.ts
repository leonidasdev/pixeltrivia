/**
 * Room-related Type Definitions
 *
 * Types for multiplayer room management.
 *
 * @module types/room
 * @since 1.0.0
 */

import type { Player, GameState, DifficultyLevel } from './game'

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
 */
export type RoomStatus =
  | 'waiting' // Waiting for players to join
  | 'starting' // Game is about to start
  | 'in-progress' // Game is active
  | 'paused' // Game is paused
  | 'finished' // Game has ended
  | 'closed' // Room has been closed

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

/**
 * Default room settings
 */
export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  maxPlayers: 8,
  isPrivate: false,
  difficulty: 'classic',
  questionCount: 10,
  timeLimit: 30,
  categories: [],
  allowLateJoin: false,
}

// ============================================================================
// Room Events
// ============================================================================

/**
 * Types of events that can occur in a room
 */
export type RoomEventType =
  | 'player_joined'
  | 'player_left'
  | 'player_ready'
  | 'game_started'
  | 'game_paused'
  | 'game_resumed'
  | 'question_started'
  | 'answer_submitted'
  | 'question_ended'
  | 'game_ended'
  | 'chat_message'
  | 'settings_changed'
  | 'host_changed'

/**
 * Base room event structure
 */
export interface RoomEvent<T = unknown> {
  /** Event type */
  type: RoomEventType
  /** Event payload */
  payload: T
  /** When the event occurred */
  timestamp: Date
  /** ID of the player who triggered the event (if applicable) */
  playerId?: string
}

/**
 * Player joined event payload
 */
export interface PlayerJoinedPayload {
  player: Player
  playerCount: number
}

/**
 * Player left event payload
 */
export interface PlayerLeftPayload {
  playerId: string
  playerName: string
  reason: 'left' | 'kicked' | 'disconnected' | 'timeout'
}

/**
 * Game started event payload
 */
export interface GameStartedPayload {
  gameState: GameState
  totalQuestions: number
  firstQuestionId: string | number
}

// ============================================================================
// Room API Types
// ============================================================================

/**
 * Request to create a new room
 */
export interface CreateRoomRequest {
  /** Nickname of the host */
  hostNickname: string
  /** Maximum players (optional, defaults to 8) */
  maxPlayers?: number
  /** Whether the room is private (optional, defaults to false) */
  isPrivate?: boolean
}

/**
 * Response from creating a room
 */
export interface CreateRoomResponse {
  /** Whether the operation was successful */
  success: boolean
  /** Room data if successful */
  data?: {
    /** The generated room code */
    roomCode: string
    /** When the room was created */
    createdAt: string
    /** Initial room status */
    status: RoomStatus
  }
  /** Error message if failed */
  error?: string
  /** Human-readable message */
  message: string
}

/**
 * Request to join a room
 */
export interface JoinRoomRequest {
  /** Room code to join */
  roomCode: string
  /** Player's nickname */
  nickname: string
  /** Selected avatar ID */
  avatarId?: string
}

/**
 * Response from joining a room
 */
export interface JoinRoomResponse {
  /** Whether the operation was successful */
  success: boolean
  /** Room data if successful */
  data?: {
    /** The room that was joined */
    room: Room
    /** The player's assigned ID */
    playerId: string
    /** Session token for authentication */
    sessionToken: string
  }
  /** Error message if failed */
  error?: string
  /** Human-readable message */
  message: string
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
 * Full multiplayer room state
 */
export interface MultiplayerRoomState {
  /** Room code */
  code: string
  /** Current room/game status */
  status: 'waiting' | 'active' | 'finished'
  /** Current question index (0-based) */
  currentQuestion: number
  /** Total questions in the game */
  totalQuestions: number
  /** When the current question started (ISO string) */
  questionStartTime: string | null
  /** Time limit per question in seconds */
  timeLimit: number
  /** Max players allowed */
  maxPlayers: number
  /** Game mode */
  gameMode: string | null
  /** Category filter */
  category: string | null
  /** When the room was created */
  createdAt: string
  /** Players in the room */
  players: MultiplayerPlayer[]
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
