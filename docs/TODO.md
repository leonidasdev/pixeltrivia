# PixelTrivia - TODO

> **Last Updated:** February 28, 2026 (Phase 21 — Social Features, Touch Gestures, Adaptive Difficulty, Monitoring)
> **Project:** PixelTrivia - Retro-styled trivia game
> **Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase, OpenRouter AI

---

## Current Status

| Metric | Value |
|--------|-------|
| Test Suites | 72+ |
| Tests | 1327+ |
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
- [x] Merge `DifficultyLevel` and `KnowledgeLevel` in `types/game.ts` — `KnowledgeLevel` is now an alias of `DifficultyLevel`
- [x] Resolve `Question` type conflict — renamed to `ValidatedQuestion` in `lib/validation.ts` with JSDoc explaining intentional difference
- [x] Added `@see` cross-references between client-side response types and canonical API types
- [x] Consolidate `GameSession` type between `lib/gameApi.ts` and `types/game.ts` — renamed client variant to `ActiveGameSession` with `@deprecated` alias
- [x] Create shared `createSession()` factory — `lib/session.ts` with `createBaseSession<Q>()` and `BaseSessionFields<Q>` type; refactored `gameApi`, `quickQuizApi`, `customQuizApi`

#### 1.2 Deduplication
- [x] Extracted `shuffleArray<T>()` into `lib/utils.ts` — replaced 5 duplicate Fisher-Yates implementations
- [x] Fixed `createCustomGameSession()` to use `generateId('custom')` instead of `custom_${Date.now()}`
- [x] Abstracted common API fetch/error-handling boilerplate into `lib/apiFetch.ts` — refactored `gameApi`, `quickQuizApi`, `customQuizApi`, `roomApi`

#### 1.3 Validation Alignment
- [x] Fixed context max-length mismatch: `lib/customQuizApi.ts` now allows 2000 chars (aligned with `lib/validation.ts`)
- [x] Replaced hardcoded valid levels in `lib/customQuizApi.ts` with import from `constants/difficulties.ts`
- [x] Removed shadowed `KnowledgeLevel` re-declaration in `lib/validation.ts`

#### 1.4 Logging Consistency
- [x] Replaced all 3 `console.warn()` in `hooks/useLocalStorage.ts` with structured `logger`

#### 1.5 Response Type Alignment
- [x] Added `@see` JSDoc cross-references between `FetchQuestionsResponse`, `GameSession` in lib and canonical types
- [x] Added `@see` cross-references for `GameHistoryEntry` relating to runtime session and summary types

---

### Priority 2: Architecture & Modularity

#### 2.1 Module Organization
- [x] Created `lib/index.ts` barrel export for consistency with `types/`, `constants/`, `hooks/`
- [x] Renamed `app/components/Help/` to `app/components/help/` (all imports, mocks, and JSDoc updated)
- [x] Documented `useHelpContext` co-location pattern and re-exported from `hooks/index.ts`

#### 2.2 Storage Architecture
- [x] Evaluated: `createStorage<T>()` has zero production consumers — deferring extraction until usage grows

#### 2.3 API Consistency
- [x] Documented `noContentResponse`, `unauthorizedResponse`, `forbiddenResponse` as intentionally reserved (Supabase Auth, RBAC)
- [x] Evaluated: `lib/apiResponse.ts` at 362 lines is manageable; splitting deferred

---

### Priority 3: Testing & Coverage

#### 3.1 Coverage Gaps
- [x] Added `__tests__/unit/lib/utils.test.ts` — 14 tests for `generateId`, `formatDuration`, `shuffleArray`
- [x] `createStorage()` tests already exist in `__tests__/hooks/createStorage.test.ts`
- [x] Test error boundaries with actual error scenarios — `__tests__/integration/ErrorBoundary.test.tsx` with 11 tests
- [x] Add E2E tests for leaderboard and achievements pages — `tests/leaderboard-achievements.spec.ts`

#### 3.2 Test Organization
- [x] Renamed `__tests__/components/Help/` to `__tests__/components/help/` for consistency

---

### Priority 4: Performance & Scalability

#### 4.1 Rendering Optimization
- [x] Memoize `getAvailableHelpTabs()` in `HelpContext.tsx` — wrapped with `useCallback` keyed on `visitedRoutes`
- [x] Memoize available tabs in `HelpModal.tsx` — wrapped with `useMemo` keyed on `getAvailableHelpTabs`
- [x] Added `useMemo` for `playerInfo` and return value in `usePlayerSettings`
- [x] Consider React Server Components for static game pages — evaluated `mode/` and `select/` pages; both require heavy client-side interactivity (useState, useEffect, localStorage, event listeners); RSC conversion not viable

#### 4.2 Bundle Size
- [x] Audit `pdf-parse` and `mammoth` bundle sizes — already server-only (API route); converted to lazy `import()` in `lib/fileParser.ts` for better cold-start performance
- [x] Evaluate tree-shaking effectiveness — barrel exports use named `export { } from` pattern (not `export *`), which webpack tree-shakes correctly

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
- [x] Share game results — `lib/share.ts` with Web Share API + clipboard fallback, `ShareButton` component, wired into play page and Scoreboard
- [ ] Challenge a friend mode

#### 5.3 Content
- [x] Expand seed data beyond 90 questions — 150+ questions across all 40 categories and 3 difficulty levels
- [x] Add question difficulty ratings based on player performance — `lib/adaptiveDifficulty.ts` tracks per-category accuracy, `getRecommendedDifficulty()` computes adaptive level, wired into `addHistoryEntry()` and quick quiz API
- [ ] Support for image-based questions

#### 5.4 Mobile
- [x] Responsive design audit and fixes — touch targets raised to 44px minimum (WCAG), illegible text-[8px] bumped to text-[10px]+, responsive breakpoints added to titles/subtitles, grid columns made progressive
- [x] PWA support — added `public/manifest.json`, `Viewport` export, `appleWebApp` metadata in `layout.tsx`
- [x] Touch gesture support for game interactions — `hooks/useSwipe.ts` detects swipe direction with configurable threshold/timing, integrated into game mode and select pages for swipe-right-to-go-back

---

### Priority 6: DevOps & Operations

#### 6.1 CI/CD Enhancements
- [x] Add Lighthouse CI checks for performance regression — `lighthouserc.json` config with accessibility (error ≥0.9), performance (warn ≥0.7), best-practices (warn ≥0.8), SEO (warn ≥0.8); runs on PRs via `treosh/lighthouse-ci-action@v12`
- [x] Add bundle size tracking in PR checks — CI workflow now reports bundle size and uploads build artifacts
- [ ] Implement staging environment deployment

#### 6.2 Monitoring
- [x] Configure Sentry release tracking and source maps — release property in all 3 Sentry configs, `next.config.js` source map upload when `SENTRY_AUTH_TOKEN` is set, CI creates and finalises releases on main pushes
- [x] Add performance monitoring dashboards — `docs/monitoring.md` with dashboard widgets, key transactions, and sample rate guidance
- [x] Set up alerting for error rate spikes — `docs/monitoring.md` with 5 alert rules (high error volume, new unhandled, API latency, web vitals, rate-limit abuse)

#### 6.3 Documentation
- [x] Add API versioning strategy documentation — `docs/api-versioning.md` with URL-based strategy, migration guidelines, and implementation checklist
- [x] Create runbook for common operational tasks — `docs/runbook.md` covering dev, testing, deployment, database, monitoring, and common issues
- [x] Add changelog — `CHANGELOG.md` with version history from Phase 0 through Phase 18

---

## Phase 21 Completed (Social Features, Touch Gestures, Adaptive Difficulty, Monitoring)

### Share Game Results
- Created `lib/share.ts` — `generateShareText()` builds emoji-rich text with grade emoji, score bar, rank suffix, site URL; `shareResults()` uses Web Share API with clipboard fallback; `canNativeShare()` feature detection
- Created `app/components/ui/ShareButton.tsx` — pixel-styled green button with 44px min height, "Copied!" feedback, 2s timeout
- Wired `ShareButton` into multiplayer play page (finished screen) and Scoreboard component
- Added barrel exports to `app/components/ui/index.ts` and `lib/index.ts`
- Tests: 19 tests in `__tests__/unit/lib/share.test.ts` (all passing)

### Touch Gesture Support
- Created `hooks/useSwipe.ts` — detects swipe gestures with configurable threshold, maxDuration, and direction callbacks; supports `preventScroll` and `disabled` options
- Integrated into `app/game/mode/page.tsx` — swipe right to go back
- Integrated into `app/game/select/page.tsx` — swipe right to go back (context-aware: returns to mode select or previous page)
- Updated footer hints to mention swipe gesture
- Tests: 10 tests in `__tests__/hooks/useSwipe.test.ts` (all passing)

### Adaptive Difficulty Engine
- Created `lib/adaptiveDifficulty.ts` — tracks per-category accuracy in localStorage (sliding window of last 5 games), maps average accuracy to difficulty tier (college ≥90%, high-school ≥75%, middle-school ≥55%, elementary <55%)
- `recordCategoryPerformance()` auto-called from `addHistoryEntry()` in `lib/storage.ts`
- Extended `fetchQuickQuiz()` to accept optional `difficulty` parameter
- Extended `/api/quiz/quick` route to filter by difficulty when provided
- Public API: `getRecommendedDifficulty()`, `getAllCategoryPerformance()`, `clearCategoryPerformance()`
- Tests: 16 tests in `__tests__/unit/lib/adaptiveDifficulty.test.ts` (all passing)

### Monitoring Documentation
- Created `docs/monitoring.md` — comprehensive guide with Sentry alert rules (5 rules), performance monitoring, key transactions with expected latencies, dashboard widgets, incident response procedures, and maintenance checklists

---

## Phase 20 Completed (Content Expansion, Responsive Fixes, Lighthouse & Sentry)

### Content Expansion
- Expanded `database/schema.sql` from 25 to 150+ seed questions covering all 40 categories across elementary, middle-school, high-school, college, and classic difficulty levels
- Categories now covered: Colors & Shapes, Animals, Food, Numbers, Weather, Transportation, Body Parts, Basic Science, World Geography, Math Fundamentals, Literature, American History, Sports, Technology, Art & Music, Advanced Science, World History, Mathematics, English Literature, Chemistry, Physics, Biology, Government & Politics, Advanced Mathematics, Philosophy, Computer Science, Economics, Psychology, Engineering, Law & Ethics, General Knowledge, Pop Culture, History, Science, Geography, Entertainment, Nature

### Responsive Design Audit & Fixes
- **Touch targets**: Raised all button/input minimum heights to 44px (WCAG AA) — `PixelButton` sm/md sizes, `PixelInput` sm/md sizes, `QuickGameSelector` category/cancel buttons, `AdvancedGameConfigurator` file delete button, `PageHeader` back button, leaderboard filter/sort/mode buttons
- **Illegible text**: Bumped all `text-[8px]` instances to `text-[10px]` minimum (select page cards, QuickGameSelector footer)
- **Responsive text**: Added responsive breakpoints to `CustomGameConfigurator` title (`text-xl sm:text-3xl`), `PixelCard` title (`text-base sm:text-lg` + `truncate`), leaderboard heading (`text-lg sm:text-xl`)
- **Grid layouts**: Leaderboard personal records grid now uses progressive `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` (was jumping 2→5)
- **Bug fix**: `QuickGameSelector` section title had conflicting `text-lg text-xs` — fixed to `text-xs sm:text-sm`
- **Leaderboard filter/sort buttons**: Raised from ~22px to 44px minimum with `text-xs` (was `text-[10px]`)

### Lighthouse CI
- Created `lighthouserc.json` with desktop preset, auditing `/` and `/game/select`
- Score thresholds: accessibility ≥0.9 (error), performance ≥0.7 (warn), best-practices ≥0.8 (warn), SEO ≥0.8 (warn)
- Added `lighthouse` job to `.github/workflows/ci.yml` using `treosh/lighthouse-ci-action@v12` on pull requests

### Sentry Release Tracking
- Added `release` property to all 3 Sentry configs (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`) using `SENTRY_RELEASE` / `NEXT_PUBLIC_SENTRY_RELEASE` env vars
- Enhanced `next.config.js` `withSentryConfig` with `release.setCommits.auto`, source map upload, and `VERCEL_GIT_COMMIT_SHA` fallback
- Added CI step to create/finalise Sentry releases on main pushes when `SENTRY_AUTH_TOKEN` is configured
- Build step now passes `SENTRY_RELEASE`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` env vars

---

## Phase 19 Completed (Documentation, PWA & CI Enhancements)

### Documentation
- Created `CHANGELOG.md` — complete version history from Phase 0 (initial prototype) through Phase 18
- Created `docs/api-versioning.md` — URL-based versioning strategy, migration guidelines, implementation checklist
- Created `docs/runbook.md` — operational procedures for development, testing, deployment, database, monitoring, and troubleshooting

### PWA Support
- Added `public/manifest.json` with standalone display, theme colour, and icon configuration
- Added `Viewport` export and `appleWebApp` metadata to `app/layout.tsx`

### CI Enhancements
- Enhanced `.github/workflows/ci.yml` with bundle size reporting (GitHub Step Summary) and build artifact uploads

---

## Phase 18 Completed (Session Factory & Bundle Optimisation)

### Shared Session Factory
- Created `lib/session.ts` — `createBaseSession<Q>()` factory and `BaseSessionFields<Q>` type
- Refactored `createGameSession()`, `createQuickQuizSession()`, `createCustomGameSession()` to spread from `createBaseSession`
- Added `createBaseSession` and `BaseSessionFields` to `lib/index.ts` barrel export
- Added `__tests__/unit/lib/session.test.ts` — 10 tests (field presence, prefix, uniqueness, generics, spread)

### RSC Evaluation
- Evaluated `/game/mode` and `/game/select` for React Server Component conversion
- Both pages require `useState`, `useEffect`, `useCallback`, `useRouter`, `useSearchParams`, `localStorage` — RSC not viable

### Bundle Optimisation
- Converted `pdf-parse` and `mammoth` from eager top-level imports to lazy `import()` in `lib/fileParser.ts`
- Updated `__tests__/unit/lib/fileParser.test.ts` mocks to use `__esModule: true` + `default` export for dynamic import compatibility
- Confirmed barrel exports use named `export { }` pattern — tree-shakeable by webpack

---

## Phase 17 Completed (API Abstraction & Performance)

### API Abstraction
- Created `lib/apiFetch.ts` — generic, type-safe `apiFetch<T>()` utility replacing duplicated try/catch/response.json boilerplate
- Refactored 4 client API modules to use `apiFetch`: `gameApi.ts`, `quickQuizApi.ts`, `customQuizApi.ts`, `roomApi.ts`
- Added `apiFetch` and types (`ApiClientResponse`, `ApiFetchOptions`) to `lib/index.ts` barrel export

### Type Consolidation
- Renamed `GameSession` in `lib/gameApi.ts` to `ActiveGameSession` — lightweight client variant with `@see` linking to canonical type
- Added `@deprecated` alias `GameSession = ActiveGameSession` for backward compatibility

### Performance
- Memoized `getAvailableHelpTabs()` in `HelpContext.tsx` with `useCallback` keyed on `visitedRoutes`
- Memoized filtered tabs in `HelpModal.tsx` with `useMemo` keyed on `getAvailableHelpTabs`
- Added `useMemo` for `playerInfo` and return value in `usePlayerSettings`

### P2 Evaluations
- `createStorage<T>()`: zero production consumers — extraction deferred
- `lib/apiResponse.ts`: 362 lines, manageable — split deferred

### Testing
- Added `__tests__/unit/lib/apiFetch.test.ts` — 13 tests covering success, errors, methods, body handling
- Added `__tests__/integration/ErrorBoundary.test.tsx` — 11 tests with realistic error scenarios (TypeError, data-driven, deep trees, user-triggered, nested boundaries, sibling isolation)
- Added `tests/leaderboard-achievements.spec.ts` — 13 E2E tests for Playwright
- Total: 68 suites, 1263 tests passing

---

## Phase 16 Completed (Code Quality & Architecture)

### Type Consolidation
- Merged `KnowledgeLevel` as alias of `DifficultyLevel` in `types/game.ts`
- Renamed shadowed `Question` type to `ValidatedQuestion` in `lib/validation.ts` with JSDoc documenting intentional difference
- Removed shadowed `KnowledgeLevel` re-declaration from `lib/validation.ts`

### Deduplication
- Extracted `shuffleArray<T>()` into `lib/utils.ts` — replaced 5 duplicate Fisher-Yates implementations across:
  - `lib/quickQuizApi.ts`, `hooks/useQuizSession.ts`, `app/api/game/questions/route.ts`, `app/api/quiz/quick/route.ts`, `app/api/room/[code]/start/route.ts`
- Fixed `createCustomGameSession()` to use `generateId('custom')` instead of `custom_${Date.now()}`

### Validation & Consistency
- Aligned context max-length: `lib/customQuizApi.ts` now allows 2000 chars (matching `lib/validation.ts`)
- Replaced hardcoded valid levels in `lib/customQuizApi.ts` with import from `constants/difficulties.ts`
- Replaced all `console.warn()` in `hooks/useLocalStorage.ts` with structured `logger`
- Added `@see` JSDoc cross-references between client-side and canonical response/session types

### Architecture
- Created `lib/index.ts` barrel export (utilities, errors, API clients, storage, validation)
- Renamed `app/components/Help/` → `app/components/help/` (consistent with `ui/`, `stats/`, `multiplayer/`)
- Renamed `__tests__/components/Help/` → `__tests__/components/help/`
- Re-exported `useHelpContext` from `hooks/index.ts` for discoverability (co-located with provider)
- Documented intentionally unused API response helpers (`noContentResponse`, `unauthorizedResponse`, `forbiddenResponse`)

### Testing
- Added `__tests__/unit/lib/utils.test.ts` — 14 tests covering `generateId`, `formatDuration`, `shuffleArray`
- Updated `customQuizApi.test.ts` to match new 2000-char context limit
- Total: 66 suites, 1236 tests passing

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

*Last reviewed: February 28, 2026 (Phase 17)*
