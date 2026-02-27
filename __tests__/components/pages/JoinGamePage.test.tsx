/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import JoinGamePage from '@/app/game/join/page'

describe('JoinGamePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the page title', () => {
      render(<JoinGamePage />)
      expect(screen.getByText('JOIN GAME ROOM')).toBeInTheDocument()
    })

    it('renders room code input with label', () => {
      render(<JoinGamePage />)
      expect(screen.getByLabelText(/room code/i)).toBeInTheDocument()
    })

    it('renders placeholder text', () => {
      render(<JoinGamePage />)
      expect(screen.getByPlaceholderText('ABC123')).toBeInTheDocument()
    })

    it('renders the join button', () => {
      render(<JoinGamePage />)
      expect(screen.getByRole('button', { name: /enter 6 more characters/i })).toBeInTheDocument()
    })

    it('renders footer', () => {
      render(<JoinGamePage />)
      expect(screen.getByText(/enter a valid room code/i)).toBeInTheDocument()
    })
  })

  describe('Room code input', () => {
    it('converts input to uppercase', () => {
      render(<JoinGamePage />)
      const input = screen.getByLabelText(/room code/i)

      fireEvent.change(input, { target: { value: 'abc123' } })
      expect(input).toHaveValue('ABC123')
    })

    it('limits input to 6 characters', () => {
      render(<JoinGamePage />)
      const input = screen.getByLabelText(/room code/i)

      fireEvent.change(input, { target: { value: 'ABCDEFGH' } })
      expect(input).toHaveValue('ABCDEF')
    })

    it('enables join button when 6 chars entered', () => {
      render(<JoinGamePage />)
      const input = screen.getByLabelText(/room code/i)

      fireEvent.change(input, { target: { value: 'ABC123' } })

      const joinBtn = screen.getByRole('button', { name: /join room/i })
      expect(joinBtn).not.toBeDisabled()
    })

    it('disables join button when less than 6 chars', () => {
      render(<JoinGamePage />)
      const input = screen.getByLabelText(/room code/i)

      fireEvent.change(input, { target: { value: 'ABC' } })

      const joinBtn = screen.getByRole('button', { name: /enter 3 more characters/i })
      expect(joinBtn).toBeDisabled()
    })
  })

  describe('Player info', () => {
    it('shows default player name', () => {
      render(<JoinGamePage />)
      expect(screen.getByText(/Player: Player1234/)).toBeInTheDocument()
    })
  })
})
