/**
 * Tests for useHoveredCard Hook
 */

import { renderHook, act } from '@testing-library/react'
import { useHoveredCard } from '@/hooks/useHoveredCard'

describe('useHoveredCard', () => {
  it('initializes with null hoveredCard', () => {
    const { result } = renderHook(() => useHoveredCard())
    expect(result.current.hoveredCard).toBeNull()
  })

  it('setHoveredCard updates state', () => {
    const { result } = renderHook(() => useHoveredCard())

    act(() => {
      result.current.setHoveredCard('card-1')
    })
    expect(result.current.hoveredCard).toBe('card-1')

    act(() => {
      result.current.setHoveredCard(null)
    })
    expect(result.current.hoveredCard).toBeNull()
  })

  describe('getHoverHandlers', () => {
    it('returns all four handler functions', () => {
      const { result } = renderHook(() => useHoveredCard())
      const handlers = result.current.getHoverHandlers('test')

      expect(typeof handlers.onMouseEnter).toBe('function')
      expect(typeof handlers.onMouseLeave).toBe('function')
      expect(typeof handlers.onFocus).toBe('function')
      expect(typeof handlers.onBlur).toBe('function')
    })

    it('onMouseEnter sets hoveredCard to the id', () => {
      const { result } = renderHook(() => useHoveredCard())
      const handlers = result.current.getHoverHandlers('card-2')

      act(() => {
        handlers.onMouseEnter()
      })
      expect(result.current.hoveredCard).toBe('card-2')
    })

    it('onMouseLeave sets hoveredCard to null', () => {
      const { result } = renderHook(() => useHoveredCard())

      act(() => {
        result.current.setHoveredCard('card-3')
      })

      const handlers = result.current.getHoverHandlers('card-3')
      act(() => {
        handlers.onMouseLeave()
      })
      expect(result.current.hoveredCard).toBeNull()
    })

    it('onFocus sets hoveredCard to the id', () => {
      const { result } = renderHook(() => useHoveredCard())
      const handlers = result.current.getHoverHandlers('card-4')

      act(() => {
        handlers.onFocus()
      })
      expect(result.current.hoveredCard).toBe('card-4')
    })

    it('onBlur sets hoveredCard to null', () => {
      const { result } = renderHook(() => useHoveredCard())

      act(() => {
        result.current.setHoveredCard('card-5')
      })

      const handlers = result.current.getHoverHandlers('card-5')
      act(() => {
        handlers.onBlur()
      })
      expect(result.current.hoveredCard).toBeNull()
    })

    it('calls onHoverSound callback on mouseEnter', () => {
      const { result } = renderHook(() => useHoveredCard())
      const soundFn = jest.fn()
      const handlers = result.current.getHoverHandlers('card-6', soundFn)

      act(() => {
        handlers.onMouseEnter()
      })
      expect(soundFn).toHaveBeenCalledTimes(1)
    })

    it('does not error when onHoverSound is not provided', () => {
      const { result } = renderHook(() => useHoveredCard())
      const handlers = result.current.getHoverHandlers('card-7')

      expect(() => {
        act(() => {
          handlers.onMouseEnter()
        })
      }).not.toThrow()
    })

    it('getHoverHandlers is stable (memoized)', () => {
      const { result, rerender } = renderHook(() => useHoveredCard())
      const fn1 = result.current.getHoverHandlers
      rerender()
      const fn2 = result.current.getHoverHandlers
      expect(fn1).toBe(fn2)
    })
  })
})
