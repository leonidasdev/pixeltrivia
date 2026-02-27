/**
 * useLocalStorage Hook
 *
 * Provides typed access to localStorage with automatic JSON serialization.
 *
 * @module hooks/useLocalStorage
 * @since 1.0.0
 */

import { useState, useCallback, useEffect } from 'react'

/**
 * Options for the useLocalStorage hook
 */
export interface UseLocalStorageOptions<T> {
  /** Custom serializer function */
  serializer?: (value: T) => string
  /** Custom deserializer function */
  deserializer?: (value: string) => T
  /** Whether to sync across tabs */
  syncTabs?: boolean
}

/**
 * Return type of the useLocalStorage hook
 */
export type UseLocalStorageReturn<T> = [
  /** Current value */
  T,
  /** Set value function */
  (value: T | ((prev: T) => T)) => void,
  /** Remove value function */
  () => void,
]

/**
 * Custom hook for typed localStorage access with React state sync
 *
 * @template T - Type of the stored value
 * @param key - Storage key
 * @param initialValue - Initial/default value
 * @param options - Optional configuration
 * @returns Tuple of [value, setValue, removeValue]
 *
 * @example
 * ```tsx
 * // Simple usage
 * const [name, setName, removeName] = useLocalStorage('user_name', 'Guest')
 *
 * // With object
 * const [settings, setSettings] = useLocalStorage('settings', {
 *   volume: 50,
 *   theme: 'dark'
 * })
 *
 * // Update settings
 * setSettings(prev => ({ ...prev, volume: 75 }))
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const { serializer = JSON.stringify, deserializer = JSON.parse, syncTabs = true } = options

  /**
   * Get stored value from localStorage
   */
  const getStoredValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? deserializer(item) : initialValue
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }, [key, initialValue, deserializer])

  const [storedValue, setStoredValue] = useState<T>(getStoredValue)

  /**
   * Set value in state and localStorage
   */
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Delegate to React's functional updater to avoid stale closure issues
        // when setValue is called multiple times before a re-render
        setStoredValue(prev => {
          const valueToStore = value instanceof Function ? value(prev) : value

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, serializer(valueToStore))
          }

          return valueToStore
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, serializer]
  )

  /**
   * Remove value from localStorage
   */
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  /**
   * Sync with other tabs/windows
   */
  useEffect(() => {
    if (!syncTabs || typeof window === 'undefined') {
      return
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(deserializer(event.newValue))
        } catch {
          // Ignore deserialization errors from other tabs
        }
      } else if (event.key === key && event.newValue === null) {
        setStoredValue(initialValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, initialValue, deserializer, syncTabs])

  return [storedValue, setValue, removeValue]
}

/**
 * Type-safe storage wrapper with versioning support
 *
 * @template T - Type of the stored data
 * @param key - Storage key (without prefix)
 * @param version - Schema version for migrations
 * @param initialValue - Default value
 * @param migrate - Optional migration function for old versions
 */
export function createStorage<T>(
  key: string,
  version: number,
  initialValue: T,
  migrate?: (oldValue: unknown, oldVersion: number) => T
) {
  const fullKey = `pixeltrivia_v${version}_${key}`

  return {
    /**
     * Get value from storage
     */
    get(): T {
      if (typeof window === 'undefined') return initialValue

      try {
        const stored = window.localStorage.getItem(fullKey)
        if (stored) {
          return JSON.parse(stored) as T
        }

        // Check for old versions and migrate if needed
        if (migrate) {
          for (let v = version - 1; v >= 1; v--) {
            const oldKey = `pixeltrivia_v${v}_${key}`
            const oldStored = window.localStorage.getItem(oldKey)
            if (oldStored) {
              const migrated = migrate(JSON.parse(oldStored), v)
              // Save migrated value and remove old
              window.localStorage.setItem(fullKey, JSON.stringify(migrated))
              window.localStorage.removeItem(oldKey)
              return migrated
            }
          }
        }

        return initialValue
      } catch {
        return initialValue
      }
    },

    /**
     * Set value in storage
     */
    set(value: T): void {
      if (typeof window === 'undefined') return
      try {
        window.localStorage.setItem(fullKey, JSON.stringify(value))
      } catch {
        // Storage full or unavailable
      }
    },

    /**
     * Remove value from storage
     */
    remove(): void {
      if (typeof window === 'undefined') return
      window.localStorage.removeItem(fullKey)
    },

    /**
     * Check if value exists
     */
    exists(): boolean {
      if (typeof window === 'undefined') return false
      return window.localStorage.getItem(fullKey) !== null
    },
  }
}
