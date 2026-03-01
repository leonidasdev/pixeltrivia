/**
 * Scoreboard Component
 *
 * Displays the final scores and rankings for a multiplayer game.
 * Shows podium positions, scores, and answer statistics.
 * Styled with pixel-art aesthetic for retro game feel.
 *
 * @module app/components/multiplayer/Scoreboard
 * @since 1.1.0
 */

'use client'

import type { MultiplayerPlayer } from '@/types/room'
import { AVATAR_OPTIONS } from '@/constants/avatars'
import { ShareButton } from '@/app/components/ui/ShareButton'

interface ScoreboardProps {
  /** Players sorted by score */
  players: MultiplayerPlayer[]
  /** Current user's player ID */
  currentPlayerId: number | null
  /** Whether the game is finished (shows final vs intermediate) */
  isFinal: boolean
  /** Callback for returning to lobby or home */
  onFinish?: () => void
  /** Whether current player is host */
  isHost?: boolean
  /** Total questions in the game (for share) */
  totalQuestions?: number
  /** Category played (for share) */
  category?: string
}

const PODIUM_STYLES = [
  { border: 'border-yellow-400', badge: '🥇', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { border: 'border-gray-300', badge: '🥈', color: 'text-gray-300', bg: 'bg-gray-400/10' },
  { border: 'border-amber-600', badge: '🥉', color: 'text-amber-500', bg: 'bg-amber-500/10' },
]

export function Scoreboard({
  players,
  currentPlayerId,
  isFinal,
  onFinish,
  isHost: _isHost,
  totalQuestions = 0,
  category = 'Mixed',
}: ScoreboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  const getAvatarEmoji = (avatarId: string) => {
    return AVATAR_OPTIONS.find(a => a.id === avatarId)?.emoji ?? '👤'
  }

  const getAvatarColor = (avatarId: string) => {
    return AVATAR_OPTIONS.find(a => a.id === avatarId)?.color ?? 'bg-gray-600'
  }

  return (
    <div className="max-w-xl w-full mx-auto space-y-6">
      {/* Title */}
      <div className="text-center">
        <div className="text-5xl mb-3">{isFinal ? '🏆' : '📊'}</div>
        <h2 className="font-pixel text-2xl text-white pixel-text-shadow">
          {isFinal ? 'FINAL SCORES' : 'SCOREBOARD'}
        </h2>
      </div>

      {/* Rankings */}
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => {
          const podium = PODIUM_STYLES[index]
          const isCurrentPlayer = player.id === currentPlayerId

          return (
            <div
              key={player.id}
              className={`
                flex items-center gap-4 p-4 pixel-border border-4 transition-all
                ${podium ? `${podium.bg} ${podium.border}` : 'bg-gray-800/50 border-gray-700'}
                ${isCurrentPlayer ? 'ring-2 ring-cyan-400 ring-opacity-50' : ''}
              `}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-10 text-center">
                {podium ? (
                  <span className="text-2xl">{podium.badge}</span>
                ) : (
                  <span className="font-pixel text-sm text-gray-500">#{index + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div
                className={`w-10 h-10 ${getAvatarColor(player.avatar)} pixel-border flex items-center justify-center text-xl border-2 border-gray-600`}
              >
                {getAvatarEmoji(player.avatar)}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <span
                  className={`font-pixel-body font-bold text-white ${podium ? 'text-xl' : 'text-lg'} truncate block`}
                >
                  {player.name}
                  {isCurrentPlayer && (
                    <span className="ml-2 font-pixel text-[8px] text-cyan-400 font-normal">
                      (you)
                    </span>
                  )}
                </span>
              </div>

              {/* Score */}
              <div className="text-right">
                <span
                  className={`font-pixel font-bold ${podium ? `text-lg ${podium.color}` : 'text-base text-gray-300'}`}
                >
                  {player.score}
                </span>
                <span className="font-pixel-body text-sm text-gray-500 block">points</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action buttons */}
      {isFinal && onFinish && (
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={onFinish}
            className="w-full py-4 font-pixel text-sm bg-cyan-600 hover:bg-cyan-500 border-4 border-cyan-800 text-white pixel-border pixel-shadow transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-opacity-50 pixel-glow-hover"
          >
            🏠 BACK TO HOME
          </button>
        </div>
      )}
    </div>
  )
}
