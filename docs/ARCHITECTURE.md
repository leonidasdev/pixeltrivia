# Architecture Overview

This document describes the system architecture of PixelTrivia, a retro-styled trivia game built with modern web technologies.

## Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [API Architecture](#api-architecture)
- [Security Architecture](#security-architecture)
- [Database Design](#database-design)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PixelTrivia System                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────────────┐     ┌──────────────────┐      │
│  │   Browser   │────▶│   Next.js Server    │────▶│    Supabase      │      │
│  │   (React)   │◀────│   (API Routes)      │◀────│   (PostgreSQL)   │      │
│  └─────────────┘     └──────────┬──────────┘     └──────────────────┘      │
│                                 │                                           │
│                                 │                                           │
│                                 ▼                                           │
│                      ┌──────────────────────┐                               │
│                      │     OpenRouter       │                               │
│                      │   (DeepSeek AI)      │                               │
│                      └──────────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Frontend (React/Next.js)** - Client-side UI with retro pixel styling
2. **Backend (Next.js API Routes)** - Server-side API endpoints
3. **Database (Supabase/PostgreSQL)** - Game data, rooms, players, questions
4. **AI Service (OpenRouter/DeepSeek)** - Dynamic question generation

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.30 | React framework with App Router |
| React | 18.x | UI component library |
| TypeScript | 5.8.x | Type safety |
| Tailwind CSS | 3.3.x | Utility-first styling |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 14.x | Serverless API endpoints |
| Zod | 4.x | Runtime schema validation |
| Supabase Client | 2.50.x | Database client |

### Database
| Technology | Purpose |
|------------|---------|
| Supabase | Managed PostgreSQL with RLS |
| PostgreSQL | Relational database |

### AI/ML
| Technology | Purpose |
|------------|---------|
| OpenRouter | AI model gateway |
| DeepSeek | Question generation model |

### DevOps
| Technology | Purpose |
|------------|---------|
| GitHub Actions | CI/CD pipeline |
| Husky | Git hooks |
| Jest | Unit testing |
| ESLint/Prettier | Code quality |

---

## Application Architecture

### Next.js App Router Structure

```
app/
├── page.tsx                 # Main menu (/)
├── layout.tsx               # Root layout with providers
├── globals.css              # Global styles (Tailwind)
├── error.tsx                # Error boundary
├── global-error.tsx         # Global error handler
├── not-found.tsx            # 404 page
│
├── api/                     # API Routes (serverless functions)
│   ├── game/
│   │   └── questions/route.ts
│   ├── quiz/
│   │   ├── quick/route.ts
│   │   ├── custom/route.ts
│   │   └── advanced/route.ts
│   └── room/
│       ├── create/route.ts
│       └── [code]/route.ts (+start, answer, next, question)
│
├── components/              # Shared components
│   ├── AdvancedGameConfigurator.tsx
│   ├── CustomGameConfigurator.tsx
│   ├── QuickGameSelector.tsx
│   ├── SettingsPanel.tsx
│   ├── BackButton.tsx
│   ├── MainMenuLogo.tsx
│   ├── ErrorBoundary.tsx
    ├── help/                # Help system (context-aware)
│   │   ├── HelpButton.tsx
│   │   ├── HelpModal.tsx
│   │   └── HelpContext.tsx
│   ├── multiplayer/         # Multiplayer components
│   │   ├── PlayerList.tsx
│   │   ├── LobbyView.tsx
│   │   ├── GameQuestion.tsx
│   │   ├── Scoreboard.tsx
│   │   └── HostControls.tsx
│   ├── stats/               # Statistics components
│   │   ├── StatsOverview.tsx
│   │   ├── GameHistoryList.tsx
│   │   └── charts/
│   └── ui/                  # Reusable UI library
│       ├── Toast.tsx, Modal.tsx, LoadingSpinner.tsx
│       ├── PixelButton.tsx, PixelCard.tsx, PixelInput.tsx, PixelBadge.tsx
│       ├── AnimatedBackground.tsx, GamePageLayout.tsx, PageHeader.tsx
│       ├── PlayerDisplay.tsx, PixelConfetti.tsx, ScorePopup.tsx
│       ├── AnswerFeedback.tsx, PixelTimer.tsx
│       └── PageTransition.tsx
│
└── game/                    # Game pages
    ├── mode/page.tsx        # Mode selection
    ├── select/page.tsx      # Category selection
    ├── quick/page.tsx       # Quick play
    ├── custom/page.tsx      # Custom game
    ├── advanced/page.tsx    # Advanced settings
    ├── play/page.tsx        # Single-player gameplay
    ├── create/page.tsx      # Create room
    ├── join/page.tsx        # Join room
    ├── stats/page.tsx       # Game statistics
    ├── leaderboard/page.tsx # Rankings
    └── achievements/page.tsx # Achievements
```

### Library Structure

```
lib/
├── errors.ts          # 15+ custom error classes
├── apiResponse.ts     # Standardized API responses
├── validation.ts      # Zod schemas for all inputs
├── security.ts        # Security middleware (Next.js)
├── security.core.ts   # Pure security functions
├── rateLimit.ts       # Rate limiting (in-memory + Redis)
├── logger.ts          # Structured logging utility
├── storage.ts         # Typed localStorage wrapper
├── supabase.ts        # Supabase client (DbRoom, DbPlayer types)
├── roomApi.ts         # Room management API
├── roomCode.ts        # Room code generation
├── gameApi.ts         # Game session management
├── quickQuizApi.ts    # Quick quiz API client
├── customQuizApi.ts   # Custom quiz API client
├── multiplayerApi.ts  # Multiplayer API client
├── scoring.ts         # Unified scoring logic
├── soundManager.ts    # Web Audio API sound engine
├── fileParser.ts      # File upload parsing (PDF, DOCX, TXT, MD)
├── leaderboard.ts     # Local leaderboard system
├── achievements.ts    # Achievement system (20 achievements, 4 tiers)
├── apiCache.ts        # SWR-based API response caching
├── analytics.ts       # Client-side usage analytics
└── utils.ts           # Shared utilities (generateId, formatDuration)
```

### Types Structure

```
types/
├── index.ts           # Re-exports all types
├── game.ts            # Game state, questions, sessions, players
├── api.ts             # API request/response types, error codes
├── room.ts            # Multiplayer room types and events
└── quiz.ts            # Quiz configuration and session types
```

### Constants Structure

```
constants/
├── index.ts           # Re-exports all constants
├── avatars.ts         # Player avatar options
├── categories.ts      # Game categories by difficulty
├── difficulties.ts    # Knowledge levels and scoring configs
└── game.ts            # Game mechanics configuration
```

### Hooks Structure

```
hooks/
├── index.ts           # Re-exports all hooks
├── useGameState.ts    # Game state management
├── useLocalStorage.ts # Typed localStorage with React sync
├── usePlayerSettings.ts # Player name, avatar, volume settings
├── useTimer.ts        # Countdown timer with callbacks
├── useQuizSession.ts  # Complete quiz session management
├── useSound.ts        # Sound effects hook
├── useRoom.ts         # Room state + Supabase Realtime
├── useMultiplayerGame.ts # Multiplayer game state machine
└── useGameHistory.ts  # Game history storage and stats
```

---

## Component Architecture

### Component Hierarchy

```
RootLayout
├── Skip Navigation Link
├── MainMenuLogo
├── HelpProvider (HelpContext)
│   └── HelpModal
└── Pages
    ├── HomePage (Main Menu)
    │   ├── Quick Play Button
    │   ├── Custom Game Button
    │   ├── Multiplayer Button
    │   └── Toast (notifications)
    │
    ├── QuickGameSelector
    │   ├── Category Grid
    │   ├── Difficulty Selector
    │   ├── Question Count Slider
    │   └── Toast (success/error)
    │
    ├── CustomGameConfigurator
    │   ├── Topic Input
    │   ├── Context Textarea
    │   ├── Knowledge Level Selector
    │   ├── Question Count Slider
    │   └── Toast (success/error)
    │
    └── AdvancedGameConfigurator
        ├── File Upload
        ├── Category Multi-select
        ├── Time Limit Slider
        ├── Hints Toggle
        └── Toast (success/error)
```

### Shared Component Patterns

All interactive components follow these patterns:

1. **Accessibility** - ARIA labels, keyboard navigation, focus management, skip-nav
2. **Toast Notifications** - Non-intrusive feedback via `ui/Toast.tsx` (replaces `alert()`)
3. **Retro Styling** - Consistent pixel borders, retro fonts, color palette
4. **State Management** - React hooks for local state
5. **Reduced Motion** - Respects `prefers-reduced-motion` system preference
4. **Error Boundaries** - Graceful error handling with retry options

---

## Data Flow

### Quick Play Flow

```
┌──────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌──────────────┐
│  User    │───▶│ QuickGameSelector│───▶│ /api/quiz/quick │───▶│   Supabase   │
│  Input   │    │   Component      │    │    API Route    │    │   Database   │
└──────────┘    └──────────────────┘    └─────────────────┘    └──────────────┘
     │                   │                      │                      │
     │ Select Category   │ POST request         │ Query questions      │
     │ Select Difficulty │ { category,          │ by category &        │
     │ Select Count      │   difficulty,        │ difficulty           │
     │                   │   count }            │                      │
     │                   │                      │◀─────────────────────│
     │                   │◀─────────────────────│ Return questions     │
     │◀──────────────────│ Display game         │                      │
     │ Play game         │                      │                      │
```

### Custom Game Flow (AI Generation)

```
┌──────────┐    ┌───────────────────┐    ┌────────────────────┐    ┌────────────┐
│  User    │───▶│ CustomGame        │───▶│ /api/quiz/custom   │───▶│ OpenRouter │
│  Input   │    │ Configurator      │    │    API Route       │    │ (DeepSeek) │
└──────────┘    └───────────────────┘    └────────────────────┘    └────────────┘
     │                   │                        │                      │
     │ Enter Topic       │ POST request           │ Generate prompt      │
     │ Add Context       │ { topic,               │ Call AI model        │
     │ Select Level      │   context,             │                      │
     │                   │   knowledgeLevel }     │◀─────────────────────│
     │                   │                        │ Parse AI response    │
     │                   │◀───────────────────────│ Return questions     │
     │◀──────────────────│ Display game           │                      │
```

### Multiplayer Room Flow

```
┌─────────┐    ┌─────────────────┐    ┌────────────────┐    ┌──────────────┐
│ Host    │───▶│ CreateRoom Page │───▶│ /api/room/     │───▶│   Supabase   │
│         │    │                 │    │ create         │    │   Database   │
└─────────┘    └─────────────────┘    └────────────────┘    └──────────────┘
                                              │
                                              ▼
                                      Create room record
                                      Generate room code
                                              │
                                              ▼
┌─────────┐    ┌─────────────────┐    Share room code    ┌──────────────┐
│ Player  │───▶│ JoinRoom Page   │───▶────────────────────▶│   Supabase   │
│         │    │ Enter code      │    Verify & join       │   Database   │
└─────────┘    └─────────────────┘                        └──────────────┘
```

---

## API Architecture

### Request/Response Flow

```
Request → Middleware → Rate Limit → Validation → Handler → Response
   │          │            │            │           │          │
   │          │            │            │           │          │
   ▼          ▼            ▼            ▼           ▼          ▼
Incoming   Security    Check limits  Zod schema  Business   JSON with
 HTTP      headers,    per client    validation  logic      standard
 request   CORS,       IP-based                             format
           patterns
```

### Standardized Response Format

All API routes use `lib/apiResponse.ts` helpers for consistent response envelopes.

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "meta": {
    "timestamp": "2026-02-03T10:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "meta": {
    "timestamp": "2026-02-03T10:00:00.000Z"
  }
}
```

### Rate Limiting Configuration

All API routes are rate-limited via `lib/rateLimit.ts`:

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Standard API (quiz) | 30 requests | 1 minute |
| AI Generation | 5 requests | 1 minute |
| Room Creation | 10 requests | 5 minutes |
| Standard (default) | 100 requests | 1 minute |

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Edge Middleware (middleware.ts)                   │
│  ├── CORS validation                                        │
│  ├── Suspicious pattern detection                           │
│  ├── User agent filtering                                   │
│  └── Security headers injection                             │
│                                                             │
│  Layer 2: Rate Limiting (lib/rateLimit.ts)                  │
│  ├── IP-based request counting                              │
│  ├── Configurable limits per endpoint type                  │
│  └── Auto-cleanup of expired entries                        │
│                                                             │
│  Layer 3: Input Validation (lib/validation.ts)              │
│  ├── Zod schema validation                                  │
│  ├── Type coercion and sanitization                         │
│  └── Field-level error messages                             │
│                                                             │
│  Layer 4: Application Security (lib/security.ts)            │
│  ├── XSS prevention (sanitizeString)                        │
│  ├── Request body size limits                               │
│  └── API key validation for admin routes                    │
│                                                             │
│  Layer 5: Database Security (Supabase RLS)                  │
│  ├── Row-level security policies                            │
│  ├── Service role for admin operations                      │
│  └── Anon key for public read access                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Security Headers (next.config.js)

| Header | Value | Purpose |
|--------|-------|---------|
| X-Frame-Options | DENY | Prevent clickjacking |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-XSS-Protection | 1; mode=block | XSS filter |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer |
| Permissions-Policy | camera=(), microphone=() | Disable features |
| HSTS | max-age=63072000 | Force HTTPS |

---

## Database Design

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    rooms     │       │   players    │       │  questions   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◀──────│ room_code    │       │ id (PK)      │
│ code (UK)    │       │ id (PK)      │       │ question_text│
│ status       │       │ name         │       │ options      │
│ max_players  │       │ avatar       │       │ correct_ans  │
│ host_id      │       │ is_host      │       │ category     │
│ created_at   │       │ score        │       │ difficulty   │
└──────────────┘       └──────────────┘       └──────────────┘
        │                                            │
        │              ┌──────────────┐              │
        └─────────────▶│game_sessions │◀─────────────┘
                       ├──────────────┤
                       │ id (PK)      │
                       │ room_code    │
                       │ question_id  │
                       │ start_time   │
                       │ end_time     │
                       └──────────────┘
```

### Row Level Security (RLS)

| Table | Read | Write | Update |
|-------|------|-------|--------|
| rooms | Anyone | Anyone | Service role only |
| players | Anyone | Anyone | Own records |
| questions | Anyone | Service role | Service role |
| game_sessions | Anyone | Service role | Service role |

---

## Future Architecture Considerations

### Scalability Path

1. **Redis for Rate Limiting** - Move from in-memory to distributed cache
2. **WebSockets** - Real-time multiplayer with Supabase Realtime
3. **Edge Functions** - Move AI generation to Supabase Edge Functions
4. **CDN Caching** - Cache static question pools at edge

### Monitoring (Implemented)

- Error tracking (Sentry — client, server, edge; gated on DSN env var)
- Structured logging (JSON in production, request ID tracing)
- Usage analytics (client-side, localStorage, privacy-first)
- Bundle analyzer (`@next/bundle-analyzer`, `npm run analyze`)

---

*Last updated: March 1, 2026 (Phase 24)*
