/**
 * Stats Overview Component
 *
 * Displays key game statistics in pixel-art styled cards.
 * Shows total games, accuracy, best score, streaks, and trends.
 *
 * @module app/components/stats/StatsOverview
 * @since 1.0.0
 */

'use client'

import type { DetailedStats } from '@/lib/storage'
import { formatDuration } from '@/lib/utils'

// ============================================================================
// Types
// ============================================================================

export interface StatsOverviewProps {
  stats: DetailedStats
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get trend display info
 */
function getTrendDisplay(trend: DetailedStats['recentTrend']): {
  emoji: string
  label: string
  color: string
} {
  switch (trend) {
    case 'improving':
      return { emoji: '📈', label: 'IMPROVING', color: 'text-green-400' }
    case 'declining':
      return { emoji: '📉', label: 'DECLINING', color: 'text-red-400' }
    case 'stable':
      return { emoji: '📊', label: 'STABLE', color: 'text-yellow-400' }
    case 'new':
      return { emoji: '🆕', label: 'NEW PLAYER', color: 'text-cyan-400' }
  }
}

/**
 * Get mode display name
 */
function getModeDisplayName(mode: string): string {
  const names: Record<string, string> = {
    quick: '⚡ Quick',
    custom: '🤖 Custom',
    advanced: '📚 Advanced',
    multiplayer: '👥 Multiplayer',
  }
  return names[mode] || mode
}

// ============================================================================
// Stat Card Sub-component
// ============================================================================

interface StatCardProps {
  emoji: string
  label: string
  value: string | number
  subtext?: string
  colorClass?: string
}

function StatCard({ emoji, label, value, subtext, colorClass = 'text-white' }: StatCardProps) {
  return (
    <div className="pixel-border bg-gray-800 bg-opacity-80 p-4 text-center hover:bg-gray-700 transition-colors duration-200">
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="font-pixel text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className={`font-pixel text-xl ${colorClass}`}>{value}</div>
      {subtext && <div className="font-pixel-body text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
  )
}

// ============================================================================
// Component
// ============================================================================

export function StatsOverview({ stats }: StatsOverviewProps) {
  const trend = getTrendDisplay(stats.recentTrend)

  if (stats.totalGames === 0) {
    return (
      <div className="pixel-border bg-gray-800 bg-opacity-80 p-8 text-center">
        <div className="text-4xl mb-4 animate-pixel-bounce">🎮</div>
        <h3 className="font-pixel text-lg text-white mb-2">NO GAMES YET</h3>
        <p className="font-pixel-body text-gray-400 text-lg">
          Play your first game to start tracking your stats!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Primary stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard emoji="🎮" label="Games Played" value={stats.totalGames} />
        <StatCard
          emoji="🎯"
          label="Avg Accuracy"
          value={`${Math.round(stats.averageAccuracy)}%`}
          colorClass={stats.averageAccuracy >= 70 ? 'text-green-400' : 'text-yellow-400'}
        />
        <StatCard
          emoji="🏆"
          label="Best Score"
          value={stats.bestScore.toLocaleString()}
          colorClass="text-yellow-400"
        />
        <StatCard
          emoji="🔥"
          label="Best Streak"
          value={stats.bestStreak}
          colorClass="text-orange-400"
        />
      </div>

      {/* Secondary stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          emoji="⭐"
          label="Total Score"
          value={stats.totalScore.toLocaleString()}
          colorClass="text-cyan-400"
        />
        <StatCard
          emoji="✅"
          label="Questions Right"
          value={`${stats.totalCorrect}/${stats.totalQuestions}`}
          subtext={`${Math.round((stats.totalCorrect / stats.totalQuestions) * 100)}% overall`}
        />
        <StatCard emoji="⏱️" label="Time Played" value={formatDuration(stats.totalTimePlayed)} />
        <StatCard emoji={trend.emoji} label="Trend" value={trend.label} colorClass={trend.color} />
      </div>

      {/* Extra info row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.favoriteMode && (
          <StatCard
            emoji="💖"
            label="Favorite Mode"
            value={getModeDisplayName(stats.favoriteMode)}
            colorClass="text-pink-400"
          />
        )}
        {stats.favoriteCategory && (
          <StatCard
            emoji="📂"
            label="Top Category"
            value={stats.favoriteCategory}
            colorClass="text-purple-400"
          />
        )}
        <StatCard
          emoji="🔥"
          label="Win Streak"
          value={stats.currentWinStreak}
          subtext={stats.currentWinStreak > 0 ? 'Games ≥70%' : 'Start a streak!'}
          colorClass={stats.currentWinStreak >= 3 ? 'text-orange-400' : 'text-gray-300'}
        />
      </div>
    </div>
  )
}
