/**
 * Join Game Page — /game/join
 *
 * Allows players to join a multiplayer room by entering
 * the 6-character room code and their name.
 *
 * @module game/join
 * @since 1.1.0
 */

'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState, useCallback } from 'react'
import { LoadingOverlay, ToastContainer, useToast, AnimatedBackground } from '@/app/components/ui'
import { joinRoom } from '@/lib/multiplayerApi'
import { MULTIPLAYER_STORAGE_KEYS } from '@/constants/game'

function JoinGameContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { messages: toasts, dismissToast, toast } = useToast()

  const [playerName, setPlayerName] = useState('')
  const [avatar, setAvatar] = useState('knight')
  const [roomCode, setRoomCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    const name = searchParams.get('name') || localStorage.getItem('pixeltrivia_player_name') || ''
    const avatarParam = searchParams.get('avatar') || 'knight'

    setPlayerName(name)
    setAvatar(avatarParam)
  }, [searchParams])

  const handleJoinRoom = useCallback(async () => {
    if (roomCode.length !== 6) {
      toast.warning('Please enter a valid 6-character room code.')
      return
    }

    if (!playerName.trim()) {
      toast.warning('Please enter your name.')
      return
    }

    setIsJoining(true)

    const result = await joinRoom({
      roomCode,
      playerName: playerName.trim(),
      avatar,
    })

    setIsJoining(false)

    if (result.success && result.data) {
      // Store session info
      localStorage.setItem(MULTIPLAYER_STORAGE_KEYS.PLAYER_ID, String(result.data.playerId))
      localStorage.setItem(MULTIPLAYER_STORAGE_KEYS.ROOM_CODE, roomCode)
      localStorage.setItem(MULTIPLAYER_STORAGE_KEYS.IS_HOST, 'false')

      toast.success('Joined room!')

      // Navigate to lobby
      setTimeout(() => {
        router.push(`/game/lobby/${roomCode}`)
      }, 500)
    } else {
      toast.error(result.error ?? 'Failed to join room')
    }
  }, [roomCode, playerName, avatar, router, toast])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      <div className="max-w-lg w-full text-center z-10">
        <h1 className="text-4xl font-bold text-white mb-8 pixel-text-shadow">JOIN GAME ROOM</h1>

        <div className="bg-gray-900 border-4 border-gray-600 rounded-lg p-8 pixel-border space-y-6">
          <div className="text-5xl mb-2">🚪</div>

          {/* Player Name */}
          <div>
            <label
              htmlFor="playerName"
              className="block text-sm font-bold text-cyan-300 mb-2 uppercase tracking-wider text-left"
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
              className="w-full px-4 py-3 bg-gray-800 border-3 border-gray-600 text-white font-semibold
                       focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50
                       placeholder-gray-400 rounded transition-colors"
            />
          </div>

          {/* Room Code */}
          <div>
            <label
              htmlFor="roomCode"
              className="block text-sm font-bold text-cyan-300 mb-2 uppercase tracking-wider text-left"
            >
              Room Code
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABC123"
              maxLength={6}
              className="w-full px-4 py-3 bg-gray-800 border-3 border-gray-600 text-white font-mono text-center text-2xl tracking-widest
                       focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50
                       placeholder-gray-400 rounded transition-colors"
            />
            <p className="text-xs text-gray-400 mt-2">
              6 characters - Letters and numbers - Case insensitive
            </p>
          </div>

          {/* Join button */}
          <button
            onClick={handleJoinRoom}
            disabled={roomCode.length !== 6 || !playerName.trim() || isJoining}
            className={`
              w-full py-4 text-xl font-bold border-4 rounded-lg transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
              ${
                roomCode.length === 6 && playerName.trim() && !isJoining
                  ? 'bg-blue-600 hover:bg-blue-500 border-blue-800 text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-gray-600 border-gray-800 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isJoining ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> JOINING...
              </span>
            ) : roomCode.length === 6 ? (
              '🎮 JOIN ROOM'
            ) : (
              `ENTER ${6 - roomCode.length} MORE CHARACTER${6 - roomCode.length !== 1 ? 'S' : ''}`
            )}
          </button>
        </div>

        <footer className="text-center text-gray-400 text-sm mt-8">
          <p>Enter a valid room code to join an existing game</p>
        </footer>
      </div>

      <ToastContainer messages={toasts} onDismiss={dismissToast} />
    </main>
  )
}

export default function JoinGamePage() {
  return (
    <Suspense fallback={<LoadingOverlay label="Loading join screen..." />}>
      <JoinGameContent />
    </Suspense>
  )
}
