import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Validate parameters
    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category parameter is required',
          message: 'Please specify a category',
        },
        { status: 400 }
      )
    }

    if (!difficulty) {
      return NextResponse.json(
        {
          success: false,
          error: 'Difficulty parameter is required',
          message: 'Please specify a difficulty level',
        },
        { status: 400 }
      )
    }

    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid limit parameter',
          message: 'Limit must be between 1 and 50',
        },
        { status: 400 }
      )
    }

    // Map difficulty levels to our database difficulty values
    const difficultyMap: { [key: string]: string } = {
      elementary: 'easy',
      'middle-school': 'easy',
      'high-school': 'medium',
      'college-level': 'hard',
      classic: 'medium', // Default for classic mixed difficulty
    }

    const dbDifficulty = difficultyMap[difficulty] || 'medium'

    // Build query based on category and difficulty
    let query = supabase
      .from('questions')
      .select('id, question_text, options, correct_answer, category, difficulty')

    // For classic mode, get mixed categories and difficulties
    if (difficulty === 'classic') {
      // Get random questions from various categories
      query = query.limit(limit * 2) // Get more to have variety after filtering
    } else {
      // Filter by difficulty and try to match category
      query = query.eq('difficulty', dbDifficulty).limit(limit * 2) // Get extra in case we need to filter
    }

    const { data: questions, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching questions:', fetchError)
      throw new Error('Failed to fetch questions from database')
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No questions found',
          message: `No questions available for category "${category}" with difficulty "${difficulty}"`,
        },
        { status: 404 }
      )
    }

    // Filter and randomize questions
    let filteredQuestions = questions

    // For non-classic modes, try to filter by category match
    if (difficulty !== 'classic') {
      const categoryMatches = questions.filter(
        q =>
          q.category?.toLowerCase().includes(category.toLowerCase()) ||
          category.toLowerCase().includes(q.category?.toLowerCase() || '')
      )

      if (categoryMatches.length >= limit) {
        filteredQuestions = categoryMatches
      }
      // If not enough category matches, use all questions with the right difficulty
    }

    // Randomize and limit the questions
    const shuffled = filteredQuestions.sort(() => Math.random() - 0.5).slice(0, limit)

    // Format questions for the game
    const formattedQuestions = shuffled.map((q, index) => ({
      id: q.id,
      questionNumber: index + 1,
      question: q.question_text,
      options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
      correctAnswer: q.correct_answer,
      category: q.category,
      difficulty: q.difficulty,
      timeLimit: 30, // 30 seconds per question
    }))

    return NextResponse.json(
      {
        success: true,
        data: {
          questions: formattedQuestions,
          totalQuestions: formattedQuestions.length,
          selectedCategory: category,
          selectedDifficulty: difficulty,
          timeLimit: 30,
        },
        message: 'Questions fetched successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Quick game questions error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to fetch questions',
      },
      { status: 500 }
    )
  }
}

// Handle unsupported HTTP methods
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only supports GET requests',
    },
    { status: 405 }
  )
}
