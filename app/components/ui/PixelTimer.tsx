/**
 * Pixel Timer Component
 *
 * Animated timer with urgency effects — pulsing, color shifts, and shake
 * when time is running low.
 *
 * @module app/components/ui/PixelTimer
 * @since 1.1.0
 */

'use client'

import React, { useMemo } from 'react'

// ============================================================================
// Types
// ============================================================================

export interface PixelTimerProps {
  /** Time remaining in seconds */
  timeRemaining: number
  /** Total time in seconds (for progress calculation) */
  totalTime: number
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Show progress bar */
  showProgress?: boolean
  /** Additional className */
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const WARNING_THRESHOLD = 0.3 // 30% time remaining
const CRITICAL_THRESHOLD = 0.15 // 15% time remaining

// ============================================================================
// Component
// ============================================================================

export function PixelTimer({
  timeRemaining,
  totalTime,
  size = 'md',
  showProgress = true,
  className = '',
}: PixelTimerProps) {
  const progress = totalTime > 0 ? timeRemaining / totalTime : 0
  const isWarning = progress <= WARNING_THRESHOLD && progress > CRITICAL_THRESHOLD
  const isCritical = progress <= CRITICAL_THRESHOLD

  const timerState = useMemo(() => {
    if (isCritical) {
      return {
        textColor: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500',
        barColor: 'bg-red-500',
        glowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]',
        animation: 'animate-pulse-urgent',
        icon: '🔥',
      }
    }
    if (isWarning) {
      return {
        textColor: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500',
        barColor: 'bg-yellow-500',
        glowColor: 'shadow-[0_0_10px_rgba(234,179,8,0.3)]',
        animation: '',
        icon: '⚡',
      }
    }
    return {
      textColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/50',
      barColor: 'bg-cyan-500',
      glowColor: '',
      animation: '',
      icon: '⏱',
    }
  }, [isCritical, isWarning])

  const sizeStyles = {
    sm: { container: 'px-3 py-1', text: 'text-sm', bar: 'h-1' },
    md: { container: 'px-4 py-2', text: 'text-lg', bar: 'h-2' },
    lg: { container: 'px-6 py-3', text: 'text-2xl', bar: 'h-3' },
  }

  const s = sizeStyles[size]

  return (
    <div
      className={`
        ${s.container}
        ${timerState.bgColor}
        ${timerState.glowColor}
        ${timerState.animation}
        border-2 ${timerState.borderColor}
        transition-all duration-300
        ${className}
      `}
      role="timer"
      aria-live="polite"
      aria-label={`${timeRemaining} seconds remaining`}
    >
      {/* Timer display */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-base" aria-hidden="true">
          {timerState.icon}
        </span>
        <span
          className={`font-pixel ${s.text} ${timerState.textColor} font-bold tabular-nums`}
          style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}
        >
          {timeRemaining}
        </span>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div
          className={`mt-2 w-full bg-gray-700/50 rounded-full overflow-hidden ${s.bar}`}
          role="progressbar"
          aria-valuenow={timeRemaining}
          aria-valuemin={0}
          aria-valuemax={totalTime}
        >
          <div
            className={`
              ${s.bar} ${timerState.barColor}
              rounded-full
              transition-all duration-1000 ease-linear
            `}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
