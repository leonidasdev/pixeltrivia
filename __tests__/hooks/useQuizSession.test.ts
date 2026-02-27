/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { useQuizSession } from '@/hooks/useQuizSession'
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

describe('useQuizSession', () => {
  describe('Initial state', () => {
    it('starts with no active session', () => {
      const { result } = renderHook(() => useQuizSession())

      expect(result.current.session).toBeNull()
      expect(result.current.isActive).toBe(false)
      expect(result.current.currentQuestionNumber).toBe(0)
      expect(result.current.totalQuestions).toBe(0)
    })
  })

  describe('initSession', () => {
    it('creates a new quiz session', () => {
      const { result } = renderHook(() => useQuizSession())

      act(() => {
        result.current.initSession(mockQuestions, 'quick')
      })

      expect(result.current.isActive).toBe(true)
      expect(result.current.session).not.toBeNull()
      expect(result.current.totalQuestions).toBe(3)
      expect(result.current.currentQuestionNumber).toBe(1)
      expect(result.current.session?.quizType).toBe('quick')
    })

    it('accepts custom settings', () => {
      const { result } = renderHook(() => useQuizSession())

      act(() => {
        result.current.initSession(mockQuestions, 'custom', {
          timeLimit: 60,
          showFeedback: false,
        })
      })

      expect(result.current.session?.settings.timeLimit).toBe(60)
      expect(result.current.session?.settings.showFeedback).toBe(false)
    })
  })

  describe('submitAnswer', () => {
    it('records correct answers', () => {
      const { result } = renderHook(() => useQuizSession())

      act(() => {
        result.current.initSession(mockQuestions, 'quick', { shuffleQuestions: false })
      })

      let isCorrect: boolean = false
      act(() => {
        isCorrect = result.current.submitAnswer(1, 5000)
      })

      expect(isCorrect).toBe(true)
      expect(result.current.correctCount).toBe(1)
    })

    it('records incorrect answers', () => {
      const { result } = renderHook(() => useQuizSession())

      act(() => {
        result.current.initSession(mockQuestions, 'quick')
      })

      let isCorrect: boolean = false
      act(() => {
        isCorrect = result.current.submitAnswer(0, 5000)
      })

      expect(isCorrect).toBe(false)
      expect(result.current.correctCount).toBe(0)
    })

    it('returns false when no session active', () => {
      const { result } = renderHook(() => useQuizSession())

      let isCorrect: boolean = false
      act(() => {
        isCorrect = result.current.submitAnswer(0, 1000)
      })

      expect(isCorrect).toBe(false)
    })

    it('shows feedback when enabled', () => {
      const { result } = renderHook(() => useQuizSession())

      act(() => {
        result.current.initSession(mockQuestions, 'quick', {
          showFeedback: true,
          shuffleQuestions: false,
        })
      })

      act(() => {
        result.current.submitAnswer(1, 5000)
      })

      expect(result.current.isShowingFeedback).toBe(true)
      expect(result.current.lastAnswerResult).not.toBeNull()
      expect(result.current.lastAnswerResult?.isCorrect).toBe(true)
    })
  })

  describe('getCurrentQuestion', () => {
    it('returns the current question', () => {
      const { result } = renderHook(() => useQuizSession())

      act(() => {
        result.current.initSession(mockQuestions, 'quick', { shuffleQuestions: false })
      })

      const q = result.current.getCurrentQuestion()
      expect(q?.question).toBe('What is 2+2?')
    })

    it('returns null when no session', () => {
      const { result } = renderHook(() => useQuizSession())
      expect(result.current.getCurrentQuestion()).toBeNull()
    })
  })

  describe('nextQuestion', () => {
    it('advances to next question', () => {
      const { result } = renderHook(() => useQuizSession())

      act(() => {
        result.current.initSession(mockQuestions, 'quick', { shuffleQuestions: false })
      })

      act(() => {
        result.current.nextQuestion()
      })

      expect(result.current.currentQuestionNumber).toBe(2)
      expect(result.current.isShowingFeedback).toBe(false)
    })

    it('marks session complete after last question', () => {
      const { result } = renderHook(() => useQuizSession())

      act(() => {
        result.current.initSession(mockQuestions, 'quick')
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

      expect(result.current.isActive).toBe(false)
      expect(result.current.session?.isComplete).toBe(true)
    })
  })

  describe('hasNextQuestion', () => {
    it('returns true when more questions remain', () => {
      const { result } = renderHook(() => useQuizSession())

      act(() => {
        result.current.initSession(mockQuestions, 'quick')
      })

      expect(result.current.hasNextQuestion()).toBe(true)
    })

    it('returns false on last question', () => {
      const { result } = renderHook(() => useQuizSession())

      act(() => {
        result.current.initSession(mockQuestions, 'quick')
      })

      act(() => {
        result.current.nextQuestion()
      })
      act(() => {
        result.current.nextQuestion()
      })

      expect(result.current.hasNextQuestion()).toBe(false)
    })
  })

  describe('completeQuiz', () => {
    it('returns results with correct stats', () => {
      const { result } = renderHook(() => useQuizSession())

      act(() => {
        result.current.initSession(mockQuestions, 'quick', { shuffleQuestions: false })
      })

      // Answer all questions
      act(() => {
        result.current.submitAnswer(1, 5000)
      }) // correct
      act(() => {
        result.current.nextQuestion()
      })
      act(() => {
        result.current.submitAnswer(0, 3000)
      }) // wrong
      act(() => {
        result.current.nextQuestion()
      })
      act(() => {
        result.current.submitAnswer(2, 4000)
      }) // correct

      let results = null as ReturnType<typeof result.current.completeQuiz>
      act(() => {
        results = result.current.completeQuiz()
      })

      expect(results).not.toBeNull()
      expect(results?.correctCount).toBe(2)
      expect(results?.totalQuestions).toBe(3)
      expect(results?.accuracy).toBeCloseTo(66.67, 0)
      expect(results?.score).toBeGreaterThan(0)
      expect(results?.quizType).toBe('quick')
    })

    it('returns null when no session', () => {
      const { result } = renderHook(() => useQuizSession())
      expect(result.current.completeQuiz()).toBeNull()
    })
  })

  describe('resetSession', () => {
    it('clears the session', () => {
      const { result } = renderHook(() => useQuizSession())

      act(() => {
        result.current.initSession(mockQuestions, 'quick')
      })

      act(() => {
        result.current.resetSession()
      })

      expect(result.current.session).toBeNull()
      expect(result.current.isActive).toBe(false)
      expect(result.current.isShowingFeedback).toBe(false)
    })
  })
})
