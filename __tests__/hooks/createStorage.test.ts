/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * Tests for createStorage utility from useLocalStorage
 *
 * @module __tests__/hooks/createStorage
 * @since 1.0.0
 */

import { createStorage } from '@/hooks/useLocalStorage'

describe('createStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // ============================================================================
  // Basic Operations
  // ============================================================================

  describe('get', () => {
    it('should return initial value when nothing stored', () => {
      const storage = createStorage('test', 1, { count: 0 })

      expect(storage.get()).toEqual({ count: 0 })
    })

    it('should return stored value', () => {
      const storage = createStorage('test', 1, { count: 0 })
      storage.set({ count: 5 })

      expect(storage.get()).toEqual({ count: 5 })
    })

    it('should return initial value for corrupted storage', () => {
      localStorage.setItem('pixeltrivia_v1_test', '{bad json')
      const storage = createStorage('test', 1, 'default')

      expect(storage.get()).toBe('default')
    })
  })

  describe('set', () => {
    it('should store value in localStorage', () => {
      const storage = createStorage('settings', 1, { volume: 50 })
      storage.set({ volume: 80 })

      const raw = localStorage.getItem('pixeltrivia_v1_settings')
      expect(JSON.parse(raw ?? '{}')).toEqual({ volume: 80 })
    })

    it('should overwrite previous value', () => {
      const storage = createStorage('val', 1, 0)
      storage.set(10)
      storage.set(20)

      expect(storage.get()).toBe(20)
    })

    it('should handle complex objects', () => {
      const storage = createStorage('complex', 1, {} as Record<string, unknown>)
      storage.set({ nested: { deep: true }, arr: [1, 2, 3] })

      expect(storage.get()).toEqual({ nested: { deep: true }, arr: [1, 2, 3] })
    })
  })

  describe('remove', () => {
    it('should remove value from localStorage', () => {
      const storage = createStorage('temp', 1, 'default')
      storage.set('stored')
      storage.remove()

      expect(localStorage.getItem('pixeltrivia_v1_temp')).toBeNull()
    })

    it('should cause get() to return initial value after remove', () => {
      const storage = createStorage('temp', 1, 'default')
      storage.set('stored')
      storage.remove()

      expect(storage.get()).toBe('default')
    })
  })

  describe('exists', () => {
    it('should return false when nothing stored', () => {
      const storage = createStorage('check', 1, null)

      expect(storage.exists()).toBe(false)
    })

    it('should return true when value is stored', () => {
      const storage = createStorage('check', 1, null)
      storage.set('something' as unknown as null)

      expect(storage.exists()).toBe(true)
    })

    it('should return false after removal', () => {
      const storage = createStorage('check', 1, null)
      storage.set('something' as unknown as null)
      storage.remove()

      expect(storage.exists()).toBe(false)
    })
  })

  // ============================================================================
  // Versioning
  // ============================================================================

  describe('versioning', () => {
    it('should use versioned key format', () => {
      const storage = createStorage('mykey', 2, 'val')
      storage.set('val2')

      expect(localStorage.getItem('pixeltrivia_v2_mykey')).toBe(JSON.stringify('val2'))
    })

    it('should not find v1 data when looking for v2', () => {
      localStorage.setItem('pixeltrivia_v1_data', JSON.stringify('old'))
      const storage = createStorage('data', 2, 'default')

      // Without a migration function, old version is ignored
      expect(storage.get()).toBe('default')
    })
  })

  // ============================================================================
  // Migration
  // ============================================================================

  describe('migration', () => {
    it('should migrate from old version when migration function provided', () => {
      // Simulate v1 data
      localStorage.setItem('pixeltrivia_v1_settings', JSON.stringify({ volume: 60 }))

      // Create v2 storage with migration
      const storage = createStorage(
        'settings',
        2,
        { volume: 50, theme: 'dark' },
        (oldValue: unknown, _oldVersion: number) => {
          const old = oldValue as { volume?: number }
          return { volume: old.volume ?? 50, theme: 'dark' }
        }
      )

      const result = storage.get()
      expect(result).toEqual({ volume: 60, theme: 'dark' })
    })

    it('should remove old version key after migration', () => {
      localStorage.setItem('pixeltrivia_v1_data', JSON.stringify('old'))

      const storage = createStorage('data', 2, 'default', old => `migrated-${old}`)
      storage.get()

      expect(localStorage.getItem('pixeltrivia_v1_data')).toBeNull()
    })

    it('should save migrated value under new version key', () => {
      localStorage.setItem('pixeltrivia_v1_data', JSON.stringify('old'))

      const storage = createStorage('data', 2, 'default', old => `migrated-${old}`)
      storage.get()

      expect(localStorage.getItem('pixeltrivia_v2_data')).toBe(JSON.stringify('migrated-old'))
    })

    it('should not migrate when current version data exists', () => {
      // Both v1 and v2 exist
      localStorage.setItem('pixeltrivia_v1_data', JSON.stringify('old'))
      localStorage.setItem('pixeltrivia_v2_data', JSON.stringify('current'))

      const storage = createStorage('data', 2, 'default', () => 'should-not-use')

      expect(storage.get()).toBe('current')
      // v1 should still exist (not cleaned up since v2 was found first)
      expect(localStorage.getItem('pixeltrivia_v1_data')).toBe(JSON.stringify('old'))
    })

    it('should try multiple previous versions during migration', () => {
      // Only v1 exists, but storage is now at v3
      localStorage.setItem('pixeltrivia_v1_data', JSON.stringify('v1data'))

      const storage = createStorage('data', 3, 'default', (old, version) => {
        return `migrated-from-v${version}-${old}`
      })

      const result = storage.get()
      expect(result).toBe('migrated-from-v1-v1data')
    })
  })

  // ============================================================================
  // Type Safety
  // ============================================================================

  describe('type safety', () => {
    it('should work with number types', () => {
      const storage = createStorage<number>('num', 1, 0)
      storage.set(42)
      expect(storage.get()).toBe(42)
    })

    it('should work with boolean types', () => {
      const storage = createStorage<boolean>('flag', 1, false)
      storage.set(true)
      expect(storage.get()).toBe(true)
    })

    it('should work with array types', () => {
      const storage = createStorage<string[]>('tags', 1, [])
      storage.set(['a', 'b', 'c'])
      expect(storage.get()).toEqual(['a', 'b', 'c'])
    })

    it('should work with null values', () => {
      const storage = createStorage<string | null>('nullable', 1, null)
      storage.set('value')
      expect(storage.get()).toBe('value')
      storage.set(null)
      expect(storage.get()).toBeNull()
    })
  })
})
