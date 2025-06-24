'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QuickGameSelector from '@/app/components/QuickGameSelector'
import { fetchQuestions, createGameSession } from '@/lib/gameApi'

export default function QuickGamePage() {
  const router = useRouter()
  const [isStartingGame, setIsStartingGame] = useState(false)
  const handleCategorySelected = async (category: string, difficulty: string) => {
    setIsStartingGame(true)
    
    try {
      console.log('Starting quick game:', { category, difficulty })
      
      // Fetch 10 questions for the selected category and difficulty
      const questionsResult = await fetchQuestions(category, difficulty, 10)
      
      if (!questionsResult.success || !questionsResult.data) {
        throw new Error(questionsResult.error || 'Failed to load questions')
      }
      
      // Create game session
      const gameSession = createGameSession(
        questionsResult.data.questions,
        category,
        difficulty
      )
      
      console.log('Game session created:', gameSession)
      
      // Store game session in localStorage for the game screen
      localStorage.setItem('currentGameSession', JSON.stringify(gameSession))
      
      // Navigate to game screen
      // TODO: Create game play screen at /game/play
      alert(`Game loaded successfully!\n\nCategory: ${category}\nDifficulty: ${difficulty}\nQuestions: ${questionsResult.data.questions.length}\n\nGame screen coming soon!`)
      
      // router.push('/game/play')
      
    } catch (error) {
      console.error('Error starting quick game:', error)
      alert(`Failed to start the game: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsStartingGame(false)
    }
  }

  const handleCancel = () => {
    router.push('/')
  }

  if (isStartingGame) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 animate-pulse opacity-60"></div>
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-400 animate-pulse opacity-60"></div>
          <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-cyan-400 animate-pulse opacity-60"></div>
        </div>

        <div className="text-center z-10">
          <div className="text-6xl mb-4 animate-spin">⚡</div>
          <h1 className="text-4xl font-bold text-white pixel-text-shadow mb-2">
            LOADING GAME...
          </h1>
          <p className="text-cyan-300 text-lg">
            Preparing your trivia questions
          </p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 animate-pulse opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-400 animate-pulse opacity-60 animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-cyan-400 animate-pulse opacity-60 animation-delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="z-10 w-full max-w-4xl">
        {/* Page Header */}
        <header className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 pixel-text-shadow">
            QUICK GAME
          </h1>
          <p className="text-cyan-300 text-lg md:text-xl">
            Jump into a fast-paced trivia challenge
          </p>
        </header>

        {/* Game Selector */}
        <QuickGameSelector 
          onCategorySelected={handleCategorySelected}
          onCancel={handleCancel}
        />

        {/* Instructions */}
        <section className="mt-8 text-center text-gray-400 text-sm max-w-lg mx-auto">
          <h3 className="text-white font-bold mb-2">How Quick Game Works:</h3>
          <ul className="space-y-1 text-left">
            <li>• Choose your preferred difficulty level</li>
            <li>• Select a category that interests you</li>
            <li>• Answer 10 questions as fast as you can</li>
            <li>• Compete for the best time and score</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
