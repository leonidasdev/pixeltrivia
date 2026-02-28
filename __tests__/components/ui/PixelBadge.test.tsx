/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  PixelBadge,
  StatusBadge,
  CountBadge,
  DifficultyBadge,
} from '@/app/components/ui/PixelBadge'

describe('PixelBadge', () => {
  describe('Rendering', () => {
    it('renders children text', () => {
      render(<PixelBadge>Active</PixelBadge>)
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('renders as a span element', () => {
      const { container } = render(<PixelBadge>Test</PixelBadge>)
      expect(container.querySelector('span')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('renders default variant', () => {
      const { container } = render(<PixelBadge>Test</PixelBadge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('bg-gray-600')
    })

    it('renders primary variant', () => {
      const { container } = render(<PixelBadge variant="primary">Test</PixelBadge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('bg-blue-600')
    })

    it('renders success variant', () => {
      const { container } = render(<PixelBadge variant="success">Test</PixelBadge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('bg-green-600')
    })

    it('renders warning variant', () => {
      const { container } = render(<PixelBadge variant="warning">Test</PixelBadge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('bg-yellow-500')
    })

    it('renders danger variant', () => {
      const { container } = render(<PixelBadge variant="danger">Test</PixelBadge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('bg-red-600')
    })

    it('renders info variant', () => {
      const { container } = render(<PixelBadge variant="info">Test</PixelBadge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('bg-cyan-600')
    })
  })

  describe('Outline', () => {
    it('renders outline style', () => {
      const { container } = render(
        <PixelBadge variant="primary" outline>
          Test
        </PixelBadge>
      )
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('bg-transparent')
      expect(badge.className).toContain('border-blue-500')
    })
  })

  describe('Sizes', () => {
    it('renders sm size', () => {
      const { container } = render(<PixelBadge size="sm">Test</PixelBadge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('text-xs')
    })

    it('renders md size (default)', () => {
      const { container } = render(<PixelBadge>Test</PixelBadge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('text-sm')
    })

    it('renders lg size', () => {
      const { container } = render(<PixelBadge size="lg">Test</PixelBadge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('text-base')
    })
  })

  describe('Pill shape', () => {
    it('applies rounded-full when pill is true', () => {
      const { container } = render(<PixelBadge pill>Test</PixelBadge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('rounded-full')
    })

    it('does not apply rounded-full by default', () => {
      const { container } = render(<PixelBadge>Test</PixelBadge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).not.toContain('rounded-full')
    })
  })

  describe('Dot indicator', () => {
    it('renders dot when dot prop is true', () => {
      const { container } = render(<PixelBadge dot>Online</PixelBadge>)
      const dots = container.querySelectorAll('.rounded-full')
      expect(dots.length).toBeGreaterThan(0)
    })

    it('applies pulse animation to solid dot', () => {
      const { container } = render(<PixelBadge dot>Test</PixelBadge>)
      const dot = container.querySelector('.animate-pulse')
      expect(dot).toBeInTheDocument()
    })
  })

  describe('Icon', () => {
    it('renders icon when provided', () => {
      render(<PixelBadge icon={<span data-testid="badge-icon">I</span>}>Test</PixelBadge>)
      expect(screen.getByTestId('badge-icon')).toBeInTheDocument()
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(<PixelBadge className="my-badge">Test</PixelBadge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('my-badge')
    })
  })
})

describe('StatusBadge', () => {
  it('renders online status', () => {
    render(<StatusBadge status="online" />)
    expect(screen.getByText('Online')).toBeInTheDocument()
  })

  it('renders offline status', () => {
    render(<StatusBadge status="offline" />)
    expect(screen.getByText('Offline')).toBeInTheDocument()
  })

  it('renders away status', () => {
    render(<StatusBadge status="away" />)
    expect(screen.getByText('Away')).toBeInTheDocument()
  })

  it('renders busy status', () => {
    render(<StatusBadge status="busy" />)
    expect(screen.getByText('Busy')).toBeInTheDocument()
  })

  it('hides label when showLabel is false', () => {
    render(<StatusBadge status="online" showLabel={false} />)
    expect(screen.queryByText('Online')).not.toBeInTheDocument()
  })
})

describe('CountBadge', () => {
  it('renders count', () => {
    render(<CountBadge count={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('returns null when count is 0', () => {
    const { container } = render(<CountBadge count={0} />)
    expect(container.firstChild).toBeNull()
  })

  it('truncates with max+', () => {
    render(<CountBadge count={150} max={99} />)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('uses custom max', () => {
    render(<CountBadge count={15} max={10} />)
    expect(screen.getByText('10+')).toBeInTheDocument()
  })
})

describe('DifficultyBadge', () => {
  it('renders easy difficulty', () => {
    render(<DifficultyBadge difficulty="easy" />)
    expect(screen.getByText('Easy')).toBeInTheDocument()
  })

  it('renders classic difficulty', () => {
    render(<DifficultyBadge difficulty="classic" />)
    expect(screen.getByText('Classic')).toBeInTheDocument()
  })

  it('renders hard difficulty', () => {
    render(<DifficultyBadge difficulty="hard" />)
    expect(screen.getByText('Hard')).toBeInTheDocument()
  })

  it('renders expert difficulty', () => {
    render(<DifficultyBadge difficulty="expert" />)
    expect(screen.getByText('Expert')).toBeInTheDocument()
  })
})
