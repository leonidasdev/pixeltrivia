/**
 * Page Header Component
 *
 * Reusable page header with title, subtitle, and optional back button.
 * Consolidates duplicated header patterns across game pages.
 *
 * @module app/components/ui/PageHeader
 * @since 1.0.0
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

// ============================================================================
// Types
// ============================================================================

export interface PageHeaderProps {
  /**
   * Main title text
   */
  title: string

  /**
   * Optional subtitle/description
   */
  subtitle?: string

  /**
   * Emoji or icon to display before title
   */
  icon?: string

  /**
   * Show back button
   * @default false
   */
  showBackButton?: boolean

  /**
   * Custom back button handler (uses router.back() if not provided)
   */
  onBack?: () => void

  /**
   * Back button label
   * @default 'Back'
   */
  backLabel?: string

  /**
   * Right side content (e.g., settings button, help button)
   */
  rightContent?: React.ReactNode

  /**
   * Header size variant
   * @default 'lg'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /**
   * Center align the header
   * @default true
   */
  centered?: boolean

  /**
   * Optional className
   */
  className?: string
}

// ============================================================================
// Styles
// ============================================================================

const sizeStyles = {
  sm: {
    title: 'text-xl sm:text-2xl',
    subtitle: 'text-xs sm:text-sm',
    icon: 'text-2xl',
    spacing: 'space-y-1',
  },
  md: {
    title: 'text-2xl sm:text-3xl',
    subtitle: 'text-sm',
    icon: 'text-3xl',
    spacing: 'space-y-2',
  },
  lg: {
    title: 'text-3xl sm:text-4xl',
    subtitle: 'text-sm sm:text-base',
    icon: 'text-4xl',
    spacing: 'space-y-2',
  },
  xl: {
    title: 'text-4xl sm:text-5xl',
    subtitle: 'text-base sm:text-lg',
    icon: 'text-5xl',
    spacing: 'space-y-3',
  },
}

// ============================================================================
// Component
// ============================================================================

export function PageHeader({
  title,
  subtitle,
  icon,
  showBackButton = false,
  onBack,
  backLabel = 'Back',
  rightContent,
  size = 'lg',
  centered = true,
  className = '',
}: PageHeaderProps) {
  const router = useRouter()
  const styles = sizeStyles[size]

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <header className={`relative w-full ${className}`}>
      {/* Back button (absolute positioned left) */}
      {showBackButton && (
        <button
          onClick={handleBack}
          className="absolute left-0 top-0 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label={backLabel}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="sr-only">{backLabel}</span>
        </button>
      )}

      {/* Right content (absolute positioned right) */}
      {rightContent && <div className="absolute right-0 top-0">{rightContent}</div>}

      {/* Main content */}
      <div className={`${centered ? 'text-center' : ''} ${styles.spacing}`}>
        {icon && (
          <div className={`${styles.icon} mb-2`} role="img" aria-hidden="true">
            {icon}
          </div>
        )}

        <h1
          className={`${styles.title} font-bold text-white pixel-text-shadow uppercase tracking-wider`}
        >
          {title}
        </h1>

        {subtitle && (
          <p className={`${styles.subtitle} text-blue-200 max-w-md mx-auto`}>{subtitle}</p>
        )}
      </div>
    </header>
  )
}
