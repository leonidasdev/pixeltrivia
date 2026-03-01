/**
 * Tests for ShareButton component
 */

import React from 'react'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { ShareButton } from '@/app/components/ui/ShareButton'

// Mock the share module
jest.mock('@/lib/share', () => ({
  shareResults: jest.fn(),
}))

import { shareResults } from '@/lib/share'

const mockShareResults = shareResults as jest.MockedFunction<typeof shareResults>

const testResult = {
  score: 8,
  totalQuestions: 10,
  accuracy: 80,
  category: 'Science',
  difficulty: 'medium' as const,
  mode: 'quick' as const,
  timeTaken: 45,
}

describe('ShareButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default share text', () => {
    render(<ShareButton result={testResult} />)
    expect(screen.getByText('📤 SHARE')).toBeInTheDocument()
  })

  it('has proper aria-label', () => {
    render(<ShareButton result={testResult} />)
    expect(screen.getByLabelText('Share your results')).toBeInTheDocument()
  })

  it('shows "Copied!" feedback when share returns copied', async () => {
    mockShareResults.mockResolvedValue('copied')

    render(<ShareButton result={testResult} />)
    await act(async () => {
      fireEvent.click(screen.getByText('📤 SHARE'))
    })

    expect(screen.getByText('Copied!')).toBeInTheDocument()
  })

  it('shows "Failed" feedback on error', async () => {
    mockShareResults.mockRejectedValue(new Error('fail'))

    render(<ShareButton result={testResult} />)
    await act(async () => {
      fireEvent.click(screen.getByText('📤 SHARE'))
    })

    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('does not show feedback when share returns shared (native)', async () => {
    mockShareResults.mockResolvedValue('shared')

    render(<ShareButton result={testResult} />)
    await act(async () => {
      fireEvent.click(screen.getByText('📤 SHARE'))
    })

    // Should still show the default text, not "Copied!"
    expect(screen.getByText('📤 SHARE')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<ShareButton result={testResult} className="custom-share" />)
    expect(container.querySelector('.custom-share')).toBeInTheDocument()
  })

  it('calls shareResults with the result', async () => {
    mockShareResults.mockResolvedValue('shared')

    render(<ShareButton result={testResult} />)
    await act(async () => {
      fireEvent.click(screen.getByText('📤 SHARE'))
    })

    expect(mockShareResults).toHaveBeenCalledWith(testResult)
  })
})
