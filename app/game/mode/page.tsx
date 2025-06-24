'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Game mode types
type GameMode = 'quick' | 'custom' | 'advanced'

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

export default function GameModePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State management
  const [showHelp, setShowHelp] = useState(false)
  const [playerSettings, setPlayerSettings] = useState<PlayerSettings>({
    name: '',
    avatar: 'knight',
    volume: 50
  })
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  // Load player settings from URL params or localStorage
  useEffect(() => {
    const name = searchParams.get('name') || localStorage.getItem('pixeltrivia_player_name') || 'Player1234'
    const avatar = searchParams.get('avatar') || localStorage.getItem('pixeltrivia_player_avatar') || 'knight'
    const volume = parseInt(searchParams.get('volume') || localStorage.getItem('pixeltrivia_player_volume') || '50')
    
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
      volume: playerSettings.volume.toString()
    })
    router.push(`/game/select?${params.toString()}`)
  }

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
        } else {
          router.back()
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showHelp, router])

  const avatarDetails = getAvatarDetails(playerSettings.avatar)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 animate-pulse opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-400 animate-pulse opacity-60 animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-cyan-400 animate-pulse opacity-60 animation-delay-2000"></div>
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
            <div className={`w-12 h-12 ${avatarDetails.color} border-3 border-gray-600 rounded-lg flex items-center justify-center pixel-border`}>
              <span className="text-2xl" role="img" aria-label={avatarDetails.name}>
                {avatarDetails.emoji}
              </span>
            </div>            <div className="text-left">
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
        </header>        {/* Game Mode Selection */}
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
                Jump into instant trivia with predefined categories. 
                Perfect for quick brain challenges with 10 random questions!
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
                Create AI-powered questions on any topic you choose. 
                Specify difficulty, question count, and educational level!
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
                Upload your own documents for AI-powered trivia generation. 
                Perfect for studying or testing knowledge of specific materials!
              </p>
              <div className="mt-4 text-xs text-blue-300 font-semibold">
                • Document Upload • Custom Timing • Contextual AI
              </div>
            </button>
          </div>
        </section>        {/* Footer info */}
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
            onClick={(e) => e.stopPropagation()}
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
                  Choose from predefined categories and start immediately. 
                  Perfect for when you want instant trivia action with 10 carefully curated questions 
                  from various topics like Science, History, Sports, and Entertainment.
                </p>
              </div>
              
              <div className="bg-gray-800 border-2 border-purple-600 rounded p-4">
                <h3 className="font-bold text-purple-400 mb-2 flex items-center">
                  <span className="mr-2">🤖</span> Custom Game
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Define topic, education level, and number of AI-generated questions. 
                  Our AI will create unique questions tailored to your specifications. 
                  Great for studying specific subjects or exploring niche topics.
                </p>
              </div>

              <div className="bg-gray-800 border-2 border-blue-600 rounded p-4">
                <h3 className="font-bold text-blue-400 mb-2 flex items-center">
                  <span className="mr-2">📚</span> Advanced Game
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  In Advanced Game, you can upload documents to give richer context to the AI.
                  Upload PDF, DOCX, TXT, or Markdown files and our AI will generate questions 
                  based on your content. Note: It may take a couple minutes to process large files.
                </p>
              </div>

              <div className="bg-gray-800 border-2 border-cyan-600 rounded p-4">
                <h3 className="font-bold text-cyan-400 mb-2 flex items-center">
                  <span className="mr-2">🎯</span> Next Step
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  After selecting a game mode, you'll choose whether to play solo, 
                  create a multiplayer room, or join an existing room with friends.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
