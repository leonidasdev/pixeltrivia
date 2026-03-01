/**
 * Sound Manager Tests
 *
 * @module __tests__/unit/lib/soundManager.test.ts
 */

import { soundManager, type SoundEffect } from '@/lib/soundManager'

// Mock Web Audio API
const mockGain = {
  gain: {
    value: 0,
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
  },
  connect: jest.fn(),
}

const mockOscillator = {
  type: 'sine' as OscillatorType,
  frequency: { value: 0 },
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
}

const mockBufferSource = {
  buffer: null,
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
}

const mockBuffer = {
  getChannelData: jest.fn(() => new Float32Array(100)),
}

const mockContext = {
  state: 'running',
  currentTime: 0,
  sampleRate: 44100,
  createGain: jest.fn(() => ({ ...mockGain, gain: { ...mockGain.gain } })),
  createOscillator: jest.fn(() => ({ ...mockOscillator })),
  createBufferSource: jest.fn(() => ({ ...mockBufferSource })),
  createBuffer: jest.fn(() => mockBuffer),
  resume: jest.fn(() => Promise.resolve()),
  close: jest.fn(() => Promise.resolve()),
  destination: {},
}

// @ts-expect-error - Mocking AudioContext
window.AudioContext = jest.fn(() => mockContext)

describe('SoundManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    soundManager.enabled = true
    soundManager.muted = false
    soundManager.volume = 0.5
  })

  describe('volume control', () => {
    it('should set and get volume', () => {
      soundManager.volume = 0.7
      expect(soundManager.volume).toBe(0.7)
    })

    it('should clamp volume between 0 and 1', () => {
      soundManager.volume = 1.5
      expect(soundManager.volume).toBe(1)

      soundManager.volume = -0.5
      expect(soundManager.volume).toBe(0)
    })

    it('should set volume from percentage', () => {
      soundManager.setVolumePercent(75)
      expect(soundManager.volume).toBe(0.75)
    })

    it('should toggle mute', () => {
      expect(soundManager.muted).toBe(false)
      soundManager.muted = true
      expect(soundManager.muted).toBe(true)
    })
  })

  describe('enabled state', () => {
    it('should track enabled state', () => {
      expect(soundManager.enabled).toBe(true)
      soundManager.enabled = false
      expect(soundManager.enabled).toBe(false)
    })

    it('should not play when disabled', () => {
      soundManager.enabled = false
      soundManager.play('click')
      expect(mockContext.createOscillator).not.toHaveBeenCalled()
    })

    it('should not play when muted', () => {
      soundManager.muted = true
      soundManager.play('click')
      expect(mockContext.createOscillator).not.toHaveBeenCalled()
    })
  })

  describe('play', () => {
    const effects: SoundEffect[] = [
      'click',
      'hover',
      'correct',
      'wrong',
      'tick',
      'countdown',
      'gameStart',
      'victory',
      'defeat',
      'scoreUp',
      'lobbyJoin',
      'lobbyLeave',
      'transition',
      'select',
      'timerWarning',
      'timerCritical',
      'questionReveal',
      'navigate',
    ]

    it.each(effects)('should play "%s" without errors', effect => {
      expect(() => soundManager.play(effect)).not.toThrow()
    })

    it('should play with volume option', () => {
      expect(() => soundManager.play('click', { volume: 0.5 })).not.toThrow()
    })

    it('should play with rate option', () => {
      expect(() => soundManager.play('click', { rate: 1.5 })).not.toThrow()
    })
  })

  describe('dispose', () => {
    it('should close audio context on dispose', () => {
      // Trigger context creation
      soundManager.play('click')
      soundManager.dispose()
      expect(mockContext.close).toHaveBeenCalled()
    })
  })

  // ─── Music controls ──────────────────────────────────────

  describe('music volume', () => {
    it('should set and get music volume', () => {
      soundManager.musicVolume = 0.6
      expect(soundManager.musicVolume).toBe(0.6)
    })

    it('should clamp music volume', () => {
      soundManager.musicVolume = 2
      expect(soundManager.musicVolume).toBe(1)
      soundManager.musicVolume = -1
      expect(soundManager.musicVolume).toBe(0)
    })

    it('should toggle music muted', () => {
      expect(soundManager.musicMuted).toBe(false)
      soundManager.musicMuted = true
      expect(soundManager.musicMuted).toBe(true)
    })

    it('should update musicGain when music volume set after context init', () => {
      soundManager.play('click') // init context
      soundManager.musicVolume = 0.4
      expect(soundManager.musicVolume).toBe(0.4)
    })

    it('should update musicGain when music muted after context init', () => {
      soundManager.play('click') // init context
      soundManager.musicMuted = true
      expect(soundManager.musicMuted).toBe(true)
      soundManager.musicMuted = false
      expect(soundManager.musicMuted).toBe(false)
    })
  })

  describe('playMusic / stopMusic', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      soundManager.stopMusic()
      jest.useRealTimers()
    })

    it('should report currentTrack as null initially', () => {
      expect(soundManager.currentTrack).toBeNull()
    })

    it('should play a music track', () => {
      soundManager.playMusic('menu')
      expect(soundManager.currentTrack).toBe('menu')
    })

    it('should stop music', () => {
      soundManager.playMusic('menu')
      soundManager.stopMusic()
      expect(soundManager.currentTrack).toBeNull()
    })

    it('should not play music when disabled', () => {
      soundManager.enabled = false
      soundManager.playMusic('menu')
      expect(soundManager.currentTrack).toBeNull()
    })

    it('should switch tracks', () => {
      soundManager.playMusic('menu')
      expect(soundManager.currentTrack).toBe('menu')
      soundManager.playMusic('gameplay')
      expect(soundManager.currentTrack).toBe('gameplay')
    })

    it('should auto-loop via interval', () => {
      soundManager.playMusic('menu')
      // Advance time to trigger loop interval
      jest.advanceTimersByTime(10000)
      expect(mockContext.createOscillator).toHaveBeenCalled()
    })

    it('should stop music when context is closed during interval', () => {
      soundManager.playMusic('menu')
      // Simulate closed context
      mockContext.state = 'closed'
      jest.advanceTimersByTime(10000)
      expect(soundManager.currentTrack).toBeNull()
      // Reset for cleanup
      mockContext.state = 'running'
    })
  })
})
