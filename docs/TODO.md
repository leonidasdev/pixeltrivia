# PixelTrivia - TODO

> **Last Updated:** June 2025
> **Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase, OpenRouter AI

---

## Current Status

| Metric | Value |
|--------|-------|
| Test Suites | 114 |
| Tests | 1,990 |
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
- [ ] **Fix CI build env vars** — CI uses placeholder values for Supabase URL/keys. Build does not
  catch env-dependent compilation issues.

### Environment & Secrets

- [ ] **Update `.env.example`** — missing `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN`, `UPSTASH_REDIS_REST_URL` /
  `UPSTASH_REDIS_REST_TOKEN`, and `NEXT_PUBLIC_SITE_URL`.

---

## Code Tasks (Automatable)

Ordered by priority: critical bugs and architecture first, then quality improvements.

### P0 — Testing

- [ ] **Expand E2E coverage** — current Playwright specs cover home, game-flow, and
  leaderboard. Missing: actual gameplay (answering questions, timer, scoring), custom/advanced
  generation flow, multiplayer (create, join, lobby, play), and stats page.

### P1 — Dependencies

- [ ] **Plan Next.js 15 upgrade** — Next.js 15 is available. Evaluate breaking changes and plan
  migration when stable.

### P2 — Future Features

- [ ] Move leaderboard/achievements from localStorage to Supabase for cross-device persistence
- [ ] Add user authentication (Supabase Auth) with game history and achievements per user
- [ ] Add user profiles with avatar customization
- [ ] Global leaderboards (server-side)
- [ ] Challenge-a-friend mode
- [ ] Add a `PixelSelect` dropdown component to the UI design system

---

*See CHANGELOG.md for completed work history.*
