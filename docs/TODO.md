# PixelTrivia - TODO

> **Last Updated:** February 28, 2026 (Phase 15 — Codebase Audit & Cleanup)
> **Project:** PixelTrivia - Retro-styled trivia game
> **Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase, OpenRouter AI

---

## Current Status

| Metric | Value |
|--------|-------|
| Test Suites | 64+ |
| Tests | 1222+ |
| Coverage (Statements) | ~62.65% |
| Coverage (Branches) | ~57.12% |
| Coverage (Functions) | ~66.42% |
| Coverage (Lines) | ~63.42% |
| TypeScript Errors | 0 |
| ESLint Errors | 0 |

---

## Remaining Tasks

### Priority 1: Code Quality & Consistency (from Phase 15 Audit)

#### 1.1 Type Consolidation
- [ ] Merge `DifficultyLevel` and `KnowledgeLevel` in `types/game.ts` — identical unions with different member order
- [ ] Resolve `Question` type conflict between `types/game.ts` (id: `number | string`, correctAnswer: `number`) and `lib/validation.ts` (id: `string`, correctAnswer: `string`)
- [ ] Align `QuickQuizResponse` / `CustomQuizResponse` shapes between `lib/quickQuizApi.ts` and `types/quiz.ts`
- [ ] Consolidate `GameSession` type between `lib/gameApi.ts` and `types/game.ts`

#### 1.2 Deduplication
- [ ] Extract shared Fisher-Yates shuffle from `lib/quickQuizApi.ts` and `hooks/useQuizSession.ts` into `lib/utils.ts` as `shuffleArray<T>()`
- [ ] Create shared `createSession()` factory in `lib/gameApi.ts` to replace near-identical session constructors in `quickQuizApi`, `customQuizApi`, and `gameApi`
- [ ] Abstract common API fetch/error-handling boilerplate into a generic `apiFetch<TReq, TRes>()` utility
- [ ] Fix `createCustomGameSession()` to use `generateId('custom')` instead of `custom_${Date.now()}`

#### 1.3 Validation Alignment
- [ ] Fix context max-length mismatch: `lib/customQuizApi.ts` allows 1000 chars vs `lib/validation.ts` allows 2000 chars
- [ ] Replace hardcoded valid levels in `lib/customQuizApi.ts` with import from `constants/difficulties.ts`
- [ ] Remove shadowed `KnowledgeLevel` re-declaration in `lib/validation.ts` (use canonical from `types/game.ts`)

#### 1.4 Logging Consistency
- [ ] Replace raw `console.warn()` in `hooks/useLocalStorage.ts` with structured `logger` (3 occurrences)

#### 1.5 Response Type Alignment
- [ ] Align `FetchQuestionsResponse` in `lib/gameApi.ts` with canonical `ApiResponse` from `types/api.ts`
- [ ] Align `GameHistoryEntry` in `lib/storage.ts` with session types from `types/game.ts`

---

### Priority 2: Architecture & Modularity

#### 2.1 Module Organization
- [ ] Create `lib/index.ts` barrel export for consistency with `types/`, `constants/`, `hooks/`
- [ ] Rename `app/components/Help/` to `app/components/help/` (PascalCase is inconsistent with `multiplayer/`, `stats/`, `ui/`)
- [ ] Move `useHelpContext` hook from `app/components/Help/HelpContext.tsx` into `hooks/` (or document the co-location pattern)

#### 2.2 Storage Architecture
- [ ] Evaluate moving `createStorage<T>()` from `hooks/useLocalStorage.ts` into its own `lib/createStorage.ts` file (different paradigm from React hook)

#### 2.3 API Consistency
- [ ] Add missing `noContentResponse`, `unauthorizedResponse`, `forbiddenResponse` usage or mark as intentionally unused public API
- [ ] Consider splitting `lib/apiResponse.ts` into response builders vs request parsers

---

### Priority 3: Testing & Coverage

#### 3.1 Coverage Gaps
- [ ] Add tests for `lib/leaderboard.ts` functions used only in production (currently tested but room for coverage growth)
- [ ] Add tests for `lib/storage.ts` `createStorage()` utility
- [ ] Test error boundaries with actual error scenarios (component integration tests)
- [ ] Add E2E tests for leaderboard and achievements pages

#### 3.2 Test Organization
- [ ] Review test file locations: some component tests are in `__tests__/components/` while others are at root

---

### Priority 4: Performance & Scalability

#### 4.1 Rendering Optimization
- [ ] Memoize `getAvailableHelpTabs()` in `HelpModal.tsx` (called on every render, used in `useEffect` deps)
- [ ] Add `useMemo`/`useCallback` to expensive computations in game state hooks
- [ ] Consider React Server Components for static game pages (mode, select)

#### 4.2 Bundle Size
- [ ] Audit `pdf-parse` and `mammoth` bundle sizes — consider lazy loading for upload page only
- [ ] Evaluate tree-shaking effectiveness of barrel exports

#### 4.3 Data Layer
- [ ] Move leaderboard/achievements from localStorage to Supabase for persistence across devices
- [ ] Implement server-side analytics aggregation
- [ ] Add Redis caching for frequently accessed question pools

---

### Priority 5: Features

#### 5.1 Authentication
- [ ] Add user authentication (Supabase Auth)
- [ ] Persist game history and achievements per user
- [ ] Add user profiles with avatar customization

#### 5.2 Social Features
- [ ] Global leaderboards (server-side)
- [ ] Share game results
- [ ] Challenge a friend mode

#### 5.3 Content
- [ ] Expand seed data beyond 90 questions
- [ ] Add question difficulty ratings based on player performance
- [ ] Support for image-based questions

#### 5.4 Mobile
- [ ] Responsive design audit and fixes
- [ ] PWA support (service worker, manifest)
- [ ] Touch gesture support for game interactions

---

### Priority 6: DevOps & Operations

#### 6.1 CI/CD Enhancements
- [ ] Add Lighthouse CI checks for performance regression
- [ ] Add bundle size tracking in PR checks
- [ ] Implement staging environment deployment

#### 6.2 Monitoring
- [ ] Configure Sentry release tracking and source maps
- [ ] Add performance monitoring dashboards
- [ ] Set up alerting for error rate spikes

#### 6.3 Documentation
- [ ] Add API versioning strategy documentation
- [ ] Create runbook for common operational tasks
- [ ] Add changelog (CHANGELOG.md) with version history

---

## Phase 15 Completed (Codebase Audit & Cleanup)

### Dead Code Removal
- Deleted orphaned `app/test/` directory (debug pages for CustomQuizApi and QuickQuizApi — security concern)
- Deleted empty `__tests__/api/quiz/` and `__tests__/api/` directories
- Removed unused `MenuPageLayout`, `ConfigPageLayout`, `ContentCard`, `ActionGroup` from `ui/GamePageLayout.tsx`
- Removed unused `SectionHeader` from `ui/PageHeader.tsx`
- Removed unused `LoadingDots` from `ui/LoadingSpinner.tsx`
- Removed unused `ScorePopupManager` from `ui/ScorePopup.tsx`
- Cleaned up `ui/index.ts` barrel exports to remove references to deleted components

### Consistency Fixes
- Converted `HelpButton.tsx` and `HelpModal.tsx` from default exports to named exports (matching project convention)
- Added JSDoc module headers to all 4 Help/ files (`HelpButton`, `HelpModal`, `HelpContext`, `index.ts`)
- Exported `HelpModalProps` type from barrel
- Updated all test imports from default to named imports (`HelpButton`, `HelpModal`)
- Updated test mocks from `default:` to named function mocks

### Documentation Updates
- Updated CLAUDE.md: test counts, directory tree, project status, feature list
- Updated TODO.md: comprehensive improvement roadmap from audit findings
- Updated architecture.md: current file listings, stats components, removed outdated references

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
- Leaderboard system: `lib/leaderboard.ts` with ranked entries, period/mode/category filtering, personal records
- Achievement system: `lib/achievements.ts` with 20 achievements across 4 tiers (bronze/silver/gold/platinum) and 4 categories
- Leaderboard page (`/game/leaderboard`) and Achievements page (`/game/achievements`) with full pixel-art UI
- API response caching: `lib/apiCache.ts` with SWR — typed hooks, 3 config presets, cache invalidation/priming
- Usage analytics: `lib/analytics.ts` — 13 event types, session detection, localStorage, privacy-first design
- Home page navigation updated with Ranks and Badges buttons

### Testing and CI
- 1222+ tests across 64+ suites (unit, component, hook, integration, E2E)
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

*Last reviewed: February 28, 2026 (Phase 15)*
