# PixelTrivia - TODO

> **Last Updated:** February 28, 2026
> **Project:** PixelTrivia - Retro-styled trivia game
> **Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase, OpenRouter AI

---

## Current Status

| Metric | Value |
|--------|-------|
| Test Suites | 48 |
| Tests | 899+ |
| TypeScript Errors | 0 |
| ESLint Errors | 0 |

---

## Remaining Tasks

### Priority 1: Style Consistency

#### 1.1 Pixel-Art Corner Consistency
- [ ] Audit `rounded-lg` / `rounded-md` usage in pixel-art components
- [ ] Replace with square corners (`rounded-none`) or `rounded-sm` where appropriate

#### 1.2 Font Usage Audit
- [ ] Standardize `font-pixel` (headings/labels) vs `font-pixel-body` (body text) across all game pages

#### 1.3 Shared Footer Component
- [ ] Extract duplicate copyright lines into a shared `<Footer>` component

---

### Priority 2: Testing

#### 2.1 Expand Test Coverage
- [ ] Page tests: `select/page.tsx`, `quick/page.tsx`, `custom/page.tsx`, `advanced/page.tsx`
- [ ] Component tests: `HelpButton.tsx`, `HelpContext.tsx`, UI components (`PixelButton`, `PixelCard`, `PixelInput`, `PixelBadge`)
- [ ] API route tests: `/api/quiz/custom`, `/api/quiz/advanced`

#### 2.2 Raise Coverage Thresholds
- [ ] Current thresholds are low (branches 12%, functions/lines/statements 15%)
- [ ] Raise incrementally toward 60%+ for lines and statements

---

### Priority 3: Infrastructure

#### 3.1 Production Logging
- [ ] Evaluate pino or winston for production server-side logging
- [ ] Add request ID tracking for API routes

#### 3.2 Rate Limiting
- [ ] In-memory `Map` rate limiter does not persist across serverless invocations
- [ ] Evaluate Redis-backed solution (Upstash) for production

#### 3.3 CSP Hardening
- [ ] Remove `unsafe-eval` and `unsafe-inline` from CSP in production
- [ ] Currently in `lib/security.core.ts`

#### 3.4 Enable ESLint During Builds
- [ ] `next.config.js` has `ignoreDuringBuilds: true`
- [ ] Set to `false` in CI/production

---

### Priority 4: Feature Backlog

#### 4.1 Game Features
- [ ] Complete Advanced Game file upload processing
- [ ] Implement leaderboards
- [ ] Add achievements system
- [ ] Add background music

#### 4.2 Performance
- [ ] Add API response caching (React Query or SWR)
- [ ] Analyze bundle with `@next/bundle-analyzer`
- [ ] Implement dynamic imports for game mode pages

#### 4.3 Monitoring
- [ ] Integrate error tracking (Sentry)
- [ ] Add usage analytics

#### 4.4 Database
- [ ] Add migration tooling (Supabase migrations)
- [ ] Generate Supabase types
- [ ] Add seed data scripts

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

### Features
- Multiplayer system: room creation, joining, real-time sync, host controls
- Sound system: Web Audio API engine with 18 chiptune effects
- Stats dashboard with history, charts, and overview tabs
- Applied rate limiting to all API routes

### Testing and CI
- 899+ tests across 48 suites (unit, component, hook, integration, E2E)
- CI/CD pipeline: GitHub Actions, Husky pre-commit, lint-staged
- Comprehensive documentation: 8 doc files + AUDIT.md + CLAUDE.md

### Documentation
- Professional tone across all docs (emojis removed from documentation files)
- Corrected file references and directory trees in CLAUDE.md
- Fixed cross-references (CONTRIBUTING.md link in development-guide.md)
- Renamed `audit.md` to `AUDIT.md` for consistency with convention files

---

*Last reviewed: February 28, 2026*
