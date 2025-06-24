import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { category } = body

    // Validate category parameter
    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category is required',
          message: 'Please provide a category in the request body'
        },
        { status: 400 }
      )
    }

    if (typeof category !== 'string' || category.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category',
          message: 'Category must be a non-empty string'
        },
        { status: 400 }
      )
    }

    const trimmedCategory = category.trim()

    // Query Supabase for questions matching the category
    const { data: questions, error: fetchError } = await supabase
      .from('questions')
      .select('id, question_text, options, correct_answer, category, difficulty')
      .ilike('category', `%${trimmedCategory}%`) // Case-insensitive partial match
      .limit(20) // Get more than needed for randomization

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError)
      return NextResponse.json(
        {
          success: false,
          error: 'Database query failed',
          message: 'Failed to fetch questions from the database'
        },
        { status: 500 }
      )
    }

    // Check if we found any questions
    if (!questions || questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No questions found',
          message: `No questions found for category "${trimmedCategory}"`
        },
        { status: 404 }
      )
    }

    // Randomize and select exactly 10 questions (or fewer if not enough available)
    const shuffledQuestions = questions
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)

    // Format the questions for the quiz
    const formattedQuestions = shuffledQuestions.map(q => {
      // Parse options if they're stored as JSON string
      let options: string[]
      try {
        options = Array.isArray(q.options) ? q.options : JSON.parse(q.options)
      } catch (parseError) {
        console.error('Error parsing options for question:', q.id, parseError)
        options = []
      }

      return {
        id: q.id,
        question: q.question_text,
        options,
        correctAnswer: q.correct_answer,
        category: q.category,
        difficulty: q.difficulty
      }
    })

    // Validate that all questions have the required structure
    const validQuestions = formattedQuestions.filter(q => 
      q.question && 
      Array.isArray(q.options) && 
      q.options.length > 0 && 
      typeof q.correctAnswer === 'number' &&
      q.correctAnswer >= 0 &&
      q.correctAnswer < q.options.length
    )

    if (validQuestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid questions found',
          message: 'Questions found but they contain invalid data'
        },
        { status: 500 }
      )
    }

    // Return the successful response
    return NextResponse.json({
      success: true,
      data: validQuestions,
      meta: {
        totalFound: questions.length,
        returned: validQuestions.length,
        category: trimmedCategory
      },
      message: `Found ${validQuestions.length} questions for category "${trimmedCategory}"`
    })

  } catch (error) {
    console.error('Quick quiz API error:', error)

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Internal server error'
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
      message: 'This endpoint only supports POST requests. Send category in request body.'
    },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only supports POST requests'
    },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only supports POST requests'
    },
    { status: 405 }
  )
}
