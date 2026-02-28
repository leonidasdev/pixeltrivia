/**
 * ShareButton Component
 *
 * A pixel-art styled button that shares game results via the Web Share API
 * with a clipboard-copy fallback. Shows transient "Copied!" feedback.
 *
 * @module components/ui/ShareButton
 * @since 1.3.0
 */

'use client'

import { useCallback, useState } from 'react'
import { shareResults, type ShareableResult } from '@/lib/share'

export interface ShareButtonProps {
  /** Game result data to share */
  result: ShareableResult
  /** Optional extra CSS classes */
  className?: string
}

/**
 * Pixel-styled share button with Web Share API + clipboard fallback.
 */
export function ShareButton({ result, className = '' }: ShareButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleShare = useCallback(async () => {
    try {
      const outcome = await shareResults(result)
      if (outcome === 'copied') {
        setFeedback('Copied!')
        setTimeout(() => setFeedback(null), 2000)
      }
    } catch {
      setFeedback('Failed')
      setTimeout(() => setFeedback(null), 2000)
    }
  }, [result])

  return (
    <button
      onClick={handleShare}
      className={`
        font-pixel text-xs min-h-[44px]
        bg-green-600 hover:bg-green-500 active:bg-green-700
        text-white border-4 border-green-800
        pixel-border px-4 py-2
        transition-all duration-200
        hover:scale-105 active:scale-95
        pixel-glow-hover
        focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50
        ${className}
      `}
      aria-label="Share your results"
    >
      {feedback ?? '📤 SHARE'}
    </button>
  )
}
