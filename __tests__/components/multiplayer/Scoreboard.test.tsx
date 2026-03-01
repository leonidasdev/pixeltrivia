/**
 * Tests for Scoreboard component
 *
 * @module __tests__/components/multiplayer/Scoreboard.test
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Scoreboard } from '@/app/components/multiplayer/Scoreboard'
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
    score: 500,
    hasAnswered: true,
    joinedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Charlie',
    avatar: 'rogue',
    isHost: false,
    score: 400,
    hasAnswered: true,
    joinedAt: new Date().toISOString(),
  },
]

describe('Scoreboard', () => {
  const defaultProps = {
    players: makePlayers(),
    currentPlayerId: 1,
    isFinal: false,
  }

  it('renders SCOREBOARD heading for intermediate scores', () => {
    render(<Scoreboard {...defaultProps} isFinal={false} />)
    expect(screen.getByText('SCOREBOARD')).toBeInTheDocument()
  })

  it('renders FINAL SCORES heading when game is final', () => {
    render(<Scoreboard {...defaultProps} isFinal={true} />)
    expect(screen.getByText('FINAL SCORES')).toBeInTheDocument()
  })

  it('sorts players by score descending', () => {
    render(<Scoreboard {...defaultProps} />)
    const names = screen.getAllByText(/Alice|Bob|Charlie/).map(el => el.textContent)
    // Bob (500) first, Charlie (400) second, Alice (300) third
    expect(names[0]).toContain('Bob')
    expect(names[1]).toContain('Charlie')
    expect(names[2]).toContain('Alice')
  })

  it('shows podium badges for top 3', () => {
    render(<Scoreboard {...defaultProps} />)
    expect(screen.getByText('1st')).toBeInTheDocument()
    expect(screen.getByText('2nd')).toBeInTheDocument()
    expect(screen.getByText('3rd')).toBeInTheDocument()
  })

  it('shows rank number for players beyond top 3', () => {
    const fourPlayers = [
      ...makePlayers(),
      {
        id: 4,
        name: 'Diana',
        avatar: 'mage',
        isHost: false,
        score: 100,
        hasAnswered: true,
        joinedAt: new Date().toISOString(),
      },
    ]
    render(<Scoreboard {...defaultProps} players={fourPlayers} />)
    expect(screen.getByText('#4')).toBeInTheDocument()
  })

  it('marks current player with (you)', () => {
    render(<Scoreboard {...defaultProps} currentPlayerId={2} />)
    expect(screen.getByText('(you)')).toBeInTheDocument()
  })

  it('shows scores for all players', () => {
    render(<Scoreboard {...defaultProps} />)
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('400')).toBeInTheDocument()
    expect(screen.getByText('300')).toBeInTheDocument()
  })

  it('shows points label for each player', () => {
    render(<Scoreboard {...defaultProps} />)
    const pointsLabels = screen.getAllByText('points')
    expect(pointsLabels).toHaveLength(3)
  })

  // ── Action buttons ──

  it('hides finish button when not final', () => {
    const onFinish = jest.fn()
    render(<Scoreboard {...defaultProps} isFinal={false} onFinish={onFinish} />)
    expect(screen.queryByText('BACK TO HOME')).not.toBeInTheDocument()
  })

  it('shows finish button when final and onFinish provided', () => {
    const onFinish = jest.fn()
    render(<Scoreboard {...defaultProps} isFinal={true} onFinish={onFinish} />)
    expect(screen.getByText('BACK TO HOME')).toBeInTheDocument()
  })

  it('calls onFinish when button clicked', () => {
    const onFinish = jest.fn()
    render(<Scoreboard {...defaultProps} isFinal={true} onFinish={onFinish} />)
    fireEvent.click(screen.getByText('BACK TO HOME'))
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('does not show finish button when onFinish is not provided', () => {
    render(<Scoreboard {...defaultProps} isFinal={true} />)
    expect(screen.queryByText('BACK TO HOME')).not.toBeInTheDocument()
  })

  // ── Edge cases ──

  it('renders empty player list without crashing', () => {
    render(<Scoreboard players={[]} currentPlayerId={null} isFinal={false} />)
    expect(screen.getByText('SCOREBOARD')).toBeInTheDocument()
  })

  it('handles unknown avatar gracefully', () => {
    const players = [{ ...makePlayers()[0], avatar: 'unknown-id' }]
    render(<Scoreboard players={players} currentPlayerId={null} isFinal={false} />)
    expect(screen.getByText('>')).toBeInTheDocument()
  })
})
