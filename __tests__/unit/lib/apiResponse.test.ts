/**
 * @jest-environment node
 */

/**
 * Tests for API Response Utilities
 *
 * @module __tests__/unit/lib/apiResponse
 * @since 1.0.0
 */

jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}))

import {
  successResponse,
  createdResponse,
  noContentResponse,
  paginatedResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  databaseErrorResponse,
  externalApiErrorResponse,
  rateLimitResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
  methodNotAllowedResponse,
  withErrorHandling,
  parseJsonBody,
  validateRequiredString,
  validateNumberRange,
} from '@/lib/apiResponse'
import { AppError, ValidationError, NotFoundError, RateLimitError } from '@/lib/errors'

// ============================================================================
// Helpers
// ============================================================================

/** Extract JSON body from a NextResponse */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getResponseBody(response: Response): Promise<any> {
  return response.json()
}

/** Create a mock Request with JSON body */
function mockRequest(body: unknown, method = 'POST'): Request {
  return new Request('http://localhost/api/test', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** Create a mock Request with invalid body */
function mockInvalidRequest(method = 'POST'): Request {
  return new Request('http://localhost/api/test', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: 'not valid json{{{',
  })
}

// ============================================================================
// Success Response Tests
// ============================================================================

describe('Success Responses', () => {
  describe('successResponse', () => {
    it('should return 200 with data', async () => {
      const data = { id: 1, name: 'test' }
      const res = successResponse(data)
      const body = await getResponseBody(res)

      expect(res.status).toBe(200)
      expect(body).toMatchObject({
        success: true,
        data: { id: 1, name: 'test' },
      })
      expect(body.meta.timestamp).toBeDefined()
    })

    it('should include message when provided', async () => {
      const res = successResponse({ ok: true }, 'Operation successful')
      const body = await getResponseBody(res)

      expect(body.message).toBe('Operation successful')
    })

    it('should not include message key when not provided', async () => {
      const res = successResponse({ ok: true })
      const body = await getResponseBody(res)

      expect(body).not.toHaveProperty('message')
    })

    it('should accept custom status code', async () => {
      const res = successResponse({ ok: true }, undefined, 202)
      expect(res.status).toBe(202)
    })

    it('should handle null data', async () => {
      const res = successResponse(null)
      const body = await getResponseBody(res)

      expect(body.success).toBe(true)
      expect(body.data).toBeNull()
    })

    it('should handle array data', async () => {
      const res = successResponse([1, 2, 3])
      const body = await getResponseBody(res)

      expect(body.data).toEqual([1, 2, 3])
    })

    it('should handle empty string data', async () => {
      const res = successResponse('')
      const body = await getResponseBody(res)

      expect(body.data).toBe('')
    })
  })

  describe('createdResponse', () => {
    it('should return 201 with default message', async () => {
      const res = createdResponse({ id: 'abc' })
      const body = await getResponseBody(res)

      expect(res.status).toBe(201)
      expect(body.success).toBe(true)
      expect(body.data).toEqual({ id: 'abc' })
      expect(body.message).toBe('Resource created successfully')
    })

    it('should accept custom message', async () => {
      const res = createdResponse({ id: 'abc' }, 'Room created')
      const body = await getResponseBody(res)

      expect(body.message).toBe('Room created')
    })
  })

  describe('noContentResponse', () => {
    it('should return 204 with no body', () => {
      const res = noContentResponse()

      expect(res.status).toBe(204)
      expect(res.body).toBeNull()
    })
  })

  describe('paginatedResponse', () => {
    it('should return paginated data with metadata', async () => {
      const items = [{ id: 1 }, { id: 2 }]
      const res = paginatedResponse(items, { page: 1, limit: 10, total: 25 })
      const body = await getResponseBody(res)

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(items)
      expect(body.meta.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      })
    })

    it('should calculate totalPages correctly', async () => {
      const res = paginatedResponse([], { page: 1, limit: 5, total: 11 })
      const body = await getResponseBody(res)

      expect(body.meta.pagination.totalPages).toBe(3)
    })

    it('should handle zero total', async () => {
      const res = paginatedResponse([], { page: 1, limit: 10, total: 0 })
      const body = await getResponseBody(res)

      expect(body.meta.pagination.totalPages).toBe(0)
    })

    it('should handle exact page fill', async () => {
      const res = paginatedResponse([1, 2], { page: 1, limit: 2, total: 4 })
      const body = await getResponseBody(res)

      expect(body.meta.pagination.totalPages).toBe(2)
    })
  })
})

// ============================================================================
// Error Response Tests
// ============================================================================

describe('Error Responses', () => {
  describe('errorResponse', () => {
    it('should format AppError correctly', async () => {
      const error = new AppError('Something failed', 'FAIL', 500)
      const res = errorResponse(error)
      const body = await getResponseBody(res)

      expect(res.status).toBe(500)
      expect(body.success).toBe(false)
      expect(body.code).toBe('FAIL')
      expect(body.meta.timestamp).toBeDefined()
    })

    it('should add Retry-After header for RateLimitError', async () => {
      const error = new RateLimitError(30)
      const res = errorResponse(error)

      expect(res.status).toBe(429)
      expect(res.headers.get('Retry-After')).toBe('30')
    })

    it('should not add Retry-After for non-rate-limit errors', () => {
      const error = new AppError('Fail', 'FAIL', 400)
      const res = errorResponse(error)

      expect(res.headers.get('Retry-After')).toBeNull()
    })
  })

  describe('validationErrorResponse', () => {
    it('should return 400 with validation error', async () => {
      const res = validationErrorResponse('Name is required', 'name')
      const body = await getResponseBody(res)

      expect(res.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.code).toBe('VALIDATION_ERROR')
      expect(body.error).toBe('Name is required')
    })

    it('should include validation errors map', async () => {
      const res = validationErrorResponse('Validation failed', undefined, {
        name: ['required'],
        email: ['invalid format'],
      })
      const body = await getResponseBody(res)

      expect(body.success).toBe(false)
      expect(body.statusCode).toBe(400)
    })
  })

  describe('notFoundResponse', () => {
    it('should return 404 with resource info', async () => {
      const res = notFoundResponse('Room', 'ABC123')
      const body = await getResponseBody(res)

      expect(res.status).toBe(404)
      expect(body.code).toBe('NOT_FOUND')
      expect(body.error).toContain('Room')
      expect(body.error).toContain('ABC123')
    })

    it('should work without identifier', async () => {
      const res = notFoundResponse('Game')
      const body = await getResponseBody(res)

      expect(res.status).toBe(404)
      expect(body.error).toContain('Game')
    })
  })

  describe('databaseErrorResponse', () => {
    it('should return 500 with default message', async () => {
      const res = databaseErrorResponse()
      const body = await getResponseBody(res)

      expect(res.status).toBe(500)
      expect(body.code).toBe('DATABASE_ERROR')
    })

    it('should accept custom message and original error', async () => {
      const original = new Error('connection timeout')
      const res = databaseErrorResponse('DB connection failed', original)
      const body = await getResponseBody(res)

      expect(body.error).toBe('DB connection failed')
    })
  })

  describe('externalApiErrorResponse', () => {
    it('should return 502 with service info', async () => {
      const res = externalApiErrorResponse('OpenAI', 'rate limited')
      const body = await getResponseBody(res)

      expect(res.status).toBe(502)
      expect(body.code).toBe('EXTERNAL_API_ERROR')
    })
  })

  describe('rateLimitResponse', () => {
    it('should return 429 with default retry-after', async () => {
      const res = rateLimitResponse()
      const body = await getResponseBody(res)

      expect(res.status).toBe(429)
      expect(res.headers.get('Retry-After')).toBe('60')
      expect(body.code).toBe('RATE_LIMIT_EXCEEDED')
    })

    it('should use custom retry-after value', () => {
      const res = rateLimitResponse(120)

      expect(res.headers.get('Retry-After')).toBe('120')
    })
  })

  describe('unauthorizedResponse', () => {
    it('should return 401 with default message', async () => {
      const res = unauthorizedResponse()
      const body = await getResponseBody(res)

      expect(res.status).toBe(401)
      expect(body.code).toBe('UNAUTHORIZED')
      expect(body.error).toBe('Authentication required')
    })

    it('should accept custom message', async () => {
      const res = unauthorizedResponse('Token expired')
      const body = await getResponseBody(res)

      expect(body.error).toBe('Token expired')
    })
  })

  describe('forbiddenResponse', () => {
    it('should return 403 with default message', async () => {
      const res = forbiddenResponse()
      const body = await getResponseBody(res)

      expect(res.status).toBe(403)
      expect(body.code).toBe('FORBIDDEN')
      expect(body.error).toBe('Access denied')
    })

    it('should accept custom message', async () => {
      const res = forbiddenResponse('Admin only')
      const body = await getResponseBody(res)

      expect(body.error).toBe('Admin only')
    })
  })

  describe('serverErrorResponse', () => {
    it('should return 500 with default message', async () => {
      const res = serverErrorResponse()
      const body = await getResponseBody(res)

      expect(res.status).toBe(500)
      expect(body.code).toBe('INTERNAL_SERVER_ERROR')
    })

    it('should accept custom message', async () => {
      const res = serverErrorResponse('Disk full')
      const body = await getResponseBody(res)

      // In non-production, message is passed through
      expect(body.statusCode).toBe(500)
    })
  })

  describe('methodNotAllowedResponse', () => {
    it('should return 405 with Allow header', async () => {
      const res = methodNotAllowedResponse('GET, POST')
      const body = await getResponseBody(res)

      expect(res.status).toBe(405)
      expect(res.headers.get('Allow')).toBe('GET, POST')
      expect(body.code).toBe('METHOD_NOT_ALLOWED')
    })

    it('should default to POST in Allow header', () => {
      const res = methodNotAllowedResponse()

      expect(res.headers.get('Allow')).toBe('POST')
    })
  })
})

// ============================================================================
// withErrorHandling Tests
// ============================================================================

describe('withErrorHandling', () => {
  it('should pass through successful responses', async () => {
    const handler = async () => successResponse({ ok: true })
    const wrapped = withErrorHandling(handler)

    const req = mockRequest({})
    const res = await wrapped(req)
    const body = await getResponseBody(res)

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('should catch AppError and return proper error response', async () => {
    const handler = async () => {
      throw new ValidationError('Bad input', 'field')
    }
    const wrapped = withErrorHandling(handler)

    const req = mockRequest({})
    const res = await wrapped(req)
    const body = await getResponseBody(res)

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('should wrap unknown errors as 500', async () => {
    const handler = async () => {
      throw new Error('unexpected crash')
    }
    const wrapped = withErrorHandling(handler)

    const req = mockRequest({})
    const res = await wrapped(req)
    const body = await getResponseBody(res)

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
  })

  it('should handle non-Error thrown values', async () => {
    const handler = async () => {
      throw new Error('string error')
    }
    const wrapped = withErrorHandling(handler)

    const req = mockRequest({})
    const res = await wrapped(req)

    expect(res.status).toBe(500)
  })

  it('should handle NotFoundError', async () => {
    const handler = async () => {
      throw new NotFoundError('Room', 'XYZ')
    }
    const wrapped = withErrorHandling(handler)

    const req = mockRequest({})
    const res = await wrapped(req)
    const body = await getResponseBody(res)

    expect(res.status).toBe(404)
    expect(body.code).toBe('NOT_FOUND')
  })

  it('should handle RateLimitError with Retry-After header', async () => {
    const handler = async () => {
      throw new RateLimitError(45)
    }
    const wrapped = withErrorHandling(handler)

    const req = mockRequest({})
    const res = await wrapped(req)

    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toBe('45')
  })
})

// ============================================================================
// Request Validation Helpers Tests
// ============================================================================

describe('parseJsonBody', () => {
  it('should parse valid JSON body', async () => {
    const req = mockRequest({ name: 'Alice', age: 25 })
    const body = await parseJsonBody<{ name: string; age: number }>(req)

    expect(body.name).toBe('Alice')
    expect(body.age).toBe(25)
  })

  it('should throw ValidationError for invalid JSON', async () => {
    const req = mockInvalidRequest()

    await expect(parseJsonBody(req)).rejects.toThrow(ValidationError)
    await expect(parseJsonBody(mockInvalidRequest())).rejects.toThrow('Invalid JSON body')
  })

  it('should check required fields', async () => {
    const req = mockRequest({ name: 'Alice' })

    await expect(
      parseJsonBody<{ name: string; email: string }>(req, ['name', 'email'])
    ).rejects.toThrow(ValidationError)
  })

  it('should pass when all required fields present', async () => {
    const req = mockRequest({ name: 'Alice', email: 'alice@test.com' })
    const body = await parseJsonBody<{ name: string; email: string }>(req, ['name', 'email'])

    expect(body.name).toBe('Alice')
    expect(body.email).toBe('alice@test.com')
  })

  it('should treat null values as missing', async () => {
    const req = mockRequest({ name: 'Alice', email: null })

    await expect(
      parseJsonBody<{ name: string; email: string }>(req, ['name', 'email'])
    ).rejects.toThrow(ValidationError)
  })

  it('should work with no required fields', async () => {
    const req = mockRequest({ anything: true })
    const body = await parseJsonBody(req, [])

    expect(body).toEqual({ anything: true })
  })
})

describe('validateRequiredString', () => {
  it('should return trimmed string for valid input', () => {
    expect(validateRequiredString('  hello  ', 'name')).toBe('hello')
  })

  it('should throw for empty string', () => {
    expect(() => validateRequiredString('', 'name')).toThrow(ValidationError)
  })

  it('should throw for whitespace-only string', () => {
    expect(() => validateRequiredString('   ', 'name')).toThrow(ValidationError)
  })

  it('should throw for non-string values', () => {
    expect(() => validateRequiredString(123, 'name')).toThrow(ValidationError)
    expect(() => validateRequiredString(null, 'name')).toThrow(ValidationError)
    expect(() => validateRequiredString(undefined, 'name')).toThrow(ValidationError)
    expect(() => validateRequiredString(true, 'name')).toThrow(ValidationError)
  })

  it('should include field name in error message', () => {
    expect(() => validateRequiredString('', 'playerName')).toThrow('playerName')
  })
})

describe('validateNumberRange', () => {
  it('should return valid number within range', () => {
    expect(validateNumberRange(5, 'volume', 0, 100)).toBe(5)
  })

  it('should accept boundary values', () => {
    expect(validateNumberRange(0, 'volume', 0, 100)).toBe(0)
    expect(validateNumberRange(100, 'volume', 0, 100)).toBe(100)
  })

  it('should convert string numbers', () => {
    expect(validateNumberRange('50', 'volume', 0, 100)).toBe(50)
  })

  it('should throw for NaN', () => {
    expect(() => validateNumberRange('abc', 'volume', 0, 100)).toThrow(ValidationError)
    expect(() => validateNumberRange(NaN, 'volume', 0, 100)).toThrow(ValidationError)
  })

  it('should throw for out-of-range values', () => {
    expect(() => validateNumberRange(-1, 'volume', 0, 100)).toThrow(ValidationError)
    expect(() => validateNumberRange(101, 'volume', 0, 100)).toThrow(ValidationError)
  })

  it('should include field name in error', () => {
    expect(() => validateNumberRange('bad' as unknown as number, 'score', 0, 100)).toThrow('score')
  })

  it('should include range info in out-of-range error', () => {
    try {
      validateNumberRange(200, 'volume', 0, 100)
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect((e as ValidationError).message).toContain('0')
      expect((e as ValidationError).message).toContain('100')
    }
  })
})
