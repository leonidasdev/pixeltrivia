/**
 * Zod Validation Schemas
 *
 * Centralized validation schemas for all API inputs.
 *
 * @module lib/validation
 * @since 1.0.0
 */

import { z } from 'zod'

// ============================================================================
// Common Validators
// ============================================================================

/**
 * Sanitize string input - trims whitespace and removes dangerous characters
 */
export const sanitizedString = z.string().transform(val => {
  return val
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 10000) // Max length safety
})

/**
 * Non-empty sanitized string
 */
export const requiredString = sanitizedString.pipe(z.string().min(1, 'This field is required'))

/**
 * Valid nickname (alphanumeric, spaces, some special chars)
 */
export const nicknameSchema = z
  .string()
  .trim()
  .min(1, 'Nickname is required')
  .max(20, 'Nickname must be 20 characters or less')
  .regex(
    /^[a-zA-Z0-9\s\-_]+$/,
    'Nickname can only contain letters, numbers, spaces, hyphens, and underscores'
  )

/**
 * Room code format (6 alphanumeric uppercase)
 */
export const roomCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(6, 'Room code must be exactly 6 characters')
  .regex(/^[A-Z0-9]{6}$/, 'Room code must be 6 alphanumeric characters')

/**
 * UUID format
 */
export const uuidSchema = z.string().uuid('Invalid ID format')

/**
 * Positive integer
 */
export const positiveIntSchema = z.coerce
  .number()
  .int('Must be a whole number')
  .positive('Must be a positive number')

/**
 * Number within range
 */
export const rangedNumberSchema = (min: number, max: number) =>
  z.coerce
    .number()
    .int(`Must be a whole number between ${min} and ${max}`)
    .min(min, `Must be at least ${min}`)
    .max(max, `Must be at most ${max}`)

// ============================================================================
// Room Schemas
// ============================================================================

export const createRoomSchema = z.object({
  hostNickname: nicknameSchema,
  maxPlayers: rangedNumberSchema(2, 16).optional().default(8),
  isPrivate: z.boolean().optional().default(false),
})

export const joinRoomSchema = z.object({
  roomCode: roomCodeSchema,
  nickname: nicknameSchema,
})

export const leaveRoomSchema = z.object({
  roomId: uuidSchema,
  playerId: uuidSchema,
})

export const startGameSchema = z.object({
  roomId: uuidSchema,
  hostId: uuidSchema,
})

// ============================================================================
// Quiz Schemas
// ============================================================================

/**
 * Knowledge/Difficulty levels
 */
export const knowledgeLevelSchema = z.enum([
  'elementary',
  'middle-school',
  'high-school',
  'college',
  'classic',
])

/**
 * Quiz categories (sample - extend as needed)
 */
export const categorySchema = z.string().min(1).max(100)

/**
 * Quick quiz request (POST body)
 */
export const quickQuizSchema = z.object({
  difficulty: knowledgeLevelSchema,
  category: categorySchema,
  questionCount: rangedNumberSchema(1, 50).optional().default(10),
})

/**
 * Quick quiz route request — only category is required, difficulty is optional.
 */
export const quickQuizRequestSchema = z.object({
  category: z.string({ error: 'Category must be a string' }).trim().min(1, 'Category is required'),
  difficulty: knowledgeLevelSchema.optional(),
})

/**
 * Custom quiz request (AI-generated)
 */
export const customQuizSchema = z.object({
  knowledgeLevel: knowledgeLevelSchema,
  context: z
    .string()
    .trim()
    .max(2000, 'Context must be 2000 characters or less')
    .transform(val => val.replace(/[<>]/g, '').slice(0, 2000))
    .optional(),
  numQuestions: rangedNumberSchema(1, 50).optional().default(10),
})

/**
 * Advanced quiz request
 */
export const advancedQuizSchema = z.object({
  knowledgeLevel: knowledgeLevelSchema,
  categories: z.array(categorySchema).min(1).max(10),
  numQuestions: rangedNumberSchema(1, 100).optional().default(20),
  timePerQuestion: rangedNumberSchema(5, 120).optional().default(30),
  enableHints: z.boolean().optional().default(false),
})

/**
 * Advanced quiz route request — file-based AI generation.
 * Clamps numeric values to valid ranges (matching original behavior).
 */
export const advancedRouteRequestSchema = z.object({
  filesSummary: z
    .string()
    .trim()
    .min(1, 'Files summary is required')
    .max(3000, 'Files summary must be 3000 characters or less')
    .transform(val =>
      val
        .replace(/[#*_`~\[\]]/g, '')
        .replace(/\b(User|System|Assistant|AI|Human):\s*/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .replace(/[{}|\\^`]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    ),
  numQuestions: z.coerce
    .number()
    .default(10)
    .transform(v => Math.max(1, Math.min(20, v))),
  format: z.enum(['short', 'long']).optional().default('short'),
  timeLimit: z.coerce
    .number()
    .default(20)
    .transform(v => Math.max(10, Math.min(120, v))),
})

// ============================================================================
// Game Schemas
// ============================================================================

/**
 * Submit answer
 */
export const submitAnswerSchema = z.object({
  sessionId: uuidSchema,
  questionId: z.string().min(1),
  selectedAnswer: z.string().min(1),
  timeSpent: rangedNumberSchema(0, 300).optional(), // seconds
})

/**
 * Question structure for validation
 */
export const questionSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  options: z.array(z.string()).min(2).max(6),
  correctAnswer: z.string(),
  category: z.string().optional(),
  difficulty: knowledgeLevelSchema.optional(),
  explanation: z.string().optional(),
})

// ============================================================================
// AI Generation Schemas
// ============================================================================

export const generateQuestionsSchema = z.object({
  topic: sanitizedString.pipe(z.string().min(1, 'Topic is required').max(500, 'Topic too long')),
  difficulty: knowledgeLevelSchema,
  count: rangedNumberSchema(1, 20).optional().default(10),
  context: z
    .string()
    .trim()
    .max(2000)
    .transform(val => val.replace(/[<>]/g, '').slice(0, 2000))
    .optional(),
  language: z.enum(['en', 'es', 'fr', 'de']).optional().default('en'),
})

// ============================================================================
// Type Exports
// ============================================================================

export type CreateRoomInput = z.infer<typeof createRoomSchema>
export type JoinRoomInput = z.infer<typeof joinRoomSchema>
export type LeaveRoomInput = z.infer<typeof leaveRoomSchema>
export type StartGameInput = z.infer<typeof startGameSchema>
export type QuickQuizInput = z.infer<typeof quickQuizSchema>
export type QuickQuizRequestInput = z.infer<typeof quickQuizRequestSchema>
export type CustomQuizInput = z.infer<typeof customQuizSchema>
export type AdvancedQuizInput = z.infer<typeof advancedQuizSchema>
export type AdvancedRouteRequestInput = z.infer<typeof advancedRouteRequestSchema>
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>
export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Result of a validation attempt
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: z.ZodError }

/**
 * Validate data against a schema
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: result.error }
}

/**
 * Format Zod errors into a user-friendly format
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}

  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root'
    if (!formatted[path]) {
      formatted[path] = []
    }
    formatted[path].push(issue.message)
  }

  return formatted
}

/**
 * Get first error message from Zod error
 */
export function getFirstError(error: z.ZodError): string {
  const issue = error.issues[0]
  if (!issue) return 'Validation failed'
  const path = issue.path.join('.')
  return path ? `${path}: ${issue.message}` : issue.message
}
