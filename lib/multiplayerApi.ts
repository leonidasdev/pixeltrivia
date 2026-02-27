/**
 * Multiplayer API Client
 *
 * Client-side functions for all multiplayer room/game operations.
 * Each function maps to a corresponding API route.
 *
 * @module lib/multiplayerApi
 * @since 1.1.0
 */

import { logger } from './logger'
import type { MultiplayerQuestion, MultiplayerPlayer, QuestionResult } from '@/types/room'

// ============================================================================
// Response Types
// ============================================================================

export interface CreateRoomParams {
  playerName: string
  avatar: string
  gameMode?: string
  category?: string
  maxPlayers?: number
  timeLimit?: number
  questionCount?: number
}

export interface CreateRoomResult {
  roomCode: string
  playerId: number
  createdAt: string
  status: string
  maxPlayers: number
  timeLimit: number
  questionCount: number
  gameMode: string
}

export interface JoinRoomParams {
  roomCode: string
  playerName: string
  avatar: string
}

export interface JoinRoomResult {
  playerId: number
  room: {
    code: string
    status: string
    maxPlayers: number
    timeLimit: number
    questionCount: number
    gameMode: string
    category: string | null
    createdAt: string
    players: MultiplayerPlayer[]
  }
}

export interface RoomState {
  code: string
  status: 'waiting' | 'active' | 'finished'
  currentQuestion: number
  totalQuestions: number
  questionStartTime: string | null
  timeLimit: number
  maxPlayers: number
  gameMode: string | null
  category: string | null
  createdAt: string
  players: MultiplayerPlayer[]
}

export interface StartGameResult {
  started: boolean
  totalQuestions: number
  currentQuestion: MultiplayerQuestion
  questionStartTime: string
}

export interface SubmitAnswerResult {
  accepted: boolean
  correct: boolean
  scoreGained: number
  totalScore: number
}

export interface NextQuestionResult {
  gameOver: boolean
  correctAnswer: number | null
  questionResults: QuestionResult['playerResults']
  nextQuestion?: MultiplayerQuestion | null
  questionStartTime?: string
  finalScores?: { playerId: number; playerName: string; totalScore: number }[]
}

export interface CurrentQuestionResult {
  question: MultiplayerQuestion
  totalQuestions: number
  questionStartTime: string
  timeLimit: number
  hasAnswered: boolean
  players: (MultiplayerPlayer & { hasAnswered: boolean })[]
}

// ============================================================================
// API Functions
// ============================================================================

async function apiCall<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message: string }> {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })

    const json = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: json.error || `HTTP ${response.status}`,
        message: json.message || 'Request failed',
      }
    }

    return { success: true, data: json.data, message: json.message || 'OK' }
  } catch (error) {
    logger.error(`API call failed: ${url}`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      message: 'Failed to connect to server',
    }
  }
}

/**
 * Create a new multiplayer room
 */
export async function createRoom(params: CreateRoomParams) {
  return apiCall<CreateRoomResult>('/api/room/create', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

/**
 * Join an existing room
 */
export async function joinRoom(params: JoinRoomParams) {
  return apiCall<JoinRoomResult>('/api/room/join', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

/**
 * Get the current room state
 */
export async function getRoomState(roomCode: string) {
  return apiCall<RoomState>(`/api/room/${roomCode}`)
}

/**
 * Start the game (host only)
 */
export async function startGame(roomCode: string, playerId: number) {
  return apiCall<StartGameResult>(`/api/room/${roomCode}/start`, {
    method: 'POST',
    body: JSON.stringify({ playerId }),
  })
}

/**
 * Submit an answer
 */
export async function submitAnswer(
  roomCode: string,
  playerId: number,
  answer: number,
  timeMs: number
) {
  return apiCall<SubmitAnswerResult>(`/api/room/${roomCode}/answer`, {
    method: 'POST',
    body: JSON.stringify({ playerId, answer, timeMs }),
  })
}

/**
 * Advance to the next question (host only)
 */
export async function nextQuestion(roomCode: string, playerId: number) {
  return apiCall<NextQuestionResult>(`/api/room/${roomCode}/next`, {
    method: 'POST',
    body: JSON.stringify({ playerId }),
  })
}

/**
 * Get the current question
 */
export async function getCurrentQuestion(roomCode: string, playerId: number) {
  return apiCall<CurrentQuestionResult>(`/api/room/${roomCode}/question?playerId=${playerId}`)
}

/**
 * Leave a room
 */
export async function leaveRoom(roomCode: string, playerId: number) {
  return apiCall<{ action: string }>(`/api/room/${roomCode}`, {
    method: 'DELETE',
    body: JSON.stringify({ playerId }),
  })
}
