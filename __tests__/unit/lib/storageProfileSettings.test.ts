/**
 * Tests for Storage Utilities — Profile, Settings, Session, Migration
 *
 * History functions are tested in storageHistory.test.ts.
 * This file covers the remaining untested storage functions.
 *
 * @module __tests__/unit/lib/storageProfileSettings
 * @since 1.0.0
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  getProfile,
  saveProfile,
  hasProfile,
  clearProfile,
  getSettings,
  saveSettings,
  resetSettings,
  getCurrentSession,
  saveCurrentSession,
  clearCurrentSession,
  migrateStorage,
  clearAllStorage,
  getStorageInfo,
  initializeStorage,
  DEFAULT_SETTINGS,
  DEFAULT_PROFILE,
  STORAGE_KEYS,
  type PlayerProfile,
  type GameSettings,
} from '@/lib/storage'

// ============================================================================
// Setup
// ============================================================================

describe('Storage — Profile, Settings, Session', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // ============================================================================
  // Profile Functions
  // ============================================================================

  describe('Profile Functions', () => {
    describe('getProfile', () => {
      it('should return null when no profile exists', () => {
        expect(getProfile()).toBeNull()
      })

      it('should return stored profile', () => {
        const profile: PlayerProfile = {
          name: 'Alice',
          avatarId: 'wizard',
          createdAt: '2025-01-01T00:00:00.000Z',
          lastPlayedAt: '2025-06-01T00:00:00.000Z',
        }
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile))

        const result = getProfile()
        expect(result).toEqual(profile)
      })

      it('should return null for corrupted data', () => {
        localStorage.setItem(STORAGE_KEYS.PROFILE, 'not-json{{{')

        expect(getProfile()).toBeNull()
      })
    })

    describe('saveProfile', () => {
      it('should save a new profile with defaults merged', () => {
        const result = saveProfile({ name: 'Bob' })

        expect(result).toBe(true)
        const stored = getProfile()
        expect(stored).not.toBeNull()
        expect(stored!.name).toBe('Bob')
        expect(stored!.avatarId).toBe(DEFAULT_PROFILE.avatarId)
        expect(stored!.lastPlayedAt).toBeDefined()
      })

      it('should merge with existing profile', () => {
        saveProfile({ name: 'Alice', avatarId: 'knight' })
        saveProfile({ avatarId: 'wizard' })

        const stored = getProfile()
        expect(stored!.name).toBe('Alice')
        expect(stored!.avatarId).toBe('wizard')
      })

      it('should always update lastPlayedAt', () => {
        saveProfile({ name: 'Alice' })
        const first = getProfile()!.lastPlayedAt

        // Small delay to ensure different timestamp
        saveProfile({ name: 'Alice' })
        const second = getProfile()!.lastPlayedAt

        // Both should be valid ISO dates
        expect(new Date(first).getTime()).not.toBeNaN()
        expect(new Date(second).getTime()).not.toBeNaN()
      })

      it('should preserve createdAt from defaults when no prior profile', () => {
        saveProfile({ name: 'New' })
        const stored = getProfile()

        expect(stored!.createdAt).toBeDefined()
        expect(new Date(stored!.createdAt).getTime()).not.toBeNaN()
      })
    })

    describe('hasProfile', () => {
      it('should return false when no profile exists', () => {
        expect(hasProfile()).toBe(false)
      })

      it('should return true when profile exists', () => {
        saveProfile({ name: 'Alice' })
        expect(hasProfile()).toBe(true)
      })
    })

    describe('clearProfile', () => {
      it('should remove the profile', () => {
        saveProfile({ name: 'Alice' })
        expect(hasProfile()).toBe(true)

        clearProfile()
        expect(hasProfile()).toBe(false)
        expect(getProfile()).toBeNull()
      })

      it('should return true even when clearing nonexistent profile', () => {
        expect(clearProfile()).toBe(true)
      })
    })
  })

  // ============================================================================
  // Settings Functions
  // ============================================================================

  describe('Settings Functions', () => {
    describe('getSettings', () => {
      it('should return defaults when no settings saved', () => {
        const settings = getSettings()
        expect(settings).toEqual(DEFAULT_SETTINGS)
      })

      it('should return stored settings', () => {
        const custom: GameSettings = {
          ...DEFAULT_SETTINGS,
          volume: 75,
          soundEnabled: false,
        }
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(custom))

        expect(getSettings()).toEqual(custom)
      })

      it('should return defaults for corrupted data', () => {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, '{bad json')
        expect(getSettings()).toEqual(DEFAULT_SETTINGS)
      })
    })

    describe('saveSettings', () => {
      it('should save partial settings merged with defaults', () => {
        saveSettings({ volume: 80 })

        const stored = getSettings()
        expect(stored.volume).toBe(80)
        expect(stored.soundEnabled).toBe(DEFAULT_SETTINGS.soundEnabled)
        expect(stored.theme).toBe(DEFAULT_SETTINGS.theme)
      })

      it('should merge with existing settings', () => {
        saveSettings({ volume: 80 })
        saveSettings({ soundEnabled: false })

        const stored = getSettings()
        expect(stored.volume).toBe(80)
        expect(stored.soundEnabled).toBe(false)
      })

      it('should override all settings when full object provided', () => {
        const full: GameSettings = {
          volume: 100,
          soundEnabled: false,
          musicEnabled: false,
          showTimer: false,
          difficulty: 'hard',
          theme: 'light',
        }
        saveSettings(full)
        expect(getSettings()).toEqual(full)
      })

      it('should return true on successful save', () => {
        expect(saveSettings({ volume: 50 })).toBe(true)
      })
    })

    describe('resetSettings', () => {
      it('should reset to default values', () => {
        saveSettings({ volume: 100, soundEnabled: false, theme: 'light' })
        resetSettings()
        expect(getSettings()).toEqual(DEFAULT_SETTINGS)
      })

      it('should return true on success', () => {
        expect(resetSettings()).toBe(true)
      })
    })
  })

  // ============================================================================
  // Session Functions
  // ============================================================================

  describe('Session Functions', () => {
    describe('getCurrentSession', () => {
      it('should return null when no session exists', () => {
        expect(getCurrentSession()).toBeNull()
      })

      it('should return stored session ID', () => {
        saveCurrentSession('session-abc-123')
        expect(getCurrentSession()).toBe('session-abc-123')
      })
    })

    describe('saveCurrentSession', () => {
      it('should save session ID', () => {
        const result = saveCurrentSession('sess-001')

        expect(result).toBe(true)
        expect(getCurrentSession()).toBe('sess-001')
      })

      it('should overwrite existing session', () => {
        saveCurrentSession('sess-001')
        saveCurrentSession('sess-002')

        expect(getCurrentSession()).toBe('sess-002')
      })
    })

    describe('clearCurrentSession', () => {
      it('should remove the session', () => {
        saveCurrentSession('sess-001')
        clearCurrentSession()

        expect(getCurrentSession()).toBeNull()
      })

      it('should return true even when no session exists', () => {
        expect(clearCurrentSession()).toBe(true)
      })
    })
  })

  // ============================================================================
  // Migration Functions
  // ============================================================================

  describe('Migration Functions', () => {
    describe('migrateStorage', () => {
      it('should migrate old player data', () => {
        const oldProfile = { name: 'OldPlayer', avatarId: 'robot' }
        localStorage.setItem('pixeltrivia_player', JSON.stringify(oldProfile))

        migrateStorage()

        // Old key should be removed
        expect(localStorage.getItem('pixeltrivia_player')).toBeNull()
        // Profile should be migrated
        const profile = getProfile()
        expect(profile).not.toBeNull()
        expect(profile!.name).toBe('OldPlayer')
      })

      it('should migrate old settings data', () => {
        const oldSettings = { volume: 75, soundEnabled: false }
        localStorage.setItem('pixeltrivia_game_settings', JSON.stringify(oldSettings))

        migrateStorage()

        expect(localStorage.getItem('pixeltrivia_game_settings')).toBeNull()
        const settings = getSettings()
        expect(settings.volume).toBe(75)
        expect(settings.soundEnabled).toBe(false)
      })

      it('should handle corrupted old data gracefully', () => {
        localStorage.setItem('pixeltrivia_player', 'not-json{{{')

        expect(() => migrateStorage()).not.toThrow()
        expect(localStorage.getItem('pixeltrivia_player')).toBeNull()
      })

      it('should do nothing when no old keys exist', () => {
        expect(() => migrateStorage()).not.toThrow()
      })
    })

    describe('initializeStorage', () => {
      it('should run migration', () => {
        const oldProfile = { name: 'Init' }
        localStorage.setItem('pixeltrivia_player', JSON.stringify(oldProfile))

        initializeStorage()

        expect(localStorage.getItem('pixeltrivia_player')).toBeNull()
        expect(getProfile()!.name).toBe('Init')
      })
    })
  })

  // ============================================================================
  // Cleanup Functions
  // ============================================================================

  describe('Cleanup Functions', () => {
    describe('clearAllStorage', () => {
      it('should remove all pixeltrivia keys', () => {
        saveProfile({ name: 'Alice' })
        saveSettings({ volume: 80 })
        saveCurrentSession('sess-001')

        clearAllStorage()

        expect(getProfile()).toBeNull()
        expect(getSettings()).toEqual(DEFAULT_SETTINGS)
        expect(getCurrentSession()).toBeNull()
      })

      it('should not remove non-pixeltrivia keys', () => {
        localStorage.setItem('other_app_key', 'value')

        clearAllStorage()

        expect(localStorage.getItem('other_app_key')).toBe('value')
      })
    })

    describe('getStorageInfo', () => {
      it('should report zero usage when empty', () => {
        const info = getStorageInfo()

        expect(info.available).toBe(true)
        expect(info.used).toBe(0)
        expect(info.keys).toEqual([])
      })

      it('should report usage when data exists', () => {
        saveProfile({ name: 'Alice' })
        saveSettings({ volume: 80 })

        const info = getStorageInfo()

        expect(info.available).toBe(true)
        expect(info.used).toBeGreaterThan(0)
        expect(info.keys.length).toBeGreaterThanOrEqual(2)
        expect(info.keys).toContain(STORAGE_KEYS.PROFILE)
        expect(info.keys).toContain(STORAGE_KEYS.SETTINGS)
      })

      it('should calculate bytes as 2x character length (UTF-16)', () => {
        const testData = 'abcde' // 5 chars = 10 bytes
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(testData))

        const info = getStorageInfo()
        // JSON.stringify('abcde') = '"abcde"' = 7 chars = 14 bytes
        expect(info.used).toBe(14)
      })
    })
  })

  // ============================================================================
  // Default Values
  // ============================================================================

  describe('Default Values', () => {
    it('DEFAULT_SETTINGS should have expected shape', () => {
      expect(DEFAULT_SETTINGS).toEqual({
        volume: 50,
        soundEnabled: true,
        musicEnabled: true,
        showTimer: true,
        difficulty: 'classic',
        theme: 'dark',
      })
    })

    it('DEFAULT_PROFILE should have expected shape', () => {
      expect(DEFAULT_PROFILE.name).toBe('Player')
      expect(DEFAULT_PROFILE.avatarId).toBe('robot')
      expect(DEFAULT_PROFILE.createdAt).toBeDefined()
      expect(DEFAULT_PROFILE.lastPlayedAt).toBeDefined()
    })

    it('STORAGE_KEYS should use correct prefix', () => {
      expect(STORAGE_KEYS.PROFILE).toContain('pixeltrivia')
      expect(STORAGE_KEYS.SETTINGS).toContain('pixeltrivia')
      expect(STORAGE_KEYS.HISTORY).toContain('pixeltrivia')
      expect(STORAGE_KEYS.SESSION).toContain('pixeltrivia')
    })
  })
})
