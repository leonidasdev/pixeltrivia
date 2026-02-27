/**
 * @jest-environment jsdom
 */

/**
 * Tests for multiplayer UI components.
 *
 * Covers PlayerList, LobbyView, GameQuestion, Scoreboard, HostControls.
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  PlayerList,
  LobbyView,
  GameQuestion,
  Scoreboard,
  HostControls,
} from '@/app/components/multiplayer'
import type { RoomState } from '@/lib/multiplayerApi'
import type { MultiplayerPlayer } from '@/types/room'

const basePlayers: MultiplayerPlayer[] = [
  {
    id: 1,
    name: 'HostPlayer',
    avatar: 'knight',
    isHost: true,
    score: 500,
    hasAnswered: true,
    joinedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Player2',
    avatar: 'mage',
    isHost: false,
    score: 300,
    hasAnswered: false,
    joinedAt: '2026-01-01T00:01:00Z',
  },
]

// ============================================================================
// PlayerList
// ============================================================================

describe('PlayerList', () => {
  it('renders all player names', () => {
    render(<PlayerList players={basePlayers} currentPlayerId={1} />)
    expect(screen.getByText('HostPlayer')).toBeInTheDocument()
    expect(screen.getByText('Player2')).toBeInTheDocument()
  })

  it('shows HOST badge for host player', () => {
    render(<PlayerList players={basePlayers} currentPlayerId={2} />)
    expect(screen.getByText('HOST')).toBeInTheDocument()
  })

  it('shows YOU badge for non-host current player', () => {
    render(<PlayerList players={basePlayers} currentPlayerId={2} />)
    expect(screen.getByText('YOU')).toBeInTheDocument()
  })

  it('does not show YOU badge when current player is host', () => {
    render(<PlayerList players={basePlayers} currentPlayerId={1} />)
    expect(screen.queryByText('YOU')).not.toBeInTheDocument()
  })

  it('shows scores when showScores is true', () => {
    render(<PlayerList players={basePlayers} currentPlayerId={1} showScores />)
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('300')).toBeInTheDocument()
  })

  it('shows answer status when showAnswerStatus is true', () => {
    render(<PlayerList players={basePlayers} currentPlayerId={1} showAnswerStatus />)
    expect(screen.getByText('✓')).toBeInTheDocument()
  })
})

// ============================================================================
// LobbyView
// ============================================================================

describe('LobbyView', () => {
  const baseRoom: RoomState = {
    code: 'ABC123',
    status: 'waiting',
    currentQuestion: 0,
    totalQuestions: 10,
    questionStartTime: null,
    timeLimit: 30,
    maxPlayers: 8,
    gameMode: 'quick',
    category: null,
    createdAt: '2026-01-01T00:00:00Z',
    players: basePlayers,
  }

  const defaultProps = {
    room: baseRoom,
    playerId: 1,
    isHost: true,
    isStarting: false,
    onStartGame: jest.fn(),
    onLeave: jest.fn(),
  }

  it('renders room code segments', () => {
    render(<LobbyView {...defaultProps} />)
    // formatRoomCode formats "ABC123" as "ABC 123" or similar
    expect(screen.getByText(/ABC/)).toBeInTheDocument()
  })

  it('shows start button for host', () => {
    render(<LobbyView {...defaultProps} />)
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument()
  })

  it('shows waiting message for non-host', () => {
    render(<LobbyView {...defaultProps} isHost={false} />)
    expect(screen.getByText(/waiting for host/i)).toBeInTheDocument()
  })

  it('disables start when fewer than required players', () => {
    const onePlayerRoom = { ...baseRoom, players: [basePlayers[0]] }
    render(<LobbyView {...defaultProps} room={onePlayerRoom} />)
    // When not enough players, button shows "WAITING FOR PLAYERS..." and is disabled
    const btn = screen.getByRole('button', { name: /waiting for players/i })
    expect(btn).toBeDisabled()
  })

  it('calls onStartGame when start clicked', () => {
    const onStart = jest.fn()
    render(<LobbyView {...defaultProps} onStartGame={onStart} />)
    fireEvent.click(screen.getByRole('button', { name: /start game/i }))
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('calls onLeave when leave clicked', () => {
    const onLeave = jest.fn()
    render(<LobbyView {...defaultProps} onLeave={onLeave} />)
    fireEvent.click(screen.getByRole('button', { name: /leave room/i }))
    expect(onLeave).toHaveBeenCalledTimes(1)
  })

  it('shows game settings', () => {
    render(<LobbyView {...defaultProps} />)
    expect(screen.getByText('30s')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })
})

// ============================================================================
// GameQuestion
// ============================================================================

describe('GameQuestion', () => {
  const baseQuestion = {
    index: 2,
    questionText: 'What is the capital of France?',
    options: ['London', 'Paris', 'Berlin', 'Madrid'],
    category: 'geography',
    difficulty: 'easy' as const,
  }

  const defaultProps = {
    question: baseQuestion,
    questionNumber: 3,
    totalQuestions: 10,
    timeRemaining: 15,
    hasAnswered: false,
    selectedAnswer: null as number | null,
    wasCorrect: null as boolean | null,
    correctAnswer: null as number | null,
    isLoading: false,
    onAnswer: jest.fn(),
  }

  it('renders question text', () => {
    render(<GameQuestion {...defaultProps} />)
    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument()
  })

  it('renders all 4 options', () => {
    render(<GameQuestion {...defaultProps} />)
    expect(screen.getByText('London')).toBeInTheDocument()
    expect(screen.getByText('Paris')).toBeInTheDocument()
    expect(screen.getByText('Berlin')).toBeInTheDocument()
    expect(screen.getByText('Madrid')).toBeInTheDocument()
  })

  it('shows question number and total', () => {
    render(<GameQuestion {...defaultProps} />)
    expect(screen.getByText(/Question 3 of 10/)).toBeInTheDocument()
  })

  it('shows timer with seconds', () => {
    render(<GameQuestion {...defaultProps} />)
    expect(screen.getByText('15s')).toBeInTheDocument()
  })

  it('calls onAnswer when option clicked', () => {
    const onAnswer = jest.fn()
    render(<GameQuestion {...defaultProps} onAnswer={onAnswer} />)
    fireEvent.click(screen.getByText('Paris'))
    expect(onAnswer).toHaveBeenCalledWith(1) // Paris at index 1
  })

  it('disables options when already answered', () => {
    const onAnswer = jest.fn()
    render(<GameQuestion {...defaultProps} onAnswer={onAnswer} hasAnswered={true} />)
    fireEvent.click(screen.getByText('London'))
    expect(onAnswer).not.toHaveBeenCalled()
  })

  it('shows feedback when revealing', () => {
    render(
      <GameQuestion
        {...defaultProps}
        hasAnswered={true}
        selectedAnswer={1}
        correctAnswer={1}
        wasCorrect={true}
      />
    )
    expect(screen.getByText(/Correct!/i)).toBeInTheDocument()
  })

  it('shows wrong answer feedback', () => {
    render(
      <GameQuestion
        {...defaultProps}
        hasAnswered={true}
        selectedAnswer={0}
        correctAnswer={1}
        wasCorrect={false}
      />
    )
    expect(screen.getByText(/Wrong answer!/i)).toBeInTheDocument()
  })
})

// ============================================================================
// Scoreboard
// ============================================================================

describe('Scoreboard', () => {
  const players: MultiplayerPlayer[] = [
    {
      id: 1,
      name: 'Winner',
      avatar: 'knight',
      isHost: true,
      score: 1000,
      hasAnswered: true,
      joinedAt: '',
    },
    {
      id: 2,
      name: 'Second',
      avatar: 'mage',
      isHost: false,
      score: 700,
      hasAnswered: true,
      joinedAt: '',
    },
    {
      id: 3,
      name: 'Third',
      avatar: 'archer',
      isHost: false,
      score: 400,
      hasAnswered: true,
      joinedAt: '',
    },
  ]

  it('renders player names', () => {
    render(<Scoreboard players={players} currentPlayerId={1} isFinal={true} onFinish={() => {}} />)
    expect(screen.getByText('Winner')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByText('Third')).toBeInTheDocument()
  })

  it('shows medal emojis for top 3', () => {
    render(<Scoreboard players={players} currentPlayerId={2} isFinal={true} onFinish={() => {}} />)
    expect(screen.getByText('🥇')).toBeInTheDocument()
    expect(screen.getByText('🥈')).toBeInTheDocument()
    expect(screen.getByText('🥉')).toBeInTheDocument()
  })

  it('shows (you) indicator for current player', () => {
    render(<Scoreboard players={players} currentPlayerId={2} isFinal={true} onFinish={() => {}} />)
    expect(screen.getByText('(you)')).toBeInTheDocument()
  })

  it('shows back to home button when final', () => {
    render(<Scoreboard players={players} currentPlayerId={1} isFinal={true} onFinish={() => {}} />)
    expect(screen.getByRole('button', { name: /back to home/i })).toBeInTheDocument()
  })

  it('does not show button when not final', () => {
    render(<Scoreboard players={players} currentPlayerId={1} isFinal={false} />)
    expect(screen.queryByRole('button', { name: /back to home/i })).not.toBeInTheDocument()
  })
})

// ============================================================================
// HostControls
// ============================================================================

describe('HostControls', () => {
  const defaultProps = {
    canAdvance: true,
    isLoading: false,
    onNextQuestion: jest.fn(),
    answeredCount: 3,
    totalPlayers: 5,
  }

  it('shows next button', () => {
    render(<HostControls {...defaultProps} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('shows answered progress', () => {
    render(<HostControls {...defaultProps} />)
    expect(screen.getByText(/3/)).toBeInTheDocument()
    expect(screen.getByText(/5/)).toBeInTheDocument()
  })

  it('calls onNextQuestion when clicked', () => {
    const onNext = jest.fn()
    render(<HostControls {...defaultProps} onNextQuestion={onNext} />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('disables button when canAdvance is false', () => {
    render(<HostControls {...defaultProps} canAdvance={false} />)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
  })

  it('shows loading state', () => {
    render(<HostControls {...defaultProps} isLoading={true} />)
    expect(screen.getByText('⏳')).toBeInTheDocument()
  })
})
