/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { useTimer, formatTime, formatMs } from '@/hooks/useTimer'

describe('useTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Initialization', () => {
    it('initializes with correct duration', () => {
      const { result } = renderHook(() => useTimer({ duration: 30 }))

      expect(result.current.timeRemaining).toBe(30)
      expect(result.current.isRunning).toBe(false)
      expect(result.current.isExpired).toBe(false)
      expect(result.current.progress).toBe(0)
    })

    it('auto-starts when autoStart is true', () => {
      const { result } = renderHook(() => useTimer({ duration: 30, autoStart: true }))

      expect(result.current.isRunning).toBe(true)
    })

    it('does not auto-start by default', () => {
      const { result } = renderHook(() => useTimer({ duration: 30 }))

      expect(result.current.isRunning).toBe(false)
    })
  })

  describe('Timer actions', () => {
    it('starts counting down', () => {
      const { result } = renderHook(() => useTimer({ duration: 30 }))

      act(() => {
        result.current.start()
      })

      expect(result.current.isRunning).toBe(true)

      act(() => {
        jest.advanceTimersByTime(3000)
      })

      expect(result.current.timeRemaining).toBe(27)
    })

    it('pauses the timer', () => {
      const { result } = renderHook(() => useTimer({ duration: 30, autoStart: true }))

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      act(() => {
        result.current.pause()
      })

      expect(result.current.isRunning).toBe(false)
      const timeAfterPause = result.current.timeRemaining

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      // Time should not change while paused
      expect(result.current.timeRemaining).toBe(timeAfterPause)
    })

    it('resumes the timer', () => {
      const { result } = renderHook(() => useTimer({ duration: 30, autoStart: true }))

      act(() => {
        jest.advanceTimersByTime(5000)
        result.current.pause()
      })

      act(() => {
        result.current.resume()
      })

      expect(result.current.isRunning).toBe(true)

      act(() => {
        jest.advanceTimersByTime(2000)
      })

      expect(result.current.timeRemaining).toBe(23)
    })

    it('resets the timer', () => {
      const { result } = renderHook(() => useTimer({ duration: 30, autoStart: true }))

      act(() => {
        jest.advanceTimersByTime(10000)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.timeRemaining).toBe(30)
      expect(result.current.isRunning).toBe(false)
    })

    it('resets with a new duration', () => {
      const { result } = renderHook(() => useTimer({ duration: 30 }))

      act(() => {
        result.current.reset(60)
      })

      expect(result.current.timeRemaining).toBe(60)
    })

    it('stop returns elapsed time', () => {
      const { result } = renderHook(() => useTimer({ duration: 30, autoStart: true }))

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      let elapsed = 0
      act(() => {
        elapsed = result.current.stop()
      })

      expect(result.current.isRunning).toBe(false)
      expect(elapsed).toBeGreaterThan(0)
    })
  })

  describe('Timer expiration', () => {
    it('expires when time runs out', () => {
      const onExpire = jest.fn()
      const { result } = renderHook(() => useTimer({ duration: 5, autoStart: true, onExpire }))

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.timeRemaining).toBe(0)
      expect(result.current.isExpired).toBe(true)
      expect(result.current.isRunning).toBe(false)
      expect(onExpire).toHaveBeenCalledTimes(1)
    })

    it('does not go below 0', () => {
      const { result } = renderHook(() => useTimer({ duration: 3, autoStart: true }))

      act(() => {
        jest.advanceTimersByTime(10000)
      })

      expect(result.current.timeRemaining).toBe(0)
    })
  })

  describe('Callbacks', () => {
    it('fires onTick on each second', () => {
      const onTick = jest.fn()
      renderHook(() => useTimer({ duration: 30, autoStart: true, onTick }))

      act(() => {
        jest.advanceTimersByTime(3000)
      })

      expect(onTick).toHaveBeenCalledTimes(3)
      expect(onTick).toHaveBeenCalledWith(29)
      expect(onTick).toHaveBeenCalledWith(28)
      expect(onTick).toHaveBeenCalledWith(27)
    })

    it('fires onWarning when entering warning zone', () => {
      const onWarning = jest.fn()
      renderHook(() =>
        useTimer({
          duration: 15,
          autoStart: true,
          onWarning,
          warningThreshold: 10,
        })
      )

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(onWarning).toHaveBeenCalledTimes(1)
    })

    it('fires onCritical when entering critical zone', () => {
      const onCritical = jest.fn()
      renderHook(() =>
        useTimer({
          duration: 10,
          autoStart: true,
          onCritical,
          criticalThreshold: 5,
        })
      )

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(onCritical).toHaveBeenCalledTimes(1)
    })
  })

  describe('Derived state', () => {
    it('calculates progress correctly', () => {
      const { result } = renderHook(() => useTimer({ duration: 10, autoStart: true }))

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.progress).toBe(50)
    })

    it('sets isWarning in warning zone', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 15, autoStart: true, warningThreshold: 10, criticalThreshold: 5 })
      )

      act(() => {
        jest.advanceTimersByTime(6000) // 9 remaining
      })

      expect(result.current.isWarning).toBe(true)
      expect(result.current.isCritical).toBe(false)
    })

    it('sets isCritical in critical zone', () => {
      const { result } = renderHook(() =>
        useTimer({ duration: 10, autoStart: true, warningThreshold: 10, criticalThreshold: 5 })
      )

      act(() => {
        jest.advanceTimersByTime(6000) // 4 remaining
      })

      expect(result.current.isCritical).toBe(true)
    })
  })
})

describe('formatTime', () => {
  it('formats seconds to MM:SS', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(30)).toBe('0:30')
    expect(formatTime(61)).toBe('1:01')
    expect(formatTime(125)).toBe('2:05')
  })
})

describe('formatMs', () => {
  it('formats milliseconds to seconds', () => {
    expect(formatMs(1500)).toBe('1.5')
    expect(formatMs(500)).toBe('0.5')
    expect(formatMs(1000, 2)).toBe('1.00')
  })
})
