/**
 * Tests for custom error classes
 */

import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalAPIError,
  AIGenerationError,
  RoomError,
  RoomNotFoundError,
  RoomFullError,
  GameError,
  QuizError,
  isAppError,
  isValidationError,
  isNotFoundError,
  isDatabaseError,
  isExternalAPIError,
  wrapError,
  getUserMessage,
  isOperationalError,
  getStatusCode,
  formatErrorResponse,
} from '@/lib/errors'

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an error with default values', () => {
      const error = new AppError('Test error')

      expect(error.message).toBe('Test error')
      expect(error.code).toBe('APP_ERROR')
      expect(error.statusCode).toBe(500)
      expect(error.isOperational).toBe(true)
      expect(error.timestamp).toBeInstanceOf(Date)
      expect(error.name).toBe('AppError')
    })

    it('should create an error with custom values', () => {
      const error = new AppError('Custom error', 'CUSTOM_CODE', 418, false, { foo: 'bar' })

      expect(error.message).toBe('Custom error')
      expect(error.code).toBe('CUSTOM_CODE')
      expect(error.statusCode).toBe(418)
      expect(error.isOperational).toBe(false)
      expect(error.context).toEqual({ foo: 'bar' })
    })

    it('should serialize to JSON correctly', () => {
      const error = new AppError('Test', 'TEST', 400, true, { detail: 'info' })
      const json = error.toJSON()

      expect(json.name).toBe('AppError')
      expect(json.message).toBe('Test')
      expect(json.code).toBe('TEST')
      expect(json.statusCode).toBe(400)
      expect(json.context).toEqual({ detail: 'info' })
      expect(json.timestamp).toBeDefined()
    })
  })

  describe('ValidationError', () => {
    it('should create validation error with field', () => {
      const error = new ValidationError('Invalid email', 'email')

      expect(error.message).toBe('Invalid email')
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.statusCode).toBe(400)
      expect(error.field).toBe('email')
    })

    it('should create validation error with multiple errors', () => {
      const validationErrors = {
        email: ['Invalid format', 'Already exists'],
        password: ['Too short'],
      }
      const error = new ValidationError('Validation failed', undefined, validationErrors)

      expect(error.validationErrors).toEqual(validationErrors)
    })
  })

  describe('AuthenticationError', () => {
    it('should create with default message', () => {
      const error = new AuthenticationError()

      expect(error.message).toBe('Authentication required')
      expect(error.statusCode).toBe(401)
    })

    it('should create with custom message', () => {
      const error = new AuthenticationError('Token expired')

      expect(error.message).toBe('Token expired')
    })
  })

  describe('AuthorizationError', () => {
    it('should create with default message', () => {
      const error = new AuthorizationError()

      expect(error.message).toBe('You do not have permission to perform this action')
      expect(error.statusCode).toBe(403)
    })
  })

  describe('NotFoundError', () => {
    it('should create with resource name', () => {
      const error = new NotFoundError('User')

      expect(error.message).toBe('User not found')
      expect(error.statusCode).toBe(404)
      expect(error.resource).toBe('User')
    })

    it('should create with resource and identifier', () => {
      const error = new NotFoundError('Room', 'ABC123')

      expect(error.message).toBe("Room with identifier 'ABC123' not found")
    })
  })

  describe('ConflictError', () => {
    it('should create conflict error', () => {
      const error = new ConflictError('Username already exists')

      expect(error.statusCode).toBe(409)
      expect(error.code).toBe('CONFLICT')
    })
  })

  describe('RateLimitError', () => {
    it('should create with default retry', () => {
      const error = new RateLimitError()

      expect(error.statusCode).toBe(429)
      expect(error.retryAfter).toBe(60)
      expect(error.message).toContain('60 seconds')
    })

    it('should create with custom retry', () => {
      const error = new RateLimitError(120)

      expect(error.retryAfter).toBe(120)
      expect(error.message).toContain('120 seconds')
    })
  })

  describe('DatabaseError', () => {
    it('should wrap original error', () => {
      const originalError = new Error('Connection failed')
      const error = new DatabaseError('Database unavailable', originalError)

      expect(error.statusCode).toBe(500)
      expect(error.originalError).toBe(originalError)
      expect(error.context?.originalMessage).toBe('Connection failed')
    })
  })

  describe('ExternalAPIError', () => {
    it('should include service name', () => {
      const error = new ExternalAPIError('OpenRouter', 'Rate limited')

      expect(error.statusCode).toBe(502)
      expect(error.service).toBe('OpenRouter')
      expect(error.message).toContain('OpenRouter')
    })
  })

  describe('AIGenerationError', () => {
    it('should create AI generation error', () => {
      const error = new AIGenerationError('Failed to generate questions', { topic: 'history' })

      expect(error.code).toBe('AI_GENERATION_ERROR')
      expect(error.context?.topic).toBe('history')
    })
  })

  describe('RoomError', () => {
    it('should include room code', () => {
      const error = new RoomError('Room is locked', 'ABC123')

      expect(error.roomCode).toBe('ABC123')
      expect(error.code).toBe('ROOM_ERROR')
    })
  })

  describe('RoomNotFoundError', () => {
    it('should format message correctly', () => {
      const error = new RoomNotFoundError('XYZ789')

      expect(error.message).toContain('XYZ789')
      expect(error.message).toContain('not found')
      expect(error.statusCode).toBe(404)
    })
  })

  describe('RoomFullError', () => {
    it('should use default max players', () => {
      const error = new RoomFullError('ABC123')

      expect(error.message).toContain('8 players')
    })

    it('should use custom max players', () => {
      const error = new RoomFullError('ABC123', 4)

      expect(error.message).toContain('4 players')
    })
  })

  describe('GameError', () => {
    it('should create game error', () => {
      const error = new GameError('Game already started')

      expect(error.code).toBe('GAME_ERROR')
      expect(error.statusCode).toBe(400)
    })
  })

  describe('QuizError', () => {
    it('should create quiz error', () => {
      const error = new QuizError('Invalid answer')

      expect(error.code).toBe('QUIZ_ERROR')
    })
  })
})

describe('Type Guards', () => {
  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      expect(isAppError(new AppError('test'))).toBe(true)
      expect(isAppError(new ValidationError('test'))).toBe(true)
      expect(isAppError(new NotFoundError('test'))).toBe(true)
    })

    it('should return false for non-AppError', () => {
      expect(isAppError(new Error('test'))).toBe(false)
      expect(isAppError('error')).toBe(false)
      expect(isAppError(null)).toBe(false)
    })
  })

  describe('isValidationError', () => {
    it('should identify ValidationError', () => {
      expect(isValidationError(new ValidationError('test'))).toBe(true)
      expect(isValidationError(new AppError('test'))).toBe(false)
    })
  })

  describe('isNotFoundError', () => {
    it('should identify NotFoundError', () => {
      expect(isNotFoundError(new NotFoundError('User'))).toBe(true)
      expect(isNotFoundError(new AppError('test'))).toBe(false)
    })
  })

  describe('isDatabaseError', () => {
    it('should identify DatabaseError', () => {
      expect(isDatabaseError(new DatabaseError('test'))).toBe(true)
      expect(isDatabaseError(new AppError('test'))).toBe(false)
    })
  })

  describe('isExternalAPIError', () => {
    it('should identify ExternalAPIError', () => {
      expect(isExternalAPIError(new ExternalAPIError('API', 'test'))).toBe(true)
      expect(isExternalAPIError(new AppError('test'))).toBe(false)
    })
  })
})

describe('Error Utilities', () => {
  describe('wrapError', () => {
    it('should return AppError as-is', () => {
      const error = new ValidationError('test')
      expect(wrapError(error)).toBe(error)
    })

    it('should wrap Error objects', () => {
      const error = new Error('Standard error')
      const wrapped = wrapError(error)

      expect(wrapped).toBeInstanceOf(AppError)
      expect(wrapped.message).toBe('Standard error')
    })

    it('should wrap string errors', () => {
      const wrapped = wrapError('String error')

      expect(wrapped).toBeInstanceOf(AppError)
      expect(wrapped.message).toBe('String error')
    })

    it('should use default message for unknown errors', () => {
      const wrapped = wrapError(null, 'Default message')

      expect(wrapped.message).toBe('Default message')
    })
  })

  describe('getUserMessage', () => {
    it('should extract message from AppError', () => {
      const error = new ValidationError('Invalid input')
      expect(getUserMessage(error)).toBe('Invalid input')
    })

    it('should extract message from Error', () => {
      const error = new Error('Standard error')
      expect(getUserMessage(error)).toBe('Standard error')
    })

    it('should return string as-is', () => {
      expect(getUserMessage('Error string')).toBe('Error string')
    })

    it('should return default for unknown', () => {
      expect(getUserMessage(null)).toBe('An unexpected error occurred. Please try again.')
    })
  })

  describe('isOperationalError', () => {
    it('should return true for operational errors', () => {
      expect(isOperationalError(new ValidationError('test'))).toBe(true)
    })

    it('should return false for non-operational errors', () => {
      const error = new AppError('test', 'TEST', 500, false)
      expect(isOperationalError(error)).toBe(false)
    })

    it('should return false for non-AppError', () => {
      expect(isOperationalError(new Error('test'))).toBe(false)
    })
  })

  describe('getStatusCode', () => {
    it('should return status code from AppError', () => {
      expect(getStatusCode(new ValidationError('test'))).toBe(400)
      expect(getStatusCode(new NotFoundError('test'))).toBe(404)
      expect(getStatusCode(new RateLimitError())).toBe(429)
    })

    it('should return 500 for non-AppError', () => {
      expect(getStatusCode(new Error('test'))).toBe(500)
      expect(getStatusCode('error')).toBe(500)
    })
  })

  describe('formatErrorResponse', () => {
    it('should format AppError correctly', () => {
      const error = new ValidationError('Invalid email', 'email')
      const response = formatErrorResponse(error, false)

      expect(response.error).toBe('Invalid email')
      expect(response.code).toBe('VALIDATION_ERROR')
      expect(response.statusCode).toBe(400)
      expect(response.stack).toBeUndefined()
    })

    it('should include stack in development', () => {
      const error = new AppError('test')
      const response = formatErrorResponse(error, true)

      expect(response.stack).toBeDefined()
    })

    it('should wrap non-AppError', () => {
      const error = new Error('Standard error')
      const response = formatErrorResponse(error, false)

      expect(response.error).toBe('Standard error')
      expect(response.code).toBe('UNEXPECTED_ERROR')
    })
  })
})
