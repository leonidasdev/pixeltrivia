import { type NextRequest } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { shuffleArray } from '@/lib/utils'
import {
  successResponse,
  validationErrorResponse,
  notFoundResponse,
  databaseErrorResponse,
  serverErrorResponse,
  methodNotAllowedResponse,
} from '@/lib/apiResponse'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const rateLimited = rateLimit(request, RATE_LIMITS.quiz)
  if (rateLimited) return rateLimited

  try {
    const supabase = getSupabaseClient()

    // Parse the request body
    const body = await request.json()
    const { category, difficulty } = body

    // Validate category parameter
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return validationErrorResponse(
        'Category is required and must be a non-empty string',
        'category'
      )
    }

    const trimmedCategory = category.trim()

    // Query Supabase for questions matching the category (+ optional difficulty)
    let query = supabase
      .from('questions')
      .select('id, question_text, options, correct_answer, category, difficulty, image_url')
      .ilike('category', `%${trimmedCategory}%`) // Case-insensitive partial match

    // Filter by difficulty when provided (skip for 'classic' which means mixed)
    if (difficulty && typeof difficulty === 'string' && difficulty !== 'classic') {
      query = query.eq('difficulty', difficulty)
    }

    const { data: questions, error: fetchError } = await query.limit(20)

    if (fetchError) {
      logger.error('Supabase fetch error:', fetchError)
      return databaseErrorResponse('Failed to fetch questions from the database')
    }

    // Check if we found any questions
    if (!questions || questions.length === 0) {
      return notFoundResponse('questions', trimmedCategory)
    }

    // Randomize using Fisher-Yates and select exactly 10 questions
    const shuffledQuestions = shuffleArray(questions)
    const selectedQuestions = shuffledQuestions.slice(0, 10)

    // Format the questions for the quiz
    const formattedQuestions = selectedQuestions.map(q => {
      // Parse options if they're stored as JSON string
      let options: string[]
      try {
        options = Array.isArray(q.options) ? q.options : JSON.parse(q.options)
      } catch (parseError) {
        logger.error(`Error parsing options for question ${q.id}`, parseError)
        options = []
      }

      return {
        id: q.id,
        question: q.question_text,
        options,
        correctAnswer: q.correct_answer,
        category: q.category,
        difficulty: q.difficulty,
        ...(q.image_url ? { imageUrl: q.image_url } : {}),
      }
    })

    // Validate that all questions have the required structure
    const validQuestions = formattedQuestions.filter(
      q =>
        q.question &&
        Array.isArray(q.options) &&
        q.options.length > 0 &&
        typeof q.correctAnswer === 'number' &&
        q.correctAnswer >= 0 &&
        q.correctAnswer < q.options.length
    )

    if (validQuestions.length === 0) {
      return serverErrorResponse('Questions found but they contain invalid data')
    }

    // Return the successful response
    return successResponse(
      validQuestions,
      `Found ${validQuestions.length} questions for category "${trimmedCategory}"`
    )
  } catch (error) {
    logger.error('Quick quiz API error:', error)

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return validationErrorResponse('Request body must be valid JSON')
    }

    return serverErrorResponse(error instanceof Error ? error.message : 'Unknown error occurred')
  }
}

// Handle unsupported HTTP methods
export const GET = () => methodNotAllowedResponse('POST')
export const PUT = () => methodNotAllowedResponse('POST')
export const DELETE = () => methodNotAllowedResponse('POST')
