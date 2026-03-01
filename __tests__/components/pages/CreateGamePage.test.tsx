/**
 * Tests for Create Game Page
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'mode' ? 'quick' : null),
  }),
}))

jest.mock('@/hooks', () => ({
  useSound: () => ({ play: jest.fn() }),
}))

jest.mock('@/hooks/usePlayerSettings', () => ({
  usePlayerSettings: () => ({
    settings: { name: 'TestHost', avatar: 'warrior' },
    updateSettings: jest.fn(),
  }),
}))

const mockCreateRoom = jest.fn()
jest.mock('@/lib/multiplayerApi', () => ({
  createRoom: (...args: unknown[]) => mockCreateRoom(...args),
}))

jest.mock('@/app/components/ui', () => ({
  LoadingOverlay: ({ label }: { label: string }) => <div data-testid="loading">{label}</div>,
  ToastContainer: () => <div data-testid="toast-container" />,
  useToast: () => ({
    messages: [],
    dismissToast: jest.fn(),
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    },
  }),
  GamePageLayout: ({ children, header }: { children: React.ReactNode; header: { title: string; icon: string } }) => (
    <div data-testid="game-layout">
      <h1>{header.icon} {header.title}</h1>
      {children}
    </div>
  ),
}))

jest.mock('@/constants/game', () => ({
  MULTIPLAYER_STORAGE_KEYS: {
    PLAYER_ID: 'mp_player_id',
    ROOM_CODE: 'mp_room_code',
    IS_HOST: 'mp_is_host',
  },
  DEFAULT_MAX_PLAYERS: 8,
  DEFAULT_TIME_LIMIT: 30,
  DEFAULT_QUESTION_COUNT: 10,
}))

import CreateGamePage from '@/app/game/create/page'

// ── Tests ──────────────────────────────────────────────────────────────────

describe('CreateGamePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('renders with Suspense wrapper', () => {
    render(<CreateGamePage />)
    expect(screen.getByTestId('game-layout')).toBeInTheDocument()
  })

  it('renders page title', () => {
    render(<CreateGamePage />)
    expect(screen.getByText(/Create Game Room/)).toBeInTheDocument()
  })

  it('pre-fills player name from settings', () => {
    render(<CreateGamePage />)
    const input = screen.getByLabelText(/Your Name/i) as HTMLInputElement
    expect(input.value).toBe('TestHost')
  })

  it('renders max players select', () => {
    render(<CreateGamePage />)
    expect(screen.getByLabelText(/Max Players/i)).toBeInTheDocument()
  })

  it('renders time limit select', () => {
    render(<CreateGamePage />)
    expect(screen.getByLabelText(/Time per Question/i)).toBeInTheDocument()
  })

  it('renders question count select', () => {
    render(<CreateGamePage />)
    expect(screen.getByLabelText(/Number of Questions/i)).toBeInTheDocument()
  })

  it('shows game mode badge', () => {
    render(<CreateGamePage />)
    expect(screen.getByText(/Mode:/)).toBeInTheDocument()
  })

  it('renders create button', () => {
    render(<CreateGamePage />)
    expect(screen.getByText(/CREATE ROOM/)).toBeInTheDocument()
  })

  it('has an input for player name', () => {
    render(<CreateGamePage />)
    const input = screen.getByLabelText(/Your Name/i) as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.type).toBe('text')
    expect(input.maxLength).toBe(20)
  })

  it('creates room on button click', async () => {
    mockCreateRoom.mockResolvedValue({
      success: true,
      data: { playerId: 1, roomCode: 'ABCD' },
    })

    render(<CreateGamePage />)

    await act(async () => {
      fireEvent.click(screen.getByText(/CREATE ROOM/))
    })

    expect(mockCreateRoom).toHaveBeenCalledWith(
      expect.objectContaining({
        playerName: 'TestHost',
        avatar: 'warrior',
        gameMode: 'quick',
      })
    )
  })

  it('saves session info to localStorage on success', async () => {
    mockCreateRoom.mockResolvedValue({
      success: true,
      data: { playerId: 42, roomCode: 'WXYZ' },
    })

    render(<CreateGamePage />)

    await act(async () => {
      fireEvent.click(screen.getByText(/CREATE ROOM/))
    })

    expect(localStorage.getItem('mp_player_id')).toBe('42')
    expect(localStorage.getItem('mp_room_code')).toBe('WXYZ')
    expect(localStorage.getItem('mp_is_host')).toBe('true')
  })

  it('allows changing select values', () => {
    render(<CreateGamePage />)

    const maxPlayers = screen.getByLabelText(/Max Players/i) as HTMLSelectElement
    fireEvent.change(maxPlayers, { target: { value: '4' } })
    expect(maxPlayers.value).toBe('4')

    const timeLimit = screen.getByLabelText(/Time per Question/i) as HTMLSelectElement
    fireEvent.change(timeLimit, { target: { value: '15' } })
    expect(timeLimit.value).toBe('15')

    const questionCount = screen.getByLabelText(/Number of Questions/i) as HTMLSelectElement
    fireEvent.change(questionCount, { target: { value: '20' } })
    expect(questionCount.value).toBe('20')
  })
})
