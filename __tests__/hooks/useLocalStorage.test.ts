/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('Initialization', () => {
    it('returns initial value when no stored value exists', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
      expect(result.current[0]).toBe('default')
    })

    it('returns stored value when it exists', () => {
      localStorage.setItem('test-key', JSON.stringify('stored'))
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
      expect(result.current[0]).toBe('stored')
    })

    it('handles stored objects', () => {
      const obj = { name: 'test', score: 42 }
      localStorage.setItem('obj-key', JSON.stringify(obj))
      const { result } = renderHook(() => useLocalStorage('obj-key', { name: '', score: 0 }))
      expect(result.current[0]).toEqual(obj)
    })

    it('handles corrupted storage gracefully', () => {
      localStorage.setItem('bad-key', 'not-valid-json{')
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const { result } = renderHook(() => useLocalStorage('bad-key', 'fallback'))
      expect(result.current[0]).toBe('fallback')

      consoleSpy.mockRestore()
    })
  })

  describe('setValue', () => {
    it('updates state and localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'initial'))

      act(() => {
        result.current[1]('updated')
      })

      expect(result.current[0]).toBe('updated')
      expect(JSON.parse(localStorage.getItem('key') ?? '')).toBe('updated')
    })

    it('supports functional updates', () => {
      const { result } = renderHook(() => useLocalStorage('count', 0))

      act(() => {
        result.current[1](prev => prev + 1)
      })

      expect(result.current[0]).toBe(1)

      act(() => {
        result.current[1](prev => prev + 10)
      })

      expect(result.current[0]).toBe(11)
    })

    it('handles object updates', () => {
      const { result } = renderHook(() =>
        useLocalStorage('settings', { volume: 50, theme: 'dark' })
      )

      act(() => {
        result.current[1](prev => ({ ...prev, volume: 75 }))
      })

      expect(result.current[0]).toEqual({ volume: 75, theme: 'dark' })
    })
  })

  describe('removeValue', () => {
    it('resets to initial value and removes from localStorage', () => {
      localStorage.setItem('key', JSON.stringify('stored'))
      const { result } = renderHook(() => useLocalStorage('key', 'default'))

      act(() => {
        result.current[2]()
      })

      expect(result.current[0]).toBe('default')
      expect(localStorage.getItem('key')).toBeNull()
    })
  })

  describe('Custom serializer', () => {
    it('uses custom serializer/deserializer', () => {
      const { result } = renderHook(() =>
        useLocalStorage('custom', 42, {
          serializer: (v: number) => String(v * 2),
          deserializer: (v: string) => parseInt(v) / 2,
        })
      )

      act(() => {
        result.current[1](100)
      })

      // Serializer doubles the value when storing
      expect(localStorage.getItem('custom')).toBe('200')
      expect(result.current[0]).toBe(100)
    })
  })
})
