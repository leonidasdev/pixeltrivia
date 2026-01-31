/**
 * Custom Error Classes for PixelTrivia
 * Provides structured error handling across the application
 */

/**
 * Base error class for all application errors
 */
export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly timestamp: Date
  public readonly context?: Record<string, unknown>

  constructor(
    message: string,
    code: string = 'APP_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.timestamp = new Date()
    this.context = context

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      ...(this.context && { context: this.context }),
    }
  }
}

/**
 * Validation errors for invalid input data
 */
export class ValidationError extends AppError {
  public readonly field?: string
  public readonly validationErrors?: Record<string, string[]>

  constructor(message: string, field?: string, validationErrors?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400, true, { field, validationErrors })
    this.field = field
    this.validationErrors = validationErrors
  }
}

/**
 * Authentication errors
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401, true)
  }
}

/**
 * Authorization errors (user authenticated but lacks permission)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 'AUTHORIZATION_ERROR', 403, true)
  }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends AppError {
  public readonly resource: string

  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`
    super(message, 'NOT_FOUND', 404, true, { resource, identifier })
    this.resource = resource
  }
}

/**
 * Conflict errors (e.g., duplicate resources)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409, true)
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends AppError {
  public readonly retryAfter: number

  constructor(retryAfter: number = 60) {
    super(
      `Too many requests. Please try again in ${retryAfter} seconds.`,
      'RATE_LIMIT_EXCEEDED',
      429,
      true,
      { retryAfter }
    )
    this.retryAfter = retryAfter
  }
}

/**
 * Database/Supabase errors
 */
export class DatabaseError extends AppError {
  public readonly originalError?: Error

  constructor(message: string, originalError?: Error) {
    super(
      message,
      'DATABASE_ERROR',
      500,
      true,
      originalError ? { originalMessage: originalError.message } : undefined
    )
    this.originalError = originalError
  }
}

/**
 * External API errors (OpenRouter, etc.)
 */
export class ExternalAPIError extends AppError {
  public readonly service: string
  public readonly originalError?: Error

  constructor(service: string, message: string, originalError?: Error) {
    super(`External service error (${service}): ${message}`, 'EXTERNAL_API_ERROR', 502, true, {
      service,
      originalMessage: originalError?.message,
    })
    this.service = service
    this.originalError = originalError
  }
}

/**
 * AI/Question generation errors
 */
export class AIGenerationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'AI_GENERATION_ERROR', 500, true, context)
  }
}

/**
 * Room-related errors
 */
export class RoomError extends AppError {
  public readonly roomCode?: string

  constructor(message: string, roomCode?: string, statusCode: number = 400) {
    super(message, 'ROOM_ERROR', statusCode, true, { roomCode })
    this.roomCode = roomCode
  }
}

/**
 * Room not found
 */
export class RoomNotFoundError extends RoomError {
  constructor(roomCode: string) {
    super(`Room '${roomCode}' not found or has expired`, roomCode, 404)
  }
}

/**
 * Room is full
 */
export class RoomFullError extends RoomError {
  constructor(roomCode: string, maxPlayers: number = 8) {
    super(`Room '${roomCode}' is full (max ${maxPlayers} players)`, roomCode, 400)
  }
}

/**
 * Game-related errors
 */
export class GameError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'GAME_ERROR', 400, true, context)
  }
}

/**
 * Quiz-related errors
 */
export class QuizError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'QUIZ_ERROR', 400, true, context)
  }
}

// ============================================================================
// Error Type Guards
// ============================================================================

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError
}

export function isExternalAPIError(error: unknown): error is ExternalAPIError {
  return error instanceof ExternalAPIError
}

// ============================================================================
// Error Utilities
// ============================================================================

/**
 * Wraps an unknown error into an AppError
 */
export function wrapError(
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred'
): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(error.message || defaultMessage, 'UNEXPECTED_ERROR', 500, false)
  }

  if (typeof error === 'string') {
    return new AppError(error, 'UNEXPECTED_ERROR', 500, false)
  }

  return new AppError(defaultMessage, 'UNEXPECTED_ERROR', 500, false)
}

/**
 * Extracts a user-friendly error message
 */
export function getUserMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Checks if an error is operational (expected) vs programming error
 */
export function isOperationalError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.isOperational
  }
  return false
}

/**
 * Gets HTTP status code from an error
 */
export function getStatusCode(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode
  }
  return 500
}

/**
 * Formats error for API response (hides sensitive info in production)
 */
export function formatErrorResponse(
  error: unknown,
  includeStack: boolean = process.env.NODE_ENV === 'development'
): {
  error: string
  code: string
  statusCode: number
  details?: Record<string, unknown>
  stack?: string
} {
  const appError = wrapError(error)

  return {
    error: appError.message,
    code: appError.code,
    statusCode: appError.statusCode,
    ...(appError.context && { details: appError.context }),
    ...(includeStack && appError.stack && { stack: appError.stack }),
  }
}
