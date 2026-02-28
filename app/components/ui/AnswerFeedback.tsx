/**
 * Answer Feedback Component
 *
 * Visual feedback overlay for correct/wrong answers.
 * Shows colored flash, icon, and shake animation.
 *
 * @module app/components/ui/AnswerFeedback
 * @since 1.1.0
 */

'use client'

import React, { useEffect, useState } from 'react'

// ============================================================================
// Types
// ============================================================================

export type FeedbackType = 'correct' | 'wrong' | 'timeout' | null

export interface AnswerFeedbackProps {
  /** Type of feedback to show */
  type: FeedbackType
  /** Text message to display */
  message?: string
  /** Duration in ms */
  duration?: number
  /** Callback when feedback animation completes */
  onComplete?: () => void
}

// ============================================================================
// Component
// ============================================================================

export function AnswerFeedback({
  type,
  message,
  duration = 1500,
  onComplete,
}: AnswerFeedbackProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (type) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, duration)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [type, duration, onComplete])

  if (!visible || !type) return null

  const config = {
    correct: {
      icon: '✓',
      bg: 'bg-green-500/20',
      border: 'border-green-400',
      text: 'text-green-400',
      glow: 'shadow-[0_0_30px_rgba(34,197,94,0.5)]',
      animation: 'animate-pixel-bounce',
      defaultMessage: 'CORRECT!',
    },
    wrong: {
      icon: '✗',
      bg: 'bg-red-500/20',
      border: 'border-red-400',
      text: 'text-red-400',
      glow: 'shadow-[0_0_30px_rgba(239,68,68,0.5)]',
      animation: 'animate-pixel-shake',
      defaultMessage: 'WRONG!',
    },
    timeout: {
      icon: '⏱',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-400',
      text: 'text-yellow-400',
      glow: 'shadow-[0_0_30px_rgba(234,179,8,0.5)]',
      animation: 'animate-pixel-shake',
      defaultMessage: "TIME'S UP!",
    },
  }

  const c = config[type]
  const displayMessage = message || c.defaultMessage

  return (
    <div
      className={`
        fixed inset-0 z-40 pointer-events-none
        flex items-center justify-center
        ${c.bg}
        animate-fadeIn
      `}
      role="status"
      aria-live="assertive"
    >
      <div
        className={`
          ${c.animation}
          flex flex-col items-center gap-3
          px-8 py-6
          border-4 ${c.border}
          bg-gray-900/90 backdrop-blur-sm
          ${c.glow}
        `}
      >
        <span className={`text-5xl ${c.text}`} aria-hidden="true">
          {c.icon}
        </span>
        <span
          className={`font-pixel text-xl ${c.text} tracking-wider`}
          style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}
        >
          {displayMessage}
        </span>
      </div>
    </div>
  )
}

// ============================================================================
// Answer Option Highlight Component
// ============================================================================

export interface AnswerOptionHighlightProps {
  /** Whether this is the correct answer */
  isCorrect: boolean
  /** Whether this option was selected */
  isSelected: boolean
  /** Whether answer has been revealed */
  isRevealed: boolean
  /** Children (the option content) */
  children: React.ReactNode
  /** Additional className */
  className?: string
}

/**
 * Wraps an answer option with correct/wrong visual feedback after reveal.
 */
export function AnswerOptionHighlight({
  isCorrect,
  isSelected,
  isRevealed,
  children,
  className = '',
}: AnswerOptionHighlightProps) {
  if (!isRevealed) {
    return <div className={className}>{children}</div>
  }

  const feedbackClass = isCorrect
    ? 'border-green-400 bg-green-500/20 animate-flash-green shadow-[0_0_15px_rgba(34,197,94,0.3)]'
    : isSelected
      ? 'border-red-400 bg-red-500/20 animate-pixel-shake shadow-[0_0_15px_rgba(239,68,68,0.3)]'
      : 'opacity-50'

  return (
    <div className={`transition-all duration-300 ${feedbackClass} ${className}`}>
      {children}
      {isRevealed && isCorrect && (
        <span
          className="absolute top-1 right-2 text-green-400 text-sm font-bold"
          aria-hidden="true"
        >
          ✓
        </span>
      )}
    </div>
  )
}
