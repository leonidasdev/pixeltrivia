/**
 * Page Transition Component
 *
 * Wraps page content with pixel-style entrance/exit animations.
 * Supports multiple transition styles.
 *
 * @module app/components/ui/PageTransition
 * @since 1.1.0
 */

'use client'

import React, { useEffect, useState } from 'react'

// ============================================================================
// Types
// ============================================================================

export type TransitionStyle = 'fade' | 'slide-up' | 'pixelate' | 'scale'

export interface PageTransitionProps {
  /** Content to wrap */
  children: React.ReactNode
  /** Transition style */
  style?: TransitionStyle
  /** Custom delay before showing (ms) */
  delay?: number
  /** Additional className */
  className?: string
}

// ============================================================================
// Component
// ============================================================================

const transitionMap: Record<TransitionStyle, { initial: string; animate: string }> = {
  fade: {
    initial: 'opacity-0',
    animate: 'opacity-100 transition-opacity duration-500 ease-out',
  },
  'slide-up': {
    initial: 'opacity-0 translate-y-8',
    animate: 'opacity-100 translate-y-0 transition-all duration-500 ease-out',
  },
  pixelate: {
    initial: 'opacity-0 scale-95 blur-sm',
    animate: 'opacity-100 scale-100 blur-0 transition-all duration-400 ease-out',
  },
  scale: {
    initial: 'opacity-0 scale-90',
    animate: 'opacity-100 scale-100 transition-all duration-400 ease-out',
  },
}

export function PageTransition({
  children,
  style = 'slide-up',
  delay = 0,
  className = '',
}: PageTransitionProps) {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), delay + 50)
    return () => clearTimeout(timer)
  }, [delay])

  const t = transitionMap[style]

  return <div className={`${entered ? t.animate : t.initial} ${className}`}>{children}</div>
}

// ============================================================================
// Staggered Children Wrapper
// ============================================================================

export interface StaggerChildrenProps {
  /** Children to stagger */
  children: React.ReactNode[]
  /** Delay between each child (ms) */
  staggerDelay?: number
  /** Transition style for each child */
  style?: TransitionStyle
  /** Additional className for each child wrapper */
  className?: string
}

/**
 * Renders children with staggered entrance animations.
 *
 * @example
 * ```tsx
 * <StaggerChildren staggerDelay={100}>
 *   {items.map(item => <Card key={item.id} {...item} />)}
 * </StaggerChildren>
 * ```
 */
export function StaggerChildren({
  children,
  staggerDelay = 80,
  style = 'slide-up',
  className = '',
}: StaggerChildrenProps) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <PageTransition style={style} delay={index * staggerDelay} className={className}>
          {child}
        </PageTransition>
      ))}
    </>
  )
}
