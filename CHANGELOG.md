# Changelog

All notable changes to PixelTrivia are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Version numbers follow the project's internal phase numbering (not semver) until a public release.

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
