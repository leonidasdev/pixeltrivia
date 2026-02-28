/**
 * Single-Player Play Page — /game/play
 *
 * Renders the solo trivia game. Reads a `currentGameSession` from
 * localStorage (created by the quick-game or select page), drives
 * state through `useGameState`, and presents questions with timer,
 * feedback animations, streak display, and a final results screen.
 *
 * @module game/play
 * @since 1.3.0
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useGameState } from '@/hooks/useGameState'
import { useTimer } from '@/hooks/useTimer'
import { useSound } from '@/hooks/useSound'
import { addHistoryEntry, getProfile } from '@/lib/storage'
import { getGrade } from '@/lib/scoring'
import type { Question, DifficultyLevel } from '@/types/game'
import {
  LoadingOverlay,
  ToastContainer,
  useToast,
  AnimatedBackground,
  PixelConfetti,
  ScorePopup,
  AnswerFeedback,
  PageTransition,
  ShareButton,
  PixelButton,
  type FeedbackType,
} from '@/app/components/ui'
import {
  DEFAULT_TIME_LIMIT,
  TIME_WARNING_THRESHOLD,
  TIME_CRITICAL_THRESHOLD,
} from '@/constants/game'

// ============================================================================
// Option styling (A / B / C / D)
// ============================================================================

const OPTION_COLORS = [
  { bg: 'bg-red-600', hover: 'hover:bg-red-500', border: 'border-red-800', label: 'A' },
  { bg: 'bg-blue-600', hover: 'hover:bg-blue-500', border: 'border-blue-800', label: 'B' },
  { bg: 'bg-yellow-600', hover: 'hover:bg-yellow-500', border: 'border-yellow-800', label: 'C' },
  { bg: 'bg-green-600', hover: 'hover:bg-green-500', border: 'border-green-800', label: 'D' },
]

// ============================================================================
// Component
// ============================================================================

export default function PlayPage() {
  const router = useRouter()
  const { messages: toasts, dismissToast, toast } = useToast()
  const { play: playSound } = useSound()

  // Game state hook
  const game = useGameState()

  // Visual / audio feedback
  const [showConfetti, setShowConfetti] = useState(false)
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null)
  const [showScorePopup, setShowScorePopup] = useState(false)
  const [popupScore, setPopupScore] = useState(0)
  const [showCorrectReveal, setShowCorrectReveal] = useState(false)
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [historySaved, setHistorySaved] = useState(false)

  // Current question
  const currentQuestion = game.getCurrentQuestion()
  const timeLimit = currentQuestion?.timeLimit ?? DEFAULT_TIME_LIMIT

  // Timer
  const timer = useTimer({
    duration: timeLimit,
    autoStart: false,
    onExpire: useCallback(() => {
      // Time ran out — submit null answer
      if (game.state === 'playing' && !showCorrectReveal) {
        const isCorrect = game.submitAnswer(null, timeLimit * 1000)
        setLastAnswerCorrect(isCorrect)
        setSelectedAnswer(null)
        setShowCorrectReveal(true)
        playSound('wrong')
        setFeedbackType('wrong')
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game.state, showCorrectReveal, timeLimit]),
    onWarning: useCallback(() => playSound('timerWarning'), [playSound]),
    onCritical: useCallback(() => playSound('timerCritical'), [playSound]),
  })

  // ── Bootstrap: read session from localStorage ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem('currentGameSession')
      if (!raw) {
        toast.error('No game session found. Start a new game first.')
        router.push('/')
        return
      }

      const session = JSON.parse(raw) as {
        questions: Question[]
        category: string
        difficulty: string
      }

      if (!session.questions?.length) {
        toast.error('Invalid session — no questions loaded.')
        router.push('/')
        return
      }

      game.startGame(
        session.questions,
        session.category,
        (session.difficulty ?? 'classic') as DifficultyLevel
      )
    } catch {
      toast.error('Failed to load game session.')
      router.push('/')
    }
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Start / reset timer each time the question changes
  useEffect(() => {
    if (game.state === 'playing' && currentQuestion) {
      setShowCorrectReveal(false)
      setLastAnswerCorrect(null)
      setSelectedAnswer(null)
      timer.reset(currentQuestion.timeLimit ?? DEFAULT_TIME_LIMIT)
      timer.start()
      playSound('questionReveal')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.currentQuestionIndex, game.state])

  // Save history once when game finishes
  useEffect(() => {
    if (game.state !== 'finished' || historySaved) return

    playSound('victory')
    setShowConfetti(true)

    const summary = game.getSummary()
    if (summary) {
      const profile = getProfile()
      addHistoryEntry({
        mode: 'quick',
        category: game.category,
        difficulty: game.difficulty,
        score: summary.finalScore,
        correctAnswers: summary.correctAnswers,
        totalQuestions: summary.totalQuestions,
        accuracy: Math.round(summary.accuracy),
        duration: Math.round(summary.totalTime / 1000),
        streak: game.streak,
        playerName: profile?.name ?? 'Player',
      })
    }
    setHistorySaved(true)

    // Cleanup session
    localStorage.removeItem('currentGameSession')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.state])

  // ── Handlers ──

  const handleAnswer = useCallback(
    (index: number) => {
      if (showCorrectReveal || game.state !== 'playing') return

      const elapsed = timer.stop()
      setSelectedAnswer(index)

      const isCorrect = game.submitAnswer(index, elapsed)
      setLastAnswerCorrect(isCorrect)
      setShowCorrectReveal(true)

      if (isCorrect) {
        playSound('correct')
        setFeedbackType('correct')
        const points = 100 + game.streak * 10 // rough visual hint
        setPopupScore(points)
        setShowScorePopup(true)
      } else {
        playSound('wrong')
        setFeedbackType('wrong')
      }
    },
    [showCorrectReveal, game, timer, playSound]
  )

  const handleNext = useCallback(() => {
    playSound('navigate')
    game.nextQuestion()
  }, [game, playSound])

  // Keyboard shortcuts: 1-4 / A-D to answer, Enter / Space to advance
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (game.state !== 'playing') return

      // During reveal, Enter / Space advances
      if (showCorrectReveal) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleNext()
        }
        return
      }

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
      const idx = keyMap[e.key.toLowerCase()]
      if (idx !== undefined && currentQuestion && idx < currentQuestion.options.length) {
        e.preventDefault()
        handleAnswer(idx)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [game.state, showCorrectReveal, handleNext, handleAnswer, currentQuestion])

  // ── Helper renderers ──

  const getTimerColor = () => {
    if (timer.timeRemaining <= TIME_CRITICAL_THRESHOLD) return 'text-red-400'
    if (timer.timeRemaining <= TIME_WARNING_THRESHOLD) return 'text-yellow-400'
    return 'text-cyan-400'
  }

  const getTimerAnimation = () => {
    if (timer.timeRemaining <= TIME_CRITICAL_THRESHOLD) return 'animate-pulse-urgent'
    if (timer.timeRemaining <= TIME_WARNING_THRESHOLD) return 'animate-pixel-shake'
    return ''
  }

  const getOptionStyle = (index: number) => {
    const c = OPTION_COLORS[index] ?? OPTION_COLORS[0]

    if (showCorrectReveal && currentQuestion) {
      if (index === currentQuestion.correctAnswer) {
        return 'bg-green-500 border-green-300 ring-4 ring-green-300 ring-opacity-50 scale-[1.02] animate-pixel-bounce'
      }
      if (index === selectedAnswer && !lastAnswerCorrect) {
        return 'bg-red-500 border-red-300 opacity-80 animate-pixel-shake'
      }
      return 'bg-gray-700 border-gray-600 opacity-50'
    }

    return `${c.bg} ${c.hover} ${c.border} cursor-pointer hover:scale-[1.02] active:scale-[0.98] pixel-glow-hover`
  }

  // ── Derived values for results screen ──
  const summary = game.state === 'finished' ? game.getSummary() : null
  const grade = summary ? getGrade(summary.accuracy) : ''

  // ── Render ──

  // Not yet initialised
  if (game.state === 'idle' || game.state === 'loading') {
    return <LoadingOverlay label="Loading game..." />
  }

  // Finished
  if (game.state === 'finished' && summary) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBackground />
        <PixelConfetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

        <PageTransition style="scale" className="z-10 w-full max-w-lg">
          {/* Results card */}
          <div className="bg-gray-900 bg-opacity-95 border-4 border-gray-600 pixel-border pixel-shadow p-6 space-y-5">
            {/* Header */}
            <h1 className="text-2xl md:text-3xl font-pixel text-yellow-400 text-center pixel-text-shadow">
              Game Over!
            </h1>

            {/* Grade */}
            <div className="text-center">
              <span className="text-5xl">
                {grade === 'S'
                  ? '🏆'
                  : grade === 'A'
                    ? '🌟'
                    : grade === 'B'
                      ? '🎯'
                      : grade === 'C'
                        ? '💪'
                        : '📚'}
              </span>
              <p className="font-pixel text-lg text-cyan-400 mt-1">Grade: {grade}</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <Stat label="Score" value={summary.finalScore.toLocaleString()} />
              <Stat label="Accuracy" value={`${Math.round(summary.accuracy)}%`} />
              <Stat label="Correct" value={`${summary.correctAnswers}/${summary.totalQuestions}`} />
              <Stat label="Avg Time" value={`${(summary.averageTime / 1000).toFixed(1)}s`} />
            </div>

            {/* Category / difficulty */}
            <p className="font-pixel-body text-xs text-gray-400 text-center">
              {game.category} • {game.difficulty}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <PixelButton variant="primary" onClick={() => router.push('/game/quick')}>
                🔄 PLAY AGAIN
              </PixelButton>
              <PixelButton variant="secondary" onClick={() => router.push('/game/stats')}>
                📊 VIEW STATS
              </PixelButton>
              <PixelButton variant="secondary" onClick={() => router.push('/')}>
                🏠 HOME
              </PixelButton>
            </div>

            {/* Share */}
            <div className="flex justify-center">
              <ShareButton
                result={{
                  mode: 'quick',
                  score: summary.finalScore,
                  correctAnswers: summary.correctAnswers,
                  totalQuestions: summary.totalQuestions,
                  accuracy: Math.round(summary.accuracy),
                  category: game.category,
                }}
              />
            </div>
          </div>
        </PageTransition>

        <ToastContainer messages={toasts} onDismiss={dismissToast} />
      </main>
    )
  }

  // ── Playing ──
  if (!currentQuestion) {
    return <LoadingOverlay label="Loading question..." />
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      {/* Feedback overlays */}
      <AnswerFeedback
        type={feedbackType}
        duration={1200}
        onComplete={() => setFeedbackType(null)}
      />
      {showScorePopup && (
        <ScorePopup
          score={popupScore}
          show={showScorePopup}
          onComplete={() => setShowScorePopup(false)}
          className="top-1/3 left-1/2 -translate-x-1/2"
        />
      )}

      <PageTransition style="slide-up" className="z-10 w-full" key={game.currentQuestionIndex}>
        <div className="w-full max-w-2xl mx-auto space-y-6">
          {/* Header: progress + timer + score */}
          <div className="flex items-center justify-between">
            <span className="font-pixel-body text-lg text-gray-400 font-semibold">
              Question {game.currentQuestionIndex + 1} of {game.questions.length}
            </span>

            <div
              className={`flex items-center gap-2 font-pixel font-bold text-2xl ${getTimerColor()} ${getTimerAnimation()}`}
            >
              <span>⏱</span>
              <span>{timer.timeRemaining}s</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-700 h-2 pixel-border" style={{ borderWidth: '2px' }}>
            <div
              className="bg-cyan-400 h-full transition-all duration-300"
              style={{
                width: `${((game.currentQuestionIndex + 1) / game.questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Score + streak ribbon */}
          <div className="flex items-center justify-between text-sm font-pixel">
            <span className="text-yellow-400">⭐ {game.score.toLocaleString()} pts</span>
            {game.streak > 1 && (
              <span className="text-orange-400 animate-pulse">🔥 {game.streak} streak!</span>
            )}
          </div>

          {/* Category & difficulty badges */}
          <div className="flex gap-2">
            <span
              className="px-3 py-1 font-pixel text-xs font-semibold bg-purple-600/50 text-purple-200 pixel-border"
              style={{ borderWidth: '2px' }}
            >
              {currentQuestion.category}
            </span>
            <span
              className={`px-3 py-1 font-pixel text-xs font-semibold pixel-border ${
                currentQuestion.difficulty === 'hard'
                  ? 'bg-red-600/50 text-red-200'
                  : currentQuestion.difficulty === 'medium'
                    ? 'bg-yellow-600/50 text-yellow-200'
                    : 'bg-green-600/50 text-green-200'
              }`}
              style={{ borderWidth: '2px' }}
            >
              {currentQuestion.difficulty}
            </span>
          </div>

          {/* Question card */}
          {currentQuestion.imageUrl && (
            <div className="bg-gray-800 border-4 border-gray-600 pixel-border overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentQuestion.imageUrl}
                alt="Question illustration"
                className="max-h-48 md:max-h-64 object-contain"
              />
            </div>
          )}

          <div className="bg-gray-800 border-4 border-gray-600 p-6 pixel-border pixel-shadow">
            <h2 className="text-xl md:text-2xl font-pixel text-white text-center leading-relaxed pixel-text-shadow">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentQuestion.options.map((option, index) => {
              const color = OPTION_COLORS[index] ?? OPTION_COLORS[0]
              return (
                <button
                  key={index}
                  onClick={() => !showCorrectReveal && handleAnswer(index)}
                  disabled={showCorrectReveal}
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

          {/* Keyboard hint */}
          {!showCorrectReveal && (
            <p className="text-center font-pixel text-[10px] text-gray-600 hidden md:block">
              Press 1-4 or A-D to answer
            </p>
          )}

          {/* Reveal phase: feedback + NEXT button */}
          {showCorrectReveal && (
            <div className="space-y-4">
              <div
                className={`text-center py-4 pixel-border border-4 ${
                  lastAnswerCorrect
                    ? 'bg-green-900/30 border-green-500 text-green-300'
                    : selectedAnswer === null
                      ? 'bg-gray-900/30 border-gray-500 text-gray-300'
                      : 'bg-red-900/30 border-red-500 text-red-300'
                }`}
              >
                <div className="text-3xl mb-1">
                  {lastAnswerCorrect ? '🎉' : selectedAnswer === null ? '⏰' : '❌'}
                </div>
                <div className="font-pixel text-lg pixel-text-shadow">
                  {lastAnswerCorrect
                    ? 'Correct!'
                    : selectedAnswer === null
                      ? "Time's up!"
                      : 'Wrong answer!'}
                </div>
              </div>

              <div className="flex justify-center">
                <PixelButton variant="primary" onClick={handleNext}>
                  {game.currentQuestionIndex + 1 < game.questions.length
                    ? 'NEXT QUESTION →'
                    : 'SEE RESULTS →'}
                </PixelButton>
              </div>

              <p className="text-center font-pixel text-[10px] text-gray-600 hidden md:block">
                Press Enter or Space to continue
              </p>
            </div>
          )}
        </div>
      </PageTransition>

      <ToastContainer messages={toasts} onDismiss={dismissToast} />
    </main>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800 border-2 border-gray-700 pixel-border p-3">
      <p className="font-pixel text-[10px] text-gray-500 uppercase">{label}</p>
      <p className="font-pixel text-lg text-white">{value}</p>
    </div>
  )
}
