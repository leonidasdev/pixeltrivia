/**
 * Game Mode Page — /game/mode
 *
 * Game mode selection screen where players choose between
 * solo play and multiplayer.
 *
 * @module app/game/mode
 * @since 1.0.0
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import {
  LoadingOverlay,
  SparklesOverlay,
  PageTransition,
  StaggerChildren,
  GameModeCard,
  GAME_MODES,
} from '@/app/components/ui'
import { useSound } from '@/hooks/useSound'
import { useSwipe } from '@/hooks/useSwipe'
import { useHoveredCard } from '@/hooks/useHoveredCard'
import { usePlayerSettings, buildPlayerUrl } from '@/hooks/usePlayerSettings'
import Footer from '@/app/components/Footer'

// Game mode types
type GameMode = 'quick' | 'custom' | 'advanced'

function GameModeContent() {
  const router = useRouter()

  // Player settings (from URL params / localStorage)
  const { settings: playerSettings, playerInfo } = usePlayerSettings()
  const { hoveredCard, getHoverHandlers } = useHoveredCard()
  const { play: playSound } = useSound(playerSettings.volume)

  // Handle game mode selection
  const handleGameModeSelect = (mode: GameMode) => {
    playSound('select')
    router.push(buildPlayerUrl('/game/select', playerSettings, { mode }))
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

  // Swipe-right to go back (mobile)
  const { ref: swipeRef } = useSwipe<HTMLElement>({
    onSwipeRight: () => router.back(),
    threshold: 60,
  })

  const avatarDetails = playerInfo.avatarDetails

  return (
    <main
      ref={swipeRef as React.RefObject<HTMLElement>}
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <SparklesOverlay />

      {/* Main content container */}
      <PageTransition
        style="slide-up"
        className="flex flex-col items-center space-y-8 z-10 max-w-4xl w-full"
      >
        {/* Header with player info */}
        <header className="text-center relative w-full">
          <h1 className="text-4xl md:text-5xl font-pixel font-bold text-white mb-2 pixel-text-shadow">
            SELECT GAME MODE
          </h1>
          <p className="text-cyan-300 text-lg mb-4">
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
              <div className="text-white font-bold">{playerSettings.name}</div>
              <div className="text-gray-400 text-sm">{avatarDetails.name} Avatar</div>
            </div>
          </div>
        </header>{' '}
        {/* Game Mode Selection */}
        <section className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            <StaggerChildren staggerDelay={100} style="slide-up">
              {GAME_MODES.map(mode => (
                <GameModeCard
                  key={mode.id}
                  {...mode}
                  isHovered={hoveredCard === mode.id}
                  onClick={() => handleGameModeSelect(mode.id as GameMode)}
                  {...getHoverHandlers(mode.id, () => playSound('hover'))}
                  className={mode.id === 'advanced' ? 'md:col-span-2 lg:col-span-1' : ''}
                />
              ))}
            </StaggerChildren>
          </div>
        </section>{' '}
        {/* Footer info */}
        <Footer hint="Swipe right or press Escape to go back" />
      </PageTransition>
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
