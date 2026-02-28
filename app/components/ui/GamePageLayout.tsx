/**
 * Game Page Layout Component
 *
 * Reusable layout wrapper for game pages with consistent background,
 * header, and content structure. Consolidates duplicated layout patterns.
 *
 * @module app/components/ui/GamePageLayout
 * @since 1.0.0
 */

'use client'

import React from 'react'
import {
  PageBackground,
  SparklesOverlay,
  type GradientPreset,
  type SparklePreset,
} from './AnimatedBackground'
import { PageHeader, type PageHeaderProps } from './PageHeader'

// Re-export types for convenience
export type { GradientPreset, SparklePreset }

// Non-custom sparkle presets
type SparklePresetNoCustom = Exclude<SparklePreset, 'custom'>

// ============================================================================
// Types
// ============================================================================

export interface GamePageLayoutProps {
  /**
   * Page content
   */
  children: React.ReactNode

  /**
   * Page header configuration (optional)
   */
  header?: PageHeaderProps

  /**
   * Background gradient preset
   * @default 'purple-blue'
   */
  gradient?: GradientPreset

  /**
   * Sparkle animation preset
   * @default 'default'
   */
  sparkles?: SparklePresetNoCustom

  /**
   * Hide the animated background
   * @default false
   */
  noBackground?: boolean

  /**
   * Hide sparkle animations
   * @default false
   */
  noSparkles?: boolean

  /**
   * Content container max width
   * @default 'md'
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

  /**
   * Content padding
   * @default 'default'
   */
  padding?: 'none' | 'sm' | 'default' | 'lg'

  /**
   * Center content vertically
   * @default false
   */
  centerContent?: boolean

  /**
   * Optional className for the container
   */
  className?: string

  /**
   * Optional className for the content wrapper
   */
  contentClassName?: string
}

// ============================================================================
// Styles
// ============================================================================

const maxWidthStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  default: 'p-4 sm:p-6 md:p-8',
  lg: 'p-6 sm:p-8 md:p-12',
}

// ============================================================================
// Component
// ============================================================================

export function GamePageLayout({
  children,
  header,
  gradient = 'purple-blue',
  sparkles = 'default',
  noBackground = false,
  noSparkles = false,
  maxWidth = 'md',
  padding = 'default',
  centerContent = false,
  className = '',
  contentClassName = '',
}: GamePageLayoutProps) {
  const content = (
    <div
      className={`
        relative z-10 min-h-screen flex flex-col
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {/* Header */}
      {header && (
        <div className="mb-6 sm:mb-8">
          <PageHeader {...header} />
        </div>
      )}

      {/* Main content */}
      <main
        className={`
          flex-1 flex flex-col
          ${centerContent ? 'justify-center' : ''}
          ${contentClassName}
        `}
      >
        <div className={`w-full mx-auto ${maxWidthStyles[maxWidth]}`}>{children}</div>
      </main>
    </div>
  )

  // Without background, just return content
  if (noBackground) {
    return (
      <div className="min-h-screen bg-gray-900">
        {!noSparkles && <SparklesOverlay preset={sparkles} />}
        {content}
      </div>
    )
  }

  // With full background
  return (
    <PageBackground gradient={gradient} sparklePreset={noSparkles ? 'minimal' : sparkles}>
      {content}
    </PageBackground>
  )
}
