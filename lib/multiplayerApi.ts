/**
 * Multiplayer API Client
 *
 * Client-side functions for all multiplayer room/game operations.
 * Each function maps to a corresponding API route.
 *
 * @module lib/multiplayerApi
 * @since 1.1.0
 */

import { apiFetch, type ApiClientResponse } from './apiFetch'
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

/**
 * Create a new multiplayer room
 */
export async function createRoom(params: CreateRoomParams) {
  return apiFetch<CreateRoomResult>('/api/room/create', {
    method: 'POST',
    body: params,
    errorContext: 'create room',
  })
}

/**
 * Join an existing room
 */
export async function joinRoom(params: JoinRoomParams) {
  return apiFetch<JoinRoomResult>('/api/room/join', {
    method: 'POST',
    body: params,
    errorContext: 'join room',
  })
}

/**
 * Get the current room state
 */
export async function getRoomState(roomCode: string) {
  return apiFetch<RoomState>(`/api/room/${roomCode}`, {
    errorContext: 'get room state',
  })
}

/**
 * Start the game (host only)
 */
export async function startGame(roomCode: string, playerId: number) {
  return apiFetch<StartGameResult>(`/api/room/${roomCode}/start`, {
    method: 'POST',
    body: { playerId },
    errorContext: 'start game',
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
  return apiFetch<SubmitAnswerResult>(`/api/room/${roomCode}/answer`, {
    method: 'POST',
    body: { playerId, answer, timeMs },
    errorContext: 'submit answer',
  })
}

/**
 * Advance to the next question (host only)
 */
export async function nextQuestion(roomCode: string, playerId: number) {
  return apiFetch<NextQuestionResult>(`/api/room/${roomCode}/next`, {
    method: 'POST',
    body: { playerId },
    errorContext: 'advance question',
  })
}

/**
 * Get the current question
 */
export async function getCurrentQuestion(roomCode: string, playerId: number) {
  return apiFetch<CurrentQuestionResult>(`/api/room/${roomCode}/question?playerId=${playerId}`, {
    errorContext: 'get current question',
  })
}

/**
 * Leave a room
 */
export async function leaveRoom(roomCode: string, playerId: number) {
  return apiFetch<{ action: string }>(`/api/room/${roomCode}`, {
    method: 'DELETE',
    body: { playerId },
    errorContext: 'leave room',
  })
}
