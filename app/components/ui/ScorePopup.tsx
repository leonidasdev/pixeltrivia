/**
 * Score Popup Component
 *
 * Floating "+100" score indicator that animates upward and fades out.
 * Used for real-time score feedback on correct answers.
 *
 * @module app/components/ui/ScorePopup
 * @since 1.1.0
 */

'use client'

import React, { useEffect, useState } from 'react'

// ============================================================================
// Types
// ============================================================================

export interface ScorePopupProps {
  /** Score value to display (e.g., 100, 50, -25) */
  score: number
  /** Whether to show the popup */
  show: boolean
  /** Callback when animation completes */
  onComplete?: () => void
  /** Position offset */
  className?: string
}

// ============================================================================
// Component
// ============================================================================

export function ScorePopup({ score, show, onComplete, className = '' }: ScorePopupProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!visible) return null

  const isPositive = score > 0
  const colorClass = isPositive ? 'text-green-400' : score < 0 ? 'text-red-400' : 'text-gray-400'
  const prefix = isPositive ? '+' : ''

  return (
    <div
      className={`
        absolute pointer-events-none z-40
        animate-score-pop
        font-pixel text-2xl font-bold
        ${colorClass}
        ${className}
      `}
      style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}
      aria-hidden="true"
    >
      {prefix}
      {score}
    </div>
  )
}
