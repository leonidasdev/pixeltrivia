/**
 * Pixel Button Component
 *
 * A reusable button with pixel-art styling.
 *
 * @module app/components/ui/PixelButton
 * @since 1.0.0
 */

'use client'

import React, { forwardRef } from 'react'

// ============================================================================
// Types
// ============================================================================

export type PixelButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'ghost'

export type PixelButtonSize = 'sm' | 'md' | 'lg' | 'xl'

export interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button visual variant
   * @default 'primary'
   */
  variant?: PixelButtonVariant

  /**
   * Button size
   * @default 'md'
   */
  size?: PixelButtonSize

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean

  /**
   * Loading state
   * @default false
   */
  loading?: boolean

  /**
   * Left icon element
   */
  leftIcon?: React.ReactNode

  /**
   * Right icon element
   */
  rightIcon?: React.ReactNode

  /**
   * Optional className override
   */
  className?: string
}

// ============================================================================
// Styles
// ============================================================================

const variantStyles: Record<PixelButtonVariant, string> = {
  primary: `
    bg-blue-600 hover:bg-blue-500 active:bg-blue-700
    text-white
    border-b-4 border-blue-800 hover:border-blue-700
    shadow-[4px_4px_0_rgba(0,0,0,0.3)]
    hover:shadow-[6px_6px_0_rgba(0,0,0,0.3)]
    active:shadow-[2px_2px_0_rgba(0,0,0,0.3)]
  `,
  secondary: `
    bg-gray-600 hover:bg-gray-500 active:bg-gray-700
    text-white
    border-b-4 border-gray-800 hover:border-gray-700
    shadow-[4px_4px_0_rgba(0,0,0,0.3)]
    hover:shadow-[6px_6px_0_rgba(0,0,0,0.3)]
    active:shadow-[2px_2px_0_rgba(0,0,0,0.3)]
  `,
  success: `
    bg-green-600 hover:bg-green-500 active:bg-green-700
    text-white
    border-b-4 border-green-800 hover:border-green-700
    shadow-[4px_4px_0_rgba(0,0,0,0.3)]
    hover:shadow-[6px_6px_0_rgba(0,0,0,0.3)]
    active:shadow-[2px_2px_0_rgba(0,0,0,0.3)]
  `,
  danger: `
    bg-red-600 hover:bg-red-500 active:bg-red-700
    text-white
    border-b-4 border-red-800 hover:border-red-700
    shadow-[4px_4px_0_rgba(0,0,0,0.3)]
    hover:shadow-[6px_6px_0_rgba(0,0,0,0.3)]
    active:shadow-[2px_2px_0_rgba(0,0,0,0.3)]
  `,
  warning: `
    bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600
    text-gray-900
    border-b-4 border-yellow-700 hover:border-yellow-600
    shadow-[4px_4px_0_rgba(0,0,0,0.3)]
    hover:shadow-[6px_6px_0_rgba(0,0,0,0.3)]
    active:shadow-[2px_2px_0_rgba(0,0,0,0.3)]
  `,
  ghost: `
    bg-transparent hover:bg-white/10 active:bg-white/20
    text-white
    border-2 border-white/30 hover:border-white/50
  `,
}

const sizeStyles: Record<PixelButtonSize, string> = {
  sm: 'px-3 py-2 text-sm min-h-[44px]',
  md: 'px-4 py-2.5 text-base min-h-[44px]',
  lg: 'px-6 py-3 text-lg min-h-[48px]',
  xl: 'px-8 py-4 text-xl min-h-[56px]',
}

const disabledStyles = `
  opacity-50 cursor-not-allowed
  hover:shadow-[4px_4px_0_rgba(0,0,0,0.3)]
  active:shadow-[4px_4px_0_rgba(0,0,0,0.3)]
`

const baseStyles = `
  relative inline-flex items-center justify-center gap-2
  font-bold uppercase tracking-wider
  transition-all duration-150 ease-out
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
  select-none
`

// ============================================================================
// Component
// ============================================================================

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? disabledStyles : ''}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <>
            <span className="inline-block animate-spin mr-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
            Loading...
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

PixelButton.displayName = 'PixelButton'
