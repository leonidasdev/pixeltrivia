/**
 * PlayerList Component
 *
 * Displays a list of players in a multiplayer room
 * with their avatars, scores, and status indicators.
 *
 * @module components/multiplayer/PlayerList
 * @since 1.1.0
 */

'use client'

import type { MultiplayerPlayer } from '@/types/room'
import { AVATAR_OPTIONS } from '@/constants/avatars'

interface PlayerListProps {
  /** List of players */
  players: MultiplayerPlayer[]
  /** Current user's player ID (to highlight) */
  currentPlayerId?: number | null
  /** Show scores column */
  showScores?: boolean
  /** Show answer status indicators */
  showAnswerStatus?: boolean
  /** Compact mode for sidebar display */
  compact?: boolean
}

export function PlayerList({
  players,
  currentPlayerId,
  showScores = false,
  showAnswerStatus = false,
  compact = false,
}: PlayerListProps) {
  const getAvatarEmoji = (avatarId: string) => {
    const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId)
    return avatar?.emoji ?? '👤'
  }

  const getAvatarColor = (avatarId: string) => {
    const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId)
    return avatar?.color ?? 'bg-gray-600'
  }

  return (
    <div className="space-y-2">
      {players.map(player => (
        <div
          key={player.id}
          className={`
            flex items-center gap-3 p-2 rounded-lg border-2 transition-colors
            ${player.id === currentPlayerId ? 'border-cyan-400 bg-cyan-900/20' : 'border-gray-700 bg-gray-800/50'}
            ${compact ? 'p-1.5' : 'p-3'}
          `}
        >
          {/* Avatar */}
          <div
            className={`
              ${getAvatarColor(player.avatar)} rounded-lg flex items-center justify-center border-2 border-gray-600
              ${compact ? 'w-8 h-8 text-lg' : 'w-10 h-10 text-xl'}
            `}
          >
            {getAvatarEmoji(player.avatar)}
          </div>

          {/* Name & host badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`font-bold text-white truncate ${compact ? 'text-sm' : 'text-base'}`}
              >
                {player.name}
              </span>
              {player.isHost && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-yellow-500 text-black rounded">
                  HOST
                </span>
              )}
              {player.id === currentPlayerId && !player.isHost && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-cyan-500 text-black rounded">
                  YOU
                </span>
              )}
            </div>
          </div>

          {/* Score */}
          {showScores && (
            <div className="text-right">
              <span className={`font-bold text-yellow-400 ${compact ? 'text-sm' : 'text-lg'}`}>
                {player.score}
              </span>
            </div>
          )}

          {/* Answer status */}
          {showAnswerStatus && (
            <div className="flex-shrink-0">
              {player.hasAnswered ? (
                <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs">
                  ✓
                </span>
              ) : (
                <span className="w-6 h-6 rounded-full bg-gray-600 animate-pulse flex items-center justify-center text-xs text-gray-400">
                  •
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
