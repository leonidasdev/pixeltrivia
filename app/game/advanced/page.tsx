'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AdvancedGameConfig } from '../../components/AdvancedGameConfigurator'
import { STORAGE_KEYS } from '@/constants/game'
import { logger } from '@/lib/logger'
import {
  ToastContainer,
  useToast,
  SparklesOverlay,
  LoadingOverlay,
  PageTransition,
} from '@/app/components/ui'
import Footer from '@/app/components/Footer'

export default function AdvancedGamePage() {
  const router = useRouter()
  const [gameConfig, setGameConfig] = useState<AdvancedGameConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { messages: toasts, dismissToast, toast } = useToast()

  useEffect(() => {
    // Load the advanced game configuration from localStorage
    const savedConfig = localStorage.getItem(STORAGE_KEYS.ADVANCED_CONFIG)
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setGameConfig(config)
      } catch (error) {
        logger.error('Failed to parse advanced game config', error)
        router.push('/game/mode')
        return
      }
    } else {
      // No config found, redirect back to mode selection
      router.push('/game/mode')
      return
    }
    setIsLoading(false)
  }, [router])

  // Generate quiz from uploaded documents
  const handleStartGame = async () => {
    if (!gameConfig) return

    setIsGenerating(true)
    setError(null)

    try {
      // Build file summary from extracted content
      const filesSummary =
        gameConfig.files.length > 0
          ? gameConfig.files
              .map(file => file.content || '')
              .filter(Boolean)
              .join('\n\n')
          : ''

      if (!filesSummary) {
        setError('No document content available. Please upload files with readable text content.')
        return
      }

      const response = await fetch('/api/quiz/advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filesSummary,
          numQuestions: 10,
          format: gameConfig.questionFormat,
          timeLimit: gameConfig.timePerQuestion,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate quiz')
      }

      const result = await response.json()

      localStorage.setItem(STORAGE_KEYS.GENERATED_QUESTIONS, JSON.stringify(result.data.questions))
      localStorage.setItem(STORAGE_KEYS.GAME_METADATA, JSON.stringify(result.data.metadata))

      toast.success(`Generated ${result.data.questions.length} questions from your documents!`)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to generate quiz. Please try again.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return <LoadingOverlay label="Loading Advanced Game..." />
  }

  if (!gameConfig) {
    return null // Will redirect
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <SparklesOverlay />

      {/* Main content container */}
      <PageTransition>
        <div className="flex flex-col items-center space-y-8 z-10 max-w-4xl w-full">
          {/* Header */}
          <header className="text-center">
            <h1 className="text-2xl md:text-4xl font-pixel text-white mb-2 pixel-text-shadow">
              📚 ADVANCED GAME
            </h1>
            <p className="text-cyan-300 font-pixel-body text-xl">Solo Play with Custom Documents</p>
          </header>
          {/* Game Configuration Display */}
          <section className="w-full max-w-2xl bg-gray-900 border-4 border-gray-600 p-6 pixel-border">
            <h2 className="text-sm font-pixel text-white mb-4 pixel-text-shadow">
              Game Configuration
            </h2>

            <div className="space-y-4">
              {/* Files */}
              <div>
                <h3 className="text-cyan-300 font-pixel text-[10px] mb-2">Uploaded Documents:</h3>
                {gameConfig.files.length > 0 ? (
                  <div className="space-y-2">
                    {gameConfig.files.map(file => (
                      <div
                        key={file.id}
                        className="bg-gray-800 border-4 border-gray-600 pixel-border p-3 flex items-center space-x-3"
                      >
                        <span className="text-lg">📄</span>
                        <div>
                          <div className="text-white font-pixel-body text-base font-medium">
                            {file.name}
                          </div>
                          <div className="text-gray-400 font-pixel text-[8px]">
                            {(file.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 font-pixel-body text-base">No documents uploaded</p>
                )}
              </div>

              {/* Time and Format */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-cyan-300 font-pixel text-[10px] mb-2">Time Per Question:</h3>
                  <p className="text-white font-pixel-body text-xl">
                    {gameConfig.timePerQuestion} seconds
                  </p>
                </div>
                <div>
                  <h3 className="text-cyan-300 font-pixel text-[10px] mb-2">Question Format:</h3>
                  <p className="text-white font-pixel-body text-xl capitalize">
                    {gameConfig.questionFormat === 'short' ? 'Short Questions' : 'Longer Questions'}
                  </p>
                </div>
              </div>
            </div>
          </section>{' '}
          {/* Game Start Section */}
          <section className="w-full max-w-lg">
            {error && (
              <div className="mb-4 p-4 bg-red-900 bg-opacity-30 border-4 border-red-600 pixel-border">
                <h4 className="text-red-300 font-pixel text-[10px] mb-2">⚠️ Error</h4>
                <p className="text-red-200 font-pixel-body text-base">{error}</p>
              </div>
            )}

            <div className="bg-blue-900 bg-opacity-30 border-4 border-blue-600 pixel-border p-6 text-center">
              <h3 className="text-sm font-pixel text-white mb-4 pixel-text-shadow">
                🚀 Ready to Start!
              </h3>
              <p className="text-blue-200 font-pixel-body text-base mb-6">
                {gameConfig.files.length > 0
                  ? 'Your documents have been processed. AI will generate personalized trivia questions based on the content.'
                  : 'No documents uploaded. Please go back and upload at least one document.'}
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleStartGame}
                  disabled={isGenerating || gameConfig.files.length === 0}
                  className={`
                  w-full py-4 px-6 font-pixel text-sm text-white transition-all duration-150
                  focus:outline-none focus:ring-4 focus:ring-opacity-50 pixel-border pixel-glow-hover
                  ${
                    isGenerating
                      ? 'bg-gray-600 border-4 border-gray-800 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-500 border-4 border-green-800 hover:border-green-600 hover:scale-105 pixel-shadow active:scale-95 focus:ring-green-300'
                  }
                `}
                >
                  <span className="block">
                    {isGenerating ? '🔄 GENERATING...' : '🎯 START GAME'}
                  </span>
                  <span className="block font-pixel-body text-base mt-1 opacity-80">
                    {isGenerating
                      ? 'AI is creating your questions...'
                      : 'Generate questions from your documents'}
                  </span>
                </button>
              </div>
            </div>
          </section>
          {/* Processing Info */}
          <Footer hint="💡 Tip: Questions will be generated based on the content of your uploaded documents" />
        </div>
      </PageTransition>

      {/* Toast notifications */}
      <ToastContainer messages={toasts} onDismiss={dismissToast} />
    </main>
  )
}
