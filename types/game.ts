/**
 * Game-related Type Definitions
 *
 * Types for game state, questions, sessions, and player data.
 *
 * @module types/game
 * @since 1.0.0
 */

// ============================================================================
// Question Types
// ============================================================================

/**
 * Represents a single trivia question
 */
export interface Question {
  /** Unique identifier for the question */
  id: number | string
  /** The question text */
  question: string
  /** Array of possible answers */
  options: string[]
  /** Index of the correct answer in the options array */
  correctAnswer: number
  /** Category of the question (e.g., "Science", "History") */
  category: string
  /** Difficulty level of the question */
  difficulty: DifficultyLevel
  /** Optional time limit for this specific question (in seconds) */
  timeLimit?: number
}

/**
 * Question with sequential numbering for display
 */
export interface NumberedQuestion extends Question {
  /** Sequential question number (1-based) */
  questionNumber: number
}

// ============================================================================
// Game State Types
// ============================================================================

/**
 * Possible states of a game session
 */
export type GameState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'reviewing'
  | 'finished'
  | 'error'

/**
 * Difficulty levels available in the game
 */
export type DifficultyLevel = 'elementary' | 'middle-school' | 'high-school' | 'college' | 'classic'

/**
 * Knowledge levels for custom game configuration
 */
export type KnowledgeLevel = 'classic' | 'college' | 'high-school' | 'middle-school' | 'elementary'

// ============================================================================
// Answer Types
// ============================================================================

/**
 * Represents a player's answer to a question
 */
export interface Answer {
  /** ID of the question answered */
  questionId: number | string
  /** Index of the selected answer (null if timed out) */
  selectedAnswer: number | null
  /** Whether the answer was correct */
  isCorrect: boolean
  /** Time spent on the question (in milliseconds) */
  timeSpent: number
  /** Timestamp when the answer was submitted */
  timestamp: Date
}

// ============================================================================
// Session Types
// ============================================================================

/**
 * Represents a complete game session
 */
export interface GameSession {
  /** Unique session identifier */
  sessionId: string
  /** Array of questions for this session */
  questions: Question[]
  /** Current question index (0-based) */
  currentQuestionIndex: number
  /** Current score */
  score: number
  /** When the session started */
  startTime: Date
  /** Array of submitted answers */
  answers: Answer[]
  /** Category of the game */
  category: string
  /** Difficulty level of the game */
  difficulty: DifficultyLevel
  /** Current game state */
  state: GameState
  /** Whether the session is complete */
  isComplete: boolean
}

/**
 * Summary of a completed game session
 */
export interface GameSummary {
  /** Number of correct answers */
  correctAnswers: number
  /** Total number of questions */
  totalQuestions: number
  /** Accuracy percentage (0-100) */
  accuracy: number
  /** Total time spent (in milliseconds) */
  totalTime: number
  /** Average time per question (in milliseconds) */
  averageTime: number
  /** Final calculated score */
  finalScore: number
}

// ============================================================================
// Player Types
// ============================================================================

/**
 * Represents a player in the game
 */
export interface Player {
  /** Unique player identifier */
  id: string
  /** Display name */
  name: string
  /** Selected avatar ID */
  avatarId: string
  /** Current score */
  score: number
  /** Whether this player is the host */
  isHost: boolean
  /** Player's current status */
  status: PlayerStatus
  /** When the player joined */
  joinedAt: Date
}

/**
 * Possible player statuses
 */
export type PlayerStatus = 'waiting' | 'ready' | 'playing' | 'finished' | 'disconnected'

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Configuration for a custom game
 */
export interface CustomGameConfig {
  /** Knowledge level for question generation */
  knowledgeLevel: KnowledgeLevel
  /** Context or topic for question generation */
  context: string
  /** Number of questions to generate */
  numberOfQuestions: number
}

/**
 * Configuration for a quick game
 */
export interface QuickGameConfig {
  /** Selected category */
  category: string
  /** Selected difficulty */
  difficulty: DifficultyLevel
  /** Number of questions (default: 10) */
  questionCount?: number
  /** Time limit per question in seconds (default: 30) */
  timeLimit?: number
}

/**
 * Configuration for an advanced game
 */
export interface AdvancedGameConfig {
  /** Array of selected categories */
  categories: string[]
  /** Difficulty level */
  difficulty: DifficultyLevel
  /** Number of questions */
  questionCount: number
  /** Time limit per question in seconds */
  timeLimit: number
  /** Whether to shuffle questions */
  shuffleQuestions: boolean
  /** Whether to show correct answers after each question */
  showCorrectAnswers: boolean
}
