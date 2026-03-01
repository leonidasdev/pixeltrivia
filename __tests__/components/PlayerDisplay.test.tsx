/**
 * Tests for PlayerDisplay components
 *
 * Covers AvatarDisplay, PlayerDisplay, PlayerBadge, and PlayerList.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  AvatarDisplay,
  PlayerDisplay,
  PlayerBadge,
  PlayerList,
} from '@/app/components/ui/PlayerDisplay'
import type { AvatarOption } from '@/constants/avatars'

// ============================================================================
// Test Data
// ============================================================================

const testAvatar: AvatarOption = {
  id: 'warrior',
  name: 'Warrior',
  emoji: '⚔️',
  color: 'bg-red-500',
}

const defaultAvatar: AvatarOption = {
  id: 'default',
  name: 'Player',
  emoji: '👤',
  color: 'bg-gray-500',
}

const testPlayer = {
  name: 'TestPlayer',
  avatar: 'warrior',
  avatarDetails: testAvatar,
}

const playerNoAvatar = {
  name: 'NoAvatarPlayer',
}

// ============================================================================
// AvatarDisplay Tests
// ============================================================================

describe('AvatarDisplay', () => {
  it('renders avatar emoji with proper label', () => {
    render(<AvatarDisplay avatar={testAvatar} />)
    const img = screen.getByRole('img', { name: 'Warrior' })
    expect(img).toHaveTextContent('⚔️')
  })

  it('applies avatar color class', () => {
    const { container } = render(<AvatarDisplay avatar={testAvatar} />)
    expect(container.firstChild).toHaveClass('bg-red-500')
  })

  it('shows border by default', () => {
    const { container } = render(<AvatarDisplay avatar={testAvatar} />)
    expect(container.firstChild).toHaveClass('border-2')
  })

  it('hides border when showBorder is false', () => {
    const { container } = render(<AvatarDisplay avatar={testAvatar} showBorder={false} />)
    expect(container.firstChild).not.toHaveClass('border-2')
  })

  it('applies size classes for each size variant', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const
    const expectedContainer = ['w-8', 'w-10', 'w-12', 'w-16']

    sizes.forEach((size, i) => {
      const { container } = render(<AvatarDisplay avatar={testAvatar} size={size} />)
      expect(container.firstChild).toHaveClass(expectedContainer[i])
    })
  })

  it('applies custom className', () => {
    const { container } = render(<AvatarDisplay avatar={testAvatar} className="my-custom" />)
    expect(container.firstChild).toHaveClass('my-custom')
  })
})

// ============================================================================
// PlayerDisplay Tests
// ============================================================================

describe('PlayerDisplay', () => {
  it('renders player name by default', () => {
    render(<PlayerDisplay player={testPlayer} />)
    expect(screen.getByText('TestPlayer')).toBeInTheDocument()
  })

  it('renders avatar emoji', () => {
    render(<PlayerDisplay player={testPlayer} />)
    expect(screen.getByRole('img', { name: 'Warrior' })).toBeInTheDocument()
  })

  it('hides name when showName is false', () => {
    render(<PlayerDisplay player={testPlayer} showName={false} />)
    expect(screen.queryByText('TestPlayer')).not.toBeInTheDocument()
  })

  it('shows class label when showClass is true', () => {
    render(<PlayerDisplay player={testPlayer} showClass={true} />)
    expect(screen.getByText('Warrior')).toBeInTheDocument()
  })

  it('uses default avatar when avatarDetails not provided', () => {
    render(<PlayerDisplay player={playerNoAvatar} />)
    expect(screen.getByRole('img', { name: 'Player' })).toHaveTextContent('👤')
  })

  it('uses vertical layout when direction is vertical', () => {
    const { container } = render(<PlayerDisplay player={testPlayer} direction="vertical" />)
    expect(container.firstChild).toHaveClass('flex-col')
  })

  it('uses horizontal layout by default', () => {
    const { container } = render(<PlayerDisplay player={testPlayer} />)
    expect(container.firstChild).not.toHaveClass('flex-col')
  })

  it('applies custom className', () => {
    const { container } = render(<PlayerDisplay player={testPlayer} className="extra-class" />)
    expect(container.firstChild).toHaveClass('extra-class')
  })
})

// ============================================================================
// PlayerBadge Tests
// ============================================================================

describe('PlayerBadge', () => {
  it('renders player name', () => {
    render(<PlayerBadge player={testPlayer} />)
    expect(screen.getByText('TestPlayer')).toBeInTheDocument()
  })

  it('renders avatar emoji', () => {
    render(<PlayerBadge player={testPlayer} />)
    expect(screen.getByRole('img', { name: 'Warrior' })).toBeInTheDocument()
  })

  it('shows score when provided', () => {
    render(<PlayerBadge player={testPlayer} score={500} />)
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('does not show score when not provided', () => {
    render(<PlayerBadge player={testPlayer} />)
    // Only name and emoji should be present, no score number
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument()
  })

  it('highlights current player', () => {
    const { container } = render(<PlayerBadge player={testPlayer} isCurrentPlayer />)
    expect(container.firstChild).toHaveClass('ring-2')
  })

  it('does not highlight non-current player', () => {
    const { container } = render(<PlayerBadge player={testPlayer} isCurrentPlayer={false} />)
    expect(container.firstChild).not.toHaveClass('ring-2')
  })

  it('uses default avatar for player without avatarDetails', () => {
    render(<PlayerBadge player={playerNoAvatar} />)
    expect(screen.getByRole('img', { name: 'Player' })).toHaveTextContent('👤')
  })

  it('applies custom className', () => {
    const { container } = render(<PlayerBadge player={testPlayer} className="badge-custom" />)
    expect(container.firstChild).toHaveClass('badge-custom')
  })
})

// ============================================================================
// PlayerList Tests
// ============================================================================

describe('PlayerList', () => {
  const players = [
    { name: 'Alice', avatarDetails: testAvatar },
    { name: 'Bob', avatarDetails: { ...testAvatar, id: 'mage', name: 'Mage', emoji: '🧙' } },
    { name: 'Charlie' },
  ]

  it('renders all players', () => {
    render(<PlayerList players={players} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('highlights the current player', () => {
    const { container } = render(<PlayerList players={players} currentPlayerName="Bob" />)
    const badges = container.querySelectorAll('.ring-2')
    expect(badges).toHaveLength(1)
  })

  it('shows scores when provided', () => {
    render(<PlayerList players={players} scores={{ Alice: 100, Bob: 200, Charlie: 50 }} />)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('renders vertical layout by default', () => {
    const { container } = render(<PlayerList players={players} />)
    expect(container.firstChild).toHaveClass('flex-col')
  })

  it('renders horizontal layout when specified', () => {
    const { container } = render(<PlayerList players={players} direction="horizontal" />)
    expect(container.firstChild).not.toHaveClass('flex-col')
  })

  it('applies custom className', () => {
    const { container } = render(<PlayerList players={players} className="list-custom" />)
    expect(container.firstChild).toHaveClass('list-custom')
  })
})
