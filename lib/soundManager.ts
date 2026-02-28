/**
 * Sound Manager
 *
 * Web Audio API based sound engine for 8-bit chiptune sound effects
 * and procedural background music loops.
 * All sounds are generated programmatically — no audio files needed.
 *
 * @module lib/soundManager
 * @since 1.1.0
 */

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

/** Available background music tracks */
export type MusicTrack = 'menu' | 'gameplay' | 'results'

export interface SoundOptions {
  /** Volume override (0-1), defaults to global volume */
  volume?: number
  /** Playback rate (0.5-2), defaults to 1 */
  rate?: number
}

// ============================================================================
// Oscillator note helpers
// ============================================================================

/** Musical note frequencies (A4 = 440Hz) */
const NOTES: Record<string, number> = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  B5: 987.77,
  C6: 1046.5,
}

interface NoteConfig {
  freq: number
  duration: number
  delay: number
  type: OscillatorType
  vol?: number
}

/**
 * Defines a looping music pattern: a set of notes that repeat every `loopMs`
 * milliseconds.
 */
interface MusicPattern {
  /** Notes to schedule each loop iteration. */
  notes: NoteConfig[]
  /** Duration of one full loop in milliseconds. */
  loopMs: number
}

/**
 * Procedurally-defined chiptune loops for each game screen.
 *
 * Notes use frequencies from the `NOTE` map above. Each pattern is designed to
 * loop seamlessly.
 */
const MUSIC_PATTERNS: Record<MusicTrack, MusicPattern> = {
  /**
   * Menu — relaxed, dreamy arpeggio in C-major.  Slow tempo keeps it
   * unobtrusive while players browse.
   */
  menu: {
    loopMs: 4000,
    notes: [
      { freq: NOTES.C4, duration: 300, delay: 0, type: 'triangle', vol: 0.07 },
      { freq: NOTES.E4, duration: 300, delay: 500, type: 'triangle', vol: 0.06 },
      { freq: NOTES.G4, duration: 300, delay: 1000, type: 'triangle', vol: 0.06 },
      { freq: NOTES.C5, duration: 400, delay: 1500, type: 'triangle', vol: 0.05 },
      { freq: NOTES.G4, duration: 300, delay: 2000, type: 'triangle', vol: 0.06 },
      { freq: NOTES.E4, duration: 300, delay: 2500, type: 'triangle', vol: 0.06 },
      { freq: NOTES.C4, duration: 400, delay: 3000, type: 'triangle', vol: 0.07 },
      // subtle bass pulse
      { freq: NOTES.C3, duration: 200, delay: 0, type: 'sine', vol: 0.04 },
      { freq: NOTES.C3, duration: 200, delay: 2000, type: 'sine', vol: 0.04 },
    ],
  },

  /**
   * Gameplay — upbeat, driving 8-bit loop.  Square-wave melody with a
   * steady bass-line to keep energy high during questions.
   */
  gameplay: {
    loopMs: 2000,
    notes: [
      // melody
      { freq: NOTES.E5, duration: 150, delay: 0, type: 'square', vol: 0.06 },
      { freq: NOTES.G5, duration: 150, delay: 250, type: 'square', vol: 0.06 },
      { freq: NOTES.A5, duration: 150, delay: 500, type: 'square', vol: 0.06 },
      { freq: NOTES.G5, duration: 150, delay: 750, type: 'square', vol: 0.05 },
      { freq: NOTES.E5, duration: 200, delay: 1000, type: 'square', vol: 0.06 },
      { freq: NOTES.D5, duration: 150, delay: 1250, type: 'square', vol: 0.05 },
      { freq: NOTES.C5, duration: 200, delay: 1500, type: 'square', vol: 0.06 },
      { freq: NOTES.D5, duration: 150, delay: 1750, type: 'square', vol: 0.05 },
      // bass
      { freq: NOTES.C3, duration: 120, delay: 0, type: 'triangle', vol: 0.05 },
      { freq: NOTES.C3, duration: 120, delay: 500, type: 'triangle', vol: 0.05 },
      { freq: NOTES.G3, duration: 120, delay: 1000, type: 'triangle', vol: 0.05 },
      { freq: NOTES.G3, duration: 120, delay: 1500, type: 'triangle', vol: 0.05 },
    ],
  },

  /**
   * Results — bright, celebratory fanfare that loops gently.  Uses
   * triangle waves for a warm, resolved feel.
   */
  results: {
    loopMs: 3000,
    notes: [
      { freq: NOTES.C5, duration: 250, delay: 0, type: 'triangle', vol: 0.07 },
      { freq: NOTES.E5, duration: 250, delay: 300, type: 'triangle', vol: 0.07 },
      { freq: NOTES.G5, duration: 350, delay: 600, type: 'triangle', vol: 0.07 },
      { freq: NOTES.C6, duration: 500, delay: 1000, type: 'triangle', vol: 0.06 },
      { freq: NOTES.G5, duration: 250, delay: 1600, type: 'triangle', vol: 0.06 },
      { freq: NOTES.E5, duration: 250, delay: 1900, type: 'triangle', vol: 0.06 },
      { freq: NOTES.C5, duration: 400, delay: 2200, type: 'triangle', vol: 0.07 },
      // bass accents
      { freq: NOTES.C3, duration: 200, delay: 0, type: 'sine', vol: 0.04 },
      { freq: NOTES.G3, duration: 200, delay: 1000, type: 'sine', vol: 0.04 },
      { freq: NOTES.C3, duration: 200, delay: 2200, type: 'sine', vol: 0.04 },
    ],
  },
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
        console.warn('[SoundManager] Web Audio API not available')
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
   * Play a sound effect by name.
   *
   * @example
   * ```ts
   * soundManager.play('correct')
   * soundManager.play('click', { volume: 0.5 })
   * ```
   */
  play(effect: SoundEffect, options?: SoundOptions): void {
    if (!this._enabled || this._muted) return

    const handler = this.effects[effect]
    if (handler) {
      handler(options)
    }
  }

  // ---- Sound Effect Definitions ----

  private effects: Record<SoundEffect, (options?: SoundOptions) => void> = {
    click: opts => {
      this.playNotes([{ freq: NOTES.C5, duration: 40, delay: 0, type: 'square', vol: 0.15 }], opts)
    },

    hover: opts => {
      this.playNotes([{ freq: NOTES.E5, duration: 30, delay: 0, type: 'square', vol: 0.06 }], opts)
    },

    select: opts => {
      this.playNotes(
        [
          { freq: NOTES.C5, duration: 50, delay: 0, type: 'square', vol: 0.15 },
          { freq: NOTES.E5, duration: 50, delay: 50, type: 'square', vol: 0.15 },
        ],
        opts
      )
    },

    navigate: opts => {
      this.playNotes(
        [
          { freq: NOTES.E4, duration: 60, delay: 0, type: 'square', vol: 0.12 },
          { freq: NOTES.G4, duration: 60, delay: 60, type: 'square', vol: 0.12 },
          { freq: NOTES.C5, duration: 80, delay: 120, type: 'square', vol: 0.15 },
        ],
        opts
      )
    },

    correct: opts => {
      // Cheerful ascending arpeggio
      this.playNotes(
        [
          { freq: NOTES.C5, duration: 80, delay: 0, type: 'square', vol: 0.2 },
          { freq: NOTES.E5, duration: 80, delay: 80, type: 'square', vol: 0.2 },
          { freq: NOTES.G5, duration: 120, delay: 160, type: 'square', vol: 0.25 },
          { freq: NOTES.C6, duration: 200, delay: 240, type: 'square', vol: 0.2 },
        ],
        opts
      )
    },

    wrong: opts => {
      // Descending minor + noise
      this.playNotes(
        [
          { freq: NOTES.E4, duration: 120, delay: 0, type: 'sawtooth', vol: 0.2 },
          { freq: NOTES.C3, duration: 250, delay: 80, type: 'sawtooth', vol: 0.25 },
        ],
        opts
      )
      this.playNoise(100, 0, 0.08)
    },

    tick: opts => {
      this.playNotes([{ freq: NOTES.A5, duration: 15, delay: 0, type: 'square', vol: 0.05 }], opts)
    },

    countdown: opts => {
      // Beep getting higher
      this.playNotes([{ freq: NOTES.A4, duration: 100, delay: 0, type: 'square', vol: 0.2 }], opts)
    },

    timerWarning: opts => {
      this.playNotes(
        [
          { freq: NOTES.A4, duration: 100, delay: 0, type: 'square', vol: 0.18 },
          { freq: NOTES.A4, duration: 100, delay: 200, type: 'square', vol: 0.18 },
        ],
        opts
      )
    },

    timerCritical: opts => {
      this.playNotes(
        [
          { freq: NOTES.A5, duration: 60, delay: 0, type: 'square', vol: 0.22 },
          { freq: NOTES.A5, duration: 60, delay: 120, type: 'square', vol: 0.22 },
          { freq: NOTES.A5, duration: 60, delay: 240, type: 'square', vol: 0.22 },
        ],
        opts
      )
    },

    gameStart: opts => {
      // Triumphant fanfare
      this.playNotes(
        [
          { freq: NOTES.C4, duration: 100, delay: 0, type: 'square', vol: 0.2 },
          { freq: NOTES.E4, duration: 100, delay: 100, type: 'square', vol: 0.2 },
          { freq: NOTES.G4, duration: 100, delay: 200, type: 'square', vol: 0.2 },
          { freq: NOTES.C5, duration: 150, delay: 300, type: 'square', vol: 0.25 },
          { freq: NOTES.G4, duration: 80, delay: 450, type: 'square', vol: 0.15 },
          { freq: NOTES.C5, duration: 300, delay: 530, type: 'square', vol: 0.3 },
        ],
        opts
      )
    },

    victory: opts => {
      // Full victory fanfare with harmony
      this.playNotes(
        [
          { freq: NOTES.C4, duration: 100, delay: 0, type: 'square', vol: 0.2 },
          { freq: NOTES.E4, duration: 100, delay: 0, type: 'triangle', vol: 0.1 },
          { freq: NOTES.E4, duration: 100, delay: 100, type: 'square', vol: 0.2 },
          { freq: NOTES.G4, duration: 100, delay: 100, type: 'triangle', vol: 0.1 },
          { freq: NOTES.G4, duration: 100, delay: 200, type: 'square', vol: 0.2 },
          { freq: NOTES.C5, duration: 150, delay: 300, type: 'square', vol: 0.25 },
          { freq: NOTES.E5, duration: 150, delay: 300, type: 'triangle', vol: 0.12 },
          { freq: NOTES.E5, duration: 100, delay: 500, type: 'square', vol: 0.2 },
          { freq: NOTES.G5, duration: 100, delay: 600, type: 'square', vol: 0.2 },
          { freq: NOTES.C6, duration: 400, delay: 700, type: 'square', vol: 0.3 },
          { freq: NOTES.E5, duration: 400, delay: 700, type: 'triangle', vol: 0.15 },
        ],
        opts
      )
    },

    defeat: opts => {
      // Sad descending melody
      this.playNotes(
        [
          { freq: NOTES.E4, duration: 200, delay: 0, type: 'triangle', vol: 0.2 },
          { freq: NOTES.D4, duration: 200, delay: 200, type: 'triangle', vol: 0.2 },
          { freq: NOTES.C4, duration: 200, delay: 400, type: 'triangle', vol: 0.18 },
          { freq: NOTES.C3, duration: 400, delay: 600, type: 'triangle', vol: 0.15 },
        ],
        opts
      )
    },

    scoreUp: opts => {
      // Quick coin-collect jingle
      this.playNotes(
        [
          { freq: NOTES.E5, duration: 60, delay: 0, type: 'square', vol: 0.18 },
          { freq: NOTES.B5, duration: 120, delay: 60, type: 'square', vol: 0.2 },
        ],
        opts
      )
    },

    lobbyJoin: opts => {
      // Welcoming chime
      this.playNotes(
        [
          { freq: NOTES.C5, duration: 80, delay: 0, type: 'triangle', vol: 0.15 },
          { freq: NOTES.G5, duration: 120, delay: 80, type: 'triangle', vol: 0.18 },
        ],
        opts
      )
    },

    lobbyLeave: opts => {
      // Soft descending note
      this.playNotes(
        [
          { freq: NOTES.G4, duration: 80, delay: 0, type: 'triangle', vol: 0.12 },
          { freq: NOTES.C4, duration: 120, delay: 80, type: 'triangle', vol: 0.1 },
        ],
        opts
      )
    },

    transition: opts => {
      // Whoosh sweep
      this.playNotes(
        [
          { freq: NOTES.C4, duration: 50, delay: 0, type: 'sawtooth', vol: 0.08 },
          { freq: NOTES.G4, duration: 50, delay: 30, type: 'sawtooth', vol: 0.1 },
          { freq: NOTES.C5, duration: 50, delay: 60, type: 'sawtooth', vol: 0.08 },
          { freq: NOTES.G5, duration: 80, delay: 90, type: 'sawtooth', vol: 0.06 },
        ],
        opts
      )
    },

    questionReveal: opts => {
      // Dramatic reveal
      this.playNotes(
        [
          { freq: NOTES.C4, duration: 80, delay: 0, type: 'square', vol: 0.15 },
          { freq: NOTES.G4, duration: 80, delay: 80, type: 'square', vol: 0.15 },
          { freq: NOTES.E5, duration: 150, delay: 160, type: 'square', vol: 0.2 },
        ],
        opts
      )
    },
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
