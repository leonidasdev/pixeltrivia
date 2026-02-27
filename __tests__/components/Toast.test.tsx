/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Toast, ToastContainer, useToast, type ToastMessage } from '@/app/components/ui/Toast'

// Helper to test the useToast hook
function ToastHookConsumer() {
  const { messages, dismissToast, toast } = useToast()

  return (
    <div>
      <button onClick={() => toast.success('Success title')}>Add Success</button>
      <button onClick={() => toast.error('Error title', 'Error desc')}>Add Error</button>
      <button onClick={() => toast.warning('Warning title')}>Add Warning</button>
      <button onClick={() => toast.info('Info title')}>Add Info</button>
      <div data-testid="count">{messages.length}</div>
      {messages.map(m => (
        <div key={m.id} data-testid={`toast-${m.variant}`}>
          {m.title}
          <button onClick={() => dismissToast(m.id)}>Dismiss {m.variant}</button>
        </div>
      ))}
    </div>
  )
}

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const baseMessage: ToastMessage = {
    id: 'test-1',
    variant: 'success',
    title: 'Test toast',
    duration: 5000,
  }

  it('renders toast with title and correct icon', () => {
    const onDismiss = jest.fn()
    render(<Toast message={baseMessage} onDismiss={onDismiss} />)

    expect(screen.getByText('Test toast')).toBeInTheDocument()
    expect(screen.getByText('✅')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    const onDismiss = jest.fn()
    const msg = { ...baseMessage, description: 'Some details' }
    render(<Toast message={msg} onDismiss={onDismiss} />)

    expect(screen.getByText('Some details')).toBeInTheDocument()
  })

  it('renders correct icon for each variant', () => {
    const onDismiss = jest.fn()

    const variants = [
      { variant: 'error' as const, icon: '❌' },
      { variant: 'warning' as const, icon: '⚠️' },
      { variant: 'info' as const, icon: 'ℹ️' },
    ]

    for (const { variant, icon } of variants) {
      const { unmount } = render(
        <Toast message={{ ...baseMessage, variant }} onDismiss={onDismiss} />
      )
      expect(screen.getByText(icon)).toBeInTheDocument()
      unmount()
    }
  })

  it('has role="alert" and aria-live="assertive"', () => {
    const onDismiss = jest.fn()
    render(<Toast message={baseMessage} onDismiss={onDismiss} />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'assertive')
  })

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = jest.fn()
    render(<Toast message={baseMessage} onDismiss={onDismiss} />)

    fireEvent.click(screen.getByLabelText('Dismiss notification'))

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(onDismiss).toHaveBeenCalledWith('test-1')
  })

  it('auto-dismisses after duration', () => {
    const onDismiss = jest.fn()
    render(<Toast message={baseMessage} onDismiss={onDismiss} />)

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    // After the exit animation (200ms)
    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(onDismiss).toHaveBeenCalledWith('test-1')
  })
})

describe('ToastContainer', () => {
  it('returns null when no messages', () => {
    const { container } = render(<ToastContainer messages={[]} onDismiss={jest.fn()} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders multiple toasts', () => {
    const messages: ToastMessage[] = [
      { id: '1', variant: 'success', title: 'First' },
      { id: '2', variant: 'error', title: 'Second' },
    ]

    render(<ToastContainer messages={messages} onDismiss={jest.fn()} />)

    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('has aria-label for accessibility', () => {
    const messages: ToastMessage[] = [{ id: '1', variant: 'info', title: 'Test' }]

    render(<ToastContainer messages={messages} onDismiss={jest.fn()} />)
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument()
  })
})

describe('useToast', () => {
  it('starts with empty messages', () => {
    render(<ToastHookConsumer />)
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('adds success toast', () => {
    render(<ToastHookConsumer />)

    fireEvent.click(screen.getByText('Add Success'))
    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(screen.getByText('Success title')).toBeInTheDocument()
  })

  it('adds error toast', () => {
    render(<ToastHookConsumer />)

    fireEvent.click(screen.getByText('Add Error'))
    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(screen.getByText('Error title')).toBeInTheDocument()
  })

  it('adds warning and info toasts', () => {
    render(<ToastHookConsumer />)

    fireEvent.click(screen.getByText('Add Warning'))
    fireEvent.click(screen.getByText('Add Info'))
    expect(screen.getByTestId('count')).toHaveTextContent('2')
  })

  it('dismisses a toast by id', () => {
    render(<ToastHookConsumer />)

    fireEvent.click(screen.getByText('Add Success'))
    expect(screen.getByTestId('count')).toHaveTextContent('1')

    fireEvent.click(screen.getByText('Dismiss success'))
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('handles multiple toasts independently', () => {
    render(<ToastHookConsumer />)

    fireEvent.click(screen.getByText('Add Success'))
    fireEvent.click(screen.getByText('Add Error'))
    expect(screen.getByTestId('count')).toHaveTextContent('2')

    // Dismiss only the error
    fireEvent.click(screen.getByText('Dismiss error'))
    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(screen.getByText('Success title')).toBeInTheDocument()
  })
})
