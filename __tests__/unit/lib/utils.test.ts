/**
 * Unit tests for lib/utils.ts
 *
 * Tests shared utility functions: generateId, formatDuration, shuffleArray.
 *
 * @module __tests__/unit/lib/utils
 */

import { generateId, formatDuration, shuffleArray } from '@/lib/utils'

describe('generateId', () => {
  it('returns a string', () => {
    expect(typeof generateId()).toBe('string')
  })

  it('includes timestamp and random parts', () => {
    const id = generateId()
    const parts = id.split('-')
    expect(parts.length).toBe(2)
    expect(Number(parts[0])).not.toBeNaN()
  })

  it('prepends prefix when provided', () => {
    const id = generateId('game')
    expect(id).toMatch(/^game-\d+-[a-z0-9]+$/)
  })

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })
})

describe('formatDuration', () => {
  it('formats seconds under a minute', () => {
    expect(formatDuration(0)).toBe('0s')
    expect(formatDuration(45)).toBe('45s')
    expect(formatDuration(59)).toBe('59s')
  })

  it('formats minutes', () => {
    expect(formatDuration(60)).toBe('1m')
    expect(formatDuration(90)).toBe('1m 30s')
    expect(formatDuration(150)).toBe('2m 30s')
  })

  it('formats hours', () => {
    expect(formatDuration(3600)).toBe('1h')
    expect(formatDuration(4500)).toBe('1h 15m')
    expect(formatDuration(7200)).toBe('2h')
  })
})

describe('shuffleArray', () => {
  it('returns a new array (does not mutate original)', () => {
    const original = [1, 2, 3, 4, 5]
    const copy = [...original]
    const result = shuffleArray(original)
    expect(original).toEqual(copy)
    expect(result).not.toBe(original)
  })

  it('preserves all elements', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result = shuffleArray(input)
    expect(result.sort((a, b) => a - b)).toEqual(input)
  })

  it('returns empty array for empty input', () => {
    expect(shuffleArray([])).toEqual([])
  })

  it('returns single-element array unchanged', () => {
    expect(shuffleArray([42])).toEqual([42])
  })

  it('works with generic types', () => {
    const strings = ['a', 'b', 'c', 'd']
    const result = shuffleArray(strings)
    expect(result.sort()).toEqual(strings.sort())
  })

  it('produces different orderings (statistical)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    let differentCount = 0
    for (let i = 0; i < 20; i++) {
      const shuffled = shuffleArray(input)
      if (JSON.stringify(shuffled) !== JSON.stringify(input)) {
        differentCount++
      }
    }
    // At least some should differ (probability of 20 identical shuffles is negligible)
    expect(differentCount).toBeGreaterThan(0)
  })

  it('preserves length', () => {
    const input = Array.from({ length: 100 }, (_, i) => i)
    expect(shuffleArray(input)).toHaveLength(100)
  })
})
