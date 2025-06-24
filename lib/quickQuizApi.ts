/**
 * Client-side utilities for quick quiz functionality
 */

export interface QuickQuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  category: string
  difficulty: string
}

export interface QuickQuizResponse {
  success: boolean
  data?: QuickQuizQuestion[]
  meta?: {
    totalFound: number
    returned: number
    category: string
  }
  error?: string
  message: string
}

/**
 * Fetches quick quiz questions for a specific category
 */
export async function fetchQuickQuiz(category: string): Promise<QuickQuizResponse> {
  try {
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      throw new Error('Category is required and must be a non-empty string')
    }

    const response = await fetch('/api/quiz/quick', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category: category.trim() })
    })

    const data: QuickQuizResponse = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return data
  } catch (error) {
    console.error('Error fetching quick quiz:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to fetch quiz questions'
    }
  }
}

/**
 * Validates a quiz question structure
 */
export function validateQuizQuestion(question: any): question is QuickQuizQuestion {
  return (
    typeof question === 'object' &&
    question !== null &&
    typeof question.id === 'number' &&
    typeof question.question === 'string' &&
    question.question.length > 0 &&
    Array.isArray(question.options) &&
    question.options.length > 1 &&
    question.options.every((opt: any) => typeof opt === 'string') &&
    typeof question.correctAnswer === 'number' &&
    question.correctAnswer >= 0 &&
    question.correctAnswer < question.options.length &&
    typeof question.category === 'string' &&
    typeof question.difficulty === 'string'
  )
}

/**
 * Shuffles the questions array and returns a new array
 */
export function shuffleQuestions(questions: QuickQuizQuestion[]): QuickQuizQuestion[] {
  const shuffled = [...questions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Creates a quiz session with timing and scoring
 */
export interface QuickQuizSession {
  sessionId: string
  questions: QuickQuizQuestion[]
  currentQuestionIndex: number
  answers: Array<{
    questionId: number
    selectedAnswer: number | null
    isCorrect: boolean
    timeSpent: number
    timestamp: Date
  }>
  startTime: Date
  category: string
  isComplete: boolean
}

export function createQuickQuizSession(
  questions: QuickQuizQuestion[], 
  category: string
): QuickQuizSession {
  return {
    sessionId: `quick-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    questions: shuffleQuestions(questions),
    currentQuestionIndex: 0,
    answers: [],
    startTime: new Date(),
    category,
    isComplete: false
  }
}

/**
 * Records an answer in the quiz session
 */
export function recordAnswer(
  session: QuickQuizSession,
  selectedAnswer: number | null,
  timeSpent: number
): QuickQuizSession {
  const currentQuestion = session.questions[session.currentQuestionIndex]
  if (!currentQuestion) return session

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer

  const updatedSession: QuickQuizSession = {
    ...session,
    answers: [
      ...session.answers,
      {
        questionId: currentQuestion.id,
        selectedAnswer,
        isCorrect,
        timeSpent,
        timestamp: new Date()
      }
    ],
    currentQuestionIndex: session.currentQuestionIndex + 1,
    isComplete: session.currentQuestionIndex + 1 >= session.questions.length
  }

  return updatedSession
}

/**
 * Calculates final quiz results
 */
export interface QuizResults {
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  totalTime: number
  averageTime: number
  score: number
  grade: string
}

export function calculateQuizResults(session: QuickQuizSession): QuizResults {
  const totalQuestions = session.questions.length
  const correctAnswers = session.answers.filter(a => a.isCorrect).length
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
  const totalTime = session.answers.reduce((sum, a) => sum + a.timeSpent, 0)
  const averageTime = totalQuestions > 0 ? totalTime / totalQuestions : 0

  // Calculate score (100 points per correct answer, time bonus up to 20 points)
  let score = 0
  session.answers.forEach(answer => {
    if (answer.isCorrect) {
      // Base points for correct answer
      score += 100
      
      // Time bonus (faster = more points, max 20 bonus per question)
      const timeBonus = Math.max(0, Math.min(20, (30 - answer.timeSpent) * (20 / 30)))
      score += timeBonus
    }
  })

  // Determine grade based on accuracy
  let grade = 'F'
  if (accuracy >= 90) grade = 'A'
  else if (accuracy >= 80) grade = 'B'
  else if (accuracy >= 70) grade = 'C'
  else if (accuracy >= 60) grade = 'D'

  return {
    totalQuestions,
    correctAnswers,
    accuracy: Math.round(accuracy * 10) / 10,
    totalTime: Math.round(totalTime * 10) / 10,
    averageTime: Math.round(averageTime * 10) / 10,
    score: Math.round(score),
    grade
  }
}

/**
 * Example usage for testing the API
 */
export async function testQuickQuizAPI() {
  console.log('Testing Quick Quiz API...')
  
  try {
    // Test with a valid category
    const result = await fetchQuickQuiz('Science')
    console.log('API Response:', result)
    
    if (result.success && result.data) {
      console.log(`✅ Success! Found ${result.data.length} questions for Science category`)
      
      // Validate each question
      const validQuestions = result.data.filter(validateQuizQuestion)
      console.log(`📝 ${validQuestions.length} out of ${result.data.length} questions are valid`)
      
      // Create a test session
      if (validQuestions.length > 0) {
        const session = createQuickQuizSession(validQuestions, 'Science')
        console.log('🎮 Test session created:', session.sessionId)
      }
    } else {
      console.error('❌ API call failed:', result.error)
    }
    
    return result
  } catch (error) {
    console.error('❌ Test failed:', error)
    return null
  }
}
