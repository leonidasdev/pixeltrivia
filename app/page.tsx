'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SettingsPanel from './components/SettingsPanel'
import Footer from './components/Footer'
import {
  ToastContainer,
  useToast,
  SparklesOverlay,
  Modal,
  PageTransition,
  StaggerChildren,
} from './components/ui'
import { useSound } from '@/hooks/useSound'

// Generate random player name
const generateRandomPlayerName = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000)
  return `Player${randomDigits}`
}

export default function HomePage() {
  const router = useRouter()
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [volume, setVolume] = useState(50)
  const [playerName, setPlayerName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('knight')
  const [isCreatingRoom, _setIsCreatingRoom] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [nameError, setNameError] = useState('')
  const { messages: toasts, dismissToast, toast } = useToast()
  const { play: playSound } = useSound(volume)

  // Auto-generate random player name on mount
  useEffect(() => {
    setPlayerName(generateRandomPlayerName())
  }, [])
  const handleStartNewGame = async () => {
    if (!playerName.trim()) {
      setNameError('Please enter your name before starting a game!')
      toast.warning('Please enter your name in Settings before starting.')
      playSound('wrong')
      return
    }
    setNameError('')
    playSound('gameStart')

    // Navigate to game mode selection screen with player settings
    const params = new URLSearchParams({
      name: playerName,
      avatar: selectedAvatar,
      volume: volume.toString(),
    })
    router.push(`/game/mode?${params.toString()}`)
  }
  const handleJoinExistingGame = () => {
    if (!playerName.trim()) {
      setNameError('Please enter your name before joining a game!')
      toast.warning('Please enter your name in Settings before joining.')
      playSound('wrong')
      return
    }
    setNameError('')
    playSound('navigate')

    // TODO: Navigate to join game screen
    toast.info(
      'Coming soon! Join game functionality will be available once the backend is configured.'
    )
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseInt(e.target.value))
  }

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value)
  }
  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId)
  }

  const handleSettingsToggle = () => {
    playSound('select')
    setShowSettings(!showSettings)
  }

  const closeSettings = () => {
    setShowSettings(false)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <SparklesOverlay /> {/* Main content container */}
      <PageTransition
        style="fade"
        className="flex flex-col items-center space-y-8 z-10 max-w-lg w-full"
      >
        {/* Game title */}
        <header className="text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-pixel font-bold text-white mb-2 pixel-text-shadow select-none animate-pixel-float">
            PIXEL
          </h1>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-pixel font-bold text-yellow-400 pixel-text-shadow select-none">
            TRIVIA
          </h2>
          <div className="mt-3 text-cyan-300 text-base tracking-wider">
            ~ RETRO QUIZ CHALLENGE ~
          </div>
        </header>{' '}
        {/* Menu buttons */}
        <nav className="flex flex-col space-y-6 w-full" role="menu">
          <StaggerChildren staggerDelay={120} style="slide-up">
            {/* Start New Game Button */}
            <button
              onClick={handleStartNewGame}
              onMouseEnter={() => {
                setHoveredButton('new')
                playSound('hover')
              }}
              onMouseLeave={() => setHoveredButton(null)}
              onFocus={() => setHoveredButton('new')}
              onBlur={() => setHoveredButton(null)}
              disabled={isCreatingRoom}
              className={`
              w-full py-4 px-8 text-2xl font-bold text-center
              ${
                isCreatingRoom
                  ? 'bg-green-400 border-green-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-500 active:bg-green-700 border-green-800 hover:border-green-600'
              }
              text-white border-4
              transform transition-all duration-150 ease-in-out
              focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50
              ${
                !isCreatingRoom && hoveredButton === 'new'
                  ? 'scale-105 pixel-shadow translate-x-1 translate-y-1'
                  : !isCreatingRoom
                    ? 'hover:scale-105 hover:pixel-shadow hover:translate-x-1 hover:translate-y-1'
                    : ''
              }
              ${!isCreatingRoom ? 'active:scale-95 active:translate-x-0 active:translate-y-0' : ''}
              pixel-border
            `}
              role="menuitem"
              aria-label="Start a new trivia game"
            >
              <span className="block">
                {isCreatingRoom ? 'CREATING ROOM...' : 'START NEW GAME'}
              </span>
              <span className="block text-sm text-green-200 mt-1 font-normal">
                {isCreatingRoom ? 'Please wait' : 'Create a multiplayer room'}
              </span>
            </button>

            {/* Join Existing Game Button */}
            <button
              onClick={handleJoinExistingGame}
              onMouseEnter={() => {
                setHoveredButton('join')
                playSound('hover')
              }}
              onMouseLeave={() => setHoveredButton(null)}
              onFocus={() => setHoveredButton('join')}
              onBlur={() => setHoveredButton(null)}
              className={`
              w-full py-4 px-8 text-2xl font-bold text-center
              bg-blue-600 hover:bg-blue-500 active:bg-blue-700
              text-white border-4 border-blue-800 hover:border-blue-600
              transform transition-all duration-150 ease-in-out
              focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
              ${
                hoveredButton === 'join'
                  ? 'scale-105 pixel-shadow translate-x-1 translate-y-1'
                  : 'hover:scale-105 hover:pixel-shadow hover:translate-x-1 hover:translate-y-1'
              }
              active:scale-95 active:translate-x-0 active:translate-y-0
              pixel-border
            `}
              role="menuitem"
              aria-label="Join an existing trivia game session"
            >
              <span className="block">JOIN EXISTING GAME</span>
              <span className="block text-sm text-blue-200 mt-1 font-normal">Enter game code</span>
            </button>

            {/* Settings Row */}
            <div className="flex justify-center w-full gap-3">
              {/* Stats Button */}
              <button
                onClick={() => {
                  playSound('navigate')
                  router.push('/game/stats')
                }}
                onMouseEnter={() => {
                  setHoveredButton('stats')
                  playSound('hover')
                }}
                onMouseLeave={() => setHoveredButton(null)}
                onFocus={() => setHoveredButton('stats')}
                onBlur={() => setHoveredButton(null)}
                className={`
                w-1/2 py-3 px-6 text-lg font-bold text-center
                bg-purple-600 hover:bg-purple-500 active:bg-purple-700
                text-white border-4 border-purple-800 hover:border-purple-600
                transform transition-all duration-150 ease-in-out
                focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50
                ${
                  hoveredButton === 'stats'
                    ? 'scale-105 pixel-shadow translate-x-1 translate-y-1'
                    : 'hover:scale-105 hover:pixel-shadow hover:translate-x-1 hover:translate-y-1'
                }
                active:scale-95 active:translate-x-0 active:translate-y-0
                pixel-border
              `}
                role="menuitem"
                aria-label="View game stats and history"
              >
                <span className="block">📊 STATS</span>
                <span className="block text-xs text-purple-200 mt-1 font-normal">
                  History & records
                </span>
              </button>

              {/* Settings Button */}
              <button
                onClick={handleSettingsToggle}
                onMouseEnter={() => {
                  setHoveredButton('settings')
                  playSound('hover')
                }}
                onMouseLeave={() => setHoveredButton(null)}
                onFocus={() => setHoveredButton('settings')}
                onBlur={() => setHoveredButton(null)}
                className={`
                w-1/2 py-3 px-6 text-lg font-bold text-center
                bg-gray-600 hover:bg-gray-500 active:bg-gray-700
                text-white border-4 border-gray-800 hover:border-gray-600
                transform transition-all duration-150 ease-in-out
                focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50
                ${
                  hoveredButton === 'settings'
                    ? 'scale-105 pixel-shadow translate-x-1 translate-y-1'
                    : 'hover:scale-105 hover:pixel-shadow hover:translate-x-1 hover:translate-y-1'
                }
                active:scale-95 active:translate-x-0 active:translate-y-0
                pixel-border
              `}
                role="menuitem"
                aria-label="Open player settings"
              >
                <span className="block">⚙️ SETTINGS</span>
                <span className="block text-xs text-gray-200 mt-1 font-normal">
                  Name, avatar & volume
                </span>
              </button>
            </div>
          </StaggerChildren>
        </nav>
        {/* Footer info */}
        <Footer hint="Use arrow keys and Enter to navigate" className="mt-8" />
      </PageTransition>{' '}
      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={closeSettings} title="⚙️ PLAYER SETTINGS" size="lg">
        {nameError && (
          <div
            className="mb-4 p-3 bg-red-900 bg-opacity-40 border-2 border-red-500 text-red-200 text-sm pixel-border"
            role="alert"
          >
            {nameError}
          </div>
        )}

        <SettingsPanel
          volume={volume}
          playerName={playerName}
          selectedAvatar={selectedAvatar}
          onVolumeChange={handleVolumeChange}
          onPlayerNameChange={handlePlayerNameChange}
          onAvatarSelect={handleAvatarSelect}
        />
      </Modal>
      {/* Toast notifications */}
      <ToastContainer messages={toasts} onDismiss={dismissToast} />
    </main>
  )
}
