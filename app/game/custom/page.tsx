/**
 * Custom Game Page — /game/custom
 *
 * Custom quiz flow that generates AI-powered questions
 * based on user-specified topic and difficulty.
 *
 * @module app/game/custom
 * @since 1.0.0
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { CustomGameConfig } from '@/app/components/CustomGameConfigurator'
import { generateCustomQuiz, type CustomQuizRequest } from '@/lib/customQuizApi'
import { logger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/errors'

const CustomGameConfigurator = dynamic(() => import('@/app/components/CustomGameConfigurator'), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="text-yellow-400 font-pixel text-xs animate-pulse">
        Loading configurator...
      </div>
    </div>
  ),
})
import { ToastContainer, useToast, GamePageLayout } from '@/app/components/ui'

export default function CustomGamePage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const { messages: toasts, dismissToast, toast } = useToast()

  const handleStartCustomGame = async (config: CustomGameConfig) => {
    setIsGenerating(true)

    try {
      logger.debug('Starting custom game with config:', config)

      // Convert config to API request format
      const quizRequest: CustomQuizRequest = {
        knowledgeLevel: config.knowledgeLevel,
        context: config.context,
        numQuestions: config.numberOfQuestions,
      }

      // Call the custom quiz API
      const response = await generateCustomQuiz(quizRequest)

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate questions')
      }

      logger.debug('Generated questions:', response.data)

      if (response.data) {
        sessionStorage.setItem('customGameQuestions', JSON.stringify(response.data))
        sessionStorage.setItem('customGameConfig', JSON.stringify(config))
      }

      toast.success(
        `Custom quiz generated! Level: ${config.knowledgeLevel} • ${response.data?.length || 0} questions • Context: ${config.context || 'General knowledge'}. Ready to play!`
      )

      router.push('/game/play')
    } catch (err) {
      logger.error('Failed to generate custom game', err)
      toast.error(`Failed to generate custom game: ${getErrorMessage(err)}. Please try again.`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCancel = () => {
    router.push('/')
  }

  return (
    <GamePageLayout
      header={{
        title: 'Custom Game',
        subtitle: 'AI-powered personalized trivia experience',
        icon: 'AI',
        size: 'lg',
      }}
      maxWidth="xl"
      noBackground
    >
      {/* Features tagline */}
      <div className="flex items-center justify-center space-x-2 text-yellow-400 font-pixel-body text-base mb-6">
        <span>AI</span>
        <span>Powered by Advanced AI</span>
        <span>•</span>
        <span>Unlimited Topics</span>
        <span>•</span>
        <span>Real-time Generation</span>
      </div>

      {/* Custom Game Configurator */}
      <CustomGameConfigurator
        onStartCustomGame={handleStartCustomGame}
        onCancel={handleCancel}
        isLoading={isGenerating}
      />

      {/* Features Section */}
      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-gray-900 bg-opacity-60 pixel-border border-4 border-gray-600 p-4">
          <div className="text-3xl mb-2">T</div>
          <h3 className="text-white font-pixel text-[10px] mb-1">Targeted Learning</h3>
          <p className="text-gray-400 font-pixel-body text-base">
            Questions tailored to your specific topic and knowledge level
          </p>
        </div>

        <div className="bg-gray-900 bg-opacity-60 pixel-border border-4 border-gray-600 p-4">
          <div className="text-3xl mb-2">{'>'}</div>
          <h3 className="text-white font-pixel text-[10px] mb-1">Instant Generation</h3>
          <p className="text-gray-400 font-pixel-body text-base">
            AI creates fresh questions in seconds based on your context
          </p>
        </div>

        <div className="bg-gray-900 bg-opacity-60 pixel-border border-4 border-gray-600 p-4">
          <div className="text-3xl mb-2">#</div>
          <h3 className="text-white font-pixel text-[10px] mb-1">Any Subject</h3>
          <p className="text-gray-400 font-pixel-body text-base">
            From textbook chapters to hobby topics - unlimited possibilities
          </p>
        </div>
      </section>

      {/* Instructions */}
      <section className="mt-8 bg-gray-900 bg-opacity-60 pixel-border border-4 border-gray-600 p-6 text-gray-300">
        <h3 className="text-white font-pixel text-xs mb-3 text-center">How Custom Games Work:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-cyan-300 font-pixel text-[10px] mb-2">
              What to include in context:
            </h4>
            <ul className="space-y-1 font-pixel-body text-base">
              <li>• Specific topics or subjects</li>
              <li>• Textbook chapters or sections</li>
              <li>• Study material excerpts</li>
              <li>• Historical periods or events</li>
              <li>• Technical concepts or processes</li>
            </ul>
          </div>
          <div>
            <h4 className="text-cyan-300 font-pixel text-[10px] mb-2">Knowledge levels:</h4>
            <ul className="space-y-1 font-pixel-body text-base">
              <li>
                • <strong>Elementary:</strong> Simple concepts, basic vocabulary
              </li>
              <li>
                • <strong>Middle School:</strong> Core subjects, foundational knowledge
              </li>
              <li>
                • <strong>High School:</strong> Academic rigor, detailed concepts
              </li>
              <li>
                • <strong>College:</strong> Advanced topics, specialized knowledge
              </li>
              <li>
                • <strong>Classic:</strong> Mixed difficulty, general knowledge
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Toast notifications */}
      <ToastContainer messages={toasts} onDismiss={dismissToast} />
    </GamePageLayout>
  )
}
