/**
 * Category Constants
 *
 * Defines game categories organized by difficulty level.
 *
 * @module constants/categories
 * @since 1.0.0
 */

import type { DifficultyLevel } from '../types/game'

/**
 * Category group structure
 */
export interface CategoryGroup {
  /** Unique key for the difficulty level */
  key: DifficultyLevel
  /** Display title */
  title: string
  /** Emoji icon */
  emoji: string
  /** Description of the difficulty */
  description: string
  /** Tailwind CSS classes */
  styles: CategoryStyles
  /** Available categories at this level */
  categories: readonly string[]
}

/**
 * Style configuration for a category group
 */
export interface CategoryStyles {
  /** Background color class */
  color: string
  /** Hover background color class */
  hoverColor: string
  /** Border color class */
  borderColor: string
  /** Text color class (optional) */
  textColor?: string
}

/**
 * Categories organized by difficulty level
 *
 * @remarks
 * Each difficulty level contains a curated list of categories
 * appropriate for that age/knowledge group.
 */
export const GAME_CATEGORIES: Record<DifficultyLevel, CategoryGroup> = {
  elementary: {
    key: 'elementary',
    title: 'Elementary',
    emoji: '🎈',
    description: 'Ages 6-10 - Fun & Simple',
    styles: {
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-500',
      borderColor: 'border-green-700',
    },
    categories: [
      'Colors & Shapes',
      'Animals',
      'Food',
      'Family',
      'Numbers',
      'Weather',
      'Transportation',
      'Body Parts',
    ],
  },
  'middle-school': {
    key: 'middle-school',
    title: 'Middle School',
    emoji: '📚',
    description: 'Ages 11-13 - Learning Adventure',
    styles: {
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-500',
      borderColor: 'border-blue-700',
    },
    categories: [
      'Basic Science',
      'World Geography',
      'Math Fundamentals',
      'Literature',
      'American History',
      'Sports',
      'Technology',
      'Art & Music',
    ],
  },
  'high-school': {
    key: 'high-school',
    title: 'High School',
    emoji: '🎓',
    description: 'Ages 14-18 - Academic Challenge',
    styles: {
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-500',
      borderColor: 'border-purple-700',
    },
    categories: [
      'Advanced Science',
      'World History',
      'Mathematics',
      'English Literature',
      'Chemistry',
      'Physics',
      'Biology',
      'Government & Politics',
    ],
  },
  college: {
    key: 'college',
    title: 'College Level',
    emoji: '🔬',
    description: 'Ages 18+ - Expert Knowledge',
    styles: {
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-500',
      borderColor: 'border-red-700',
    },
    categories: [
      'Advanced Mathematics',
      'Philosophy',
      'Computer Science',
      'Economics',
      'Psychology',
      'Biochemistry',
      'Engineering',
      'Law & Ethics',
    ],
  },
  classic: {
    key: 'classic',
    title: 'Classic',
    emoji: '🌟',
    description: 'Mixed difficulty - General Knowledge',
    styles: {
      color: 'bg-yellow-600',
      hoverColor: 'hover:bg-yellow-500',
      borderColor: 'border-yellow-700',
    },
    categories: [
      'General Knowledge',
      'Pop Culture',
      'History',
      'Science',
      'Geography',
      'Entertainment',
      'Sports',
      'Nature',
    ],
  },
} as const

/**
 * Get all categories as a flat array
 *
 * @returns Array of all category names across all difficulty levels
 */
export function getAllCategories(): string[] {
  return Object.values(GAME_CATEGORIES).flatMap(group => [...group.categories])
}

/**
 * Get categories for a specific difficulty level
 *
 * @param difficulty - The difficulty level
 * @returns Array of category names for that level
 */
export function getCategoriesByDifficulty(difficulty: DifficultyLevel): readonly string[] {
  return GAME_CATEGORIES[difficulty]?.categories ?? []
}

/**
 * Find which difficulty level a category belongs to
 *
 * @param category - The category name to search for
 * @returns The difficulty level or undefined if not found
 */
export function findCategoryDifficulty(category: string): DifficultyLevel | undefined {
  const normalizedCategory = category.toLowerCase()

  for (const [key, group] of Object.entries(GAME_CATEGORIES)) {
    if (group.categories.some(cat => cat.toLowerCase() === normalizedCategory)) {
      return key as DifficultyLevel
    }
  }

  return undefined
}

/**
 * Difficulty level display order (easiest to hardest)
 */
export const DIFFICULTY_ORDER: readonly DifficultyLevel[] = [
  'elementary',
  'middle-school',
  'high-school',
  'college',
  'classic',
] as const
