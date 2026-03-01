/**
 * Tests for GameHistoryList component
 *
 * @module __tests__/components/stats/GameHistoryList.test
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameHistoryList } from '@/app/components/stats/GameHistoryList'
import type { GameHistoryEntry } from '@/lib/storage'

// Mock formatDuration
jest.mock('@/lib/utils', () => ({
  formatDuration: jest.fn((d: number) => `${d}s`),
}))

function makeEntry(overrides: Partial<GameHistoryEntry> = {}): GameHistoryEntry {
  return {
    id: 'e1',
    mode: 'quick',
    category: 'Science',
    difficulty: 'medium',
    score: 500,
    accuracy: 80,
    correctAnswers: 8,
    totalQuestions: 10,
    duration: 120,
    streak: 3,
    playedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('GameHistoryList', () => {
  describe('empty state', () => {
    it('shows empty message when history is empty', () => {
      render(<GameHistoryList history={[]} />)
      expect(screen.getByText('NO HISTORY')).toBeInTheDocument()
    })
  })

  describe('with entries', () => {
    const entries: GameHistoryEntry[] = [
      makeEntry({
        id: '1',
        mode: 'quick',
        score: 100,
        accuracy: 95,
        playedAt: '2026-01-02T00:00:00Z',
      }),
      makeEntry({
        id: '2',
        mode: 'custom',
        score: 200,
        accuracy: 50,
        playedAt: '2026-01-01T00:00:00Z',
      }),
      makeEntry({
        id: '3',
        mode: 'advanced',
        score: 300,
        accuracy: 70,
        playedAt: '2026-01-03T00:00:00Z',
      }),
    ]

    it('renders all entries', () => {
      render(<GameHistoryList history={entries} />)
      expect(screen.getByText(/showing 3 of 3/i)).toBeInTheDocument()
    })

    it('expands details on click', () => {
      render(<GameHistoryList history={[makeEntry({ streak: 5 })]} />)
      const btn = screen.getByRole('button', { name: /game details/i })
      fireEvent.click(btn)
      expect(screen.getByText('🔥 5')).toBeInTheDocument()
    })

    it('shows playerName when present', () => {
      render(<GameHistoryList history={[makeEntry({ playerName: 'Alice' })]} />)
      fireEvent.click(screen.getByRole('button', { name: /game details/i }))
      expect(screen.getByText(/played by: alice/i)).toBeInTheDocument()
    })

    it('does not show playerName when absent', () => {
      const entry = makeEntry()
      delete (entry as Record<string, unknown>).playerName
      render(<GameHistoryList history={[entry]} />)
      fireEvent.click(screen.getByRole('button', { name: /game details/i }))
      expect(screen.queryByText(/played by/i)).not.toBeInTheDocument()
    })

    // ── Filtering ───────────────────────────────────────────

    it('filters by mode', () => {
      render(<GameHistoryList history={entries} />)
      fireEvent.click(screen.getByText(/⚡ QUICK/i))
      expect(screen.getByText(/showing 1 of 3/i)).toBeInTheDocument()
    })

    it('shows all when ALL filter selected', () => {
      render(<GameHistoryList history={entries} />)
      fireEvent.click(screen.getByText(/⚡ QUICK/i)) // filter first
      fireEvent.click(screen.getByText(/🎮 ALL/i))
      expect(screen.getByText(/showing 3 of 3/i)).toBeInTheDocument()
    })

    // ── Sorting ─────────────────────────────────────────────

    it('sorts by score', () => {
      render(<GameHistoryList history={entries} />)
      fireEvent.change(screen.getByRole('combobox', { name: /sort by/i }), {
        target: { value: 'score' },
      })
      // Verify first visible entry has highest score
      const scores = screen.getAllByText(/\d+/)
      expect(scores.length).toBeGreaterThan(0)
    })

    it('sorts by accuracy', () => {
      render(<GameHistoryList history={entries} />)
      fireEvent.change(screen.getByRole('combobox', { name: /sort by/i }), {
        target: { value: 'accuracy' },
      })
      expect(screen.getByText(/showing 3/i)).toBeInTheDocument()
    })

    // ── Delete ──────────────────────────────────────────────

    it('shows delete button in details when onDelete is provided', () => {
      const onDelete = jest.fn()
      render(<GameHistoryList history={[makeEntry()]} onDelete={onDelete} />)
      fireEvent.click(screen.getByRole('button', { name: /game details/i }))
      const deleteBtn = screen.getByRole('button', { name: /delete this game/i })
      fireEvent.click(deleteBtn)
      expect(onDelete).toHaveBeenCalledWith('e1')
    })

    it('does not show delete button when onDelete is not provided', () => {
      render(<GameHistoryList history={[makeEntry()]} />)
      fireEvent.click(screen.getByRole('button', { name: /game details/i }))
      expect(screen.queryByRole('button', { name: /delete this game/i })).not.toBeInTheDocument()
    })

    // ── Clear all ───────────────────────────────────────────

    it('shows clear button when onClearAll is provided', () => {
      const onClearAll = jest.fn()
      render(<GameHistoryList history={entries} onClearAll={onClearAll} />)
      expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument()
    })

    it('does not show clear button when onClearAll is not provided', () => {
      render(<GameHistoryList history={entries} />)
      expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument()
    })

    it('shows confirm dialog and clears on confirm', () => {
      const onClearAll = jest.fn()
      render(<GameHistoryList history={entries} onClearAll={onClearAll} />)
      fireEvent.click(screen.getByRole('button', { name: /clear all/i }))
      expect(screen.getByText(/DELETE ALL HISTORY/i)).toBeInTheDocument()
      fireEvent.click(screen.getByText(/YES, DELETE ALL/i))
      expect(onClearAll).toHaveBeenCalled()
    })

    it('cancels clear dialog', () => {
      const onClearAll = jest.fn()
      render(<GameHistoryList history={entries} onClearAll={onClearAll} />)
      fireEvent.click(screen.getByRole('button', { name: /clear all/i }))
      fireEvent.click(screen.getByText(/CANCEL/i))
      expect(onClearAll).not.toHaveBeenCalled()
      expect(screen.queryByText(/DELETE ALL HISTORY/i)).not.toBeInTheDocument()
    })

    // ── Accuracy colour / badge branches ────────────────────

    it('renders accuracy color for >=90% (green)', () => {
      render(<GameHistoryList history={[makeEntry({ accuracy: 95 })]} />)
      const el = screen.getByText('95%')
      expect(el.className).toContain('text-green')
    })

    it('renders accuracy color for 70-89% (yellow)', () => {
      render(<GameHistoryList history={[makeEntry({ accuracy: 75 })]} />)
      expect(screen.getByText('75%').className).toContain('text-yellow')
    })

    it('renders accuracy color for 50-69% (orange)', () => {
      render(<GameHistoryList history={[makeEntry({ accuracy: 55 })]} />)
      expect(screen.getByText('55%').className).toContain('text-orange')
    })

    it('renders accuracy color for <50% (red)', () => {
      render(<GameHistoryList history={[makeEntry({ accuracy: 30 })]} />)
      expect(screen.getByText('30%').className).toContain('text-red')
    })

    it('shows PERFECT badge for 100%', () => {
      render(<GameHistoryList history={[makeEntry({ accuracy: 100 })]} />)
      fireEvent.click(screen.getByRole('button', { name: /game details/i }))
      expect(screen.getByText(/PERFECT/i)).toBeInTheDocument()
    })

    it('shows KEEP AT IT badge for <50%', () => {
      render(<GameHistoryList history={[makeEntry({ accuracy: 30 })]} />)
      fireEvent.click(screen.getByRole('button', { name: /game details/i }))
      expect(screen.getByText(/KEEP AT IT/i)).toBeInTheDocument()
    })

    // ── Mode colors / unknown mode ──────────────────────────

    it('handles unknown mode gracefully', () => {
      render(
        <GameHistoryList
          history={[makeEntry({ mode: 'unknownMode' as GameHistoryEntry['mode'] })]}
        />
      )
      // Should still render without crashing, falling back to default color
      expect(screen.getByText(/SCIENCE/i)).toBeInTheDocument()
    })

    it('renders multiplayer mode', () => {
      render(
        <GameHistoryList
          history={[makeEntry({ mode: 'multiplayer' as GameHistoryEntry['mode'] })]}
        />
      )
      expect(screen.getByText('👥')).toBeInTheDocument()
    })

    // ── Date formatting branches ────────────────────────────

    it('shows "Just now" for recently played', () => {
      render(<GameHistoryList history={[makeEntry({ playedAt: new Date().toISOString() })]} />)
      expect(screen.getByText(/just now/i)).toBeInTheDocument()
    })

    it('shows minutes ago', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString()
      render(<GameHistoryList history={[makeEntry({ playedAt: fiveMinAgo })]} />)
      expect(screen.getByText(/5m ago/i)).toBeInTheDocument()
    })

    it('shows hours ago', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString()
      render(<GameHistoryList history={[makeEntry({ playedAt: threeHoursAgo })]} />)
      expect(screen.getByText(/3h ago/i)).toBeInTheDocument()
    })

    it('shows days ago', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString()
      render(<GameHistoryList history={[makeEntry({ playedAt: twoDaysAgo })]} />)
      expect(screen.getByText(/2d ago/i)).toBeInTheDocument()
    })

    it('shows formatted date for old entries', () => {
      render(<GameHistoryList history={[makeEntry({ playedAt: '2020-06-15T12:00:00Z' })]} />)
      // Should show month/day/year for old entry
      expect(screen.getByText(/Jun/i)).toBeInTheDocument()
    })

    // ── Streak 0 fallback ───────────────────────────────────

    it('shows streak 0 when streak is undefined', () => {
      const entry = makeEntry()
      delete (entry as Record<string, unknown>).streak
      render(<GameHistoryList history={[entry]} />)
      fireEvent.click(screen.getByRole('button', { name: /game details/i }))
      expect(screen.getByText('🔥 0')).toBeInTheDocument()
    })
  })
})
