/**
 * Pixel Badge Component
 *
 * A small label for status indicators, tags, and counts.
 *
 * @module app/components/ui/PixelBadge
 * @since 1.0.0
 */

'use client'

import React from 'react'

// ============================================================================
// Types
// ============================================================================

export type PixelBadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

export interface PixelBadgeProps {
  /**
   * Badge content
   */
  children: React.ReactNode

  /**
   * Badge variant
   * @default 'default'
   */
  variant?: PixelBadgeVariant

  /**
   * Badge size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Pill style (rounded)
   * @default false
   */
  pill?: boolean

  /**
   * Outline style
   * @default false
   */
  outline?: boolean

  /**
   * Show dot indicator
   * @default false
   */
  dot?: boolean

  /**
   * Optional icon
   */
  icon?: React.ReactNode

  /**
   * Optional className
   */
  className?: string
}

// ============================================================================
// Styles
// ============================================================================

const variantStyles = {
  solid: {
    default: 'bg-gray-600 text-gray-100',
    primary: 'bg-blue-600 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-500 text-gray-900',
    danger: 'bg-red-600 text-white',
    info: 'bg-cyan-600 text-white',
  },
  outline: {
    default: 'bg-transparent border-2 border-gray-500 text-gray-300',
    primary: 'bg-transparent border-2 border-blue-500 text-blue-400',
    success: 'bg-transparent border-2 border-green-500 text-green-400',
    warning: 'bg-transparent border-2 border-yellow-500 text-yellow-400',
    danger: 'bg-transparent border-2 border-red-500 text-red-400',
    info: 'bg-transparent border-2 border-cyan-500 text-cyan-400',
  },
}

const dotColors = {
  default: 'bg-gray-400',
  primary: 'bg-blue-400',
  success: 'bg-green-400',
  warning: 'bg-yellow-400',
  danger: 'bg-red-400',
  info: 'bg-cyan-400',
}

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
}

// ============================================================================
// Component
// ============================================================================

export function PixelBadge({
  children,
  variant = 'default',
  size = 'md',
  pill = false,
  outline = false,
  dot = false,
  icon,
  className = '',
}: PixelBadgeProps) {
  const colorStyle = outline ? variantStyles.outline[variant] : variantStyles.solid[variant]

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-bold uppercase tracking-wider
        ${colorStyle}
        ${sizeStyles[size]}
        ${pill ? 'rounded-full' : ''}
        ${className}
      `}
    >
      {/* Dot indicator */}
      {dot && (
        <span
          className={`
            w-2 h-2 rounded-full
            ${dotColors[variant]}
            ${outline ? '' : 'animate-pulse'}
          `}
        />
      )}

      {/* Icon */}
      {icon && <span className="inline-flex">{icon}</span>}

      {/* Content */}
      {children}
    </span>
  )
}

// ============================================================================
// Specialized Variants
// ============================================================================

/**
 * Status badge for online/offline/away states
 */
export function StatusBadge({
  status,
  showLabel = true,
}: {
  status: 'online' | 'offline' | 'away' | 'busy'
  showLabel?: boolean
}) {
  const config = {
    online: { variant: 'success' as const, label: 'Online' },
    offline: { variant: 'default' as const, label: 'Offline' },
    away: { variant: 'warning' as const, label: 'Away' },
    busy: { variant: 'danger' as const, label: 'Busy' },
  }

  const { variant, label } = config[status]

  return (
    <PixelBadge variant={variant} size="sm" dot pill>
      {showLabel && label}
    </PixelBadge>
  )
}

/**
 * Counter badge for notifications/counts
 */
export function CountBadge({
  count,
  max = 99,
  variant = 'danger',
}: {
  count: number
  max?: number
  variant?: PixelBadgeVariant
}) {
  if (count === 0) return null

  const displayCount = count > max ? `${max}+` : count.toString()

  return (
    <PixelBadge variant={variant} size="sm" pill>
      {displayCount}
    </PixelBadge>
  )
}

/**
 * Difficulty badge
 */
export function DifficultyBadge({
  difficulty,
}: {
  difficulty: 'easy' | 'classic' | 'hard' | 'expert'
}) {
  const config = {
    easy: { variant: 'success' as const, label: 'Easy' },
    classic: { variant: 'primary' as const, label: 'Classic' },
    hard: { variant: 'warning' as const, label: 'Hard' },
    expert: { variant: 'danger' as const, label: 'Expert' },
  }

  const { variant, label } = config[difficulty]

  return (
    <PixelBadge variant={variant} size="sm">
      {label}
    </PixelBadge>
  )
}
