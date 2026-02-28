/**
 * Pixel Card Component
 *
 * A reusable card container with pixel-art styling.
 *
 * @module app/components/ui/PixelCard
 * @since 1.0.0
 */

'use client'

import React from 'react'

// ============================================================================
// Types
// ============================================================================

export interface PixelCardProps {
  /**
   * Card content
   */
  children: React.ReactNode

  /**
   * Card title
   */
  title?: string

  /**
   * Card subtitle
   */
  subtitle?: string

  /**
   * Card variant
   * @default 'default'
   */
  variant?: 'default' | 'elevated' | 'bordered' | 'gradient'

  /**
   * Padding size
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg'

  /**
   * Interactive card (hover effects)
   * @default false
   */
  interactive?: boolean

  /**
   * Click handler (makes card a button)
   */
  onClick?: () => void

  /**
   * Header right content
   */
  headerAction?: React.ReactNode

  /**
   * Footer content
   */
  footer?: React.ReactNode

  /**
   * Optional className
   */
  className?: string
}

// ============================================================================
// Styles
// ============================================================================

const variantStyles = {
  default: `
    bg-gray-800/90 border-4 border-gray-700
    shadow-[4px_4px_0_rgba(0,0,0,0.3)]
  `,
  elevated: `
    bg-gray-800 border-4 border-gray-600
    shadow-[8px_8px_0_rgba(0,0,0,0.4)]
  `,
  bordered: `
    bg-transparent border-4 border-gray-500
    shadow-none
  `,
  gradient: `
    bg-gradient-to-br from-gray-800 to-gray-900
    border-4 border-gray-600
    shadow-[4px_4px_0_rgba(0,0,0,0.3)]
  `,
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

const interactiveStyles = `
  cursor-pointer
  transition-all duration-150
  hover:translate-x-[-2px] hover:translate-y-[-2px]
  hover:shadow-[6px_6px_0_rgba(0,0,0,0.4)]
  active:translate-x-[2px] active:translate-y-[2px]
  active:shadow-[2px_2px_0_rgba(0,0,0,0.2)]
`

// ============================================================================
// Component
// ============================================================================

export function PixelCard({
  children,
  title,
  subtitle,
  variant = 'default',
  padding = 'md',
  interactive = false,
  onClick,
  headerAction,
  footer,
  className = '',
}: PixelCardProps) {
  const isClickable = interactive || !!onClick

  const cardClasses = `
    ${variantStyles[variant]}
    ${isClickable ? interactiveStyles : ''}
    ${className}
  `

  const content = (
    <>
      {/* Header */}
      {(title || subtitle || headerAction) && (
        <div
          className={`
            flex items-start justify-between gap-4
            border-b-4 border-gray-700
            ${paddingStyles[padding]}
          `}
        >
          <div>
            {title && (
              <h3 className="text-base sm:text-lg font-pixel font-bold text-white uppercase tracking-wider truncate">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      {/* Content */}
      <div className={paddingStyles[padding]}>{children}</div>

      {/* Footer */}
      {footer && (
        <div
          className={`
            border-t-4 border-gray-700
            ${paddingStyles[padding]}
          `}
        >
          {footer}
        </div>
      )}
    </>
  )

  if (onClick) {
    return (
      <button onClick={onClick} className={`${cardClasses} w-full text-left block`} type="button">
        {content}
      </button>
    )
  }

  return <div className={cardClasses}>{content}</div>
}

// ============================================================================
// Grid Layout Helper
// ============================================================================

interface CardGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CardGrid({ children, columns = 3, gap = 'md', className = '' }: CardGridProps) {
  const columnStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  const gapStyles = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }

  return (
    <div className={`grid ${columnStyles[columns]} ${gapStyles[gap]} ${className}`}>{children}</div>
  )
}
