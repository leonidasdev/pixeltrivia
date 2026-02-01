/**
 * Quiz-related Type Definitions
 *
 * Types for quiz configuration, generation, and responses.
 *
 * @module types/quiz
 * @since 1.0.0
 */

import type { Question, KnowledgeLevel } from './game'

// ============================================================================
// Quick Quiz Types
// ============================================================================

/**
 * Request to fetch quick quiz questions
 */
export interface QuickQuizRequest {
  /** Category of questions to fetch */
  category: string
}

/**
 * Response from quick quiz endpoint
 */
export interface QuickQuizResponse {
  /** Whether the request was successful */
  success: boolean
  /** Array of questions if successful */
  data?: QuickQuizQuestion[]
  /** Metadata about the response */
  meta?: {
    /** Total questions found in category */
    totalFound: number
    /** Number of questions returned */
    returned: number
    /** Category that was queried */
    category: string
  }
  /** Error message if failed */
  error?: string
  /** Human-readable message */
  message: string
}

/**
 * A quick quiz question
 */
export interface QuickQuizQuestion extends Question {
  /** Numeric ID for quick quiz questions */
  id: number
}

// ============================================================================
// Custom Quiz Types
// ============================================================================

/**
 * Request to generate custom quiz questions
 */
export interface CustomQuizRequest {
  /** Knowledge level for question generation */
  knowledgeLevel: KnowledgeLevel
  /** Context or topic for question generation */
  context: string
  /** Number of questions to generate */
  numQuestions: number
}

/**
 * Response from custom quiz generation endpoint
 */
export interface CustomQuizResponse {
  /** Whether generation was successful */
  success: boolean
  /** Generated questions if successful */
  data?: CustomQuizQuestion[]
  /** Generation metadata */
  metadata?: CustomQuizMetadata
  /** Error message if failed */
  error?: string
  /** Human-readable message */
  message: string
  /** Additional error details */
  details?: string
}

/**
 * A custom quiz question (with string ID from AI generation)
 */
export interface CustomQuizQuestion extends Omit<Question, 'id'> {
  /** String ID for custom quiz questions */
  id: string
}

/**
 * Metadata about custom quiz generation
 */
export interface CustomQuizMetadata {
  /** Knowledge level used for generation */
  knowledgeLevel: KnowledgeLevel
  /** Context provided (null if none) */
  context: string | null
  /** Number of questions requested */
  requestedQuestions: number
  /** Number of questions actually generated */
  generatedQuestions: number
  /** ISO timestamp of generation */
  generatedAt: string
}

// ============================================================================
// Advanced Quiz Types
// ============================================================================

/**
 * Request to generate advanced quiz questions
 */
export interface AdvancedQuizRequest {
  /** Array of categories to include */
  categories: string[]
  /** Difficulty level */
  difficulty: string
  /** Number of questions to generate */
  count: number
  /** Optional custom instructions for AI */
  instructions?: string
}

/**
 * Response from advanced quiz generation endpoint
 */
export interface AdvancedQuizResponse {
  /** Whether generation was successful */
  success: boolean
  /** Generated questions if successful */
  data?: AdvancedQuizQuestion[]
  /** Generation metadata */
  metadata?: AdvancedQuizMetadata
  /** Error message if failed */
  error?: string
  /** Human-readable message */
  message: string
}

/**
 * An advanced quiz question
 */
export interface AdvancedQuizQuestion extends Question {
  /** String ID for advanced quiz questions */
  id: string
  /** Optional explanation of the correct answer */
  explanation?: string
  /** Source or reference for the question */
  source?: string
}

/**
 * Metadata about advanced quiz generation
 */
export interface AdvancedQuizMetadata {
  /** Categories used for generation */
  categories: string[]
  /** Difficulty level used */
  difficulty: string
  /** Number of questions requested */
  requestedCount: number
  /** Number of questions actually generated */
  generatedCount: number
  /** ISO timestamp of generation */
  generatedAt: string
  /** AI model used for generation */
  model?: string
}

// ============================================================================
// Quiz Session Types
// ============================================================================

/**
 * Represents an active quiz session
 */
export interface QuizSession {
  /** Unique session identifier */
  sessionId: string
  /** Type of quiz */
  quizType: QuizType
  /** Questions in this session */
  questions: Question[]
  /** Current question index (0-based) */
  currentQuestionIndex: number
  /** Answers submitted so far */
  answers: QuizAnswer[]
  /** When the session started */
  startTime: Date
  /** Whether the session is complete */
  isComplete: boolean
  /** Quiz-specific settings */
  settings: QuizSessionSettings
}

/**
 * Types of quizzes available
 */
export type QuizType = 'quick' | 'custom' | 'advanced' | 'multiplayer'

/**
 * Settings for a quiz session
 */
export interface QuizSessionSettings {
  /** Time limit per question (seconds) */
  timeLimit: number
  /** Whether to shuffle question order */
  shuffleQuestions: boolean
  /** Whether to shuffle answer options */
  shuffleAnswers: boolean
  /** Whether to show feedback after each question */
  showFeedback: boolean
  /** Whether to allow skipping questions */
  allowSkip: boolean
}

/**
 * A submitted answer in a quiz session
 */
export interface QuizAnswer {
  /** ID of the question */
  questionId: number | string
  /** Selected answer index (null if skipped/timed out) */
  selectedAnswer: number | null
  /** Whether the answer was correct */
  isCorrect: boolean
  /** Time spent on the question (milliseconds) */
  timeSpent: number
  /** When the answer was submitted */
  timestamp: Date
}

/**
 * Results of a completed quiz session
 */
export interface QuizResults {
  /** Session ID */
  sessionId: string
  /** Quiz type */
  quizType: QuizType
  /** Number of correct answers */
  correctCount: number
  /** Total number of questions */
  totalQuestions: number
  /** Accuracy percentage (0-100) */
  accuracy: number
  /** Total time taken (milliseconds) */
  totalTime: number
  /** Average time per question (milliseconds) */
  averageTime: number
  /** Final score */
  score: number
  /** Detailed answer breakdown */
  answers: QuizAnswer[]
  /** When the quiz was completed */
  completedAt: Date
}

/**
 * Default quiz session settings
 */
export const DEFAULT_QUIZ_SETTINGS: QuizSessionSettings = {
  timeLimit: 30,
  shuffleQuestions: true,
  shuffleAnswers: false,
  showFeedback: true,
  allowSkip: false,
}
