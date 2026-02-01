import { type NextRequest, NextResponse } from 'next/server'

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
      return NextResponse.json(
        {
          success: false,
          error: 'Knowledge level is required and must be a string',
          message: 'Invalid request parameters',
        },
        { status: 400 }
      )
    }

    if (typeof numQuestions !== 'number' || numQuestions < 1 || numQuestions > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Number of questions must be between 1 and 50',
          message: 'Invalid request parameters',
        },
        { status: 400 }
      )
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

    console.log('Sending prompt to DeepSeek:', fullPrompt.substring(0, 200) + '...')

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
      console.error('OpenRouter API error:', openRouterResponse.status, errorText)
      throw new Error(`OpenRouter API error: ${openRouterResponse.status} - ${errorText}`)
    }

    const aiResponse: OpenRouterResponse = await openRouterResponse.json()
    console.log('OpenRouter response received')

    // Extract and parse the AI response
    const rawContent = aiResponse.choices?.[0]?.message?.content
    if (!rawContent) {
      throw new Error('No content received from AI')
    }

    console.log('Raw AI response:', rawContent.substring(0, 300) + '...')

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
      console.error('JSON parse error:', parseError)
      console.error('Content that failed to parse:', cleanContent)
      throw new Error('Invalid JSON response from AI')
    }

    // Validate the response structure
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid response format: missing questions array')
    }

    // Format questions with IDs and validation
    const formattedQuestions: QuizQuestion[] = parsedResponse.questions.map(
      (q: any, index: number) => {
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

    console.log(`Successfully generated ${formattedQuestions.length} questions`)

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: formattedQuestions,
        metadata: {
          knowledgeLevel,
          context: context || null,
          requestedQuestions: numQuestions,
          generatedQuestions: formattedQuestions.length,
          generatedAt: new Date().toISOString(),
        },
        message: `Successfully generated ${formattedQuestions.length} custom questions`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Custom quiz generation error:', error)

    // Determine error type and appropriate status code
    let statusCode = 500
    let errorMessage = 'Failed to generate custom quiz'

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        statusCode = 500 // Server configuration error
        errorMessage = 'AI service configuration error'
      } else if (error.message.includes('Invalid request')) {
        statusCode = 400
        errorMessage = error.message
      } else if (error.message.includes('OpenRouter API error')) {
        statusCode = 502 // Bad gateway
        errorMessage = 'AI service temporarily unavailable'
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: 'Failed to generate custom quiz questions',
        details: process.env.NODE_ENV === 'development' ? error?.toString() : undefined,
      },
      { status: statusCode }
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
      usage: {
        method: 'POST',
        body: {
          knowledgeLevel: 'string (classic|college|high-school|middle-school|elementary)',
          context: 'string (optional context for questions)',
          numQuestions: 'number (1-50)',
        },
      },
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
