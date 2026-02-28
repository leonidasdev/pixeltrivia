'use client'

import { useEffect, useState, useCallback } from 'react'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  duration?: number
}

export interface ToastProps {
  message: ToastMessage
  onDismiss: (id: string) => void
}

const VARIANT_STYLES: Record<ToastVariant, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-900/90',
    border: 'border-green-500',
    icon: '✅',
  },
  error: {
    bg: 'bg-red-900/90',
    border: 'border-red-500',
    icon: '❌',
  },
  warning: {
    bg: 'bg-yellow-900/90',
    border: 'border-yellow-500',
    icon: '⚠️',
  },
  info: {
    bg: 'bg-blue-900/90',
    border: 'border-blue-500',
    icon: 'ℹ️',
  },
}

export function Toast({ message, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => onDismiss(message.id), 200)
  }, [message.id, onDismiss])

  useEffect(() => {
    // Trigger entrance animation
    const showTimer = setTimeout(() => setIsVisible(true), 10)

    // Auto-dismiss after duration
    const duration = message.duration ?? 5000
    if (duration > 0) {
      const dismissTimer = setTimeout(handleDismiss, duration)
      return () => {
        clearTimeout(showTimer)
        clearTimeout(dismissTimer)
      }
    }

    return () => clearTimeout(showTimer)
  }, [message.duration, handleDismiss])

  const styles = VARIANT_STYLES[message.variant]

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        ${styles.bg} ${styles.border} border-2 p-4 shadow-xl pixel-border
        max-w-sm w-full backdrop-blur-sm
        transform transition-all duration-200 ease-in-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0" aria-hidden="true">
          {styles.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">{message.title}</p>
          {message.description && (
            <p className="text-gray-300 text-xs mt-1 break-words">{message.description}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white transition-colors flex-shrink-0 p-1"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export interface ToastContainerProps {
  messages: ToastMessage[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ messages, onDismiss }: ToastContainerProps) {
  if (messages.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2" aria-label="Notifications">
      {messages.map(msg => (
        <Toast key={msg.id} message={msg} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

// Hook for managing toasts
let toastCounter = 0

export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const addToast = useCallback(
    (variant: ToastVariant, title: string, description?: string, duration?: number) => {
      const id = `toast-${++toastCounter}-${Date.now()}`
      setMessages(prev => [...prev, { id, variant, title, description, duration }])
    },
    []
  )

  const dismissToast = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }, [])

  const toast = {
    success: (title: string, description?: string) => addToast('success', title, description),
    error: (title: string, description?: string) => addToast('error', title, description, 8000),
    warning: (title: string, description?: string) => addToast('warning', title, description),
    info: (title: string, description?: string) => addToast('info', title, description),
  }

  return { messages, dismissToast, toast }
}
