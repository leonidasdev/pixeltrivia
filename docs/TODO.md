# PixelTrivia - TODO

> **Last Updated:** February 28, 2026
> **Project:** PixelTrivia - Retro-styled trivia game
> **Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase, OpenRouter AI

---

## Current Status

| Metric | Value |
|--------|-------|
| Test Suites | 48 |
| Tests | 899 |
| TypeScript Errors | 0 |
| ESLint Errors | 0 |

---

## Remaining Tasks

### Priority 1: Code Deduplication

These items were identified in the codebase audit and have not yet been addressed.

#### 1.1 Unify Storage Keys
- [ ] Merge `STORAGE_KEYS` from `lib/storage.ts` and `constants/game.ts` into a single source
- [ ] Replace hardcoded `'pixeltrivia_player_name'` in `app/game/join/page.tsx` with constant import

#### 1.2 Remove Duplicate API Response Types
- [ ] Delete `ApiSuccessResponse` / `ApiErrorResponse` from `lib/apiResponse.ts`
- [ ] Import from `types/api.ts` instead

#### 1.3 Unify Game Categories
- [ ] Remove inline `GAME_CATEGORIES` copy in `QuickGameSelector.tsx`
- [ ] Import from `constants/categories.ts`
- [ ] Fix `'college-level'` vs `'college'` key mismatch

#### 1.4 Unify Knowledge Levels
- [ ] Remove inline `KNOWLEDGE_LEVELS` in `CustomGameConfigurator.tsx`
- [ ] Import from `constants/difficulties.ts`

#### 1.5 Standardize Scoring Logic
- [ ] Extract `calculateScore()` to `lib/scoring.ts`
- [ ] Replace separate implementations in `gameApi.ts`, `quickQuizApi.ts`, and `useQuizSession.ts`

#### 1.6 Extract Shared Utilities
- [ ] Move `formatDuration()` from `StatsOverview.tsx` / `GameHistoryList.tsx` to `lib/formatters.ts`
- [ ] Move `generateId()` pattern to `lib/utils.ts` (used in 5 files)

#### 1.7 Unify Room Code Constants
- [ ] Import character set and code length in `lib/roomCode.ts` from `constants/game.ts`

---

### Priority 2: Architecture Improvements

#### 2.1 Consolidate Security Headers
- [ ] Security headers defined in both `middleware.ts` and `next.config.js`
- [ ] Choose one location; remove the other

#### 2.2 Consolidate CORS Origins
- [ ] Allowed origins duplicated in `middleware.ts` and `lib/security.core.ts`
- [ ] Read from a single environment variable

#### 2.3 Fix Default Profile Factory
- [ ] `DEFAULT_PROFILE` in `lib/storage.ts` uses `new Date()` at module parse time
- [ ] Convert to a factory function to avoid stale timestamps

#### 2.4 Refactor HelpModal
- [ ] `HelpModal.tsx` reimplements modal logic (escape key, scroll lock, backdrop)
- [ ] Refactor to use shared `ui/Modal.tsx` component

#### 2.5 Add `'use client'` Directive
- [ ] `AdvancedGameConfigurator.tsx` uses `useState` but lacks `'use client'`

---

### Priority 3: Tailwind CSS Fixes

#### 3.1 Fix Non-Standard Classes
- [ ] `border-3` is not a default Tailwind class (14 occurrences)
- [ ] Either add `borderWidth: { 3: '3px' }` to config or standardize on `border-2` / `border-4`
- [ ] `bg-brown-500` in `constants/avatars.ts` has no effect; replace with `bg-amber-700`

#### 3.2 Add Safelist for Dynamic Classes
- [ ] Dynamic `bg-${color}` / `text-${color}` patterns cannot be tree-shaken
- [ ] Add a `safelist` array to `tailwind.config.js`

#### 3.3 Style Consistency
- [ ] Replace `rounded-lg` with square corners in pixel-art components for consistency
- [ ] Standardize `font-pixel` / `font-pixel-body` usage across all game pages
- [ ] Create shared `<Footer>` component to replace duplicate copyright lines

---

### Priority 4: Testing

#### 4.1 Expand Test Coverage
- [ ] Page tests: `select/page.tsx`, `quick/page.tsx`, `custom/page.tsx`, `advanced/page.tsx`
- [ ] Component tests: `HelpButton.tsx`, `HelpContext.tsx`, UI components (`PixelButton`, `PixelCard`, `PixelInput`, `PixelBadge`)
- [ ] API route tests: `/api/quiz/custom`, `/api/quiz/advanced`

#### 4.2 Raise Coverage Thresholds
- [ ] Current thresholds are low (branches 12%, functions/lines/statements 15%)
- [ ] Raise incrementally toward 60%+ for lines and statements

---

### Priority 5: Infrastructure

#### 5.1 Production Logging
- [ ] Evaluate pino or winston for production server-side logging
- [ ] Add request ID tracking for API routes

#### 5.2 Rate Limiting
- [ ] In-memory `Map` rate limiter does not persist across serverless invocations
- [ ] Evaluate Redis-backed solution (Upstash) for production

#### 5.3 CSP Hardening
- [ ] Remove `unsafe-eval` and `unsafe-inline` from CSP in production
- [ ] Currently in `lib/security.core.ts`

#### 5.4 Enable ESLint During Builds
- [ ] `next.config.js` has `ignoreDuringBuilds: true`
- [ ] Set to `false` in CI/production

---

### Priority 6: Feature Backlog

#### 6.1 Game Features
- [ ] Complete Advanced Game file upload processing
- [ ] Implement leaderboards
- [ ] Add achievements system
- [ ] Add background music

#### 6.2 Performance
- [ ] Add API response caching (React Query or SWR)
- [ ] Analyze bundle with `@next/bundle-analyzer`
- [ ] Implement dynamic imports for game mode pages

#### 6.3 Monitoring
- [ ] Integrate error tracking (Sentry)
- [ ] Add usage analytics

#### 6.4 Database
- [ ] Add migration tooling (Supabase migrations)
- [ ] Generate Supabase types
- [ ] Add seed data scripts

---

## Completed Work

All items below have been completed and verified. See git history for details.

- Critical TypeScript fixes (104 errors resolved)
- Unified Question types into canonical `types/game.ts`
- Standardized all API routes to use `lib/apiResponse` helpers
- Replaced biased array shuffles with Fisher-Yates
- Centralized avatar constants and storage keys
- Applied rate limiting to all API routes
- Replaced `console.error` with structured `logger` in production files
- Replaced deprecated `substr()` with `substring()` across codebase
- Added `@module` / `@since` JSDoc headers to lib and hook files
- Standardized UI: border widths, focus rings, button scales, heading sizes
- Multiplayer system: room creation, joining, real-time sync, host controls
- Sound system: Web Audio API engine with 18 chiptune effects
- Pixel art consistency pass across all pages and components
- Stats dashboard with history, charts, and overview tabs
- 899 tests across 48 suites (unit, component, hook, integration, E2E)
- CI/CD pipeline: GitHub Actions, Husky pre-commit, lint-staged
- Comprehensive documentation: 8 doc files covering architecture, API, testing, deployment
- Accessibility: skip navigation, ARIA labels, keyboard navigation, reduced motion support
- Toast notification system replacing all browser `alert()` calls
- Help system with context-aware modal and provider

---

*Last reviewed: February 28, 2026*
