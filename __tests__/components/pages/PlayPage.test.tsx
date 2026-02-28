/**
 * Component tests for the Single-Player Play Page
 *
 * Tests session loading from localStorage, question rendering,
 * answer handling, keyboard navigation, timer, score/streak,
 * results screen, and edge cases.
 *
 * @module __tests__/components/pages/PlayPage.test
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

// ── Mocks ──

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockPlay = jest.fn()
jest.mock('@/hooks/useSound', () => ({
  useSound: () => ({ play: mockPlay }),
}))

// Mock UI components that are complex but not under test
jest.mock('@/app/components/ui', () => {
  return {
    LoadingOverlay: ({ label }: { label: string }) => <div data-testid="loading">{label}</div>,
    ToastContainer: ({ messages }: { messages: { id: string; message: string }[] }) => (
      <div data-testid="toast-container">
        {messages.map((m: { id: string; message: string }) => (
          <div key={m.id}>{m.message}</div>
        ))}
      </div>
    ),
    useToast: () => ({
      messages: [],
      dismissToast: jest.fn(),
      toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
      },
    }),
    AnimatedBackground: () => <div data-testid="animated-bg" />,
    PixelConfetti: ({ active }: { active: boolean }) =>
      active ? <div data-testid="confetti" /> : null,
    ScorePopup: () => null,
    AnswerFeedback: () => null,
    PageTransition: ({
      children,
      className,
    }: {
      children: React.ReactNode
      className?: string
    }) => <div className={className}>{children}</div>,
    ShareButton: () => <button data-testid="share-btn">Share</button>,
    PixelButton: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
      <button data-testid="pixel-btn" onClick={onClick}>
        {children}
      </button>
    ),
  }
})

jest.mock('@/lib/storage', () => ({
  addHistoryEntry: jest.fn(() => true),
  getProfile: jest.fn(() => ({ name: 'TestPlayer' })),
}))

jest.mock('@/lib/scoring', () => ({
  getGrade: jest.fn((accuracy: number) => {
    if (accuracy >= 90) return 'S'
    if (accuracy >= 80) return 'A'
    if (accuracy >= 70) return 'B'
    return 'C'
  }),
  calculateGameScore: jest.fn(() => 100),
}))

import PlayPage from '@/app/game/play/page'
import { addHistoryEntry } from '@/lib/storage'

// ── Test data ──

const makeSession = (count = 3) => ({
  sessionId: 'test-session-1',
  questions: Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    question: `Question ${i + 1}?`,
    options: ['Alpha', 'Beta', 'Gamma', 'Delta'],
    correctAnswer: 0,
    category: 'Science',
    difficulty: 'medium',
    timeLimit: 30,
  })),
  category: 'Science',
  difficulty: 'medium',
  currentQuestionIndex: 0,
  score: 0,
  startTime: new Date().toISOString(),
  answers: [],
})

function storeSession(session = makeSession()) {
  localStorage.setItem('currentGameSession', JSON.stringify(session))
}

// ── Suite ──

describe('PlayPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  // ============================
  //  Session bootstrap
  // ============================

  describe('Session loading', () => {
    it('redirects to home if no session in localStorage', () => {
      render(<PlayPage />)
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('redirects if session JSON is invalid', () => {
      localStorage.setItem('currentGameSession', 'not-json!!!')
      render(<PlayPage />)
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('redirects if session has no questions', () => {
      localStorage.setItem(
        'currentGameSession',
        JSON.stringify({ questions: [], category: 'X', difficulty: 'medium' })
      )
      render(<PlayPage />)
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('renders the first question when session is valid', () => {
      storeSession()
      render(<PlayPage />)
      expect(screen.getByText('Question 1?')).toBeInTheDocument()
    })

    it('shows question counter', () => {
      storeSession()
      render(<PlayPage />)
      expect(screen.getByText(/Question 1 of 3/)).toBeInTheDocument()
    })
  })

  // ============================
  //  Question rendering
  // ============================

  describe('Question display', () => {
    it('renders all four answer options', () => {
      storeSession()
      render(<PlayPage />)
      expect(screen.getByText('Alpha')).toBeInTheDocument()
      expect(screen.getByText('Beta')).toBeInTheDocument()
      expect(screen.getByText('Gamma')).toBeInTheDocument()
      expect(screen.getByText('Delta')).toBeInTheDocument()
    })

    it('shows option labels A B C D', () => {
      storeSession()
      render(<PlayPage />)
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('B')).toBeInTheDocument()
      expect(screen.getByText('C')).toBeInTheDocument()
      expect(screen.getByText('D')).toBeInTheDocument()
    })

    it('shows category and difficulty badges', () => {
      storeSession()
      render(<PlayPage />)
      expect(screen.getByText('Science')).toBeInTheDocument()
      expect(screen.getByText('medium')).toBeInTheDocument()
    })

    it('shows keyboard hint on desktop', () => {
      storeSession()
      render(<PlayPage />)
      expect(screen.getByText(/Press 1-4 or A-D to answer/)).toBeInTheDocument()
    })

    it('renders image when question has imageUrl', () => {
      const session = makeSession(1)
      session.questions[0].imageUrl = 'https://example.com/test.png'
      localStorage.setItem('currentGameSession', JSON.stringify(session))
      render(<PlayPage />)
      const img = screen.getByAltText('Question illustration')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/test.png')
    })

    it('does not render image when question has no imageUrl', () => {
      storeSession()
      render(<PlayPage />)
      expect(screen.queryByAltText('Question illustration')).not.toBeInTheDocument()
    })
  })

  // ============================
  //  Answer interaction
  // ============================

  describe('Answering questions', () => {
    it('shows Correct feedback when clicking the right answer', () => {
      storeSession()
      render(<PlayPage />)
      fireEvent.click(screen.getByText('Alpha')) // correctAnswer = 0
      expect(screen.getByText('Correct!')).toBeInTheDocument()
    })

    it('shows Wrong feedback when clicking wrong answer', () => {
      storeSession()
      render(<PlayPage />)
      fireEvent.click(screen.getByText('Beta')) // index 1, wrong
      expect(screen.getByText('Wrong answer!')).toBeInTheDocument()
    })

    it('shows NEXT QUESTION button after answering', () => {
      storeSession()
      render(<PlayPage />)
      fireEvent.click(screen.getByText('Alpha'))
      expect(screen.getByText(/NEXT QUESTION/)).toBeInTheDocument()
    })

    it('shows SEE RESULTS on the last question', () => {
      storeSession(makeSession(1))
      render(<PlayPage />)
      fireEvent.click(screen.getByText('Alpha'))
      expect(screen.getByText(/SEE RESULTS/)).toBeInTheDocument()
    })

    it('prevents answering twice', () => {
      storeSession()
      render(<PlayPage />)
      fireEvent.click(screen.getByText('Alpha'))
      // After answering, clicking another option should not change the state
      fireEvent.click(screen.getByText('Beta'))
      // Still showing the correct feedback from first click
      expect(screen.getByText('Correct!')).toBeInTheDocument()
    })
  })

  // ============================
  //  Keyboard navigation
  // ============================

  describe('Keyboard navigation', () => {
    it('selects answer with key "1"', () => {
      storeSession()
      render(<PlayPage />)
      fireEvent.keyDown(window, { key: '1' })
      expect(screen.getByText('Correct!')).toBeInTheDocument()
    })

    it('selects answer with key "a"', () => {
      storeSession()
      render(<PlayPage />)
      fireEvent.keyDown(window, { key: 'a' })
      expect(screen.getByText('Correct!')).toBeInTheDocument()
    })

    it('selects wrong answer with key "2"', () => {
      storeSession()
      render(<PlayPage />)
      fireEvent.keyDown(window, { key: '2' })
      expect(screen.getByText('Wrong answer!')).toBeInTheDocument()
    })

    it('advances with Enter after answering', () => {
      storeSession()
      render(<PlayPage />)
      fireEvent.keyDown(window, { key: '1' })
      expect(screen.getByText('Correct!')).toBeInTheDocument()
      fireEvent.keyDown(window, { key: 'Enter' })
      expect(screen.getByText('Question 2?')).toBeInTheDocument()
    })

    it('advances with Space after answering', () => {
      storeSession()
      render(<PlayPage />)
      fireEvent.keyDown(window, { key: '1' })
      fireEvent.keyDown(window, { key: ' ' })
      expect(screen.getByText('Question 2?')).toBeInTheDocument()
    })

    it('does not answer with invalid keys', () => {
      storeSession()
      render(<PlayPage />)
      fireEvent.keyDown(window, { key: '5' })
      fireEvent.keyDown(window, { key: 'x' })
      expect(screen.queryByText('Correct!')).not.toBeInTheDocument()
      expect(screen.queryByText('Wrong answer!')).not.toBeInTheDocument()
    })
  })

  // ============================
  //  Score & streak
  // ============================

  describe('Score and streak', () => {
    it('shows score after correct answer', () => {
      storeSession()
      render(<PlayPage />)
      fireEvent.click(screen.getByText('Alpha'))
      expect(screen.getByText(/pts/)).toBeInTheDocument()
    })

    it('shows streak indicator after 2+ correct in a row', () => {
      storeSession()
      render(<PlayPage />)
      // Answer Q1 correctly
      fireEvent.click(screen.getByText('Alpha'))
      fireEvent.keyDown(window, { key: 'Enter' })
      // Answer Q2 correctly
      fireEvent.click(screen.getByText('Alpha'))
      // Should indicate streak
      expect(screen.getByText(/streak/i)).toBeInTheDocument()
    })
  })

  // ============================
  //  Timer
  // ============================

  describe('Timer', () => {
    it('renders the timer display', () => {
      storeSession()
      render(<PlayPage />)
      // Timer shows some seconds remaining
      expect(screen.getByText('⏱')).toBeInTheDocument()
    })
  })

  // ============================
  //  Game completion
  // ============================

  describe('Results screen', () => {
    function playThrough() {
      storeSession(makeSession(2))
      render(<PlayPage />)
      // Q1
      fireEvent.click(screen.getByText('Alpha'))
      fireEvent.keyDown(window, { key: 'Enter' })
      // Q2
      fireEvent.click(screen.getByText('Alpha'))
      fireEvent.keyDown(window, { key: 'Enter' })
    }

    it('shows Game Over heading', () => {
      playThrough()
      expect(screen.getByText('Game Over!')).toBeInTheDocument()
    })

    it('shows accuracy stat', () => {
      playThrough()
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('shows correct count', () => {
      playThrough()
      expect(screen.getByText('2/2')).toBeInTheDocument()
    })

    it('shows grade', () => {
      playThrough()
      expect(screen.getByText(/Grade:/)).toBeInTheDocument()
    })

    it('saves history entry', () => {
      playThrough()
      expect(addHistoryEntry).toHaveBeenCalledTimes(1)
      expect(addHistoryEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'quick',
          category: 'Science',
          difficulty: 'medium',
          correctAnswers: 2,
          totalQuestions: 2,
        })
      )
    })

    it('clears localStorage session', () => {
      playThrough()
      expect(localStorage.getItem('currentGameSession')).toBeNull()
    })

    it('shows share button', () => {
      playThrough()
      expect(screen.getByTestId('share-btn')).toBeInTheDocument()
    })

    it('has PLAY AGAIN button that navigates to quick game', () => {
      playThrough()
      fireEvent.click(screen.getByText(/PLAY AGAIN/))
      expect(mockPush).toHaveBeenCalledWith('/game/quick')
    })

    it('has HOME button that navigates to root', () => {
      playThrough()
      fireEvent.click(screen.getByText(/HOME/))
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('has VIEW STATS button', () => {
      playThrough()
      fireEvent.click(screen.getByText(/VIEW STATS/))
      expect(mockPush).toHaveBeenCalledWith('/game/stats')
    })

    it('shows confetti on completion', () => {
      playThrough()
      expect(screen.getByTestId('confetti')).toBeInTheDocument()
    })
  })
})
