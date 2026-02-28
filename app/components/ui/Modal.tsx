/**
 * Modal Component
 *
 * A reusable modal dialog with pixel-art styling.
 *
 * @module app/components/ui/Modal
 * @since 1.0.0
 */

'use client'

import React, { useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'

// ============================================================================
// Types
// ============================================================================

export interface ModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean

  /**
   * Callback when modal should close
   */
  onClose: () => void

  /**
   * Modal title
   */
  title?: string

  /**
   * Modal content
   */
  children: React.ReactNode

  /**
   * Modal size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'

  /**
   * Close when clicking backdrop
   * @default true
   */
  closeOnBackdropClick?: boolean

  /**
   * Close when pressing Escape
   * @default true
   */
  closeOnEscape?: boolean

  /**
   * Show close button
   * @default true
   */
  showCloseButton?: boolean

  /**
   * Footer content (buttons, etc.)
   */
  footer?: React.ReactNode

  /**
   * Optional className for the title element
   */
  titleClassName?: string

  /**
   * Optional className for modal content
   */
  className?: string
}

// ============================================================================
// Styles
// ============================================================================

const sizeStyles: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
}

// ============================================================================
// Component
// ============================================================================

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  footer,
  titleClassName = '',
  className = '',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose()
      }
    },
    [closeOnEscape, onClose]
  )

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdropClick && event.target === event.currentTarget) {
        onClose()
      }
    },
    [closeOnBackdropClick, onClose]
  )

  // Focus management and scroll lock
  useEffect(() => {
    if (isOpen) {
      // Store current active element
      previousActiveElement.current = document.activeElement as HTMLElement

      // Focus the modal
      modalRef.current?.focus()

      // Lock body scroll
      document.body.style.overflow = 'hidden'

      // Add escape key listener
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      // Restore scroll
      document.body.style.overflow = ''

      // Remove escape key listener
      document.removeEventListener('keydown', handleKeyDown)

      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, handleKeyDown])

  // Don't render if not open
  if (!isOpen) return null

  // Portal content
  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative w-full ${sizeStyles[size]}
          bg-gray-800 border-4 border-gray-600
          shadow-[8px_8px_0_rgba(0,0,0,0.5)]
          animate-scaleIn
          ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b-4 border-gray-600">
            {title && (
              <h2
                id="modal-title"
                className={
                  titleClassName || 'text-xl font-bold text-white uppercase tracking-wider'
                }
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  p-2 text-gray-400 hover:text-white
                  hover:bg-gray-700 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={3}
                    d="M6 6l12 12M6 18L18 6"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4 text-gray-200 max-h-[60vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 border-t-4 border-gray-600">
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  // Render using portal
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return null
}

// ============================================================================
// Confirmation Modal Variant
// ============================================================================

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
}: ConfirmModalProps) {
  const confirmButtonStyles = {
    danger: 'bg-red-600 hover:bg-red-500 border-red-800',
    warning: 'bg-yellow-600 hover:bg-yellow-500 border-yellow-800 text-gray-900',
    info: 'bg-blue-600 hover:bg-blue-500 border-blue-800',
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="
              px-4 py-2 bg-gray-600 hover:bg-gray-500
              text-white font-bold uppercase text-sm
              border-b-4 border-gray-800
              shadow-[4px_4px_0_rgba(0,0,0,0.3)]
              transition-all
            "
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`
              px-4 py-2 text-white font-bold uppercase text-sm
              border-b-4
              shadow-[4px_4px_0_rgba(0,0,0,0.3)]
              transition-all
              ${confirmButtonStyles[variant]}
            `}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p className="text-gray-300">{message}</p>
    </Modal>
  )
}
