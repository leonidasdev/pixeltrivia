/**
 * @jest-environment node
 */

/**
 * Unit tests for lib/fileParser
 */

jest.mock('pdf-parse', () => ({
  __esModule: true,
  default: jest.fn((buffer: Buffer) =>
    Promise.resolve({ text: `PDF content from buffer of ${buffer.length} bytes` })
  ),
}))

jest.mock('mammoth', () => ({
  __esModule: true,
  default: {
    extractRawText: jest.fn(({ buffer }: { buffer: Buffer }) =>
      Promise.resolve({ value: `DOCX content from buffer of ${buffer.length} bytes` })
    ),
  },
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}))

import { parseFiles, buildFilesSummary, MAX_FILE_SIZE, MAX_FILES } from '@/lib/fileParser'

/** Helper to create a File-like object from text in Node. */
function makeFile(name: string, content: string, type: string = 'text/plain'): File {
  const buffer = Buffer.from(content, 'utf-8')
  const blob = new Blob([buffer], { type })
  return new File([blob], name, { type })
}

function makeLargeFile(name: string, sizeBytes: number, type: string = 'text/plain'): File {
  const buffer = Buffer.alloc(sizeBytes, 'x')
  const blob = new Blob([buffer], { type })
  return new File([blob], name, { type })
}

describe('parseFiles', () => {
  it('parses a plain text file', async () => {
    const file = makeFile('notes.txt', 'Hello World')
    const result = await parseFiles([file])

    expect(result.parsed).toHaveLength(1)
    expect(result.parsed[0].name).toBe('notes.txt')
    expect(result.parsed[0].text).toBe('Hello World')
    expect(result.parsed[0].type).toBe('txt')
    expect(result.errors).toHaveLength(0)
  })

  it('parses a markdown file', async () => {
    const file = makeFile('readme.md', '# Title\n\nBody text', 'text/markdown')
    const result = await parseFiles([file])

    expect(result.parsed).toHaveLength(1)
    expect(result.parsed[0].type).toBe('md')
    expect(result.parsed[0].text).toContain('# Title')
  })

  it('parses a PDF file via pdf-parse', async () => {
    const file = makeFile('doc.pdf', 'fake pdf bytes', 'application/pdf')
    const result = await parseFiles([file])

    expect(result.parsed).toHaveLength(1)
    expect(result.parsed[0].type).toBe('pdf')
    expect(result.parsed[0].text).toContain('PDF content from buffer')
  })

  it('parses a DOCX file via mammoth', async () => {
    const file = makeFile(
      'report.docx',
      'fake docx bytes',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    const result = await parseFiles([file])

    expect(result.parsed).toHaveLength(1)
    expect(result.parsed[0].type).toBe('docx')
    expect(result.parsed[0].text).toContain('DOCX content from buffer')
  })

  it('rejects unsupported file types', async () => {
    const file = makeFile('image.png', 'data', 'image/png')
    const result = await parseFiles([file])

    expect(result.parsed).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].reason).toContain('Unsupported file type')
  })

  it('rejects empty files', async () => {
    const file = makeFile('empty.txt', '')
    const result = await parseFiles([file])

    expect(result.parsed).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].reason).toContain('empty')
  })

  it('rejects files exceeding size limit', async () => {
    const file = makeLargeFile('huge.txt', MAX_FILE_SIZE + 1)
    const result = await parseFiles([file])

    expect(result.parsed).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].reason).toContain('exceeds')
  })

  it('limits to MAX_FILES files', async () => {
    const files = Array.from({ length: MAX_FILES + 2 }, (_, i) =>
      makeFile(`file${i}.txt`, `Content ${i}`)
    )
    const result = await parseFiles(files)

    expect(result.parsed.length).toBeLessThanOrEqual(MAX_FILES)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('returns error when no files provided', async () => {
    const result = await parseFiles([])

    expect(result.parsed).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].reason).toContain('No files')
  })

  it('handles mixed valid and invalid files', async () => {
    const files = [
      makeFile('good.txt', 'Valid content'),
      makeFile('bad.exe', 'nope', 'application/x-msdownload'),
      makeFile('also-good.md', 'More content', 'text/markdown'),
    ]
    const result = await parseFiles(files)

    expect(result.parsed).toHaveLength(2)
    expect(result.errors).toHaveLength(1)
  })

  it('resolves file type from extension when MIME is generic', async () => {
    const file = makeFile('notes.md', '# Markdown', 'application/octet-stream')
    const result = await parseFiles([file])

    expect(result.parsed).toHaveLength(1)
    expect(result.parsed[0].type).toBe('md')
  })

  it('handles multiple files concurrently', async () => {
    const files = [
      makeFile('a.txt', 'File A'),
      makeFile('b.txt', 'File B'),
      makeFile('c.txt', 'File C'),
    ]
    const result = await parseFiles(files)

    expect(result.parsed).toHaveLength(3)
    expect(result.errors).toHaveLength(0)
  })
})

describe('buildFilesSummary', () => {
  it('combines files with name headers', () => {
    const files = [
      { name: 'a.txt', text: 'Content A', type: 'txt' as const, size: 100 },
      { name: 'b.txt', text: 'Content B', type: 'txt' as const, size: 200 },
    ]
    const summary = buildFilesSummary(files)

    expect(summary).toContain('--- a.txt ---')
    expect(summary).toContain('Content A')
    expect(summary).toContain('--- b.txt ---')
    expect(summary).toContain('Content B')
  })

  it('truncates when exceeding maxLength', () => {
    const files = [
      { name: 'big.txt', text: 'x'.repeat(5000), type: 'txt' as const, size: 5000 },
      { name: 'small.txt', text: 'y'.repeat(5000), type: 'txt' as const, size: 5000 },
    ]
    const summary = buildFilesSummary(files, 6000)

    expect(summary.length).toBeLessThanOrEqual(6100) // some allowance for headers
    expect(summary).toContain('[...truncated]')
  })

  it('returns empty string for no files', () => {
    expect(buildFilesSummary([])).toBe('')
  })

  it('respects default maxLength', () => {
    const files = [{ name: 'a.txt', text: 'x'.repeat(10000), type: 'txt' as const, size: 10000 }]
    const summary = buildFilesSummary(files)

    expect(summary.length).toBeLessThanOrEqual(8100)
  })
})

describe('constants', () => {
  it('MAX_FILE_SIZE is 10MB', () => {
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024)
  })

  it('MAX_FILES is 5', () => {
    expect(MAX_FILES).toBe(5)
  })
})
