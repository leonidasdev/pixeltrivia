/**
 * Play Page — /game/play/[code]
 *
 * The multiplayer game screen. Shows questions, timer,
 * player status sidebar, and host controls.
 *
 * @module game/play/[code]
 * @since 1.1.0
 */

'use client'

import { use, useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useRoom } from '@/hooks/useRoom'
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame'
import { GameQuestion, PlayerList, Scoreboard, HostControls } from '@/app/components/multiplayer'
import { LoadingOverlay, ToastContainer, useToast, AnimatedBackground } from '@/app/components/ui'
import { MULTIPLAYER_STORAGE_KEYS } from '@/constants/game'

interface PlayPageProps {
  params: Promise<{ code: string }>
}

function PlayContent({ params }: PlayPageProps) {
  const { code: roomCode } = use(params)
  const router = useRouter()
  const { messages: toasts, dismissToast, toast } = useToast()

  // Load player session
  const [playerId, setPlayerId] = useState<number | null>(null)
  const [isHost, setIsHost] = useState(false)

  useEffect(() => {
    const storedId = localStorage.getItem(MULTIPLAYER_STORAGE_KEYS.PLAYER_ID)
    const storedHost = localStorage.getItem(MULTIPLAYER_STORAGE_KEYS.IS_HOST)
    if (storedId) setPlayerId(parseInt(storedId))
    if (storedHost === 'true') setIsHost(true)
  }, [])

  // Room state
  const {
    room,
    error: roomError,
    refresh,
  } = useRoom({
    roomCode: roomCode.toUpperCase(),
    playerId,
  })

  // Game state
  const game = useMultiplayerGame({
    roomCode: roomCode.toUpperCase(),
    playerId,
    isHost,
    room,
    onRefresh: refresh,
  })

  // Show errors
  useEffect(() => {
    if (roomError) toast.error(roomError)
    if (game.error) toast.error(game.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomError, game.error])

  const handleFinish = () => {
    localStorage.removeItem(MULTIPLAYER_STORAGE_KEYS.PLAYER_ID)
    localStorage.removeItem(MULTIPLAYER_STORAGE_KEYS.ROOM_CODE)
    localStorage.removeItem(MULTIPLAYER_STORAGE_KEYS.IS_HOST)
    router.push('/')
  }

  // Lobby redirect if not active
  if (room?.status === 'waiting') {
    router.push(`/game/lobby/${roomCode}`)
    return <LoadingOverlay label="Redirecting to lobby..." />
  }

  // Loading state
  if (!room || !playerId) {
    return <LoadingOverlay label="Loading game..." />
  }

  // Finished — show scoreboard
  if (game.phase === 'finished') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBackground />
        <div className="z-10 w-full">
          <Scoreboard
            players={room.players}
            currentPlayerId={playerId}
            isFinal={true}
            onFinish={handleFinish}
            isHost={isHost}
          />
        </div>
        <ToastContainer messages={toasts} onDismiss={dismissToast} />
      </main>
    )
  }

  // Playing — show question + sidebar
  return (
    <main className="min-h-screen flex flex-col lg:flex-row p-4 gap-4 relative overflow-hidden">
      <AnimatedBackground />

      {/* Main game area */}
      <div className="flex-1 flex flex-col items-center justify-center z-10">
        {game.currentQuestion ? (
          <GameQuestion
            question={game.currentQuestion}
            questionNumber={(room.currentQuestion ?? 0) + 1}
            totalQuestions={room.totalQuestions}
            timeRemaining={game.timeRemaining}
            hasAnswered={game.hasAnswered}
            selectedAnswer={game.selectedAnswer}
            wasCorrect={game.wasCorrect}
            correctAnswer={game.correctAnswer}
            isLoading={game.isLoading}
            onAnswer={game.submitAnswer}
          />
        ) : (
          <LoadingOverlay label="Loading question..." />
        )}

        {/* Host controls */}
        {isHost && game.phase !== 'lobby' && (
          <div className="w-full max-w-2xl mt-6">
            <HostControls
              canAdvance={game.timeRemaining <= 0 || room.players.every(p => p.hasAnswered)}
              isLoading={game.isLoading}
              onNextQuestion={game.nextQuestion}
              answeredCount={room.players.filter(p => p.hasAnswered).length}
              totalPlayers={room.players.length}
            />
          </div>
        )}
      </div>

      {/* Sidebar — player list */}
      <aside className="lg:w-64 z-10">
        <div className="bg-gray-900/90 border-2 border-gray-700 rounded-lg p-3 sticky top-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Players ({room.players.length})
          </h3>
          <PlayerList
            players={room.players}
            currentPlayerId={playerId}
            showScores={true}
            showAnswerStatus={true}
            compact={true}
          />
        </div>
      </aside>

      <ToastContainer messages={toasts} onDismiss={dismissToast} />
    </main>
  )
}

export default function PlayPage(props: PlayPageProps) {
  return (
    <Suspense fallback={<LoadingOverlay label="Loading game..." />}>
      <PlayContent {...props} />
    </Suspense>
  )
}
