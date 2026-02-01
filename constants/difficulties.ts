/**
 * Difficulty Constants
 *
 * Defines difficulty levels and their configurations.
 *
 * @module constants/difficulties
 * @since 1.0.0
 */

import type { DifficultyLevel, KnowledgeLevel } from '../types/game'

/**
 * Knowledge level configuration
 */
export interface KnowledgeLevelConfig {
  /** Unique identifier */
  value: KnowledgeLevel
  /** Display label */
  label: string
  /** Description of the level */
  description: string
  /** Emoji icon */
  emoji: string
  /** Suggested age range */
  ageRange?: string
  /** Typical question complexity (1-5) */
  complexity: number
}

/**
 * Knowledge levels for custom game configuration
 *
 * @remarks
 * These levels determine the complexity of AI-generated questions
 * and are mapped to appropriate vocabulary and concepts.
 */
export const KNOWLEDGE_LEVELS: readonly KnowledgeLevelConfig[] = [
  {
    value: 'classic',
    label: 'Classic',
    description: 'Mixed difficulty - General knowledge',
    emoji: '🌟',
    complexity: 3,
  },
  {
    value: 'college',
    label: 'College Level',
    description: 'Advanced topics - University level',
    emoji: '🎓',
    ageRange: '18+',
    complexity: 5,
  },
  {
    value: 'high-school',
    label: 'High School',
    description: 'Academic subjects - Grade 9-12',
    emoji: '📚',
    ageRange: '14-18',
    complexity: 4,
  },
  {
    value: 'middle-school',
    label: 'Middle School',
    description: 'Core subjects - Grade 6-8',
    emoji: '📝',
    ageRange: '11-13',
    complexity: 3,
  },
  {
    value: 'elementary',
    label: 'Elementary',
    description: 'Basic concepts - Grade K-5',
    emoji: '🎈',
    ageRange: '6-10',
    complexity: 1,
  },
] as const

/**
 * Difficulty level configuration for scoring and timing
 */
export interface DifficultyConfig {
  /** Difficulty level key */
  level: DifficultyLevel
  /** Display name */
  name: string
  /** Points multiplier for correct answers */
  scoreMultiplier: number
  /** Default time limit in seconds */
  defaultTimeLimit: number
  /** Minimum time limit allowed */
  minTimeLimit: number
  /** Maximum time limit allowed */
  maxTimeLimit: number
  /** Hint availability (if implemented) */
  hintsAvailable: number
}

/**
 * Difficulty configurations for game mechanics
 */
export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  elementary: {
    level: 'elementary',
    name: 'Elementary',
    scoreMultiplier: 1.0,
    defaultTimeLimit: 45,
    minTimeLimit: 30,
    maxTimeLimit: 60,
    hintsAvailable: 3,
  },
  'middle-school': {
    level: 'middle-school',
    name: 'Middle School',
    scoreMultiplier: 1.25,
    defaultTimeLimit: 35,
    minTimeLimit: 20,
    maxTimeLimit: 45,
    hintsAvailable: 2,
  },
  'high-school': {
    level: 'high-school',
    name: 'High School',
    scoreMultiplier: 1.5,
    defaultTimeLimit: 30,
    minTimeLimit: 15,
    maxTimeLimit: 40,
    hintsAvailable: 1,
  },
  college: {
    level: 'college',
    name: 'College Level',
    scoreMultiplier: 2.0,
    defaultTimeLimit: 25,
    minTimeLimit: 10,
    maxTimeLimit: 35,
    hintsAvailable: 0,
  },
  classic: {
    level: 'classic',
    name: 'Classic',
    scoreMultiplier: 1.5,
    defaultTimeLimit: 30,
    minTimeLimit: 15,
    maxTimeLimit: 45,
    hintsAvailable: 1,
  },
} as const

/**
 * Get knowledge level configuration by value
 *
 * @param level - The knowledge level to look up
 * @returns The configuration or undefined if not found
 */
export function getKnowledgeLevelConfig(level: KnowledgeLevel): KnowledgeLevelConfig | undefined {
  return KNOWLEDGE_LEVELS.find(config => config.value === level)
}

/**
 * Get difficulty configuration by level
 *
 * @param level - The difficulty level to look up
 * @returns The configuration
 */
export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_CONFIGS[level]
}

/**
 * Calculate score for a correct answer
 *
 * @param difficulty - The difficulty level
 * @param baseScore - The base score for a correct answer
 * @param timeBonus - Optional time-based bonus (0-1)
 * @returns The calculated score
 */
export function calculateDifficultyScore(
  difficulty: DifficultyLevel,
  baseScore: number = 100,
  timeBonus: number = 0
): number {
  const config = DIFFICULTY_CONFIGS[difficulty]
  const multipliedScore = Math.round(baseScore * config.scoreMultiplier)
  const bonus = Math.round(multipliedScore * timeBonus * 0.5) // Up to 50% bonus for speed
  return multipliedScore + bonus
}

/**
 * Valid knowledge level values for validation
 */
export const VALID_KNOWLEDGE_LEVELS: readonly KnowledgeLevel[] = [
  'classic',
  'college',
  'high-school',
  'middle-school',
  'elementary',
] as const

/**
 * Check if a value is a valid knowledge level
 *
 * @param value - The value to check
 * @returns Whether the value is a valid knowledge level
 */
export function isValidKnowledgeLevel(value: string): value is KnowledgeLevel {
  return VALID_KNOWLEDGE_LEVELS.includes(value as KnowledgeLevel)
}
