# PixelTrivia - TODO

> **Last Updated:** March 1, 2026
> **Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase, OpenRouter AI

---

## Current Status

| Metric | Value |
|--------|-------|
| Test Suites | 103 |
| Tests | 1,821 |
| Coverage (Statements) | 86.21% |
| Coverage (Branches) | 80.14% |
| Coverage (Functions) | 89.36% |
| Coverage (Lines) | 88.48% |
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

- [ ] **Refactor `play/page.tsx` (557 lines)** — extract `ResultsScreen`, `QuestionCard`,
  `AnswerOptions`, `ProgressHeader` into `app/components/game/` sub-components. This file is
  the hardest to maintain in the project.
- [ ] **Deduplicate question display** — solo `play/page.tsx` (L420-495) and multiplayer
  `GameQuestion.tsx` (L155-261) share nearly identical question card, answer options, image
  display, and difficulty badge code. Extract a shared `QuestionCard` component.
- [ ] **Extract `startGameSession()` utility** — quick, custom, and advanced pages all repeat
  the same 4-step pattern: call API, build session object, `localStorage.setItem(STORAGE_KEYS.CURRENT_GAME_SESSION, ...)`,
  `router.push('/game/play')`. Move to a shared helper in `lib/` or `hooks/`.
- [ ] **Use `withErrorHandling` wrapper in API routes** — `lib/apiResponse.ts` exports a
  `withErrorHandling()` wrapper but no API route uses it. Every route has its own try/catch
  with manual error formatting. Adopt the wrapper to reduce duplication.

### P1 — Code Quality

- [ ] **Adopt `GamePageLayout` consistently** — 7 game pages bypass it and reinvent layout
  structure (play, leaderboard, achievements, select, stats, mode, lobby). Extract a
  `ListPageLayout` variant for leaderboard/achievements (nearly identical layout code).
- [ ] **Extract multiplayer session helpers** — `saveMultiplayerSession()` and
  `loadMultiplayerSession()` to replace the 5+ scattered `localStorage.getItem/setItem` calls
  for `playerId`, `roomCode`, `isHost` across create, join, lobby, and play pages.
- [ ] **Move duplicated types to `types/`** — `app/api/quiz/custom/route.ts` declares
  `CustomQuizRequest`, `QuizQuestion`, and `OpenRouterResponse` locally instead of importing
  from `types/quiz.ts`.
- [ ] **Use Zod in API routes** — Zod is a dependency and `lib/validation.ts` defines schemas,
  but API routes still use manual `if` checks for validation. Wire up the existing Zod schemas.
- [ ] **Fix 9 `exhaustive-deps` ESLint suppressions** — potential stale closure bugs in
  `useMultiplayerGame.ts` (2), `play/page.tsx` (4), `play/[code]/page.tsx` (1),
  `lobby/[code]/page.tsx` (1), `leaderboard/page.tsx` (1). Refactor with refs or extract
  stable callbacks.
- [ ] **Fix `useGameState.submitAnswer` stale closure** — reads `gameState` directly (L143)
  before the functional updater, accessing a potentially stale closure. Use `useRef` for game
  state or restructure to read inside the updater.
- [ ] **Fix JSON parse error inconsistency** — `/api/quiz/quick` catches `SyntaxError` for bad
  JSON, but `/api/room/create` silently swallows parse failures with an empty `catch {}`.
  Standardize error handling.
- [ ] **Add `displayName` to `forwardRef` components** — `PixelButton` and `PixelInput` use
  `forwardRef` but don't set `displayName`, hurting React DevTools debugging.
- [ ] **Report to Sentry from `error.tsx`** — route error boundary logs via `logger.error` but
  doesn't call `Sentry.captureException(error)`. Route-level errors may be missed in Sentry.

### P2 — Testing

- [ ] **Add tests for `useMultiplayerGame` hook** — complex hook with Supabase Realtime
  subscriptions, timer logic, and state management. Zero test coverage.
- [ ] **Add tests for `useRoom` hook** — manages room state, polling fallback, and Realtime
  channel cleanup. Zero test coverage.
- [ ] **Add tests for multiplayer components** — `HostControls.tsx`, `PlayerList.tsx`,
  `Scoreboard.tsx` have no test files.
- [ ] **Add tests for UI components** — `AnswerFeedback.tsx`, `ScorePopup.tsx`,
  `PixelTimer.tsx`, `PageTransition.tsx` have no test files.
- [ ] **Add tests for stats components** — `StatsOverview.tsx`, `StatsChart.tsx` have no test files.
- [ ] **Expand E2E coverage** — current Playwright specs cover home, game-flow, and
  leaderboard. Missing: actual gameplay (answering questions, timer, scoring), custom/advanced
  generation flow, multiplayer (create, join, lobby, play), and stats page.
- [ ] **Raise coverage thresholds** — current thresholds (branches: 55%, functions: 64%, lines:
  61%) are well below actual coverage (~80-89%). Raise to prevent regressions:
  branches: 75%, functions: 85%, lines: 85%.

### P3 — Accessibility

- [ ] **Fix heading hierarchy** — leaderboard and achievements pages render `<h3>` before `<h1>`
  in DOM order. quick/page.tsx jumps from `<h1>` to `<h3>` skipping `<h2>`. play/page.tsx has
  two `<h1>` tags for different states.
- [ ] **Increase minimum font sizes** — `text-[10px]` (20+ occurrences) and `text-[8px]`
  (advanced/page.tsx) are below WCAG minimum guidelines. Use `text-xs` (12px) as the minimum.
- [ ] **Add focus styles to filter/tab buttons** — leaderboard period filters, achievement
  category filters, and stats tabs have no `focus:` ring classes.
- [ ] **Add `aria-label` to icon-only buttons** — stats page action buttons (L167-173) have
  only emoji/icon content with no accessible name.
- [ ] **Add `role="tab"` / `role="tabpanel"`** to tab UIs in stats, leaderboard, and
  achievements pages.

### P4 — Performance

- [ ] **Replace `<img>` with `next/image`** — two locations (`play/page.tsx` L451 and
  `GameQuestion.tsx` L185) use raw `<img>` tags with ESLint disable comments. `next/image`
  provides lazy loading, size optimization, and WebP/AVIF conversion.
- [ ] **Add `React.memo` to list-item components** — `LeaderboardRow`, `AchievementCard`,
  `Stat`, `RankBadge`, and `GameHistoryList` items are rendered in lists and would benefit from
  shallow-comparison memoization.
- [ ] **Memoize expensive derived values** — `play/page.tsx` computes `summary` and `grade`
  inside render without `useMemo`. `LeaderboardPage` calls `getPersonalRecords()` inside render
  without memoization.
- [ ] **Extract repeated Tailwind class strings** — long identical `className` strings appear
  2-3 times in custom, play, create, leaderboard, and achievements pages. Extract into shared
  constants or `@apply` utilities.

### P5 — Dependencies

- [ ] **Align `@next/bundle-analyzer` version** — currently `^16.1.6` but project uses
  Next.js 14. Should be `^14.x`.
- [ ] **Align `eslint-config-next` version** — pinned to `14.0.0`. Should be `^14.2` to match
  the Next.js runtime.
- [ ] **Verify `ts-jest` compatibility** — `ts-jest@^29.4.6` with `jest@^30.2.0`. Check if
  ts-jest 30.x is needed for full Jest 30 support.
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
