'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AdvancedGameConfig } from '../../components/AdvancedGameConfigurator'

export default function AdvancedGamePage() {
  const router = useRouter()
  const [gameConfig, setGameConfig] = useState<AdvancedGameConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load the advanced game configuration from localStorage
    const savedConfig = localStorage.getItem('pixeltrivia_advanced_config')
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setGameConfig(config)
      } catch (error) {
        console.error('Failed to parse advanced game config:', error)
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
      // Create a summary of uploaded files (mock implementation)
      const filesSummary =
        gameConfig.files.length > 0
          ? gameConfig.files
              .map(
                file =>
                  `Document: ${file.name}\nContent: ${file.content || 'Sample content for demonstration'}`
              )
              .join('\n\n')
          : 'No documents uploaded. Generate general trivia questions.'

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

      // Store the generated questions and navigate to game
      localStorage.setItem('pixeltrivia_generated_questions', JSON.stringify(result.questions))
      localStorage.setItem('pixeltrivia_game_metadata', JSON.stringify(result.metadata))

      // In a real implementation, navigate to the actual game screen
      alert(
        `Success! Generated ${result.questions.length} questions. (Would navigate to game screen in production)`
      )
    } catch (error) {
      console.error('Failed to generate quiz:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to generate quiz. Please try again.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-white text-xl">Loading Advanced Game...</p>
        </div>
      </main>
    )
  }

  if (!gameConfig) {
    return null // Will redirect
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 animate-pulse opacity-60" />
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-400 animate-pulse opacity-60 animation-delay-1000" />
        <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-cyan-400 animate-pulse opacity-60 animation-delay-2000" />
      </div>

      {/* Main content container */}
      <div className="flex flex-col items-center space-y-8 z-10 max-w-4xl w-full">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 pixel-text-shadow">
            📚 ADVANCED GAME
          </h1>
          <p className="text-cyan-300 text-lg">Solo Play with Custom Documents</p>
        </header>
        {/* Game Configuration Display */}
        <section className="w-full max-w-2xl bg-gray-900 border-4 border-gray-600 rounded-lg p-6 pixel-border">
          <h2 className="text-xl font-bold text-white mb-4 pixel-text-shadow">
            Game Configuration
          </h2>

          <div className="space-y-4">
            {/* Files */}
            <div>
              <h3 className="text-cyan-300 font-bold mb-2">Uploaded Documents:</h3>
              {gameConfig.files.length > 0 ? (
                <div className="space-y-2">
                  {gameConfig.files.map(file => (
                    <div
                      key={file.id}
                      className="bg-gray-800 border-2 border-gray-600 rounded p-3 flex items-center space-x-3"
                    >
                      <span className="text-lg">📄</span>
                      <div>
                        <div className="text-white text-sm font-medium">{file.name}</div>
                        <div className="text-gray-400 text-xs">
                          {(file.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No documents uploaded</p>
              )}
            </div>

            {/* Time and Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-cyan-300 font-bold mb-2">Time Per Question:</h3>
                <p className="text-white text-lg">{gameConfig.timePerQuestion} seconds</p>
              </div>
              <div>
                <h3 className="text-cyan-300 font-bold mb-2">Question Format:</h3>
                <p className="text-white text-lg capitalize">
                  {gameConfig.questionFormat === 'short' ? 'Short Questions' : 'Longer Questions'}
                </p>
              </div>
            </div>
          </div>
        </section>{' '}
        {/* Game Start Section */}
        <section className="w-full max-w-lg">
          {error && (
            <div className="mb-4 p-4 bg-red-900 bg-opacity-30 border-2 border-red-600 rounded-lg">
              <h4 className="text-red-300 font-bold text-sm mb-2">⚠️ Error</h4>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-blue-900 bg-opacity-30 border-2 border-blue-600 rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-4 pixel-text-shadow">
              🚀 Ready to Start!
            </h3>
            <p className="text-blue-200 text-sm mb-6">
              {gameConfig.files.length > 0
                ? 'Your documents will be processed by our AI to generate personalized trivia questions. This may take a moment for large files.'
                : "Since no documents were uploaded, we'll generate general trivia questions based on your preferences."}
            </p>

            <div className="space-y-4">
              <button
                onClick={handleStartGame}
                disabled={isGenerating}
                className={`
                  w-full py-4 px-6 text-xl font-bold text-white rounded-lg transition-all duration-150 
                  focus:outline-none focus:ring-4 focus:ring-opacity-50 pixel-border
                  ${
                    isGenerating
                      ? 'bg-gray-600 border-4 border-gray-800 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-500 border-4 border-green-800 hover:border-green-600 hover:scale-105 hover:pixel-shadow active:scale-95 focus:ring-green-300'
                  }
                `}
              >
                <span className="block">{isGenerating ? '🔄 GENERATING...' : '🎯 START GAME'}</span>
                <span className="block text-sm mt-1 font-normal opacity-80">
                  {isGenerating
                    ? 'AI is creating your questions...'
                    : 'Generate questions from your documents'}
                </span>
              </button>
            </div>
          </div>
        </section>
        {/* Processing Info */}
        <footer className="text-center text-gray-400 text-sm">
          <p>💡 Tip: Questions will be generated based on the content of your uploaded documents</p>
          <p className="text-xs mt-1 opacity-75">© 2025 PixelTrivia Advanced Mode</p>
        </footer>
      </div>
    </main>
  )
}
