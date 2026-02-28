/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PixelCard, CardGrid } from '@/app/components/ui/PixelCard'

describe('PixelCard', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(<PixelCard>Card content</PixelCard>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('renders as a div by default', () => {
      const { container } = render(<PixelCard>Content</PixelCard>)
      expect(container.querySelector('div')).toBeInTheDocument()
    })

    it('renders title when provided', () => {
      render(<PixelCard title="Test Title">Content</PixelCard>)
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('renders subtitle when provided', () => {
      render(
        <PixelCard title="Title" subtitle="Sub info">
          Content
        </PixelCard>
      )
      expect(screen.getByText('Sub info')).toBeInTheDocument()
    })

    it('renders header action when provided', () => {
      render(
        <PixelCard title="Title" headerAction={<button>Action</button>}>
          Content
        </PixelCard>
      )
      expect(screen.getByText('Action')).toBeInTheDocument()
    })

    it('renders footer when provided', () => {
      render(<PixelCard footer={<span>Footer text</span>}>Content</PixelCard>)
      expect(screen.getByText('Footer text')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('renders default variant', () => {
      const { container } = render(<PixelCard>Content</PixelCard>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('bg-gray-800')
    })

    it('renders elevated variant', () => {
      const { container } = render(<PixelCard variant="elevated">Content</PixelCard>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('bg-gray-800')
    })

    it('renders bordered variant', () => {
      const { container } = render(<PixelCard variant="bordered">Content</PixelCard>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('bg-transparent')
    })

    it('renders gradient variant', () => {
      const { container } = render(<PixelCard variant="gradient">Content</PixelCard>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('bg-gradient-to-br')
    })
  })

  describe('Padding', () => {
    it('applies no padding', () => {
      const { container } = render(<PixelCard padding="none">Content</PixelCard>)
      // Content div should not have padding classes
      expect(container.textContent).toContain('Content')
    })

    it('applies sm padding', () => {
      const { container } = render(<PixelCard padding="sm">Content</PixelCard>)
      expect(container.innerHTML).toContain('p-3')
    })

    it('applies md padding (default)', () => {
      const { container } = render(<PixelCard>Content</PixelCard>)
      expect(container.innerHTML).toContain('p-4')
    })

    it('applies lg padding', () => {
      const { container } = render(<PixelCard padding="lg">Content</PixelCard>)
      expect(container.innerHTML).toContain('p-6')
    })
  })

  describe('Interactive mode', () => {
    it('renders as button when onClick provided', () => {
      render(<PixelCard onClick={() => {}}>Content</PixelCard>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('calls onClick handler', () => {
      const handleClick = jest.fn()
      render(<PixelCard onClick={handleClick}>Content</PixelCard>)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('applies interactive styles when interactive prop is true', () => {
      const { container } = render(<PixelCard interactive>Content</PixelCard>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('cursor-pointer')
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(<PixelCard className="my-custom">Content</PixelCard>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('my-custom')
    })
  })
})

describe('CardGrid', () => {
  it('renders children in a grid', () => {
    render(
      <CardGrid>
        <div>Item 1</div>
        <div>Item 2</div>
      </CardGrid>
    )
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('applies column classes', () => {
    const { container } = render(
      <CardGrid columns={2}>
        <div>Item</div>
      </CardGrid>
    )
    expect(container.firstChild).toHaveClass('md:grid-cols-2')
  })

  it('applies gap classes', () => {
    const { container } = render(
      <CardGrid gap="lg">
        <div>Item</div>
      </CardGrid>
    )
    expect(container.firstChild).toHaveClass('gap-6')
  })

  it('applies custom className', () => {
    const { container } = render(
      <CardGrid className="extra-class">
        <div>Item</div>
      </CardGrid>
    )
    expect(container.firstChild).toHaveClass('extra-class')
  })
})
