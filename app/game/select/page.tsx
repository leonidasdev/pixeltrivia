'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AdvancedGameConfigurator, {
  type AdvancedGameConfig,
} from '../../components/AdvancedGameConfigurator'

// Game mode types
type GameMode = 'quick' | 'custom' | 'advanced' | null
type PlayOption = 'solo' | 'create' | 'join' | null

interface PlayerSettings {
  name: string
  avatar: string
  volume: number
}

// Avatar options matching the main menu
const AVATAR_OPTIONS = [
  { id: 'knight', name: 'Knight', emoji: '🛡️', color: 'bg-red-600' },
  { id: 'wizard', name: 'Wizard', emoji: '🧙', color: 'bg-purple-600' },
  { id: 'archer', name: 'Archer', emoji: '🏹', color: 'bg-green-600' },
  { id: 'rogue', name: 'Rogue', emoji: '🗡️', color: 'bg-gray-600' },
  { id: 'mage', name: 'Mage', emoji: '✨', color: 'bg-blue-600' },
]

function GameSelectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // State management
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>(null)
  const [showHelp, setShowHelp] = useState(false)
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
      searchParams.get('name') || localStorage.getItem('pixeltrivia_player_name') || 'Player1234'
    const avatar =
      searchParams.get('avatar') || localStorage.getItem('pixeltrivia_player_avatar') || 'knight'
    const volume = parseInt(
      searchParams.get('volume') || localStorage.getItem('pixeltrivia_player_volume') || '50'
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
        localStorage.setItem('pixeltrivia_advanced_config', JSON.stringify(advancedGameConfig))
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
        localStorage.setItem('pixeltrivia_advanced_config', JSON.stringify(advancedGameConfig))
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
        localStorage.setItem('pixeltrivia_advanced_config', JSON.stringify(advancedGameConfig))
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

  // Close help modal
  const closeHelp = () => {
    setShowHelp(false)
  }

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showHelp) {
          closeHelp()
        } else if (selectedGameMode) {
          handleBackToGameMode()
        } else {
          router.back()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showHelp, selectedGameMode, router, handleBackToGameMode])

  const avatarDetails = getAvatarDetails(playerSettings.avatar)

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

          {/* Help button in top-right */}
          <button
            onClick={() => setShowHelp(true)}
            className="absolute top-0 right-0 w-12 h-12 bg-amber-600 hover:bg-amber-500 border-3 border-amber-800 hover:border-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-xl transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-amber-300 focus:ring-opacity-50 pixel-border hover:scale-105"
            aria-label="Show game mode help"
          >
            ?
          </button>
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
              </button>{' '}
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
                  active:scale-95 active:translate-x-0 active:translate-y-0 md:col-span-2
                `}
              >
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-2xl font-bold mb-3 pixel-text-shadow">ADVANCED GAME</h3>
                <p className="text-blue-200 text-sm leading-relaxed">
                  Upload your own documents for AI-powered trivia generation. Perfect for studying
                  or testing knowledge of specific materials!
                </p>
                <div className="mt-4 text-xs text-blue-300 font-semibold">
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
              <h2 className="text-2xl font-bold text-white mb-2 pixel-text-shadow">
                {selectedGameMode === 'quick'
                  ? '⚡ QUICK GAME'
                  : selectedGameMode === 'custom'
                    ? '🤖 CUSTOM GAME'
                    : '📚 ADVANCED GAME'}{' '}
                SELECTED
              </h2>
              <p className="text-gray-300">
                {selectedGameMode === 'advanced'
                  ? 'Configure your document-based trivia game, then choose how to play.'
                  : 'You can play alone or with up to 8 players. The game starts when everyone is ready, or after a brief countdown.'}
              </p>{' '}
            </div>
            {/* Advanced Game Configuration */}
            {selectedGameMode === 'advanced' && (
              <div className="mb-8 p-6 bg-gray-900 border-3 border-gray-600 rounded-lg pixel-border">
                <h3 className="text-xl font-bold text-white mb-4 pixel-text-shadow">
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
                  w-full p-6 bg-gradient-to-r from-green-600 to-green-700 border-4 border-green-800 rounded-lg
                  text-white text-center transition-all duration-200 pixel-border
                  focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50
                  ${hoveredCard === 'solo' ? 'scale-105 pixel-shadow transform translate-x-1 translate-y-1' : 'hover:scale-105 hover:pixel-shadow hover:transform hover:translate-x-1 hover:translate-y-1'}
                  active:scale-95 active:translate-x-0 active:translate-y-0
                `}
              >
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-3xl">🎯</span>
                  <div className="text-left">
                    <h3 className="text-xl font-bold pixel-text-shadow">PLAY SOLO</h3>
                    <p className="text-green-200 text-sm">
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
                    p-6 bg-gradient-to-r from-blue-600 to-blue-700 border-4 border-blue-800 rounded-lg
                    text-white text-center transition-all duration-200 pixel-border
                    focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
                    ${hoveredCard === 'create' ? 'scale-105 pixel-shadow transform translate-x-1 translate-y-1' : 'hover:scale-105 hover:pixel-shadow hover:transform hover:translate-x-1 hover:translate-y-1'}
                    active:scale-95 active:translate-x-0 active:translate-y-0
                  `}
                >
                  <div className="text-3xl mb-3">🎪</div>
                  <h3 className="text-lg font-bold mb-2 pixel-text-shadow">CREATE ROOM</h3>
                  <p className="text-blue-200 text-sm">
                    Host a game • Get 6-digit code • Invite friends
                  </p>
                </button>{' '}
                <button
                  onClick={() => handlePlayOptionSelect('join')}
                  onMouseEnter={() => setHoveredCard('join')}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`
                    p-6 bg-gradient-to-r from-indigo-600 to-indigo-700 border-4 border-indigo-800 rounded-lg
                    text-white text-center transition-all duration-200 pixel-border
                    focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50
                    ${hoveredCard === 'join' ? 'scale-105 pixel-shadow transform translate-x-1 translate-y-1' : 'hover:scale-105 hover:pixel-shadow hover:transform hover:translate-x-1 hover:translate-y-1'}
                    active:scale-95 active:translate-x-0 active:translate-y-0
                  `}
                >
                  <div className="text-3xl mb-3">🚪</div>
                  <h3 className="text-lg font-bold mb-2 pixel-text-shadow">JOIN ROOM</h3>{' '}
                  <p className="text-indigo-200 text-sm">
                    Enter room code • Join friends • Play together
                  </p>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Footer info */}
        <footer className="text-center text-gray-400 text-sm">
          <p>Use Escape key to go back • Arrow keys to navigate</p>
          <p className="text-xs mt-1 opacity-75">© 2025 PixelTrivia</p>
        </footer>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={closeHelp}
          role="dialog"
          aria-labelledby="help-title"
          aria-modal="true"
        >
          <div
            className="bg-gray-900 border-4 border-gray-600 rounded-lg p-6 max-w-lg w-full pixel-border animate-slideIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="help-title" className="text-xl font-bold text-white pixel-text-shadow">
                ❓ GAME MODE HELP
              </h2>
              <button
                onClick={closeHelp}
                className="text-gray-400 hover:text-white text-2xl font-bold p-2 hover:bg-gray-800 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300"
                aria-label="Close help"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-white">
              <div className="bg-gray-800 border-2 border-orange-600 rounded p-4">
                <h3 className="font-bold text-orange-400 mb-2 flex items-center">
                  <span className="mr-2">⚡</span> Quick Game
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Choose from predefined categories and start immediately. Perfect for when you want
                  instant trivia action with 10 carefully curated questions from various topics like
                  Science, History, Sports, and Entertainment.
                </p>
              </div>

              <div className="bg-gray-800 border-2 border-purple-600 rounded p-4">
                <h3 className="font-bold text-purple-400 mb-2 flex items-center">
                  <span className="mr-2">🤖</span> Custom Game
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Define topic, education level, and number of AI-generated questions. Our AI will
                  create unique questions tailored to your specifications. Great for studying
                  specific subjects or exploring niche topics.
                </p>
              </div>

              <div className="bg-gray-800 border-2 border-cyan-600 rounded p-4">
                <h3 className="font-bold text-cyan-400 mb-2 flex items-center">
                  <span className="mr-2">👥</span> Multiplayer
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Both game modes support solo play or multiplayer with up to 8 players. Create a
                  room to host, or join using a 6-character room code.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default function GameSelectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
      }
    >
      <GameSelectContent />
    </Suspense>
  )
}
