/**
 * useSwipe Hook
 *
 * Detects touch swipe gestures on a target element.
 * Supports four directions with configurable thresholds and velocity.
 * Designed for mobile navigation and game interactions.
 *
 * @module hooks/useSwipe
 * @since 1.2.0
 */

'use client'

import { useRef, useCallback, useEffect, type RefObject } from 'react'

/** Recognised swipe directions. */
export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

/** Configuration options for swipe detection. */
export interface UseSwipeOptions {
  /** Minimum distance in pixels for a gesture to count as a swipe (default: 50). */
  threshold?: number
  /** Maximum time in ms allowed for the swipe gesture (default: 300). */
  maxDuration?: number
  /** Callbacks for each swipe direction. */
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  /** Generic callback fired for any swipe, receives direction. */
  onSwipe?: (direction: SwipeDirection) => void
  /** When true, calls `preventDefault()` on touch events to prevent scrolling during swipes. */
  preventScroll?: boolean
  /** When true, the hook does nothing (useful for conditional enabling). */
  disabled?: boolean
}

/** Return type exposing the ref to attach and active swipe state. */
export interface UseSwipeReturn<T extends HTMLElement = HTMLElement> {
  /** Attach this ref to the target element. */
  ref: RefObject<T | null>
  /** Whether a touch is currently active. */
  isSwiping: boolean
}

interface TouchPoint {
  x: number
  y: number
  time: number
}

/**
 * Hook that detects swipe gestures on a referenced element.
 *
 * @example
 * ```tsx
 * const { ref } = useSwipe<HTMLDivElement>({
 *   onSwipeLeft: () => console.log('swiped left'),
 *   onSwipeRight: () => router.back(),
 *   threshold: 60,
 * })
 * return <div ref={ref}>...</div>
 * ```
 */
export function useSwipe<T extends HTMLElement = HTMLElement>(
  options: UseSwipeOptions = {}
): UseSwipeReturn<T> {
  const {
    threshold = 50,
    maxDuration = 300,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipe,
    preventScroll = false,
    disabled = false,
  } = options

  const ref = useRef<T | null>(null)
  const touchStart = useRef<TouchPoint | null>(null)
  const isSwipingRef = useRef(false)

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled) return
      const touch = e.touches[0]
      if (!touch) return
      touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
      isSwipingRef.current = true
    },
    [disabled]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || !touchStart.current || !preventScroll) return
      const touch = e.touches[0]
      if (!touch) return

      const dx = Math.abs(touch.clientX - touchStart.current.x)
      const dy = Math.abs(touch.clientY - touchStart.current.y)

      // If horizontal movement exceeds vertical, prevent scroll
      if (dx > dy && dx > 10) {
        e.preventDefault()
      }
    },
    [disabled, preventScroll]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (disabled || !touchStart.current) return

      const touch = e.changedTouches[0]
      if (!touch) {
        touchStart.current = null
        isSwipingRef.current = false
        return
      }

      const dx = touch.clientX - touchStart.current.x
      const dy = touch.clientY - touchStart.current.y
      const elapsed = Date.now() - touchStart.current.time

      touchStart.current = null
      isSwipingRef.current = false

      // Check timing constraint
      if (elapsed > maxDuration) return

      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      // Must reach minimum threshold
      if (absDx < threshold && absDy < threshold) return

      let direction: SwipeDirection

      if (absDx > absDy) {
        // Horizontal swipe
        direction = dx > 0 ? 'right' : 'left'
      } else {
        // Vertical swipe
        direction = dy > 0 ? 'down' : 'up'
      }

      // Fire direction-specific callbacks
      switch (direction) {
        case 'left':
          onSwipeLeft?.()
          break
        case 'right':
          onSwipeRight?.()
          break
        case 'up':
          onSwipeUp?.()
          break
        case 'down':
          onSwipeDown?.()
          break
      }

      // Fire generic callback
      onSwipe?.(direction)
    },
    [disabled, threshold, maxDuration, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipe]
  )

  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, disabled, preventScroll])

  return { ref, isSwiping: isSwipingRef.current }
}
