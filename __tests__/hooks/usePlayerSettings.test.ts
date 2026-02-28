/**
 * Tests for usePlayerSettings Hook
 *
 * @module __tests__/hooks/usePlayerSettings
 * @since 1.0.0
 */

import { renderHook, act } from '@testing-library/react'
import { usePlayerSettings, buildPlayerParams, buildPlayerUrl } from '@/hooks/usePlayerSettings'

// Mock useSearchParams to control URL params
const mockSearchParams = new URLSearchParams()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/',
}))

describe('usePlayerSettings', () => {
  beforeEach(() => {
    localStorage.clear()
    // Clear mock search params before each test
    Array.from(mockSearchParams.keys()).forEach(key => mockSearchParams.delete(key))
  })

  // ============================================================================
  // Initialization
  // ============================================================================

  describe('Initialization', () => {
    it('should return default settings when nothing stored', () => {
      const { result } = renderHook(() => usePlayerSettings())

      expect(result.current.settings.name).toBe('Player')
      expect(result.current.settings.avatar).toBeDefined()
      expect(result.current.settings.volume).toBe(50)
    })

    it('should mark isLoaded after initialization', () => {
      const { result } = renderHook(() => usePlayerSettings())

      expect(result.current.isLoaded).toBe(true)
    })

    it('should load name from localStorage', () => {
      localStorage.setItem('pixeltrivia_player_name', JSON.stringify('StoredName'))

      const { result } = renderHook(() => usePlayerSettings())

      expect(result.current.settings.name).toBe('StoredName')
    })

    it('should load volume from localStorage', () => {
      localStorage.setItem('pixeltrivia_player_volume', JSON.stringify(75))

      const { result } = renderHook(() => usePlayerSettings())

      expect(result.current.settings.volume).toBe(75)
    })

    it('should prefer URL params over localStorage', () => {
      localStorage.setItem('pixeltrivia_player_name', JSON.stringify('StoredName'))
      mockSearchParams.set('name', 'URLName')

      const { result } = renderHook(() => usePlayerSettings())

      expect(result.current.settings.name).toBe('URLName')
    })

    it('should clamp volume to 0-100 range', () => {
      mockSearchParams.set('volume', '150')

      const { result } = renderHook(() => usePlayerSettings())

      expect(result.current.settings.volume).toBeLessThanOrEqual(100)
    })

    it('should handle NaN volume from URL params', () => {
      mockSearchParams.set('volume', 'notanumber')

      const { result } = renderHook(() => usePlayerSettings())

      // Should fall back to default volume
      expect(result.current.settings.volume).toBe(50)
    })
  })

  // ============================================================================
  // Update Functions
  // ============================================================================

  describe('Update Functions', () => {
    it('should update name via setName', () => {
      const { result } = renderHook(() => usePlayerSettings())

      act(() => {
        result.current.setName('NewName')
      })

      expect(result.current.settings.name).toBe('NewName')
    })

    it('should update avatar via setAvatar', () => {
      const { result } = renderHook(() => usePlayerSettings())

      act(() => {
        result.current.setAvatar('wizard')
      })

      expect(result.current.settings.avatar).toBe('wizard')
    })

    it('should update volume via setVolume', () => {
      const { result } = renderHook(() => usePlayerSettings())

      act(() => {
        result.current.setVolume(80)
      })

      expect(result.current.settings.volume).toBe(80)
    })

    it('should clamp volume to 0-100 range via setVolume', () => {
      const { result } = renderHook(() => usePlayerSettings())

      act(() => {
        result.current.setVolume(200)
      })
      expect(result.current.settings.volume).toBe(100)

      act(() => {
        result.current.setVolume(-50)
      })
      expect(result.current.settings.volume).toBe(0)
    })

    it('should update multiple settings via updateSettings', () => {
      const { result } = renderHook(() => usePlayerSettings())

      act(() => {
        result.current.updateSettings({ name: 'Alice', volume: 90 })
      })

      expect(result.current.settings.name).toBe('Alice')
      expect(result.current.settings.volume).toBe(90)
    })

    it('should persist name to localStorage', () => {
      const { result } = renderHook(() => usePlayerSettings())

      act(() => {
        result.current.setName('Persisted')
      })

      const stored = JSON.parse(localStorage.getItem('pixeltrivia_player_name') || '""')
      expect(stored).toBe('Persisted')
    })

    it('should persist volume to localStorage', () => {
      const { result } = renderHook(() => usePlayerSettings())

      act(() => {
        result.current.setVolume(33)
      })

      const stored = JSON.parse(localStorage.getItem('pixeltrivia_player_volume') || '0')
      expect(stored).toBe(33)
    })
  })

  // ============================================================================
  // Reset
  // ============================================================================

  describe('Reset', () => {
    it('should reset to default values', () => {
      const { result } = renderHook(() => usePlayerSettings())

      act(() => {
        result.current.setName('Custom')
        result.current.setVolume(99)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.settings.name).toBe('Player')
      expect(result.current.settings.volume).toBe(50)
    })
  })

  // ============================================================================
  // Player Info
  // ============================================================================

  describe('Player Info', () => {
    it('should include avatar details in playerInfo', () => {
      const { result } = renderHook(() => usePlayerSettings())

      expect(result.current.playerInfo.avatarDetails).toBeDefined()
      expect(result.current.playerInfo.avatarDetails.emoji).toBeDefined()
      expect(result.current.playerInfo.avatarDetails.name).toBeDefined()
      expect(result.current.playerInfo.avatarDetails.id).toBeDefined()
    })

    it('should merge settings into playerInfo', () => {
      const { result } = renderHook(() => usePlayerSettings())

      act(() => {
        result.current.setName('Bob')
      })

      expect(result.current.playerInfo.name).toBe('Bob')
      expect(result.current.playerInfo.volume).toBe(50)
    })

    it('should fallback to default avatar for invalid avatar id', () => {
      const { result } = renderHook(() => usePlayerSettings())

      act(() => {
        result.current.setAvatar('nonexistent-avatar-id')
      })

      // Should still have avatar details (fallback)
      expect(result.current.playerInfo.avatarDetails).toBeDefined()
      expect(result.current.playerInfo.avatarDetails.emoji).toBeDefined()
    })
  })
})

// ============================================================================
// Utility Function Tests
// ============================================================================

describe('buildPlayerParams', () => {
  it('should build URLSearchParams from settings', () => {
    const params = buildPlayerParams({
      name: 'Alice',
      avatar: 'wizard',
      volume: 75,
    })

    expect(params.get('name')).toBe('Alice')
    expect(params.get('avatar')).toBe('wizard')
    expect(params.get('volume')).toBe('75')
  })

  it('should include additional params', () => {
    const params = buildPlayerParams(
      { name: 'Alice', avatar: 'wizard', volume: 50 },
      { mode: 'quick', category: 'science' }
    )

    expect(params.get('name')).toBe('Alice')
    expect(params.get('mode')).toBe('quick')
    expect(params.get('category')).toBe('science')
  })

  it('should handle empty additional params', () => {
    const params = buildPlayerParams({ name: 'Bob', avatar: 'knight', volume: 50 }, {})

    expect(params.get('name')).toBe('Bob')
    expect(params.has('mode')).toBe(false)
  })
})

describe('buildPlayerUrl', () => {
  it('should build URL with settings as query params', () => {
    const url = buildPlayerUrl('/game/quick', {
      name: 'Alice',
      avatar: 'wizard',
      volume: 75,
    })

    expect(url).toContain('/game/quick?')
    expect(url).toContain('name=Alice')
    expect(url).toContain('avatar=wizard')
    expect(url).toContain('volume=75')
  })

  it('should include additional params', () => {
    const url = buildPlayerUrl(
      '/game/create',
      { name: 'Bob', avatar: 'knight', volume: 50 },
      { mode: 'custom' }
    )

    expect(url).toContain('mode=custom')
  })

  it('should start with base path', () => {
    const url = buildPlayerUrl('/some/path', { name: 'A', avatar: 'b', volume: 0 })

    expect(url.startsWith('/some/path?')).toBe(true)
  })
})
