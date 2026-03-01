/**
 * Results Screen Component
 *
 * Displays the final game results after a solo game ends.
 * Extracted from play/page.tsx to improve modularity.
 *
 * @module app/components/game/ResultsScreen
 * @since 1.5.0
 */

'use client'

import { useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import type { GameSummary } from '@/types/game'
import type { GameMode } from '@/lib/gameApi'
import { getGrade } from '@/lib/scoring'
import {
  AnimatedBackground,
  PixelConfetti,
  PageTransition,
  ShareButton,
  PixelButton,
  ToastContainer,
  type ToastMessage,
} from '@/app/components/ui'

// ============================================================================
// Sub-component
// ============================================================================

const Stat = memo(function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800 border-2 border-gray-700 pixel-border p-3">
      <p className="font-pixel text-xs text-gray-500 uppercase">{label}</p>
      <p className="font-pixel text-lg text-white">{value}</p>
    </div>
  )
})

// ============================================================================
// Props
// ============================================================================

export interface ResultsScreenProps {
  summary: GameSummary
  category: string
  difficulty: string
  gameMode: GameMode
  showConfetti: boolean
  onConfettiComplete: () => void
  toasts: ToastMessage[]
  onDismissToast: (id: string) => void
}

// ============================================================================
// Component
// ============================================================================

export function ResultsScreen({
  summary,
  category,
  difficulty,
  gameMode,
  showConfetti,
  onConfettiComplete,
  toasts,
  onDismissToast,
}: ResultsScreenProps) {
  const router = useRouter()
  const grade = useMemo(() => getGrade(summary.accuracy), [summary.accuracy])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <PixelConfetti active={showConfetti} onComplete={onConfettiComplete} />

      <PageTransition style="scale" className="z-10 w-full max-w-lg">
        {/* Results card */}
        <div className="bg-gray-900 bg-opacity-95 border-4 border-gray-600 pixel-border pixel-shadow p-6 space-y-5">
          {/* Header */}
          <h1 className="text-2xl md:text-3xl font-pixel text-yellow-400 text-center pixel-text-shadow">
            Game Over!
          </h1>

          {/* Grade */}
          <div className="text-center">
            <span className="text-5xl">
              {grade === 'S'
                ? 'W'
                : grade === 'A'
                  ? '*'
                  : grade === 'B'
                    ? 'T'
                    : grade === 'C'
                      ? '!'
                      : '#'}
            </span>
            <p className="font-pixel text-lg text-cyan-400 mt-1">Grade: {grade}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <Stat label="Score" value={summary.finalScore.toLocaleString()} />
            <Stat label="Accuracy" value={`${Math.round(summary.accuracy)}%`} />
            <Stat label="Correct" value={`${summary.correctAnswers}/${summary.totalQuestions}`} />
            <Stat label="Avg Time" value={`${(summary.averageTime / 1000).toFixed(1)}s`} />
          </div>

          {/* Category / difficulty */}
          <p className="font-pixel-body text-xs text-gray-400 text-center">
            {category} &bull; {difficulty}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <PixelButton variant="primary" onClick={() => router.push('/game/quick')}>
              PLAY AGAIN
            </PixelButton>
            <PixelButton variant="secondary" onClick={() => router.push('/game/stats')}>
              VIEW STATS
            </PixelButton>
            <PixelButton variant="secondary" onClick={() => router.push('/')}>
              HOME
            </PixelButton>
          </div>

          {/* Share */}
          <div className="flex justify-center">
            <ShareButton
              result={{
                mode: gameMode,
                score: summary.finalScore,
                correctAnswers: summary.correctAnswers,
                totalQuestions: summary.totalQuestions,
                accuracy: Math.round(summary.accuracy),
                category,
              }}
            />
          </div>
        </div>
      </PageTransition>

      <ToastContainer messages={toasts} onDismiss={onDismissToast} />
    </main>
  )
}
