import { type NextRequest } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { generateRoomCode, isValidRoomCode } from '@/lib/roomCode'
import { logger } from '@/lib/logger'
import {
  createdResponse,
  databaseErrorResponse,
  serverErrorResponse,
  methodNotAllowedResponse,
} from '@/lib/apiResponse'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const rateLimited = rateLimit(request, RATE_LIMITS.roomCreation)
  if (rateLimited) return rateLimited

  try {
    const supabase = getSupabaseClient()

    // Generate a unique room code
    let roomCode: string
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10

    // Ensure the generated room code is unique in the database
    do {
      roomCode = generateRoomCode()
      attempts++

      const { data: existingRoom, error: checkError } = await supabase
        .from('rooms')
        .select('code')
        .eq('code', roomCode)
        .single()

      if (checkError && checkError.code === 'PGRST116') {
        isUnique = true
      } else if (checkError) {
        logger.error('Error checking room code uniqueness:', checkError)
        return databaseErrorResponse('Database error while checking room code')
      } else if (existingRoom) {
        isUnique = false
      }

      if (attempts >= maxAttempts) {
        return serverErrorResponse('Unable to generate unique room code after multiple attempts')
      }
    } while (!isUnique)

    if (!isValidRoomCode(roomCode)) {
      return serverErrorResponse('Generated room code is invalid')
    }

    // Create the new room in Supabase
    const { data: newRoom, error: insertError } = await supabase
      .from('rooms')
      .insert({
        code: roomCode,
        created_at: new Date().toISOString(),
        status: 'waiting',
        max_players: 8,
      })
      .select()
      .single()

    if (insertError) {
      logger.error('Error creating room:', insertError)
      return databaseErrorResponse('Failed to create room in database')
    }

    return createdResponse(
      {
        roomCode: newRoom.code,
        createdAt: newRoom.created_at,
        status: newRoom.status,
      },
      'Room created successfully'
    )
  } catch (error) {
    logger.error('Room creation error:', error)
    return serverErrorResponse(error instanceof Error ? error.message : 'Unknown error occurred')
  }
}

// Handle unsupported HTTP methods
export const GET = () => methodNotAllowedResponse('POST')
export const PUT = () => methodNotAllowedResponse('POST')
export const DELETE = () => methodNotAllowedResponse('POST')
