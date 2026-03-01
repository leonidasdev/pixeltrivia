/**
 * @jest-environment jsdom
 */

/**
 * Tests for AnimatedBackground — Branch Coverage
 *
 * Tests preset selection, custom sparkles, gradient modes,
 * Sparkle delay class branches, and specialized variants.
 *
 * @module __tests__/components/ui/AnimatedBackground
 * @since 1.0.0
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  AnimatedBackground,
  PageBackground,
  SparklesOverlay,
} from '@/app/components/ui/AnimatedBackground'

describe('AnimatedBackground', () => {
  describe('presets', () => {
    it('renders default preset sparkles', () => {
      const { container } = render(<AnimatedBackground />)
      // Default preset has 3 sparkles
      const sparkles = container.querySelectorAll('[aria-hidden="true"]')
      // One parent aria-hidden div + 3 sparkle divs
      expect(sparkles.length).toBeGreaterThanOrEqual(3)
    })

    it('renders dense preset with more sparkles', () => {
      const { container } = render(<AnimatedBackground preset="dense" />)
      const sparkles = container.querySelectorAll('.animate-pulse')
      expect(sparkles.length).toBe(8)
    })

    it('renders minimal preset with fewer sparkles', () => {
      const { container } = render(<AnimatedBackground preset="minimal" />)
      const sparkles = container.querySelectorAll('.animate-pulse')
      expect(sparkles.length).toBe(2)
    })

    it('renders colorful preset', () => {
      const { container } = render(<AnimatedBackground preset="colorful" />)
      const sparkles = container.querySelectorAll('.animate-pulse')
      expect(sparkles.length).toBe(6)
    })
  })

  describe('custom sparkles', () => {
    it('renders custom sparkles when preset is custom', () => {
      const customSparkles = [
        { top: '10%', left: '10%', color: 'yellow-400' },
        { top: '90%', left: '90%', color: 'pink-400' },
      ]
      const { container } = render(<AnimatedBackground preset="custom" sparkles={customSparkles} />)
      const sparkles = container.querySelectorAll('.animate-pulse')
      expect(sparkles.length).toBe(2)
    })

    it('falls back to empty array when custom preset without sparkles', () => {
      const { container } = render(<AnimatedBackground preset="custom" />)
      const sparkles = container.querySelectorAll('.animate-pulse')
      expect(sparkles.length).toBe(0)
    })
  })

  describe('gradient', () => {
    it('applies no gradient class by default', () => {
      const { container } = render(<AnimatedBackground />)
      const root = container.firstElementChild
      expect(root?.className).not.toContain('bg-gradient')
    })

    it('applies gradient when withGradient is true', () => {
      const { container } = render(<AnimatedBackground withGradient gradientPreset="purple-blue" />)
      const root = container.firstElementChild
      expect(root?.className).toContain('bg-gradient-to-br')
    })

    it('applies dark gradient preset', () => {
      const { container } = render(<AnimatedBackground withGradient gradientPreset="dark" />)
      const root = container.firstElementChild
      expect(root?.className).toContain('from-gray-900')
    })

    it('applies sunset gradient preset', () => {
      const { container } = render(<AnimatedBackground withGradient gradientPreset="sunset" />)
      const root = container.firstElementChild
      expect(root?.className).toContain('from-orange-900')
    })
  })

  describe('children', () => {
    it('renders children in content layer', () => {
      render(
        <AnimatedBackground>
          <div data-testid="child">Hello</div>
        </AnimatedBackground>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('does not render content layer when no children', () => {
      const { container } = render(<AnimatedBackground />)
      const contentLayer = container.querySelector('.z-10')
      expect(contentLayer).toBeNull()
    })
  })

  describe('Sparkle delay classes', () => {
    it('handles delay=0 (no delay class)', () => {
      const sparkles = [{ top: '10%', left: '10%', color: 'yellow-400', delay: 0 }]
      const { container } = render(<AnimatedBackground preset="custom" sparkles={sparkles} />)
      const sparkle = container.querySelector('.animate-pulse')
      expect(sparkle?.className).not.toContain('animation-delay')
    })

    it('handles delay=300', () => {
      const sparkles = [{ top: '10%', left: '10%', color: 'yellow-400', delay: 300 }]
      const { container } = render(<AnimatedBackground preset="custom" sparkles={sparkles} />)
      const sparkle = container.querySelector('.animate-pulse')
      expect(sparkle?.className).toContain('animation-delay-300')
    })

    it('handles delay=500', () => {
      const sparkles = [{ top: '10%', left: '10%', color: 'yellow-400', delay: 500 }]
      const { container } = render(<AnimatedBackground preset="custom" sparkles={sparkles} />)
      const sparkle = container.querySelector('.animate-pulse')
      expect(sparkle?.className).toContain('animation-delay-500')
    })

    it('handles delay=1000', () => {
      const sparkles = [{ top: '10%', left: '10%', color: 'yellow-400', delay: 1000 }]
      const { container } = render(<AnimatedBackground preset="custom" sparkles={sparkles} />)
      const sparkle = container.querySelector('.animate-pulse')
      expect(sparkle?.className).toContain('animation-delay-1000')
    })

    it('handles delay=2000', () => {
      const sparkles = [{ top: '10%', left: '10%', color: 'yellow-400', delay: 2000 }]
      const { container } = render(<AnimatedBackground preset="custom" sparkles={sparkles} />)
      const sparkle = container.querySelector('.animate-pulse')
      expect(sparkle?.className).toContain('animation-delay-2000')
    })

    it('handles non-preset delay with inline style', () => {
      const sparkles = [{ top: '10%', left: '10%', color: 'yellow-400', delay: 750 }]
      const { container } = render(<AnimatedBackground preset="custom" sparkles={sparkles} />)
      const sparkle = container.querySelector('.animate-pulse') as HTMLElement
      expect(sparkle?.style.animationDelay).toBe('750ms')
    })

    it('handles delay > 2000 (no preset class, no inline override)', () => {
      const sparkles = [{ top: '10%', left: '10%', color: 'yellow-400', delay: 5000 }]
      const { container } = render(<AnimatedBackground preset="custom" sparkles={sparkles} />)
      const sparkle = container.querySelector('.animate-pulse') as HTMLElement
      // delay 5000 doesn't match any preset (0,300,500,1000,2000), so inline style applied
      expect(sparkle?.style.animationDelay).toBe('5000ms')
    })

    it('handles custom size and opacity', () => {
      const sparkles = [{ top: '10%', left: '10%', color: 'yellow-400', size: 4, opacity: 0.8 }]
      const { container } = render(<AnimatedBackground preset="custom" sparkles={sparkles} />)
      const sparkle = container.querySelector('.animate-pulse') as HTMLElement
      expect(sparkle?.style.width).toBe('16px') // 4 * 4
      expect(sparkle?.style.opacity).toBe('0.8')
    })

    it('handles unknown color (falls back to bg-{color})', () => {
      const sparkles = [{ top: '10%', left: '10%', color: 'custom-color' }]
      const { container } = render(<AnimatedBackground preset="custom" sparkles={sparkles} />)
      const sparkle = container.querySelector('.animate-pulse')
      expect(sparkle?.className).toContain('bg-custom-color')
    })
  })
})

describe('PageBackground', () => {
  it('renders children inside main element', () => {
    render(
      <PageBackground>
        <div data-testid="page-child">Content</div>
      </PageBackground>
    )
    expect(screen.getByTestId('page-child')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('applies default gradient and sparkle preset', () => {
    const { container } = render(
      <PageBackground>
        <div>Content</div>
      </PageBackground>
    )
    const main = container.querySelector('main')
    expect(main?.className).toContain('bg-gradient-to-br')
    expect(main?.className).toContain('from-purple-900')
  })

  it('applies custom gradient preset', () => {
    const { container } = render(
      <PageBackground gradient="ocean">
        <div>Content</div>
      </PageBackground>
    )
    const main = container.querySelector('main')
    expect(main?.className).toContain('from-blue-900')
  })

  it('applies custom sparkle preset', () => {
    const { container } = render(
      <PageBackground sparklePreset="dense">
        <div>Content</div>
      </PageBackground>
    )
    const sparkles = container.querySelectorAll('.animate-pulse')
    expect(sparkles.length).toBe(8)
  })

  it('applies custom className', () => {
    const { container } = render(
      <PageBackground className="my-class">
        <div>Content</div>
      </PageBackground>
    )
    const main = container.querySelector('main')
    expect(main?.className).toContain('my-class')
  })
})

describe('SparklesOverlay', () => {
  it('renders with default minimal preset', () => {
    const { container } = render(<SparklesOverlay />)
    const sparkles = container.querySelectorAll('.animate-pulse')
    expect(sparkles.length).toBe(2) // minimal preset
  })

  it('renders with custom preset', () => {
    const { container } = render(<SparklesOverlay preset="dense" />)
    const sparkles = container.querySelectorAll('.animate-pulse')
    expect(sparkles.length).toBe(8)
  })

  it('has aria-hidden on container', () => {
    const { container } = render(<SparklesOverlay />)
    const overlay = container.firstElementChild
    expect(overlay?.getAttribute('aria-hidden')).toBe('true')
  })

  it('applies custom className', () => {
    const { container } = render(<SparklesOverlay className="extra-class" />)
    const overlay = container.firstElementChild
    expect(overlay?.className).toContain('extra-class')
  })
})
