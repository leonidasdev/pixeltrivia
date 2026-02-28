/**
 * Shared Session Factory
 *
 * Centralises the common initialisation pattern used by all three
 * game-mode session constructors (`createGameSession`, `createQuickQuizSession`,
 * `createCustomGameSession`).  Each specialised factory spreads the base
 * fields and adds mode-specific properties.
 *
 * @module lib/session
 * @since 1.4.0
 */

import { generateId } from './utils'

// ============================================================================
// Types
// ============================================================================

/**
 * Fields shared by every session regardless of game mode.
 *
 * @template Q - The question type used by a particular game mode
 */
export interface BaseSessionFields<Q> {
  /** Unique identifier prefixed with the game-mode label */
  sessionId: string
  /** Ordered list of questions for this session */
  questions: Q[]
  /** Zero-based index of the question currently being displayed */
  currentQuestionIndex: number
  /** Timestamp marking when the session was created */
  startTime: Date
}

// ============================================================================
// Factory
// ============================================================================

/**
 * Create the base fields that every session shares.
 *
 * Callers are expected to spread the result and add any mode-specific
 * fields (e.g. `score`, `category`, `isComplete`).
 *
 * @template Q - The question type for this session
 * @param prefix - ID prefix passed to {@link generateId} (e.g. `"game"`, `"quick"`, `"custom"`)
 * @param questions - The questions to include in the session
 * @returns An object containing the shared session fields
 *
 * @example
 * ```ts
 * const session = {
 *   ...createBaseSession('game', questions),
 *   score: 0,
 *   category: 'Science',
 * };
 * ```
 */
export function createBaseSession<Q>(prefix: string, questions: Q[]): BaseSessionFields<Q> {
  return {
    sessionId: generateId(prefix),
    questions,
    currentQuestionIndex: 0,
    startTime: new Date(),
  }
}
