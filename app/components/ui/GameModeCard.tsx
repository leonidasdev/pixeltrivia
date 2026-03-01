/**
 * GameModeCard Component
 *
 * Reusable pixel-art styled card for game mode selection.
 * Used across mode and select pages for Quick, Custom, and Advanced game modes.
 *
 * @module app/components/ui/GameModeCard
 * @since 1.0.0
 */

'use client'

import { memo } from 'react'

// ============================================================================
// Types
// ============================================================================

/** Color configuration for a game mode card */
export interface GameModeCardColors {
  /** Tailwind gradient classes, e.g. "from-orange-600 to-orange-700" */
  gradient: string
  /** Tailwind border class, e.g. "border-orange-800" */
  border: string
  /** Tailwind focus ring class, e.g. "focus:ring-orange-300" */
  focusRing: string
  /** Tailwind text color for description, e.g. "text-orange-200" */
  descriptionText: string
  /** Tailwind text color for tagline, e.g. "text-orange-300" */
  taglineText: string
}

/** Props for the GameModeCard component */
export interface GameModeCardProps {
  /** Unique identifier for this card */
  id: string
  /** Emoji icon displayed at the top */
  icon: string
  /** Card title (displayed in pixel font) */
  title: string
  /** Card description text */
  description: string
  /** Short tagline shown below description */
  tagline: string
  /** Color scheme for the card */
  colors: GameModeCardColors
  /** Whether this card is currently hovered/focused */
  isHovered: boolean
  /** Click handler */
  onClick: () => void
  /** Mouse enter handler */
  onMouseEnter: () => void
  /** Mouse leave handler */
  onMouseLeave: () => void
  /** Focus handler */
  onFocus?: () => void
  /** Blur handler */
  onBlur?: () => void
  /** Additional CSS classes */
  className?: string
}

// ============================================================================
// Color Presets
// ============================================================================

/** Pre-defined color schemes for each game mode */
export const GAME_MODE_COLORS: Record<string, GameModeCardColors> = {
  quick: {
    gradient: 'from-orange-600 to-orange-700',
    border: 'border-orange-800',
    focusRing: 'focus:ring-orange-300',
    descriptionText: 'text-orange-200',
    taglineText: 'text-orange-300',
  },
  custom: {
    gradient: 'from-purple-600 to-purple-700',
    border: 'border-purple-800',
    focusRing: 'focus:ring-purple-300',
    descriptionText: 'text-purple-200',
    taglineText: 'text-purple-300',
  },
  advanced: {
    gradient: 'from-blue-600 to-blue-700',
    border: 'border-blue-800',
    focusRing: 'focus:ring-blue-300',
    descriptionText: 'text-blue-200',
    taglineText: 'text-blue-300',
  },
}

// ============================================================================
// Game Mode Data
// ============================================================================

/** Data configuration for each game mode card */
export interface GameModeData {
  id: string
  icon: string
  title: string
  description: string
  tagline: string
  colors: GameModeCardColors
}

/** Pre-configured data for all three game modes */
export const GAME_MODES: GameModeData[] = [
  {
    id: 'quick',
    icon: '>',
    title: 'QUICK GAME',
    description:
      'Jump into instant trivia with predefined categories. Perfect for quick brain challenges with 10 random questions!',
    tagline: '• 10 Questions • Mixed Categories • Instant Start',
    colors: GAME_MODE_COLORS.quick,
  },
  {
    id: 'custom',
    icon: 'AI',
    title: 'CUSTOM GAME',
    description:
      'Create AI-powered questions on any topic you choose. Specify difficulty, question count, and educational level!',
    tagline: '• AI Generated • Your Topics • Custom Settings',
    colors: GAME_MODE_COLORS.custom,
  },
  {
    id: 'advanced',
    icon: 'ADV',
    title: 'ADVANCED GAME',
    description:
      'Upload your own documents for AI-powered trivia generation. Perfect for studying or testing knowledge of specific materials!',
    tagline: '• Document Upload • Custom Timing • Contextual AI',
    colors: GAME_MODE_COLORS.advanced,
  },
]

// ============================================================================
// Component
// ============================================================================

/**
 * A pixel-art styled card button for game mode selection.
 *
 * Features hover scaling, focus ring, and pixel shadow effects.
 *
 * @example
 * ```tsx
 * <GameModeCard
 *   id="quick"
 *   icon=">"
 *   title="QUICK GAME"
 *   description="Jump into instant trivia..."
 *   tagline="• 10 Questions • Mixed Categories"
 *   colors={GAME_MODE_COLORS.quick}
 *   isHovered={hoveredCard === 'quick'}
 *   onClick={() => selectMode('quick')}
 *   {...getHoverHandlers('quick')}
 * />
 * ```
 */
export const GameModeCard = memo(function GameModeCard({
  icon,
  title,
  description,
  tagline,
  colors,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  className = '',
}: GameModeCardProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`
        p-8 bg-gradient-to-br ${colors.gradient} border-4 ${colors.border}
        text-white text-center transition-all duration-200 pixel-border
        focus:outline-none focus:ring-4 ${colors.focusRing} focus:ring-opacity-50
        ${isHovered ? 'scale-105 pixel-shadow transform translate-x-1 translate-y-1' : 'hover:scale-105 hover:pixel-shadow hover:transform hover:translate-x-1 hover:translate-y-1'}
        active:scale-95 active:translate-x-0 active:translate-y-0
        ${className}
      `}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-2xl font-pixel font-bold mb-3 pixel-text-shadow">{title}</h3>
      <p className={`${colors.descriptionText} text-sm leading-relaxed`}>{description}</p>
      <div className={`mt-4 text-xs ${colors.taglineText} font-semibold`}>{tagline}</div>
    </button>
  )
})
