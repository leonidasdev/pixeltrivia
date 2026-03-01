/**
 * Leaderboard Page
 *
 * Shows ranked game history with filtering by period, mode, and sort criteria.
 * Includes personal records showcase and category breakdown.
 *
 * @module app/game/leaderboard/page
 * @since 1.3.0
 */

'use client'

import { useState, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import { SparklesOverlay, PageTransition, StaggerChildren } from '@/app/components/ui'
import Footer from '@/app/components/Footer'
import { useSound } from '@/hooks/useSound'
import { useGameHistory } from '@/hooks/useGameHistory'
import {
  getLeaderboard,
  getPersonalRecords,
  type LeaderboardPeriod,
  type LeaderboardSort,
  type LeaderboardEntry,
} from '@/lib/leaderboard'

// ============================================================================
// Constants
// ============================================================================

const PERIODS: { id: LeaderboardPeriod; label: string }[] = [
  { id: 'all', label: 'ALL TIME' },
  { id: 'month', label: 'THIS MONTH' },
  { id: 'week', label: 'THIS WEEK' },
  { id: 'today', label: 'TODAY' },
]

const SORT_OPTIONS: { id: LeaderboardSort; label: string; emoji: string }[] = [
  { id: 'score', label: 'Score', emoji: '*' },
  { id: 'accuracy', label: 'Accuracy', emoji: 'T' },
  { id: 'streak', label: 'Streak', emoji: 'F' },
  { id: 'speed', label: 'Speed', emoji: '>' },
]

const MODE_OPTIONS = [
  { id: '', label: 'All Modes' },
  { id: 'quick', label: 'Quick' },
  { id: 'custom', label: 'Custom' },
  { id: 'advanced', label: 'Advanced' },
]

// ============================================================================
// Sub-Components
// ============================================================================

const RankBadge = memo(function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">1st</span>
  if (rank === 2) return <span className="text-2xl">2nd</span>
  if (rank === 3) return <span className="text-2xl">3rd</span>
  return <span className="font-pixel text-gray-400 text-lg">#{rank}</span>
})

const LeaderboardRow = memo(function LeaderboardRow({ item }: { item: LeaderboardEntry }) {
  const { rank, entry, isPersonalBest } = item
  const isTop3 = rank <= 3
  const modeEmoji: Record<string, string> = {
    quick: '>',
    custom: 'AI',
    advanced: '#',
    multiplayer: '++',
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 transition-colors duration-200 ${
        isTop3
          ? 'bg-gray-700 bg-opacity-60 border-l-4 border-yellow-500'
          : 'bg-gray-800 bg-opacity-40 border-l-4 border-gray-700'
      } ${isPersonalBest ? 'ring-1 ring-cyan-500/50' : ''}`}
    >
      <div className="w-12 text-center flex-shrink-0">
        <RankBadge rank={rank} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-sm text-white truncate">
            {entry.playerName || 'Player'}
          </span>
          <span className="text-xs">{modeEmoji[entry.mode] || '>'}</span>
          {isPersonalBest && (
            <span className="font-pixel text-xs text-cyan-400 bg-cyan-900/30 px-1">BEST</span>
          )}
        </div>
        <div className="font-pixel-body text-xs text-gray-400 truncate">
          {entry.category} · {new Date(entry.playedAt).toLocaleDateString()}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="font-pixel text-sm text-yellow-400">{entry.score.toLocaleString()}</div>
        <div className="font-pixel-body text-xs text-gray-400">
          {entry.accuracy}% · {entry.streak || 0}F
        </div>
      </div>
    </div>
  )
})

function PersonalRecordsSection() {
  const records = useMemo(() => getPersonalRecords(), [])

  const recordCards = [
    {
      label: 'HIGHEST SCORE',
      emoji: '*',
      value: records.highestScore?.score.toLocaleString() ?? '—',
      sub: records.highestScore?.category ?? '',
    },
    {
      label: 'BEST ACCURACY',
      emoji: 'T',
      value: records.bestAccuracy ? `${records.bestAccuracy.accuracy}%` : '—',
      sub: records.bestAccuracy?.category ?? '',
    },
    {
      label: 'LONGEST STREAK',
      emoji: 'F',
      value: records.longestStreak?.streak?.toString() ?? '—',
      sub: records.longestStreak?.category ?? '',
    },
    {
      label: 'FASTEST GAME',
      emoji: '>',
      value:
        records.fastestGame && records.fastestGame.totalQuestions > 0
          ? `${(records.fastestGame.duration / records.fastestGame.totalQuestions).toFixed(1)}s/q`
          : '—',
      sub: records.fastestGame?.category ?? '',
    },
    {
      label: 'MOST QUESTIONS',
      emoji: '#',
      value: records.mostQuestions?.totalQuestions?.toString() ?? '—',
      sub: records.mostQuestions?.category ?? '',
    },
  ]

  return (
    <div className="pixel-border bg-gray-800 bg-opacity-80 p-4 mb-6">
      <h2 className="font-pixel text-sm text-cyan-400 mb-3">Personal Records</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {recordCards.map(card => (
          <div key={card.label} className="text-center p-2 bg-gray-900/50">
            <div className="text-xl mb-1">{card.emoji}</div>
            <div className="font-pixel text-xs text-gray-400 uppercase">{card.label}</div>
            <div className="font-pixel text-sm text-white mt-1">{card.value}</div>
            {card.sub && (
              <div className="font-pixel-body text-xs text-gray-500 truncate">{card.sub}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export default function LeaderboardPage() {
  const router = useRouter()
  const { play: playSound } = useSound()
  const { history } = useGameHistory()

  const [period, setPeriod] = useState<LeaderboardPeriod>('all')
  const [sortBy, setSortBy] = useState<LeaderboardSort>('score')
  const [modeFilter, setModeFilter] = useState<string>('')

  const leaderboard = useMemo(
    () =>
      getLeaderboard({
        period,
        sortBy,
        mode: (modeFilter as 'quick' | 'custom' | 'advanced' | undefined) || undefined,
        limit: 20,
      }),
    // Intentional: use history.length to avoid recalculating when entries content unchanged
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [period, sortBy, modeFilter, history.length]
  )

  const handleBack = () => {
    playSound('navigate')
    router.back()
  }

  return (
    <PageTransition>
      <main className="min-h-screen text-white relative">
        <SparklesOverlay preset="minimal" />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 min-h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className="pixel-border bg-gray-800 hover:bg-gray-700 text-white font-pixel text-xs px-3 py-3 min-h-[44px] transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Go back"
            >
              ← BACK
            </button>
            <h1 className="font-pixel text-lg sm:text-xl text-yellow-400 flex-1 text-center">
              LEADERBOARD
            </h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>

          {/* Personal Records */}
          <PersonalRecordsSection />

          {/* Filters */}
          <StaggerChildren className="space-y-3 mb-4">
            {/* Period Tabs */}
            <div className="flex gap-1" role="tablist" aria-label="Filter by time period">
              {PERIODS.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    playSound('select')
                    setPeriod(p.id)
                  }}
                  className={`font-pixel text-xs px-2 py-3 min-h-[44px] transition-colors flex-1 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                    period === p.id
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                  role="tab"
                  aria-selected={period === p.id}
                  aria-controls="leaderboard-panel"
                  id={`period-tab-${p.id}`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Sort + Mode Filters */}
            <div className="flex gap-2">
              <div className="flex gap-1 flex-1">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      playSound('select')
                      setSortBy(opt.id)
                    }}
                    className={`font-pixel text-xs px-2 py-3 min-h-[44px] transition-colors flex-1 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                      sortBy === opt.id
                        ? 'bg-cyan-700 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                    aria-pressed={sortBy === opt.id}
                    aria-label={`Sort by ${opt.label}`}
                    title={`Sort by ${opt.label}`}
                  >
                    {opt.emoji}
                  </button>
                ))}
              </div>

              <select
                value={modeFilter}
                onChange={e => {
                  playSound('select')
                  setModeFilter(e.target.value)
                }}
                className="font-pixel text-xs bg-gray-800 text-gray-300 border border-gray-700 px-2 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-cyan-400"
                aria-label="Filter by game mode"
              >
                {MODE_OPTIONS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </StaggerChildren>

          {/* Leaderboard List */}
          <div
            className="pixel-border bg-gray-800 bg-opacity-80 flex-1 overflow-hidden flex flex-col"
            role="tabpanel"
            id="leaderboard-panel"
            aria-labelledby={`period-tab-${period}`}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
              <span className="font-pixel text-xs text-gray-400">
                {leaderboard.totalGames} game{leaderboard.totalGames !== 1 ? 's' : ''}
              </span>
              <span className="font-pixel text-xs text-gray-500">
                Top {leaderboard.entries.length}
              </span>
            </div>

            {leaderboard.entries.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-4xl mb-3 animate-pixel-bounce">W</div>
                  <p className="font-pixel text-sm text-gray-400">NO GAMES YET</p>
                  <p className="font-pixel-body text-xs text-gray-500 mt-1">
                    Play some games to see your rankings!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-gray-700/50">
                {leaderboard.entries.map(item => (
                  <LeaderboardRow key={item.entry.id} item={item} />
                ))}
              </div>
            )}
          </div>

          <Footer />
        </div>
      </main>
    </PageTransition>
  )
}
