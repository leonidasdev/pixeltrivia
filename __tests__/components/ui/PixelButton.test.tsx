/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PixelButton } from '@/app/components/ui/PixelButton'

describe('PixelButton', () => {
  describe('Rendering', () => {
    it('renders children text', () => {
      render(<PixelButton>Click Me</PixelButton>)
      expect(screen.getByText('Click Me')).toBeInTheDocument()
    })

    it('renders as a button element', () => {
      render(<PixelButton>Test</PixelButton>)
      expect(screen.getByRole('button', { name: 'Test' })).toBeInTheDocument()
    })

    it('renders with default variant (primary)', () => {
      const { container } = render(<PixelButton>Test</PixelButton>)
      const button = container.querySelector('button')
      expect(button?.className).toContain('bg-blue-600')
    })
  })

  describe('Variants', () => {
    it('renders primary variant', () => {
      const { container } = render(<PixelButton variant="primary">Test</PixelButton>)
      expect(container.querySelector('button')?.className).toContain('bg-blue-600')
    })

    it('renders secondary variant', () => {
      const { container } = render(<PixelButton variant="secondary">Test</PixelButton>)
      expect(container.querySelector('button')?.className).toContain('bg-gray-600')
    })

    it('renders success variant', () => {
      const { container } = render(<PixelButton variant="success">Test</PixelButton>)
      expect(container.querySelector('button')?.className).toContain('bg-green-600')
    })

    it('renders danger variant', () => {
      const { container } = render(<PixelButton variant="danger">Test</PixelButton>)
      expect(container.querySelector('button')?.className).toContain('bg-red-600')
    })

    it('renders warning variant', () => {
      const { container } = render(<PixelButton variant="warning">Test</PixelButton>)
      expect(container.querySelector('button')?.className).toContain('bg-yellow-500')
    })

    it('renders ghost variant', () => {
      const { container } = render(<PixelButton variant="ghost">Test</PixelButton>)
      expect(container.querySelector('button')?.className).toContain('bg-transparent')
    })
  })

  describe('Sizes', () => {
    it('renders sm size', () => {
      const { container } = render(<PixelButton size="sm">Test</PixelButton>)
      expect(container.querySelector('button')?.className).toContain('text-sm')
    })

    it('renders md size', () => {
      const { container } = render(<PixelButton size="md">Test</PixelButton>)
      expect(container.querySelector('button')?.className).toContain('text-base')
    })

    it('renders lg size', () => {
      const { container } = render(<PixelButton size="lg">Test</PixelButton>)
      expect(container.querySelector('button')?.className).toContain('text-lg')
    })

    it('renders xl size', () => {
      const { container } = render(<PixelButton size="xl">Test</PixelButton>)
      expect(container.querySelector('button')?.className).toContain('text-xl')
    })
  })

  describe('Props', () => {
    it('applies fullWidth class', () => {
      const { container } = render(<PixelButton fullWidth>Test</PixelButton>)
      expect(container.querySelector('button')?.className).toContain('w-full')
    })

    it('does not apply fullWidth by default', () => {
      const { container } = render(<PixelButton>Test</PixelButton>)
      expect(container.querySelector('button')?.className).not.toContain('w-full')
    })

    it('applies custom className', () => {
      const { container } = render(<PixelButton className="custom-class">Test</PixelButton>)
      expect(container.querySelector('button')?.className).toContain('custom-class')
    })

    it('renders left icon', () => {
      render(<PixelButton leftIcon={<span data-testid="left-icon">L</span>}>Test</PixelButton>)
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('renders right icon', () => {
      render(<PixelButton rightIcon={<span data-testid="right-icon">R</span>}>Test</PixelButton>)
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })
  })

  describe('Disabled state', () => {
    it('disables the button', () => {
      render(<PixelButton disabled>Test</PixelButton>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('applies disabled styles', () => {
      const { container } = render(<PixelButton disabled>Test</PixelButton>)
      expect(container.querySelector('button')?.className).toContain('opacity-50')
    })
  })

  describe('Loading state', () => {
    it('disables the button when loading', () => {
      render(<PixelButton loading>Test</PixelButton>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('shows loading text', () => {
      render(<PixelButton loading>Test</PixelButton>)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('hides children when loading', () => {
      render(<PixelButton loading>Click Me</PixelButton>)
      expect(screen.queryByText('Click Me')).not.toBeInTheDocument()
    })
  })

  describe('Events', () => {
    it('calls onClick handler', () => {
      const handleClick = jest.fn()
      render(<PixelButton onClick={handleClick}>Test</PixelButton>)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn()
      render(
        <PixelButton onClick={handleClick} disabled>
          Test
        </PixelButton>
      )
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<PixelButton aria-label="Submit form">Test</PixelButton>)
      expect(screen.getByLabelText('Submit form')).toBeInTheDocument()
    })

    it('has focus styles', () => {
      const { container } = render(<PixelButton>Test</PixelButton>)
      expect(container.querySelector('button')?.className).toContain('focus:outline-none')
    })
  })

  describe('Ref forwarding', () => {
    it('forwards ref to button element', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<PixelButton ref={ref}>Test</PixelButton>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })
})
