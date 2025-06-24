'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CustomGameConfigurator, { type CustomGameConfig } from '@/app/components/CustomGameConfigurator'
import { generateCustomQuiz, type CustomQuizRequest } from '@/lib/customQuizApi'

export default function CustomGamePage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleStartCustomGame = async (config: CustomGameConfig) => {
    setIsGenerating(true)
    
    try {
      console.log('Starting custom game with config:', config)
      
      // Convert config to API request format
      const quizRequest: CustomQuizRequest = {
        knowledgeLevel: config.knowledgeLevel,
        context: config.context,
        numQuestions: config.numberOfQuestions
      }
      
      // Call the custom quiz API
      const response = await generateCustomQuiz(quizRequest)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to generate questions')
      }

      console.log('Generated questions:', response.data)
      
      // TODO: Store questions in session storage or pass to game screen
      if (response.data) {
        sessionStorage.setItem('customGameQuestions', JSON.stringify(response.data))
        sessionStorage.setItem('customGameConfig', JSON.stringify(config))
      }
      
      // Show success message with details
      alert(`🎯 Custom Quiz Generated Successfully!\n\n` +
            `Knowledge Level: ${config.knowledgeLevel}\n` +
            `Questions Generated: ${response.data?.length || 0}\n` +
            `Context: ${config.context || 'General knowledge'}\n\n` +
            `Ready to start your custom trivia game!`)
      
      // TODO: Navigate to game screen with generated questions
      // router.push('/game/play')
      
    } catch (error) {
      console.error('Error generating custom game:', error)
      alert(`❌ Failed to generate custom game:\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or check your API configuration.`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCancel = () => {
    router.push('/')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 animate-pulse opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-400 animate-pulse opacity-60 animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-cyan-400 animate-pulse opacity-60 animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-green-400 animate-pulse opacity-60 animation-delay-3000"></div>
      </div>

      {/* Main content */}
      <div className="z-10 w-full max-w-4xl">
        {/* Page Header */}
        <header className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 pixel-text-shadow">
            CUSTOM GAME
          </h1>
          <p className="text-cyan-300 text-lg md:text-xl mb-4">
            AI-powered personalized trivia experience
          </p>
          <div className="flex items-center justify-center space-x-2 text-yellow-400 text-sm">
            <span>🤖</span>
            <span>Powered by Advanced AI</span>
            <span>•</span>
            <span>Unlimited Topics</span>
            <span>•</span>
            <span>Real-time Generation</span>
          </div>
        </header>

        {/* Custom Game Configurator */}
        <CustomGameConfigurator 
          onStartCustomGame={handleStartCustomGame}
          onCancel={handleCancel}
          isLoading={isGenerating}
        />

        {/* Features Section */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-gray-900 bg-opacity-60 rounded-lg p-4">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="text-white font-bold mb-1">Targeted Learning</h3>
            <p className="text-gray-400 text-sm">Questions tailored to your specific topic and knowledge level</p>
          </div>
          
          <div className="bg-gray-900 bg-opacity-60 rounded-lg p-4">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="text-white font-bold mb-1">Instant Generation</h3>
            <p className="text-gray-400 text-sm">AI creates fresh questions in seconds based on your context</p>
          </div>
          
          <div className="bg-gray-900 bg-opacity-60 rounded-lg p-4">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="text-white font-bold mb-1">Any Subject</h3>
            <p className="text-gray-400 text-sm">From textbook chapters to hobby topics - unlimited possibilities</p>
          </div>
        </section>

        {/* Instructions */}
        <section className="mt-8 bg-gray-900 bg-opacity-60 rounded-lg p-6 text-gray-300 text-sm">
          <h3 className="text-white font-bold mb-3 text-center">How Custom Games Work:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-cyan-300 font-bold mb-2">📝 What to include in context:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Specific topics or subjects</li>
                <li>• Textbook chapters or sections</li>
                <li>• Study material excerpts</li>
                <li>• Historical periods or events</li>
                <li>• Technical concepts or processes</li>
              </ul>
            </div>
            <div>
              <h4 className="text-cyan-300 font-bold mb-2">🎓 Knowledge levels:</h4>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Elementary:</strong> Simple concepts, basic vocabulary</li>
                <li>• <strong>Middle School:</strong> Core subjects, foundational knowledge</li>
                <li>• <strong>High School:</strong> Academic rigor, detailed concepts</li>
                <li>• <strong>College:</strong> Advanced topics, specialized knowledge</li>
                <li>• <strong>Classic:</strong> Mixed difficulty, general knowledge</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
