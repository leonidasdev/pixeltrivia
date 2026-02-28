/**
 * Component tests for GameQuestion
 * Tests answer rendering, keyboard navigation (1-4 / A-D),
 * feedback states, and timer display.
 */

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameQuestion } from '@/app/components/multiplayer/GameQuestion'
import type { MultiplayerQuestion } from '@/types/room'

const mockQuestion: MultiplayerQuestion = {
  index: 0,
  questionText: 'What is the capital of France?',
  options: ['Berlin', 'Madrid', 'Paris', 'London'],
  category: 'geography',
  difficulty: 'easy',
}

const defaultProps = {
  question: mockQuestion,
  questionNumber: 1,
  totalQuestions: 10,
  timeRemaining: 25,
  hasAnswered: false,
  selectedAnswer: null,
  wasCorrect: null,
  correctAnswer: null,
  isLoading: false,
  onAnswer: jest.fn(),
}

describe('GameQuestion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ---------- Rendering ----------

  describe('rendering', () => {
    it('should render the question text', () => {
      render(<GameQuestion {...defaultProps} />)
      expect(screen.getByText('What is the capital of France?')).toBeInTheDocument()
    })

    it('should render all four answer options', () => {
      render(<GameQuestion {...defaultProps} />)
      expect(screen.getByText('Berlin')).toBeInTheDocument()
      expect(screen.getByText('Madrid')).toBeInTheDocument()
      expect(screen.getByText('Paris')).toBeInTheDocument()
      expect(screen.getByText('London')).toBeInTheDocument()
    })

    it('should display option labels A, B, C, D', () => {
      render(<GameQuestion {...defaultProps} />)
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('B')).toBeInTheDocument()
      expect(screen.getByText('C')).toBeInTheDocument()
      expect(screen.getByText('D')).toBeInTheDocument()
    })

    it('should display question counter', () => {
      render(<GameQuestion {...defaultProps} />)
      expect(screen.getByText(/Question/)).toHaveTextContent(/1.*of.*10/)
    })

    it('should display the timer', () => {
      render(<GameQuestion {...defaultProps} />)
      expect(screen.getByText(/25\s*s/)).toBeInTheDocument()
    })

    it('should display category badge when present', () => {
      render(<GameQuestion {...defaultProps} />)
      expect(screen.getByText('geography')).toBeInTheDocument()
    })

    it('should not render category badge when absent', () => {
      const q = { ...mockQuestion, category: undefined }
      render(<GameQuestion {...defaultProps} question={q} />)
      expect(screen.queryByText('geography')).not.toBeInTheDocument()
    })

    it('should display difficulty badge when present', () => {
      render(<GameQuestion {...defaultProps} />)
      expect(screen.getByText('easy')).toBeInTheDocument()
    })

    it('should show keyboard hint when interactive', () => {
      render(<GameQuestion {...defaultProps} />)
      expect(screen.getByText(/Press 1-4 or A-D to answer/i)).toBeInTheDocument()
    })

    it('should hide keyboard hint after answering', () => {
      render(<GameQuestion {...defaultProps} hasAnswered={true} selectedAnswer={0} />)
      expect(screen.queryByText(/Press 1-4 or A-D to answer/i)).not.toBeInTheDocument()
    })
  })

  // ---------- Click interactions ----------

  describe('click interactions', () => {
    it('should call onAnswer with index when option clicked', async () => {
      const user = userEvent.setup()
      render(<GameQuestion {...defaultProps} />)

      await user.click(screen.getByText('Paris'))
      expect(defaultProps.onAnswer).toHaveBeenCalledWith(2)
    })

    it('should not call onAnswer when already answered', async () => {
      const user = userEvent.setup()
      render(<GameQuestion {...defaultProps} hasAnswered={true} selectedAnswer={1} />)

      await user.click(screen.getByText('Paris'))
      expect(defaultProps.onAnswer).not.toHaveBeenCalled()
    })

    it('should not call onAnswer when revealing', async () => {
      const user = userEvent.setup()
      render(<GameQuestion {...defaultProps} correctAnswer={2} />)

      await user.click(screen.getByText('Berlin'))
      expect(defaultProps.onAnswer).not.toHaveBeenCalled()
    })

    it('should not call onAnswer when loading', async () => {
      const user = userEvent.setup()
      render(<GameQuestion {...defaultProps} isLoading={true} />)

      await user.click(screen.getByText('Paris'))
      expect(defaultProps.onAnswer).not.toHaveBeenCalled()
    })
  })

  // ---------- Keyboard navigation ----------

  describe('keyboard navigation', () => {
    it('should select first answer with key "1"', () => {
      render(<GameQuestion {...defaultProps} />)
      fireEvent.keyDown(window, { key: '1' })
      expect(defaultProps.onAnswer).toHaveBeenCalledWith(0)
    })

    it('should select second answer with key "2"', () => {
      render(<GameQuestion {...defaultProps} />)
      fireEvent.keyDown(window, { key: '2' })
      expect(defaultProps.onAnswer).toHaveBeenCalledWith(1)
    })

    it('should select third answer with key "3"', () => {
      render(<GameQuestion {...defaultProps} />)
      fireEvent.keyDown(window, { key: '3' })
      expect(defaultProps.onAnswer).toHaveBeenCalledWith(2)
    })

    it('should select fourth answer with key "4"', () => {
      render(<GameQuestion {...defaultProps} />)
      fireEvent.keyDown(window, { key: '4' })
      expect(defaultProps.onAnswer).toHaveBeenCalledWith(3)
    })

    it('should select first answer with key "a"', () => {
      render(<GameQuestion {...defaultProps} />)
      fireEvent.keyDown(window, { key: 'a' })
      expect(defaultProps.onAnswer).toHaveBeenCalledWith(0)
    })

    it('should select second answer with key "b"', () => {
      render(<GameQuestion {...defaultProps} />)
      fireEvent.keyDown(window, { key: 'b' })
      expect(defaultProps.onAnswer).toHaveBeenCalledWith(1)
    })

    it('should select answer with uppercase key "C"', () => {
      render(<GameQuestion {...defaultProps} />)
      fireEvent.keyDown(window, { key: 'C' })
      expect(defaultProps.onAnswer).toHaveBeenCalledWith(2)
    })

    it('should select answer with key "D"', () => {
      render(<GameQuestion {...defaultProps} />)
      fireEvent.keyDown(window, { key: 'D' })
      expect(defaultProps.onAnswer).toHaveBeenCalledWith(3)
    })

    it('should NOT respond to keyboard when already answered', () => {
      render(<GameQuestion {...defaultProps} hasAnswered={true} selectedAnswer={0} />)
      fireEvent.keyDown(window, { key: '2' })
      expect(defaultProps.onAnswer).not.toHaveBeenCalled()
    })

    it('should NOT respond to keyboard when revealing', () => {
      render(<GameQuestion {...defaultProps} correctAnswer={2} />)
      fireEvent.keyDown(window, { key: '1' })
      expect(defaultProps.onAnswer).not.toHaveBeenCalled()
    })

    it('should NOT respond to keyboard when loading', () => {
      render(<GameQuestion {...defaultProps} isLoading={true} />)
      fireEvent.keyDown(window, { key: '3' })
      expect(defaultProps.onAnswer).not.toHaveBeenCalled()
    })

    it('should ignore unrelated keys', () => {
      render(<GameQuestion {...defaultProps} />)
      fireEvent.keyDown(window, { key: '5' })
      fireEvent.keyDown(window, { key: 'x' })
      fireEvent.keyDown(window, { key: 'Enter' })
      expect(defaultProps.onAnswer).not.toHaveBeenCalled()
    })

    it('should cleanup listener on unmount', () => {
      const spy = jest.spyOn(window, 'removeEventListener')
      const { unmount } = render(<GameQuestion {...defaultProps} />)
      unmount()
      expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function))
      spy.mockRestore()
    })
  })

  // ---------- Feedback states ----------

  describe('feedback states', () => {
    it('should show waiting message after answering', () => {
      render(<GameQuestion {...defaultProps} hasAnswered={true} selectedAnswer={1} />)
      expect(screen.getByText(/Answer submitted/i)).toBeInTheDocument()
    })

    it('should show correct feedback in reveal', () => {
      render(
        <GameQuestion
          {...defaultProps}
          hasAnswered={true}
          selectedAnswer={2}
          wasCorrect={true}
          correctAnswer={2}
        />
      )
      expect(screen.getByText(/Correct!/i)).toBeInTheDocument()
    })

    it('should show wrong feedback in reveal', () => {
      render(
        <GameQuestion
          {...defaultProps}
          hasAnswered={true}
          selectedAnswer={0}
          wasCorrect={false}
          correctAnswer={2}
        />
      )
      expect(screen.getByText(/Wrong answer!/i)).toBeInTheDocument()
    })
  })

  // ---------- Timer styling ----------

  describe('timer styles', () => {
    it('should apply warning class when time is low', () => {
      render(<GameQuestion {...defaultProps} timeRemaining={8} />)
      const timer = screen.getByText(/8\s*s/)
      // Parent div should have yellow warning styling
      expect(timer.closest('div')).toHaveClass('text-yellow-400')
    })

    it('should apply critical class when time is very low', () => {
      render(<GameQuestion {...defaultProps} timeRemaining={3} />)
      const timer = screen.getByText(/3\s*s/)
      expect(timer.closest('div')).toHaveClass('text-red-400')
    })
  })
})
