/**
 * Stats & History Page
 *
 * Dashboard page showing game history, statistics, and performance charts.
 * Full pixel-art retro styling consistent with the rest of PixelTrivia.
 *
 * @module app/game/stats/page
 * @since 1.0.0
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SparklesOverlay, PageTransition, StaggerChildren } from '@/app/components/ui'
import { StatsOverview, GameHistoryList, StatsCharts } from '@/app/components/stats'
import { useGameHistory } from '@/hooks/useGameHistory'
import { useSound } from '@/hooks/useSound'

// ============================================================================
// Types
// ============================================================================

type TabId = 'overview' | 'history' | 'charts'

interface Tab {
  id: TabId
  label: string
  emoji: string
}

const TABS: Tab[] = [
  { id: 'overview', label: 'OVERVIEW', emoji: '📊' },
  { id: 'history', label: 'HISTORY', emoji: '📜' },
  { id: 'charts', label: 'CHARTS', emoji: '📈' },
]

// ============================================================================
// Component
// ============================================================================

export default function StatsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const { history, stats, removeGame, clearAll, isLoading } = useGameHistory()
  const { play: playSound } = useSound()

  const handleTabChange = (tab: TabId) => {
    playSound('select')
    setActiveTab(tab)
  }

  const handleBack = () => {
    playSound('navigate')
    router.back()
  }

  const handlePlayAgain = () => {
    playSound('gameStart')
    router.push('/game/mode')
  }

  const handleDeleteEntry = (id: string) => {
    playSound('wrong')
    removeGame(id)
  }

  const handleClearAll = () => {
    playSound('wrong')
    clearAll()
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-pixel-bounce mb-4">📊</div>
          <p className="font-pixel text-white">LOADING STATS...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-4 relative overflow-hidden">
      <SparklesOverlay />

      <PageTransition
        style="slide-up"
        className="flex flex-col items-center space-y-6 z-10 max-w-4xl w-full py-8"
      >
        {/* Header */}
        <header className="text-center w-full">
          <StaggerChildren staggerDelay={80} style="slide-up">
            <h1 className="text-3xl md:text-4xl font-pixel text-white pixel-text-shadow mb-2">
              📊 STATS & HISTORY
            </h1>
            <p className="font-pixel-body text-cyan-300 text-lg">
              Track your trivia journey and see how you&apos;ve improved!
            </p>

            {/* Quick stat badges */}
            {stats.totalGames > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <span className="font-pixel text-[10px] bg-green-900 bg-opacity-50 text-green-400 pixel-border px-3 py-1">
                  🎮 {stats.totalGames} GAMES
                </span>
                <span className="font-pixel text-[10px] bg-yellow-900 bg-opacity-50 text-yellow-400 pixel-border px-3 py-1">
                  ⭐ {stats.totalScore.toLocaleString()} PTS
                </span>
                <span className="font-pixel text-[10px] bg-cyan-900 bg-opacity-50 text-cyan-400 pixel-border px-3 py-1">
                  🎯 {Math.round(stats.averageAccuracy)}% AVG
                </span>
                {stats.currentWinStreak > 0 && (
                  <span className="font-pixel text-[10px] bg-orange-900 bg-opacity-50 text-orange-400 pixel-border px-3 py-1">
                    🔥 {stats.currentWinStreak} STREAK
                  </span>
                )}
              </div>
            )}
          </StaggerChildren>
        </header>

        {/* Tab Navigation */}
        <nav className="flex w-full gap-1" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`flex-1 font-pixel text-xs py-3 px-2 pixel-border text-center transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white border-cyan-400 pixel-shadow'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span className="block text-lg mb-1">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <section className="w-full" role="tabpanel" aria-label={`${activeTab} tab content`}>
          {activeTab === 'overview' && <StatsOverview stats={stats} />}

          {activeTab === 'history' && (
            <GameHistoryList
              history={history}
              onDelete={handleDeleteEntry}
              onClearAll={handleClearAll}
            />
          )}

          {activeTab === 'charts' && (
            <StatsCharts
              modeBreakdown={stats.modeBreakdown}
              categoryBreakdown={stats.categoryBreakdown}
            />
          )}
        </section>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-3 w-full pt-4">
          <button
            onClick={handlePlayAgain}
            className="font-pixel text-sm bg-green-600 hover:bg-green-500 text-white pixel-border px-6 py-3 pixel-glow-hover transition-all duration-200 hover:scale-105 active:scale-95"
          >
            🎮 PLAY AGAIN
          </button>
          <button
            onClick={handleBack}
            className="font-pixel text-sm bg-gray-600 hover:bg-gray-500 text-white pixel-border px-6 py-3 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            ← BACK
          </button>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-400 text-sm pt-4">
          <p className="font-pixel-body text-base">Use Escape key to go back</p>
          <p className="text-xs mt-1 opacity-75">© 2026 PixelTrivia</p>
        </footer>
      </PageTransition>
    </main>
  )
}
