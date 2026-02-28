/**
 * Achievements Page
 *
 * Displays all achievements with unlock status, progress bars, and tier grouping.
 *
 * @module app/game/achievements/page
 * @since 1.3.0
 */

'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { SparklesOverlay, PageTransition, StaggerChildren } from '@/app/components/ui'
import Footer from '@/app/components/Footer'
import { useSound } from '@/hooks/useSound'
import {
  getAchievements,
  getAchievementSummary,
  getTierDisplay,
  type Achievement,
  type AchievementTier,
} from '@/lib/achievements'

// ============================================================================
// Types
// ============================================================================

type FilterTab = 'all' | 'unlocked' | 'locked' | Achievement['category']

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'unlocked', label: 'UNLOCKED' },
  { id: 'locked', label: 'LOCKED' },
  { id: 'gameplay', label: 'GAMEPLAY' },
  { id: 'mastery', label: 'MASTERY' },
  { id: 'dedication', label: 'DEDICATION' },
  { id: 'special', label: 'SPECIAL' },
]

// ============================================================================
// Sub-Components
// ============================================================================

function ProgressBar({ progress }: { progress: number }) {
  const pct = Math.round(progress * 100)
  return (
    <div
      className="w-full h-2 bg-gray-900 mt-2"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const tier = getTierDisplay(achievement.tier)

  return (
    <div
      className={`pixel-border p-3 transition-all duration-200 ${
        achievement.unlocked
          ? `${tier.bgColor} border ${tier.borderColor} hover:brightness-110`
          : 'bg-gray-800/50 border border-gray-700 opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`text-2xl flex-shrink-0 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}
        >
          {achievement.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-pixel text-xs ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}
            >
              {achievement.name}
            </span>
            <span className={`font-pixel text-[9px] px-1 ${tier.color} ${tier.bgColor}`}>
              {tier.label.toUpperCase()}
            </span>
          </div>

          <p className="font-pixel-body text-xs text-gray-400 mt-0.5">{achievement.description}</p>

          {!achievement.unlocked && achievement.progress > 0 && (
            <ProgressBar progress={achievement.progress} />
          )}

          {achievement.unlocked && achievement.unlockedAt && (
            <p className="font-pixel-body text-[10px] text-gray-500 mt-1">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {achievement.unlocked && <div className="flex-shrink-0 text-green-400 text-lg">✓</div>}
      </div>
    </div>
  )
}

function SummaryBar() {
  const summary = getAchievementSummary()
  const tiers: AchievementTier[] = ['bronze', 'silver', 'gold', 'platinum']

  return (
    <div className="pixel-border bg-gray-800 bg-opacity-80 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-pixel text-sm text-cyan-400">Progress</h3>
        <span className="font-pixel text-sm text-white">
          {summary.unlocked}/{summary.total} ({summary.percentage}%)
        </span>
      </div>

      {/* Overall progress bar */}
      <div
        className="w-full h-3 bg-gray-900 mb-4"
        role="progressbar"
        aria-valuenow={summary.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-cyan-400 transition-all duration-500"
          style={{ width: `${summary.percentage}%` }}
        />
      </div>

      {/* Tier breakdown */}
      <div className="grid grid-cols-4 gap-2">
        {tiers.map(t => {
          const tier = getTierDisplay(t)
          const data = summary.byTier[t]
          return (
            <div key={t} className="text-center">
              <div className={`font-pixel text-[10px] ${tier.color}`}>
                {tier.label.toUpperCase()}
              </div>
              <div className="font-pixel text-sm text-white">
                {data.unlocked}/{data.total}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export default function AchievementsPage() {
  const router = useRouter()
  const { play: playSound } = useSound()
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

  const achievements = useMemo(() => getAchievements(), [])

  const filtered = useMemo(() => {
    switch (activeFilter) {
      case 'all':
        return achievements
      case 'unlocked':
        return achievements.filter(a => a.unlocked)
      case 'locked':
        return achievements.filter(a => !a.unlocked)
      default:
        return achievements.filter(a => a.category === activeFilter)
    }
  }, [achievements, activeFilter])

  const handleBack = () => {
    playSound('navigate')
    router.back()
  }

  return (
    <PageTransition>
      <main className="min-h-screen text-white relative">
        <SparklesOverlay density="low" />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 min-h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className="pixel-border bg-gray-800 hover:bg-gray-700 text-white font-pixel text-xs px-3 py-2 transition-colors"
              aria-label="Go back"
            >
              ← BACK
            </button>
            <h1 className="font-pixel text-xl text-yellow-400 flex-1 text-center">
              🏅 ACHIEVEMENTS
            </h1>
            <div className="w-20" />
          </div>

          {/* Summary */}
          <SummaryBar />

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1 mb-4">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  playSound('select')
                  setActiveFilter(tab.id)
                }}
                className={`font-pixel text-[10px] px-2 py-1.5 transition-colors ${
                  activeFilter === tab.id
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
                aria-pressed={activeFilter === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Achievement Grid */}
          <StaggerChildren className="space-y-2 flex-1">
            {filtered.length === 0 ? (
              <div className="pixel-border bg-gray-800 bg-opacity-80 p-8 text-center">
                <div className="text-4xl mb-3 animate-pixel-bounce">🏅</div>
                <p className="font-pixel text-sm text-gray-400">NO ACHIEVEMENTS</p>
                <p className="font-pixel-body text-xs text-gray-500 mt-1">
                  {activeFilter === 'unlocked'
                    ? 'Play some games to unlock achievements!'
                    : 'No achievements match this filter.'}
                </p>
              </div>
            ) : (
              filtered.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))
            )}
          </StaggerChildren>

          <Footer />
        </div>
      </main>
    </PageTransition>
  )
}
