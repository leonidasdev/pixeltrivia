/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { useGameState } from '@/hooks/useGameState'
import type { Question } from '@/types/game'

const mockQuestions: Question[] = [
  {
    id: 1,
    question: 'What is 2+2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 1,
    category: 'Math',
    difficulty: 'easy',
  },
  {
    id: 2,
    question: 'Capital of France?',
    options: ['Berlin', 'Paris', 'Madrid', 'London'],
    correctAnswer: 1,
    category: 'Geography',
    difficulty: 'easy',
  },
  {
    id: 3,
    question: 'Largest planet?',
    options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
    correctAnswer: 2,
    category: 'Science',
    difficulty: 'medium',
  },
]

describe('useGameState', () => {
  describe('Initial state', () => {
    it('starts in idle state', () => {
      const { result } = renderHook(() => useGameState())

      expect(result.current.state).toBe('idle')
      expect(result.current.score).toBe(0)
      expect(result.current.currentQuestionIndex).toBe(0)
      expect(result.current.questions).toEqual([])
      expect(result.current.answers).toEqual([])
      expect(result.current.streak).toBe(0)
    })
  })

  describe('startGame', () => {
    it('transitions to playing state', () => {
      const { result } = renderHook(() => useGameState())

      act(() => {
        result.current.startGame(mockQuestions, 'Math', 'classic')
      })

      expect(result.current.state).toBe('playing')
      expect(result.current.questions).toHaveLength(3)
      expect(result.current.category).toBe('Math')
      expect(result.current.difficulty).toBe('classic')
      expect(result.current.startTime).toBeInstanceOf(Date)
    })
  })

  describe('submitAnswer', () => {
    it('marks correct answers and increases score', () => {
      const { result } = renderHook(() => useGameState())

      act(() => {
        result.current.startGame(mockQuestions, 'Mixed', 'classic')
      })

      let isCorrect: boolean = false
      act(() => {
        isCorrect = result.current.submitAnswer(1, 5000) // correct
      })

      expect(isCorrect).toBe(true)
      expect(result.current.score).toBeGreaterThan(0)
      expect(result.current.streak).toBe(1)
      expect(result.current.answers).toHaveLength(1)
    })

    it('marks incorrect answers and resets streak', () => {
      const { result } = renderHook(() => useGameState())

      act(() => {
        result.current.startGame(mockQuestions, 'Mixed', 'classic')
      })

      // Get a correct answer first to build streak
      act(() => {
        result.current.submitAnswer(1, 5000)
      })

      expect(result.current.streak).toBe(1)

      // Navigate to next question and submit wrong answer
      act(() => {
        result.current.nextQuestion()
      })

      act(() => {
        result.current.submitAnswer(0, 5000) // wrong
      })

      expect(result.current.streak).toBe(0)
    })

    it('returns false when game is not playing', () => {
      const { result } = renderHook(() => useGameState())

      let isCorrect: boolean = false
      act(() => {
        isCorrect = result.current.submitAnswer(0, 1000)
      })

      expect(isCorrect).toBe(false)
    })

    it('handles null answers (timeout)', () => {
      const { result } = renderHook(() => useGameState())

      act(() => {
        result.current.startGame(mockQuestions, 'Mixed', 'classic')
      })

      let isCorrect: boolean = false
      act(() => {
        isCorrect = result.current.submitAnswer(null, 30000)
      })

      expect(isCorrect).toBe(false)
      expect(result.current.answers).toHaveLength(1)
      expect(result.current.answers[0].isCorrect).toBe(false)
    })
  })

  describe('nextQuestion', () => {
    it('advances to the next question', () => {
      const { result } = renderHook(() => useGameState())

      act(() => {
        result.current.startGame(mockQuestions, 'Mixed', 'classic')
      })

      act(() => {
        result.current.nextQuestion()
      })

      expect(result.current.currentQuestionIndex).toBe(1)
    })

    it('transitions to finished when all questions done', () => {
      const { result } = renderHook(() => useGameState())

      act(() => {
        result.current.startGame(mockQuestions, 'Mixed', 'classic')
      })

      // Advance past all questions
      act(() => {
        result.current.nextQuestion()
      })
      act(() => {
        result.current.nextQuestion()
      })
      act(() => {
        result.current.nextQuestion()
      })

      expect(result.current.state).toBe('finished')
    })
  })

  describe('getCurrentQuestion', () => {
    it('returns the current question', () => {
      const { result } = renderHook(() => useGameState())

      act(() => {
        result.current.startGame(mockQuestions, 'Mixed', 'classic')
      })

      const q = result.current.getCurrentQuestion()
      expect(q?.question).toBe('What is 2+2?')
    })

    it('returns null when no game active', () => {
      const { result } = renderHook(() => useGameState())
      expect(result.current.getCurrentQuestion()).toBeNull()
    })
  })

  describe('pauseGame / resumeGame', () => {
    it('pauses and resumes the game', () => {
      const { result } = renderHook(() => useGameState())

      act(() => {
        result.current.startGame(mockQuestions, 'Mixed', 'classic')
      })

      act(() => {
        result.current.pauseGame()
      })

      expect(result.current.state).toBe('paused')

      act(() => {
        result.current.resumeGame()
      })

      expect(result.current.state).toBe('playing')
    })
  })

  describe('endGame', () => {
    it('transitions to finished state', () => {
      const { result } = renderHook(() => useGameState())

      act(() => {
        result.current.startGame(mockQuestions, 'Mixed', 'classic')
      })

      act(() => {
        result.current.endGame()
      })

      expect(result.current.state).toBe('finished')
    })
  })

  describe('resetGame', () => {
    it('resets to initial state', () => {
      const { result } = renderHook(() => useGameState())

      act(() => {
        result.current.startGame(mockQuestions, 'Mixed', 'classic')
        result.current.submitAnswer(1, 5000)
      })

      act(() => {
        result.current.resetGame()
      })

      expect(result.current.state).toBe('idle')
      expect(result.current.score).toBe(0)
      expect(result.current.questions).toEqual([])
      expect(result.current.answers).toEqual([])
    })
  })

  describe('getSummary', () => {
    it('returns null when game is not finished', () => {
      const { result } = renderHook(() => useGameState())
      expect(result.current.getSummary()).toBeNull()
    })

    it('returns summary when game is finished', () => {
      const { result } = renderHook(() => useGameState())

      act(() => {
        result.current.startGame(mockQuestions, 'Mixed', 'classic')
      })

      // Answer all questions
      act(() => {
        result.current.submitAnswer(1, 5000)
      }) // correct
      act(() => {
        result.current.nextQuestion()
      })
      act(() => {
        result.current.submitAnswer(1, 3000)
      }) // correct
      act(() => {
        result.current.nextQuestion()
      })
      act(() => {
        result.current.submitAnswer(0, 4000)
      }) // wrong
      act(() => {
        result.current.nextQuestion()
      }) // finishes

      const summary = result.current.getSummary()
      expect(summary).not.toBeNull()
      expect(summary?.correctAnswers).toBe(2)
      expect(summary?.totalQuestions).toBe(3)
      expect(summary?.accuracy).toBeCloseTo(66.67, 0)
      expect(summary?.finalScore).toBeGreaterThan(0)
    })
  })

  describe('Score calculation with streaks', () => {
    it('increases score multiplier with consecutive correct answers', () => {
      const { result } = renderHook(() => useGameState())

      act(() => {
        result.current.startGame(mockQuestions, 'Mixed', 'classic')
      })

      act(() => {
        result.current.submitAnswer(1, 5000) // correct, streak=1
      })

      const scoreAfterFirst = result.current.score

      act(() => {
        result.current.nextQuestion()
      })

      act(() => {
        result.current.submitAnswer(1, 5000) // correct, streak=2
      })

      const scoreIncrease = result.current.score - scoreAfterFirst
      // Second correct answer should award more points due to streak
      expect(scoreIncrease).toBeGreaterThanOrEqual(scoreAfterFirst)
    })
  })
})
