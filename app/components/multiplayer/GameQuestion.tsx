/**
 * GameQuestion Component
 *
 * Displays a question with answer options for multiplayer games.
 * Shows timer, answer feedback, and reveals correct answer.
 * Styled with pixel-art aesthetic for retro game feel.
 *
 * @module components/multiplayer/GameQuestion
 * @since 1.1.0
 */

'use client'

import { useEffect, useCallback } from 'react'
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

  /** Keyboard navigation: press 1-4 or A-D to select an answer */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (hasAnswered || isRevealing || isLoading) return

      const keyMap: Record<string, number> = {
        '1': 0,
        '2': 1,
        '3': 2,
        '4': 3,
        a: 0,
        b: 1,
        c: 2,
        d: 3,
      }

      const index = keyMap[e.key.toLowerCase()]
      if (index !== undefined && index < (question.options?.length ?? 4)) {
        e.preventDefault()
        onAnswer(index)
      }
    },
    [hasAnswered, isRevealing, isLoading, onAnswer, question.options?.length]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const getTimerColor = () => {
    if (timeRemaining <= TIME_CRITICAL_THRESHOLD) return 'text-red-400'
    if (timeRemaining <= TIME_WARNING_THRESHOLD) return 'text-yellow-400'
    return 'text-cyan-400'
  }

  const getTimerAnimation = () => {
    if (timeRemaining <= TIME_CRITICAL_THRESHOLD) return 'animate-pulse-urgent'
    if (timeRemaining <= TIME_WARNING_THRESHOLD) return 'animate-pixel-shake'
    return ''
  }

  const getOptionStyle = (index: number) => {
    const color = OPTION_COLORS[index] ?? OPTION_COLORS[0]

    if (isRevealing) {
      if (index === correctAnswer) {
        return 'bg-green-500 border-green-300 ring-4 ring-green-300 ring-opacity-50 scale-[1.02] animate-pixel-bounce'
      }
      if (index === selectedAnswer && !wasCorrect) {
        return 'bg-red-500 border-red-300 opacity-80 animate-pixel-shake'
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

    return `${color.bg} ${color.hover} ${color.border} cursor-pointer hover:scale-[1.02] active:scale-[0.98] pixel-glow-hover`
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header: question number + timer */}
      <div className="flex items-center justify-between">
        <div className="font-pixel-body text-lg text-gray-400 font-semibold">
          Question {questionNumber} of {totalQuestions}
        </div>

        <div
          className={`flex items-center gap-2 font-pixel font-bold text-2xl ${getTimerColor()} ${getTimerAnimation()}`}
        >
          <span>⏱</span>
          <span>{timeRemaining}s</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-700 h-2 pixel-border" style={{ borderWidth: '2px' }}>
        <div
          className="bg-cyan-400 h-full transition-all duration-300"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Category & difficulty badges */}
      <div className="flex gap-2">
        {question.category && (
          <span
            className="px-3 py-1 font-pixel text-xs font-semibold bg-purple-600/50 text-purple-200 pixel-border"
            style={{ borderWidth: '2px' }}
          >
            {question.category}
          </span>
        )}
        {question.difficulty && (
          <span
            className={`px-3 py-1 font-pixel text-xs font-semibold pixel-border ${
              question.difficulty === 'hard'
                ? 'bg-red-600/50 text-red-200'
                : question.difficulty === 'medium'
                  ? 'bg-yellow-600/50 text-yellow-200'
                  : 'bg-green-600/50 text-green-200'
            }`}
            style={{ borderWidth: '2px' }}
          >
            {question.difficulty}
          </span>
        )}
      </div>

      {/* Question image (if provided) */}
      {question.imageUrl && (
        <div className="bg-gray-800 border-4 border-gray-600 pixel-border overflow-hidden flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.imageUrl}
            alt="Question illustration"
            className="max-h-48 md:max-h-64 object-contain"
          />
        </div>
      )}

      {/* Question text */}
      <div className="bg-gray-800 border-4 border-gray-600 p-6 pixel-border pixel-shadow">
        <h2 className="text-xl md:text-2xl font-pixel text-white text-center leading-relaxed pixel-text-shadow">
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
                p-4 pixel-border border-4 text-left font-pixel-body text-lg text-white
                transition-all duration-200 flex items-center gap-3
                focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-30
                ${getOptionStyle(index)}
              `}
            >
              <span
                className="w-8 h-8 pixel-border bg-black/30 flex items-center justify-center font-pixel text-xs flex-shrink-0"
                style={{ borderWidth: '2px' }}
              >
                {color.label}
              </span>
              <span className="text-sm md:text-base">{option}</span>
            </button>
          )
        })}
      </div>

      {/* Keyboard shortcut hint */}
      {!hasAnswered && !isRevealing && !isLoading && (
        <p className="text-center font-pixel text-[10px] text-gray-600 hidden md:block">
          Press 1-4 or A-D to answer
        </p>
      )}

      {/* Answer feedback */}
      {hasAnswered && !isRevealing && (
        <div className="text-center py-3">
          <div className="text-lg font-pixel-body text-gray-300 animate-pulse">
            ✓ Answer submitted — waiting for other players...
          </div>
        </div>
      )}

      {isRevealing && wasCorrect !== null && (
        <div
          className={`text-center py-4 pixel-border border-4 ${
            wasCorrect
              ? 'bg-green-900/30 border-green-500 text-green-300'
              : 'bg-red-900/30 border-red-500 text-red-300'
          }`}
        >
          <div className="text-3xl mb-1">{wasCorrect ? '🎉' : '❌'}</div>
          <div className="font-pixel text-lg pixel-text-shadow">
            {wasCorrect ? 'Correct!' : 'Wrong answer!'}
          </div>
        </div>
      )}
    </div>
  )
}
