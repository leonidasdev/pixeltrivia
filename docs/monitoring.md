# Monitoring & Alerting Guide

> How to monitor PixelTrivia in production and configure Sentry alerting rules.

---

## Table of Contents

1. [Overview](#overview)
2. [Sentry Setup Recap](#sentry-setup-recap)
3. [Alert Rules](#alert-rules)
4. [Performance Monitoring](#performance-monitoring)
5. [Key Transactions](#key-transactions)
6. [Dashboard Widgets](#dashboard-widgets)
7. [Incident Response](#incident-response)
8. [Maintenance](#maintenance)

---

## Overview

PixelTrivia uses **Sentry** for error tracking, performance monitoring, and alerting. The integration is configured across three files:

| File | Scope |
|------|-------|
| `sentry.client.config.ts` | Browser-side errors & web vitals |
| `sentry.server.config.ts` | Server-side errors & API traces |
| `sentry.edge.config.ts` | Edge middleware errors |

Source map uploads are handled automatically during CI builds via the `@sentry/nextjs` Webpack plugin when `SENTRY_AUTH_TOKEN` is set.

---

## Sentry Setup Recap

### Environment Variables

```env
SENTRY_DSN=https://xxx@oXXX.ingest.sentry.io/XXX
SENTRY_AUTH_TOKEN=sntrys_xxx      # CI only — for source map uploads
SENTRY_ORG=your-org
SENTRY_PROJECT=pixeltrivia
```

### Release Tracking

Releases are created automatically in CI:

```yaml
# .github/workflows/ci.yml excerpt
- name: Create Sentry Release
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
  run: |
    npx @sentry/cli releases new ${{ github.sha }}
    npx @sentry/cli releases set-commits ${{ github.sha }} --auto
    npx @sentry/cli releases finalize ${{ github.sha }}
```

---

## Alert Rules

Configure these in **Sentry → Alerts → Create Alert Rule**.

### 1. High Error Volume

| Setting | Value |
|---------|-------|
| **Type** | Issue Alert |
| **When** | Number of events ≥ 25 in 1 hour |
| **Filter** | `level:error` |
| **Action** | Email + Slack (if configured) |
| **Priority** | High |

### 2. New Unhandled Error

| Setting | Value |
|---------|-------|
| **Type** | Issue Alert |
| **When** | A new issue is created |
| **Filter** | `handled:no` |
| **Action** | Email immediately |
| **Priority** | Critical |

### 3. API Latency Spike

| Setting | Value |
|---------|-------|
| **Type** | Metric Alert |
| **Metric** | `transaction.duration` |
| **When** | p95 latency ≥ 3 000 ms for 5 minutes |
| **Filter** | `transaction:/api/*` |
| **Action** | Email |
| **Priority** | Medium |

### 4. Web Vitals Regression

| Setting | Value |
|---------|-------|
| **Type** | Metric Alert |
| **Metric** | `measurements.lcp` |
| **When** | p75 ≥ 4 000 ms for 15 minutes |
| **Action** | Email |
| **Priority** | Medium |

### 5. Rate-Limit Abuse Detection

| Setting | Value |
|---------|-------|
| **Type** | Issue Alert |
| **When** | Number of events ≥ 50 in 10 minutes |
| **Filter** | `message:Rate limit*` |
| **Action** | Slack |
| **Priority** | Low |

---

## Performance Monitoring

### Trace Sample Rates

Currently configured in `sentry.client.config.ts`:

```ts
tracesSampleRate: 0.1,          // 10 % of transactions
replaysSessionSampleRate: 0.01, // 1 % session replays
replaysOnErrorSampleRate: 1.0,  // 100 % replays on error
```

**Adjust based on traffic:**

| Monthly Page Views | `tracesSampleRate` | `replaysSessionSampleRate` |
|-------------------:|-------------------:|---------------------------:|
| < 10 k             | 1.0                | 0.1                        |
| 10 k – 100 k       | 0.2                | 0.05                       |
| 100 k – 1 M        | 0.1                | 0.01                       |
| > 1 M              | 0.05               | 0.005                      |

---

## Key Transactions

Monitor these transactions for performance regressions:

| Transaction | Expected p95 | Description |
|-------------|-------------|-------------|
| `POST /api/quiz/quick` | < 500 ms | Supabase question fetch |
| `POST /api/quiz/custom` | < 5 000 ms | AI question generation |
| `POST /api/quiz/advanced` | < 10 000 ms | Document parse + AI gen |
| `POST /api/room/create` | < 800 ms | Room creation |
| `POST /api/game/questions` | < 500 ms | Game question fetch |
| `GET /api/ai/generate-questions` | < 8 000 ms | OpenRouter AI call |
| `pageload /` | < 2 000 ms | Home page LCP |
| `pageload /game/play/*` | < 2 500 ms | Game screen hydration |

---

## Dashboard Widgets

Create a Sentry dashboard with these widgets:

### Error Overview (Number)
```
query: is:unresolved
display: big_number
```

### Errors by Release (Line Chart)
```
query: !event.type:transaction
y-axis: count()
group-by: release
```

### API Latency by Route (Line Chart)
```
query: transaction:/api/*
y-axis: p95(transaction.duration)
group-by: transaction
```

### Web Vitals Summary (Table)
```
query: event.type:transaction has:measurements.lcp
columns: transaction, p75(measurements.lcp), p75(measurements.fid), p75(measurements.cls)
```

### Error Rate Over Time (Area Chart)
```
query: level:error OR level:fatal
y-axis: count()
interval: 1h
```

---

## Incident Response

### Severity Levels

| Level | Criteria | Response Time |
|-------|----------|---------------|
| **P0 – Critical** | Site down, data loss, security breach | 15 min |
| **P1 – High** | Core feature broken (quiz, multiplayer) | 1 hour |
| **P2 – Medium** | Non-core feature broken, perf degradation | 4 hours |
| **P3 – Low** | Cosmetic, minor UX issue | Next sprint |

### Response Steps

1. **Acknowledge** — Assign the alert in Sentry
2. **Diagnose** — Check stack trace, breadcrumbs, replay (if available)
3. **Communicate** — Update status page / team channel
4. **Fix** — Deploy hotfix or revert to last good release
5. **Verify** — Confirm error rate returns to baseline
6. **Postmortem** — Document root cause and preventive action for P0/P1

### Rollback Procedure

```bash
# Revert to previous release on Vercel
vercel rollback

# Or redeploy a specific commit
git revert HEAD
git push origin main
```

---

## Maintenance

### Weekly Checks

- [ ] Review unresolved issues in Sentry (triage or resolve)
- [ ] Check p95 latency trend for API routes
- [ ] Review web vitals dashboard for LCP / CLS regressions
- [ ] Confirm Sentry event quota is within budget

### Monthly Checks

- [ ] Audit alert rules — are thresholds still appropriate?
- [ ] Update sample rates if traffic patterns changed
- [ ] Clean up resolved issues older than 30 days
- [ ] Review session replay storage usage

### Quota Management

Sentry has event quotas per plan. To stay within budget:

1. **Use `beforeSend`** to filter noisy events (e.g. `ResizeObserver loop` errors)
2. **Set `ignoreErrors`** for known third-party issues
3. **Tune `tracesSampleRate`** based on traffic (see table above)
4. **Enable spike protection** in Sentry → Settings → Subscription
