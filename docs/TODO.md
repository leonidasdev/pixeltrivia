# PixelTrivia - TODO

> **Last Updated:** June 2025
> **Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase, OpenRouter AI

---

## Current Status

| Metric | Value |
|--------|-------|
| Test Suites | 110 |
| Tests | 1,906 |
| Coverage (Statements) | ~88% |
| Coverage (Branches) | ~82% |
| Coverage (Functions) | ~89% |
| Coverage (Lines) | ~89% |
| TypeScript Errors | 0 |
| ESLint Errors | 0 |
| `any` in prod code | 0 |

---

## Tasks Requiring External Tools / User Action

These cannot be automated via code changes. They require Supabase dashboard,
hosting provider, or third-party service configuration.

### Supabase (Dashboard / SQL Editor)

- [ ] **Fix overly permissive RLS on `players` table** — `FOR UPDATE USING (true)` lets any
  anonymous user update any player row. Restrict to the player's own row via session token or
  `auth.uid()` match.
- [ ] **Fix `host_player_id` type mismatch** — `rooms.host_player_id` is `UUID` but `players.id`
  is `BIGSERIAL`. Add an FK constraint or unify the ID types.
- [ ] **Add `updated_at` columns** to `rooms` and `players` tables (with auto-update trigger)
  for debugging timing issues.
- [ ] **Add unique constraint on `questions.question_text`** to prevent duplicate seed data on
  re-runs.
- [ ] **Audit `game_sessions.current_question_id` usage** — FK to `questions` exists but appears
  unused by the multiplayer flow (uses `game_questions` instead). Drop if unnecessary.
- [ ] **Configure Upstash Redis** for production rate limiting. The in-memory rate-limit store
  resets on serverless cold starts, making it ineffective on Vercel without Redis.

### CI/CD & Hosting

- [ ] **Add Playwright E2E job to CI** — `playwright.config.ts` and specs exist but no CI job
  runs `test:e2e`. Add a job that starts the dev server and runs `npx playwright test`.
- [ ] **Add security scanning to CI** — integrate Dependabot, CodeQL, or `npm audit` as a
  workflow step.
- [ ] **Set up staging/preview environment** — currently no deployment pipeline in CI; relies on
  implicit Vercel GitHub integration. Consider explicit preview deploy on PRs.
- [ ] **Add branch protection rules** on `main` — require passing CI, at least 1 review, and
  no force pushes.
- [ ] **Fix CI build env vars** — CI uses placeholder values for Supabase URL/keys. Build won't
  catch env-dependent compilation issues.

### Environment & Secrets

- [ ] **Update `.env.example`** — missing `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN`, `UPSTASH_REDIS_REST_URL` /
  `UPSTASH_REDIS_REST_TOKEN`, and `NEXT_PUBLIC_SITE_URL`.

---

## Code Tasks (Automatable)

Ordered by priority: critical bugs and architecture first, then quality improvements.

### P0 — Critical / Architecture

- [x] **Refactor `play/page.tsx` (557 lines)** — extracted `ResultsScreen` to
  `app/components/game/ResultsScreen.tsx`, shared question styles to `questionStyles.ts`,
  barrel export via `index.ts`. Page reduced ~110 lines. *(commit b8b8eaf)*
- [x] **Deduplicate question display** — extracted shared `OPTION_COLORS`, `getTimerColor`,
  `getTimerAnimation`, `getOptionStyle` into `app/components/game/questionStyles.ts`. Used by
  both `play/page.tsx` and `GameQuestion.tsx`. *(commit b8b8eaf)*
- [x] **Extract `saveGameSession()` utility** — added `saveGameSession()`,
  `saveMultiplayerSession()`, `loadMultiplayerSession()`, `clearMultiplayerSession()` to
  `lib/gameApi.ts`. Used by all solo/multiplayer game pages. *(commit b8b8eaf)*
- [x] **Use `withErrorHandling` wrapper in API routes** — all 11 API routes now wrapped.
  Generalized with generic type param for dynamic route params. Added SyntaxError -> 400
  handling. Preserved ExternalAPIError 502 in quiz/custom. *(commit b8b8eaf)*

### P1 — Code Quality

- [ ] **Adopt `GamePageLayout` consistently** — 7 game pages bypass it and reinvent layout
  structure (play, leaderboard, achievements, select, stats, mode, lobby). Extract a
  `ListPageLayout` variant for leaderboard/achievements (nearly identical layout code).
- [x] **Extract multiplayer session helpers** — `saveMultiplayerSession()`,
  `loadMultiplayerSession()`, `clearMultiplayerSession()` added to `lib/gameApi.ts`. All
  multiplayer pages updated. *(commit b8b8eaf)*
- [ ] **Move duplicated types to `types/`** — `app/api/quiz/custom/route.ts` declares
  `CustomQuizRequest`, `QuizQuestion`, and `OpenRouterResponse` locally instead of importing
  from `types/quiz.ts`.
- [ ] **Use Zod in API routes** — Zod is a dependency and `lib/validation.ts` defines schemas,
  but API routes still use manual `if` checks for validation. Wire up the existing Zod schemas.
- [x] **Fix 9 `exhaustive-deps` ESLint suppressions** — fixed 5 (play/page.tsx timer/history
  effects, lobby/play error effects). Remaining 4 kept with detailed comments explaining why
  deps are intentionally excluded (unstable timer ref, mount-only effects). *(commit b8b8eaf)*
- [x] **Fix `useGameState.submitAnswer` stale closure** — added `useRef` pattern:
  `gameStateRef.current = gameState` synced on every render. `submitAnswer`, `getCurrentQuestion`,
  `getSummary` now read from ref. *(commit b8b8eaf)*
- [x] **Fix JSON parse error inconsistency** — `withErrorHandling` now catches `SyntaxError`
  globally (returns 400). `room/create` inner try/catch documented for backward compat.
  *(commit b8b8eaf)*
- [x] **Add `displayName` to `forwardRef` components** — already done in prior session
  (commit 5052c48).
- [x] **Report to Sentry from `error.tsx`** — added `Sentry.captureException(error)` to both
  `error.tsx` and `global-error.tsx` via `useEffect`. *(commit b8b8eaf)*

### P2 — Testing

- [ ] **Add tests for `useMultiplayerGame` hook** — complex hook with Supabase Realtime
  subscriptions, timer logic, and state management. Zero test coverage.
- [ ] **Add tests for `useRoom` hook** — manages room state, polling fallback, and Realtime
  channel cleanup. Zero test coverage.
- [x] **Add tests for multiplayer components** — `HostControls.tsx`, `PlayerList.tsx`,
  `Scoreboard.tsx` now have test files. *(commit 57ad683)*
- [x] **Add tests for UI components** — `AnswerFeedback.tsx`, `ScorePopup.tsx`,
  `PixelTimer.tsx`, `PageTransition.tsx` now have test files. *(commit 57ad683)*
- [ ] **Add tests for stats components** — `StatsOverview.tsx`, `StatsChart.tsx` have no test files.
- [ ] **Expand E2E coverage** — current Playwright specs cover home, game-flow, and
  leaderboard. Missing: actual gameplay (answering questions, timer, scoring), custom/advanced
  generation flow, multiplayer (create, join, lobby, play), and stats page.
- [x] **Raise coverage thresholds** — raised to branches: 75%, functions: 85%, lines: 85%,
  statements: 83%. *(commit 57ad683)*

### P3 — Accessibility

- [x] **Fix heading hierarchy** — changed `<h3>` to `<h2>` in leaderboard, achievements, and
  quick pages. Added `sr-only` `<h1>` to play page playing state. *(commit 1b13826)*
- [x] **Increase minimum font sizes** — replaced all `text-[10px]` (57 occurrences) and
  `text-[8px]` with `text-xs` (12px) across 20 files. *(commit 1b13826)*
- [x] **Add focus styles to filter/tab buttons** — added `focus:outline-none focus:ring-2
  focus:ring-cyan-400` to all filter/tab/action buttons in leaderboard, achievements, stats,
  and GameHistoryList. *(commit 1b13826)*
- [x] **Add `aria-label` to icon-only buttons** — leaderboard sort buttons now have
  `aria-label` matching their function. *(commit 1b13826)*
- [ ] **Add `role="tab"` / `role="tabpanel"`** to tab UIs in leaderboard and
  achievements pages. (stats/page.tsx already correct.)

### P4 — Performance

- [x] **Replace `<img>` with `next/image`** — replaced in `play/page.tsx` and
  `GameQuestion.tsx`. Configured `next.config.js` with `remotePatterns` for external images.
  *(commit 0212161)*
- [x] **Add `React.memo` to list-item components** — wrapped `RankBadge`, `LeaderboardRow`,
  `AchievementCard`, `Stat`, and `HistoryRow` with `memo()`. *(commit 0212161)*
- [x] **Memoize expensive derived values** — added `useMemo` to `summary` in play/page.tsx,
  `grade` in ResultsScreen.tsx, `getPersonalRecords()` in LeaderboardPage. *(commit 0212161)*
- [ ] **Extract repeated Tailwind class strings** — long identical `className` strings appear
  2-3 times in custom, play, create, leaderboard, and achievements pages. Extract into shared
  constants or `@apply` utilities.

### P5 — Dependencies

- [x] **Align `@next/bundle-analyzer` version** — changed `^16.1.6` to `^14.2.30`. *(commit 3df687e)*
- [x] **Align `eslint-config-next` version** — changed `14.0.0` to `^14.2.30`. *(commit 3df687e)*
- [x] **Verify `ts-jest` compatibility** — `ts-jest@29.4.6` confirmed compatible with
  `jest@30.2.0` (all 1906 tests pass). *(commit 3df687e)*
- [ ] **Evaluate `pdf-parse` replacement** — last published 2019, unmaintained. Consider
  `pdf-parse-new` or `pdfjs-dist`.
- [ ] **Plan Next.js 15 upgrade** — Next.js 15 is available. Evaluate breaking changes and plan
  migration when stable.

### P6 — Future Features

- [ ] Move leaderboard/achievements from localStorage to Supabase for cross-device persistence
- [ ] Add user authentication (Supabase Auth) with game history and achievements per user
- [ ] Add user profiles with avatar customization
- [ ] Global leaderboards (server-side)
- [ ] Challenge-a-friend mode
- [ ] Add a `PixelSelect` dropdown component to the UI design system

---

*See CHANGELOG.md for completed work history.*
