/**
 * Sound Manager
 *
 * Web Audio API based sound engine for 8-bit chiptune sound effects
 * and procedural background music loops.
 * All sounds are generated programmatically — no audio files needed.
 *
 * Sound data (note frequencies, music patterns, effect definitions) lives in
 * {@link ./soundData} to keep the engine focused on playback logic.
 *
 * @module lib/soundManager
 * @since 1.1.0
 */

import { logger } from './logger'
import {
  MUSIC_PATTERNS,
  SOUND_EFFECTS,
  type NoteConfig,
  type MusicTrack,
  type SoundEffectDefinition,
} from './soundData'

// ============================================================================
// Types
// ============================================================================

export type SoundEffect =
  | 'click'
  | 'hover'
  | 'correct'
  | 'wrong'
  | 'tick'
  | 'countdown'
  | 'gameStart'
  | 'victory'
  | 'defeat'
  | 'scoreUp'
  | 'lobbyJoin'
  | 'lobbyLeave'
  | 'transition'
  | 'select'
  | 'timerWarning'
  | 'timerCritical'
  | 'questionReveal'
  | 'navigate'

export interface SoundOptions {
  /** Volume override (0-1), defaults to global volume */
  volume?: number
  /** Playback rate (0.5-2), defaults to 1 */
  rate?: number
}

// ============================================================================
// Sound Manager Singleton
// ============================================================================

class SoundManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private musicGain: GainNode | null = null
  private _volume = 0.5
  private _musicVolume = 0.3
  private _muted = false
  private _musicMuted = false
  private _enabled = true
  private _currentTrack: MusicTrack | null = null
  private _musicTimer: ReturnType<typeof setInterval> | null = null

  // ---- Initialization ----

  /**
   * Lazily initializes AudioContext (must be called after user gesture).
   * Safe to call multiple times.
   */
  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null

    if (!this.ctx || this.ctx.state === 'closed') {
      try {
        this.ctx = new (
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        )()
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.value = this._muted ? 0 : this._volume
        this.masterGain.connect(this.ctx.destination)

        // Separate gain node for music (independent volume control)
        this.musicGain = this.ctx.createGain()
        this.musicGain.gain.value = this._musicMuted ? 0 : this._musicVolume
        this.musicGain.connect(this.ctx.destination)
      } catch {
        logger.warn('Web Audio API not available')
        return null
      }
    }

    // Resume suspended context (happens after tab visibility change)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        /* ignore */
      })
    }

    return this.ctx
  }

  // ---- Volume controls ----

  /** Get current volume (0-1) */
  get volume(): number {
    return this._volume
  }

  /** Set global volume (0-1) */
  set volume(v: number) {
    this._volume = Math.max(0, Math.min(1, v))
    if (this.masterGain) {
      this.masterGain.gain.value = this._muted ? 0 : this._volume
    }
  }

  /** Set volume from percentage (0-100) */
  setVolumePercent(percent: number): void {
    this.volume = percent / 100
  }

  /** Get current muted state */
  get muted(): boolean {
    return this._muted
  }

  /** Toggle mute */
  set muted(m: boolean) {
    this._muted = m
    if (this.masterGain) {
      this.masterGain.gain.value = m ? 0 : this._volume
    }
  }

  /** Enable/disable all sounds */
  get enabled(): boolean {
    return this._enabled
  }

  set enabled(e: boolean) {
    this._enabled = e
  }

  // ---- Core audio primitives ----

  /**
   * Play a sequence of notes using oscillators.
   * This is the building block for all chiptune effects.
   */
  private playNotes(notes: NoteConfig[], options?: SoundOptions): void {
    if (!this._enabled) return

    const ctx = this.ensureContext()
    if (!ctx || !this.masterGain) return

    const volumeScale = options?.volume ?? 1
    const rate = options?.rate ?? 1
    const now = ctx.currentTime

    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = note.type
      osc.frequency.value = note.freq * rate

      const noteVol = (note.vol ?? 0.3) * volumeScale
      const startTime = now + note.delay / 1000
      const endTime = startTime + note.duration / 1000

      // Envelope: quick attack, sustain, quick release
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(noteVol, startTime + 0.01)
      gain.gain.setValueAtTime(noteVol, endTime - 0.02)
      gain.gain.linearRampToValueAtTime(0, endTime)

      osc.connect(gain)
      gain.connect(this.masterGain)

      osc.start(startTime)
      osc.stop(endTime + 0.05)
    }
  }

  /**
   * Play a noise burst (useful for percussion / error sounds).
   */
  private playNoise(duration: number, delay: number, vol: number): void {
    const ctx = this.ensureContext()
    if (!ctx || !this.masterGain) return

    const bufferSize = ctx.sampleRate * (duration / 1000)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const gain = ctx.createGain()
    const startTime = ctx.currentTime + delay / 1000
    const endTime = startTime + duration / 1000

    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, endTime)

    source.connect(gain)
    gain.connect(this.masterGain)

    source.start(startTime)
    source.stop(endTime + 0.05)
  }

  // ---- Public API: play a named sound effect ----

  /**
   * Play a sound effect by name. Effect definitions are loaded from
   * {@link SOUND_EFFECTS} in `soundData.ts`.
   *
   * @example
   * ```ts
   * soundManager.play('correct')
   * soundManager.play('click', { volume: 0.5 })
   * ```
   */
  play(effect: SoundEffect, options?: SoundOptions): void {
    if (!this._enabled || this._muted) return

    const definition: SoundEffectDefinition | undefined = SOUND_EFFECTS[effect]
    if (!definition) return

    this.playNotes(definition.notes, options)
    if (definition.noise) {
      this.playNoise(definition.noise.duration, definition.noise.delay, definition.noise.vol)
    }
  }

  // ---- Music volume controls ----

  /** Get current music volume (0-1) */
  get musicVolume(): number {
    return this._musicVolume
  }

  /** Set music volume (0-1) */
  set musicVolume(v: number) {
    this._musicVolume = Math.max(0, Math.min(1, v))
    if (this.musicGain) {
      this.musicGain.gain.value = this._musicMuted ? 0 : this._musicVolume
    }
  }

  /** Get music muted state */
  get musicMuted(): boolean {
    return this._musicMuted
  }

  /** Toggle music mute */
  set musicMuted(m: boolean) {
    this._musicMuted = m
    if (this.musicGain) {
      this.musicGain.gain.value = m ? 0 : this._musicVolume
    }
  }

  /** Get currently playing track name */
  get currentTrack(): MusicTrack | null {
    return this._currentTrack
  }

  // ---- Background music ----

  /**
   * Play a looping chiptune background music track.
   * Stops any currently playing track first.
   *
   * @example
   * ```ts
   * soundManager.playMusic('menu')
   * soundManager.playMusic('gameplay')
   * soundManager.stopMusic()
   * ```
   */
  playMusic(track: MusicTrack): void {
    if (!this._enabled) return

    // Stop any existing music first
    this.stopMusic()

    const ctx = this.ensureContext()
    if (!ctx || !this.musicGain) return

    this._currentTrack = track
    const pattern = MUSIC_PATTERNS[track]
    if (!pattern) return

    // Schedule the first loop immediately
    this.scheduleLoop(ctx, pattern)

    // Re-schedule the loop at each pattern duration
    this._musicTimer = setInterval(() => {
      if (!this.ctx || this.ctx.state === 'closed') {
        this.stopMusic()
        return
      }
      this.scheduleLoop(this.ctx, pattern)
    }, pattern.loopMs)
  }

  /** Stop the current background music */
  stopMusic(): void {
    if (this._musicTimer) {
      clearInterval(this._musicTimer)
      this._musicTimer = null
    }
    this._currentTrack = null
  }

  /**
   * Schedule one iteration of a music loop pattern.
   */
  private scheduleLoop(ctx: AudioContext, pattern: MusicPattern): void {
    if (!this.musicGain) return

    const now = ctx.currentTime

    for (const note of pattern.notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = note.type
      osc.frequency.value = note.freq

      const noteVol = note.vol ?? 0.08
      const startTime = now + note.delay / 1000
      const endTime = startTime + note.duration / 1000

      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(noteVol, startTime + 0.01)
      gain.gain.setValueAtTime(noteVol, Math.max(startTime + 0.01, endTime - 0.02))
      gain.gain.linearRampToValueAtTime(0, endTime)

      osc.connect(gain)
      gain.connect(this.musicGain)

      osc.start(startTime)
      osc.stop(endTime + 0.05)
    }
  }

  // ---- Cleanup ----

  /**
   * Close the audio context and release resources.
   */
  dispose(): void {
    this.stopMusic()
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {
        /* ignore */
      })
    }
    this.ctx = null
    this.masterGain = null
    this.musicGain = null
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

/** Global sound manager instance */
export const soundManager = new SoundManager()
