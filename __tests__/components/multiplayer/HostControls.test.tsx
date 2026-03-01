/**
 * Tests for HostControls component
 *
 * @module __tests__/components/multiplayer/HostControls.test
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { HostControls } from '@/app/components/multiplayer/HostControls'

describe('HostControls', () => {
  const defaultProps = {
    canAdvance: false,
    isLoading: false,
    onNextQuestion: jest.fn(),
    answeredCount: 2,
    totalPlayers: 4,
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders host controls label', () => {
    render(<HostControls {...defaultProps} />)
    expect(screen.getByText('Host Controls')).toBeInTheDocument()
  })

  it('shows answered count out of total', () => {
    render(<HostControls {...defaultProps} answeredCount={3} totalPlayers={5} />)
    expect(screen.getByText('3/5 players answered')).toBeInTheDocument()
  })

  it('renders NEXT button', () => {
    render(<HostControls {...defaultProps} canAdvance={true} />)
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('NEXT')
  })

  it('disables button when canAdvance is false', () => {
    render(<HostControls {...defaultProps} canAdvance={false} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('disables button when loading', () => {
    render(<HostControls {...defaultProps} canAdvance={true} isLoading={true} />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('...')
  })

  it('enables button when canAdvance and not loading', () => {
    render(<HostControls {...defaultProps} canAdvance={true} isLoading={false} />)
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('calls onNextQuestion when clicked', () => {
    const onNext = jest.fn()
    render(<HostControls {...defaultProps} canAdvance={true} onNextQuestion={onNext} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('does not call onNextQuestion when disabled', () => {
    const onNext = jest.fn()
    render(<HostControls {...defaultProps} canAdvance={false} onNextQuestion={onNext} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onNext).not.toHaveBeenCalled()
  })

  it('renders progress bar', () => {
    const { container } = render(
      <HostControls {...defaultProps} answeredCount={2} totalPlayers={4} />
    )
    const bar = container.querySelector('.bg-yellow-400')
    expect(bar).toBeInTheDocument()
    expect(bar).toHaveStyle({ width: '50%' })
  })

  it('handles zero players without crashing', () => {
    const { container } = render(
      <HostControls {...defaultProps} answeredCount={0} totalPlayers={0} />
    )
    const bar = container.querySelector('.bg-yellow-400')
    expect(bar).toHaveStyle({ width: '0%' })
  })
})
