/**
 * Stats Chart Component
 *
 * Pixel-art styled bar charts for visualizing game statistics.
 * Renders horizontal bar charts for category/mode breakdowns.
 *
 * @module app/components/stats/StatsChart
 * @since 1.0.0
 */

'use client'

import type { ModeStats, CategoryStats } from '@/lib/storage'

// ============================================================================
// Types
// ============================================================================

export interface ModeChartProps {
  modeBreakdown: Record<string, ModeStats>
}

export interface CategoryChartProps {
  categoryBreakdown: Record<string, CategoryStats>
}

// ============================================================================
// Constants
// ============================================================================

const MODE_CONFIG: Record<
  string,
  { emoji: string; label: string; barColor: string; bgColor: string }
> = {
  quick: {
    emoji: '⚡',
    label: 'Quick',
    barColor: 'bg-orange-500',
    bgColor: 'bg-orange-900 bg-opacity-30',
  },
  custom: {
    emoji: '🤖',
    label: 'Custom',
    barColor: 'bg-purple-500',
    bgColor: 'bg-purple-900 bg-opacity-30',
  },
  advanced: {
    emoji: '📚',
    label: 'Advanced',
    barColor: 'bg-blue-500',
    bgColor: 'bg-blue-900 bg-opacity-30',
  },
  multiplayer: {
    emoji: '👥',
    label: 'Multi',
    barColor: 'bg-green-500',
    bgColor: 'bg-green-900 bg-opacity-30',
  },
}

const CATEGORY_COLORS = [
  'bg-cyan-500',
  'bg-pink-500',
  'bg-yellow-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-teal-500',
]

// ============================================================================
// Pixel Bar Sub-component
// ============================================================================

interface PixelBarProps {
  label: string
  emoji?: string
  value: number
  maxValue: number
  barColor: string
  sublabel?: string
  displayValue?: string
}

function PixelBar({
  label,
  emoji,
  value,
  maxValue,
  barColor,
  sublabel,
  displayValue,
}: PixelBarProps) {
  const percentage = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {emoji && <span className="text-sm">{emoji}</span>}
          <span className="font-pixel text-[10px] text-gray-300 uppercase truncate max-w-[120px]">
            {label}
          </span>
        </div>
        <span className="font-pixel text-[10px] text-gray-400">{displayValue ?? value}</span>
      </div>
      <div className="w-full h-4 bg-gray-800 pixel-border overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-700 ease-out pixel-render`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={maxValue}
          aria-label={`${label}: ${displayValue ?? value}`}
        />
      </div>
      {sublabel && <div className="font-pixel-body text-[11px] text-gray-500">{sublabel}</div>}
    </div>
  )
}

// ============================================================================
// Mode Chart Component
// ============================================================================

export function ModeChart({ modeBreakdown }: ModeChartProps) {
  const entries = Object.entries(modeBreakdown)

  if (entries.length === 0) {
    return (
      <div className="pixel-border bg-gray-800 bg-opacity-80 p-6 text-center">
        <div className="text-2xl mb-2">📊</div>
        <p className="font-pixel text-xs text-gray-400">NO MODE DATA YET</p>
      </div>
    )
  }

  const maxGames = Math.max(...entries.map(([, s]) => s.gamesPlayed))
  const maxScore = Math.max(...entries.map(([, s]) => s.bestScore))

  return (
    <div className="pixel-border bg-gray-800 bg-opacity-80 p-4 space-y-4">
      <h3 className="font-pixel text-sm text-white text-center pixel-text-shadow">
        📊 MODE BREAKDOWN
      </h3>

      {/* Games per mode */}
      <div className="space-y-3">
        <h4 className="font-pixel text-[10px] text-gray-500 uppercase">Games Played</h4>
        {entries.map(([mode, stats]) => {
          const config = MODE_CONFIG[mode] || {
            emoji: '🎮',
            label: mode,
            barColor: 'bg-gray-500',
            bgColor: '',
          }
          return (
            <PixelBar
              key={`games-${mode}`}
              label={config.label}
              emoji={config.emoji}
              value={stats.gamesPlayed}
              maxValue={maxGames}
              barColor={config.barColor}
              sublabel={`Avg accuracy: ${Math.round(stats.averageAccuracy)}%`}
            />
          )
        })}
      </div>

      {/* Best score per mode */}
      <div className="space-y-3">
        <h4 className="font-pixel text-[10px] text-gray-500 uppercase">Best Scores</h4>
        {entries.map(([mode, stats]) => {
          const config = MODE_CONFIG[mode] || {
            emoji: '🎮',
            label: mode,
            barColor: 'bg-gray-500',
            bgColor: '',
          }
          return (
            <PixelBar
              key={`score-${mode}`}
              label={config.label}
              emoji={config.emoji}
              value={stats.bestScore}
              maxValue={maxScore}
              barColor={config.barColor}
              displayValue={stats.bestScore.toLocaleString()}
            />
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// Category Chart Component
// ============================================================================

export function CategoryChart({ categoryBreakdown }: CategoryChartProps) {
  const entries = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1].gamesPlayed - a[1].gamesPlayed)
    .slice(0, 8) // Top 8 categories

  if (entries.length === 0) {
    return (
      <div className="pixel-border bg-gray-800 bg-opacity-80 p-6 text-center">
        <div className="text-2xl mb-2">📂</div>
        <p className="font-pixel text-xs text-gray-400">NO CATEGORY DATA YET</p>
      </div>
    )
  }

  const maxGames = Math.max(...entries.map(([, s]) => s.gamesPlayed))

  return (
    <div className="pixel-border bg-gray-800 bg-opacity-80 p-4 space-y-4">
      <h3 className="font-pixel text-sm text-white text-center pixel-text-shadow">
        📂 TOP CATEGORIES
      </h3>

      <div className="space-y-3">
        {entries.map(([category, stats], index) => (
          <PixelBar
            key={category}
            label={category}
            emoji="•"
            value={stats.gamesPlayed}
            maxValue={maxGames}
            barColor={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
            displayValue={`${stats.gamesPlayed} games`}
            sublabel={`Best: ${stats.bestScore.toLocaleString()} • Avg: ${Math.round(stats.averageAccuracy)}%`}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Combined Stats Charts
// ============================================================================

export interface StatsChartsProps {
  modeBreakdown: Record<string, ModeStats>
  categoryBreakdown: Record<string, CategoryStats>
}

export function StatsCharts({ modeBreakdown, categoryBreakdown }: StatsChartsProps) {
  const hasData = Object.keys(modeBreakdown).length > 0 || Object.keys(categoryBreakdown).length > 0

  if (!hasData) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ModeChart modeBreakdown={modeBreakdown} />
      <CategoryChart categoryBreakdown={categoryBreakdown} />
    </div>
  )
}
