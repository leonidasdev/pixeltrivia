/**
 * Shared Question Display Styles
 *
 * Constants and helpers used by both the solo play page
 * and the multiplayer GameQuestion component.
 *
 * @module app/components/game/questionStyles
 * @since 1.5.0
 */

import { TIME_WARNING_THRESHOLD, TIME_CRITICAL_THRESHOLD } from '@/constants/game'

// ============================================================================
// Option colour palette (A / B / C / D)
// ============================================================================

export interface OptionColor {
  bg: string
  hover: string
  border: string
  label: string
}

export const OPTION_COLORS: readonly OptionColor[] = [
  { bg: 'bg-red-600', hover: 'hover:bg-red-500', border: 'border-red-800', label: 'A' },
  { bg: 'bg-blue-600', hover: 'hover:bg-blue-500', border: 'border-blue-800', label: 'B' },
  { bg: 'bg-yellow-600', hover: 'hover:bg-yellow-500', border: 'border-yellow-800', label: 'C' },
  { bg: 'bg-green-600', hover: 'hover:bg-green-500', border: 'border-green-800', label: 'D' },
] as const

// ============================================================================
// Timer display helpers
// ============================================================================

/** Returns the Tailwind text colour class for the timer */
export function getTimerColor(timeRemaining: number): string {
  if (timeRemaining <= TIME_CRITICAL_THRESHOLD) return 'text-red-400'
  if (timeRemaining <= TIME_WARNING_THRESHOLD) return 'text-yellow-400'
  return 'text-cyan-400'
}

/** Returns the animation class for the timer */
export function getTimerAnimation(timeRemaining: number): string {
  if (timeRemaining <= TIME_CRITICAL_THRESHOLD) return 'animate-pulse-urgent'
  if (timeRemaining <= TIME_WARNING_THRESHOLD) return 'animate-pixel-shake'
  return ''
}

// ============================================================================
// Answer option style helpers
// ============================================================================

export interface OptionStyleParams {
  index: number
  isRevealing: boolean
  correctAnswer: number | null
  selectedAnswer: number | null
  wasCorrect: boolean | null
  /** Whether the player has locked in an answer (multiplayer waiting state) */
  hasAnswered?: boolean
  /** Whether the component is in a loading state (multiplayer) */
  isLoading?: boolean
}

/**
 * Returns a Tailwind class string for the given option button.
 *
 * Handles all states: interactive, selected-waiting, revealed-correct,
 * revealed-wrong, and disabled/loading.
 */
export function getOptionStyle(params: OptionStyleParams): string {
  const {
    index,
    isRevealing,
    correctAnswer,
    selectedAnswer,
    wasCorrect,
    hasAnswered = false,
    isLoading = false,
  } = params
  const color = OPTION_COLORS[index] ?? OPTION_COLORS[0]

  if (isRevealing) {
    if (index === correctAnswer) {
      return 'bg-green-500 border-green-300 ring-4 ring-green-300 ring-opacity-50 scale-[1.02] animate-pixel-bounce'
    }
    if (index === selectedAnswer && !wasCorrect) {
      return 'bg-red-500 border-red-300 opacity-80 animate-pixel-shake'
    }
    return 'bg-gray-700 border-gray-600 opacity-50'
  }

  if (hasAnswered) {
    if (index === selectedAnswer) {
      return `${color.bg} ${color.border} ring-2 ring-cyan-300`
    }
    return 'bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed'
  }

  if (isLoading) {
    return `${color.bg} ${color.border} opacity-50 cursor-wait`
  }

  return `${color.bg} ${color.hover} ${color.border} cursor-pointer hover:scale-[1.02] active:scale-[0.98] pixel-glow-hover`
}
