import { type NextRequest } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import {
  successResponse,
  validationErrorResponse,
  notFoundResponse,
  databaseErrorResponse,
  serverErrorResponse,
  methodNotAllowedResponse,
} from '@/lib/apiResponse'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

export async function GET(request: NextRequest) {
  const rateLimited = rateLimit(request, RATE_LIMITS.quiz)
  if (rateLimited) return rateLimited

  try {
    const supabase = getSupabaseClient()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Validate parameters
    if (!category) {
      return validationErrorResponse('Category parameter is required', 'category')
    }

    if (!difficulty) {
      return validationErrorResponse('Difficulty parameter is required', 'difficulty')
    }

    if (limit < 1 || limit > 50) {
      return validationErrorResponse('Limit must be between 1 and 50', 'limit')
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
      query = query.limit(limit * 2)
    } else {
      query = query.eq('difficulty', dbDifficulty).limit(limit * 2)
    }

    const { data: questions, error: fetchError } = await query

    if (fetchError) {
      logger.error('Error fetching questions:', fetchError)
      return databaseErrorResponse('Failed to fetch questions from database')
    }

    if (!questions || questions.length === 0) {
      return notFoundResponse('questions', `${category}/${difficulty}`)
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
    }

    // Randomize using Fisher-Yates and limit the questions
    const shuffled = [...filteredQuestions]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    const selected = shuffled.slice(0, limit)

    // Format questions for the game
    const formattedQuestions = selected.map((q, index) => ({
      id: q.id,
      questionNumber: index + 1,
      question: q.question_text,
      options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
      correctAnswer: q.correct_answer,
      category: q.category,
      difficulty: q.difficulty,
      timeLimit: 30,
    }))

    return successResponse(
      {
        questions: formattedQuestions,
        totalQuestions: formattedQuestions.length,
        selectedCategory: category,
        selectedDifficulty: difficulty,
        timeLimit: 30,
      },
      'Questions fetched successfully'
    )
  } catch (error) {
    logger.error('Quick game questions error:', error)
    return serverErrorResponse(error instanceof Error ? error.message : 'Unknown error occurred')
  }
}

// Handle unsupported HTTP methods
export const POST = () => methodNotAllowedResponse('GET')
