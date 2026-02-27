/**
 * Game History List Component
 *
 * Displays a scrollable, pixel-art styled list of past game entries.
 * Supports filtering, sorting, and individual entry deletion.
 *
 * @module app/components/stats/GameHistoryList
 * @since 1.0.0
 */

'use client'

import { useState, useMemo } from 'react'
import type { GameHistoryEntry } from '@/lib/storage'

// ============================================================================
// Types
// ============================================================================

export interface GameHistoryListProps {
  history: GameHistoryEntry[]
  onDelete?: (id: string) => void
  onClearAll?: () => void
}

type SortField = 'date' | 'score' | 'accuracy'
type FilterMode = 'all' | 'quick' | 'custom' | 'advanced' | 'multiplayer'

// ============================================================================
// Helpers
// ============================================================================

const MODE_EMOJI: Record<string, string> = {
  quick: '⚡',
  custom: '🤖',
  advanced: '📚',
  multiplayer: '👥',
}

const MODE_COLORS: Record<string, string> = {
  quick: 'border-orange-600 bg-orange-900 bg-opacity-30',
  custom: 'border-purple-600 bg-purple-900 bg-opacity-30',
  advanced: 'border-blue-600 bg-blue-900 bg-opacity-30',
  multiplayer: 'border-green-600 bg-green-900 bg-opacity-30',
}

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 90) return 'text-green-400'
  if (accuracy >= 70) return 'text-yellow-400'
  if (accuracy >= 50) return 'text-orange-400'
  return 'text-red-400'
}

function getAccuracyBadge(accuracy: number): { emoji: string; label: string } {
  if (accuracy === 100) return { emoji: '💎', label: 'PERFECT' }
  if (accuracy >= 90) return { emoji: '🌟', label: 'EXCELLENT' }
  if (accuracy >= 70) return { emoji: '✨', label: 'GOOD' }
  if (accuracy >= 50) return { emoji: '👍', label: 'OK' }
  return { emoji: '💪', label: 'KEEP AT IT' }
}

// ============================================================================
// History Entry Row
// ============================================================================

interface HistoryRowProps {
  entry: GameHistoryEntry
  onDelete?: (id: string) => void
}

function HistoryRow({ entry, onDelete }: HistoryRowProps) {
  const [showDetails, setShowDetails] = useState(false)
  const badge = getAccuracyBadge(entry.accuracy)

  return (
    <div
      className={`pixel-border ${MODE_COLORS[entry.mode] || 'border-gray-600 bg-gray-900 bg-opacity-30'} transition-all duration-200`}
    >
      {/* Main row */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full p-3 text-left flex items-center justify-between gap-3 hover:bg-white hover:bg-opacity-5 transition-colors"
        aria-expanded={showDetails}
        aria-label={`Game details: ${entry.mode} - ${entry.category}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-xl flex-shrink-0">{MODE_EMOJI[entry.mode] || '🎮'}</span>
          <div className="min-w-0">
            <div className="font-pixel text-xs text-white truncate uppercase">{entry.category}</div>
            <div className="font-pixel-body text-xs text-gray-400">
              {entry.mode.toUpperCase()} • {entry.difficulty} • {formatDate(entry.playedAt)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <div className="font-pixel text-sm text-yellow-400">{entry.score.toLocaleString()}</div>
            <div className={`font-pixel-body text-xs ${getAccuracyColor(entry.accuracy)}`}>
              {Math.round(entry.accuracy)}%
            </div>
          </div>
          <span
            className={`text-xs transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
          >
            ▼
          </span>
        </div>
      </button>

      {/* Expanded details */}
      {showDetails && (
        <div className="px-3 pb-3 border-t border-gray-700 border-opacity-50 pt-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            <div className="text-center">
              <div className="font-pixel text-[10px] text-gray-500">CORRECT</div>
              <div className="font-pixel-body text-sm text-white">
                {entry.correctAnswers}/{entry.totalQuestions}
              </div>
            </div>
            <div className="text-center">
              <div className="font-pixel text-[10px] text-gray-500">DURATION</div>
              <div className="font-pixel-body text-sm text-white">
                {formatDuration(entry.duration)}
              </div>
            </div>
            <div className="text-center">
              <div className="font-pixel text-[10px] text-gray-500">STREAK</div>
              <div className="font-pixel-body text-sm text-orange-400">🔥 {entry.streak || 0}</div>
            </div>
            <div className="text-center">
              <div className="font-pixel text-[10px] text-gray-500">RATING</div>
              <div className="font-pixel-body text-sm">
                {badge.emoji} {badge.label}
              </div>
            </div>
          </div>

          {entry.playerName && (
            <div className="font-pixel-body text-xs text-gray-500 text-center mb-2">
              Played by: {entry.playerName}
            </div>
          )}

          {onDelete && (
            <div className="flex justify-end">
              <button
                onClick={e => {
                  e.stopPropagation()
                  onDelete(entry.id)
                }}
                className="font-pixel text-[10px] text-red-400 hover:text-red-300 pixel-border px-2 py-1 bg-red-900 bg-opacity-30 hover:bg-opacity-50 transition-colors"
                aria-label="Delete this game entry"
              >
                🗑️ DELETE
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Component
// ============================================================================

export function GameHistoryList({ history, onDelete, onClearAll }: GameHistoryListProps) {
  const [sortBy, setSortBy] = useState<SortField>('date')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  // Filter and sort
  const filteredHistory = useMemo(() => {
    let list = [...history]

    // Filter
    if (filterMode !== 'all') {
      list = list.filter(e => e.mode === filterMode)
    }

    // Sort
    switch (sortBy) {
      case 'score':
        list.sort((a, b) => b.score - a.score)
        break
      case 'accuracy':
        list.sort((a, b) => b.accuracy - a.accuracy)
        break
      case 'date':
      default:
        list.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
        break
    }

    return list
  }, [history, sortBy, filterMode])

  if (history.length === 0) {
    return (
      <div className="pixel-border bg-gray-800 bg-opacity-80 p-8 text-center">
        <div className="text-4xl mb-4">📜</div>
        <h3 className="font-pixel text-lg text-white mb-2">NO HISTORY</h3>
        <p className="font-pixel-body text-gray-400 text-lg">
          Completed games will appear here. Go play some trivia!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1">
          {(['all', 'quick', 'custom', 'advanced', 'multiplayer'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`font-pixel text-[10px] px-2 py-1 pixel-border transition-colors ${
                filterMode === mode
                  ? 'bg-cyan-600 text-white border-cyan-400'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {mode === 'all' ? '🎮 ALL' : `${MODE_EMOJI[mode]} ${mode.toUpperCase()}`}
            </button>
          ))}
        </div>

        {/* Sort + Clear */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortField)}
            className="font-pixel text-[10px] bg-gray-800 text-gray-300 pixel-border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="Sort by"
          >
            <option value="date">📅 NEWEST</option>
            <option value="score">⭐ BEST SCORE</option>
            <option value="accuracy">🎯 ACCURACY</option>
          </select>

          {onClearAll && (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="font-pixel text-[10px] text-red-400 hover:text-red-300 pixel-border px-2 py-1 bg-red-900 bg-opacity-30 hover:bg-opacity-50 transition-colors"
              aria-label="Clear all history"
            >
              🗑️ CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Count display */}
      <div className="font-pixel-body text-xs text-gray-500">
        Showing {filteredHistory.length} of {history.length} games
      </div>

      {/* History entries */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {filteredHistory.map(entry => (
          <HistoryRow key={entry.id} entry={entry} onDelete={onDelete} />
        ))}
      </div>

      {/* Clear confirmation dialog */}
      {showConfirmClear && (
        <div className="pixel-border bg-red-900 bg-opacity-50 p-4 text-center">
          <p className="font-pixel text-sm text-white mb-3">DELETE ALL HISTORY?</p>
          <p className="font-pixel-body text-gray-300 text-sm mb-4">
            This will permanently erase {history.length} game records. This cannot be undone.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                onClearAll?.()
                setShowConfirmClear(false)
              }}
              className="font-pixel text-xs bg-red-600 hover:bg-red-500 text-white pixel-border px-4 py-2 transition-colors"
            >
              YES, DELETE ALL
            </button>
            <button
              onClick={() => setShowConfirmClear(false)}
              className="font-pixel text-xs bg-gray-600 hover:bg-gray-500 text-white pixel-border px-4 py-2 transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
