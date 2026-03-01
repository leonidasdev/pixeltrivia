/**
 * Game API Client
 *
 * Types and utilities for game questions and sessions.
 *
 * @module lib/gameApi
 * @since 1.0.0
 */

import { apiFetch } from './apiFetch'
import { createBaseSession } from './session'
import type { Question } from '@/types'
import { STORAGE_KEYS, MULTIPLAYER_STORAGE_KEYS } from '@/constants/game'

// ============================================================================
// Game Session Storage
// ============================================================================

/** Game mode for session persistence */
export type GameMode = 'quick' | 'custom' | 'advanced' | 'multiplayer'

/** Minimal session data stored in localStorage for the play page */
export interface GameSessionData {
  questions: Question[]
  category: string
  difficulty: string
  mode: GameMode
}

/**
 * Saves a game session to localStorage for the play page to consume.
 * All game modes (quick, custom, advanced) use this single entry point
 * instead of duplicating the `localStorage.setItem(...)` call.
 */
export function saveGameSession(session: GameSessionData): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_GAME_SESSION, JSON.stringify(session))
}

// ============================================================================
// Multiplayer Session Storage
// ============================================================================

/** Multiplayer session stored across create → lobby → play pages */
export interface MultiplayerSession {
  playerId: number
  roomCode: string
  isHost: boolean
}

/**
 * Saves multiplayer session identifiers to localStorage.
 * Used after creating or joining a room.
 */
export function saveMultiplayerSession(session: MultiplayerSession): void {
  localStorage.setItem(MULTIPLAYER_STORAGE_KEYS.PLAYER_ID, String(session.playerId))
  localStorage.setItem(MULTIPLAYER_STORAGE_KEYS.ROOM_CODE, session.roomCode)
  localStorage.setItem(MULTIPLAYER_STORAGE_KEYS.IS_HOST, String(session.isHost))
}

/**
 * Loads multiplayer session identifiers from localStorage.
 * Returns null if no session is found.
 */
export function loadMultiplayerSession(): MultiplayerSession | null {
  const storedId = localStorage.getItem(MULTIPLAYER_STORAGE_KEYS.PLAYER_ID)
  const storedCode = localStorage.getItem(MULTIPLAYER_STORAGE_KEYS.ROOM_CODE)
  const storedHost = localStorage.getItem(MULTIPLAYER_STORAGE_KEYS.IS_HOST)

  if (!storedId || !storedCode) return null

  return {
    playerId: parseInt(storedId),
    roomCode: storedCode,
    isHost: storedHost === 'true',
  }
}

/**
 * Clears multiplayer session from localStorage.
 * Used when leaving a room or finishing a game.
 */
export function clearMultiplayerSession(): void {
  localStorage.removeItem(MULTIPLAYER_STORAGE_KEYS.PLAYER_ID)
  localStorage.removeItem(MULTIPLAYER_STORAGE_KEYS.ROOM_CODE)
  localStorage.removeItem(MULTIPLAYER_STORAGE_KEYS.IS_HOST)
}

export interface GameQuestion extends Question {
  id: number
  questionNumber: number
  timeLimit: number
}

/**
 * Client-side response shape for fetching game questions.
 *
 * @see {@link import('@/types/api').ApiResponse} for the canonical API envelope
 */
export interface FetchQuestionsResponse {
  success: boolean
  data?: {
    questions: GameQuestion[]
    totalQuestions: number
    selectedCategory: string
    selectedDifficulty: string
    timeLimit: number
  }
  error?: string
  code?: string
  message?: string
  meta?: {
    timestamp: string
  }
}

/**
 * Fetches questions for a quick game
 */
export async function fetchQuestions(
  category: string,
  difficulty: string,
  limit: number = 10
): Promise<FetchQuestionsResponse> {
  const params = new URLSearchParams({
    category,
    difficulty,
    limit: limit.toString(),
  })

  return apiFetch<FetchQuestionsResponse['data']>(`/api/game/questions?${params}`, {
    errorContext: 'fetch questions',
  }) as Promise<FetchQuestionsResponse>
}

/**
 * Client-side game session state (lightweight).
 *
 * Unlike the canonical {@link import('@/types/game').GameSession GameSession},
 * this type omits `state`, `isComplete`, and `timestamp` on answers, since
 * those are managed in the component layer for the active game.
 *
 * @see {@link import('@/types/game').GameSession} for the full session type
 */
export interface ActiveGameSession {
  sessionId: string
  questions: GameQuestion[]
  currentQuestionIndex: number
  score: number
  startTime: Date
  answers: Array<{
    questionId: number
    selectedAnswer: number
    isCorrect: boolean
    timeSpent: number
  }>
  category: string
  difficulty: string
}

/**
 * Creates a new game session
 */
export function createGameSession(
  questions: GameQuestion[],
  category: string,
  difficulty: string
): ActiveGameSession {
  return {
    ...createBaseSession('game', questions),
    score: 0,
    answers: [],
    category,
    difficulty,
  }
}
