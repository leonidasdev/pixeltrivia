/**
 * Animated Background Component
 *
 * Reusable animated background decorations for pages.
 * Consolidates duplicated sparkle/star animations across game pages.
 *
 * @module app/components/ui/AnimatedBackground
 * @since 1.0.0
 */

'use client'

import React, { useMemo } from 'react'

// ============================================================================
// Types
// ============================================================================

export interface SparkleConfig {
  /** Position from top (CSS value like '25%' or '100px') */
  top: string
  /** Position from left (CSS value like '25%' or '100px') */
  left: string
  /** Tailwind color class (e.g., 'yellow-400', 'pink-400') */
  color: string
  /** Animation delay in milliseconds */
  delay?: number
  /** Size in pixels */
  size?: number
  /** Opacity (0-1) */
  opacity?: number
}

/**
 * Available sparkle presets
 */
export type SparklePreset = 'default' | 'dense' | 'minimal' | 'colorful' | 'custom'

/**
 * Available gradient presets
 */
export type GradientPreset = 'purple-blue' | 'dark' | 'sunset' | 'ocean' | 'forest'

export interface AnimatedBackgroundProps {
  /**
   * Preset configuration
   * @default 'default'
   */
  preset?: SparklePreset

  /**
   * Custom sparkle configurations (used with preset='custom')
   */
  sparkles?: SparkleConfig[]

  /**
   * Whether to include gradient background
   * @default false
   */
  withGradient?: boolean

  /**
   * Gradient preset
   * @default 'purple-blue'
   */
  gradientPreset?: GradientPreset

  /**
   * Optional className for the container
   */
  className?: string

  /**
   * Children to render on top of background
   */
  children?: React.ReactNode
}

// ============================================================================
// Preset Configurations
// ============================================================================

const SPARKLE_PRESETS: Record<string, SparkleConfig[]> = {
  default: [
    { top: '25%', left: '25%', color: 'yellow-400', delay: 0 },
    { top: '75%', left: '75%', color: 'pink-400', delay: 1000 },
    { top: '50%', left: '16.67%', color: 'cyan-400', delay: 2000 },
  ],
  dense: [
    { top: '10%', left: '10%', color: 'yellow-400', delay: 0 },
    { top: '20%', left: '80%', color: 'pink-400', delay: 200 },
    { top: '40%', left: '15%', color: 'cyan-400', delay: 400 },
    { top: '60%', left: '85%', color: 'green-400', delay: 600 },
    { top: '80%', left: '20%', color: 'purple-400', delay: 800 },
    { top: '30%', left: '50%', color: 'orange-400', delay: 1000 },
    { top: '70%', left: '40%', color: 'blue-400', delay: 1200 },
    { top: '90%', left: '70%', color: 'red-400', delay: 1400 },
  ],
  minimal: [
    { top: '25%', left: '25%', color: 'yellow-400', delay: 0 },
    { top: '75%', left: '75%', color: 'pink-400', delay: 1000 },
  ],
  colorful: [
    { top: '25%', left: '25%', color: 'yellow-400', delay: 0 },
    { top: '75%', left: '25%', color: 'pink-400', delay: 1000 },
    { top: '50%', left: '16.67%', color: 'cyan-400', delay: 2000 },
    { top: '33%', left: '66%', color: 'green-400', delay: 3000 },
    { top: '66%', left: '50%', color: 'purple-400', delay: 500 },
    { top: '15%', left: '80%', color: 'orange-400', delay: 1500 },
  ],
  custom: [],
}

/**
 * Map of sparkle color names to Tailwind bg-color classes.
 *
 * Tailwind cannot detect dynamically-constructed class names like
 * `bg-${color}`. Using this map keeps classes statically analyzable.
 */
const BG_COLOR_MAP: Record<string, string> = {
  'yellow-400': 'bg-yellow-400',
  'pink-400': 'bg-pink-400',
  'cyan-400': 'bg-cyan-400',
  'green-400': 'bg-green-400',
  'purple-400': 'bg-purple-400',
  'orange-400': 'bg-orange-400',
  'blue-400': 'bg-blue-400',
  'red-400': 'bg-red-400',
  white: 'bg-white',
}

const GRADIENT_PRESETS: Record<string, string> = {
  'purple-blue': 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900',
  dark: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
  sunset: 'bg-gradient-to-br from-orange-900 via-red-900 to-pink-900',
  ocean: 'bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900',
  forest: 'bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900',
}

// ============================================================================
// Sparkle Component
// ============================================================================

interface SparkleProps extends SparkleConfig {
  index: number
}

function Sparkle({ top, left, color, delay = 0, size = 2, opacity = 0.6, index }: SparkleProps) {
  const bgClass = BG_COLOR_MAP[color] ?? `bg-${color}`
  const delayClass = useMemo(() => {
    if (delay === 0) return ''
    if (delay <= 300) return 'animation-delay-300'
    if (delay <= 500) return 'animation-delay-500'
    if (delay <= 1000) return 'animation-delay-1000'
    if (delay <= 2000) return 'animation-delay-2000'
    return ''
  }, [delay])

  // For delays not matching preset classes, use inline style
  const customDelay = ![0, 300, 500, 1000, 2000].includes(delay)
    ? { animationDelay: `${delay}ms` }
    : {}

  return (
    <div
      key={index}
      className={`absolute ${bgClass} animate-pulse ${delayClass}`}
      style={{
        top,
        left,
        width: `${size * 4}px`,
        height: `${size * 4}px`,
        opacity,
        ...customDelay,
      }}
      aria-hidden="true"
    />
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function AnimatedBackground({
  preset = 'default',
  sparkles,
  withGradient = false,
  gradientPreset = 'purple-blue',
  className = '',
  children,
}: AnimatedBackgroundProps) {
  const sparkleConfigs = preset === 'custom' && sparkles ? sparkles : SPARKLE_PRESETS[preset]
  const gradientClass = withGradient ? GRADIENT_PRESETS[gradientPreset] : ''

  return (
    <div className={`relative ${gradientClass} ${className}`}>
      {/* Sparkles layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {sparkleConfigs.map((config, index) => (
          <Sparkle key={index} index={index} {...config} />
        ))}
      </div>

      {/* Content layer */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  )
}

// ============================================================================
// Specialized Variants
// ============================================================================

/**
 * Full-page animated background wrapper
 */
export function PageBackground({
  children,
  sparklePreset = 'default',
  gradient = 'purple-blue',
  className = '',
}: {
  children: React.ReactNode
  sparklePreset?: Exclude<SparklePreset, 'custom'>
  gradient?: GradientPreset
  className?: string
}) {
  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden ${GRADIENT_PRESETS[gradient]} ${className}`}
    >
      <AnimatedBackground preset={sparklePreset} />
      <div className="relative z-10 w-full max-w-4xl">{children}</div>
    </main>
  )
}

/**
 * Floating sparkles overlay (no gradient, just decorations)
 */
export function SparklesOverlay({
  preset = 'minimal',
  className = '',
}: {
  preset?: Exclude<SparklePreset, 'custom'>
  className?: string
}) {
  const sparkleConfigs = SPARKLE_PRESETS[preset]

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {sparkleConfigs.map((config, index) => (
        <Sparkle key={index} index={index} {...config} />
      ))}
    </div>
  )
}
