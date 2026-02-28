# Changelog

All notable changes to PixelTrivia are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Version numbers follow the project's internal phase numbering (not semver) until a public release.

---

## [Phase 21] - 2026-02-28

### Added
- `lib/share.ts` — share game results via Web Share API with clipboard fallback; `generateShareText()`, `canNativeShare()`, `shareResults()` with emoji grade, score bar, and rank suffix
- `app/components/ui/ShareButton.tsx` — pixel-styled share button with "Copied!" feedback (44px min height)
- `hooks/useSwipe.ts` — touch swipe gesture detection hook with configurable threshold, maxDuration, and per-direction callbacks
- `lib/adaptiveDifficulty.ts` — adaptive difficulty engine tracking per-category accuracy in localStorage; sliding window of last 5 games maps to difficulty tiers (college ≥90%, high-school ≥75%, middle-school ≥55%, elementary <55%)
- `docs/monitoring.md` — Sentry alerting and monitoring guide with 5 alert rules, performance monitoring, key transactions, dashboard widgets, incident response, and maintenance checklists
- 45 new tests: share (19), useSwipe (10), adaptiveDifficulty (16)

### Changed
- `lib/storage.ts`: `addHistoryEntry()` now feeds `recordCategoryPerformance()` for adaptive difficulty tracking
- `lib/quickQuizApi.ts`: `fetchQuickQuiz()` accepts optional `difficulty` parameter
- `app/api/quiz/quick/route.ts`: filters by difficulty when provided (skips for 'classic')
- `app/game/mode/page.tsx`: swipe right to go back, updated footer hint
- `app/game/select/page.tsx`: swipe right to go back (context-aware), updated footer hint
- `app/game/play/[code]/page.tsx`: added ShareButton to finished game screen alongside VIEW STATS
- `app/components/multiplayer/Scoreboard.tsx`: added `totalQuestions` and `category` props, ShareButton import
- Barrel exports updated in `hooks/index.ts`, `lib/index.ts`, `app/components/ui/index.ts`

---

## [Phase 20] - 2026-02-28

### Added
- 125+ new seed questions in `database/schema.sql` (total now 150+), covering all 40 categories across elementary, middle-school, high-school, college, and classic difficulty levels
- `lighthouserc.json` — Lighthouse CI configuration with desktop preset, threshold assertions (accessibility ≥0.9 error, performance ≥0.7 warn, best-practices ≥0.8 warn, SEO ≥0.8 warn)
- Lighthouse CI job in `.github/workflows/ci.yml` using `treosh/lighthouse-ci-action@v12` on pull requests
- Sentry release creation step in CI — creates and finalises releases on main pushes when `SENTRY_AUTH_TOKEN` is configured
- `release` property in all 3 Sentry configs for commit association

### Changed
- **PixelButton**: `sm` min-height raised from 32px to 44px, `md` from 40px to 44px (WCAG AA touch targets)
- **PixelInput**: `sm`/`md` sizes now include `min-h-[44px]` for accessible touch targets
- **PixelCard**: title now uses responsive `text-base sm:text-lg` with `truncate` for overflow protection
- **PageHeader**: back button padding increased to `p-3` with `min-w-[44px] min-h-[44px]`
- **QuickGameSelector**: fixed conflicting `text-lg text-xs` bug on section titles; category buttons and cancel button now have `min-h-[44px]`; footer text bumped from `text-[8px]` to `text-[10px]`
- **CustomGameConfigurator**: title now responsive `text-xl sm:text-3xl`
- **AdvancedGameConfigurator**: file delete button enlarged to `min-w-[44px] min-h-[44px]`
- **Leaderboard page**: filter/sort buttons raised from ~22px to 44px with `text-xs`; mode select dropdown to 44px; personal records grid uses progressive `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`; heading now responsive
- **Select page**: all `text-[8px]` card details bumped to `text-[10px]`
- `next.config.js`: enhanced `withSentryConfig` with `release.setCommits.auto`, source map upload gating, `VERCEL_GIT_COMMIT_SHA` fallback
- CI build step now passes Sentry environment variables (`SENTRY_RELEASE`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`)

### Fixed
- Touch targets across 10+ components now meet WCAG AA minimum of 44×44px
- Illegible `text-[8px]` text replaced in 4 locations
- QuickGameSelector section title CSS conflict (`text-lg` overriding `text-xs`)

---

## [Phase 18] - 2026-02-28

### Added
- `lib/session.ts` — shared `createBaseSession<Q>()` factory and `BaseSessionFields<Q>` type
- `__tests__/unit/lib/session.test.ts` — 10 tests for the session factory

### Changed
- Refactored `createGameSession()`, `createQuickQuizSession()`, and `createCustomGameSession()` to use `createBaseSession`
- Converted `pdf-parse` and `mammoth` from eager top-level imports to lazy `import()` in `lib/fileParser.ts`
- Updated `__tests__/unit/lib/fileParser.test.ts` mocks for dynamic import compatibility
- Evaluated RSC for `/game/mode` and `/game/select` — not viable (heavy client-side interactivity)
- Confirmed barrel exports are tree-shakeable (named `export {}` pattern)

## [Phase 17] - 2026-02-28

### Added
- `lib/apiFetch.ts` — generic, type-safe `apiFetch<T>()` fetch wrapper with structured error logging
- `__tests__/unit/lib/apiFetch.test.ts` — 13 tests for the fetch utility
- `__tests__/integration/ErrorBoundary.test.tsx` — 11 integration tests for error boundaries
- `tests/leaderboard-achievements.spec.ts` — 13 Playwright E2E tests for leaderboard and achievements pages

### Changed
- Refactored `gameApi`, `quickQuizApi`, `customQuizApi`, `roomApi` to use `apiFetch` instead of duplicated fetch boilerplate
- Consolidated `GameSession` type — renamed to `ActiveGameSession` with `@deprecated` alias for backward compat
- Added `useCallback`/`useMemo` memoization to `HelpContext.tsx`, `HelpModal.tsx`, and `usePlayerSettings.ts`

## [Phase 16] - 2026-02-28

### Changed
- Type consolidation: `KnowledgeLevel` aliased to `DifficultyLevel`, `Question` renamed to `ValidatedQuestion` in validation
- Extracted `shuffleArray<T>()` into `lib/utils.ts`, replacing 5 duplicate Fisher-Yates implementations
- Extracted `generateId()` into `lib/utils.ts`, used by session factories
- Validation alignment: 2000-char context limit, constants-driven knowledge levels
- Logging consistency: replaced `console.warn` with structured `logger` across hooks
- Created `lib/index.ts` barrel export; renamed `Help/` to `help/`

### Added
- `__tests__/unit/lib/utils.test.ts` — 14 tests for `generateId`, `formatDuration`, `shuffleArray`

## [Phase 15] - 2026-02-28

### Changed
- Codebase audit: dead code removal, Help components converted to named exports
- JSDoc headers added to all library modules
- Documentation updated across `docs/` directory

## [Phase 14] - 2026-02-28

### Added
- Leaderboards page with period filtering and sort options
- Achievements system with 20+ unlockable achievements
- SWR caching layer (`lib/apiCache.ts`) for API responses
- Usage analytics tracking (`lib/analytics.ts`)

## [Phase 13] - 2026-02-28

### Added
- File upload processing: `lib/fileParser.ts` with PDF, DOCX, TXT, Markdown support
- Dead code cleanup pass

## [Phase 12] - 2026-02-28

### Added
- Background music system with dynamic imports
- Sentry error tracking integration
- Bundle analyzer configuration
- Database migration scripts

## [Phase 11] - 2026-02-28

### Added
- Production logging system (`lib/logger.ts`)
- Rate limiting provider with sliding-window algorithm
- Content Security Policy (CSP) headers
- ESLint enforcement in production builds

## [Phase 10] - 2026-02-28

### Changed
- Expanded test coverage to 1122 tests across 60 suites

## [Phase 9] - 2026-02-28

### Changed
- Pixel-art consistency pass: rounded corners, font sizes, footer styling
- Consolidated architecture and Tailwind configuration

## [Phase 8] - 2026-02-28

### Changed
- Code quality pass: JSDoc documentation, UI consistency, 210+ new tests
- Deduplicated code, professionalised documentation

## [Phase 7] - 2026-02-27

### Added
- Game history and stats dashboard (`/game/stats`)
- `lib/storage.ts` for persistent game history

## [Phase 6] - 2026-02-27

### Changed
- Pixel-art style consistency pass across all UI components

## [Phase 5] - 2026-02-27

### Added
- Visual effects system (sparkles, page transitions, loading overlays)
- Chiptune sound system (`hooks/useSound.ts`, `lib/soundManager.ts`)

## [Phase 4] - 2026-02-27

### Added
- Complete multiplayer system with room creation and joining
- Room code generation (`lib/roomCode.ts`)
- Room API (`lib/roomApi.ts`)

## [Phase 3] - 2026-02-27

### Added
- Complete UI/UX quality improvements
- Test coverage expansion

## [Phase 2] - 2026-02-01

### Added
- E2E tests with Playwright
- Enhanced linting and documentation

### Changed
- Modularised and deduplicated codebase
- Stronger type safety across components

## [Phase 1] - 2026-01-31

### Added
- Initial test suite, linting configuration, and documentation

## [Phase 0] - 2025-06-24

### Added
- Initial front-end prototype
- MIT License
