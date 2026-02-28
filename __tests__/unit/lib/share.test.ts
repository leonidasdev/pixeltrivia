/**
 * Tests for lib/share.ts
 *
 * @module __tests__/unit/lib/share
 */

import { generateShareText, canNativeShare, shareResults, type ShareableResult } from '@/lib/share'

// ============================================================================
// generateShareText
// ============================================================================

describe('generateShareText', () => {
  const baseResult: ShareableResult = {
    mode: 'quick',
    score: 850,
    correctAnswers: 8,
    totalQuestions: 10,
    accuracy: 80,
    category: 'Science',
  }

  it('includes mode in uppercase', () => {
    const text = generateShareText(baseResult)
    expect(text).toContain('QUICK MODE')
  })

  it('includes score and accuracy', () => {
    const text = generateShareText(baseResult)
    expect(text).toContain('8/10 correct (80%)')
    expect(text).toContain('Score: 850')
  })

  it('includes category when provided', () => {
    const text = generateShareText(baseResult)
    expect(text).toContain('Science')
  })

  it('omits category line when not provided', () => {
    const text = generateShareText({ ...baseResult, category: undefined })
    expect(text).not.toContain('📂')
  })

  it('includes rank for multiplayer', () => {
    const text = generateShareText({ ...baseResult, rank: 1, totalPlayers: 4 })
    expect(text).toContain('1st of 4')
  })

  it('uses correct rank suffixes', () => {
    expect(generateShareText({ ...baseResult, rank: 2, totalPlayers: 3 })).toContain('2nd')
    expect(generateShareText({ ...baseResult, rank: 3, totalPlayers: 5 })).toContain('3rd')
    expect(generateShareText({ ...baseResult, rank: 4, totalPlayers: 6 })).toContain('4th')
  })

  it('omits rank when not multiplayer', () => {
    const text = generateShareText(baseResult)
    expect(text).not.toContain('🎖️')
  })

  it('includes score bar for ≤ 20 questions', () => {
    const text = generateShareText(baseResult)
    expect(text).toContain('🟩')
    expect(text).toContain('🟥')
  })

  it('omits score bar for > 20 questions', () => {
    const text = generateShareText({ ...baseResult, totalQuestions: 25, correctAnswers: 20 })
    expect(text).not.toContain('🟩')
  })

  it('includes site URL', () => {
    const text = generateShareText(baseResult)
    expect(text).toContain('pixeltrivia.vercel.app')
  })

  it('uses trophy emoji for 100% accuracy', () => {
    const text = generateShareText({ ...baseResult, accuracy: 100 })
    expect(text).toContain('🏆')
  })

  it('uses star emoji for 90%+ accuracy', () => {
    const text = generateShareText({ ...baseResult, accuracy: 95 })
    expect(text).toContain('🌟')
  })

  it('uses target emoji for 80%+ accuracy', () => {
    const text = generateShareText({ ...baseResult, accuracy: 80 })
    expect(text).toContain('🎯')
  })

  it('uses book emoji for low accuracy', () => {
    const text = generateShareText({ ...baseResult, accuracy: 30 })
    expect(text).toContain('📚')
  })
})

// ============================================================================
// canNativeShare
// ============================================================================

describe('canNativeShare', () => {
  const originalNavigator = global.navigator

  afterEach(() => {
    Object.defineProperty(global, 'navigator', { value: originalNavigator, writable: true })
  })

  it('returns true when navigator.share is a function', () => {
    Object.defineProperty(global, 'navigator', {
      value: { share: jest.fn() },
      writable: true,
    })
    expect(canNativeShare()).toBe(true)
  })

  it('returns false when navigator.share is undefined', () => {
    Object.defineProperty(global, 'navigator', {
      value: {},
      writable: true,
    })
    expect(canNativeShare()).toBe(false)
  })
})

// ============================================================================
// shareResults
// ============================================================================

describe('shareResults', () => {
  const result: ShareableResult = {
    mode: 'custom',
    score: 500,
    correctAnswers: 5,
    totalQuestions: 10,
    accuracy: 50,
  }

  beforeEach(() => {
    // Default: no native share, clipboard available
    Object.defineProperty(global, 'navigator', {
      value: {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      },
      writable: true,
    })
  })

  it('copies to clipboard when native share is unavailable', async () => {
    const outcome = await shareResults(result)
    expect(outcome).toBe('copied')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('CUSTOM MODE')
    )
  })

  it('uses native share when available', async () => {
    const shareFn = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(global, 'navigator', {
      value: { share: shareFn, clipboard: { writeText: jest.fn() } },
      writable: true,
    })

    const outcome = await shareResults(result)
    expect(outcome).toBe('shared')
    expect(shareFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'PixelTrivia Results',
        text: expect.stringContaining('CUSTOM MODE'),
      })
    )
  })

  it('falls back to clipboard when native share throws', async () => {
    const shareFn = jest.fn().mockRejectedValue(new Error('User cancelled'))
    Object.defineProperty(global, 'navigator', {
      value: {
        share: shareFn,
        clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
      },
      writable: true,
    })

    const outcome = await shareResults(result)
    expect(outcome).toBe('copied')
  })
})
