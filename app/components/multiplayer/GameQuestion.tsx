/**
 * GameQuestion Component
 *
 * Displays a question with answer options for multiplayer games.
 * Shows timer, answer feedback, and reveals correct answer.
 * Styled with pixel-art aesthetic for retro game feel.
 *
 * @module app/components/multiplayer/GameQuestion
 * @since 1.1.0
 */

'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { MultiplayerQuestion } from '@/types/room'
import {
  OPTION_COLORS,
  getTimerColor,
  getTimerAnimation,
  getOptionStyle,
} from '@/app/components/game'

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

  const timerColor = getTimerColor(timeRemaining)
  const timerAnim = getTimerAnimation(timeRemaining)

  const computeOptionStyle = (index: number) =>
    getOptionStyle({
      index,
      isRevealing,
      correctAnswer,
      selectedAnswer,
      wasCorrect,
      hasAnswered,
      isLoading,
    })

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header: question number + timer */}
      <div className="flex items-center justify-between">
        <div className="font-pixel-body text-lg text-gray-400 font-semibold">
          Question {questionNumber} of {totalQuestions}
        </div>

        <div
          className={`flex items-center gap-2 font-pixel font-bold text-2xl ${timerColor} ${timerAnim}`}
        >
          <span>T</span>
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
        <div
          className="relative bg-gray-800 border-4 border-gray-600 pixel-border overflow-hidden"
          style={{ minHeight: '12rem' }}
        >
          <Image
            src={question.imageUrl}
            alt="Question illustration"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
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
                ${computeOptionStyle(index)}
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
        <p className="text-center font-pixel text-xs text-gray-600 hidden md:block">
          Press 1-4 or A-D to answer
        </p>
      )}

      {/* Answer feedback */}
      {hasAnswered && !isRevealing && (
        <div className="text-center py-3">
          <div className="text-lg font-pixel-body text-gray-300 animate-pulse">
            OK Answer submitted — waiting for other players...
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
          <div className="text-3xl mb-1">{wasCorrect ? '+' : 'X'}</div>
          <div className="font-pixel text-lg pixel-text-shadow">
            {wasCorrect ? 'Correct!' : 'Wrong answer!'}
          </div>
        </div>
      )}
    </div>
  )
}
