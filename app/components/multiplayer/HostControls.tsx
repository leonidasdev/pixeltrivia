/**
 * HostControls Component
 *
 * Controls visible only to the game host during gameplay.
 * Allows advancing to the next question, pausing, etc.
 * Styled with pixel-art aesthetic for retro game feel.
 *
 * @module components/multiplayer/HostControls
 * @since 1.1.0
 */

'use client'

interface HostControlsProps {
  /** Whether it's ok to advance (e.g., timer expired or all answered) */
  canAdvance: boolean
  /** Loading state */
  isLoading: boolean
  /** Callback to advance to next question */
  onNextQuestion: () => void
  /** Number of players who have answered */
  answeredCount: number
  /** Total number of players */
  totalPlayers: number
}

export function HostControls({
  canAdvance,
  isLoading,
  onNextQuestion,
  answeredCount,
  totalPlayers,
}: HostControlsProps) {
  return (
    <div className="bg-yellow-900/20 border-4 border-yellow-600 p-4 pixel-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-pixel text-[10px] text-yellow-400 uppercase tracking-wider pixel-text-shadow">
            Host Controls
          </p>
          <p className="font-pixel-body text-base text-gray-300 mt-1">
            {answeredCount}/{totalPlayers} players answered
          </p>
        </div>

        <button
          onClick={onNextQuestion}
          disabled={!canAdvance || isLoading}
          className={`
            px-6 py-2 font-pixel text-xs pixel-border border-4 transition-all
            focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:ring-opacity-50
            ${
              canAdvance && !isLoading
                ? 'bg-yellow-600 hover:bg-yellow-500 border-yellow-800 text-white cursor-pointer pixel-glow-hover'
                : 'bg-gray-700 border-gray-800 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? '⏳' : 'NEXT →'}
        </button>
      </div>

      {/* Progress bar of answered players */}
      <div className="w-full bg-gray-700 h-2 mt-3 pixel-border" style={{ borderWidth: '2px' }}>
        <div
          className="bg-yellow-400 h-full transition-all duration-500"
          style={{ width: `${totalPlayers > 0 ? (answeredCount / totalPlayers) * 100 : 0}%` }}
        />
      </div>
    </div>
  )
}
