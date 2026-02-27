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
import { useSound } from '@/hooks/useSound'
import { GameQuestion, PlayerList, Scoreboard, HostControls } from '@/app/components/multiplayer'
import {
  LoadingOverlay,
  ToastContainer,
  useToast,
  AnimatedBackground,
  PixelConfetti,
  ScorePopup,
  AnswerFeedback,
  PageTransition,
  type FeedbackType,
} from '@/app/components/ui'
import { MULTIPLAYER_STORAGE_KEYS } from '@/constants/game'

interface PlayPageProps {
  params: Promise<{ code: string }>
}

function PlayContent({ params }: PlayPageProps) {
  const { code: roomCode } = use(params)
  const router = useRouter()
  const { messages: toasts, dismissToast, toast } = useToast()
  const { play: playSound } = useSound()

  // Sound + visual feedback state
  const [showConfetti, setShowConfetti] = useState(false)
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null)
  const [showScorePopup, setShowScorePopup] = useState(false)
  const [popupScore, setPopupScore] = useState(0)

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

  // Sound effects for answer feedback
  useEffect(() => {
    if (game.wasCorrect === true) {
      playSound('correct')
      setFeedbackType('correct')
      setPopupScore(game.scoreGained ?? 0)
      setShowScorePopup(true)
    } else if (game.wasCorrect === false) {
      playSound('wrong')
      setFeedbackType('wrong')
    }
  }, [game.wasCorrect, game.scoreGained, playSound])

  // Sound effects for question reveal
  useEffect(() => {
    if (game.currentQuestion) {
      playSound('questionReveal')
    }
  }, [game.currentQuestion, playSound])

  // Timer warning sounds
  useEffect(() => {
    if (game.timeRemaining === 5) {
      playSound('timerWarning')
    } else if (game.timeRemaining === 3) {
      playSound('timerCritical')
    }
  }, [game.timeRemaining, playSound])

  // Victory confetti + sound
  useEffect(() => {
    if (game.phase === 'finished') {
      playSound('victory')
      setShowConfetti(true)
    }
  }, [game.phase, playSound])

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
        <PixelConfetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
        <PageTransition style="scale" className="z-10 w-full">
          <Scoreboard
            players={room.players}
            currentPlayerId={playerId}
            isFinal={true}
            onFinish={handleFinish}
            isHost={isHost}
          />
        </PageTransition>
        <ToastContainer messages={toasts} onDismiss={dismissToast} />
      </main>
    )
  }

  // Playing — show question + sidebar
  return (
    <main className="min-h-screen flex flex-col lg:flex-row p-4 gap-4 relative overflow-hidden">
      <AnimatedBackground />

      {/* Answer feedback overlay */}
      <AnswerFeedback
        type={feedbackType}
        duration={1200}
        onComplete={() => setFeedbackType(null)}
      />

      {/* Score popup */}
      {showScorePopup && (
        <ScorePopup
          score={popupScore}
          show={showScorePopup}
          onComplete={() => setShowScorePopup(false)}
          className="top-1/3 left-1/2 -translate-x-1/2"
        />
      )}

      {/* Main game area */}
      <div className="flex-1 flex flex-col items-center justify-center z-10">
        {game.currentQuestion ? (
          <PageTransition style="slide-up" key={room.currentQuestion ?? 0}>
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
          </PageTransition>
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
