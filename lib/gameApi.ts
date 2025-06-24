/**
 * Types and utilities for game questions
 */

export interface GameQuestion {
  id: number
  questionNumber: number
  question: string
  options: string[]
  correctAnswer: number
  category: string
  difficulty: string
  timeLimit: number
}

export interface FetchQuestionsResponse {
  success: boolean
  data?: {
    questions: GameQuestion[]
    totalQuestions: number
    selectedCategory: string
    selectedDifficulty: string
    timeLimit: number
  }
  error?: string
  message: string
}

/**
 * Fetches questions for a quick game
 */
export async function fetchQuestions(
  category: string, 
  difficulty: string, 
  limit: number = 10
): Promise<FetchQuestionsResponse> {
  try {
    const params = new URLSearchParams({
      category,
      difficulty,
      limit: limit.toString()
    })

    const response = await fetch(`/api/game/questions?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data: FetchQuestionsResponse = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch questions')
    }

    return data
  } catch (error) {
    console.error('Error fetching questions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to fetch questions'
    }
  }
}

/**
 * Game session management
 */
export interface GameSession {
  sessionId: string
  questions: GameQuestion[]
  currentQuestionIndex: number
  score: number
  startTime: Date
  answers: Array<{
    questionId: number
    selectedAnswer: number
    isCorrect: boolean
    timeSpent: number
  }>
  category: string
  difficulty: string
}

/**
 * Creates a new game session
 */
export function createGameSession(
  questions: GameQuestion[], 
  category: string, 
  difficulty: string
): GameSession {
  return {
    sessionId: `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    questions,
    currentQuestionIndex: 0,
    score: 0,
    startTime: new Date(),
    answers: [],
    category,
    difficulty
  }
}

/**
 * Calculates the final score based on correct answers and time
 */
export function calculateScore(session: GameSession): {
  correctAnswers: number
  totalQuestions: number
  accuracy: number
  totalTime: number
  averageTime: number
  finalScore: number
} {
  const correctAnswers = session.answers.filter(a => a.isCorrect).length
  const totalQuestions = session.questions.length
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
  const totalTime = session.answers.reduce((sum, a) => sum + a.timeSpent, 0)
  const averageTime = totalQuestions > 0 ? totalTime / totalQuestions : 0
  
  // Score calculation: Base points for correct answers + time bonus
  const basePoints = correctAnswers * 100
  const timeBonus = session.answers.reduce((bonus, answer) => {
    if (answer.isCorrect) {
      // Bonus points for answering quickly (max 50 bonus per question)
      const timeBonus = Math.max(0, (30 - answer.timeSpent) * (50 / 30))
      return bonus + timeBonus
    }
    return bonus
  }, 0)
  
  const finalScore = Math.round(basePoints + timeBonus)
  
  return {
    correctAnswers,
    totalQuestions,
    accuracy: Math.round(accuracy * 10) / 10,
    totalTime: Math.round(totalTime * 10) / 10,
    averageTime: Math.round(averageTime * 10) / 10,
    finalScore
  }
}

/**
 * Example usage for testing
 */
export async function testQuestionFetching() {
  console.log('Testing question fetching...')
  
  const result = await fetchQuestions('General Knowledge', 'classic', 5)
  
  if (result.success && result.data) {
    console.log('✅ Questions fetched successfully!')
    console.log('Category:', result.data.selectedCategory)
    console.log('Difficulty:', result.data.selectedDifficulty)
    console.log('Total Questions:', result.data.totalQuestions)
    console.log('Questions:', result.data.questions)
  } else {
    console.error('❌ Failed to fetch questions:', result.error)
  }
  
  return result
}
