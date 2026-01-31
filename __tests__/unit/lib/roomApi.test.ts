/**
 * Unit tests for roomApi
 * Tests room creation functions
 */

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

import { createRoom, testRoomCreation, CreateRoomResponse } from '@/lib/roomApi'

describe('roomApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('createRoom', () => {
    it('should create a room successfully', async () => {
      const mockResponse: CreateRoomResponse = {
        success: true,
        data: {
          roomCode: 'ABC123',
          createdAt: '2024-01-01T00:00:00.000Z',
          status: 'waiting',
        },
        message: 'Room created successfully',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await createRoom()

      expect(mockFetch).toHaveBeenCalledWith('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      expect(result.success).toBe(true)
      expect(result.data?.roomCode).toBe('ABC123')
    })

    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            success: false,
            error: 'Room creation failed',
            message: 'Failed to create room',
          }),
      })

      const result = await createRoom()

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await createRoom()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
      expect(result.message).toBe('Failed to create room')
    })

    it('should handle unknown errors', async () => {
      mockFetch.mockRejectedValueOnce('Unknown error string')

      const result = await createRoom()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unknown error')
    })

    it('should return room code in correct format', async () => {
      const mockResponse: CreateRoomResponse = {
        success: true,
        data: {
          roomCode: 'XYZ789',
          createdAt: '2024-01-01T00:00:00.000Z',
          status: 'waiting',
        },
        message: 'Room created',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await createRoom()

      expect(result.data?.roomCode).toMatch(/^[A-Z0-9]+$/)
    })

    it('should return status as waiting for new rooms', async () => {
      const mockResponse: CreateRoomResponse = {
        success: true,
        data: {
          roomCode: 'TEST00',
          createdAt: '2024-01-01T00:00:00.000Z',
          status: 'waiting',
        },
        message: 'Room created',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await createRoom()

      expect(result.data?.status).toBe('waiting')
    })
  })

  describe('testRoomCreation', () => {
    let consoleSpy: jest.SpyInstance

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      jest.spyOn(console, 'error').mockImplementation()
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('should log success message on successful creation', async () => {
      const mockResponse: CreateRoomResponse = {
        success: true,
        data: {
          roomCode: 'SUCC01',
          createdAt: '2024-01-01T00:00:00.000Z',
          status: 'waiting',
        },
        message: 'Room created',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      await testRoomCreation()

      expect(consoleSpy).toHaveBeenCalledWith('Testing room creation...')
      expect(consoleSpy).toHaveBeenCalledWith('✅ Room created successfully!')
      expect(consoleSpy).toHaveBeenCalledWith('Room Code:', 'SUCC01')
    })

    it('should log error message on failed creation', async () => {
      const errorSpy = jest.spyOn(console, 'error')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            success: false,
            error: 'Database error',
            message: 'Failed',
          }),
      })

      await testRoomCreation()

      expect(errorSpy).toHaveBeenCalledWith('❌ Failed to create room:', expect.any(String))
    })

    it('should return the result from createRoom', async () => {
      const mockResponse: CreateRoomResponse = {
        success: true,
        data: {
          roomCode: 'RET001',
          createdAt: '2024-01-01T00:00:00.000Z',
          status: 'waiting',
        },
        message: 'Room created',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await testRoomCreation()

      expect(result).toEqual(mockResponse)
    })
  })

  describe('CreateRoomResponse type', () => {
    it('should handle response without data on error', () => {
      const errorResponse: CreateRoomResponse = {
        success: false,
        error: 'Something went wrong',
        message: 'Failed to create room',
      }

      expect(errorResponse.success).toBe(false)
      expect(errorResponse.data).toBeUndefined()
      expect(errorResponse.error).toBeDefined()
    })

    it('should handle response with data on success', () => {
      const successResponse: CreateRoomResponse = {
        success: true,
        data: {
          roomCode: 'TEST12',
          createdAt: '2024-01-01T00:00:00.000Z',
          status: 'waiting',
        },
        message: 'Success',
      }

      expect(successResponse.success).toBe(true)
      expect(successResponse.data).toBeDefined()
      expect(successResponse.data?.roomCode).toBe('TEST12')
    })
  })
})
