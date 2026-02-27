/**
 * useSound Hook Tests
 *
 * @module __tests__/hooks/useSound.test.ts
 */

import { renderHook, act } from '@testing-library/react'
import { useSound } from '@/hooks/useSound'
import { soundManager } from '@/lib/soundManager'

// Mock soundManager
jest.mock('@/lib/soundManager', () => ({
  soundManager: {
    play: jest.fn(),
    volume: 0.5,
    muted: false,
    enabled: true,
    setVolumePercent: jest.fn(),
  },
}))

describe('useSound', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(soundManager as { volume: number }).volume = 0.5
    ;(soundManager as { muted: boolean }).muted = false
  })

  it('should return play function', () => {
    const { result } = renderHook(() => useSound())
    expect(typeof result.current.play).toBe('function')
  })

  it('should call soundManager.play when play is called', () => {
    const { result } = renderHook(() => useSound())
    act(() => {
      result.current.play('click')
    })
    expect(soundManager.play).toHaveBeenCalledWith('click', undefined)
  })

  it('should pass options to soundManager.play', () => {
    const { result } = renderHook(() => useSound())
    act(() => {
      result.current.play('correct', { volume: 0.8 })
    })
    expect(soundManager.play).toHaveBeenCalledWith('correct', { volume: 0.8 })
  })

  it('should set volume via setVolume', () => {
    const { result } = renderHook(() => useSound())
    act(() => {
      result.current.setVolume(75)
    })
    expect(soundManager.setVolumePercent).toHaveBeenCalledWith(75)
  })

  it('should toggle mute', () => {
    const { result } = renderHook(() => useSound())
    act(() => {
      result.current.toggleMute()
    })
    expect(soundManager.muted).toBe(true)
  })

  it('should initialize with provided volume', () => {
    renderHook(() => useSound(80))
    expect(soundManager.setVolumePercent).toHaveBeenCalledWith(80)
  })

  it('should return isMuted status', () => {
    const { result } = renderHook(() => useSound())
    expect(result.current.isMuted).toBe(false)
  })
})
