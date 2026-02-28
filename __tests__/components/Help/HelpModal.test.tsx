/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HelpModal } from '@/app/components/Help/HelpModal'
import { useHelpContext } from '@/app/components/Help/HelpContext'

// Mock the HelpContext
jest.mock('@/app/components/Help/HelpContext', () => ({
  useHelpContext: jest.fn(),
}))

const mockUseHelpContext = useHelpContext as jest.MockedFunction<typeof useHelpContext>

describe('HelpModal', () => {
  const defaultMockContext = {
    visitedRoutes: ['/'],
    currentRoute: '/',
    getAvailableHelpTabs: () => ['general', 'quick', 'custom', 'advanced'],
  }

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseHelpContext.mockReturnValue(defaultMockContext)
  })

  afterEach(() => {
    document.body.style.overflow = ''
  })

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<HelpModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText(/help & information/i)).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(<HelpModal {...defaultProps} />)

      expect(screen.getByText(/help & information/i)).toBeInTheDocument()
    })

    it('should render close button', () => {
      render(<HelpModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument()
    })

    it('should render all available tabs', () => {
      render(<HelpModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /general/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /quick/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /custom/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /advanced/i })).toBeInTheDocument()
    })

    it('should only render available tabs from context', () => {
      mockUseHelpContext.mockReturnValue({
        ...defaultMockContext,
        getAvailableHelpTabs: () => ['general'],
      })

      render(<HelpModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /general/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /quick/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /custom/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /advanced/i })).not.toBeInTheDocument()
    })
  })

  describe('Tab Content', () => {
    it('should show general tab content by default', () => {
      render(<HelpModal {...defaultProps} />)

      expect(screen.getByText(/game modes/i)).toBeInTheDocument()
      expect(screen.getByText(/fast-paced trivia/i)).toBeInTheDocument()
    })

    it('should switch to quick tab content when clicked', () => {
      render(<HelpModal {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /quick/i }))

      expect(screen.getByText(/quick game/i, { selector: 'h3' })).toBeInTheDocument()
      expect(screen.getByText(/preset question packs/i)).toBeInTheDocument()
    })

    it('should switch to custom tab content when clicked', () => {
      render(<HelpModal {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /custom/i }))

      expect(screen.getByText(/custom game/i, { selector: 'h3' })).toBeInTheDocument()
      expect(screen.getByText(/private room codes/i)).toBeInTheDocument()
    })

    it('should switch to advanced tab content when clicked', () => {
      render(<HelpModal {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /advanced/i }))

      expect(screen.getByText(/advanced game/i, { selector: 'h3' })).toBeInTheDocument()
      expect(screen.getByText(/ai-powered question generation/i)).toBeInTheDocument()
    })

    it('should show upload note in advanced tab', () => {
      render(<HelpModal {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /advanced/i }))

      expect(screen.getByText(/uploading files may take up to 2 minutes/i)).toBeInTheDocument()
    })
  })

  describe('Close Modal', () => {
    it('should call onClose when close button is clicked', () => {
      render(<HelpModal {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /close modal/i }))

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when backdrop is clicked', () => {
      render(<HelpModal {...defaultProps} />)

      // Find the backdrop by its class
      const backdrop = document.querySelector('.bg-black\\/70')
      expect(backdrop).toBeInTheDocument()

      if (backdrop) fireEvent.click(backdrop)

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when Escape key is pressed', () => {
      render(<HelpModal {...defaultProps} />)

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should not respond to Escape when modal is closed', () => {
      render(<HelpModal {...defaultProps} isOpen={false} />)

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })
  })

  describe('Body Overflow', () => {
    it('should set body overflow to hidden when modal is open', () => {
      render(<HelpModal {...defaultProps} />)

      expect(document.body.style.overflow).toBe('hidden')
    })

    it('should reset body overflow when modal is closed', () => {
      const { rerender } = render(<HelpModal {...defaultProps} />)
      expect(document.body.style.overflow).toBe('hidden')

      rerender(<HelpModal {...defaultProps} isOpen={false} />)

      expect(document.body.style.overflow).toBe('')
    })

    it('should reset body overflow on unmount', () => {
      const { unmount } = render(<HelpModal {...defaultProps} />)
      expect(document.body.style.overflow).toBe('hidden')

      unmount()

      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('Route-based Tab Selection', () => {
    it('should select quick tab when on quick game route', async () => {
      mockUseHelpContext.mockReturnValue({
        ...defaultMockContext,
        currentRoute: '/game/quick',
      })

      render(<HelpModal {...defaultProps} />)

      await waitFor(() => {
        const quickTab = screen.getByRole('button', { name: /quick/i })
        expect(quickTab).toHaveClass('text-white')
      })
    })

    it('should select custom tab when on custom game route', async () => {
      mockUseHelpContext.mockReturnValue({
        ...defaultMockContext,
        currentRoute: '/game/custom',
      })

      render(<HelpModal {...defaultProps} />)

      await waitFor(() => {
        const customTab = screen.getByRole('button', { name: /custom/i })
        expect(customTab).toHaveClass('text-white')
      })
    })

    it('should select advanced tab when on advanced game route', async () => {
      mockUseHelpContext.mockReturnValue({
        ...defaultMockContext,
        currentRoute: '/game/advanced',
      })

      render(<HelpModal {...defaultProps} />)

      await waitFor(() => {
        const advancedTab = screen.getByRole('button', { name: /advanced/i })
        expect(advancedTab).toHaveClass('text-white')
      })
    })

    it('should reset to general tab if current tab becomes unavailable', async () => {
      const { rerender } = render(<HelpModal {...defaultProps} />)

      // Click on quick tab
      fireEvent.click(screen.getByRole('button', { name: /quick/i }))

      // Now mock context to not include quick
      mockUseHelpContext.mockReturnValue({
        ...defaultMockContext,
        getAvailableHelpTabs: () => ['general', 'custom', 'advanced'],
      })

      rerender(<HelpModal {...defaultProps} />)

      // Should show general content since quick is no longer available
      await waitFor(() => {
        expect(screen.getByText(/game modes/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper modal structure', () => {
      render(<HelpModal {...defaultProps} />)

      expect(screen.getByText(/help & information/i)).toBeInTheDocument()
    })

    it('should have accessible close button', () => {
      render(<HelpModal {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: /close modal/i })
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal')
    })

    it('should focus trap within modal', () => {
      render(<HelpModal {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('General Tab Content Details', () => {
    it('should display quick game description', () => {
      render(<HelpModal {...defaultProps} />)

      expect(screen.getByText('Quick Game')).toBeInTheDocument()
    })

    it('should display custom game description', () => {
      render(<HelpModal {...defaultProps} />)

      expect(screen.getByText('Custom Game')).toBeInTheDocument()
    })

    it('should display advanced game description', () => {
      render(<HelpModal {...defaultProps} />)

      expect(screen.getByText('Advanced Game')).toBeInTheDocument()
    })
  })
})
