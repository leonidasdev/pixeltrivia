/**
 * Component tests for CustomGameConfigurator
 * Tests form validation, user interactions, and submit handling
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CustomGameConfigurator, {
  type CustomGameConfig,
} from '@/app/components/CustomGameConfigurator'

describe('CustomGameConfigurator', () => {
  const mockOnStartGame = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderComponent = (props = {}) => {
    return render(
      <CustomGameConfigurator
        onStartCustomGame={mockOnStartGame}
        onCancel={mockOnCancel}
        {...props}
      />
    )
  }

  describe('rendering', () => {
    it('should render the component with title', () => {
      renderComponent()

      // Use getByRole to specifically target the heading
      expect(screen.getByRole('heading', { name: /CUSTOM GAME/i })).toBeInTheDocument()
    })

    it('should render knowledge level dropdown', () => {
      renderComponent()

      expect(screen.getByLabelText(/Knowledge Level/i)).toBeInTheDocument()
    })

    it('should render number of questions input', () => {
      renderComponent()

      expect(screen.getByLabelText(/Number of Questions/i)).toBeInTheDocument()
    })

    it('should render context textarea', () => {
      renderComponent()

      expect(screen.getByLabelText(/Custom Context/i)).toBeInTheDocument()
    })

    it('should render start button', () => {
      renderComponent()

      expect(screen.getByRole('button', { name: /START CUSTOM GAME/i })).toBeInTheDocument()
    })

    it('should render cancel button when onCancel is provided', () => {
      renderComponent({ onCancel: mockOnCancel })

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
    })

    it('should not render cancel button when onCancel is not provided', () => {
      renderComponent({ onCancel: undefined })

      expect(screen.queryByRole('button', { name: /Cancel/i })).not.toBeInTheDocument()
    })
  })

  describe('knowledge level selection', () => {
    it('should have Classic as default selection', () => {
      renderComponent()

      const select = screen.getByLabelText(/Knowledge Level/i) as HTMLSelectElement
      expect(select.value).toBe('classic')
    })

    it('should allow selecting different knowledge levels', async () => {
      const user = userEvent.setup()
      renderComponent()

      const select = screen.getByLabelText(/Knowledge Level/i)
      await user.selectOptions(select, 'college')

      expect((select as HTMLSelectElement).value).toBe('college')
    })

    it('should display all knowledge level options', () => {
      renderComponent()

      const options = screen.getAllByRole('option')
      const optionValues = options.map(opt => (opt as HTMLOptionElement).value)

      expect(optionValues).toContain('classic')
      expect(optionValues).toContain('college')
      expect(optionValues).toContain('high-school')
      expect(optionValues).toContain('middle-school')
      expect(optionValues).toContain('elementary')
    })
  })

  describe('number of questions', () => {
    it('should have 10 as default value', () => {
      renderComponent()

      const input = screen.getByLabelText(/Number of Questions/i) as HTMLInputElement
      expect(input.value).toBe('10')
    })

    it('should allow changing number of questions', async () => {
      const user = userEvent.setup()
      renderComponent()

      const input = screen.getByLabelText(/Number of Questions/i) as HTMLInputElement
      // Clear the input and type new value
      await user.clear(input)
      // Use fireEvent for number inputs as userEvent.type appends
      fireEvent.change(input, { target: { value: '25' } })

      expect(input.value).toBe('25')
    })

    it('should clamp value to minimum 1', async () => {
      const user = userEvent.setup()
      renderComponent()

      const input = screen.getByLabelText(/Number of Questions/i)
      await user.clear(input)
      await user.type(input, '0')

      // Component should clamp to 1
      expect(Number((input as HTMLInputElement).value)).toBeGreaterThanOrEqual(1)
    })

    it('should clamp value to maximum 50', async () => {
      const user = userEvent.setup()
      renderComponent()

      const input = screen.getByLabelText(/Number of Questions/i)
      await user.clear(input)
      await user.type(input, '100')

      // Component should clamp to 50
      expect(Number((input as HTMLInputElement).value)).toBeLessThanOrEqual(50)
    })
  })

  describe('context textarea', () => {
    it('should be empty by default', () => {
      renderComponent()

      const textarea = screen.getByLabelText(/Custom Context/i) as HTMLTextAreaElement
      expect(textarea.value).toBe('')
    })

    it('should allow entering context', async () => {
      const user = userEvent.setup()
      renderComponent()

      const textarea = screen.getByLabelText(/Custom Context/i)
      await user.type(textarea, 'Ancient Greek mythology')

      expect((textarea as HTMLTextAreaElement).value).toBe('Ancient Greek mythology')
    })

    it('should show character count', async () => {
      const user = userEvent.setup()
      renderComponent()

      const textarea = screen.getByLabelText(/Custom Context/i)
      await user.type(textarea, 'Test')

      expect(screen.getByText(/4\/1000 characters/i)).toBeInTheDocument()
    })

    it('should have maxLength of 1000', () => {
      renderComponent()

      const textarea = screen.getByLabelText(/Custom Context/i) as HTMLTextAreaElement
      expect(textarea.maxLength).toBe(1000)
    })
  })

  describe('form submission', () => {
    it('should call onStartCustomGame with correct config on submit', async () => {
      const user = userEvent.setup()
      renderComponent()

      // Fill in the form
      const select = screen.getByLabelText(/Knowledge Level/i)
      await user.selectOptions(select, 'college')

      const numInput = screen.getByLabelText(/Number of Questions/i) as HTMLInputElement
      // Use fireEvent.change for number inputs
      fireEvent.change(numInput, { target: { value: '15' } })

      const textarea = screen.getByLabelText(/Custom Context/i)
      await user.type(textarea, 'World History')

      // Submit
      const submitButton = screen.getByRole('button', { name: /START CUSTOM GAME/i })
      await user.click(submitButton)

      expect(mockOnStartGame).toHaveBeenCalledTimes(1)
      expect(mockOnStartGame).toHaveBeenCalledWith({
        knowledgeLevel: 'college',
        context: 'World History',
        numberOfQuestions: 15,
      })
    })

    it('should trim context whitespace on submit', async () => {
      const user = userEvent.setup()
      renderComponent()

      const textarea = screen.getByLabelText(/Custom Context/i)
      await user.type(textarea, '  Test context with spaces  ')

      const submitButton = screen.getByRole('button', { name: /START CUSTOM GAME/i })
      await user.click(submitButton)

      expect(mockOnStartGame).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'Test context with spaces',
        })
      )
    })

    it('should submit with empty context', async () => {
      const user = userEvent.setup()
      renderComponent()

      const submitButton = screen.getByRole('button', { name: /START CUSTOM GAME/i })
      await user.click(submitButton)

      expect(mockOnStartGame).toHaveBeenCalledWith(
        expect.objectContaining({
          context: '',
        })
      )
    })
  })

  describe('cancel functionality', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      renderComponent({ onCancel: mockOnCancel })

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('loading state', () => {
    it('should show loading text when isLoading is true', () => {
      renderComponent({ isLoading: true })

      expect(screen.getByText(/GENERATING/i)).toBeInTheDocument()
    })

    it('should disable submit button when isLoading is true', () => {
      renderComponent({ isLoading: true })

      const submitButton = screen.getByRole('button', { name: /GENERATING/i })
      expect(submitButton).toBeDisabled()
    })

    it('should disable cancel button when isLoading is true', () => {
      renderComponent({ isLoading: true, onCancel: mockOnCancel })

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('accessibility', () => {
    it('should have proper aria-describedby for knowledge level', () => {
      renderComponent()

      const select = screen.getByLabelText(/Knowledge Level/i)
      expect(select).toHaveAttribute('aria-describedby', 'knowledgeLevelHelp')
    })

    it('should have proper aria-describedby for questions input', () => {
      renderComponent()

      const input = screen.getByLabelText(/Number of Questions/i)
      expect(input).toHaveAttribute('aria-describedby', 'questionsHelp')
    })

    it('should have proper aria-describedby for context textarea', () => {
      renderComponent()

      const textarea = screen.getByLabelText(/Custom Context/i)
      expect(textarea).toHaveAttribute('aria-describedby', 'contextHelp')
    })
  })
})
