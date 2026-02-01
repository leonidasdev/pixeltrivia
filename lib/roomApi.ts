/**
 * Client-side utilities for room management
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

/**
 * Example usage function for testing
 */
export async function testRoomCreation() {
  logger.debug('Testing room creation...')

  const result = await createRoom()

  if (result.success && result.data) {
    logger.info('✅ Room created successfully!')
    logger.debug('Room Code:', result.data.roomCode)
    logger.debug('Created At:', result.data.createdAt)
    logger.debug('Status:', result.data.status)
  } else {
    logger.error('❌ Failed to create room:', result.error)
  }

  return result
}
