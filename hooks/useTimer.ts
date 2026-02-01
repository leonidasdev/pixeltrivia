/**
 * useTimer Hook
 *
 * Provides countdown timer functionality for quiz questions.
 *
 * @module hooks/useTimer
 * @since 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { TIME_WARNING_THRESHOLD, TIME_CRITICAL_THRESHOLD } from '../constants/game'

/**
 * Timer state
 */
export interface TimerState {
  /** Remaining time in seconds */
  timeRemaining: number
  /** Whether the timer is running */
  isRunning: boolean
  /** Whether time is in warning zone */
  isWarning: boolean
  /** Whether time is in critical zone */
  isCritical: boolean
  /** Whether time has expired */
  isExpired: boolean
  /** Progress percentage (0-100) */
  progress: number
  /** Elapsed time in milliseconds (for scoring) */
  elapsedMs: number
}

/**
 * Timer actions
 */
export interface TimerActions {
  /** Start the timer */
  start: () => void
  /** Pause the timer */
  pause: () => void
  /** Resume the timer */
  resume: () => void
  /** Reset the timer with optional new duration */
  reset: (newDuration?: number) => void
  /** Stop the timer and return elapsed time */
  stop: () => number
}

/**
 * Configuration for the timer
 */
export interface UseTimerOptions {
  /** Total time in seconds */
  duration: number
  /** Callback when timer expires */
  onExpire?: () => void
  /** Callback on each tick (every second) */
  onTick?: (remaining: number) => void
  /** Callback when entering warning zone */
  onWarning?: () => void
  /** Callback when entering critical zone */
  onCritical?: () => void
  /** Whether to start immediately */
  autoStart?: boolean
  /** Warning threshold override */
  warningThreshold?: number
  /** Critical threshold override */
  criticalThreshold?: number
}

/**
 * Return type of the useTimer hook
 */
export type UseTimerReturn = TimerState & TimerActions

/**
 * Custom hook for countdown timer functionality
 *
 * @param options - Timer configuration
 * @returns Timer state and actions
 *
 * @example
 * ```tsx
 * const {
 *   timeRemaining,
 *   isRunning,
 *   isWarning,
 *   isCritical,
 *   progress,
 *   start,
 *   pause,
 *   reset
 * } = useTimer({
 *   duration: 30,
 *   onExpire: () => handleTimeout(),
 *   onWarning: () => playWarningSound(),
 *   autoStart: true
 * })
 *
 * // In JSX
 * <div className={isCritical ? 'text-red-500' : isWarning ? 'text-yellow-500' : ''}>
 *   {timeRemaining}s
 * </div>
 * ```
 */
export function useTimer(options: UseTimerOptions): UseTimerReturn {
  const {
    duration,
    onExpire,
    onTick,
    onWarning,
    onCritical,
    autoStart = false,
    warningThreshold = TIME_WARNING_THRESHOLD,
    criticalThreshold = TIME_CRITICAL_THRESHOLD,
  } = options

  const [timeRemaining, setTimeRemaining] = useState(duration)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [startTime, setStartTime] = useState<number | null>(autoStart ? Date.now() : null)

  // Use refs for callbacks to avoid re-creating interval
  const onExpireRef = useRef(onExpire)
  const onTickRef = useRef(onTick)
  const onWarningRef = useRef(onWarning)
  const onCriticalRef = useRef(onCritical)

  // Track if warning/critical callbacks have been fired
  const warningFiredRef = useRef(false)
  const criticalFiredRef = useRef(false)

  // Update refs when callbacks change
  useEffect(() => {
    onExpireRef.current = onExpire
    onTickRef.current = onTick
    onWarningRef.current = onWarning
    onCriticalRef.current = onCritical
  }, [onExpire, onTick, onWarning, onCritical])

  // Derived state
  const isWarning = timeRemaining <= warningThreshold && timeRemaining > criticalThreshold
  const isCritical = timeRemaining <= criticalThreshold && timeRemaining > 0
  const isExpired = timeRemaining <= 0
  const progress = duration > 0 ? ((duration - timeRemaining) / duration) * 100 : 100
  const elapsedMs = startTime ? Date.now() - startTime : 0

  // Timer interval effect
  useEffect(() => {
    if (!isRunning || isExpired) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = Math.max(0, prev - 1)

        // Fire tick callback
        onTickRef.current?.(newTime)

        // Fire warning callback once
        if (
          newTime <= warningThreshold &&
          newTime > criticalThreshold &&
          !warningFiredRef.current
        ) {
          warningFiredRef.current = true
          onWarningRef.current?.()
        }

        // Fire critical callback once
        if (newTime <= criticalThreshold && newTime > 0 && !criticalFiredRef.current) {
          criticalFiredRef.current = true
          onCriticalRef.current?.()
        }

        // Fire expire callback
        if (newTime === 0) {
          setIsRunning(false)
          onExpireRef.current?.()
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, isExpired, warningThreshold, criticalThreshold])

  /**
   * Start the timer
   */
  const start = useCallback(() => {
    if (timeRemaining > 0) {
      setIsRunning(true)
      setStartTime(Date.now())
    }
  }, [timeRemaining])

  /**
   * Pause the timer
   */
  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  /**
   * Resume the timer
   */
  const resume = useCallback(() => {
    if (timeRemaining > 0) {
      setIsRunning(true)
    }
  }, [timeRemaining])

  /**
   * Reset the timer
   */
  const reset = useCallback(
    (newDuration?: number) => {
      const resetDuration = newDuration ?? duration
      setTimeRemaining(resetDuration)
      setIsRunning(false)
      setStartTime(null)
      warningFiredRef.current = false
      criticalFiredRef.current = false
    },
    [duration]
  )

  /**
   * Stop the timer and return elapsed time
   */
  const stop = useCallback((): number => {
    setIsRunning(false)
    return startTime ? Date.now() - startTime : 0
  }, [startTime])

  return {
    timeRemaining,
    isRunning,
    isWarning,
    isCritical,
    isExpired,
    progress,
    elapsedMs,
    start,
    pause,
    resume,
    reset,
    stop,
  }
}

/**
 * Format seconds into MM:SS display format
 *
 * @param seconds - Number of seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format milliseconds into seconds with decimal
 *
 * @param ms - Milliseconds
 * @param decimals - Number of decimal places
 * @returns Formatted time string
 */
export function formatMs(ms: number, decimals: number = 1): string {
  return (ms / 1000).toFixed(decimals)
}
