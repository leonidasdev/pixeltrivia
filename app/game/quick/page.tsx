'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { fetchQuestions, createGameSession } from '@/lib/gameApi'

const QuickGameSelector = dynamic(() => import('@/app/components/QuickGameSelector'), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="text-yellow-400 font-pixel text-xs animate-pulse">Loading...</div>
    </div>
  ),
})
import { logger } from '@/lib/logger'
import {
  ToastContainer,
  useToast,
  SparklesOverlay,
  LoadingOverlay,
  PageTransition,
} from '@/app/components/ui'
import { useSound } from '@/hooks/useSound'

export default function QuickGamePage() {
  const router = useRouter()
  const [isStartingGame, setIsStartingGame] = useState(false)
  const { messages: toasts, dismissToast, toast } = useToast()
  const { play: playSound } = useSound()
  const handleCategorySelected = async (category: string, difficulty: string) => {
    setIsStartingGame(true)
    playSound('gameStart')

    try {
      logger.debug('Starting quick game:', { category, difficulty })

      // Fetch 10 questions for the selected category and difficulty
      const questionsResult = await fetchQuestions(category, difficulty, 10)

      if (!questionsResult.success || !questionsResult.data) {
        throw new Error(questionsResult.error || 'Failed to load questions')
      }

      // Create game session
      const gameSession = createGameSession(questionsResult.data.questions, category, difficulty)

      logger.debug('Game session created:', gameSession)

      // Store game session in localStorage for the game screen
      localStorage.setItem('currentGameSession', JSON.stringify(gameSession))

      // Navigate to game screen
      router.push('/game/play')
    } catch (err) {
      logger.error('Error starting quick game:', err)
      toast.error(
        `Failed to start the game: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setIsStartingGame(false)
    }
  }

  const handleCancel = () => {
    router.push('/')
  }

  if (isStartingGame) {
    return <LoadingOverlay label="Preparing your trivia questions" />
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <SparklesOverlay />

      {/* Main content */}
      <PageTransition style="slide-up" className="z-10 w-full max-w-4xl">
        {/* Page Header */}
        <header className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-pixel text-white mb-2 pixel-text-shadow">
            QUICK GAME
          </h1>
          <p className="text-cyan-300 text-lg md:text-xl">
            Jump into a fast-paced trivia challenge
          </p>
        </header>

        {/* Game Selector */}
        <QuickGameSelector onCategorySelected={handleCategorySelected} onCancel={handleCancel} />

        {/* Toast notifications */}
        <ToastContainer messages={toasts} onDismiss={dismissToast} />

        {/* Instructions */}
        <section className="mt-8 text-center text-gray-400 text-sm max-w-lg mx-auto">
          <h3 className="text-white font-pixel font-bold mb-2">How Quick Game Works:</h3>
          <ul className="space-y-1 text-left">
            <li>• Choose your preferred difficulty level</li>
            <li>• Select a category that interests you</li>
            <li>• Answer 10 questions as fast as you can</li>
            <li>• Compete for the best time and score</li>
          </ul>
        </section>
      </PageTransition>
    </main>
  )
}
