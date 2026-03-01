# Operational Runbook

> Last Updated: February 28, 2026

Quick-reference procedures for common operational tasks in PixelTrivia.

## Table of Contents

- [Local Development](#local-development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Database](#database)
- [Monitoring & Debugging](#monitoring--debugging)
- [Common Issues](#common-issues)

---

## Local Development

### Start the dev server

```bash
npm run dev
# → http://localhost:3000
```

### Run all quality checks before committing

```bash
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm test              # Jest (unit + integration)
npm run test:e2e      # Playwright (requires dev server running)
```

### Format code

```bash
npm run format        # Prettier — write
npm run format:check  # Prettier — check only (CI)
```

> **Note:** Husky pre-commit hooks run `eslint --fix` and `prettier --write` automatically on staged files.

---

## Testing

### Run unit & integration tests

```bash
npm test                       # All suites
npm test -- --watch            # Watch mode
npm test -- --coverage         # With coverage report
npm test -- path/to/file       # Single file
npm run test:ci                # CI mode (no watch, coverage, fail-fast)
```

### Run E2E tests

```bash
# Start the dev server first:
npm run dev

# In another terminal:
npm run test:e2e               # Headless
npm run test:e2e:headed        # With browser UI
npm run test:e2e:ui            # Interactive Playwright UI
npm run test:e2e:report        # View last HTML report
```

### Coverage thresholds

Current Jest coverage thresholds (from `jest.config.js`):

| Metric | Threshold |
|--------|----------|
| Statements | 55% |
| Branches | 55% |
| Functions | 55% |
| Lines | 55% |

---

## Deployment

### Environment variables

Required in the deployment platform (Vercel):

| Variable | Description | Where |
|----------|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard → Settings → API |
| `OPENROUTER_API_KEY` | OpenRouter AI API key | [openrouter.ai/keys](https://openrouter.ai/keys) |
| `SENTRY_DSN` | Sentry error tracking DSN | Sentry project settings |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source maps | Sentry → Settings → Auth Tokens |

### Deploy to Vercel

```bash
# First time: link the project
npx vercel link

# Deploy preview
npx vercel

# Deploy to production
npx vercel --prod
```

Or push to `main` branch — Vercel auto-deploys from GitHub.

### Verify a deployment

1. Check the Vercel deployment dashboard for build status
2. Visit the deployed URL and run through a quick game flow
3. Check Sentry for any new errors in the release
4. Verify API endpoints respond: `curl https://your-domain.com/api/game/questions?category=general&difficulty=easy&limit=1`

---

## Database

### Apply schema migrations

```bash
# Connect to Supabase SQL editor and run:
# database/schema.sql
```

### Generate TypeScript types from Supabase

```bash
npm run db:types
# → Outputs to types/supabase.ts
```

### Seed data

The seed data is embedded in `database/schema.sql` and includes 150+ questions across 40 categories.

---

## Monitoring & Debugging

### Check Sentry errors

1. Go to [sentry.io](https://sentry.io) → PixelTrivia project
2. Filter by environment (`production` or `preview`)
3. Check the Issues tab for new/unresolved errors

### Analyse bundle size

```bash
ANALYZE=true npm run build
# Opens bundle analyzer in browser
```

Or on Windows PowerShell:

```powershell
$env:ANALYZE="true"; npm run build
```

### Check production logs (Vercel)

```bash
npx vercel logs your-deployment-url
```

### Debug rate limiting

Rate limits are configured in `lib/rateLimit.ts`. In development, limits are relaxed. To test rate limiting locally:

```bash
# Hit an endpoint repeatedly:
for i in $(seq 1 20); do curl -s http://localhost:3000/api/quiz/quick -X POST -H "Content-Type: application/json" -d '{"category":"science"}' | jq .success; done
```

---

## Common Issues

### `TypeError: fetch failed` in tests

**Cause:** Global `fetch` not mocked in Jest environment.

**Fix:** Add to the test file:

```typescript
const mockFetch = jest.fn()
global.fetch = mockFetch
```

### `Module not found: @/lib/...`

**Cause:** TypeScript path aliases not resolving.

**Fix:** Ensure `tsconfig.json` has the correct `paths` mapping and `jest.config.js` has `moduleNameMapper`.

### Build fails with Supabase errors

**Cause:** Missing environment variables during build.

**Fix:** Ensure all `NEXT_PUBLIC_*` and server-side env vars are set in the build environment. For CI, see `.github/workflows/ci.yml` for placeholder values.

### `RateLimitError` in development

**Cause:** Hitting the rate limiter during rapid testing.

**Fix:** Rate limits are per-IP. Restart the dev server or wait for the window to expire. In `lib/rateLimit.ts`, development limits are already higher than production.

### Husky hooks not running

**Cause:** Husky not installed after `npm install`.

**Fix:**

```bash
npx husky install
```

### E2E tests timing out

**Cause:** Dev server not running, or slow start.

**Fix:**

```bash
# Ensure dev server is running on port 3000:
npm run dev

# Increase Playwright timeout if needed in playwright.config.ts
```

---

## References

- [docs/development-guide.md](development-guide.md) — Full development setup
- [docs/deployment-guide.md](deployment-guide.md) — Detailed deployment instructions
- [docs/api-reference.md](api-reference.md) — API endpoint documentation
- [docs/testing-guide.md](testing-guide.md) — Testing strategy and patterns
- [docs/architecture.md](architecture.md) — System architecture overview
