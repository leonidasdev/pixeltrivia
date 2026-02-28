import React, { useState } from 'react'

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  content?: string // For now, we'll mock the content
}

export interface AdvancedGameConfig {
  files: UploadedFile[]
  timePerQuestion: number
  questionFormat: 'short' | 'long'
}

interface AdvancedGameConfiguratorProps {
  config: AdvancedGameConfig
  onConfigChange: (config: AdvancedGameConfig) => void
}

export default function AdvancedGameConfigurator({
  config,
  onConfigChange,
}: AdvancedGameConfiguratorProps) {
  const [dragActive, setDragActive] = useState(false)

  // Handle file selection via input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    addFiles(files)
  }

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    addFiles(files)
  }

  // Add files to config
  const addFiles = (files: File[]) => {
    const validTypes = ['.txt', '.pdf', '.docx', '.md']
    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      return validTypes.includes(extension)
    })

    const newUploadedFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 11),
      name: file.name,
      size: file.size,
      type: file.type || 'text/plain',
      content: `Mock content for ${file.name}`, // Mock content for now
    }))

    const updatedFiles = [...config.files, ...newUploadedFiles]
    onConfigChange({
      ...config,
      files: updatedFiles,
    })
  }

  // Remove file
  const removeFile = (fileId: string) => {
    const updatedFiles = config.files.filter(f => f.id !== fileId)
    onConfigChange({
      ...config,
      files: updatedFiles,
    })
  }

  // Update time per question
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(e.target.value)
    onConfigChange({
      ...config,
      timePerQuestion: time,
    })
  }

  // Update question format
  const handleFormatChange = (format: 'short' | 'long') => {
    onConfigChange({
      ...config,
      questionFormat: format,
    })
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6 w-full">
      {/* File Upload Section */}
      <div className="space-y-3">
        <label className="block text-sm font-bold text-cyan-300 uppercase tracking-wider">
          Upload Documents
        </label>

        {/* Upload Area */}
        <div
          className={`
            relative border-3 border-dashed rounded-lg p-6 text-center transition-all duration-200
            ${
              dragActive
                ? 'border-cyan-400 bg-cyan-400 bg-opacity-10'
                : 'border-gray-600 hover:border-gray-500'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".txt,.pdf,.docx,.md"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            aria-label="Upload document files"
          />

          <div className="pointer-events-none">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-white font-bold mb-2">Drop files here or click to browse</p>
            <p className="text-gray-400 text-sm">Supports: .txt, .pdf, .docx, .md files</p>
            <p className="text-gray-500 text-xs mt-1">Max 10MB per file • Up to 5 files</p>
          </div>
        </div>

        {/* Uploaded Files List */}
        {config.files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white">Uploaded Files:</h4>
            <div className="space-y-2">
              {config.files.map(file => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-800 border-2 border-gray-600 rounded pixel-border"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📄</span>
                    <div>
                      <div className="text-white text-sm font-medium">{file.name}</div>
                      <div className="text-gray-400 text-xs">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-red-400 hover:text-red-300 font-bold text-xl p-1 hover:bg-red-900 hover:bg-opacity-30 rounded transition-colors"
                    aria-label={`Remove ${file.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Time Per Question */}
      <div className="space-y-3">
        <label
          htmlFor="timePerQuestion"
          className="flex justify-between items-center text-sm font-bold text-cyan-300 uppercase tracking-wider"
        >
          <span>Time Per Question</span>
          <span className="text-white text-lg">{config.timePerQuestion}s</span>
        </label>
        <div className="relative">
          <input
            id="timePerQuestion"
            type="range"
            min="10"
            max="90"
            step="5"
            value={config.timePerQuestion}
            onChange={handleTimeChange}
            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer
                     focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50"
            style={{
              background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((config.timePerQuestion - 10) / 80) * 100}%, #374151 ${((config.timePerQuestion - 10) / 80) * 100}%, #374151 100%)`,
            }}
            aria-label={`Time per question: ${config.timePerQuestion} seconds`}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
            <span>10s</span>
            <span>50s</span>
            <span>90s</span>
          </div>
        </div>
      </div>

      {/* Question Format */}
      <div className="space-y-3">
        <label className="block text-sm font-bold text-cyan-300 uppercase tracking-wider">
          Question Format
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleFormatChange('short')}
            className={`
              p-4 border-3 rounded-lg text-center transition-all duration-200 pixel-border
              focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50
              ${
                config.questionFormat === 'short'
                  ? 'bg-green-600 border-green-800 text-white scale-105 pixel-shadow'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500 hover:scale-105'
              }
            `}
            aria-pressed={config.questionFormat === 'short'}
          >
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-bold text-sm">Short Questions</div>
            <div className="text-xs mt-1 opacity-80">Quick, focused questions</div>
          </button>

          <button
            type="button"
            onClick={() => handleFormatChange('long')}
            className={`
              p-4 border-3 rounded-lg text-center transition-all duration-200 pixel-border
              focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50
              ${
                config.questionFormat === 'long'
                  ? 'bg-purple-600 border-purple-800 text-white scale-105 pixel-shadow'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500 hover:scale-105'
              }
            `}
            aria-pressed={config.questionFormat === 'long'}
          >
            <div className="text-2xl mb-2">📖</div>
            <div className="font-bold text-sm">Longer Questions</div>
            <div className="text-xs mt-1 opacity-80">Detailed, comprehensive</div>
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900 bg-opacity-30 border-2 border-blue-600 rounded-lg p-4">
        <h4 className="text-blue-300 font-bold text-sm mb-2 flex items-center">
          <span className="mr-2">💡</span> Advanced Game Tips
        </h4>
        <ul className="text-blue-200 text-xs space-y-1">
          <li>• Upload documents to give richer context to the AI</li>
          <li>• Note: It may take a couple minutes to process large files</li>
          <li>• Questions will be generated based on your document content</li>
          <li>• Higher time limits allow for more complex questions</li>
        </ul>
      </div>
    </div>
  )
}
