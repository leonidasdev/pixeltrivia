/**
 * Pixel Input Component
 *
 * A reusable input field with pixel-art styling.
 *
 * @module app/components/ui/PixelInput
 * @since 1.0.0
 */

'use client'

import React, { forwardRef } from 'react'

// ============================================================================
// Types
// ============================================================================

export interface PixelInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input label
   */
  label?: string

  /**
   * Helper text below input
   */
  helperText?: string

  /**
   * Error message
   */
  error?: string

  /**
   * Input size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Full width input
   * @default true
   */
  fullWidth?: boolean

  /**
   * Left icon/addon
   */
  leftIcon?: React.ReactNode

  /**
   * Right icon/addon
   */
  rightIcon?: React.ReactNode

  /**
   * Container className
   */
  containerClassName?: string
}

// ============================================================================
// Styles
// ============================================================================

const sizeStyles = {
  sm: {
    input: 'px-3 py-1.5 text-sm',
    label: 'text-sm',
    icon: 'w-4 h-4',
  },
  md: {
    input: 'px-4 py-2 text-base',
    label: 'text-sm',
    icon: 'w-5 h-5',
  },
  lg: {
    input: 'px-4 py-3 text-lg',
    label: 'text-base',
    icon: 'w-6 h-6',
  },
}

// ============================================================================
// Component
// ============================================================================

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      fullWidth = true,
      leftIcon,
      rightIcon,
      containerClassName = '',
      className = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const styles = sizeStyles[size]
    const hasError = !!error

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`
              block mb-2 font-bold uppercase tracking-wider
              text-gray-300 ${styles.label}
            `}
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div
              className={`
                absolute left-3 top-1/2 -translate-y-1/2
                text-gray-400 pointer-events-none
                ${styles.icon}
              `}
            >
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              ${fullWidth ? 'w-full' : ''}
              ${styles.input}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              bg-gray-900 text-white
              border-4 ${hasError ? 'border-red-500' : 'border-gray-600'}
              placeholder-gray-500
              focus:outline-none focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div
              className={`
                absolute right-3 top-1/2 -translate-y-1/2
                text-gray-400
                ${styles.icon}
              `}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message */}
        {hasError && (
          <p id={`${inputId}-error`} className="mt-2 text-sm text-red-400 font-medium" role="alert">
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !hasError && (
          <p id={`${inputId}-helper`} className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

PixelInput.displayName = 'PixelInput'

// ============================================================================
// Textarea Variant
// ============================================================================

export interface PixelTextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'size'
> {
  label?: string
  helperText?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  containerClassName?: string
}

export const PixelTextarea = forwardRef<HTMLTextAreaElement, PixelTextareaProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      fullWidth = true,
      containerClassName = '',
      className = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const styles = sizeStyles[size]
    const hasError = !!error

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`
              block mb-2 font-bold uppercase tracking-wider
              text-gray-300 ${styles.label}
            `}
          >
            {label}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`
            ${fullWidth ? 'w-full' : ''}
            ${styles.input}
            bg-gray-900 text-white
            border-4 ${hasError ? 'border-red-500' : 'border-gray-600'}
            placeholder-gray-500
            focus:outline-none focus:border-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors resize-y min-h-[100px]
            ${className}
          `}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />

        {/* Error message */}
        {hasError && (
          <p id={`${inputId}-error`} className="mt-2 text-sm text-red-400 font-medium" role="alert">
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !hasError && (
          <p id={`${inputId}-helper`} className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

PixelTextarea.displayName = 'PixelTextarea'
