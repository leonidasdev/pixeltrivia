/**
 * @jest-environment node
 */

/**
 * Integration tests for POST /api/upload
 */

jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn(() => null),
  RATE_LIMITS: { aiGeneration: { windowMs: 60000, maxRequests: 5 } },
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}))

jest.mock('@/lib/fileParser', () => ({
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  MAX_FILES: 5,
  parseFiles: jest.fn(),
  buildFilesSummary: jest.fn(),
}))

import { POST, GET, PUT, DELETE } from '@/app/api/upload/route'
import { NextRequest } from 'next/server'
import { parseFiles, buildFilesSummary } from '@/lib/fileParser'

const mockParseFiles = parseFiles as jest.MockedFunction<typeof parseFiles>
const mockBuildSummary = buildFilesSummary as jest.MockedFunction<typeof buildFilesSummary>

function createUploadRequest(
  files: Array<{ name: string; content: string; type?: string }>
): NextRequest {
  const formData = new FormData()
  files.forEach(f => {
    const blob = new Blob([f.content], { type: f.type || 'text/plain' })
    formData.append('files', new File([blob], f.name, { type: f.type || 'text/plain' }))
  })

  return new NextRequest('http://localhost/api/upload', {
    method: 'POST',
    body: formData,
  })
}

function createJsonRequest(): NextRequest {
  return new NextRequest('http://localhost/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: [] }),
  })
}

describe('POST /api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns parsed files on success', async () => {
    mockParseFiles.mockResolvedValue({
      parsed: [{ name: 'doc.txt', text: 'Hello world', type: 'txt', size: 11 }],
      errors: [],
    })
    mockBuildSummary.mockReturnValue('--- doc.txt ---\nHello world')

    const response = await POST(createUploadRequest([{ name: 'doc.txt', content: 'Hello world' }]))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.files).toHaveLength(1)
    expect(body.data.files[0].name).toBe('doc.txt')
    expect(body.data.summary).toContain('Hello world')
    expect(body.data.errors).toHaveLength(0)
  })

  it('rejects non-multipart requests', async () => {
    const response = await POST(createJsonRequest())
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain('multipart')
  })

  it('returns validation error when no files uploaded', async () => {
    const formData = new FormData()
    const request = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('returns error when all files fail to parse', async () => {
    mockParseFiles.mockResolvedValue({
      parsed: [],
      errors: [{ file: 'bad.exe', reason: 'Unsupported file type' }],
    })

    const response = await POST(
      createUploadRequest([{ name: 'bad.exe', content: 'nope', type: 'application/x-msdownload' }])
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain('No files could be parsed')
  })

  it('includes partial errors alongside parsed files', async () => {
    mockParseFiles.mockResolvedValue({
      parsed: [{ name: 'good.txt', text: 'Content', type: 'txt', size: 7 }],
      errors: [{ file: 'bad.bin', reason: 'Unsupported' }],
    })
    mockBuildSummary.mockReturnValue('--- good.txt ---\nContent')

    const response = await POST(
      createUploadRequest([
        { name: 'good.txt', content: 'Content' },
        { name: 'bad.bin', content: 'nope', type: 'application/octet-stream' },
      ])
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.data.files).toHaveLength(1)
    expect(body.data.errors).toHaveLength(1)
  })
})

describe('unsupported methods', () => {
  it('GET returns 405', async () => {
    const response = await GET()
    expect(response.status).toBe(405)
  })

  it('PUT returns 405', async () => {
    const response = await PUT()
    expect(response.status).toBe(405)
  })

  it('DELETE returns 405', async () => {
    const response = await DELETE()
    expect(response.status).toBe(405)
  })
})
