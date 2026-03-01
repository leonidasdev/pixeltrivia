/**
 * Tests for GameModeCard Component
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameModeCard, GAME_MODES, GAME_MODE_COLORS } from '@/app/components/ui/GameModeCard'

describe('GameModeCard', () => {
  const defaultProps = {
    id: 'quick',
    icon: '⚡',
    title: 'QUICK GAME',
    description: 'Test description',
    tagline: '• Test tagline',
    colors: GAME_MODE_COLORS.quick,
    isHovered: false,
    onClick: jest.fn(),
    onMouseEnter: jest.fn(),
    onMouseLeave: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders icon, title, description, and tagline', () => {
    render(<GameModeCard {...defaultProps} />)

    expect(screen.getByText('⚡')).toBeInTheDocument()
    expect(screen.getByText('QUICK GAME')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('• Test tagline')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    render(<GameModeCard {...defaultProps} />)
    fireEvent.click(screen.getByRole('button'))
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
  })

  it('calls onMouseEnter on hover', () => {
    render(<GameModeCard {...defaultProps} />)
    fireEvent.mouseEnter(screen.getByRole('button'))
    expect(defaultProps.onMouseEnter).toHaveBeenCalledTimes(1)
  })

  it('calls onMouseLeave on mouse leave', () => {
    render(<GameModeCard {...defaultProps} />)
    fireEvent.mouseLeave(screen.getByRole('button'))
    expect(defaultProps.onMouseLeave).toHaveBeenCalledTimes(1)
  })

  it('calls onFocus when focused', () => {
    const onFocus = jest.fn()
    render(<GameModeCard {...defaultProps} onFocus={onFocus} />)
    fireEvent.focus(screen.getByRole('button'))
    expect(onFocus).toHaveBeenCalledTimes(1)
  })

  it('calls onBlur when blurred', () => {
    const onBlur = jest.fn()
    render(<GameModeCard {...defaultProps} onBlur={onBlur} />)
    fireEvent.blur(screen.getByRole('button'))
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('applies hovered styles when isHovered is true', () => {
    const { container } = render(<GameModeCard {...defaultProps} isHovered={true} />)
    const button = container.querySelector('button')
    expect(button?.className).toContain('scale-105')
    expect(button?.className).toContain('pixel-shadow')
  })

  it('applies hover pseudo styles when isHovered is false', () => {
    const { container } = render(<GameModeCard {...defaultProps} isHovered={false} />)
    const button = container.querySelector('button')
    expect(button?.className).toContain('hover:scale-105')
  })

  it('applies additional className', () => {
    const { container } = render(<GameModeCard {...defaultProps} className="extra-class" />)
    const button = container.querySelector('button')
    expect(button?.className).toContain('extra-class')
  })

  it('applies correct gradient from colors', () => {
    const { container } = render(<GameModeCard {...defaultProps} />)
    const button = container.querySelector('button')
    expect(button?.className).toContain('from-orange-600')
    expect(button?.className).toContain('to-orange-700')
  })
})

describe('GAME_MODES', () => {
  it('contains 3 game modes', () => {
    expect(GAME_MODES).toHaveLength(3)
  })

  it('has quick, custom, and advanced modes', () => {
    const ids = GAME_MODES.map(m => m.id)
    expect(ids).toEqual(['quick', 'custom', 'advanced'])
  })

  it('each mode has required fields', () => {
    for (const mode of GAME_MODES) {
      expect(mode).toHaveProperty('id')
      expect(mode).toHaveProperty('icon')
      expect(mode).toHaveProperty('title')
      expect(mode).toHaveProperty('description')
      expect(mode).toHaveProperty('tagline')
      expect(mode).toHaveProperty('colors')
      expect(mode.colors).toHaveProperty('gradient')
      expect(mode.colors).toHaveProperty('border')
      expect(mode.colors).toHaveProperty('focusRing')
    }
  })
})

describe('GAME_MODE_COLORS', () => {
  it('has presets for quick, custom, advanced', () => {
    expect(GAME_MODE_COLORS).toHaveProperty('quick')
    expect(GAME_MODE_COLORS).toHaveProperty('custom')
    expect(GAME_MODE_COLORS).toHaveProperty('advanced')
  })

  it('quick uses orange colors', () => {
    expect(GAME_MODE_COLORS.quick.gradient).toContain('orange')
  })

  it('custom uses purple colors', () => {
    expect(GAME_MODE_COLORS.custom.gradient).toContain('purple')
  })

  it('advanced uses blue colors', () => {
    expect(GAME_MODE_COLORS.advanced.gradient).toContain('blue')
  })
})
