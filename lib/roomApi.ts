/**
 * Client-side utilities for room management
 */

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
    console.error('Error creating room:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to create room'
    }
  }
}

/**
 * Example usage function for testing
 */
export async function testRoomCreation() {
  console.log('Testing room creation...')
  
  const result = await createRoom()
  
  if (result.success && result.data) {
    console.log('✅ Room created successfully!')
    console.log('Room Code:', result.data.roomCode)
    console.log('Created At:', result.data.createdAt)
    console.log('Status:', result.data.status)
  } else {
    console.error('❌ Failed to create room:', result.error)
  }
  
  return result
}
