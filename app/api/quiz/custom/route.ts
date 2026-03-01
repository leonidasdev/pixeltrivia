/**
 * Custom Quiz API — POST /api/quiz/custom
 *
 * Generates AI-powered quiz questions via OpenRouter based
 * on a user-provided topic and knowledge level.
 *
 * @module api/quiz/custom
 * @since 1.0.0
 */

import { type NextRequest } from 'next/server'
import { logger } from '@/lib/logger'
import {
  successResponse,
  validationErrorResponse,
  externalApiErrorResponse,
  serverErrorResponse,
  methodNotAllowedResponse,
} from '@/lib/apiResponse'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

// Types for the API
interface CustomQuizRequest {
  knowledgeLevel: string
  context: string
  numQuestions: number
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  category: string
  difficulty: string
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

export async function POST(request: NextRequest) {
  const rateLimited = rateLimit(request, RATE_LIMITS.aiGeneration)
  if (rateLimited) return rateLimited

  try {
    // Validate environment variables
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured')
    }

    // Parse and validate request body
    const body: CustomQuizRequest = await request.json()
    const { knowledgeLevel, context, numQuestions } = body

    // Validate input parameters
    if (!knowledgeLevel || typeof knowledgeLevel !== 'string') {
      return validationErrorResponse(
        'Knowledge level is required and must be a string',
        'knowledgeLevel'
      )
    }

    if (typeof numQuestions !== 'number' || numQuestions < 1 || numQuestions > 50) {
      return validationErrorResponse('Number of questions must be between 1 and 50', 'numQuestions')
    }

    // Construct prompt for DeepSeek
    const basePrompt = `Generate exactly ${numQuestions} trivia questions for the ${knowledgeLevel} level.`
    const contextPrompt =
      context && context.trim() ? ` Focus on this context: ${context.trim()}` : ''

    const formatPrompt = `

Return the questions in this exact JSON format (valid JSON only, no markdown or explanation):
{
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": ["London", "Berlin", "Paris", "Madrid"],
      "correctAnswer": 2,
      "category": "Geography",
      "difficulty": "easy"
    }
  ]
}

Requirements:
- Each question must have exactly 4 options
- correctAnswer is the 0-based index of the correct option
- Questions should be appropriate for ${knowledgeLevel} level
- Vary the categories and difficulties appropriately
- Return only valid JSON, no additional text`

    const fullPrompt = basePrompt + contextPrompt + formatPrompt

    logger.debug('Sending prompt to DeepSeek:', fullPrompt.substring(0, 200) + '...')

    // Call OpenRouter API with DeepSeek model
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'PixelTrivia',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              'You are a trivia question generator. Always respond with valid JSON only, no markdown formatting or additional text.',
          },
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    })

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text()
      logger.error(`OpenRouter API error: ${openRouterResponse.status}`, errorText)
      throw new Error(`OpenRouter API error: ${openRouterResponse.status} - ${errorText}`)
    }

    const aiResponse: OpenRouterResponse = await openRouterResponse.json()
    logger.debug('OpenRouter response received')

    // Extract and parse the AI response
    const rawContent = aiResponse.choices?.[0]?.message?.content
    if (!rawContent) {
      throw new Error('No content received from AI')
    }

    logger.debug('Raw AI response:', rawContent.substring(0, 300) + '...')

    // Clean up the response (remove markdown if present)
    let cleanContent = rawContent.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    // Parse the JSON response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(cleanContent)
    } catch (parseError) {
      logger.error('JSON parse error:', parseError)
      logger.error('Content that failed to parse:', cleanContent)
      throw new Error('Invalid JSON response from AI')
    }

    // Validate the response structure
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid response format: missing questions array')
    }

    // Type for AI-generated question structure
    interface AIQuestion {
      question?: string
      options?: string[]
      correctAnswer?: number
      category?: string
      difficulty?: string
      explanation?: string
    }

    // Format questions with IDs and validation
    const formattedQuestions: QuizQuestion[] = parsedResponse.questions.map(
      (q: AIQuestion, index: number) => {
        // Validate question structure
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Invalid question format at index ${index}`)
        }

        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          throw new Error(`Invalid correct answer at index ${index}`)
        }

        return {
          id: `custom_${Date.now()}_${index}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          category: q.category || 'Custom',
          difficulty: q.difficulty || knowledgeLevel.toLowerCase(),
        }
      }
    )

    // Ensure we have the requested number of questions
    if (formattedQuestions.length === 0) {
      throw new Error('No valid questions generated')
    }

    logger.info(`Successfully generated ${formattedQuestions.length} questions`)

    // Return success response
    return successResponse(
      formattedQuestions,
      `Successfully generated ${formattedQuestions.length} custom questions`
    )
  } catch (error) {
    logger.error('Custom quiz generation error:', error)

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return serverErrorResponse('AI service configuration error')
      } else if (error.message.includes('Invalid request')) {
        return validationErrorResponse(error.message)
      } else if (error.message.includes('OpenRouter API error')) {
        return externalApiErrorResponse('OpenRouter', 'AI service temporarily unavailable')
      }
    }

    return serverErrorResponse(
      error instanceof Error ? error.message : 'Failed to generate custom quiz'
    )
  }
}

// Handle unsupported HTTP methods
export const GET = () => methodNotAllowedResponse('POST')
export const PUT = () => methodNotAllowedResponse('POST')
export const DELETE = () => methodNotAllowedResponse('POST')
