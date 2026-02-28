/**
 * Library Barrel Export
 *
 * Central re-export for shared library utilities.
 * Import from `@/lib` instead of individual files for convenience.
 *
 * @module lib
 * @since 1.3.0
 */

// Utilities
export { generateId, formatDuration, shuffleArray } from './utils'
export { createBaseSession } from './session'
export type { BaseSessionFields } from './session'
export { logger } from './logger'
export { calculateGameScore, getGrade } from './scoring'

// Error handling
export { AppError, isAppError, ValidationError } from './errors'

// API helpers
export { apiFetch } from './apiFetch'
export type { ApiClientResponse, ApiFetchOptions } from './apiFetch'
export { fetchQuestions, createGameSession } from './gameApi'
export type { GameQuestion, FetchQuestionsResponse, ActiveGameSession } from './gameApi'
export { fetchQuickQuiz, validateQuizQuestion } from './quickQuizApi'
export type { QuickQuizResponse, QuickQuizSession, QuizResults } from './quickQuizApi'
export { generateCustomQuiz, validateCustomQuizConfig, formatKnowledgeLevel } from './customQuizApi'
export type { CustomQuizResponse } from './customQuizApi'

// API response builders (server-side)
export {
  successResponse,
  createdResponse,
  validationErrorResponse,
  notFoundResponse,
  databaseErrorResponse,
  serverErrorResponse,
  methodNotAllowedResponse,
  rateLimitResponse,
} from './apiResponse'

// API caching
export { useApiCache, invalidateCache, primeCache } from './apiCache'

// Storage
export {
  getHistory,
  addHistoryEntry,
  getDetailedStats,
  getSettings,
  saveSettings,
  getProfile,
  saveProfile,
} from './storage'
export type { GameHistoryEntry, DetailedStats, GameSettings, PlayerProfile } from './storage'

// Room / multiplayer
export { generateRoomCode, isValidRoomCode } from './roomCode'
export type { CreateRoomResponse } from './roomApi'

// Leaderboard & achievements
export { getLeaderboard, getPersonalRecords } from './leaderboard'
export { getAchievements, checkNewAchievements, TOTAL_ACHIEVEMENTS } from './achievements'

// Validation
export { validate, formatZodErrors, getFirstError } from './validation'

// Sharing
export { generateShareText, shareResults, canNativeShare } from './share'
export type { ShareableResult } from './share'

// Adaptive difficulty
export {
  recordCategoryPerformance,
  getRecommendedDifficulty,
  getAllCategoryPerformance,
  clearCategoryPerformance,
} from './adaptiveDifficulty'
export type { DifficultyRecommendation, PerformanceEntry } from './adaptiveDifficulty'
