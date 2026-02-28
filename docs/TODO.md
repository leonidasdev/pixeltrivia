# PixelTrivia - TODO

> **Last Updated:** February 28, 2026
> **Project:** PixelTrivia - Retro-styled trivia game
> **Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase, OpenRouter AI

---

## Current Status

| Metric | Value |
|--------|-------|
| Test Suites | 61 |
| Tests | 1139 |
| Coverage (Statements) | 62.65% |
| Coverage (Branches) | 57.12% |
| Coverage (Functions) | 66.42% |
| Coverage (Lines) | 63.42% |
| TypeScript Errors | 0 |
| ESLint Errors | 0 |

---

## Remaining Tasks

### Priority 1: Testing

#### 1.1 Expand Test Coverage
- [x] Page tests: `select/page.tsx`, `quick/page.tsx`, `custom/page.tsx`, `advanced/page.tsx`
- [x] Component tests: `HelpButton.tsx`, `HelpContext.tsx`, UI components (`PixelButton`, `PixelCard`, `PixelInput`, `PixelBadge`)
- [x] API route tests: `/api/quiz/custom`, `/api/quiz/advanced`

#### 1.2 Raise Coverage Thresholds
- [x] Raised thresholds from 12-15% to 55-64% (branches 55%, functions 64%, lines 61%, statements 60%)
- [x] All thresholds now within 2-3% of actual coverage

---

### Priority 2: Infrastructure

#### 2.1 Production Logging
- [x] Enhanced logger with structured JSON output for production (parseable by CloudWatch, Datadog, Vercel Logs)
- [x] Added request ID tracking: `getRequestId()`, `logger.child(requestId)` for per-request tracing
- [x] Middleware assigns `x-request-id` header to all responses

#### 2.2 Rate Limiting
- [x] Added `RateLimitStore` provider interface for swappable backends
- [x] Added Upstash Redis store (`UpstashRateLimitStore`) — auto-enabled when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set
- [x] Falls back to in-memory store with production warning when Redis is not configured

#### 2.3 CSP Hardening
- [x] Made `CSP_DIRECTIVES` environment-aware: production removes `unsafe-eval` and `unsafe-inline` from `script-src`
- [x] Added `upgrade-insecure-requests` directive in production
- [x] Updated `buildCSP()` to handle value-less directives

#### 2.4 Enable ESLint During Builds
- [x] Set `ignoreDuringBuilds: false` in `next.config.js`
- [x] ESLint verified clean (0 warnings, 0 errors)

---

### Priority 3: Feature Backlog

#### 3.1 Game Features
- [x] Complete Advanced Game file upload processing (PDF, DOCX, TXT, MD parsing via `/api/upload`)
- [ ] Implement leaderboards
- [ ] Add achievements system
- [x] Add background music (procedural chiptune loops for menu, gameplay, results via Web Audio API)

#### 3.2 Performance
- [ ] Add API response caching (React Query or SWR)
- [x] Analyze bundle with `@next/bundle-analyzer` (installed and configured, `npm run analyze`)
- [x] Implement dynamic imports for game mode pages (select, quick, custom)

#### 3.3 Monitoring
- [x] Integrate error tracking (Sentry — client, server, edge configs; gated on DSN env var)
- [ ] Add usage analytics

#### 3.4 Database
- [x] Add migration tooling (Supabase migrations — `database/migrations/001_initial_schema.sql`)
- [x] Generate Supabase types (`npm run db:types`)
- [x] Add seed data scripts (`database/seed.sql` — 90+ questions across 12 categories)

---

## Completed Work

All items below have been completed and verified. See git history for details.

### Code Quality
- Critical TypeScript fixes (104 errors resolved)
- Unified Question types into canonical `types/game.ts`
- Standardized all API routes to use `lib/apiResponse` helpers
- Replaced biased array shuffles with Fisher-Yates
- Replaced deprecated `substr()` with `substring()` across codebase
- Replaced `console.error` with structured `logger` in production files
- Added `@module` / `@since` JSDoc headers to lib and hook files
- Dead code cleanup: removed unused exports from `gameApi`, `categories`, `difficulties`, `supabase`, `scoring`
- Removed obsolete TODO comments from page files
- Deleted redundant mock AI endpoint (`/api/ai/generate-questions`)

### Code Deduplication
- Unified `STORAGE_KEYS` into single source (`constants/game.ts`)
- Removed duplicate `ApiResponse` types from `lib/apiResponse.ts` (imports from `types/api.ts`)
- Unified `GAME_CATEGORIES` (`QuickGameSelector.tsx` imports from `constants/categories.ts`)
- Unified `KNOWLEDGE_LEVELS` (`CustomGameConfigurator.tsx` imports from `constants/difficulties.ts`)
- Standardized scoring logic into `lib/scoring.ts`
- Extracted shared utilities (`generateId`, `formatDuration`) into `lib/utils.ts`
- Unified room code constants (`lib/roomCode.ts` imports from `constants/game.ts`)

### Architecture
- Consolidated security headers and CORS origins (`middleware.ts` imports from `lib/security.core.ts`)
- Converted `DEFAULT_PROFILE` to factory function (`createDefaultProfile()`) to avoid stale timestamps
- Refactored `HelpModal` to use shared `ui/Modal` component
- Added `'use client'` directive to `AdvancedGameConfigurator.tsx`

### Tailwind CSS
- Added `borderWidth: { 3: '3px' }` to `tailwind.config.js` (fixes 14 `border-3` occurrences)
- Replaced dynamic `bg-${color}` / `text-${color}` with static color maps in `LoadingSpinner` and `AnimatedBackground`
- `bg-brown-500` replaced with `bg-amber-700` in `constants/avatars.ts`

### UI/UX
- Standardized UI: border widths, focus rings, button scales, heading sizes
- Pixel art consistency pass across all pages and components
- Centralized avatar constants and storage keys
- Toast notification system replacing all browser `alert()` calls
- Help system with context-aware modal and provider
- Accessibility: skip navigation, ARIA labels, keyboard navigation, reduced motion support

### Style Consistency
- Removed `rounded-lg` / `rounded-md` from 22 pixel-art components (14 files); kept on range sliders and circular elements
- Changed body default from `font-pixel` to `font-pixel-body`; added explicit `font-pixel` to 15 headings across 10 files
- Created shared `<Footer>` component; replaced duplicate copyright footers in 5 pages
- Added `titleClassName` prop to `Modal` for consumer title override

### Features
- Multiplayer system: room creation, joining, real-time sync, host controls
- Sound system: Web Audio API engine with 18 chiptune effects
- Background music: procedural chiptune loops for menu, gameplay, and results screens
- Stats dashboard with history, charts, and overview tabs
- Applied rate limiting to all API routes
- File upload processing: `lib/fileParser.ts` with PDF (pdf-parse), DOCX (mammoth), TXT, MD support
- Upload API: `/api/upload` endpoint with multipart/form-data handling and text extraction
- Advanced Game wired to real file upload (replaces mock content)

### Testing and CI
- 1139 tests across 61 suites (unit, component, hook, integration, E2E)
- Coverage thresholds enforced: branches 55%, functions 64%, lines 61%, statements 60%
- CI/CD pipeline: GitHub Actions, Husky pre-commit, lint-staged
- ESLint enforced during Next.js builds (`ignoreDuringBuilds: false`)
- Comprehensive documentation: 8 doc files + AUDIT.md + CLAUDE.md

### Infrastructure
- Structured JSON logging in production with request ID tracing (`lib/logger.ts`)
- `RateLimitStore` provider interface with Upstash Redis backend (`lib/rateLimit.ts`)
- Environment-aware CSP: production removes `unsafe-eval` / `unsafe-inline` from `script-src`
- Middleware assigns `x-request-id` on every response for distributed tracing
- Sentry error tracking: client, server, and edge configs (gated on `SENTRY_DSN` env var)
- Bundle analyzer: `@next/bundle-analyzer` configured, `npm run analyze` script
- Dynamic imports for heavy game configurator components (select, quick, custom pages)
- Database migration tooling: initial schema, seed data, `npm run db:types` for Supabase type generation

### Documentation
- Professional tone across all docs (emojis removed from documentation files)
- Corrected file references and directory trees in CLAUDE.md
- Fixed cross-references (CONTRIBUTING.md link in development-guide.md)
- Renamed `audit.md` to `AUDIT.md` for consistency with convention files

---

*Last reviewed: February 28, 2026*
