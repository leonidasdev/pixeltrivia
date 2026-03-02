/**
 * Detailed Stats
 *
 * Computes detailed statistics from game history: breakdowns by mode,
 * category, trends, streaks, and aggregates.
 *
 * @module lib/storage/stats
 * @since 1.0.0
 */

import type { DetailedStats, ModeStats, CategoryStats } from './types'
import { getHistory } from './history'

/**
 * Get detailed statistics with breakdowns by mode, category, and trends
 */
export function getDetailedStats(): DetailedStats {
  const history = getHistory()

  if (history.length === 0) {
    return {
      totalGames: 0,
      totalScore: 0,
      averageScore: 0,
      averageAccuracy: 0,
      bestScore: 0,
      bestAccuracy: 0,
      bestStreak: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      totalTimePlayed: 0,
      favoriteMode: null,
      favoriteCategory: null,
      modeBreakdown: {},
      categoryBreakdown: {},
      recentTrend: 'new',
      gamesThisWeek: 0,
      currentWinStreak: 0,
    }
  }

  const totalGames = history.length
  const totalScore = history.reduce((sum, e) => sum + e.score, 0)
  const averageScore = Math.round(totalScore / totalGames)
  const averageAccuracy = Math.round(history.reduce((sum, e) => sum + e.accuracy, 0) / totalGames)
  const bestScore = Math.max(...history.map(e => e.score))
  const bestAccuracy = Math.max(...history.map(e => e.accuracy))
  const bestStreak = Math.max(...history.map(e => e.streak || 0))
  const totalCorrect = history.reduce((sum, e) => sum + e.correctAnswers, 0)
  const totalQuestions = history.reduce((sum, e) => sum + e.totalQuestions, 0)
  const totalTimePlayed = history.reduce((sum, e) => sum + e.duration, 0)

  // Mode breakdown
  const modeBreakdown: Record<string, ModeStats> = {}
  for (const entry of history) {
    if (!modeBreakdown[entry.mode]) {
      modeBreakdown[entry.mode] = {
        gamesPlayed: 0,
        totalScore: 0,
        averageScore: 0,
        averageAccuracy: 0,
        bestScore: 0,
      }
    }
    const ms = modeBreakdown[entry.mode]
    ms.gamesPlayed++
    ms.totalScore += entry.score
    ms.bestScore = Math.max(ms.bestScore, entry.score)
    ms.averageAccuracy =
      (ms.averageAccuracy * (ms.gamesPlayed - 1) + entry.accuracy) / ms.gamesPlayed
    ms.averageScore = Math.round(ms.totalScore / ms.gamesPlayed)
  }

  // Category breakdown
  const categoryBreakdown: Record<string, CategoryStats> = {}
  for (const entry of history) {
    if (!categoryBreakdown[entry.category]) {
      categoryBreakdown[entry.category] = {
        gamesPlayed: 0,
        totalScore: 0,
        averageAccuracy: 0,
        bestScore: 0,
      }
    }
    const cs = categoryBreakdown[entry.category]
    cs.gamesPlayed++
    cs.totalScore += entry.score
    cs.bestScore = Math.max(cs.bestScore, entry.score)
    cs.averageAccuracy =
      (cs.averageAccuracy * (cs.gamesPlayed - 1) + entry.accuracy) / cs.gamesPlayed
  }

  // Favorite mode & category
  const favoriteMode =
    Object.entries(modeBreakdown).sort((a, b) => b[1].gamesPlayed - a[1].gamesPlayed)[0]?.[0] ??
    null
  const favoriteCategory =
    Object.entries(categoryBreakdown).sort((a, b) => b[1].gamesPlayed - a[1].gamesPlayed)[0]?.[0] ??
    null

  // Recent trend (compare last 5 vs previous 5)
  let recentTrend: DetailedStats['recentTrend'] = 'new'
  if (history.length >= 10) {
    const recent5 = history.slice(0, 5)
    const prev5 = history.slice(5, 10)
    const recentAvg = recent5.reduce((s, e) => s + e.accuracy, 0) / 5
    const prevAvg = prev5.reduce((s, e) => s + e.accuracy, 0) / 5
    const diff = recentAvg - prevAvg
    if (diff > 5) recentTrend = 'improving'
    else if (diff < -5) recentTrend = 'declining'
    else recentTrend = 'stable'
  } else if (history.length >= 3) {
    recentTrend = 'stable'
  }

  // Games this week
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const gamesThisWeek = history.filter(e => new Date(e.playedAt).getTime() > oneWeekAgo).length

  // Current win streak (games with >= 70% accuracy in a row from most recent)
  let currentWinStreak = 0
  for (const entry of history) {
    if (entry.accuracy >= 70) {
      currentWinStreak++
    } else {
      break
    }
  }

  return {
    totalGames,
    totalScore,
    averageScore,
    averageAccuracy,
    bestScore,
    bestAccuracy,
    bestStreak,
    totalCorrect,
    totalQuestions,
    totalTimePlayed,
    favoriteMode,
    favoriteCategory,
    modeBreakdown,
    categoryBreakdown,
    recentTrend,
    gamesThisWeek,
    currentWinStreak,
  }
}
