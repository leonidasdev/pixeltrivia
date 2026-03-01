/**
 * File Upload API — POST /api/upload
 *
 * Accepts multipart form data with document files (PDF, DOCX, TXT, MD),
 * extracts text content, and returns parsed results for quiz generation.
 *
 * @module api/upload
 * @since 1.0.0
 */

import { type NextRequest } from 'next/server'
import { logger } from '@/lib/logger'
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
  methodNotAllowedResponse,
  rateLimitResponse,
} from '@/lib/apiResponse'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'
import { parseFiles, buildFilesSummary, MAX_FILE_SIZE, MAX_FILES } from '@/lib/fileParser'

export async function POST(request: NextRequest) {
  const rateLimited = rateLimit(request, RATE_LIMITS.aiGeneration)
  if (rateLimited) return rateLimited

  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return validationErrorResponse('Expected multipart/form-data content type', 'content-type')
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return validationErrorResponse('Failed to parse form data')
    }

    const entries = formData.getAll('files')
    const files = entries.filter((entry): entry is File => entry instanceof File)

    if (files.length === 0) {
      return validationErrorResponse(
        `No files found in request. Send files with field name "files". Max ${MAX_FILES} files, ${MAX_FILE_SIZE / (1024 * 1024)} MB each.`,
        'files'
      )
    }

    logger.info(`Processing ${files.length} uploaded file(s)`)
    const result = await parseFiles(files)

    if (result.parsed.length === 0) {
      return validationErrorResponse(
        `No files could be parsed. Errors: ${result.errors.map(e => `${e.file}: ${e.reason}`).join('; ')}`,
        'files'
      )
    }

    const summary = buildFilesSummary(result.parsed)

    logger.info(
      `Parsed ${result.parsed.length} file(s), ${result.errors.length} error(s), summary ${summary.length} chars`
    )

    return successResponse({
      files: result.parsed.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
        textLength: f.text.length,
      })),
      summary,
      errors: result.errors,
    })
  } catch (error) {
    logger.error('File upload error:', error)
    return serverErrorResponse(error instanceof Error ? error.message : 'Internal server error')
  }
}

export const GET = () => methodNotAllowedResponse('POST')
export const PUT = () => methodNotAllowedResponse('POST')
export const DELETE = () => methodNotAllowedResponse('POST')
