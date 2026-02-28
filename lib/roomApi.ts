/**
 * Room API Client
 *
 * Client-side utilities for room management.
 *
 * @module lib/roomApi
 * @since 1.0.0
 */

import { apiFetch } from './apiFetch'

export interface CreateRoomResponse {
  success: boolean
  data?: {
    roomCode: string
    createdAt: string
    status: string
  }
  error?: string
  message: string
}

/**
 * Creates a new room by calling the API endpoint
 */
export async function createRoom(): Promise<CreateRoomResponse> {
  return apiFetch<CreateRoomResponse['data']>('/api/room/create', {
    method: 'POST',
    errorContext: 'create room',
  }) as Promise<CreateRoomResponse>
}
