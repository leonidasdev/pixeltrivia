/**
 * Component tests for QuickGameSelector
 * Tests category selection, accordion behavior, and user interactions
 */

import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuickGameSelector from '@/app/components/QuickGameSelector'

describe('QuickGameSelector', () => {
  const mockOnCategorySelected = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderComponent = (props = {}) => {
    return render(
      <QuickGameSelector
        onCategorySelected={mockOnCategorySelected}
        onCancel={mockOnCancel}
        {...props}
      />
    )
  }

  // Helper to find difficulty accordion buttons by their aria-controls attribute
  const getDifficultyButton = (difficulty: string) => {
    const sectionId = `section-${difficulty.toLowerCase().replace(' ', '-')}`
    return (
      screen
        .getByRole('button', { expanded: undefined })
        .parentElement?.querySelector(`button[aria-controls="${sectionId}"]`) ||
      screen.getAllByRole('button').find(btn => btn.getAttribute('aria-controls') === sectionId)
    )
  }

  describe('rendering', () => {
    it('should render the component with title', () => {
      renderComponent()

      expect(screen.getByText(/QUICK GAME/i)).toBeInTheDocument()
    })

    it('should render all difficulty sections', () => {
      renderComponent()

      expect(screen.getByText('Elementary')).toBeInTheDocument()
      expect(screen.getByText('Middle School')).toBeInTheDocument()
      expect(screen.getByText('High School')).toBeInTheDocument()
      expect(screen.getByText('College Level')).toBeInTheDocument()
      expect(screen.getByText('Classic')).toBeInTheDocument()
    })

    it('should render cancel button when onCancel is provided', () => {
      renderComponent({ onCancel: mockOnCancel })

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
    })

    it('should not render cancel button when onCancel is not provided', () => {
      renderComponent({ onCancel: undefined })

      expect(screen.queryByRole('button', { name: /Cancel/i })).not.toBeInTheDocument()
    })

    it('should show Classic section expanded by default', () => {
      renderComponent()

      // Find the Classic accordion button by its aria-controls
      const classicButton = screen.getByRole('button', {
        name: (name, element) => element?.getAttribute('aria-controls') === 'section-classic',
      })
      expect(classicButton).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('accordion behavior', () => {
    it('should expand a section when clicked', async () => {
      const user = userEvent.setup()
      renderComponent()

      // Find Elementary button by aria-controls
      const elementaryButton = screen.getByRole('button', {
        name: (name, element) => element?.getAttribute('aria-controls') === 'section-elementary',
      })
      expect(elementaryButton).toHaveAttribute('aria-expanded', 'false')

      // Click to expand
      await user.click(elementaryButton)

      expect(elementaryButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should collapse a section when clicking it again', async () => {
      const user = userEvent.setup()
      renderComponent()

      // Classic is expanded by default
      const classicButton = screen.getByRole('button', {
        name: (name, element) => element?.getAttribute('aria-controls') === 'section-classic',
      })
      expect(classicButton).toHaveAttribute('aria-expanded', 'true')

      // Click to collapse
      await user.click(classicButton)

      expect(classicButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should collapse previous section when expanding another', async () => {
      const user = userEvent.setup()
      renderComponent()

      // Classic is expanded by default
      const classicButton = screen.getByRole('button', {
        name: (name, element) => element?.getAttribute('aria-controls') === 'section-classic',
      })
      const elementaryButton = screen.getByRole('button', {
        name: (name, element) => element?.getAttribute('aria-controls') === 'section-elementary',
      })

      expect(classicButton).toHaveAttribute('aria-expanded', 'true')

      // Expand Elementary
      await user.click(elementaryButton)

      // Classic should now be collapsed, Elementary expanded
      expect(classicButton).toHaveAttribute('aria-expanded', 'false')
      expect(elementaryButton).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('category selection', () => {
    it('should call onCategorySelected when a category is clicked', async () => {
      const user = userEvent.setup()
      renderComponent()

      // Classic is expanded, find a category within it
      const generalKnowledgeButton = screen.getByRole('button', {
        name: /Select General Knowledge category/i,
      })
      await user.click(generalKnowledgeButton)

      // Wait for the callback (there's a setTimeout in the component)
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(mockOnCategorySelected).toHaveBeenCalledWith('General Knowledge', 'classic')
    })

    it('should call onCategorySelected with correct difficulty', async () => {
      const user = userEvent.setup()
      renderComponent()

      // Expand Elementary section
      const elementaryButton = screen.getByRole('button', {
        name: (name, element) => element?.getAttribute('aria-controls') === 'section-elementary',
      })
      await user.click(elementaryButton)

      // Select a category from Elementary
      const animalsButton = screen.getByRole('button', { name: /Select Animals category/i })
      await user.click(animalsButton)

      await new Promise(resolve => setTimeout(resolve, 200))

      expect(mockOnCategorySelected).toHaveBeenCalledWith('Animals', 'elementary')
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

  describe('keyboard navigation', () => {
    it('should allow keyboard activation of sections', async () => {
      const user = userEvent.setup()
      renderComponent()

      const elementaryButton = screen.getByRole('button', {
        name: (name, element) => element?.getAttribute('aria-controls') === 'section-elementary',
      })
      elementaryButton.focus()

      // Press Enter to expand
      await user.keyboard('{Enter}')

      expect(elementaryButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should allow keyboard activation with Space', async () => {
      const user = userEvent.setup()
      renderComponent()

      const elementaryButton = screen.getByRole('button', {
        name: (name, element) => element?.getAttribute('aria-controls') === 'section-elementary',
      })
      elementaryButton.focus()

      // Press Space to expand
      await user.keyboard(' ')

      expect(elementaryButton).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('accessibility', () => {
    it('should have proper aria-controls on section buttons', () => {
      renderComponent()

      const classicButton = screen.getByRole('button', {
        name: (name, element) => element?.getAttribute('aria-controls') === 'section-classic',
      })
      expect(classicButton).toHaveAttribute('aria-controls', 'section-classic')
    })

    it('should have aria-label on category buttons', () => {
      renderComponent()

      const generalKnowledgeButton = screen.getByRole('button', {
        name: /Select General Knowledge category for Classic difficulty/i,
      })
      expect(generalKnowledgeButton).toBeInTheDocument()
    })

    it('should have emoji roles with proper labels', () => {
      renderComponent()

      // Check that emojis have role="img" and aria-label
      const emojis = screen.getAllByRole('img')
      expect(emojis.length).toBeGreaterThan(0)

      emojis.forEach(emoji => {
        expect(emoji).toHaveAttribute('aria-label')
      })
    })
  })

  describe('difficulty levels', () => {
    it('should display Elementary categories when expanded', async () => {
      const user = userEvent.setup()
      renderComponent()

      const elementaryButton = screen.getByRole('button', {
        name: (name, element) => element?.getAttribute('aria-controls') === 'section-elementary',
      })
      await user.click(elementaryButton)

      // Check for Elementary-specific categories
      expect(screen.getByText('Colors & Shapes')).toBeInTheDocument()
      expect(screen.getByText('Animals')).toBeInTheDocument()
      expect(screen.getByText('Food')).toBeInTheDocument()
    })

    it('should display College Level categories when expanded', async () => {
      const user = userEvent.setup()
      renderComponent()

      const collegeButton = screen.getByRole('button', {
        name: (name, element) => element?.getAttribute('aria-controls') === 'section-college-level',
      })
      await user.click(collegeButton)

      // Check for College-specific categories
      expect(screen.getByText('Advanced Mathematics')).toBeInTheDocument()
      expect(screen.getByText('Philosophy')).toBeInTheDocument()
      expect(screen.getByText('Computer Science')).toBeInTheDocument()
    })

    it('should display Classic categories by default', () => {
      renderComponent()

      // Classic is expanded by default
      expect(screen.getByText('General Knowledge')).toBeInTheDocument()
      expect(screen.getByText('Movies & TV')).toBeInTheDocument()
      expect(screen.getByText('Pop Culture')).toBeInTheDocument()
    })
  })
})
