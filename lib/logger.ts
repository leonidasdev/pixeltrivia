/**
 * Logger Utility
 *
 * Centralized logging utility for consistent logging across the application.
 * Replaces direct console usage with environment-aware logging.
 *
 * In production, outputs structured JSON for log aggregation platforms.
 * In development, outputs human-readable formatted strings.
 * Supports request IDs for tracing requests across log entries.
 *
 * @module lib/logger
 * @since 1.0.0
 */

// ============================================================================
// Types
// ============================================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: unknown
  timestamp: string
  requestId?: string
}

// ============================================================================
// Configuration
// ============================================================================

const isDevelopment = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'
const isProduction = process.env.NODE_ENV === 'production'

/**
 * Minimum log level for each environment
 */
const LOG_LEVELS: Record<string, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const MIN_LOG_LEVEL = isDevelopment ? 'debug' : 'info'

// ============================================================================
// Request ID Tracking
// ============================================================================

/**
 * Generate a unique request ID.
 * Uses crypto.randomUUID when available, falls back to timestamp-based ID.
 */
function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Extract or generate a request ID from an incoming request.
 * Checks standard tracing headers first, generates a new ID if none found.
 */
export function getRequestId(request?: Request): string {
  if (request) {
    const existing =
      request.headers.get('x-request-id') ||
      request.headers.get('x-correlation-id') ||
      request.headers.get('x-trace-id')
    if (existing) return existing
  }
  return generateRequestId()
}

// ============================================================================
// Logger Implementation
// ============================================================================

/**
 * Format log entry for development output (human-readable)
 */
function formatLogEntryDev(entry: LogEntry): string {
  const { level, message, data, timestamp, requestId } = entry
  const reqPart = requestId ? ` [${requestId}]` : ''
  const prefix = `[${timestamp}] [${level.toUpperCase()}]${reqPart}`

  if (data !== undefined) {
    return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`
  }

  return `${prefix} ${message}`
}

/**
 * Format log entry for production output (structured JSON).
 * Structured JSON is parseable by log aggregation platforms
 * (CloudWatch, Datadog, Vercel Logs, etc.).
 */
function formatLogEntryProd(entry: LogEntry): string {
  const structured: Record<string, unknown> = {
    level: entry.level,
    msg: entry.message,
    time: entry.timestamp,
  }
  if (entry.requestId) structured.requestId = entry.requestId
  if (entry.data !== undefined) {
    if (entry.data instanceof Error) {
      structured.error = {
        name: entry.data.name,
        message: entry.data.message,
        stack: entry.data.stack,
      }
    } else {
      structured.data = entry.data
    }
  }
  return JSON.stringify(structured)
}

/**
 * Format a log entry based on environment
 */
function formatLogEntry(entry: LogEntry): string {
  return isProduction ? formatLogEntryProd(entry) : formatLogEntryDev(entry)
}

/**
 * Check if log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  if (isTest) return false // Suppress logs during tests
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL]
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  data?: unknown,
  requestId?: string
): LogEntry {
  return {
    level,
    message,
    data,
    timestamp: new Date().toISOString(),
    ...(requestId && { requestId }),
  }
}

/**
 * Logger object with level-specific methods.
 *
 * All methods accept an optional `requestId` parameter for request tracing.
 * In production, output is structured JSON for log aggregation.
 */
export const logger = {
  /**
   * Debug level logging - only in development
   */
  debug(message: string, data?: unknown, requestId?: string): void {
    if (!shouldLog('debug')) return
    const entry = createLogEntry('debug', message, data, requestId)
    // eslint-disable-next-line no-console
    console.debug(formatLogEntry(entry))
  },

  /**
   * Info level logging
   */
  info(message: string, data?: unknown, requestId?: string): void {
    if (!shouldLog('info')) return
    const entry = createLogEntry('info', message, data, requestId)
    // eslint-disable-next-line no-console
    console.info(formatLogEntry(entry))
  },

  /**
   * Warning level logging
   */
  warn(message: string, data?: unknown, requestId?: string): void {
    if (!shouldLog('warn')) return
    const entry = createLogEntry('warn', message, data, requestId)
    // eslint-disable-next-line no-console
    console.warn(formatLogEntry(entry))
  },

  /**
   * Error level logging
   */
  error(message: string, error?: unknown, requestId?: string): void {
    if (!shouldLog('error')) return
    const entry = createLogEntry('error', message, error, requestId)
    // eslint-disable-next-line no-console
    console.error(formatLogEntry(entry))
  },

  /**
   * Log API request details (info level)
   */
  apiRequest(method: string, path: string, data?: unknown, requestId?: string): void {
    this.info(`API ${method} ${path}`, data, requestId)
  },

  /**
   * Log API response details (info level)
   */
  apiResponse(
    method: string,
    path: string,
    status: number,
    data?: unknown,
    requestId?: string
  ): void {
    this.info(`API ${method} ${path} -> ${status}`, data, requestId)
  },

  /**
   * Log API error details (error level)
   */
  apiError(method: string, path: string, error: unknown, requestId?: string): void {
    this.error(`API ${method} ${path} failed`, error, requestId)
  },

  /**
   * Create a child logger bound to a specific request ID.
   * Useful in API route handlers so every log call automatically
   * includes the request ID without passing it explicitly.
   */
  child(requestId: string) {
    return {
      debug: (message: string, data?: unknown) => logger.debug(message, data, requestId),
      info: (message: string, data?: unknown) => logger.info(message, data, requestId),
      warn: (message: string, data?: unknown) => logger.warn(message, data, requestId),
      error: (message: string, error?: unknown) => logger.error(message, error, requestId),
      apiRequest: (method: string, path: string, data?: unknown) =>
        logger.apiRequest(method, path, data, requestId),
      apiResponse: (method: string, path: string, status: number, data?: unknown) =>
        logger.apiResponse(method, path, status, data, requestId),
      apiError: (method: string, path: string, error: unknown) =>
        logger.apiError(method, path, error, requestId),
    }
  },
}
