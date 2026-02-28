/**
 * Achievements System
 *
 * Local achievement tracking based on game history milestones.
 * Achievements are computed from history data — no separate storage needed.
 *
 * @module lib/achievements
 * @since 1.3.0
 */

import { getHistory, getDetailedStats, type GameHistoryEntry, type DetailedStats } from './storage'
import { STORAGE_KEYS } from '@/constants/game'

// ============================================================================
// Types
// ============================================================================

/**
 * Achievement rarity tiers
 */
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

/**
 * Achievement definition
 */
export interface Achievement {
  /** Unique achievement identifier */
  id: string
  /** Display name */
  name: string
  /** Description of how to unlock */
  description: string
  /** Emoji icon */
  icon: string
  /** Rarity tier */
  tier: AchievementTier
  /** Whether the achievement is unlocked */
  unlocked: boolean
  /** Progress towards completion (0-1) */
  progress: number
  /** Date unlocked (ISO string, null if locked) */
  unlockedAt: string | null
  /** Category grouping */
  category: 'gameplay' | 'mastery' | 'dedication' | 'special'
}

/**
 * Achievement check function signature
 */
type AchievementChecker = (
  history: GameHistoryEntry[],
  stats: DetailedStats
) => { unlocked: boolean; progress: number }

/**
 * Achievement definition used internally
 */
interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  tier: AchievementTier
  category: Achievement['category']
  check: AchievementChecker
}

// ============================================================================
// Storage Key
// ============================================================================

const ACHIEVEMENTS_KEY = `${STORAGE_KEYS.ROOT}_achievements`

/**
 * Stored achievement unlock timestamps
 */
type AchievementTimestamps = Record<string, string>

function getTimestamps(): AchievementTimestamps {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(ACHIEVEMENTS_KEY) : null
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveTimestamps(ts: AchievementTimestamps): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(ts))
    }
  } catch {
    // silent fail
  }
}

// ============================================================================
// Achievement Definitions
// ============================================================================

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // ─── Gameplay ──────────────────────────────────────────────
  {
    id: 'first_game',
    name: 'First Steps',
    description: 'Complete your first game',
    icon: '🎮',
    tier: 'bronze',
    category: 'gameplay',
    check: h => ({ unlocked: h.length >= 1, progress: Math.min(h.length, 1) }),
  },
  {
    id: 'ten_games',
    name: 'Getting Started',
    description: 'Complete 10 games',
    icon: '🏃',
    tier: 'bronze',
    category: 'gameplay',
    check: h => ({ unlocked: h.length >= 10, progress: Math.min(h.length / 10, 1) }),
  },
  {
    id: 'fifty_games',
    name: 'Dedicated Player',
    description: 'Complete 50 games',
    icon: '🎯',
    tier: 'silver',
    category: 'gameplay',
    check: h => ({ unlocked: h.length >= 50, progress: Math.min(h.length / 50, 1) }),
  },
  {
    id: 'hundred_games',
    name: 'Trivia Veteran',
    description: 'Complete 100 games',
    icon: '🏆',
    tier: 'gold',
    category: 'gameplay',
    check: h => ({ unlocked: h.length >= 100, progress: Math.min(h.length / 100, 1) }),
  },

  // ─── Mastery ──────────────────────────────────────────────
  {
    id: 'perfect_score',
    name: 'Perfect Round',
    description: 'Get 100% accuracy in a game',
    icon: '💯',
    tier: 'gold',
    category: 'mastery',
    check: h => {
      const best = Math.max(0, ...h.map(e => e.accuracy))
      return { unlocked: best >= 100, progress: Math.min(best / 100, 1) }
    },
  },
  {
    id: 'high_scorer',
    name: 'High Scorer',
    description: 'Score over 1,000 points in a single game',
    icon: '⭐',
    tier: 'silver',
    category: 'mastery',
    check: h => {
      const best = Math.max(0, ...h.map(e => e.score))
      return { unlocked: best >= 1000, progress: Math.min(best / 1000, 1) }
    },
  },
  {
    id: 'mega_scorer',
    name: 'Mega Scorer',
    description: 'Score over 5,000 points in a single game',
    icon: '🌟',
    tier: 'platinum',
    category: 'mastery',
    check: h => {
      const best = Math.max(0, ...h.map(e => e.score))
      return { unlocked: best >= 5000, progress: Math.min(best / 5000, 1) }
    },
  },
  {
    id: 'streak_five',
    name: 'On Fire',
    description: 'Get a streak of 5 correct answers',
    icon: '🔥',
    tier: 'bronze',
    category: 'mastery',
    check: h => {
      const best = Math.max(0, ...h.map(e => e.streak || 0))
      return { unlocked: best >= 5, progress: Math.min(best / 5, 1) }
    },
  },
  {
    id: 'streak_ten',
    name: 'Unstoppable',
    description: 'Get a streak of 10 correct answers',
    icon: '💪',
    tier: 'silver',
    category: 'mastery',
    check: h => {
      const best = Math.max(0, ...h.map(e => e.streak || 0))
      return { unlocked: best >= 10, progress: Math.min(best / 10, 1) }
    },
  },
  {
    id: 'streak_twenty',
    name: 'Legendary Streak',
    description: 'Get a streak of 20 correct answers',
    icon: '👑',
    tier: 'platinum',
    category: 'mastery',
    check: h => {
      const best = Math.max(0, ...h.map(e => e.streak || 0))
      return { unlocked: best >= 20, progress: Math.min(best / 20, 1) }
    },
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Average under 5 seconds per question in a game',
    icon: '⚡',
    tier: 'gold',
    category: 'mastery',
    check: h => {
      const withQ = h.filter(e => e.totalQuestions > 0)
      const bestSpeed =
        withQ.length > 0 ? Math.min(...withQ.map(e => e.duration / e.totalQuestions)) : Infinity
      return { unlocked: bestSpeed <= 5, progress: bestSpeed <= 5 ? 1 : Math.min(5 / bestSpeed, 1) }
    },
  },

  // ─── Dedication ──────────────────────────────────────────────
  {
    id: 'all_modes',
    name: 'Well-Rounded',
    description: 'Play all game modes (Quick, Custom, Advanced)',
    icon: '🎲',
    tier: 'silver',
    category: 'dedication',
    check: h => {
      const modes = new Set(h.map(e => e.mode))
      const target = ['quick', 'custom', 'advanced']
      const found = target.filter(m => modes.has(m)).length
      return { unlocked: found >= 3, progress: found / 3 }
    },
  },
  {
    id: 'five_categories',
    name: 'Knowledge Seeker',
    description: 'Play games in 5 different categories',
    icon: '📚',
    tier: 'silver',
    category: 'dedication',
    check: h => {
      const cats = new Set(h.map(e => e.category))
      return { unlocked: cats.size >= 5, progress: Math.min(cats.size / 5, 1) }
    },
  },
  {
    id: 'ten_categories',
    name: 'Renaissance Mind',
    description: 'Play games in 10 different categories',
    icon: '🧠',
    tier: 'gold',
    category: 'dedication',
    check: h => {
      const cats = new Set(h.map(e => e.category))
      return { unlocked: cats.size >= 10, progress: Math.min(cats.size / 10, 1) }
    },
  },
  {
    id: 'total_score_10k',
    name: 'Score Collector',
    description: 'Accumulate 10,000 total points',
    icon: '💰',
    tier: 'silver',
    category: 'dedication',
    check: (_h, s) => ({
      unlocked: s.totalScore >= 10000,
      progress: Math.min(s.totalScore / 10000, 1),
    }),
  },
  {
    id: 'total_score_100k',
    name: 'Score Hoarder',
    description: 'Accumulate 100,000 total points',
    icon: '💎',
    tier: 'platinum',
    category: 'dedication',
    check: (_h, s) => ({
      unlocked: s.totalScore >= 100000,
      progress: Math.min(s.totalScore / 100000, 1),
    }),
  },
  {
    id: 'thousand_questions',
    name: 'Question Machine',
    description: 'Answer 1,000 questions total',
    icon: '🤖',
    tier: 'gold',
    category: 'dedication',
    check: (_h, s) => ({
      unlocked: s.totalQuestions >= 1000,
      progress: Math.min(s.totalQuestions / 1000, 1),
    }),
  },

  // ─── Special ──────────────────────────────────────────────
  {
    id: 'win_streak_three',
    name: 'Hat Trick',
    description: 'Win 3 games in a row (70%+ accuracy)',
    icon: '🎩',
    tier: 'silver',
    category: 'special',
    check: (_h, s) => ({
      unlocked: s.currentWinStreak >= 3,
      progress: Math.min(s.currentWinStreak / 3, 1),
    }),
  },
  {
    id: 'win_streak_ten',
    name: 'Dominant Force',
    description: 'Win 10 games in a row (70%+ accuracy)',
    icon: '🏅',
    tier: 'platinum',
    category: 'special',
    check: (_h, s) => ({
      unlocked: s.currentWinStreak >= 10,
      progress: Math.min(s.currentWinStreak / 10, 1),
    }),
  },
  {
    id: 'improving',
    name: 'Growth Mindset',
    description: 'Have an improving accuracy trend',
    icon: '📈',
    tier: 'bronze',
    category: 'special',
    check: (_h, s) => ({
      unlocked: s.recentTrend === 'improving',
      progress: s.recentTrend === 'improving' ? 1 : 0,
    }),
  },
]

// ============================================================================
// Core Functions
// ============================================================================

/** Total number of defined achievements */
export const TOTAL_ACHIEVEMENTS = ACHIEVEMENT_DEFS.length

/**
 * Evaluate all achievements against current game history.
 *
 * @returns Array of all achievements with current unlock status and progress
 */
export function getAchievements(): Achievement[] {
  const history = getHistory()
  const stats = getDetailedStats()
  const timestamps = getTimestamps()

  return ACHIEVEMENT_DEFS.map(def => {
    const { unlocked, progress } = def.check(history, stats)

    // Record unlock timestamp on first unlock
    if (unlocked && !timestamps[def.id]) {
      timestamps[def.id] = new Date().toISOString()
      saveTimestamps(timestamps)
    }

    return {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      tier: def.tier,
      category: def.category,
      unlocked,
      progress,
      unlockedAt: timestamps[def.id] ?? null,
    }
  })
}

/**
 * Get only unlocked achievements
 */
export function getUnlockedAchievements(): Achievement[] {
  return getAchievements().filter(a => a.unlocked)
}

/**
 * Get achievement unlock summary
 */
export function getAchievementSummary(): {
  total: number
  unlocked: number
  percentage: number
  byTier: Record<AchievementTier, { total: number; unlocked: number }>
  byCategory: Record<Achievement['category'], { total: number; unlocked: number }>
} {
  const achievements = getAchievements()
  const unlocked = achievements.filter(a => a.unlocked).length

  const byTier: Record<AchievementTier, { total: number; unlocked: number }> = {
    bronze: { total: 0, unlocked: 0 },
    silver: { total: 0, unlocked: 0 },
    gold: { total: 0, unlocked: 0 },
    platinum: { total: 0, unlocked: 0 },
  }

  const byCategory: Record<Achievement['category'], { total: number; unlocked: number }> = {
    gameplay: { total: 0, unlocked: 0 },
    mastery: { total: 0, unlocked: 0 },
    dedication: { total: 0, unlocked: 0 },
    special: { total: 0, unlocked: 0 },
  }

  for (const a of achievements) {
    byTier[a.tier].total++
    byCategory[a.category].total++
    if (a.unlocked) {
      byTier[a.tier].unlocked++
      byCategory[a.category].unlocked++
    }
  }

  return {
    total: achievements.length,
    unlocked,
    percentage: achievements.length > 0 ? Math.round((unlocked / achievements.length) * 100) : 0,
    byTier,
    byCategory,
  }
}

/**
 * Check for newly unlocked achievements after a game.
 * Returns only the achievements that were unlocked for the first time.
 *
 * @param previouslyUnlocked - Set of achievement IDs that were already unlocked
 * @returns Newly unlocked achievement objects
 */
export function checkNewAchievements(previouslyUnlocked: Set<string>): Achievement[] {
  const current = getAchievements()
  return current.filter(a => a.unlocked && !previouslyUnlocked.has(a.id))
}

/**
 * Get tier display properties
 */
export function getTierDisplay(tier: AchievementTier): {
  label: string
  color: string
  bgColor: string
  borderColor: string
} {
  switch (tier) {
    case 'bronze':
      return {
        label: 'Bronze',
        color: 'text-amber-600',
        bgColor: 'bg-amber-900/30',
        borderColor: 'border-amber-700',
      }
    case 'silver':
      return {
        label: 'Silver',
        color: 'text-gray-300',
        bgColor: 'bg-gray-700/30',
        borderColor: 'border-gray-500',
      }
    case 'gold':
      return {
        label: 'Gold',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/30',
        borderColor: 'border-yellow-600',
      }
    case 'platinum':
      return {
        label: 'Platinum',
        color: 'text-cyan-300',
        bgColor: 'bg-cyan-900/30',
        borderColor: 'border-cyan-600',
      }
  }
}
