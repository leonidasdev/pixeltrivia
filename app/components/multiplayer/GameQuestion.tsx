/**
 * GameQuestion Component
 *
 * Displays a question with answer options for multiplayer games.
 * Shows timer, answer feedback, and reveals correct answer.
 *
 * @module components/multiplayer/GameQuestion
 * @since 1.1.0
 */

'use client'

import type { MultiplayerQuestion } from '@/types/room'
import { TIME_WARNING_THRESHOLD, TIME_CRITICAL_THRESHOLD } from '@/constants/game'

interface GameQuestionProps {
  /** The question data */
  question: MultiplayerQuestion
  /** Question number (1-based) */
  questionNumber: number
  /** Total questions in the game */
  totalQuestions: number
  /** Seconds remaining */
  timeRemaining: number
  /** Whether the player has answered */
  hasAnswered: boolean
  /** The player's selected answer */
  selectedAnswer: number | null
  /** Whether the answer was correct (null if not yet revealed) */
  wasCorrect: boolean | null
  /** The correct answer index (shown during reveal phase) */
  correctAnswer: number | null
  /** Whether the component is in a loading state */
  isLoading: boolean
  /** Callback when player selects an answer */
  onAnswer: (answerIndex: number) => void
}

const OPTION_COLORS = [
  { bg: 'bg-red-600', hover: 'hover:bg-red-500', border: 'border-red-800', label: 'A' },
  { bg: 'bg-blue-600', hover: 'hover:bg-blue-500', border: 'border-blue-800', label: 'B' },
  { bg: 'bg-yellow-600', hover: 'hover:bg-yellow-500', border: 'border-yellow-800', label: 'C' },
  { bg: 'bg-green-600', hover: 'hover:bg-green-500', border: 'border-green-800', label: 'D' },
]

export function GameQuestion({
  question,
  questionNumber,
  totalQuestions,
  timeRemaining,
  hasAnswered,
  selectedAnswer,
  wasCorrect,
  correctAnswer,
  isLoading,
  onAnswer,
}: GameQuestionProps) {
  const isRevealing = correctAnswer !== null

  const getTimerColor = () => {
    if (timeRemaining <= TIME_CRITICAL_THRESHOLD) return 'text-red-400'
    if (timeRemaining <= TIME_WARNING_THRESHOLD) return 'text-yellow-400'
    return 'text-white'
  }

  const getOptionStyle = (index: number) => {
    const color = OPTION_COLORS[index] ?? OPTION_COLORS[0]

    if (isRevealing) {
      if (index === correctAnswer) {
        return 'bg-green-500 border-green-300 ring-4 ring-green-300 ring-opacity-50 scale-[1.02]'
      }
      if (index === selectedAnswer && !wasCorrect) {
        return 'bg-red-500 border-red-300 opacity-80'
      }
      return 'bg-gray-700 border-gray-600 opacity-50'
    }

    if (hasAnswered) {
      if (index === selectedAnswer) {
        return `${color.bg} ${color.border} ring-2 ring-cyan-300`
      }
      return 'bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed'
    }

    if (isLoading) {
      return `${color.bg} ${color.border} opacity-50 cursor-wait`
    }

    return `${color.bg} ${color.hover} ${color.border} cursor-pointer hover:scale-[1.02] active:scale-[0.98]`
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header: question number + timer */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400 font-semibold">
          Question {questionNumber} of {totalQuestions}
        </div>

        <div className={`flex items-center gap-2 font-mono font-bold text-2xl ${getTimerColor()}`}>
          <span className={timeRemaining <= TIME_CRITICAL_THRESHOLD ? 'animate-pulse' : ''}>⏱</span>
          <span>{timeRemaining}s</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div
          className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Category & difficulty badges */}
      <div className="flex gap-2">
        {question.category && (
          <span className="px-2 py-1 text-xs font-semibold bg-purple-600/50 text-purple-200 rounded">
            {question.category}
          </span>
        )}
        {question.difficulty && (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded ${
              question.difficulty === 'hard'
                ? 'bg-red-600/50 text-red-200'
                : question.difficulty === 'medium'
                  ? 'bg-yellow-600/50 text-yellow-200'
                  : 'bg-green-600/50 text-green-200'
            }`}
          >
            {question.difficulty}
          </span>
        )}
      </div>

      {/* Question text */}
      <div className="bg-gray-800 border-4 border-gray-600 rounded-xl p-6">
        <h2 className="text-xl md:text-2xl font-bold text-white text-center leading-relaxed">
          {question.questionText}
        </h2>
      </div>

      {/* Answer options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options.map((option, index) => {
          const color = OPTION_COLORS[index] ?? OPTION_COLORS[0]
          return (
            <button
              key={index}
              onClick={() => !hasAnswered && !isRevealing && !isLoading && onAnswer(index)}
              disabled={hasAnswered || isRevealing || isLoading}
              className={`
                p-4 rounded-lg border-4 text-left font-bold text-white
                transition-all duration-200 flex items-center gap-3
                focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-30
                ${getOptionStyle(index)}
              `}
            >
              <span className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center text-sm font-mono flex-shrink-0">
                {color.label}
              </span>
              <span className="text-sm md:text-base">{option}</span>
            </button>
          )
        })}
      </div>

      {/* Answer feedback */}
      {hasAnswered && !isRevealing && (
        <div className="text-center py-3">
          <div className="text-lg text-gray-300 animate-pulse">
            ✓ Answer submitted — waiting for other players...
          </div>
        </div>
      )}

      {isRevealing && wasCorrect !== null && (
        <div
          className={`text-center py-4 rounded-lg border-2 ${
            wasCorrect
              ? 'bg-green-900/30 border-green-500 text-green-300'
              : 'bg-red-900/30 border-red-500 text-red-300'
          }`}
        >
          <div className="text-3xl mb-1">{wasCorrect ? '🎉' : '❌'}</div>
          <div className="text-lg font-bold">{wasCorrect ? 'Correct!' : 'Wrong answer!'}</div>
        </div>
      )}
    </div>
  )
}
