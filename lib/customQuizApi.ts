// Client utility for custom quiz API interactions

import { logger } from './logger'

export interface CustomQuizRequest {
  knowledgeLevel: string
  context: string
  numQuestions: number
}

export interface CustomQuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  category: string
  difficulty: string
}

export interface CustomQuizResponse {
  success: boolean
  data?: CustomQuizQuestion[]
  metadata?: {
    knowledgeLevel: string
    context: string | null
    requestedQuestions: number
    generatedQuestions: number
    generatedAt: string
  }
  error?: string
  message: string
  details?: string
}

/**
 * Generate custom quiz questions using AI
 * @param config Configuration for the custom quiz
 * @returns Promise with the API response
 */
export async function generateCustomQuiz(config: CustomQuizRequest): Promise<CustomQuizResponse> {
  try {
    const response = await fetch('/api/quiz/custom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    })

    const data: CustomQuizResponse = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('Custom quiz generation failed:', error)

    // Return a properly formatted error response
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to generate custom quiz',
    }
  }
}

/**
 * Test the custom quiz API with sample data
 * @returns Promise with test results
 */
export async function testCustomQuizAPI(): Promise<CustomQuizResponse> {
  const testConfig: CustomQuizRequest = {
    knowledgeLevel: 'college',
    context: 'Ancient Greek mythology and gods',
    numQuestions: 5,
  }

  logger.debug('Testing custom quiz API with config:', testConfig)
  return generateCustomQuiz(testConfig)
}

/**
 * Validate custom quiz configuration
 * @param config Configuration to validate
 * @returns Validation result with any errors
 */
export function validateCustomQuizConfig(config: CustomQuizRequest): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Validate knowledge level
  const validLevels = ['classic', 'college', 'high-school', 'middle-school', 'elementary']
  if (!config.knowledgeLevel || !validLevels.includes(config.knowledgeLevel)) {
    errors.push('Knowledge level must be one of: ' + validLevels.join(', '))
  }

  // Validate number of questions
  if (
    typeof config.numQuestions !== 'number' ||
    config.numQuestions < 1 ||
    config.numQuestions > 50
  ) {
    errors.push('Number of questions must be between 1 and 50')
  }

  // Validate context length (optional field)
  if (config.context && config.context.length > 1000) {
    errors.push('Context must be 1000 characters or less')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Format knowledge level for display
 * @param level Knowledge level string
 * @returns Formatted display string
 */
export function formatKnowledgeLevel(level: string): string {
  const levelMap: Record<string, string> = {
    classic: 'Classic',
    college: 'College Level',
    'high-school': 'High School',
    'middle-school': 'Middle School',
    elementary: 'Elementary',
  }

  return levelMap[level] || level
}

/**
 * Get estimated generation time based on number of questions
 * @param numQuestions Number of questions to generate
 * @returns Estimated time in seconds
 */
export function getEstimatedGenerationTime(numQuestions: number): number {
  // Base time of 5 seconds + 1 second per question
  return Math.max(5, 5 + numQuestions)
}

/**
 * Create a game session from custom quiz results
 * @param questions Generated questions
 * @param config Original configuration
 * @returns Game session object
 */
export function createCustomGameSession(
  questions: CustomQuizQuestion[],
  config: CustomQuizRequest
) {
  return {
    id: `custom_${Date.now()}`,
    type: 'custom' as const,
    questions,
    config,
    createdAt: new Date().toISOString(),
    currentQuestionIndex: 0,
    score: 0,
    answers: [] as number[],
    timeStarted: null as string | null,
    timeEnded: null as string | null,
  }
}
