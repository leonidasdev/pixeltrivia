# CLAUDE.md - AI Context for PixelTrivia

> **Purpose:** This file provides essential context for AI assistants (Claude, GitHub Copilot, etc.) to understand and work with the PixelTrivia codebase. Read this first in any new session.

---

## Project Overview

**PixelTrivia** is a retro-styled trivia game application built with modern web technologies. It features single-player and multiplayer modes with AI-powered question generation.

### Quick Facts

| Aspect | Details |
|--------|---------|
| **Type** | Next.js Web Application |
| **Style** | Retro pixel-art aesthetic |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL) |
| **AI** | OpenRouter API (DeepSeek model) |
| **Testing** | Jest + React Testing Library (1222 tests, 65 suites) |

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                        │
│  Next.js App Router + React 18 + Tailwind CSS              │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 MIDDLEWARE LAYER                            │
│  Rate Limiting │ CORS │ Security Headers │ Input Validation │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   API ROUTES                                │
│  /api/quiz/* │ /api/room/* │ /api/game/* │ /api/upload     │
└──────┬──────────────────┬───────────────────────────────────┘
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│   Supabase   │   │  OpenRouter  │
│  PostgreSQL  │   │  (DeepSeek)  │
└──────────────┘   └──────────────┘
```

---

## Directory Structure

```
pixeltrivia/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes (serverless functions)
│   │   ├── upload/                   # File upload & text extraction
│   │   ├── game/questions/          # Game question retrieval
│   │   ├── quiz/quick/              # Quick play quiz API
│   │   ├── quiz/custom/             # Custom quiz (AI-powered)
│   │   ├── quiz/advanced/           # Advanced quiz (file-based)
│   │   └── room/                    # Multiplayer room system
│   │       ├── create/              # Room creation
│   │       ├── join/                # Room joining API
│   │       └── [code]/              # Room state + leave/close
│   │           ├── start/           # Start game (host)
│   │           ├── answer/          # Submit answer
│   │           ├── next/            # Next question (host)
│   │           └── question/        # Get current question
│   ├── components/           # React components
│   │   ├── AdvancedGameConfigurator.tsx
│   │   ├── BackButton.tsx
│   │   ├── CustomGameConfigurator.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── MainMenuLogo.tsx
│   │   ├── QuickGameSelector.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── Help/             # Help system (HelpButton, HelpModal, HelpContext)
│   │   ├── multiplayer/      # Multiplayer components
│   │   │   ├── PlayerList.tsx     # Player list with avatars & scores
│   │   │   ├── LobbyView.tsx     # Waiting room before game
│   │   │   ├── GameQuestion.tsx   # Question with colored options & timer
│   │   │   ├── Scoreboard.tsx     # Final scores podium
│   │   │   └── HostControls.tsx   # Host-only game controls
│   │   └── ui/               # Reusable UI component library
│   │       ├── Toast.tsx      # Toast notification system
│   │       ├── Modal.tsx, LoadingSpinner.tsx
│   │       ├── PixelButton, PixelCard, PixelInput, PixelBadge
│   │       ├── AnimatedBackground, GamePageLayout, PageHeader, PlayerDisplay
│   │       ├── PixelConfetti.tsx   # Canvas-based pixel confetti particles
│   │       ├── ScorePopup.tsx      # Floating score indicator (+100)
│   │       ├── AnswerFeedback.tsx  # Correct/wrong/timeout overlay
│   │       ├── PixelTimer.tsx      # Timer with urgency states
│   │       └── PageTransition.tsx  # Entrance animations + StaggerChildren
│   ├── game/                 # Game pages
│   │   ├── quick/            # Quick play mode
│   │   ├── custom/           # Custom game mode
│   │   ├── advanced/         # Advanced game mode
│   │   ├── create/           # Room creation
│   │   ├── join/             # Room joining
│   │   ├── lobby/[code]/     # Multiplayer lobby (realtime)
│   │   ├── play/[code]/      # Multiplayer gameplay
│   │   ├── mode/             # Mode selection
│   │   ├── select/           # Game selection
│   │   ├── leaderboard/      # Leaderboard rankings page
│   │   └── achievements/     # Achievement showcase page
│   ├── globals.css           # Global styles + Tailwind
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── error.tsx             # Error boundary
│   ├── global-error.tsx      # Global error handler
│   └── not-found.tsx         # 404 page
│
├── lib/                      # Shared utilities
│   ├── errors.ts             # Custom error classes (AppError, ValidationError, etc.)
│   ├── validation.ts         # Zod validation schemas
│   ├── rateLimit.ts          # Rate limiting middleware
│   ├── security.ts           # Security middleware (Next.js dependent)
│   ├── security.core.ts      # Pure security functions (testable)
│   ├── apiResponse.ts        # Standardized API responses
│   ├── logger.ts             # Structured logging utility
│   ├── storage.ts            # Typed localStorage wrapper
│   ├── soundManager.ts       # Web Audio API chiptune sound engine (18 effects)
│   ├── supabase.ts           # Supabase server-side client (service role key)
│   ├── supabaseClient.ts     # Supabase client-side for Realtime
│   ├── roomCode.ts           # Room code generation/validation
│   ├── roomApi.ts            # Room API client
│   ├── multiplayerApi.ts     # Multiplayer API client (all room/game operations)
│   ├── gameApi.ts            # Game API client
│   ├── quickQuizApi.ts       # Quick quiz API client
│   ├── customQuizApi.ts      # Custom quiz API client
│   ├── scoring.ts            # Unified scoring logic for all game modes
│   ├── leaderboard.ts        # Local leaderboard system (ranked entries, filters, personal records)
│   ├── achievements.ts       # Achievement system (20 achievements, 4 tiers, progress tracking)
│   ├── apiCache.ts           # SWR-based API response caching (typed hooks, config presets)
│   ├── analytics.ts          # Client-side usage analytics (13 event types, session detection)
│   └── utils.ts              # Shared utilities (generateId, formatDuration)
│
├── types/                    # Shared TypeScript types
│   ├── index.ts              # Re-exports all types
│   ├── game.ts               # Game state, questions, sessions, players
│   ├── api.ts                # API request/response types
│   ├── room.ts               # Multiplayer room types
│   └── quiz.ts               # Quiz configuration types
│
├── constants/                # Application constants
│   ├── index.ts              # Re-exports all constants
│   ├── avatars.ts            # Player avatar options
│   ├── categories.ts         # Game categories by difficulty
│   ├── difficulties.ts       # Knowledge levels and scoring
│   └── game.ts               # Game mechanics configuration
│
├── hooks/                    # Custom React hooks
│   ├── index.ts              # Re-exports all hooks
│   ├── useGameState.ts       # Game state management
│   ├── useLocalStorage.ts    # Typed localStorage with React sync
│   ├── usePlayerSettings.ts  # Player name, avatar, volume settings
│   ├── useTimer.ts           # Countdown timer
│   ├── useQuizSession.ts     # Quiz session management
│   ├── useSound.ts           # Sound effects hook (wraps soundManager)
│   ├── useRoom.ts            # Room state + Supabase Realtime subscription
│   ├── useMultiplayerGame.ts # Multiplayer game state machine
│   └── useGameHistory.ts     # Game history storage and stats
│
├── database/
│   ├── schema.sql            # PostgreSQL schema for Supabase
│   └── migration-multiplayer.sql  # Multiplayer schema additions
│
├── docs/                     # Documentation
│   ├── architecture.md       # System architecture
│   ├── development-guide.md  # Development guide
│   ├── deployment-guide.md   # Deployment guide
│   ├── api-reference.md      # API reference
│   ├── database-guide.md     # Database schema
│   ├── testing-guide.md      # Testing guide
│   ├── api-testing-guide.md  # API testing examples
│   ├── CLAUDE.md             # AI assistant context (this file)
│   ├── AUDIT.md              # Codebase audit findings
│   └── TODO.md               # Project roadmap
│
├── CONTRIBUTING.md           # Contribution guidelines
│
├── __tests__/                # Test files
│   ├── components/           # Component tests (incl. pages/)
│   ├── hooks/                # Hook tests
│   ├── integration/api/      # API route integration tests
│   └── unit/lib/             # Unit tests
│
├── .github/workflows/
│   └── ci.yml                # GitHub Actions CI pipeline
│
├── middleware.ts             # Next.js edge middleware
├── jest.config.js            # Jest configuration
├── jest.setup.js             # Jest setup
├── tailwind.config.js        # Tailwind configuration
├── next.config.js            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

---

## Key Technologies & Versions

```json
{
  "next": "14.2.30",
  "react": "^18.0.0",
  "typescript": "^5.8.3",
  "tailwindcss": "^3.3.0",
  "@supabase/supabase-js": "^2.49.4",
  "zod": "^3.25.76",
  "jest": "^30.2.0",
  "@testing-library/react": "^16.4.1"
}
```

---

## Game Modes

### 1. Quick Play
- Pre-defined categories from database
- 10 random questions per game
- No AI generation required
- API: `POST /api/quiz/quick`

### 2. Custom Game
- AI-generated questions via OpenRouter/DeepSeek
- User specifies topic and difficulty
- 1-50 questions configurable
- API: `POST /api/quiz/custom`

### 3. Advanced Mode
- Questions from uploaded file summaries
- Content-based AI question generation
- Input sanitization for security
- API: `POST /api/quiz/advanced`

### 4. Multiplayer
- Room-based gameplay
- Real-time with Supabase subscriptions
- 2-16 players per room
- API: `POST /api/room/create`

---

## Security Implementation

### Defense Layers

1. **Edge Middleware** (`middleware.ts`)
   - CORS validation
   - Suspicious pattern detection
   - Request logging

2. **Rate Limiting** (`lib/rateLimit.ts`)
   - Standard: 100 req/min
   - AI endpoints: 5 req/min
   - Room creation: 10 req/5min

3. **Input Validation** (`lib/validation.ts`)
   - Zod schemas for all inputs
   - Type coercion and sanitization
   - Field-level error messages

4. **Security Headers** (`next.config.js`)
   - CSP, X-Frame-Options, X-Content-Type-Options
   - Referrer-Policy, Permissions-Policy

5. **XSS Prevention** (`lib/security.core.ts`)
   - HTML tag removal
   - Script injection blocking
   - Input length limits

---

## Error Handling System

### Error Classes (`lib/errors.ts`)

```typescript
// Base error
AppError(message, code, statusCode, isOperational, context)

// Specific errors
ValidationError(message, field?, validationErrors?)  // 400
NotFoundError(resource, identifier?)                 // 404
DatabaseError(message, operation?, originalError?)   // 500
AuthenticationError(message?)                        // 401
AuthorizationError(message?, requiredRole?)          // 403
RateLimitError(retryAfter?, limit?, window?)         // 429
ExternalServiceError(service, message, originalError?) // 502
AIGenerationError(message, model?, prompt?)          // 500
```

### API Response Format

All API routes use `lib/apiResponse.ts` helpers for consistent response envelopes:

```typescript
// Success (200/201)
{
  success: true,
  data: { ... },
  message?: "Optional message",
  meta: { timestamp: "ISO string" }
}

// Error (4xx/5xx)
{
  success: false,
  error: "Human-readable error message",
  code: "ERROR_CODE",
  statusCode: 400,
  meta: { timestamp: "ISO string" }
}
```

---

## Testing Overview

### Test Statistics
- **899 tests** across 48 test suites
- **100% passing** on CI
- **Coverage thresholds**: branches ≥12%, functions/lines/statements ≥15%

### Test Commands
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Test Location
- `__tests__/unit/lib/` - Library function tests
- `__tests__/components/` - React component tests
- `__tests__/components/pages/` - Page-level tests
- `__tests__/hooks/` - Custom hook tests
- `__tests__/integration/api/` - API route integration tests

---

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix lint issues
npm run format       # Prettier format
npm run typecheck    # TypeScript check
npm test             # Run tests
```

---

## Environment Variables

Required in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenRouter (AI)
OPENROUTER_API_KEY=sk-or-v1-...
```

---

## Database Schema Summary

### Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `rooms` | Multiplayer rooms | code, status, max_players |
| `players` | Room participants | room_code, name, score |
| `questions` | Trivia questions | question_text, options, correct_answer |
| `game_sessions` | Active games | room_code, current_question_id |

### Key Features
- RLS (Row Level Security) enabled
- Cascade delete on room → players
- Indexes on frequently queried columns

---

## Common Tasks

### Adding a New API Endpoint

1. Create route file: `app/api/[path]/route.ts`
2. Add Zod validation schema to `lib/validation.ts`
3. Use `apiResponse` helpers from `lib/apiResponse.ts`
4. Add rate limiting (required — all routes use `rateLimit()` from `lib/rateLimit`)
5. Use `logger` from `lib/logger` (not console.error)
6. Add method-not-allowed handlers for unsupported HTTP methods
7. Write tests in `__tests__/unit/lib/`

### Adding a New Component

1. Create in `app/components/[Name].tsx`
2. Use TypeScript interfaces for props
3. Follow Tailwind + retro pixel styling
4. Write tests in `__tests__/components/`

### Adding Database Tables

1. Add SQL to `database/schema.sql`
2. Run in Supabase SQL Editor
3. Enable RLS and create policies
4. Update `docs/database-guide.md`

---

## Code Patterns

### API Route Pattern

```typescript
import { type NextRequest } from 'next/server'
import { logger } from '@/lib/logger'
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
  methodNotAllowedResponse,
} from '@/lib/apiResponse'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const rateLimited = rateLimit(request, RATE_LIMITS.standard)
  if (rateLimited) return rateLimited

  try {
    const body = await request.json()

    // ... validate and process

    return successResponse(result, 'Optional message')
  } catch (error) {
    logger.error('Route error:', error)
    return serverErrorResponse(
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}

// Handle unsupported HTTP methods
export const GET = () => methodNotAllowedResponse('POST')
export const PUT = () => methodNotAllowedResponse('POST')
export const DELETE = () => methodNotAllowedResponse('POST')
```

### Component Pattern

```tsx
'use client'

import { useState } from 'react'

interface Props {
  // ... props
}

export function ComponentName({ prop1, prop2 }: Props) {
  const [state, setState] = useState(initialValue)

  return (
    <div className="bg-gray-900 border-4 border-black shadow-[4px_4px_0_0_#000]">
      {/* Retro pixel styling */}
    </div>
  )
}
```

---

## Current Project Status

### Completed
- Core game modes (Quick, Custom, Advanced)
- Testing infrastructure (899 tests, 48 suites)
- CI/CD pipeline (GitHub Actions + Husky)
- Security hardening (validation, rate limiting on all routes, middleware)
- Standardized API responses via `lib/apiResponse` helpers
- Structured logging via `lib/logger` (no raw console.error in routes)
- Centralized storage keys (`constants/game.ts STORAGE_KEYS`)
- Canonical avatar constants (`constants/avatars.ts AVATAR_OPTIONS`)
- Toast notification system (replaces browser alerts)
- Help modal deduplication via HelpContext
- UI component library adoption across game pages
- Skip navigation link for keyboard/screen reader accessibility
- `prefers-reduced-motion` support for all animations
- Component tests (ErrorBoundary, BackButton, Toast, Modal)
- Page tests (HomePage, GameModePage, JoinGamePage)
- Hook tests (useGameState, useLocalStorage, useTimer, useQuizSession, useRoom, useMultiplayerGame)
- API route integration tests (roomCreate, quizQuick, gameQuestions, upload)
- Comprehensive documentation

### In Progress
- Leaderboards
- Score persistence

### Planned
- User authentication
- Analytics dashboard
- Mobile responsiveness improvements

---

## Known Issues & Gotchas

1. **Next.js Server Imports in Tests**
   - Split server code into `.core.ts` (pure functions) for testability
   - Example: `security.ts` → `security.core.ts`

2. **Supabase RLS**
   - Service role key needed for admin operations
   - Anon key for client-side reads

3. **OpenRouter Rate Limits**
   - DeepSeek has separate limits from OpenRouter
   - Implement client-side rate limiting too

4. **Tailwind Pixel Styling**
   - Use `shadow-[4px_4px_0_0_#000]` for pixel shadow effect
   - Border-4 for chunky borders

---

## Useful Links

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Supabase Docs](https://supabase.com/docs)
- [Zod Documentation](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [OpenRouter API](https://openrouter.ai/docs)

---

## For AI Assistants

When working on this codebase:

1. **Always use TypeScript** with strict types
2. **Follow existing patterns** - check similar files for conventions
3. **Write tests** for new functionality
4. **Use Zod** for input validation
5. **Follow the retro pixel aesthetic** in UI components
6. **Update documentation** when making significant changes
7. **Run `npm test`** before committing
8. **Use conventional commits** (feat:, fix:, docs:, etc.)

### Quick Reference

| Need | File/Location |
|------|---------------|
| API validation | `lib/validation.ts` |
| Error handling | `lib/errors.ts` |
| API responses | `lib/apiResponse.ts` |
| Rate limiting | `lib/rateLimit.ts` |
| Security | `lib/security.ts`, `lib/security.core.ts` |
| Database | `lib/supabase.ts`, `database/schema.sql` |
| Tests | `__tests__/` |
| Docs | `docs/` |

---

*Last updated: February 28, 2026*
