/**
 * Create Game Page — /game/create
 *
 * Room creation page where the host configures and creates
 * a multiplayer game room, then is redirected to the lobby.
 *
 * @module game/create
 * @since 1.1.0
 */

'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState, useCallback } from 'react'
import {
  LoadingOverlay,
  ToastContainer,
  useToast,
  AnimatedBackground,
  PageTransition,
} from '@/app/components/ui'
import { useSound } from '@/hooks'
import { createRoom } from '@/lib/multiplayerApi'
import {
  MULTIPLAYER_STORAGE_KEYS,
  DEFAULT_MAX_PLAYERS,
  DEFAULT_TIME_LIMIT,
  DEFAULT_QUESTION_COUNT,
} from '@/constants/game'

function CreateGameContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { messages: toasts, dismissToast, toast } = useToast()
  const { play } = useSound()

  const [playerName, setPlayerName] = useState('')
  const [avatar, setAvatar] = useState('knight')
  const [gameMode, setGameMode] = useState('quick')
  const [maxPlayers, setMaxPlayers] = useState(DEFAULT_MAX_PLAYERS)
  const [timeLimit, setTimeLimit] = useState(DEFAULT_TIME_LIMIT)
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const name = searchParams.get('name') || localStorage.getItem('pixeltrivia_player_name') || ''
    const avatarParam = searchParams.get('avatar') || 'knight'
    const mode = searchParams.get('mode') || 'quick'

    setPlayerName(name)
    setAvatar(avatarParam)
    setGameMode(mode)
  }, [searchParams])

  const handleCreateRoom = useCallback(async () => {
    if (!playerName.trim()) {
      toast.warning('Please enter your name')
      return
    }

    setIsCreating(true)

    const result = await createRoom({
      playerName: playerName.trim(),
      avatar,
      gameMode,
      maxPlayers,
      timeLimit,
      questionCount,
    })

    setIsCreating(false)

    if (result.success && result.data) {
      // Store session info
      localStorage.setItem(MULTIPLAYER_STORAGE_KEYS.PLAYER_ID, String(result.data.playerId))
      localStorage.setItem(MULTIPLAYER_STORAGE_KEYS.ROOM_CODE, result.data.roomCode)
      localStorage.setItem(MULTIPLAYER_STORAGE_KEYS.IS_HOST, 'true')

      toast.success(`Room ${result.data.roomCode} created!`)

      // Navigate to lobby
      setTimeout(() => {
        router.push(`/game/lobby/${result.data?.roomCode}`)
      }, 500)
    } else {
      toast.error(result.error ?? 'Failed to create room')
    }
  }, [playerName, avatar, gameMode, maxPlayers, timeLimit, questionCount, router, toast])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      <PageTransition>
        <div className="max-w-lg w-full text-center z-10">
          <h1 className="text-2xl md:text-4xl font-pixel text-white mb-8 pixel-text-shadow">
            CREATE GAME ROOM
          </h1>

          <div className="bg-gray-900 border-4 border-gray-600 p-8 pixel-border space-y-6">
            <div className="text-5xl mb-2">🎮</div>

            {/* Player Name */}
            <div>
              <label
                htmlFor="playerName"
                className="block font-pixel text-[10px] text-cyan-300 mb-2 uppercase tracking-wider text-left"
              >
                Your Name
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                className="w-full px-4 py-3 bg-gray-800 border-4 border-gray-600 text-white font-pixel-body text-lg
                       focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50
                       placeholder-gray-400 pixel-border transition-colors"
              />
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="maxPlayers"
                  className="block font-pixel text-[8px] text-gray-400 mb-1 uppercase"
                >
                  Max Players
                </label>
                <select
                  id="maxPlayers"
                  value={maxPlayers}
                  onChange={e => setMaxPlayers(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border-4 border-gray-600 text-white font-pixel-body pixel-border focus:border-cyan-400 focus:outline-none"
                >
                  {[2, 4, 6, 8, 10, 12, 16].map(n => (
                    <option key={n} value={n}>
                      {n} players
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="timeLimit"
                  className="block font-pixel text-[8px] text-gray-400 mb-1 uppercase"
                >
                  Time per Question
                </label>
                <select
                  id="timeLimit"
                  value={timeLimit}
                  onChange={e => setTimeLimit(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border-4 border-gray-600 text-white font-pixel-body pixel-border focus:border-cyan-400 focus:outline-none"
                >
                  {[10, 15, 20, 30, 45, 60].map(s => (
                    <option key={s} value={s}>
                      {s} seconds
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="questionCount"
                  className="block font-pixel text-[8px] text-gray-400 mb-1 uppercase"
                >
                  Number of Questions
                </label>
                <select
                  id="questionCount"
                  value={questionCount}
                  onChange={e => setQuestionCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border-4 border-gray-600 text-white font-pixel-body pixel-border focus:border-cyan-400 focus:outline-none"
                >
                  {[5, 10, 15, 20, 25].map(n => (
                    <option key={n} value={n}>
                      {n} questions
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Game mode badge */}
            <div className="font-pixel-body text-base text-gray-500">
              Mode: <span className="text-white font-pixel text-xs capitalize">{gameMode}</span>
            </div>

            {/* Create button */}
            <button
              onClick={() => {
                play('select')
                handleCreateRoom()
              }}
              disabled={isCreating || !playerName.trim()}
              className={`
              w-full py-4 font-pixel text-sm border-4 pixel-border transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 pixel-glow-hover
              ${
                !isCreating && playerName.trim()
                  ? 'bg-green-600 hover:bg-green-500 border-green-800 text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98] pixel-shadow'
                  : 'bg-gray-600 border-gray-800 text-gray-400 cursor-not-allowed'
              }
            `}
            >
              {isCreating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-pixel-bounce">⏳</span> CREATING ROOM...
                </span>
              ) : (
                '🚀 CREATE ROOM'
              )}
            </button>
          </div>

          <footer className="text-center text-gray-400 font-pixel-body text-base mt-8">
            <p>Create a room and share the code with friends</p>
          </footer>
        </div>
      </PageTransition>

      <ToastContainer messages={toasts} onDismiss={dismissToast} />
    </main>
  )
}

export default function CreateGamePage() {
  return (
    <Suspense fallback={<LoadingOverlay label="Loading room creation..." />}>
      <CreateGameContent />
    </Suspense>
  )
}
