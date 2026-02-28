/**
 * Component tests for LobbyView
 * Tests room code display, copy/share buttons, player list,
 * host vs non-host rendering, and start game logic.
 */

import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LobbyView } from '@/app/components/multiplayer/LobbyView'
import type { RoomState } from '@/lib/multiplayerApi'

// Mock PlayerList — simple stub
jest.mock('@/app/components/multiplayer/PlayerList', () => ({
  PlayerList: ({ players }: { players: unknown[] }) => (
    <div data-testid="player-list">{players.length} players</div>
  ),
}))

// Mock formatRoomCode
jest.mock('@/lib/roomCode', () => ({
  formatRoomCode: (code: string) => code.match(/.{1,3}/g)?.join(' ') ?? code,
}))

const makePlayers = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `Player ${i + 1}`,
    avatar: '🎮',
    score: 0,
    isHost: i === 0,
    isReady: true,
  }))

const baseRoom: RoomState = {
  code: 'ABC123',
  status: 'waiting',
  currentQuestion: 0,
  totalQuestions: 10,
  questionStartTime: null,
  timeLimit: 30,
  maxPlayers: 8,
  gameMode: 'Quick',
  category: 'Science',
  createdAt: new Date().toISOString(),
  players: makePlayers(3),
}

const defaultProps = {
  room: baseRoom,
  playerId: 1,
  isHost: true,
  isStarting: false,
  onStartGame: jest.fn(),
  onLeave: jest.fn(),
}

// Clipboard mock — use spyOn since jsdom provides its own clipboard
let writeTextSpy: jest.SpyInstance

describe('LobbyView', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Create clipboard if jsdom doesn't provide it
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: jest.fn() },
        writable: true,
        configurable: true,
      })
    }
    writeTextSpy = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

    // Ensure share is not available by default
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    writeTextSpy?.mockRestore()
  })

  // ---------- Rendering ----------

  describe('rendering', () => {
    it('should display room code', () => {
      render(<LobbyView {...defaultProps} />)
      expect(screen.getByText(/ABC 123/)).toBeInTheDocument()
    })

    it('should render game settings', () => {
      render(<LobbyView {...defaultProps} />)
      expect(screen.getByText('Quick')).toBeInTheDocument()
      expect(screen.getByText('Science')).toBeInTheDocument()
      // Time limit is rendered as "30" + "s" in the same span
      expect(screen.getByText(/30\s*s/)).toBeInTheDocument()
    })

    it('should render player list', () => {
      render(<LobbyView {...defaultProps} />)
      expect(screen.getByTestId('player-list')).toBeInTheDocument()
      expect(screen.getByText('3 players')).toBeInTheDocument()
    })

    it('should show start button for host', () => {
      render(<LobbyView {...defaultProps} />)
      expect(screen.getByText(/START GAME/)).toBeInTheDocument()
    })

    it('should show waiting message for non-host', () => {
      render(<LobbyView {...defaultProps} isHost={false} />)
      expect(screen.queryByText(/START GAME/)).not.toBeInTheDocument()
      expect(screen.getByText(/Waiting for host/i)).toBeInTheDocument()
    })

    it('should show leave room button', () => {
      render(<LobbyView {...defaultProps} />)
      expect(screen.getByText(/LEAVE ROOM/i)).toBeInTheDocument()
    })

    it('should show player count warning when not enough players', () => {
      const room = { ...baseRoom, players: makePlayers(1) }
      render(<LobbyView {...defaultProps} room={room} />)
      expect(screen.getByText(/Need at least/i)).toBeInTheDocument()
    })
  })

  // ---------- Copy & Share ----------

  describe('copy and share buttons', () => {
    it('should render copy code button', () => {
      render(<LobbyView {...defaultProps} />)
      expect(screen.getByText(/COPY CODE/i)).toBeInTheDocument()
    })

    it('should render invite link button', () => {
      render(<LobbyView {...defaultProps} />)
      expect(screen.getByText(/INVITE LINK/i)).toBeInTheDocument()
    })

    it('should copy room code to clipboard on copy button click', async () => {
      render(<LobbyView {...defaultProps} />)

      const copyBtn = screen.getByRole('button', { name: /COPY CODE/i })
      await act(async () => {
        fireEvent.click(copyBtn)
      })

      expect(writeTextSpy).toHaveBeenCalledWith('ABC123')
      expect(screen.getByText(/Copied!/i)).toBeInTheDocument()
    })

    it('should copy room code when clicking the large room code display', async () => {
      render(<LobbyView {...defaultProps} />)

      const codeBtn = screen.getByTitle('Click to copy room code')
      await act(async () => {
        fireEvent.click(codeBtn)
      })
      expect(writeTextSpy).toHaveBeenCalledWith('ABC123')
    })

    it('should copy invite URL when Web Share is not available', async () => {
      render(<LobbyView {...defaultProps} />)

      const inviteBtn = screen.getByRole('button', { name: /INVITE LINK/i })
      await act(async () => {
        fireEvent.click(inviteBtn)
      })

      expect(writeTextSpy).toHaveBeenCalledWith(expect.stringContaining('/game/join?code=ABC123'))
      expect(screen.getByText(/Link copied!/i)).toBeInTheDocument()
    })

    it('should show error state when clipboard fails', async () => {
      // Override clipboard directly to always reject
      const failingWriteText = jest.fn().mockRejectedValue(new Error('fail'))
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: failingWriteText },
        writable: true,
        configurable: true,
      })

      render(<LobbyView {...defaultProps} />)

      const copyBtn = screen.getByRole('button', { name: /COPY CODE/i })
      // Fire click, then flush the rejected promise's microtask chain
      fireEvent.click(copyBtn)
      await act(async () => {
        await new Promise(r => setTimeout(r, 50))
      })

      expect(failingWriteText).toHaveBeenCalled()
      expect(screen.getByText(/Copy failed/i)).toBeInTheDocument()
    })
  })

  // ---------- Actions ----------

  describe('actions', () => {
    it('should call onStartGame when start button clicked', async () => {
      const user = userEvent.setup()
      render(<LobbyView {...defaultProps} />)

      await user.click(screen.getByText(/START GAME/))
      expect(defaultProps.onStartGame).toHaveBeenCalledTimes(1)
    })

    it('should disable start button when starting', () => {
      render(<LobbyView {...defaultProps} isStarting={true} />)
      expect(screen.getByText(/STARTING.../i)).toBeInTheDocument()
    })

    it('should disable start button when not enough players', () => {
      const room = { ...baseRoom, players: makePlayers(1) }
      render(<LobbyView {...defaultProps} room={room} />)
      const btn = screen.getByText(/WAITING FOR PLAYERS/i)
      expect(btn.closest('button')).toBeDisabled()
    })

    it('should call onLeave when leave button clicked', async () => {
      const user = userEvent.setup()
      render(<LobbyView {...defaultProps} />)

      await user.click(screen.getByText(/LEAVE ROOM/i))
      expect(defaultProps.onLeave).toHaveBeenCalledTimes(1)
    })
  })
})
