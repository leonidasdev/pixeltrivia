/**
 * Logger Utility
 *
 * Centralized logging utility for consistent logging across the application.
 * Replaces direct console usage with environment-aware logging.
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
}

// ============================================================================
// Configuration
// ============================================================================

const isDevelopment = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'

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
// Logger Implementation
// ============================================================================

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  const { level, message, data, timestamp } = entry
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`

  if (data !== undefined) {
    return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`
  }

  return `${prefix} ${message}`
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
function createLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
  return {
    level,
    message,
    data,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Logger object with level-specific methods
 */
export const logger = {
  /**
   * Debug level logging - only in development
   */
  debug(message: string, data?: unknown): void {
    if (!shouldLog('debug')) return
    const entry = createLogEntry('debug', message, data)
    // eslint-disable-next-line no-console
    console.debug(formatLogEntry(entry))
  },

  /**
   * Info level logging
   */
  info(message: string, data?: unknown): void {
    if (!shouldLog('info')) return
    const entry = createLogEntry('info', message, data)
    // eslint-disable-next-line no-console
    console.info(formatLogEntry(entry))
  },

  /**
   * Warning level logging
   */
  warn(message: string, data?: unknown): void {
    if (!shouldLog('warn')) return
    const entry = createLogEntry('warn', message, data)
    // eslint-disable-next-line no-console
    console.warn(formatLogEntry(entry))
  },

  /**
   * Error level logging
   */
  error(message: string, error?: unknown): void {
    if (!shouldLog('error')) return
    const entry = createLogEntry('error', message, error)
    // eslint-disable-next-line no-console
    console.error(formatLogEntry(entry))
  },

  /**
   * Log API request details (info level)
   */
  apiRequest(method: string, path: string, data?: unknown): void {
    this.info(`API ${method} ${path}`, data)
  },

  /**
   * Log API response details (info level)
   */
  apiResponse(method: string, path: string, status: number, data?: unknown): void {
    this.info(`API ${method} ${path} -> ${status}`, data)
  },

  /**
   * Log API error details (error level)
   */
  apiError(method: string, path: string, error: unknown): void {
    this.error(`API ${method} ${path} failed`, error)
  },
}

// ============================================================================
// Default Export
// ============================================================================

export default logger
