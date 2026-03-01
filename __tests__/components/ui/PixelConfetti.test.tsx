/**
 * Tests for PixelConfetti component
 *
 * @module __tests__/components/ui/PixelConfetti.test
 */

import React from 'react'
import { render, act } from '@testing-library/react'
import { PixelConfetti } from '@/app/components/ui/PixelConfetti'

// Mock requestAnimationFrame / cancelAnimationFrame
let rafCallbacks: Array<() => void> = []
const mockRAF = jest.fn((cb: FrameRequestCallback) => {
  rafCallbacks.push(() => cb(Date.now()))
  return rafCallbacks.length
})
const mockCAF = jest.fn()
Object.defineProperty(window, 'requestAnimationFrame', { value: mockRAF, writable: true })
Object.defineProperty(window, 'cancelAnimationFrame', { value: mockCAF, writable: true })

// Mock canvas context
const mockCtx = {
  clearRect: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  fillRect: jest.fn(),
  fillStyle: '',
  globalAlpha: 1,
  imageSmoothingEnabled: true,
}

const mockGetContext = jest.fn(() => mockCtx)

// Override HTMLCanvasElement.prototype.getContext
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext =
    mockGetContext as unknown as typeof HTMLCanvasElement.prototype.getContext
})

describe('PixelConfetti', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    rafCallbacks = []
    mockCtx.imageSmoothingEnabled = true
    jest.spyOn(Date, 'now').mockReturnValue(1000)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders nothing when inactive', () => {
    const { container } = render(<PixelConfetti active={false} />)
    expect(container.querySelector('canvas')).toBeNull()
  })

  it('renders a canvas when active', () => {
    const { container } = render(<PixelConfetti active={true} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
    expect(canvas?.getAttribute('aria-hidden')).toBe('true')
  })

  it('sets canvas dimensions to viewport size', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true })

    const { container } = render(<PixelConfetti active={true} />)
    const canvas = container.querySelector('canvas')
    expect(canvas?.width).toBe(1920)
    expect(canvas?.height).toBe(1080)
  })

  it('disables image smoothing for pixel look', () => {
    render(<PixelConfetti active={true} />)
    expect(mockCtx.imageSmoothingEnabled).toBe(false)
  })

  it('starts animation with requestAnimationFrame', () => {
    render(<PixelConfetti active={true} />)
    expect(mockRAF).toHaveBeenCalled()
  })

  it('creates particles on activation', () => {
    render(<PixelConfetti active={true} particleCount={10} />)
    // Draw calls should occur when animation runs
    expect(mockRAF).toHaveBeenCalledTimes(1)
  })

  it('calls onComplete when duration expires', () => {
    const onComplete = jest.fn()
    ;(Date.now as jest.Mock).mockReturnValue(1000)

    render(<PixelConfetti active={true} duration={500} onComplete={onComplete} particleCount={5} />)

    // Advance time past duration
    ;(Date.now as jest.Mock).mockReturnValue(2000)

    // Flush animation frame
    act(() => {
      rafCallbacks.forEach(cb => cb())
      rafCallbacks = []
    })

    expect(onComplete).toHaveBeenCalled()
    expect(mockCtx.clearRect).toHaveBeenCalled()
  })

  it('draws particles during animation', () => {
    ;(Date.now as jest.Mock).mockReturnValue(1000)
    render(<PixelConfetti active={true} duration={5000} particleCount={3} />)

    // Still within duration
    ;(Date.now as jest.Mock).mockReturnValue(1100)

    act(() => {
      rafCallbacks.forEach(cb => cb())
      rafCallbacks = []
    })

    // Should draw particles — save/restore per particle
    expect(mockCtx.save).toHaveBeenCalled()
    expect(mockCtx.restore).toHaveBeenCalled()
    expect(mockCtx.fillRect).toHaveBeenCalled()
    expect(mockCtx.translate).toHaveBeenCalled()
    expect(mockCtx.rotate).toHaveBeenCalled()
  })

  it('accepts custom colours', () => {
    render(<PixelConfetti active={true} colors={['#FF0000', '#00FF00']} particleCount={3} />)
    expect(mockRAF).toHaveBeenCalled()
  })

  it('cancels animation on unmount', () => {
    const { unmount } = render(<PixelConfetti active={true} />)
    unmount()
    expect(mockCAF).toHaveBeenCalled()
  })

  it('keeps animating while particles are alive', () => {
    ;(Date.now as jest.Mock).mockReturnValue(1000)

    render(<PixelConfetti active={true} duration={99999} particleCount={2} />)

    // Run a few frames - animation should keep scheduling
    ;(Date.now as jest.Mock).mockReturnValue(1050)
    act(() => {
      rafCallbacks.forEach(cb => cb())
      rafCallbacks = []
    })

    // requestAnimationFrame should have been called again for next frame
    expect(mockRAF.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('handles null canvas context gracefully', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockGetContext.mockReturnValueOnce(null as any)
    // Should not throw
    expect(() => render(<PixelConfetti active={true} />)).not.toThrow()
  })
})
