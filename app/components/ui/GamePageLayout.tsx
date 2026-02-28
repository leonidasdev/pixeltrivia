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

// ============================================================================
// Specialized Layouts
// ============================================================================

/**
 * Menu page layout with centered content
 */
export interface MenuPageLayoutProps extends Omit<
  GamePageLayoutProps,
  'centerContent' | 'maxWidth'
> {
  /**
   * Content max width
   * @default 'md'
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

export function MenuPageLayout({
  children,
  maxWidth = 'md',
  padding = 'default',
  ...props
}: MenuPageLayoutProps) {
  return (
    <GamePageLayout {...props} maxWidth={maxWidth} padding={padding} centerContent={true}>
      {children}
    </GamePageLayout>
  )
}

/**
 * Game configuration page layout
 */
export interface ConfigPageLayoutProps extends Omit<GamePageLayoutProps, 'maxWidth'> {
  /**
   * Show sidebar for settings
   */
  showSidebar?: boolean

  /**
   * Sidebar content
   */
  sidebar?: React.ReactNode
}

export function ConfigPageLayout({
  children,
  showSidebar = false,
  sidebar,
  ...props
}: ConfigPageLayoutProps) {
  if (!showSidebar || !sidebar) {
    return (
      <GamePageLayout {...props} maxWidth="lg">
        {children}
      </GamePageLayout>
    )
  }

  return (
    <GamePageLayout {...props} maxWidth="2xl">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">{children}</div>
        <aside className="w-full lg:w-80 shrink-0">{sidebar}</aside>
      </div>
    </GamePageLayout>
  )
}

// ============================================================================
// Content Containers
// ============================================================================

export interface ContentCardProps {
  /**
   * Card content
   */
  children: React.ReactNode

  /**
   * Card title
   */
  title?: string

  /**
   * Card icon
   */
  icon?: string

  /**
   * Optional className
   */
  className?: string
}

/**
 * Styled content card for game pages
 */
export function ContentCard({ children, title, icon, className = '' }: ContentCardProps) {
  return (
    <div
      className={`
        bg-gray-800/80 backdrop-blur-sm border-2 border-purple-500/30
        p-4 sm:p-6 shadow-lg pixel-border
        ${className}
      `}
    >
      {title && (
        <h3 className="text-lg font-pixel font-bold text-cyan-300 mb-4 flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

/**
 * Action button group container
 */
export interface ActionGroupProps {
  /**
   * Button elements
   */
  children: React.ReactNode

  /**
   * Layout direction
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal'

  /**
   * Spacing between buttons
   * @default 'md'
   */
  spacing?: 'sm' | 'md' | 'lg'

  /**
   * Optional className
   */
  className?: string
}

const spacingStyles = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
}

export function ActionGroup({
  children,
  direction = 'vertical',
  spacing = 'md',
  className = '',
}: ActionGroupProps) {
  return (
    <div
      className={`
        flex ${direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap justify-center'}
        ${spacingStyles[spacing]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
