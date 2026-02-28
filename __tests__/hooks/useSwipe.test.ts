/**
 * Tests for the useSwipe hook.
 *
 * @module tests/hooks/useSwipe
 */

import { renderHook, act } from '@testing-library/react'
import { useSwipe } from '@/hooks/useSwipe'

// Helpers to create TouchEvent-like objects
function createTouchEvent(type: string, x: number, y: number): Partial<TouchEvent> {
  const touch = { clientX: x, clientY: y } as Touch
  return {
    type,
    touches: type === 'touchend' ? ([] as unknown as TouchList) : ([touch] as unknown as TouchList),
    changedTouches: [touch] as unknown as TouchList,
    preventDefault: jest.fn(),
  }
}

function simulateSwipe(
  el: HTMLElement,
  from: { x: number; y: number },
  to: { x: number; y: number },
  duration = 100
) {
  const startEvent = createTouchEvent('touchstart', from.x, from.y)
  const endEvent = createTouchEvent('touchend', to.x, to.y)

  // Mock Date.now to control timing
  const originalNow = Date.now
  let currentTime = 1000
  Date.now = jest.fn(() => currentTime)

  el.dispatchEvent(new TouchEvent('touchstart', startEvent as TouchEventInit))

  currentTime += duration

  el.dispatchEvent(new TouchEvent('touchend', endEvent as TouchEventInit))

  Date.now = originalNow
}

describe('useSwipe', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('returns a ref object', () => {
    const { result } = renderHook(() => useSwipe())
    expect(result.current.ref).toBeDefined()
    expect(result.current.ref.current).toBeNull()
  })

  it('detects a swipe left', () => {
    const onSwipeLeft = jest.fn()
    const { result } = renderHook(() => useSwipe({ onSwipeLeft, threshold: 30 }))

    act(() => {
      ;(result.current.ref as React.MutableRefObject<HTMLElement | null>).current = container
    })

    // Re-render to attach listeners
    const { result: result2 } = renderHook(() => useSwipe({ onSwipeLeft, threshold: 30 }))
    act(() => {
      ;(result2.current.ref as React.MutableRefObject<HTMLElement | null>).current = container
    })

    // For simplicity, directly test via event dispatching on the container
    // Attach listeners manually since ref assignment happens after render
    const onSwipeLeft2 = jest.fn()
    const div = document.createElement('div')
    document.body.appendChild(div)

    const { unmount } = renderHook(() => {
      const swipe = useSwipe<HTMLDivElement>({ onSwipeLeft: onSwipeLeft2, threshold: 30 })
      ;(swipe.ref as React.MutableRefObject<HTMLDivElement | null>).current = div
      return swipe
    })

    // We need to trigger a re-render after setting the ref
    // The hook registers event listeners in useEffect which runs after render
    // Since we set the ref during render, the effect should fire

    // Wait for effects
    act(() => {
      simulateSwipe(div, { x: 200, y: 100 }, { x: 100, y: 105 }, 100)
    })

    expect(onSwipeLeft2).toHaveBeenCalledTimes(1)
    unmount()
    document.body.removeChild(div)
  })

  it('detects a swipe right', () => {
    const onSwipeRight = jest.fn()
    const div = document.createElement('div')
    document.body.appendChild(div)

    const { unmount } = renderHook(() => {
      const swipe = useSwipe<HTMLDivElement>({ onSwipeRight, threshold: 30 })
      ;(swipe.ref as React.MutableRefObject<HTMLDivElement | null>).current = div
      return swipe
    })

    act(() => {
      simulateSwipe(div, { x: 100, y: 100 }, { x: 200, y: 105 }, 100)
    })

    expect(onSwipeRight).toHaveBeenCalledTimes(1)
    unmount()
    document.body.removeChild(div)
  })

  it('detects a swipe up', () => {
    const onSwipeUp = jest.fn()
    const div = document.createElement('div')
    document.body.appendChild(div)

    const { unmount } = renderHook(() => {
      const swipe = useSwipe<HTMLDivElement>({ onSwipeUp, threshold: 30 })
      ;(swipe.ref as React.MutableRefObject<HTMLDivElement | null>).current = div
      return swipe
    })

    act(() => {
      simulateSwipe(div, { x: 100, y: 200 }, { x: 105, y: 100 }, 100)
    })

    expect(onSwipeUp).toHaveBeenCalledTimes(1)
    unmount()
    document.body.removeChild(div)
  })

  it('detects a swipe down', () => {
    const onSwipeDown = jest.fn()
    const div = document.createElement('div')
    document.body.appendChild(div)

    const { unmount } = renderHook(() => {
      const swipe = useSwipe<HTMLDivElement>({ onSwipeDown, threshold: 30 })
      ;(swipe.ref as React.MutableRefObject<HTMLDivElement | null>).current = div
      return swipe
    })

    act(() => {
      simulateSwipe(div, { x: 100, y: 100 }, { x: 105, y: 200 }, 100)
    })

    expect(onSwipeDown).toHaveBeenCalledTimes(1)
    unmount()
    document.body.removeChild(div)
  })

  it('fires generic onSwipe with direction', () => {
    const onSwipe = jest.fn()
    const div = document.createElement('div')
    document.body.appendChild(div)

    const { unmount } = renderHook(() => {
      const swipe = useSwipe<HTMLDivElement>({ onSwipe, threshold: 30 })
      ;(swipe.ref as React.MutableRefObject<HTMLDivElement | null>).current = div
      return swipe
    })

    act(() => {
      simulateSwipe(div, { x: 200, y: 100 }, { x: 100, y: 105 }, 100)
    })

    expect(onSwipe).toHaveBeenCalledWith('left')
    unmount()
    document.body.removeChild(div)
  })

  it('ignores swipes below threshold', () => {
    const onSwipeLeft = jest.fn()
    const div = document.createElement('div')
    document.body.appendChild(div)

    const { unmount } = renderHook(() => {
      const swipe = useSwipe<HTMLDivElement>({ onSwipeLeft, threshold: 100 })
      ;(swipe.ref as React.MutableRefObject<HTMLDivElement | null>).current = div
      return swipe
    })

    act(() => {
      // Only 50px movement, threshold is 100
      simulateSwipe(div, { x: 200, y: 100 }, { x: 150, y: 100 }, 100)
    })

    expect(onSwipeLeft).not.toHaveBeenCalled()
    unmount()
    document.body.removeChild(div)
  })

  it('ignores swipes that are too slow', () => {
    const onSwipeLeft = jest.fn()
    const div = document.createElement('div')
    document.body.appendChild(div)

    const { unmount } = renderHook(() => {
      const swipe = useSwipe<HTMLDivElement>({ onSwipeLeft, threshold: 30, maxDuration: 200 })
      ;(swipe.ref as React.MutableRefObject<HTMLDivElement | null>).current = div
      return swipe
    })

    act(() => {
      // 500ms gesture, maxDuration is 200
      simulateSwipe(div, { x: 200, y: 100 }, { x: 100, y: 100 }, 500)
    })

    expect(onSwipeLeft).not.toHaveBeenCalled()
    unmount()
    document.body.removeChild(div)
  })

  it('does nothing when disabled', () => {
    const onSwipeLeft = jest.fn()
    const div = document.createElement('div')
    document.body.appendChild(div)

    const { unmount } = renderHook(() => {
      const swipe = useSwipe<HTMLDivElement>({ onSwipeLeft, threshold: 30, disabled: true })
      ;(swipe.ref as React.MutableRefObject<HTMLDivElement | null>).current = div
      return swipe
    })

    act(() => {
      simulateSwipe(div, { x: 200, y: 100 }, { x: 100, y: 105 }, 100)
    })

    expect(onSwipeLeft).not.toHaveBeenCalled()
    unmount()
    document.body.removeChild(div)
  })

  it('prioritises horizontal swipe when dx > dy', () => {
    const onSwipeLeft = jest.fn()
    const onSwipeDown = jest.fn()
    const div = document.createElement('div')
    document.body.appendChild(div)

    const { unmount } = renderHook(() => {
      const swipe = useSwipe<HTMLDivElement>({ onSwipeLeft, onSwipeDown, threshold: 30 })
      ;(swipe.ref as React.MutableRefObject<HTMLDivElement | null>).current = div
      return swipe
    })

    act(() => {
      // dx=100, dy=30: should be left, not down
      simulateSwipe(div, { x: 200, y: 100 }, { x: 100, y: 130 }, 100)
    })

    expect(onSwipeLeft).toHaveBeenCalled()
    expect(onSwipeDown).not.toHaveBeenCalled()
    unmount()
    document.body.removeChild(div)
  })
})
