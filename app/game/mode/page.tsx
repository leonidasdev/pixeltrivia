'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingOverlay, SparklesOverlay } from '@/app/components/ui'

// Game mode types
type GameMode = 'quick' | 'custom' | 'advanced'

interface PlayerSettings {
  name: string
  avatar: string
  volume: number
}

import { AVATAR_OPTIONS, DEFAULT_AVATAR_ID } from '@/constants/avatars'
import { STORAGE_KEYS } from '@/constants/game'

function GameModeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State management
  const [playerSettings, setPlayerSettings] = useState<PlayerSettings>({
    name: '',
    avatar: 'knight',
    volume: 50,
  })
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  // Load player settings from URL params or localStorage
  useEffect(() => {
    const name =
      searchParams.get('name') || localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || 'Player1234'
    const avatar =
      searchParams.get('avatar') ||
      localStorage.getItem(STORAGE_KEYS.PLAYER_AVATAR) ||
      DEFAULT_AVATAR_ID
    const volume = parseInt(
      searchParams.get('volume') || localStorage.getItem(STORAGE_KEYS.PLAYER_VOLUME) || '50'
    )

    setPlayerSettings({ name, avatar, volume })
  }, [searchParams])

  // Get avatar details
  const getAvatarDetails = (avatarId: string) => {
    return AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0]
  }

  // Handle game mode selection
  const handleGameModeSelect = (mode: GameMode) => {
    // Navigate to multiplayer options with selected mode
    const params = new URLSearchParams({
      mode: mode,
      name: playerSettings.name,
      avatar: playerSettings.avatar,
      volume: playerSettings.volume.toString(),
    })
    router.push(`/game/select?${params.toString()}`)
  }

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.back()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router])

  const avatarDetails = getAvatarDetails(playerSettings.avatar)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <SparklesOverlay />

      {/* Main content container */}
      <div className="flex flex-col items-center space-y-8 z-10 max-w-4xl w-full">
        {/* Header with player info */}
        <header className="text-center relative w-full">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 pixel-text-shadow">
            SELECT GAME MODE
          </h1>
          <p className="text-cyan-300 text-lg mb-4">
            Choose your trivia adventure, {playerSettings.name}!
          </p>

          {/* Player info display */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div
              className={`w-12 h-12 ${avatarDetails.color} border-3 border-gray-600 rounded-lg flex items-center justify-center pixel-border`}
            >
              <span className="text-2xl" role="img" aria-label={avatarDetails.name}>
                {avatarDetails.emoji}
              </span>
            </div>{' '}
            <div className="text-left">
              <div className="text-white font-bold">{playerSettings.name}</div>
              <div className="text-gray-400 text-sm">{avatarDetails.name} Avatar</div>
            </div>
          </div>
        </header>{' '}
        {/* Game Mode Selection */}
        <section className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {/* Quick Game Card */}
            <button
              onClick={() => handleGameModeSelect('quick')}
              onMouseEnter={() => setHoveredCard('quick')}
              onMouseLeave={() => setHoveredCard(null)}
              onFocus={() => setHoveredCard('quick')}
              onBlur={() => setHoveredCard(null)}
              className={`
                p-8 bg-gradient-to-br from-orange-600 to-orange-700 border-4 border-orange-800 rounded-lg
                text-white text-center transition-all duration-200 pixel-border
                focus:outline-none focus:ring-4 focus:ring-orange-300 focus:ring-opacity-50
                ${hoveredCard === 'quick' ? 'scale-105 pixel-shadow transform translate-x-1 translate-y-1' : 'hover:scale-105 hover:pixel-shadow hover:transform hover:translate-x-1 hover:translate-y-1'}
                active:scale-95 active:translate-x-0 active:translate-y-0
              `}
            >
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-3 pixel-text-shadow">QUICK GAME</h3>
              <p className="text-orange-200 text-sm leading-relaxed">
                Jump into instant trivia with predefined categories. Perfect for quick brain
                challenges with 10 random questions!
              </p>
              <div className="mt-4 text-xs text-orange-300 font-semibold">
                • 10 Questions • Mixed Categories • Instant Start
              </div>
            </button>

            {/* Custom Game Card */}
            <button
              onClick={() => handleGameModeSelect('custom')}
              onMouseEnter={() => setHoveredCard('custom')}
              onMouseLeave={() => setHoveredCard(null)}
              onFocus={() => setHoveredCard('custom')}
              onBlur={() => setHoveredCard(null)}
              className={`
                p-8 bg-gradient-to-br from-purple-600 to-purple-700 border-4 border-purple-800 rounded-lg
                text-white text-center transition-all duration-200 pixel-border
                focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50
                ${hoveredCard === 'custom' ? 'scale-105 pixel-shadow transform translate-x-1 translate-y-1' : 'hover:scale-105 hover:pixel-shadow hover:transform hover:translate-x-1 hover:translate-y-1'}
                active:scale-95 active:translate-x-0 active:translate-y-0
              `}
            >
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-3 pixel-text-shadow">CUSTOM GAME</h3>
              <p className="text-purple-200 text-sm leading-relaxed">
                Create AI-powered questions on any topic you choose. Specify difficulty, question
                count, and educational level!
              </p>
              <div className="mt-4 text-xs text-purple-300 font-semibold">
                • AI Generated • Your Topics • Custom Settings
              </div>
            </button>

            {/* Advanced Game Card */}
            <button
              onClick={() => handleGameModeSelect('advanced')}
              onMouseEnter={() => setHoveredCard('advanced')}
              onMouseLeave={() => setHoveredCard(null)}
              onFocus={() => setHoveredCard('advanced')}
              onBlur={() => setHoveredCard(null)}
              className={`
                p-8 bg-gradient-to-br from-blue-600 to-blue-700 border-4 border-blue-800 rounded-lg
                text-white text-center transition-all duration-200 pixel-border
                focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
                ${hoveredCard === 'advanced' ? 'scale-105 pixel-shadow transform translate-x-1 translate-y-1' : 'hover:scale-105 hover:pixel-shadow hover:transform hover:translate-x-1 hover:translate-y-1'}
                active:scale-95 active:translate-x-0 active:translate-y-0 md:col-span-2 lg:col-span-1
              `}
            >
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-3 pixel-text-shadow">ADVANCED GAME</h3>
              <p className="text-blue-200 text-sm leading-relaxed">
                Upload your own documents for AI-powered trivia generation. Perfect for studying or
                testing knowledge of specific materials!
              </p>
              <div className="mt-4 text-xs text-blue-300 font-semibold">
                • Document Upload • Custom Timing • Contextual AI
              </div>
            </button>
          </div>
        </section>{' '}
        {/* Footer info */}
        <footer className="text-center text-gray-400 text-sm">
          <p>Use Escape key to go back • Arrow keys to navigate</p>
          <p className="text-xs mt-1 opacity-75">© 2026 PixelTrivia</p>
        </footer>
      </div>
    </main>
  )
}

export default function GameModePage() {
  return (
    <Suspense fallback={<LoadingOverlay label="Loading game modes..." />}>
      <GameModeContent />
    </Suspense>
  )
}
