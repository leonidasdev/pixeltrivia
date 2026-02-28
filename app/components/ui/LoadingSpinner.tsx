/**
 * Loading Spinner Component
 *
 * A pixel-art styled loading indicator.
 *
 * @module app/components/ui/LoadingSpinner
 * @since 1.0.0
 */

'use client'

import React from 'react'

// ============================================================================
// Types
// ============================================================================

export type LoadingSpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface LoadingSpinnerProps {
  /**
   * Spinner size
   * @default 'md'
   */
  size?: LoadingSpinnerSize

  /**
   * Spinner color (Tailwind color class without 'text-')
   * @default 'white'
   */
  color?: string

  /**
   * Optional label text
   */
  label?: string

  /**
   * Show label below spinner
   * @default false
   */
  showLabel?: boolean

  /**
   * Optional className override
   */
  className?: string
}

// ============================================================================
// Styles
// ============================================================================

const sizeStyles: Record<LoadingSpinnerSize, { spinner: string; text: string }> = {
  xs: { spinner: 'w-4 h-4', text: 'text-xs' },
  sm: { spinner: 'w-6 h-6', text: 'text-sm' },
  md: { spinner: 'w-8 h-8', text: 'text-base' },
  lg: { spinner: 'w-12 h-12', text: 'text-lg' },
  xl: { spinner: 'w-16 h-16', text: 'text-xl' },
}

/**
 * Map of known color names to Tailwind text-color classes.
 *
 * Tailwind cannot detect dynamically-constructed class names like
 * `text-${color}`. Using this map keeps classes statically analyzable.
 */
const TEXT_COLOR_MAP: Record<string, string> = {
  white: 'text-white',
  blue: 'text-blue-400',
  green: 'text-green-400',
  red: 'text-red-400',
  yellow: 'text-yellow-400',
  purple: 'text-purple-400',
  gray: 'text-gray-400',
  cyan: 'text-cyan-400',
  pink: 'text-pink-400',
}

// ============================================================================
// Pixel Spinner SVG (currently unused, available for future use)
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _PixelSpinnerSVG({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pixel-art style spinner using rectangles */}
      <g className="animate-spin origin-center">
        <rect x="7" y="0" width="2" height="4" opacity="0.25" />
        <rect x="11" y="1" width="2" height="4" opacity="0.375" transform="rotate(45 12 3)" />
        <rect x="12" y="7" width="4" height="2" opacity="0.5" />
        <rect x="11" y="11" width="2" height="4" opacity="0.625" transform="rotate(-45 12 13)" />
        <rect x="7" y="12" width="2" height="4" opacity="0.75" />
        <rect x="1" y="11" width="2" height="4" opacity="0.875" transform="rotate(45 2 13)" />
        <rect x="0" y="7" width="4" height="2" opacity="1" />
        <rect x="1" y="1" width="2" height="4" opacity="0.125" transform="rotate(-45 2 3)" />
      </g>
    </svg>
  )
}

// ============================================================================
// Alternative: Dots Spinner
// ============================================================================

function DotsSpinner({ className }: { className: string }) {
  return (
    <div className={`${className} flex items-center justify-center gap-1`}>
      <span className="w-2 h-2 bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

// ============================================================================
// Component
// ============================================================================

export function LoadingSpinner({
  size = 'md',
  color = 'white',
  label = 'Loading...',
  showLabel = false,
  className = '',
}: LoadingSpinnerProps) {
  const styles = sizeStyles[size]
  const colorClass = TEXT_COLOR_MAP[color] ?? `text-${color}`

  return (
    <div
      className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}
      role="status"
      aria-label={label}
    >
      {/* Main spinner */}
      <div className={`${colorClass} ${styles.spinner}`}>
        <svg
          className="animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer ring */}
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          {/* Spinning segment */}
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>

      {/* Optional label */}
      {showLabel && (
        <span className={`${colorClass} ${styles.text} font-medium animate-pulse`}>{label}</span>
      )}

      {/* Screen reader text */}
      <span className="sr-only">{label}</span>
    </div>
  )
}

// ============================================================================
// Variants
// ============================================================================

/**
 * Full-page loading overlay
 */
export function LoadingOverlay({
  label = 'Loading...',
  transparent = false,
}: {
  label?: string
  transparent?: boolean
}) {
  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${transparent ? 'bg-black/50' : 'bg-gray-900'}
      `}
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="xl" showLabel label={label} />
      </div>
    </div>
  )
}

/**
 * Inline loading indicator for buttons/text
 */
export function LoadingDots({ className = '' }: { className?: string }) {
  return <DotsSpinner className={className} />
}
