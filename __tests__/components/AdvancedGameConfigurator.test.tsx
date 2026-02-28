/**
 * Tests for AdvancedGameConfigurator component
 *
 * @module __tests__/components/AdvancedGameConfigurator
 * @since 1.0.0
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdvancedGameConfigurator, {
  type AdvancedGameConfig,
} from '@/app/components/AdvancedGameConfigurator'

/**
 * Create a mock fetch that intercepts /api/upload and returns a successful
 * upload response built from the FormData files.
 */
function setupUploadMock(): jest.Mock {
  const mockFetch = jest.fn().mockImplementation(async (url: string, options?: RequestInit) => {
    if (url === '/api/upload') {
      const formData = options?.body as FormData
      const files = formData.getAll('files') as File[]

      const fileData = files.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
        textLength: 100,
      }))

      const summary = files.map(f => `--- ${f.name} ---\nExtracted text from ${f.name}`).join('\n')

      return {
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { files: fileData, summary, errors: [] },
          }),
      }
    }
    throw new Error(`Unexpected fetch: ${url}`)
  })
  global.fetch = mockFetch
  return mockFetch
}

/** Default test config */
function createConfig(overrides?: Partial<AdvancedGameConfig>): AdvancedGameConfig {
  return {
    files: [],
    timePerQuestion: 30,
    questionFormat: 'short',
    ...overrides,
  }
}

/** Create a mock File */
function createMockFile(name: string, size = 1024, type = 'text/plain'): File {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

describe('AdvancedGameConfigurator', () => {
  // ============================================================================
  // Rendering
  // ============================================================================

  describe('Rendering', () => {
    it('should render the Upload Documents section', () => {
      render(<AdvancedGameConfigurator config={createConfig()} onConfigChange={jest.fn()} />)

      expect(screen.getByText('Upload Documents')).toBeInTheDocument()
      expect(screen.getByText('Drop files here or click to browse')).toBeInTheDocument()
      expect(screen.getByText(/Supports: .txt, .pdf, .docx, .md/)).toBeInTheDocument()
    })

    it('should render the file input with correct accept types', () => {
      render(<AdvancedGameConfigurator config={createConfig()} onConfigChange={jest.fn()} />)

      const fileInput = screen.getByLabelText('Upload document files')
      expect(fileInput).toHaveAttribute('accept', '.txt,.pdf,.docx,.md')
      expect(fileInput).toHaveAttribute('multiple')
    })

    it('should render the time slider with current value', () => {
      render(
        <AdvancedGameConfigurator
          config={createConfig({ timePerQuestion: 45 })}
          onConfigChange={jest.fn()}
        />
      )

      expect(screen.getByText('45s')).toBeInTheDocument()
      expect(screen.getByLabelText(/Time per question: 45 seconds/)).toBeInTheDocument()
    })

    it('should render question format buttons', () => {
      render(<AdvancedGameConfigurator config={createConfig()} onConfigChange={jest.fn()} />)

      expect(screen.getByText('Short Questions')).toBeInTheDocument()
      expect(screen.getByText('Longer Questions')).toBeInTheDocument()
    })

    it('should render advanced tips', () => {
      render(<AdvancedGameConfigurator config={createConfig()} onConfigChange={jest.fn()} />)

      expect(screen.getByText('Advanced Game Tips')).toBeInTheDocument()
    })

    it('should show short format as selected by default', () => {
      render(<AdvancedGameConfigurator config={createConfig()} onConfigChange={jest.fn()} />)

      const shortBtn = screen.getByText('Short Questions').closest('button')
      expect(shortBtn).toHaveAttribute('aria-pressed', 'true')

      const longBtn = screen.getByText('Longer Questions').closest('button')
      expect(longBtn).toHaveAttribute('aria-pressed', 'false')
    })

    it('should show long format as selected when configured', () => {
      render(
        <AdvancedGameConfigurator
          config={createConfig({ questionFormat: 'long' })}
          onConfigChange={jest.fn()}
        />
      )

      const shortBtn = screen.getByText('Short Questions').closest('button')
      expect(shortBtn).toHaveAttribute('aria-pressed', 'false')

      const longBtn = screen.getByText('Longer Questions').closest('button')
      expect(longBtn).toHaveAttribute('aria-pressed', 'true')
    })
  })

  // ============================================================================
  // File Upload
  // ============================================================================

  describe('File Upload', () => {
    let originalFetch: typeof global.fetch

    beforeEach(() => {
      originalFetch = global.fetch
      setupUploadMock()
    })

    afterEach(() => {
      global.fetch = originalFetch
    })

    it('should add valid files via input', async () => {
      const onConfigChange = jest.fn()
      render(<AdvancedGameConfigurator config={createConfig()} onConfigChange={onConfigChange} />)

      const fileInput = screen.getByLabelText('Upload document files')
      const file = createMockFile('notes.txt', 512)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(onConfigChange).toHaveBeenCalledTimes(1)
      })
      const newConfig = onConfigChange.mock.calls[0][0] as AdvancedGameConfig
      expect(newConfig.files).toHaveLength(1)
      expect(newConfig.files[0].name).toBe('notes.txt')
      expect(newConfig.files[0].size).toBe(512)
    })

    it('should accept .pdf, .docx, .md files', async () => {
      const onConfigChange = jest.fn()
      render(<AdvancedGameConfigurator config={createConfig()} onConfigChange={onConfigChange} />)

      const fileInput = screen.getByLabelText('Upload document files')
      const files = [
        createMockFile('readme.md', 100),
        createMockFile('document.pdf', 200, 'application/pdf'),
        createMockFile(
          'report.docx',
          300,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ),
      ]

      fireEvent.change(fileInput, { target: { files } })

      await waitFor(() => {
        expect(onConfigChange).toHaveBeenCalledTimes(1)
      })
      const newConfig = onConfigChange.mock.calls[0][0] as AdvancedGameConfig
      expect(newConfig.files).toHaveLength(3)
    })

    it('should filter out invalid file types', async () => {
      const onConfigChange = jest.fn()
      render(<AdvancedGameConfigurator config={createConfig()} onConfigChange={onConfigChange} />)

      const fileInput = screen.getByLabelText('Upload document files')
      const files = [
        createMockFile('notes.txt', 100),
        createMockFile('image.png', 200, 'image/png'),
        createMockFile('script.js', 300, 'application/javascript'),
      ]

      fireEvent.change(fileInput, { target: { files } })

      await waitFor(() => {
        expect(onConfigChange).toHaveBeenCalledTimes(1)
      })
      const newConfig = onConfigChange.mock.calls[0][0] as AdvancedGameConfig
      // Only .txt should be accepted (invalid types filtered client-side before upload)
      expect(newConfig.files).toHaveLength(1)
      expect(newConfig.files[0].name).toBe('notes.txt')
    })

    it('should append files to existing files', async () => {
      const existingFile = {
        id: 'existing-1',
        name: 'old.txt',
        size: 100,
        type: 'text/plain',
      }
      const onConfigChange = jest.fn()

      render(
        <AdvancedGameConfigurator
          config={createConfig({ files: [existingFile] })}
          onConfigChange={onConfigChange}
        />
      )

      const fileInput = screen.getByLabelText('Upload document files')
      fireEvent.change(fileInput, {
        target: { files: [createMockFile('new.txt', 50)] },
      })

      await waitFor(() => {
        expect(onConfigChange).toHaveBeenCalledTimes(1)
      })
      const newConfig = onConfigChange.mock.calls[0][0] as AdvancedGameConfig
      expect(newConfig.files).toHaveLength(2)
      expect(newConfig.files[0]).toBe(existingFile) // preserved
      expect(newConfig.files[1].name).toBe('new.txt')
    })
  })

  // ============================================================================
  // Drag and Drop
  // ============================================================================

  describe('Drag and Drop', () => {
    let originalFetch: typeof global.fetch

    beforeEach(() => {
      originalFetch = global.fetch
      setupUploadMock()
    })

    afterEach(() => {
      global.fetch = originalFetch
    })

    it('should change style on dragenter', () => {
      const { container } = render(
        <AdvancedGameConfigurator config={createConfig()} onConfigChange={jest.fn()} />
      )

      // The drop zone has border-dashed class
      const dropZone = container.querySelector('.border-dashed') as HTMLElement
      expect(dropZone).toBeTruthy()

      fireEvent.dragEnter(dropZone, {
        dataTransfer: { files: [] },
      })

      expect(dropZone.className).toContain('border-cyan-400')
    })

    it('should reset style on dragleave', () => {
      const { container } = render(
        <AdvancedGameConfigurator config={createConfig()} onConfigChange={jest.fn()} />
      )

      const dropZone = container.querySelector('.border-dashed') as HTMLElement

      fireEvent.dragEnter(dropZone, { dataTransfer: { files: [] } })
      fireEvent.dragLeave(dropZone, { dataTransfer: { files: [] } })

      expect(dropZone.className).toContain('border-gray-600')
    })

    it('should handle file drop', async () => {
      const onConfigChange = jest.fn()
      const { container } = render(
        <AdvancedGameConfigurator config={createConfig()} onConfigChange={onConfigChange} />
      )

      const dropZone = container.querySelector('.border-dashed') as HTMLElement
      const file = createMockFile('dropped.txt', 256)

      fireEvent.drop(dropZone, {
        dataTransfer: { files: [file] },
      })

      await waitFor(() => {
        expect(onConfigChange).toHaveBeenCalledTimes(1)
      })
      const newConfig = onConfigChange.mock.calls[0][0] as AdvancedGameConfig
      expect(newConfig.files).toHaveLength(1)
      expect(newConfig.files[0].name).toBe('dropped.txt')
    })
  })

  // ============================================================================
  // File Removal
  // ============================================================================

  describe('File Removal', () => {
    it('should display uploaded files in the list', () => {
      const files = [
        { id: 'f1', name: 'lecture.pdf', size: 2048, type: 'application/pdf' },
        { id: 'f2', name: 'notes.txt', size: 512, type: 'text/plain' },
      ]

      render(
        <AdvancedGameConfigurator config={createConfig({ files })} onConfigChange={jest.fn()} />
      )

      expect(screen.getByText('lecture.pdf')).toBeInTheDocument()
      expect(screen.getByText('notes.txt')).toBeInTheDocument()
      expect(screen.getByText('Uploaded Files:')).toBeInTheDocument()
    })

    it('should call onConfigChange without the removed file', () => {
      const files = [
        { id: 'f1', name: 'first.txt', size: 100, type: 'text/plain' },
        { id: 'f2', name: 'second.txt', size: 200, type: 'text/plain' },
      ]
      const onConfigChange = jest.fn()

      render(
        <AdvancedGameConfigurator
          config={createConfig({ files })}
          onConfigChange={onConfigChange}
        />
      )

      const removeBtn = screen.getByLabelText('Remove first.txt')
      fireEvent.click(removeBtn)

      const newConfig = onConfigChange.mock.calls[0][0] as AdvancedGameConfig
      expect(newConfig.files).toHaveLength(1)
      expect(newConfig.files[0].name).toBe('second.txt')
    })

    it('should format file sizes correctly', () => {
      const files = [
        { id: 'f1', name: 'small.txt', size: 0, type: 'text/plain' },
        { id: 'f2', name: 'medium.txt', size: 1536, type: 'text/plain' }, // 1.5 KB
        { id: 'f3', name: 'large.txt', size: 1048576, type: 'text/plain' }, // 1 MB
      ]

      render(
        <AdvancedGameConfigurator config={createConfig({ files })} onConfigChange={jest.fn()} />
      )

      expect(screen.getByText('0 Bytes')).toBeInTheDocument()
      expect(screen.getByText('1.5 KB')).toBeInTheDocument()
      expect(screen.getByText('1 MB')).toBeInTheDocument()
    })

    it('should not show file list when no files uploaded', () => {
      render(<AdvancedGameConfigurator config={createConfig()} onConfigChange={jest.fn()} />)

      expect(screen.queryByText('Uploaded Files:')).not.toBeInTheDocument()
    })
  })

  // ============================================================================
  // Time Per Question
  // ============================================================================

  describe('Time Per Question', () => {
    it('should update time when slider changes', () => {
      const onConfigChange = jest.fn()
      render(<AdvancedGameConfigurator config={createConfig()} onConfigChange={onConfigChange} />)

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '60' } })

      expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ timePerQuestion: 60 }))
    })

    it('should have correct slider range attributes', () => {
      render(<AdvancedGameConfigurator config={createConfig()} onConfigChange={jest.fn()} />)

      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('min', '10')
      expect(slider).toHaveAttribute('max', '90')
      expect(slider).toHaveAttribute('step', '5')
    })

    it('should display time range markers', () => {
      render(<AdvancedGameConfigurator config={createConfig()} onConfigChange={jest.fn()} />)

      expect(screen.getByText('10s')).toBeInTheDocument()
      expect(screen.getByText('50s')).toBeInTheDocument()
      expect(screen.getByText('90s')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Question Format
  // ============================================================================

  describe('Question Format', () => {
    it('should call onConfigChange with short format', () => {
      const onConfigChange = jest.fn()
      render(
        <AdvancedGameConfigurator
          config={createConfig({ questionFormat: 'long' })}
          onConfigChange={onConfigChange}
        />
      )

      fireEvent.click(screen.getByText('Short Questions').closest('button')!)

      expect(onConfigChange).toHaveBeenCalledWith(
        expect.objectContaining({ questionFormat: 'short' })
      )
    })

    it('should call onConfigChange with long format', () => {
      const onConfigChange = jest.fn()
      render(<AdvancedGameConfigurator config={createConfig()} onConfigChange={onConfigChange} />)

      fireEvent.click(screen.getByText('Longer Questions').closest('button')!)

      expect(onConfigChange).toHaveBeenCalledWith(
        expect.objectContaining({ questionFormat: 'long' })
      )
    })

    it('should preserve other config when changing format', () => {
      const existingFile = {
        id: 'f1',
        name: 'notes.txt',
        size: 100,
        type: 'text/plain',
      }
      const onConfigChange = jest.fn()

      render(
        <AdvancedGameConfigurator
          config={createConfig({ files: [existingFile], timePerQuestion: 45 })}
          onConfigChange={onConfigChange}
        />
      )

      fireEvent.click(screen.getByText('Longer Questions').closest('button')!)

      const newConfig = onConfigChange.mock.calls[0][0] as AdvancedGameConfig
      expect(newConfig.files).toHaveLength(1)
      expect(newConfig.timePerQuestion).toBe(45)
      expect(newConfig.questionFormat).toBe('long')
    })
  })
})
