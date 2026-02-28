/**
 * Room API Client
 *
 * Client-side utilities for room management.
 *
 * @module lib/roomApi
 * @since 1.0.0
 */

import { logger } from './logger'

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
  try {
    const response = await fetch('/api/room/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data: CreateRoomResponse = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create room')
    }

    return data
  } catch (error) {
    logger.error('Error creating room:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to create room',
    }
  }
}
