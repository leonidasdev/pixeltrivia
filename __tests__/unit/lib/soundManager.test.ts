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
})
