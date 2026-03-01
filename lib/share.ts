/**
 * Share Results Utilities
 *
 * Provides text generation and sharing for game results.
 * Uses Web Share API when available, with clipboard fallback.
 *
 * @module lib/share
 * @since 1.3.0
 */

// ============================================================================
// Types
// ============================================================================

/** Data needed to generate a shareable game summary */
export interface ShareableResult {
  /** Game mode (quick, custom, advanced, multiplayer) */
  mode: string
  /** Score achieved */
  score: number
  /** Number of correct answers */
  correctAnswers: number
  /** Total number of questions */
  totalQuestions: number
  /** Accuracy percentage (0-100) */
  accuracy: number
  /** Category played */
  category?: string
  /** Player's rank in multiplayer (1-based) */
  rank?: number
  /** Total players in multiplayer */
  totalPlayers?: number
}

// ============================================================================
// Helpers
// ============================================================================

/** Get a grade symbol based on accuracy */
function getGradeEmoji(accuracy: number): string {
  if (accuracy >= 100) return '[TROPHY]'
  if (accuracy >= 90) return '[STAR]'
  if (accuracy >= 80) return '[TARGET]'
  if (accuracy >= 70) return '[STRONG]'
  if (accuracy >= 50) return '[OK]'
  return '[STUDY]'
}

/** Get a rank suffix (1st, 2nd, 3rd, 4th) */
function getRankSuffix(rank: number): string {
  if (rank === 1) return '1st'
  if (rank === 2) return '2nd'
  if (rank === 3) return '3rd'
  return `${rank}th`
}

/** Generate a progress bar from score boxes */
function generateScoreBar(correct: number, total: number): string {
  const filled = '[+]'
  const empty = '[-]'
  return Array.from({ length: total }, (_, i) => (i < correct ? filled : empty)).join('')
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Generate shareable text for game results.
 *
 * @example
 * ```ts
 * const text = generateShareText({
 *   mode: 'quick',
 *   score: 850,
 *   correctAnswers: 8,
 *   totalQuestions: 10,
 *   accuracy: 80,
 *   category: 'Science',
 * })
 * ```
 */
export function generateShareText(result: ShareableResult): string {
  const emoji = getGradeEmoji(result.accuracy)
  const lines: string[] = []

  lines.push(`${emoji} PixelTrivia — ${result.mode.toUpperCase()} MODE`)
  lines.push('')

  if (result.category) {
    lines.push(`Category: ${result.category}`)
  }

  lines.push(
    `${result.correctAnswers}/${result.totalQuestions} correct (${Math.round(result.accuracy)}%)`
  )
  lines.push(`Score: ${result.score}`)

  if (result.rank != null && result.totalPlayers != null) {
    lines.push(`Finished ${getRankSuffix(result.rank)} of ${result.totalPlayers}`)
  }

  // Show a visual score bar for ≤ 20 questions
  if (result.totalQuestions <= 20) {
    lines.push('')
    lines.push(generateScoreBar(result.correctAnswers, result.totalQuestions))
  }

  lines.push('')
  lines.push('Play at pixeltrivia.vercel.app')

  return lines.join('\n')
}

/**
 * Whether the Web Share API is available in the current browser.
 */
export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

/**
 * Share game results via the Web Share API if available,
 * otherwise copy to clipboard.
 *
 * @returns `'shared'` if Web Share was used, `'copied'` if clipboard fallback was used.
 */
export async function shareResults(result: ShareableResult): Promise<'shared' | 'copied'> {
  const text = generateShareText(result)

  if (canNativeShare()) {
    try {
      await navigator.share({
        title: 'PixelTrivia Results',
        text,
      })
      return 'shared'
    } catch {
      // User cancelled or API failed — fall through to clipboard
    }
  }

  // Clipboard fallback
  await navigator.clipboard.writeText(text)
  return 'copied'
}
