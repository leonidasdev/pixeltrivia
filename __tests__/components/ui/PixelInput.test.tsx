/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PixelInput, PixelTextarea } from '@/app/components/ui/PixelInput'

describe('PixelInput', () => {
  describe('Rendering', () => {
    it('renders an input element', () => {
      render(<PixelInput />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders with label', () => {
      render(<PixelInput label="Username" />)
      expect(screen.getByLabelText('Username')).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
      render(<PixelInput placeholder="Enter text..." />)
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument()
    })

    it('renders with helper text', () => {
      render(<PixelInput helperText="Must be at least 3 characters" />)
      expect(screen.getByText('Must be at least 3 characters')).toBeInTheDocument()
    })

    it('renders with custom id', () => {
      render(<PixelInput id="custom-id" label="Custom" />)
      expect(screen.getByLabelText('Custom')).toHaveAttribute('id', 'custom-id')
    })
  })

  describe('Error state', () => {
    it('displays error message', () => {
      render(<PixelInput error="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('has role="alert" on error message', () => {
      render(<PixelInput error="Error!" />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('sets aria-invalid when error present', () => {
      render(<PixelInput error="Error!" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('hides helper text when error is shown', () => {
      render(<PixelInput error="Error!" helperText="Help text" />)
      expect(screen.queryByText('Help text')).not.toBeInTheDocument()
      expect(screen.getByText('Error!')).toBeInTheDocument()
    })

    it('applies error border style', () => {
      const { container } = render(<PixelInput error="Error" />)
      const input = container.querySelector('input')
      expect(input?.className).toContain('border-red-500')
    })
  })

  describe('Disabled state', () => {
    it('disables the input', () => {
      render(<PixelInput disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('applies disabled styles', () => {
      const { container } = render(<PixelInput disabled />)
      const input = container.querySelector('input')
      expect(input?.className).toContain('disabled:opacity-50')
    })
  })

  describe('Sizes', () => {
    it('renders sm size', () => {
      const { container } = render(<PixelInput size="sm" />)
      const input = container.querySelector('input')
      expect(input?.className).toContain('text-sm')
    })

    it('renders md size (default)', () => {
      const { container } = render(<PixelInput />)
      const input = container.querySelector('input')
      expect(input?.className).toContain('text-base')
    })

    it('renders lg size', () => {
      const { container } = render(<PixelInput size="lg" />)
      const input = container.querySelector('input')
      expect(input?.className).toContain('text-lg')
    })
  })

  describe('Icons', () => {
    it('renders left icon', () => {
      render(<PixelInput leftIcon={<span data-testid="left-icon">L</span>} />)
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('renders right icon', () => {
      render(<PixelInput rightIcon={<span data-testid="right-icon">R</span>} />)
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })
  })

  describe('Full width', () => {
    it('applies full width by default', () => {
      const { container } = render(<PixelInput />)
      const input = container.querySelector('input')
      expect(input?.className).toContain('w-full')
    })

    it('does not apply full width when false', () => {
      const { container } = render(<PixelInput fullWidth={false} />)
      const input = container.querySelector('input')
      expect(input?.className).not.toContain('w-full')
    })
  })

  describe('Events', () => {
    it('handles onChange', () => {
      const handleChange = jest.fn()
      render(<PixelInput onChange={handleChange} />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } })
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('Ref forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<PixelInput ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })
})

describe('PixelTextarea', () => {
  describe('Rendering', () => {
    it('renders a textarea element', () => {
      render(<PixelTextarea />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders with label', () => {
      render(<PixelTextarea label="Description" />)
      expect(screen.getByLabelText('Description')).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
      render(<PixelTextarea placeholder="Enter description..." />)
      expect(screen.getByPlaceholderText('Enter description...')).toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('displays error message', () => {
      render(<PixelTextarea error="Required field" />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('sets aria-invalid', () => {
      render(<PixelTextarea error="Error" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Disabled state', () => {
    it('disables the textarea', () => {
      render(<PixelTextarea disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })
  })

  describe('Ref forwarding', () => {
    it('forwards ref to textarea element', () => {
      const ref = React.createRef<HTMLTextAreaElement>()
      render(<PixelTextarea ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    })
  })
})
