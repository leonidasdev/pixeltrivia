/**
 * LobbyView Component
 *
 * Displays the waiting room before a multiplayer game starts.
 * Shows room code, player list, settings, and start button (host only).
 *
 * @module components/multiplayer/LobbyView
 * @since 1.1.0
 */

'use client'

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

  return (
    <div className="max-w-xl w-full mx-auto space-y-6">
      {/* Room Code Display */}
      <div className="text-center">
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Room Code</p>
        <div className="bg-gray-800 border-4 border-cyan-500 rounded-xl px-8 py-4 inline-block">
          <span className="text-4xl md:text-5xl font-mono font-bold text-cyan-300 tracking-[0.3em]">
            {formatRoomCode(room.code)}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-2">Share this code with friends to join</p>
      </div>

      {/* Game Settings */}
      <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
          Game Settings
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
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
      <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
          Players ({playerCount}/{room.maxPlayers})
        </h3>
        <PlayerList players={room.players} currentPlayerId={playerId} />
        {playerCount < MIN_PLAYERS_TO_START && (
          <p className="text-yellow-400 text-sm mt-3 text-center">
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
              w-full py-4 text-xl font-bold rounded-lg border-4 transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50
              ${
                canStart && !isStarting
                  ? 'bg-green-600 hover:bg-green-500 border-green-800 text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-gray-700 border-gray-800 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isStarting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> STARTING...
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
            <div className="text-2xl mb-2 animate-bounce">⏳</div>
            <p className="text-gray-300 font-semibold">Waiting for host to start the game...</p>
          </div>
        )}

        <button
          onClick={onLeave}
          className="w-full py-2 text-sm font-bold text-gray-400 hover:text-red-400 border-2 border-gray-700 hover:border-red-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          LEAVE ROOM
        </button>
      </div>
    </div>
  )
}
