/**
 * Lobby Page — /game/lobby/[code]
 *
 * Waiting room for a multiplayer game. Shows room code,
 * player list, and game settings. Host can start the game.
 *
 * @module game/lobby/[code]
 * @since 1.1.0
 */

'use client'

import { use, useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useRoom } from '@/hooks/useRoom'
import { useSound } from '@/hooks/useSound'
import { leaveRoom, startGame } from '@/lib/multiplayerApi'
import { LobbyView } from '@/app/components/multiplayer'
import {
  LoadingOverlay,
  ToastContainer,
  useToast,
  AnimatedBackground,
  PageTransition,
} from '@/app/components/ui'
import { MULTIPLAYER_STORAGE_KEYS } from '@/constants/game'

interface LobbyPageProps {
  params: Promise<{ code: string }>
}

function LobbyContent({ params }: LobbyPageProps) {
  const { code: roomCode } = use(params)
  const router = useRouter()
  const { messages: toasts, dismissToast, toast } = useToast()
  const { play: playSound } = useSound()
  const [prevPlayerCount, setPrevPlayerCount] = useState(0)

  // Load player session from storage
  const [playerId, setPlayerId] = useState<number | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  useEffect(() => {
    const storedId = localStorage.getItem(MULTIPLAYER_STORAGE_KEYS.PLAYER_ID)
    const storedHost = localStorage.getItem(MULTIPLAYER_STORAGE_KEYS.IS_HOST)
    if (storedId) setPlayerId(parseInt(storedId))
    if (storedHost === 'true') setIsHost(true)
  }, [])

  // Room state with real-time updates
  const {
    room,
    isLoading,
    error,
    isRealtimeConnected,
    refresh: _refresh,
  } = useRoom({
    roomCode: roomCode.toUpperCase(),
    playerId,
  })

  // Redirect to game when status changes to active
  useEffect(() => {
    if (room?.status === 'active') {
      playSound('gameStart')
      router.push(`/game/play/${roomCode}`)
    }
  }, [room?.status, roomCode, router, playSound])

  // Play sound when a player joins/leaves
  useEffect(() => {
    if (room && room.players.length !== prevPlayerCount) {
      if (room.players.length > prevPlayerCount && prevPlayerCount > 0) {
        playSound('lobbyJoin')
      } else if (room.players.length < prevPlayerCount) {
        playSound('lobbyLeave')
      }
      setPrevPlayerCount(room.players.length)
    }
  }, [room, prevPlayerCount, playSound])

  // Show errors
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  const handleStartGame = useCallback(async () => {
    if (!playerId) return

    setIsStarting(true)
    const result = await startGame(roomCode, playerId)
    setIsStarting(false)

    if (result.success) {
      router.push(`/game/play/${roomCode}`)
    } else {
      toast.error(result.error ?? 'Failed to start game')
    }
  }, [playerId, roomCode, router, toast])

  const handleLeave = useCallback(async () => {
    if (!playerId) {
      router.push('/')
      return
    }

    await leaveRoom(roomCode, playerId)

    // Clear session
    localStorage.removeItem(MULTIPLAYER_STORAGE_KEYS.PLAYER_ID)
    localStorage.removeItem(MULTIPLAYER_STORAGE_KEYS.ROOM_CODE)
    localStorage.removeItem(MULTIPLAYER_STORAGE_KEYS.IS_HOST)

    router.push('/')
  }, [playerId, roomCode, router])

  if (isLoading || !room) {
    return <LoadingOverlay label="Loading lobby..." />
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      <PageTransition style="slide-up" className="z-10 w-full max-w-2xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-pixel font-bold text-white pixel-text-shadow mb-2">
            GAME LOBBY
          </h1>
          {isRealtimeConnected && (
            <div className="flex items-center justify-center gap-2 text-xs text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live updates active
            </div>
          )}
        </header>

        <LobbyView
          room={room}
          playerId={playerId}
          isHost={isHost}
          isStarting={isStarting}
          onStartGame={handleStartGame}
          onLeave={handleLeave}
        />
      </PageTransition>

      <ToastContainer messages={toasts} onDismiss={dismissToast} />
    </main>
  )
}

export default function LobbyPage(props: LobbyPageProps) {
  return (
    <Suspense fallback={<LoadingOverlay label="Loading lobby..." />}>
      <LobbyContent {...props} />
    </Suspense>
  )
}
