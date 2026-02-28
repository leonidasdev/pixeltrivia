/**
 * File Parser
 *
 * Server-side utilities for extracting text content from uploaded
 * documents (PDF, DOCX, TXT, Markdown). Used by the advanced game
 * mode to feed document content into the AI question generator.
 *
 * @module lib/fileParser
 * @since 1.3.0
 */

import { logger } from './logger'

// ============================================================================
// Constants
// ============================================================================

/** Maximum file size in bytes (10 MB). */
export const MAX_FILE_SIZE = 10 * 1024 * 1024

/** Maximum number of files per upload. */
export const MAX_FILES = 5

/** Maximum extracted text length per file (characters). */
const MAX_TEXT_LENGTH = 50_000

/** Allowed MIME types mapped to their handler. */
const ALLOWED_TYPES: Record<string, FileType> = {
  'text/plain': 'txt',
  'text/markdown': 'md',
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}

/** Extensions accepted when MIME type is missing or generic. */
const EXTENSION_MAP: Record<string, FileType> = {
  '.txt': 'txt',
  '.md': 'md',
  '.pdf': 'pdf',
  '.docx': 'docx',
}

// ============================================================================
// Types
// ============================================================================

type FileType = 'txt' | 'md' | 'pdf' | 'docx'

/** Result of parsing a single file. */
export interface ParsedFile {
  /** Original file name. */
  name: string
  /** Extracted plain-text content (trimmed, truncated to MAX_TEXT_LENGTH). */
  text: string
  /** Detected file type. */
  type: FileType
  /** Original file size in bytes. */
  size: number
}

/** Validation error detail. */
export interface FileValidationError {
  file: string
  reason: string
}

/** Result from validateFiles / parseFiles. */
export interface ParseResult {
  parsed: ParsedFile[]
  errors: FileValidationError[]
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Resolve the logical file type from MIME type and file name.
 * Returns undefined when the file type is not supported.
 */
function resolveFileType(mimeType: string, fileName: string): FileType | undefined {
  if (ALLOWED_TYPES[mimeType]) {
    return ALLOWED_TYPES[mimeType]
  }

  // Fallback: check extension (handles application/octet-stream uploads)
  const ext =
    fileName.lastIndexOf('.') >= 0 ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase() : ''
  return EXTENSION_MAP[ext]
}

/**
 * Validate a single file before parsing.
 * Returns the resolved FileType on success, or an error string.
 */
function validateFile(
  file: File,
  _index: number,
  totalCount: number
): { ok: true; type: FileType } | { ok: false; reason: string } {
  if (totalCount > MAX_FILES) {
    return { ok: false, reason: `Too many files (max ${MAX_FILES})` }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      reason: `File exceeds ${MAX_FILE_SIZE / (1024 * 1024)} MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
    }
  }

  if (file.size === 0) {
    return { ok: false, reason: 'File is empty' }
  }

  const fileType = resolveFileType(file.type, file.name)
  if (!fileType) {
    return {
      ok: false,
      reason: `Unsupported file type "${file.type || 'unknown'}". Accepted: .txt, .md, .pdf, .docx`,
    }
  }

  return { ok: true, type: fileType }
}

// ============================================================================
// Parsers
// ============================================================================

/**
 * Extract text from a plain-text or markdown file.
 */
async function parseText(buffer: Buffer): Promise<string> {
  return buffer.toString('utf-8')
}

/**
 * Extract text from a PDF file using pdf-parse.
 * Loaded lazily to avoid pulling the library into memory until needed.
 */
async function parsePdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default as (
    buffer: Buffer
  ) => Promise<{ text: string }>
  const result = await pdfParse(buffer)
  return result.text
}

/**
 * Extract text from a DOCX file using mammoth.
 * Loaded lazily to avoid pulling the library into memory until needed.
 */
async function parseDocx(buffer: Buffer): Promise<string> {
  const mammoth = (await import('mammoth')).default
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

/**
 * Dispatch to the correct parser based on file type.
 */
async function extractText(buffer: Buffer, fileType: FileType): Promise<string> {
  switch (fileType) {
    case 'txt':
    case 'md':
      return parseText(buffer)
    case 'pdf':
      return parsePdf(buffer)
    case 'docx':
      return parseDocx(buffer)
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Parse an array of uploaded File objects into extracted text.
 *
 * - Validates size, count, and type constraints.
 * - Extracts text content from each valid file.
 * - Truncates extracted text to MAX_TEXT_LENGTH characters.
 * - Collects per-file errors for invalid/unparseable files.
 *
 * @param files - Array of File objects from a multipart form upload.
 * @returns Parsed files and any validation errors.
 */
export async function parseFiles(files: File[]): Promise<ParseResult> {
  const parsed: ParsedFile[] = []
  const errors: FileValidationError[] = []

  if (files.length === 0) {
    return { parsed, errors: [{ file: '(none)', reason: 'No files provided' }] }
  }

  if (files.length > MAX_FILES) {
    errors.push({
      file: '(batch)',
      reason: `Too many files: ${files.length} uploaded, max ${MAX_FILES}`,
    })
  }

  const filesToProcess = files.slice(0, MAX_FILES)

  await Promise.all(
    filesToProcess.map(async (file, index) => {
      const validation = validateFile(file, index, filesToProcess.length)

      if (!validation.ok) {
        errors.push({ file: file.name, reason: validation.reason })
        return
      }

      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        let text = await extractText(buffer, validation.type)

        // Normalize whitespace and trim
        text = text
          .replace(/\r\n/g, '\n')
          .replace(/[ \t]+/g, ' ')
          .trim()

        // Truncate overly large documents
        if (text.length > MAX_TEXT_LENGTH) {
          text = text.slice(0, MAX_TEXT_LENGTH) + '\n[...truncated]'
          logger.warn(`File "${file.name}" text truncated to ${MAX_TEXT_LENGTH} chars`)
        }

        if (text.length === 0) {
          errors.push({ file: file.name, reason: 'No text content could be extracted' })
          return
        }

        parsed.push({
          name: file.name,
          text,
          type: validation.type,
          size: file.size,
        })
      } catch (err) {
        logger.error(`Failed to parse file "${file.name}":`, err)
        errors.push({
          file: file.name,
          reason: `Parse error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        })
      }
    })
  )

  return { parsed, errors }
}

/**
 * Combine parsed file texts into a single summary string for AI consumption.
 * Each file's content is prefixed with its name.
 *
 * @param files - Array of successfully parsed files.
 * @param maxLength - Maximum total length of the combined summary.
 * @returns Combined text ready for the AI prompt.
 */
export function buildFilesSummary(files: ParsedFile[], maxLength: number = 8000): string {
  let summary = ''

  for (const file of files) {
    const section = `--- ${file.name} ---\n${file.text}\n\n`
    if (summary.length + section.length > maxLength) {
      const remaining = maxLength - summary.length
      if (remaining > 100) {
        summary += section.slice(0, remaining) + '\n[...truncated]'
      }
      break
    }
    summary += section
  }

  return summary.trim()
}
