/**
 * Tests for PlayerList component
 *
 * @module __tests__/components/multiplayer/PlayerList.test
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { PlayerList } from '@/app/components/multiplayer/PlayerList'
import type { MultiplayerPlayer } from '@/types/room'

const makePlayers = (): MultiplayerPlayer[] => [
  {
    id: 1,
    name: 'Alice',
    avatar: 'wizard',
    isHost: true,
    score: 300,
    hasAnswered: true,
    joinedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Bob',
    avatar: 'knight',
    isHost: false,
    score: 150,
    hasAnswered: false,
    joinedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Charlie',
    avatar: 'rogue',
    isHost: false,
    score: 200,
    hasAnswered: true,
    joinedAt: new Date().toISOString(),
  },
]

describe('PlayerList', () => {
  it('renders all player names', () => {
    render(<PlayerList players={makePlayers()} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('shows HOST badge for host player', () => {
    render(<PlayerList players={makePlayers()} />)
    expect(screen.getByText('HOST')).toBeInTheDocument()
  })

  it('shows YOU badge for current player', () => {
    render(<PlayerList players={makePlayers()} currentPlayerId={2} />)
    expect(screen.getByText('YOU')).toBeInTheDocument()
  })

  it('does not show YOU badge for host when current player is host', () => {
    render(<PlayerList players={makePlayers()} currentPlayerId={1} />)
    // Host badge shown, not YOU badge (host badge takes priority)
    expect(screen.getByText('HOST')).toBeInTheDocument()
    expect(screen.queryByText('YOU')).not.toBeInTheDocument()
  })

  it('highlights current player row', () => {
    const { container } = render(<PlayerList players={makePlayers()} currentPlayerId={2} />)
    const rows = container.querySelectorAll('.flex.items-center.gap-3')
    // Second row (Bob, id=2) should have cyan styling
    expect(rows[1].className).toContain('border-cyan-400')
  })

  // ── Scores ──

  it('hides scores by default', () => {
    render(<PlayerList players={makePlayers()} />)
    expect(screen.queryByText('300')).not.toBeInTheDocument()
    expect(screen.queryByText('150')).not.toBeInTheDocument()
  })

  it('shows scores when showScores is true', () => {
    render(<PlayerList players={makePlayers()} showScores={true} />)
    expect(screen.getByText('300')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })

  // ── Answer status ──

  it('hides answer status by default', () => {
    render(<PlayerList players={makePlayers()} />)
    expect(screen.queryByText('OK')).not.toBeInTheDocument()
  })

  it('shows answer status when showAnswerStatus is true', () => {
    render(<PlayerList players={makePlayers()} showAnswerStatus={true} />)
    // Alice (answered) and Charlie (answered) get OK
    const okBadges = screen.getAllByText('OK')
    expect(okBadges).toHaveLength(2)
  })

  // ── Compact mode ──

  it('renders compact mode with smaller padding', () => {
    const { container } = render(<PlayerList players={makePlayers()} compact={true} />)
    const rows = container.querySelectorAll('.flex.items-center.gap-3')
    rows.forEach(row => {
      expect(row.className).toContain('p-1.5')
    })
  })

  // ── Edge cases ──

  it('renders empty list without crashing', () => {
    const { container } = render(<PlayerList players={[]} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('handles unknown avatar gracefully', () => {
    const players = [{ ...makePlayers()[0], avatar: 'nonexistent-avatar-id' }]
    render(<PlayerList players={players} />)
    // Should fall back to default emoji '>'
    expect(screen.getByText('>')).toBeInTheDocument()
  })
})
