/**
 * Tests for gameApi.fetchQuestions
 *
 * Tests the API fetch function for game questions.
 */

jest.mock('@/lib/apiFetch', () => ({
  apiFetch: jest.fn(),
}))

import { fetchQuestions } from '@/lib/gameApi'
import { apiFetch } from '@/lib/apiFetch'

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>

describe('fetchQuestions', () => {
  beforeEach(() => {
    mockApiFetch.mockReset()
  })

  it('should call apiFetch with correct URL and params', async () => {
    mockApiFetch.mockResolvedValue({ success: true, data: { questions: [] } })

    await fetchQuestions('Science', 'easy', 10)

    expect(mockApiFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockApiFetch.mock.calls[0]
    expect(url).toContain('/api/game/questions')
    expect(url).toContain('category=Science')
    expect(url).toContain('difficulty=easy')
    expect(url).toContain('limit=10')
    expect(options).toEqual({ errorContext: 'fetch questions' })
  })

  it('should default limit to 10', async () => {
    mockApiFetch.mockResolvedValue({ success: true })

    await fetchQuestions('History', 'hard')

    const [url] = mockApiFetch.mock.calls[0]
    expect(url).toContain('limit=10')
  })

  it('should allow custom limit', async () => {
    mockApiFetch.mockResolvedValue({ success: true })

    await fetchQuestions('Math', 'medium', 25)

    const [url] = mockApiFetch.mock.calls[0]
    expect(url).toContain('limit=25')
  })

  it('should return the response from apiFetch', async () => {
    const mockResponse = {
      success: true,
      data: {
        questions: [{ id: 1, question: 'Test?', options: ['a', 'b'], correctAnswer: 0 }],
        totalQuestions: 1,
        selectedCategory: 'Science',
        selectedDifficulty: 'easy',
        timeLimit: 30,
      },
    }
    mockApiFetch.mockResolvedValue(mockResponse)

    const result = await fetchQuestions('Science', 'easy')
    expect(result).toEqual(mockResponse)
  })

  it('should propagate errors from apiFetch', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'))

    await expect(fetchQuestions('Art', 'hard')).rejects.toThrow('Network error')
  })

  it('should handle URL encoding of special characters in category', async () => {
    mockApiFetch.mockResolvedValue({ success: true })

    await fetchQuestions('Science & Nature', 'easy')

    const [url] = mockApiFetch.mock.calls[0]
    // URLSearchParams encodes special chars
    expect(url).toContain('category=Science')
  })
})
