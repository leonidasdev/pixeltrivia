import { type NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { generateRoomCode, isValidRoomCode } from '@/lib/roomCode'

export async function POST(_request: NextRequest) {
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

      // Check if this room code already exists
      const { data: existingRoom, error: checkError } = await supabase
        .from('rooms')
        .select('code')
        .eq('code', roomCode)
        .single()

      if (checkError && checkError.code === 'PGRST116') {
        // No rows found - this means the code is unique
        isUnique = true
      } else if (checkError) {
        // Some other error occurred
        console.error('Error checking room code uniqueness:', checkError)
        throw new Error('Database error while checking room code')
      } else if (existingRoom) {
        // Room code already exists, try again
        isUnique = false
      }

      // Prevent infinite loops
      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique room code after multiple attempts')
      }
    } while (!isUnique)

    // Validate the generated room code format
    if (!isValidRoomCode(roomCode)) {
      throw new Error('Generated room code is invalid')
    }

    // Create the new room in Supabase
    const { data: newRoom, error: insertError } = await supabase
      .from('rooms')
      .insert({
        code: roomCode,
        created_at: new Date().toISOString(),
        status: 'waiting',
        max_players: 8, // Default max players
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating room:', insertError)
      throw new Error('Failed to create room in database')
    }

    // Return the successful response
    return NextResponse.json(
      {
        success: true,
        data: {
          roomCode: newRoom.code,
          createdAt: newRoom.created_at,
          status: newRoom.status,
        },
        message: 'Room created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Room creation error:', error)

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to create room',
      },
      { status: 500 }
    )
  }
}

// Handle unsupported HTTP methods
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only supports POST requests',
    },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only supports POST requests',
    },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only supports POST requests',
    },
    { status: 405 }
  )
}
