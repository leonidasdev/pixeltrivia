/**
 * Game Constants
 *
 * General game configuration constants.
 *
 * @module constants/game
 * @since 1.0.0
 */

// ============================================================================
// Question Configuration
// ============================================================================

/**
 * Minimum number of questions per game
 */
export const MIN_QUESTIONS = 1

/**
 * Maximum number of questions per game
 */
export const MAX_QUESTIONS = 50

/**
 * Default number of questions for quick games
 */
export const DEFAULT_QUESTION_COUNT = 10

/**
 * Number of answer options per question
 */
export const ANSWER_OPTIONS_COUNT = 4

// ============================================================================
// Time Limits
// ============================================================================

/**
 * Minimum time limit per question (seconds)
 */
export const MIN_TIME_LIMIT = 5

/**
 * Maximum time limit per question (seconds)
 */
export const MAX_TIME_LIMIT = 120

/**
 * Default time limit per question (seconds)
 */
export const DEFAULT_TIME_LIMIT = 30

/**
 * Warning time threshold (seconds) - triggers visual warning
 */
export const TIME_WARNING_THRESHOLD = 10

/**
 * Critical time threshold (seconds) - triggers urgent warning
 */
export const TIME_CRITICAL_THRESHOLD = 5

// ============================================================================
// Scoring
// ============================================================================

/**
 * Base points for a correct answer
 */
export const BASE_SCORE = 100

/**
 * Maximum streak bonus multiplier
 */
export const MAX_STREAK_MULTIPLIER = 2.0

/**
 * Streak increment per consecutive correct answer
 */
export const STREAK_INCREMENT = 0.1

/**
 * Points deducted for incorrect answer (if penalty mode enabled)
 */
export const INCORRECT_PENALTY = 0

/**
 * Points for skipping a question
 */
export const SKIP_SCORE = 0

// ============================================================================
// Room Configuration
// ============================================================================

/**
 * Length of room codes
 */
export const ROOM_CODE_LENGTH = 6

/**
 * Characters used in room codes (uppercase alphanumeric)
 */
export const ROOM_CODE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/**
 * Minimum players per room
 */
export const MIN_PLAYERS = 2

/**
 * Maximum players per room
 */
export const MAX_PLAYERS = 16

/**
 * Default maximum players per room
 */
export const DEFAULT_MAX_PLAYERS = 8

/**
 * Room code pattern for validation
 */
export const ROOM_CODE_PATTERN = /^[A-Z0-9]{6}$/

// ============================================================================
// Player Configuration
// ============================================================================

/**
 * Minimum nickname length
 */
export const MIN_NICKNAME_LENGTH = 1

/**
 * Maximum nickname length
 */
export const MAX_NICKNAME_LENGTH = 20

/**
 * Allowed characters in nicknames
 */
export const NICKNAME_PATTERN = /^[a-zA-Z0-9\s\-_]+$/

// ============================================================================
// API Configuration
// ============================================================================

/**
 * Maximum context length for custom quiz generation
 */
export const MAX_CONTEXT_LENGTH = 1000

/**
 * Estimated time per question for AI generation (seconds)
 */
export const AI_GENERATION_TIME_PER_QUESTION = 1

/**
 * Base time for AI generation (seconds)
 */
export const AI_GENERATION_BASE_TIME = 5

/**
 * API request timeout (milliseconds)
 */
export const API_TIMEOUT = 30000

/**
 * Maximum retries for failed API requests
 */
export const MAX_API_RETRIES = 3

// ============================================================================
// LocalStorage Keys
// ============================================================================

/**
 * Storage key prefix for all PixelTrivia data
 */
export const STORAGE_PREFIX = 'pixeltrivia_'

/**
 * Storage schema version — increment when storage structure changes.
 */
export const STORAGE_VERSION = 1

/**
 * Storage keys used in the application.
 * All localStorage access MUST use these constants — never hardcode key strings.
 */
export const STORAGE_KEYS = {
  /** Root versioned key for storage schema detection */
  ROOT: `${STORAGE_PREFIX}v${STORAGE_VERSION}`,
  /** Player profile (JSON) */
  PROFILE: `${STORAGE_PREFIX}profile`,
  /** Game settings (JSON) */
  SETTINGS: `${STORAGE_PREFIX}settings`,
  /** Game history entries (JSON array) */
  HISTORY: `${STORAGE_PREFIX}history`,
  /** Active session ID */
  SESSION: `${STORAGE_PREFIX}session`,
  /** Player display name */
  PLAYER_NAME: `${STORAGE_PREFIX}player_name`,
  /** Player avatar ID */
  PLAYER_AVATAR: `${STORAGE_PREFIX}player_avatar`,
  /** Player volume level */
  PLAYER_VOLUME: `${STORAGE_PREFIX}player_volume`,
  /** Advanced game configuration (JSON) */
  ADVANCED_CONFIG: `${STORAGE_PREFIX}advanced_config`,
  /** AI-generated questions (JSON) */
  GENERATED_QUESTIONS: `${STORAGE_PREFIX}generated_questions`,
  /** Game metadata (JSON) */
  GAME_METADATA: `${STORAGE_PREFIX}game_metadata`,
} as const

// ============================================================================
// Multiplayer Configuration
// ============================================================================

/**
 * Minimum players required to start a multiplayer game
 */
export const MIN_PLAYERS_TO_START = 2

/**
 * Duration to show answer results before next question (ms)
 */
export const ANSWER_REVEAL_DURATION = 3000

/**
 * Delay between questions in multiplayer (ms)
 */
export const QUESTION_TRANSITION_DELAY = 2000

/**
 * Polling interval for room state (fallback when realtime unavailable) (ms)
 */
export const ROOM_POLL_INTERVAL = 3000

/**
 * Maximum reconnection attempts for realtime
 */
export const MAX_RECONNECT_ATTEMPTS = 5

/**
 * Delay between reconnection attempts (ms)
 */
export const RECONNECT_INTERVAL = 3000

/**
 * Time bonus multiplier — faster answers get more points
 * Score = BASE_SCORE * (1 + timeBonus)
 * timeBonus = (timeRemaining / timeLimit) * TIME_BONUS_MULTIPLIER
 */
export const TIME_BONUS_MULTIPLIER = 0.5

/**
 * Storage keys for multiplayer session data
 */
export const MULTIPLAYER_STORAGE_KEYS = {
  PLAYER_ID: `${STORAGE_PREFIX}mp_player_id`,
  ROOM_CODE: `${STORAGE_PREFIX}mp_room_code`,
  IS_HOST: `${STORAGE_PREFIX}mp_is_host`,
} as const

// ============================================================================
// Animation Durations (milliseconds)
// ============================================================================

/**
 * Transition duration for page changes
 */
export const PAGE_TRANSITION_DURATION = 300

/**
 * Duration for answer feedback animation
 */
export const ANSWER_FEEDBACK_DURATION = 1500

/**
 * Duration for score increment animation
 */
export const SCORE_ANIMATION_DURATION = 500

/**
 * Delay before showing next question
 */
export const NEXT_QUESTION_DELAY = 2000
