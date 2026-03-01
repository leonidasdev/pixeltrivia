/**
 * Game Select Page — /game/select
 *
 * Category and configuration selection for a new game.
 * Supports Quick, Custom, and Advanced game modes.
 *
 * @module app/game/select
 * @since 1.0.0
 */

'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { AdvancedGameConfig } from '../../components/AdvancedGameConfigurator'
import {
  LoadingOverlay,
  SparklesOverlay,
  PageTransition,
  GameModeCard,
  GAME_MODES,
} from '@/app/components/ui'
import { useSwipe } from '@/hooks/useSwipe'
import { useHoveredCard } from '@/hooks/useHoveredCard'
import { usePlayerSettings, buildPlayerUrl } from '@/hooks/usePlayerSettings'
import Footer from '@/app/components/Footer'

const AdvancedGameConfigurator = dynamic(
  () => import('../../components/AdvancedGameConfigurator'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="text-yellow-400 font-pixel text-xs animate-pulse">
          Loading configurator...
        </div>
      </div>
    ),
  }
)

// Game mode types
type GameMode = 'quick' | 'custom' | 'advanced' | null
type PlayOption = 'solo' | 'create' | 'join' | null

import { STORAGE_KEYS } from '@/constants/game'

function GameSelectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Player settings (from URL params / localStorage)
  const { settings: playerSettings, playerInfo } = usePlayerSettings()

  // State management
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>(null)
  const { hoveredCard, getHoverHandlers } = useHoveredCard()
  const [advancedGameConfig, setAdvancedGameConfig] = useState<AdvancedGameConfig>({
    files: [],
    timePerQuestion: 20,
    questionFormat: 'short',
  })

  // Load game mode from URL params
  useEffect(() => {
    const mode = searchParams.get('mode') as GameMode
    setSelectedGameMode(mode)
  }, [searchParams])

  const avatarDetails = playerInfo.avatarDetails

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
      // For advanced mode, also store the config
      if (selectedGameMode === 'advanced') {
        localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(advancedGameConfig))
      }
      router.push(buildPlayerUrl('/game/create', playerSettings, { mode: selectedGameMode }))
    } else if (option === 'join') {
      // Navigate to room joining
      if (!selectedGameMode) return
      // For advanced mode, also store the config
      if (selectedGameMode === 'advanced') {
        localStorage.setItem(STORAGE_KEYS.ADVANCED_CONFIG, JSON.stringify(advancedGameConfig))
      }
      router.push(buildPlayerUrl('/game/join', playerSettings, { mode: selectedGameMode }))
    }
  }
  // Handle back navigation from multiplayer options
  const handleBackToGameMode = useCallback(() => {
    router.push(buildPlayerUrl('/game/mode', playerSettings))
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

  // Swipe-right to go back (mobile)
  const { ref: swipeRef } = useSwipe<HTMLElement>({
    onSwipeRight: () => {
      if (selectedGameMode) {
        handleBackToGameMode()
      } else {
        router.back()
      }
    },
    threshold: 60,
  })

  return (
    <main
      ref={swipeRef as React.RefObject<HTMLElement>}
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
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
                className={`w-12 h-12 ${avatarDetails.color} border-3 border-gray-600 flex items-center justify-center pixel-border`}
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
                {GAME_MODES.map(mode => (
                  <GameModeCard
                    key={mode.id}
                    {...mode}
                    isHovered={hoveredCard === mode.id}
                    onClick={() => handleGameModeSelect(mode.id as GameMode)}
                    {...getHoverHandlers(mode.id)}
                    className={mode.id === 'advanced' ? 'md:col-span-2' : ''}
                  />
                ))}
              </div>
            </section>
          ) : (
            /* Play Option Selection */
            <section className="w-full max-w-2xl">
              {' '}
              <div className="text-center mb-8">
                <h2 className="text-lg font-pixel text-white mb-2 pixel-text-shadow">
                  {selectedGameMode === 'quick'
                    ? '> QUICK GAME'
                    : selectedGameMode === 'custom'
                      ? 'AI CUSTOM GAME'
                      : 'ADV ADVANCED GAME'}{' '}
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
                    ADV Configure Advanced Game
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
                  {...getHoverHandlers('solo')}
                  className={`
                  w-full p-6 bg-gradient-to-r from-green-600 to-green-700 border-4 border-green-800
                  text-white text-center transition-all duration-200 pixel-border
                  focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50
                  ${hoveredCard === 'solo' ? 'scale-105 pixel-shadow transform translate-x-1 translate-y-1' : 'hover:scale-105 hover:pixel-shadow hover:transform hover:translate-x-1 hover:translate-y-1'}
                  active:scale-95 active:translate-x-0 active:translate-y-0
                `}
                >
                  <div className="flex items-center justify-center space-x-4">
                    <span className="text-3xl">T</span>
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
                    {...getHoverHandlers('create')}
                    className={`
                    p-6 bg-gradient-to-r from-blue-600 to-blue-700 border-4 border-blue-800
                    text-white text-center transition-all duration-200 pixel-border
                    focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
                    ${hoveredCard === 'create' ? 'scale-105 pixel-shadow transform translate-x-1 translate-y-1' : 'hover:scale-105 hover:pixel-shadow hover:transform hover:translate-x-1 hover:translate-y-1'}
                    active:scale-95 active:translate-x-0 active:translate-y-0
                  `}
                  >
                    <div className="text-3xl mb-3">+</div>
                    <h3 className="text-xs font-pixel mb-2 pixel-text-shadow">CREATE ROOM</h3>
                    <p className="text-blue-200 font-pixel-body text-base">
                      Host a game • Get 6-digit code • Invite friends
                    </p>
                  </button>{' '}
                  <button
                    onClick={() => handlePlayOptionSelect('join')}
                    {...getHoverHandlers('join')}
                    className={`
                    p-6 bg-gradient-to-r from-indigo-600 to-indigo-700 border-4 border-indigo-800
                    text-white text-center transition-all duration-200 pixel-border
                    focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50
                    ${hoveredCard === 'join' ? 'scale-105 pixel-shadow transform translate-x-1 translate-y-1' : 'hover:scale-105 hover:pixel-shadow hover:transform hover:translate-x-1 hover:translate-y-1'}
                    active:scale-95 active:translate-x-0 active:translate-y-0
                  `}
                  >
                    <div className="text-3xl mb-3">J</div>
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
          <Footer hint="Swipe right or press Escape to go back" />
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
