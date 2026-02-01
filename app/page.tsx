'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SettingsPanel from './components/SettingsPanel'

// Avatar options with pixel-style descriptions
const AVATAR_OPTIONS = [
  { id: 'knight', name: 'Knight', emoji: '🛡️', color: 'bg-red-600' },
  { id: 'wizard', name: 'Wizard', emoji: '🧙', color: 'bg-purple-600' },
  { id: 'archer', name: 'Archer', emoji: '🏹', color: 'bg-green-600' },
  { id: 'rogue', name: 'Rogue', emoji: '🗡️', color: 'bg-gray-600' },
  { id: 'mage', name: 'Mage', emoji: '✨', color: 'bg-blue-600' },
]

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
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  // Auto-generate random player name on mount
  useEffect(() => {
    setPlayerName(generateRandomPlayerName())
  }, [])
  const handleStartNewGame = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name before starting a game!')
      return
    }

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
      alert('Please enter your name before joining a game!')
      return
    }

    // TODO: Navigate to join game screen
    console.log('Joining existing game...', { playerName, volume, selectedAvatar })
    alert(
      `Coming soon! Join game functionality will be available once backend is configured.\n\nPlayer: ${playerName}\nAvatar: ${selectedAvatar}\nVolume: ${volume}%`
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
    setShowSettings(!showSettings)
    if (showHelp) setShowHelp(false) // Close help if settings is opened
  }

  const handleHelpToggle = () => {
    setShowHelp(!showHelp)
    if (showSettings) setShowSettings(false) // Close settings if help is opened
  }

  const closeModals = () => {
    setShowSettings(false)
    setShowHelp(false)
  }
  // Close modals on escape key and manage focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModals()
      }
    }

    if (showSettings || showHelp) {
      document.addEventListener('keydown', handleKeyDown)
      // Focus the first focusable element in the modal
      const focusableElements = document.querySelectorAll(
        'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const modalElements = Array.from(focusableElements).filter(el =>
        el.closest('[role="dialog"]')
      )
      if (modalElements.length > 0) {
        ;(modalElements[0] as HTMLElement).focus()
      }

      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showSettings, showHelp])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 animate-pulse opacity-60" />
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-400 animate-pulse opacity-60 animation-delay-1000" />
        <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-cyan-400 animate-pulse opacity-60 animation-delay-2000" />
      </div>{' '}
      {/* Main content container */}
      <div className="flex flex-col items-center space-y-8 z-10 max-w-lg w-full">
        {/* Game title */}
        <header className="text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-2 pixel-text-shadow select-none">
            PIXEL
          </h1>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-yellow-400 pixel-text-shadow select-none">
            TRIVIA
          </h2>
          <div className="mt-3 text-cyan-300 text-base tracking-wider">
            ~ RETRO QUIZ CHALLENGE ~
          </div>
        </header>{' '}
        {/* Menu buttons */}
        <nav className="flex flex-col space-y-6 w-full" role="menu">
          {/* Start New Game Button */}
          <button
            onClick={handleStartNewGame}
            onMouseEnter={() => setHoveredButton('new')}
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
            <span className="block">{isCreatingRoom ? 'CREATING ROOM...' : 'START NEW GAME'}</span>
            <span className="block text-sm text-green-200 mt-1 font-normal">
              {isCreatingRoom ? 'Please wait' : 'Create a multiplayer room'}
            </span>
          </button>

          {/* Join Existing Game Button */}
          <button
            onClick={handleJoinExistingGame}
            onMouseEnter={() => setHoveredButton('join')}
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

          {/* Help and Settings Row */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {/* Help Button */}
            <button
              onClick={handleHelpToggle}
              onMouseEnter={() => setHoveredButton('help')}
              onMouseLeave={() => setHoveredButton(null)}
              onFocus={() => setHoveredButton('help')}
              onBlur={() => setHoveredButton(null)}
              className={`
                flex-1 py-3 px-6 text-lg font-bold text-center
                bg-amber-600 hover:bg-amber-500 active:bg-amber-700
                text-white border-4 border-amber-800 hover:border-amber-600
                transform transition-all duration-150 ease-in-out
                focus:outline-none focus:ring-4 focus:ring-amber-300 focus:ring-opacity-50
                ${
                  hoveredButton === 'help'
                    ? 'scale-105 pixel-shadow translate-x-1 translate-y-1'
                    : 'hover:scale-105 hover:pixel-shadow hover:translate-x-1 hover:translate-y-1'
                }
                active:scale-95 active:translate-x-0 active:translate-y-0
                pixel-border
              `}
              role="menuitem"
              aria-label="Show help and game instructions"
            >
              <span className="block">❓ HELP</span>
              <span className="block text-xs text-amber-200 mt-1 font-normal">Game guide</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={handleSettingsToggle}
              onMouseEnter={() => setHoveredButton('settings')}
              onMouseLeave={() => setHoveredButton(null)}
              onFocus={() => setHoveredButton('settings')}
              onBlur={() => setHoveredButton(null)}
              className={`
                sm:w-20 py-3 px-4 text-lg font-bold text-center
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
              <span className="block text-2xl">⚙️</span>
              <span className="block text-xs text-gray-200 mt-1 font-normal sm:hidden">
                Settings
              </span>{' '}
            </button>
          </div>
        </nav>
        {/* Footer info */}
        <footer className="text-center text-gray-400 text-sm mt-8">
          <p>Use arrow keys and Enter to navigate</p>
          <p className="text-xs mt-1 opacity-75">© 2025 PixelTrivia</p>
        </footer>
      </div>{' '}
      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={closeModals}
          role="dialog"
          aria-labelledby="settings-title"
          aria-modal="true"
        >
          <div
            className="bg-gray-900 border-4 border-gray-600 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto pixel-border animate-slideIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="settings-title" className="text-2xl font-bold text-white pixel-text-shadow">
                ⚙️ PLAYER SETTINGS
              </h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-white text-2xl font-bold p-2 hover:bg-gray-800 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300"
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>

            <SettingsPanel
              volume={volume}
              playerName={playerName}
              selectedAvatar={selectedAvatar}
              onVolumeChange={handleVolumeChange}
              onPlayerNameChange={handlePlayerNameChange}
              onAvatarSelect={handleAvatarSelect}
            />
          </div>
        </div>
      )}
      {/* Help Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={closeModals}
          role="dialog"
          aria-labelledby="help-title"
          aria-modal="true"
        >
          <div
            className="bg-gray-900 border-4 border-gray-600 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto pixel-border animate-slideIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="help-title" className="text-2xl font-bold text-white pixel-text-shadow">
                ❓ GAME HELP
              </h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-white text-2xl font-bold p-2 hover:bg-gray-800 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300"
                aria-label="Close help"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 text-white">
              {/* Game Modes Section */}
              <section>
                <h3 className="text-xl font-bold text-cyan-300 mb-3 pixel-text-shadow">
                  🎮 GAME MODES
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-800 border-2 border-gray-600 rounded p-4">
                    <h4 className="font-bold text-green-400 mb-2">⚡ Quick Game</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Jump into a solo trivia game with 10 random questions from various categories.
                      Perfect for a quick brain challenge! No setup required.
                    </p>
                  </div>

                  <div className="bg-gray-800 border-2 border-gray-600 rounded p-4">
                    <h4 className="font-bold text-purple-400 mb-2">🤖 Custom Game</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Create AI-powered trivia questions on any topic you choose! Specify your
                      subject, difficulty level, and question count. Our AI will generate unique
                      questions just for you.
                    </p>
                  </div>
                </div>
              </section>

              {/* Multiplayer Section */}
              <section>
                <h3 className="text-xl font-bold text-cyan-300 mb-3 pixel-text-shadow">
                  👥 MULTIPLAYER
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-800 border-2 border-gray-600 rounded p-4">
                    <h4 className="font-bold text-green-400 mb-2">🎯 Start New Game</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Create a multiplayer room and get a unique room code. Share this code with
                      friends so they can join your game. You&apos;ll be the host and can configure
                      game settings.
                    </p>
                  </div>

                  <div className="bg-gray-800 border-2 border-gray-600 rounded p-4">
                    <h4 className="font-bold text-blue-400 mb-2">🚪 Join Existing Game</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Enter a room code provided by a friend to join their trivia game. Make sure
                      you&apos;ve set up your player name and avatar before joining!
                    </p>
                  </div>
                </div>
              </section>

              {/* Room Codes Section */}
              <section>
                <h3 className="text-xl font-bold text-cyan-300 mb-3 pixel-text-shadow">
                  🔢 ROOM CODES
                </h3>
                <div className="bg-gray-800 border-2 border-gray-600 rounded p-4">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Room codes are 6-character alphanumeric codes (like{' '}
                    <span className="font-mono bg-gray-700 px-1 rounded">ABC123</span>) that allow
                    players to join specific game rooms. They&apos;re automatically generated when
                    you create a new game and expire after the game ends or after 24 hours of
                    inactivity.
                  </p>
                </div>
              </section>

              {/* Scoring Section */}
              <section>
                <h3 className="text-xl font-bold text-cyan-300 mb-3 pixel-text-shadow">
                  🏆 SCORING & GAMEPLAY
                </h3>
                <div className="bg-gray-800 border-2 border-gray-600 rounded p-4">
                  <ul className="text-sm text-gray-300 space-y-2 leading-relaxed">
                    <li>
                      • <strong>Time Bonus:</strong> Faster answers earn more points
                    </li>
                    <li>
                      • <strong>Streak Multiplier:</strong> Consecutive correct answers increase
                      your score multiplier
                    </li>
                    <li>
                      • <strong>Difficulty Bonus:</strong> Harder questions are worth more points
                    </li>
                    <li>
                      • <strong>Final Ranking:</strong> Players are ranked by total score at the end
                    </li>
                  </ul>
                </div>
              </section>

              {/* Tips Section */}
              <section>
                <h3 className="text-xl font-bold text-cyan-300 mb-3 pixel-text-shadow">💡 TIPS</h3>
                <div className="bg-gray-800 border-2 border-gray-600 rounded p-4">
                  <ul className="text-sm text-gray-300 space-y-2 leading-relaxed">
                    <li>• Use keyboard navigation: Arrow keys to move, Enter to select</li>
                    <li>• Set your volume and test your audio before starting</li>
                    <li>• Choose a memorable avatar to stand out in multiplayer games</li>
                    <li>• For custom games, be specific with your topic for better questions</li>
                    <li>• Press Escape to close modals and menus</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
