/**
 * LobbyView Component
 *
 * Displays the waiting room before a multiplayer game starts.
 * Shows room code, player list, settings, and start button (host only).
 * Styled with pixel-art aesthetic for retro game feel.
 *
 * @module app/components/multiplayer/LobbyView
 * @since 1.1.0
 */

'use client'

import { useState, useCallback } from 'react'
import { PlayerList } from './PlayerList'
import { formatRoomCode } from '@/lib/roomCode'
import { MIN_PLAYERS_TO_START } from '@/constants/game'
import type { RoomState } from '@/lib/multiplayerApi'

interface LobbyViewProps {
  /** Room state data */
  room: RoomState
  /** Current player's ID */
  playerId: number | null
  /** Whether current player is the host */
  isHost: boolean
  /** Loading state for start button */
  isStarting: boolean
  /** Callback when host clicks Start */
  onStartGame: () => void
  /** Callback when player leaves */
  onLeave: () => void
}

export function LobbyView({
  room,
  playerId,
  isHost,
  isStarting,
  onStartGame,
  onLeave,
}: LobbyViewProps) {
  const playerCount = room.players.length
  const canStart = playerCount >= MIN_PLAYERS_TO_START
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/game/join?code=${room.code}`
      : `/game/join?code=${room.code}`

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(room.code)
      setCopyFeedback('Code copied!')
      setTimeout(() => setCopyFeedback(null), 2000)
    } catch {
      setCopyFeedback('Copy failed')
      setTimeout(() => setCopyFeedback(null), 2000)
    }
  }, [room.code])

  const handleShareInvite = useCallback(async () => {
    const shareData = {
      title: 'Join my PixelTrivia game!',
      text: `Join my trivia room with code ${room.code}`,
      url: inviteUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setCopyFeedback('Shared!')
      } else {
        await navigator.clipboard.writeText(inviteUrl)
        setCopyFeedback('Link copied!')
      }
    } catch {
      // User cancelled share dialog — no error
    }
    setTimeout(() => setCopyFeedback(null), 2000)
  }, [room.code, inviteUrl])

  return (
    <div className="max-w-xl w-full mx-auto space-y-6">
      {/* Room Code Display */}
      <div className="text-center">
        <p className="font-pixel-body text-lg text-gray-400 uppercase tracking-wider mb-2">
          Room Code
        </p>
        <button
          onClick={handleCopyCode}
          className="bg-gray-800 border-4 border-cyan-500 px-8 py-4 inline-block pixel-border pixel-shadow hover:border-cyan-400 transition-colors cursor-pointer focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-opacity-50"
          title="Click to copy room code"
        >
          <span className="text-4xl md:text-5xl font-pixel font-bold text-cyan-300 tracking-[0.3em] pixel-text-shadow">
            {formatRoomCode(room.code)}
          </span>
        </button>
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            onClick={handleCopyCode}
            className="px-3 py-2 min-h-[44px] font-pixel text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border-4 border-gray-600 pixel-border transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          >
            {copyFeedback === 'Code copied!'
              ? '✓ Copied!'
              : copyFeedback === 'Copy failed'
                ? '❌ Copy failed'
                : '📋 COPY CODE'}
          </button>
          <button
            onClick={handleShareInvite}
            className="px-3 py-2 min-h-[44px] font-pixel text-xs bg-cyan-700 hover:bg-cyan-600 text-white border-4 border-cyan-800 pixel-border transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          >
            {copyFeedback === 'Link copied!' || copyFeedback === 'Shared!'
              ? `✓ ${copyFeedback}`
              : '📤 INVITE LINK'}
          </button>
        </div>
      </div>

      {/* Game Settings */}
      <div className="bg-gray-900 border-4 border-gray-700 p-4 pixel-border">
        <h3 className="font-pixel text-xs text-gray-400 uppercase tracking-wider mb-3 pixel-text-shadow">
          Game Settings
        </h3>
        <div className="grid grid-cols-2 gap-3 font-pixel-body text-base">
          <div className="flex justify-between">
            <span className="text-gray-500">Mode</span>
            <span className="text-white font-semibold capitalize">{room.gameMode ?? 'Quick'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Questions</span>
            <span className="text-white font-semibold">{room.totalQuestions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Time Limit</span>
            <span className="text-white font-semibold">{room.timeLimit}s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Max Players</span>
            <span className="text-white font-semibold">{room.maxPlayers}</span>
          </div>
          {room.category && (
            <div className="col-span-2 flex justify-between">
              <span className="text-gray-500">Category</span>
              <span className="text-white font-semibold capitalize">{room.category}</span>
            </div>
          )}
        </div>
      </div>

      {/* Player List */}
      <div className="bg-gray-900 border-4 border-gray-700 p-4 pixel-border">
        <h3 className="font-pixel text-xs text-gray-400 uppercase tracking-wider mb-3 pixel-text-shadow">
          Players ({playerCount}/{room.maxPlayers})
        </h3>
        <PlayerList players={room.players} currentPlayerId={playerId} />
        {playerCount < MIN_PLAYERS_TO_START && (
          <p className="font-pixel-body text-base text-yellow-400 mt-3 text-center">
            Need at least {MIN_PLAYERS_TO_START} players to start
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {isHost && (
          <button
            onClick={onStartGame}
            disabled={!canStart || isStarting}
            className={`
              w-full py-4 font-pixel text-lg pixel-border border-4 transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50
              ${
                canStart && !isStarting
                  ? 'bg-green-600 hover:bg-green-500 border-green-800 text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98] pixel-shadow pixel-glow-hover'
                  : 'bg-gray-700 border-gray-800 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isStarting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-pixel-bounce">⏳</span> STARTING...
              </span>
            ) : canStart ? (
              '🎮 START GAME'
            ) : (
              'WAITING FOR PLAYERS...'
            )}
          </button>
        )}

        {!isHost && (
          <div className="text-center py-4">
            <div className="text-2xl mb-2 animate-pixel-bounce">⏳</div>
            <p className="font-pixel-body text-lg text-gray-300">
              Waiting for host to start the game...
            </p>
          </div>
        )}

        <button
          onClick={onLeave}
          className="w-full py-2 font-pixel text-xs text-gray-400 hover:text-red-400 border-4 border-gray-700 hover:border-red-600 pixel-border transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          LEAVE ROOM
        </button>
      </div>
    </div>
  )
}
