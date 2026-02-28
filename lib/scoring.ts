/**
 * Scoring Utilities
 *
 * Unified scoring logic for all game modes. Provides consistent
 * point calculation with configurable time bonuses.
 *
 * @module lib/scoring
 * @since 1.2.0
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for score calculation
 */
export interface ScoringConfig {
  /** Base points awarded per correct answer (default: 100) */
  basePoints?: number
  /** Maximum bonus points per question for fast answers (default: 50) */
  maxTimeBonus?: number
  /** Reference time in seconds used for bonus calculation (default: 30) */
  referenceTime?: number
}

/**
 * An answered question used for scoring
 */
export interface ScoredAnswer {
  /** Whether the answer was correct */
  isCorrect: boolean
  /** Time spent answering in seconds */
  timeSpent: number
}

/**
 * Full score breakdown returned by calculateGameScore
 */
export interface ScoreResult {
  /** Number of correct answers */
  correctAnswers: number
  /** Total number of questions */
  totalQuestions: number
  /** Accuracy percentage (0-100) */
  accuracy: number
  /** Total time spent across all questions (seconds) */
  totalTime: number
  /** Average time per question (seconds) */
  averageTime: number
  /** Final computed score */
  score: number
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: Required<ScoringConfig> = {
  basePoints: 100,
  maxTimeBonus: 50,
  referenceTime: 30,
}

// ============================================================================
// Scoring Functions
// ============================================================================

/**
 * Calculate time bonus for a single correct answer.
 *
 * Faster answers receive more bonus points, linearly interpolated
 * from 0 (at or above referenceTime) to maxTimeBonus (instant answer).
 *
 * @param timeSpent - Seconds the player took to answer
 * @param config - Scoring configuration
 * @returns Bonus points (clamped to [0, maxTimeBonus])
 */
export function calculateTimeBonus(timeSpent: number, config: ScoringConfig = {}): number {
  const { maxTimeBonus, referenceTime } = { ...DEFAULT_CONFIG, ...config }
  const raw = (referenceTime - timeSpent) * (maxTimeBonus / referenceTime)
  return Math.max(0, Math.min(maxTimeBonus, raw))
}

/**
 * Calculate the complete score for a set of answered questions.
 *
 * @param answers - Array of answered questions with correctness and timing
 * @param config - Scoring configuration
 * @returns Full score breakdown
 */
export function calculateGameScore(
  answers: readonly ScoredAnswer[],
  totalQuestions: number,
  config: ScoringConfig = {}
): ScoreResult {
  const merged = { ...DEFAULT_CONFIG, ...config }

  const correctAnswers = answers.filter(a => a.isCorrect).length
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
  const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0)
  const averageTime = totalQuestions > 0 ? totalTime / totalQuestions : 0

  const baseScore = correctAnswers * merged.basePoints
  const timeBonus = answers.reduce((bonus, answer) => {
    if (answer.isCorrect) {
      return bonus + calculateTimeBonus(answer.timeSpent, merged)
    }
    return bonus
  }, 0)

  return {
    correctAnswers,
    totalQuestions,
    accuracy: Math.round(accuracy * 10) / 10,
    totalTime: Math.round(totalTime * 10) / 10,
    averageTime: Math.round(averageTime * 10) / 10,
    score: Math.round(baseScore + timeBonus),
  }
}

/**
 * Determine letter grade from accuracy percentage
 *
 * @param accuracy - Accuracy percentage (0-100)
 * @returns Letter grade (A-F)
 */
export function getGrade(accuracy: number): string {
  if (accuracy >= 90) return 'A'
  if (accuracy >= 80) return 'B'
  if (accuracy >= 70) return 'C'
  if (accuracy >= 60) return 'D'
  return 'F'
}
