/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Modal } from '@/app/components/ui/Modal'

// createPortal renders inline in test environment by default
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}))

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Modal content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    document.body.style.overflow = ''
  })

  describe('Rendering', () => {
    it('renders children when open', () => {
      render(<Modal {...defaultProps} />)
      expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(<Modal {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
    })

    it('renders title when provided', () => {
      render(<Modal {...defaultProps} title="Test Title" />)
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('renders footer when provided', () => {
      render(<Modal {...defaultProps} footer={<button>Save</button>} />)
      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    it('renders close button by default', () => {
      render(<Modal {...defaultProps} title="Title" />)
      // The close button has ✕ text
      const closeBtn = screen.getByRole('button', { name: /close/i })
      expect(closeBtn).toBeInTheDocument()
    })

    it('hides close button when showCloseButton=false', () => {
      render(<Modal {...defaultProps} title="Title" showCloseButton={false} />)
      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has role="dialog" and aria-modal="true"', () => {
      render(<Modal {...defaultProps} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('has aria-labelledby when title is provided', () => {
      render(<Modal {...defaultProps} title="My Modal" />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
    })

    it('does not have aria-labelledby when no title', () => {
      render(<Modal {...defaultProps} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).not.toHaveAttribute('aria-labelledby')
    })
  })

  describe('Close behavior', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = jest.fn()
      render(<Modal {...defaultProps} onClose={onClose} title="T" />)

      fireEvent.click(screen.getByRole('button', { name: /close/i }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose on Escape key', () => {
      const onClose = jest.fn()
      render(<Modal {...defaultProps} onClose={onClose} />)

      act(() => {
        fireEvent.keyDown(document, { key: 'Escape' })
      })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose on Escape when closeOnEscape=false', () => {
      const onClose = jest.fn()
      render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />)

      act(() => {
        fireEvent.keyDown(document, { key: 'Escape' })
      })
      expect(onClose).not.toHaveBeenCalled()
    })

    it('calls onClose on backdrop click', () => {
      const onClose = jest.fn()
      render(<Modal {...defaultProps} onClose={onClose} />)

      // The backdrop is the aria-hidden div
      const backdrop = document.querySelector('[aria-hidden="true"]')
      expect(backdrop).not.toBeNull()
      fireEvent.click(backdrop as Element)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose on backdrop click when closeOnBackdropClick=false', () => {
      const onClose = jest.fn()
      render(<Modal {...defaultProps} onClose={onClose} closeOnBackdropClick={false} />)

      const backdrop = document.querySelector('[aria-hidden="true"]')
      fireEvent.click(backdrop as Element)
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Scroll lock', () => {
    it('locks body scroll when opened', () => {
      render(<Modal {...defaultProps} />)
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('restores body scroll when closed', () => {
      const { unmount } = render(<Modal {...defaultProps} />)
      expect(document.body.style.overflow).toBe('hidden')

      unmount()
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('Size variants', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const
    const expectedClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-4xl',
    }

    sizes.forEach(size => {
      it(`applies ${expectedClasses[size]} for size="${size}"`, () => {
        render(<Modal {...defaultProps} size={size} />)
        const dialog = screen.getByRole('dialog')
        const modalPanel = dialog.querySelector('[tabindex="-1"]')
        expect(modalPanel?.className).toContain(expectedClasses[size])
      })
    })
  })
})
