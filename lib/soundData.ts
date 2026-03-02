/**
 * Sound Data
 *
 * Static note frequencies, music loop patterns, and sound effect definitions
 * used by the SoundManager. Separated from the engine to keep the audio
 * playback logic focused and data independently testable.
 *
 * @module lib/soundData
 * @since 1.4.0
 */

// ============================================================================
// Types
// ============================================================================

export interface NoteConfig {
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
export interface MusicPattern {
  /** Notes to schedule each loop iteration. */
  notes: NoteConfig[]
  /** Duration of one full loop in milliseconds. */
  loopMs: number
}

/** Available background music tracks */
export type MusicTrack = 'menu' | 'gameplay' | 'results'

/** Definition of a single sound effect as playable data. */
export interface SoundEffectDefinition {
  /** Oscillator notes to play. */
  notes: NoteConfig[]
  /** Optional noise burst (used by the "wrong" effect). */
  noise?: { duration: number; delay: number; vol: number }
}

// ============================================================================
// Musical Note Frequencies
// ============================================================================

/** Musical note frequencies (A4 = 440 Hz). */
export const NOTES: Record<string, number> = {
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

// ============================================================================
// Music Loop Patterns
// ============================================================================

/**
 * Procedurally-defined chiptune loops for each game screen.
 * Notes use frequencies from the NOTES map. Each pattern loops seamlessly.
 */
export const MUSIC_PATTERNS: Record<MusicTrack, MusicPattern> = {
  /**
   * Menu — relaxed, dreamy arpeggio in C-major. Slow tempo keeps it
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
   * Gameplay — upbeat, driving 8-bit loop. Square-wave melody with a
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
   * Results — bright, celebratory fanfare that loops gently. Uses
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
// Sound Effect Definitions
// ============================================================================

/**
 * Data-driven sound effect definitions. Each entry maps a named effect
 * to its oscillator note sequence and optional noise burst.
 */
export const SOUND_EFFECTS: Record<string, SoundEffectDefinition> = {
  click: {
    notes: [{ freq: NOTES.C5, duration: 40, delay: 0, type: 'square', vol: 0.15 }],
  },

  hover: {
    notes: [{ freq: NOTES.E5, duration: 30, delay: 0, type: 'square', vol: 0.06 }],
  },

  select: {
    notes: [
      { freq: NOTES.C5, duration: 50, delay: 0, type: 'square', vol: 0.15 },
      { freq: NOTES.E5, duration: 50, delay: 50, type: 'square', vol: 0.15 },
    ],
  },

  navigate: {
    notes: [
      { freq: NOTES.E4, duration: 60, delay: 0, type: 'square', vol: 0.12 },
      { freq: NOTES.G4, duration: 60, delay: 60, type: 'square', vol: 0.12 },
      { freq: NOTES.C5, duration: 80, delay: 120, type: 'square', vol: 0.15 },
    ],
  },

  correct: {
    notes: [
      { freq: NOTES.C5, duration: 80, delay: 0, type: 'square', vol: 0.2 },
      { freq: NOTES.E5, duration: 80, delay: 80, type: 'square', vol: 0.2 },
      { freq: NOTES.G5, duration: 120, delay: 160, type: 'square', vol: 0.25 },
      { freq: NOTES.C6, duration: 200, delay: 240, type: 'square', vol: 0.2 },
    ],
  },

  wrong: {
    notes: [
      { freq: NOTES.E4, duration: 120, delay: 0, type: 'sawtooth', vol: 0.2 },
      { freq: NOTES.C3, duration: 250, delay: 80, type: 'sawtooth', vol: 0.25 },
    ],
    noise: { duration: 100, delay: 0, vol: 0.08 },
  },

  tick: {
    notes: [{ freq: NOTES.A5, duration: 15, delay: 0, type: 'square', vol: 0.05 }],
  },

  countdown: {
    notes: [{ freq: NOTES.A4, duration: 100, delay: 0, type: 'square', vol: 0.2 }],
  },

  timerWarning: {
    notes: [
      { freq: NOTES.A4, duration: 100, delay: 0, type: 'square', vol: 0.18 },
      { freq: NOTES.A4, duration: 100, delay: 200, type: 'square', vol: 0.18 },
    ],
  },

  timerCritical: {
    notes: [
      { freq: NOTES.A5, duration: 60, delay: 0, type: 'square', vol: 0.22 },
      { freq: NOTES.A5, duration: 60, delay: 120, type: 'square', vol: 0.22 },
      { freq: NOTES.A5, duration: 60, delay: 240, type: 'square', vol: 0.22 },
    ],
  },

  gameStart: {
    notes: [
      { freq: NOTES.C4, duration: 100, delay: 0, type: 'square', vol: 0.2 },
      { freq: NOTES.E4, duration: 100, delay: 100, type: 'square', vol: 0.2 },
      { freq: NOTES.G4, duration: 100, delay: 200, type: 'square', vol: 0.2 },
      { freq: NOTES.C5, duration: 150, delay: 300, type: 'square', vol: 0.25 },
      { freq: NOTES.G4, duration: 80, delay: 450, type: 'square', vol: 0.15 },
      { freq: NOTES.C5, duration: 300, delay: 530, type: 'square', vol: 0.3 },
    ],
  },

  victory: {
    notes: [
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
  },

  defeat: {
    notes: [
      { freq: NOTES.E4, duration: 200, delay: 0, type: 'triangle', vol: 0.2 },
      { freq: NOTES.D4, duration: 200, delay: 200, type: 'triangle', vol: 0.2 },
      { freq: NOTES.C4, duration: 200, delay: 400, type: 'triangle', vol: 0.18 },
      { freq: NOTES.C3, duration: 400, delay: 600, type: 'triangle', vol: 0.15 },
    ],
  },

  scoreUp: {
    notes: [
      { freq: NOTES.E5, duration: 60, delay: 0, type: 'square', vol: 0.18 },
      { freq: NOTES.B5, duration: 120, delay: 60, type: 'square', vol: 0.2 },
    ],
  },

  lobbyJoin: {
    notes: [
      { freq: NOTES.C5, duration: 80, delay: 0, type: 'triangle', vol: 0.15 },
      { freq: NOTES.G5, duration: 120, delay: 80, type: 'triangle', vol: 0.18 },
    ],
  },

  lobbyLeave: {
    notes: [
      { freq: NOTES.G4, duration: 80, delay: 0, type: 'triangle', vol: 0.12 },
      { freq: NOTES.C4, duration: 120, delay: 80, type: 'triangle', vol: 0.1 },
    ],
  },

  transition: {
    notes: [
      { freq: NOTES.C4, duration: 50, delay: 0, type: 'sawtooth', vol: 0.08 },
      { freq: NOTES.G4, duration: 50, delay: 30, type: 'sawtooth', vol: 0.1 },
      { freq: NOTES.C5, duration: 50, delay: 60, type: 'sawtooth', vol: 0.08 },
      { freq: NOTES.G5, duration: 80, delay: 90, type: 'sawtooth', vol: 0.06 },
    ],
  },

  questionReveal: {
    notes: [
      { freq: NOTES.C4, duration: 80, delay: 0, type: 'square', vol: 0.15 },
      { freq: NOTES.G4, duration: 80, delay: 80, type: 'square', vol: 0.15 },
      { freq: NOTES.E5, duration: 150, delay: 160, type: 'square', vol: 0.2 },
    ],
  },
}
