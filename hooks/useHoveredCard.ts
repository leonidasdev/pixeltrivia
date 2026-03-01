/**
 * useHoveredCard Hook
 *
 * Manages hover/focus state for interactive card elements.
 * Provides consistent mouse and keyboard interaction handlers.
 *
 * @module hooks/useHoveredCard
 * @since 1.0.0
 */

import { useState, useCallback } from 'react'

/** Hover handler props returned by getHoverHandlers */
export interface HoverHandlers {
  onMouseEnter: () => void
  onMouseLeave: () => void
  onFocus: () => void
  onBlur: () => void
}

/** Return type for useHoveredCard hook */
export interface UseHoveredCardReturn {
  /** Currently hovered card ID, or null */
  hoveredCard: string | null
  /** Set the hovered card ID directly */
  setHoveredCard: (id: string | null) => void
  /** Get hover/focus handlers for a specific card */
  getHoverHandlers: (id: string, onHoverSound?: () => void) => HoverHandlers
}

/**
 * Hook for managing hover/focus state across a set of interactive cards.
 *
 * @example
 * ```tsx
 * const { hoveredCard, getHoverHandlers } = useHoveredCard()
 *
 * <button {...getHoverHandlers('card1', () => playSound('hover'))}>
 *   Card 1
 * </button>
 * ```
 */
export function useHoveredCard(): UseHoveredCardReturn {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const getHoverHandlers = useCallback(
    (id: string, onHoverSound?: () => void): HoverHandlers => ({
      onMouseEnter: () => {
        setHoveredCard(id)
        onHoverSound?.()
      },
      onMouseLeave: () => setHoveredCard(null),
      onFocus: () => setHoveredCard(id),
      onBlur: () => setHoveredCard(null),
    }),
    []
  )

  return { hoveredCard, setHoveredCard, getHoverHandlers }
}
