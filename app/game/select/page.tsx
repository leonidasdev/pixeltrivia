'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AdvancedGameConfigurator, {
  type AdvancedGameConfig,
} from '../../components/AdvancedGameConfigurator'
import { LoadingOverlay, SparklesOverlay, PageTransition } from '@/app/components/ui'

// Game mode types
type GameMode = 'quick' | 'custom' | 'advanced' | null
type PlayOption = 'solo' | 'create' | 'join' | null

interface PlayerSettings {
  name: string
  avatar: string
  volume: number
}

import { AVATAR_OPTIONS, DEFAULT_AVATAR_ID } from '@/constants/avatars'
import { STORAGE_KEYS } from '@/constants/game'

function GameSelectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // State management
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>(null)
  const [playerSettings, setPlayerSettings] = useState<PlayerSettings>({
    name: '',
    avatar: 'knight',
    volume: 50,
  })
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [advancedGameConfig, setAdvancedGameConfig] = useState<AdvancedGameConfig>({
    files: [],
    timePerQuestion: 20,
    questionFormat: 'short',
  })

  // Load player settings and game mode from URL params
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
    const mode = searchParams.get('mode') as GameMode

    setPlayerSettings({ name, avatar, volume })
    setSelectedGameMode(mode)
  }, [searchParams])

  // Get avatar details
  const getAvatarDetails = (avatarId: string) => {
    return AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0]
  }

  // Handle game mode selection
  const handleGameModeSelect = (mode: GameMode) => {
    setSelectedGameMode(mode)
  }
  // Handle play option selection
  const handlePlayOptionSelect = (option: PlayOption) => {
    if (option === 'solo') {
      // Navigate directly to the game
      if (selectedGameMode === 'quick') {
        router.push('/game/quick')
      } else if (selectedGameMode === 'custom') {
        router.push('/game/custom')
      } else if (selectedGameMode === 'advanced') {
        // Pass advanced game config via localStorage for now (in production, would use proper state management)
        localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(advancedGameConfig))
        router.push('/game/advanced')
      }
    } else if (option === 'create') {
      // Navigate to room creation
      if (!selectedGameMode) return
      const params = new URLSearchParams({
        mode: selectedGameMode,
        name: playerSettings.name,
        avatar: playerSettings.avatar,
        volume: playerSettings.volume.toString(),
      })
      // For advanced mode, also store the config
      if (selectedGameMode === 'advanced') {
        localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(advancedGameConfig))
      }
      router.push(`/game/create?${params.toString()}`)
    } else if (option === 'join') {
      // Navigate to room joining
      if (!selectedGameMode) return
      const params = new URLSearchParams({
        mode: selectedGameMode,
        name: playerSettings.name,
        avatar: playerSettings.avatar,
        volume: playerSettings.volume.toString(),
      })
      // For advanced mode, also store the config
      if (selectedGameMode === 'advanced') {
        localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(advancedGameConfig))
      }
      router.push(`/game/join?${params.toString()}`)
    }
  }
  // Handle back navigation from multiplayer options
  const handleBackToGameMode = useCallback(() => {
    // Navigate back to game mode selection with player settings
    const params = new URLSearchParams({
      name: playerSettings.name,
      avatar: playerSettings.avatar,
      volume: playerSettings.volume.toString(),
    })
    router.push(`/game/mode?${params.toString()}`)
  }, [playerSettings, router])

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedGameMode) {
          handleBackToGameMode()
        } else {
          router.back()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedGameMode, router, handleBackToGameMode])

  const avatarDetails = getAvatarDetails(playerSettings.avatar)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <SparklesOverlay />

      {/* Main content container */}
      <PageTransition>
        <div className="flex flex-col items-center space-y-8 z-10 max-w-4xl w-full">
          {/* Header with player info */}
          <header className="text-center relative w-full">
            <h1 className="text-2xl md:text-4xl font-pixel text-white mb-2 pixel-text-shadow">
              SELECT GAME MODE
            </h1>
            <p className="text-cyan-300 font-pixel-body text-xl mb-4">
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
                <div className="text-white font-pixel text-xs">{playerSettings.name}</div>
                <div className="text-gray-400 font-pixel-body text-base">
                  {avatarDetails.name} Avatar
                </div>
              </div>
            </div>
          </header>

          {!selectedGameMode ? (
            /* Game Mode Selection */
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
                  p-8 bg-gradient-to-br from-orange-600 to-orange-700 border-4 border-orange-800
                  text-white text-center transition-all duration-200 pixel-border
                  focus:outline-none focus:ring-4 focus:ring-orange-300 focus:ring-opacity-50
                  ${hoveredCard === 'quick' ? 'scale-105 pixel-shadow transform translate-x-1 translate-y-1' : 'hover:scale-105 hover:pixel-shadow hover:transform hover:translate-x-1 hover:translate-y-1'}
                  active:scale-95 active:translate-x-0 active:translate-y-0
                `}
                >
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-lg font-pixel mb-3 pixel-text-shadow">QUICK GAME</h3>
                  <p className="text-orange-200 font-pixel-body text-base leading-relaxed">
                    Jump into instant trivia with predefined categories. Perfect for quick brain
                    challenges with 10 random questions!
                  </p>
                  <div className="mt-4 font-pixel text-[8px] text-orange-300">
                    • 10 Questions • Mixed Categories • Instant Start
                  </div>
                </button>{' '}
                {/* Custom Game Card */}
                <button
                  onClick={() => handleGameModeSelect('custom')}
                  onMouseEnter={() => setHoveredCard('custom')}
                  onMouseLeave={() => setHoveredCard(null)}
                  onFocus={() => setHoveredCard('custom')}
                  onBlur={() => setHoveredCard(null)}
                  className={`
                  p-8 bg-gradient-to-br from-purple-600 to-purple-700 border-4 border-purple-800
                  text-white text-center transition-all duration-200 pixel-border
                  focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50
                  ${hoveredCard === 'custom' ? 'scale-105 pixel-shadow transform translate-x-1 translate-y-1' : 'hover:scale-105 hover:pixel-shadow hover:transform hover:translate-x-1 hover:translate-y-1'}
                  active:scale-95 active:translate-x-0 active:translate-y-0
                `}
                >
                  <div className="text-4xl mb-4">🤖</div>
                  <h3 className="text-lg font-pixel mb-3 pixel-text-shadow">CUSTOM GAME</h3>
                  <p className="text-purple-200 font-pixel-body text-base leading-relaxed">
                    Create AI-powered questions on any topic you choose. Specify difficulty,
                    question count, and educational level!
                  </p>
                  <div className="mt-4 font-pixel text-[8px] text-purple-300">
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
                  p-8 bg-gradient-to-br from-blue-600 to-blue-700 border-4 border-blue-800
                  text-white text-center transition-all duration-200 pixel-border
                  focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
                  ${hoveredCard === 'advanced' ? 'scale-105 pixel-shadow transform translate-x-1 translate-y-1' : 'hover:scale-105 hover:pixel-shadow hover:transform hover:translate-x-1 hover:translate-y-1'}
                  active:scale-95 active:translate-x-0 active:translate-y-0 md:col-span-2
                `}
                >
                  <div className="text-4xl mb-4">📚</div>
                  <h3 className="text-lg font-pixel mb-3 pixel-text-shadow">ADVANCED GAME</h3>
                  <p className="text-blue-200 font-pixel-body text-base leading-relaxed">
                    Upload your own documents for AI-powered trivia generation. Perfect for studying
                    or testing knowledge of specific materials!
                  </p>
                  <div className="mt-4 font-pixel text-[8px] text-blue-300">
                    • Document Upload • Custom Timing • Contextual AI
                  </div>
                </button>
              </div>
            </section>
          ) : (
            /* Play Option Selection */
            <section className="w-full max-w-2xl">
              {' '}
              <div className="text-center mb-8">
                <h2 className="text-lg font-pixel text-white mb-2 pixel-text-shadow">
                  {selectedGameMode === 'quick'
                    ? '⚡ QUICK GAME'
                    : selectedGameMode === 'custom'
                      ? '🤖 CUSTOM GAME'
                      : '📚 ADVANCED GAME'}{' '}
                  SELECTED
                </h2>
                <p className="text-gray-300 font-pixel-body text-base">
                  {selectedGameMode === 'advanced'
                    ? 'Configure your document-based trivia game, then choose how to play.'
                    : 'You can play alone or with up to 8 players. The game starts when everyone is ready, or after a brief countdown.'}
                </p>{' '}
              </div>
              {/* Advanced Game Configuration */}
              {selectedGameMode === 'advanced' && (
                <div className="mb-8 p-6 bg-gray-900 border-4 border-gray-600 pixel-border">
                  <h3 className="text-sm font-pixel text-white mb-4 pixel-text-shadow">
                    📚 Configure Advanced Game
                  </h3>
                  <AdvancedGameConfigurator
                    config={advancedGameConfig}
                    onConfigChange={setAdvancedGameConfig}
                  />
                </div>
              )}
              <div className="space-y-4">
                {/* Solo Play Option */}
                <button
                  onClick={() => handlePlayOptionSelect('solo')}
                  onMouseEnter={() => setHoveredCard('solo')}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`
                  w-full p-6 bg-gradient-to-r from-green-600 to-green-700 border-4 border-green-800
                  text-white text-center transition-all duration-200 pixel-border
                  focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50
                  ${hoveredCard === 'solo' ? 'scale-105 pixel-shadow transform translate-x-1 translate-y-1' : 'hover:scale-105 hover:pixel-shadow hover:transform hover:translate-x-1 hover:translate-y-1'}
                  active:scale-95 active:translate-x-0 active:translate-y-0
                `}
                >
                  <div className="flex items-center justify-center space-x-4">
                    <span className="text-3xl">🎯</span>
                    <div className="text-left">
                      <h3 className="text-sm font-pixel pixel-text-shadow">PLAY SOLO</h3>
                      <p className="text-green-200 font-pixel-body text-base">
                        Start immediately • No waiting • Practice mode
                      </p>
                    </div>
                  </div>
                </button>

                {/* Multiplayer Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {' '}
                  <button
                    onClick={() => handlePlayOptionSelect('create')}
                    onMouseEnter={() => setHoveredCard('create')}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={`
                    p-6 bg-gradient-to-r from-blue-600 to-blue-700 border-4 border-blue-800
                    text-white text-center transition-all duration-200 pixel-border
                    focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
                    ${hoveredCard === 'create' ? 'scale-105 pixel-shadow transform translate-x-1 translate-y-1' : 'hover:scale-105 hover:pixel-shadow hover:transform hover:translate-x-1 hover:translate-y-1'}
                    active:scale-95 active:translate-x-0 active:translate-y-0
                  `}
                  >
                    <div className="text-3xl mb-3">🎪</div>
                    <h3 className="text-xs font-pixel mb-2 pixel-text-shadow">CREATE ROOM</h3>
                    <p className="text-blue-200 font-pixel-body text-base">
                      Host a game • Get 6-digit code • Invite friends
                    </p>
                  </button>{' '}
                  <button
                    onClick={() => handlePlayOptionSelect('join')}
                    onMouseEnter={() => setHoveredCard('join')}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={`
                    p-6 bg-gradient-to-r from-indigo-600 to-indigo-700 border-4 border-indigo-800
                    text-white text-center transition-all duration-200 pixel-border
                    focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50
                    ${hoveredCard === 'join' ? 'scale-105 pixel-shadow transform translate-x-1 translate-y-1' : 'hover:scale-105 hover:pixel-shadow hover:transform hover:translate-x-1 hover:translate-y-1'}
                    active:scale-95 active:translate-x-0 active:translate-y-0
                  `}
                  >
                    <div className="text-3xl mb-3">🚪</div>
                    <h3 className="text-xs font-pixel mb-2 pixel-text-shadow">JOIN ROOM</h3>{' '}
                    <p className="text-indigo-200 font-pixel-body text-base">
                      Enter room code • Join friends • Play together
                    </p>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Footer info */}
          <footer className="text-center text-gray-400 font-pixel-body text-base">
            <p>Use Escape key to go back • Arrow keys to navigate</p>
            <p className="font-pixel text-[8px] mt-1 opacity-75">© 2026 PixelTrivia</p>
          </footer>
        </div>
      </PageTransition>
    </main>
  )
}

export default function GameSelectPage() {
  return (
    <Suspense fallback={<LoadingOverlay label="Loading game options..." />}>
      <GameSelectContent />
    </Suspense>
  )
}
